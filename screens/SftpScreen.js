// screens/SftpScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import sftpManager from '../SftpManager';
import { STORAGE_KEYS, SFTP_CONFIG } from '../config'; // Import centralized config



const SftpScreen = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [connected, setConnected] = useState(false);
  const [pathHistory, setPathHistory] = useState([]);
  const [username, setUsername] = useState('pi'); // Default username
  
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    deviceIp, 
    deviceName, 
    sftpUsername, 
    sftpPassword, 
    sftpPort 
  } = route.params || {};
  
  useEffect(() => {
    // Set up the navigation header
    navigation.setOptions({
      headerTitle: deviceName || 'SFTP Connection',
      headerTitleAlign: 'center',
    });
    
    // Connect to SFTP when the screen loads
    if (deviceIp) {
      connectToSftp();
    } else {
      setLoading(false);
      Alert.alert('Error', 'No device IP provided');
      navigation.goBack();
    }
    
    // Handle back button
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    
    return () => {
      backHandler.remove();
      // Disconnect SFTP when leaving this screen
      sftpManager.disconnect();
    };
  }, [deviceIp]);
  
  // Connect to SFTP using parameters instead of config
  const connectToSftp = async () => {
    try {
      setLoading(true);
      console.log(`Connecting to SFTP at ${deviceIp}...`);
      
      // Use parameters passed from DevicesScreen
      // If not provided, fall back to defaults
      const username = sftpUsername || 'pi';
      const password = sftpPassword || 'Cognizanceofcontemplation09!!';
      const port = sftpPort || 3003;
      
      // Save the username for later use
      setUsername(username);
      
      const connected = await sftpManager.connect(deviceIp, username, password, port);
      
      if (connected) {
        setConnected(true);
        
        // Set home directory path based on username
        const homePath = `/home/${username}`;
        setCurrentPath(homePath);
        
        // Load the home directory
        await loadDirectory(homePath);
      } else {
        throw new Error('Failed to connect to SFTP server');
      }
    } catch (error) {
      setLoading(false);
      console.error('SFTP connection error:', error);
      Alert.alert(
        'Connection Error', 
        `Failed to connect to SFTP server: ${error.message || 'Unknown error'}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };


  // In DevicesScreen.js
// Add this function to the component to allow updating device IP address

// Add this function to DevicesScreen component
const updateDeviceIP = (device, newIP) => {
  Alert.alert(
    'Update IP Address',
    `Current IP: ${device.ipAddress}\n\nDo you want to update the IP address for this device?`,
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Update',
        onPress: () => {
          // Show prompt for new IP
          Alert.prompt(
            'Enter New IP Address',
            'Please enter the correct IP address for this device:',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Save',
                onPress: (newIPAddress) => {
                  if (newIPAddress && newIPAddress.trim() !== '') {
                    // Update the device in state and storage
                    const updatedDevices = connectedDevices.map(d => {
                      if (d.id === device.id) {
                        return {
                          ...d,
                          ipAddress: newIPAddress.trim()
                        };
                      }
                      return d;
                    });
                    
                    setConnectedDevices(updatedDevices);
                    saveConnectedDevices(updatedDevices);
                    
                    Alert.alert('Success', 'Device IP address updated successfully.');
                  }
                }
              }
            ],
            'plain-text',
            device.ipAddress
          );
        }
      }
    ]
  );
};

// Then add a button to the renderConnectedDevice function:
const renderConnectedDevice = ({ item }) => (
  <View style={styles.deviceItem}>
    <View style={styles.deviceInfo}>
      <Text style={styles.deviceName}>{item.name}</Text>
      <TouchableOpacity onPress={() => updateDeviceIP(item)}>
        <Text style={styles.deviceDetails}>
          IP: {item.ipAddress} <Text style={styles.editText}>(Edit)</Text>
        </Text>
      </TouchableOpacity>
      <Text style={styles.deviceDetails}>
        Last connected: {new Date(item.lastConnected).toLocaleString()}
      </Text>
    </View>
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.connectButton]}
        onPress={() => connectToDevice(item)}
      >
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, styles.resetButton]}
        onPress={() => resetDevice(item.id)}
      >
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  </View>
);


// For example, implement the file download functionality:
const handleFileDownload = async (file) => {
  try {
    setLoading(true);
    
    // Get download path (would need to be implemented based on your requirements)
    const downloadPath = getLocalDownloadPath(file.name);
    
    // Perform actual download
    const success = await sftpManager.downloadFile(
      `${currentPath}/${file.name}`,
      downloadPath
    );
    
    setLoading(false);
    
    if (success) {
      Alert.alert('Success', `File downloaded to ${downloadPath}`);
    } else {
      Alert.alert('Error', 'Download failed');
    }
  } catch (error) {
    setLoading(false);
    console.error('Download error:', error);
    Alert.alert('Error', `Download failed: ${error.message}`);
  }
};


  // Load directory contents
  const loadDirectory = async (path) => {
    try {
      setLoading(true);
      console.log(`Loading directory: ${path}`);
      
      const files = await sftpManager.listDirectory(path);
      
      // Sort directories first, then files alphabetically
      const sortedFiles = files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setFiles(sortedFiles);
      setCurrentPath(path);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(`Error loading directory ${path}:`, error);
      Alert.alert('Error', `Failed to load directory: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Navigate to a directory or handle file tap
  const navigateTo = (file) => {
    if (file.isDirectory) {
      // Add current path to history for back navigation
      setPathHistory([...pathHistory, currentPath]);
      
      // Calculate new path
      const newPath = `${currentPath === '/' ? '' : currentPath}/${file.name}`.replace(/\/+/g, '/');
      loadDirectory(newPath);
    } else {
      // Handle file tap - show options
      Alert.alert(
        file.name,
        `Size: ${formatFileSize(file.size)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: () => {
              Alert.alert('Download', 'Download functionality would be implemented here.');
              // In a real implementation, you would call sftpManager.downloadFile()
            }
          }
        ]
      );
    }
  };
  
  // Handle refresh - reload current directory
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDirectory(currentPath);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Go back to previous directory
  const handleBackPress = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      loadDirectory(previousPath);
      return true;
    }
    return false;
  };
  
  // Navigate to home directory
  const goToHome = () => {
    const homePath = `/home/${username}`;
    
    // Only add to history if we're not already at home
    if (currentPath !== homePath) {
      setPathHistory([...pathHistory, currentPath]);
      loadDirectory(homePath);
    }
  };
  
  // Render a file or directory item
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.fileItem} 
      onPress={() => navigateTo(item)}
    >
      <Icon 
        name={item.isDirectory ? 'folder' : getFileIcon(item.name)} 
        size={24} 
        color={item.isDirectory ? '#FFC107' : '#2196F3'} 
        style={styles.fileIcon}
      />
      <View style={styles.fileDetails}>
        <Text style={styles.fileName}>{item.name}</Text>
        <Text style={styles.fileInfo}>
          {item.isDirectory 
            ? 'Directory' 
            : `${formatFileSize(item.size)} • ${formatDate(item.lastModified)}`}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );
  
  // Get an appropriate icon for the file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf': return 'file-pdf-box';
      case 'doc':
      case 'docx': return 'file-word-box';
      case 'xls':
      case 'xlsx': return 'file-excel-box';
      case 'ppt':
      case 'pptx': return 'file-powerpoint-box';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'file-image-box';
      case 'txt': return 'file-document-box';
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz': return 'file-zip-box';
      default: return 'file-outline';
    }
  };
  
  // Format file size for display (e.g., KB, MB, GB)
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Path navigation bar */}
      <View style={styles.pathBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pathScroll}
        >
          <TouchableOpacity 
            style={styles.homeButton}
            onPress={goToHome}
          >
            <Icon name="home" size={16} color="#2196F3" />
          </TouchableOpacity>
          
          <ScrollablePathBar 
            path={currentPath} 
            username={username}
            onPathPartPress={(path) => {
              setPathHistory([...pathHistory, currentPath]);
              loadDirectory(path);
            }} 
          />
        </ScrollView>
      </View>
      
      {/* Connected status indicator */}
      <View style={styles.statusBar}>
        <Icon name="server-network" size={16} color={connected ? "#4CAF50" : "#F44336"} />
        <Text style={styles.statusText}>
          {connected ? `Connected to ${deviceIp}` : 'Not connected'}
        </Text>
      </View>
      
      {/* File/directory listing */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={renderItem}
          keyExtractor={(item) => `${currentPath}/${item.name}`}
          contentContainerStyle={styles.fileList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="folder-open" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No files found in this directory</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2196F3']}
            />
          }
        />
      )}
      
      {/* Back button for navigation */}
      {pathHistory.length > 0 && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Icon name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// Component to display the current path with clickable parts
const ScrollablePathBar = ({ path, username, onPathPartPress }) => {
  // Split the path into parts
  const parts = path.split('/').filter(part => part !== '');
  
  // Generate paths for each part
  const pathParts = parts.map((part, index) => {
    const currentPath = '/' + parts.slice(0, index + 1).join('/');
    return { name: part, path: currentPath };
  });
  
  // Highlight the username part specially
  const renderPathPart = (part, index) => {
    const isUsername = part.name === username && index === 1 && parts[0] === 'home';
    
    return (
      <TouchableOpacity 
        key={part.path}
        style={[styles.pathPart, isUsername && styles.usernamePart]}
        onPress={() => onPathPartPress(part.path)}
      >
        <Text style={[styles.pathPartText, isUsername && styles.usernameText]}>
          {part.name}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.scrollablePathBar}>
      {pathParts.map((part, index) => (
        <React.Fragment key={part.path}>
          {index > 0 && <Text style={styles.pathSeparator}>/</Text>}
          {renderPathPart(part, index)}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  pathBar: {
    backgroundColor: '#E9ECEF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  pathScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollablePathBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  homeButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  pathPart: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: '#F8F9FA',
  },
  usernamePart: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  pathPartText: {
    fontSize: 14,
    color: '#2196F3',
  },
  usernameText: {
    fontWeight: 'bold',
  },
  pathSeparator: {
    fontSize: 14,
    color: '#6C757D',
    marginHorizontal: 2,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  statusText: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6C757D',
  },
  fileList: {
    padding: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#212529',
  },
  fileInfo: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
   editText: {
   color: '#2196F3',
   fontSize: 12,
 },

});

export default SftpScreen;