// App.tsx - Part 1 
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  View,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Share,
  Clipboard,
  RefreshControl,
  Platform,
} from 'react-native';
import { SERVER_CONFIG, SFTP_CONFIG } from './config'; 
import DocumentPicker from 'react-native-document-picker';
import { debounce } from 'lodash';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import { Linking } from 'react-native';
import { 
  SortingHeader, 
  sortFiles, 
  type SortCriteria, 
  type SortOrder 
} from './sortingUtils';

const BASE_URL = SERVER_CONFIG.baseUrl; // Use the centralized config
const { width, height } = Dimensions.get('window');

const textFileTypes = [
  'txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 
  'html', 'css', 'xml', 'yaml', 'yml', 'ini', 'conf',
  'sh', 'bash', 'log', 'env', 'config'
];

const { width, height } = Dimensions.get('window');

// Add these to your state declarations at the top


interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size?: string;
  modified?: string;
  path?: string;
}

const App = () => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFileContent, setShowFileContent] = useState(false);
const [fileContent, setFileContent] = useState('');
const [showImageViewer, setShowImageViewer] = useState(false);
const [imageUrl, setImageUrl] = useState('');
const [isFileOpen, setIsFileOpen] = useState(false);
const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
//const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
//const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
const [lastTap, setLastTap] = useState(0);
const [offlineFiles, setOfflineFiles] = useState<{[key: string]: FileItem[]}>({});
const [isUploading, setIsUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
const [sortBy, setSortBy] = useState<SortCriteria>('name');
const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
// Add these to your state declarations
const [showRenameModal, setShowRenameModal] = useState(false);
const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    filterFiles();
  }, [sortBy, sortOrder]);

const filterFiles = useCallback(
  debounce(() => {
    let filtered = files;
    
    if (searchQuery.trim()) {
      filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting to filtered files
    const sortedAndFiltered = sortFiles(filtered, sortBy, sortOrder);
    setFilteredFiles(sortedAndFiltered);
  }, 300),
  [searchQuery, files, sortBy, sortOrder] // Make sure sortBy and sortOrder are in the dependencies
);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDirectoryContents(currentPath);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    setRefreshing(false);
  }, [currentPath]);

  // File operations and directory navigation functions
const fetchDirectoryContents = async (path: string) => {
  try {
    setLoading(true);
    const response = await fetch(`${BASE_URL}/ls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        port: parseInt(port),
        username,
        password,
        path
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch directory contents');
    }

    const data = await response.json();
    const filesList = path !== `/srv/dev-disk-by-uuid-19d8f6c6-4438-47dc-a6ba-730d2d31cc6c/${username}`
      ? [{ name: '..', type: 'directory' }, ...data]
      : data;
    
    // Apply initial sorting to the files
    const sortedFiles = sortFiles(filesList, sortBy, sortOrder);
    setFiles(sortedFiles);
    setFilteredFiles(sortedFiles);
    setCurrentPath(path);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};



const handleUploadPress = async () => {
  try {
    // Request permissions on Android
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Storage permission denied');
      }
    }

    // Open document picker
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
      allowMultiSelection: false,
    });

    const file = result[0];
    const fileContent = await RNFS.readFile(file.uri, 'base64');
    
    Alert.alert('Uploading', 'File upload started...');

    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        port: parseInt(port),
        username,
        password,
        path: `${currentPath}/${file.name}`,
        content: fileContent
      })
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    await fetchDirectoryContents(currentPath);
    Alert.alert('Success', 'File uploaded successfully');
  } catch (error: any) {
    if (DocumentPicker.isCancel(error)) {
      // User cancelled the picker
      return;
    }
    console.error('Upload error:', error);
    Alert.alert('Error', `Failed to upload: ${error.message}`);
  }
};


const handleDownload = async (file: FileItem) => {
  try {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    const isMedia = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'heic'].includes(fileType || '');
    
    const params = new URLSearchParams({
      path: `${currentPath}/${file.name}`,
      host,
      port,
      username,
      password
    });
    const downloadUrl = `${BASE_URL}/download?${params.toString()}`;

    // Define paths
    const documentsPath = RNFS.DocumentDirectoryPath;
    const downloadsPath = `${documentsPath}/Downloads`;

    // Ensure Downloads directory exists
    try {
      const exists = await RNFS.exists(downloadsPath);
      if (!exists) {
        await RNFS.mkdir(downloadsPath);
        console.log('Created Downloads directory at:', downloadsPath);
      }
    } catch (dirError) {
      console.error('Error creating directory:', dirError);
    }

    const localPath = `${downloadsPath}/${file.name}`;
    console.log('Downloading to:', localPath);

    Alert.alert('Downloading', 'File download started...');

    const downloadOptions = {
      fromUrl: downloadUrl,
      toFile: localPath,
      background: true,
      begin: (res) => {
        console.log('Download started:', res);
      },
      progress: (res) => {
        const progress = ((res.bytesWritten / res.contentLength) * 100).toFixed(2);
        console.log(`Download progress: ${progress}%`);
      }
    };

    const response = await RNFS.downloadFile(downloadOptions).promise;
    console.log('Download response:', response);

    if (response.statusCode === 200) {
      if (isMedia) {
        await CameraRoll.save(localPath, {
          type: 'auto',
          album: 'Downloads'
        });
        // Don't delete the original file
        Alert.alert('Success', 'Media saved to Photos and Files app');
      } else {
        Alert.alert(
          'Success', 
          'File downloaded successfully!\n\nYou can find it in:\nFiles app > On My iPhone > Your App Name > Downloads',
          [
            {
              text: 'OK',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  // On iOS, you might want to open the Files app
                  Linking.openURL('shareddocuments://');
                }
              }
            }
          ]
        );
      }
    } else {
      throw new Error('Download failed');
    }
  } catch (error: any) {
    console.error('Download error:', error);
    Alert.alert('Error', `Failed to download: ${error.message}`);
  }
};





const connectToServer = async () => {
  try {
    setStatus(`Attempting to connect to ${host}...`);
    const initialPath = `/srv/dev-disk-by-uuid-19d8f6c6-4438-47dc-a6ba-730d2d31cc6c/${username}`;
    
    console.log('Making connection request to:', `${BASE_URL}/connect`);
    const response = await fetch(`${BASE_URL}/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        port: parseInt(port),
        username,
        password
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Connection failed');
    }

    setIsConnected(true);
    setStatus(`Connected to ${host}\nUser: ${username}\nPath: ${initialPath}`);
    await fetchDirectoryContents(initialPath);
    
  } catch (error: any) {
    console.error('Connection error details:', error);
    setStatus(`Error: ${error.message}`);
    Alert.alert('Connection Error', error.message);
    setIsConnected(false);
  }
};

  const disconnect = () => {
    setIsConnected(false);
    setStatus('Disconnected');
    setFiles([]);
    setCurrentPath('');
    setSelectedFile(null);
    setSearchQuery('');
  };

  const navigateToDirectory = async (dirName: string) => {
    if (dirName === '..') {
      const parentPath = currentPath.split('/').slice(0, -1).join('/');
      if (parentPath.startsWith(`/srv/dev-disk-by-uuid-19d8f6c6-4438-47dc-a6ba-730d2d31cc6c`)) {
        await fetchDirectoryContents(parentPath);
      }
      return;
    }

    const newPath = `${currentPath}/${dirName}`.replace(/\/+/g, '/');
    await fetchDirectoryContents(newPath);
  };

  // File operation handlers
  const handleFileAction = (file: FileItem) => {
    setSelectedFile(file);
    setShowActionModal(true);
  };

  const handleCopyTo = async (file: FileItem) => {
    Alert.alert('Copy', `Select destination for ${file.name}`);
    // Implement copy logic
  };

  const handleMoveTo = async (file: FileItem) => {
    Alert.alert('Move', `Select destination for ${file.name}`);
    // Implement move logic
  };



  const handleDuplicate = async (file: FileItem) => {
    try {
      // Implement duplication logic
      Alert.alert('Success', `${file.name} duplicated`);
      await fetchDirectoryContents(currentPath);
    } catch (error: any) {
      Alert.alert('Error', `Failed to duplicate file: ${error.message}`);
    }
  };

  const handleEdit = async (file: FileItem) => {
    if (file.type === 'file') {
      Alert.alert('Edit', `Opening ${file.name} for editing`);
      // Implement edit logic
    }
  };

  const handleShare = async (file: FileItem) => {
    try {
      await Share.share({
        title: file.name,
        message: `${currentPath}/${file.name}`,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share file');
    }
  };

  const handleCopyPath = (file: FileItem) => {
    const fullPath = `${currentPath}/${file.name}`;
    Clipboard.setString(fullPath);
    Alert.alert('Success', 'Path copied to clipboard');
  };

  const handleFileInfo = (file: FileItem) => {
    Alert.alert(
      'File Information',
      `Name: ${file.name}\nType: ${file.type}\nSize: ${file.size || 'N/A'}\nModified: ${file.modified || 'N/A'}\nPath: ${currentPath}/${file.name}`
    );
  };

  const handleDelete = async (file: FileItem) => {
  Alert.alert(
    'Delete File',
    `Are you sure you want to delete ${file.name}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const fullPath = `${currentPath}/${file.name}`.replace(/\/+/g, '/');
            
            console.log('Deleting:', {
              path: fullPath,
              type: file.type
            });

            const response = await fetch(`${BASE_URL}/delete`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                host,
                port: parseInt(port),
                username,
                password,
                path: fullPath,
                type: file.type
              })
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'Failed to delete');
            }

            await fetchDirectoryContents(currentPath);
            Alert.alert('Success', `${file.name} deleted successfully`);
          } catch (error: any) {
            console.error('Delete error:', error);
            Alert.alert('Error', `Failed to delete: ${error.message}`);
          }
        }
      }
    ]
  );
};





const handleRename = async (file: FileItem) => {
  setSelectedFile(file);
  setNewFileName(file.name);
  setShowRenameModal(true);
};

const confirmRename = async () => {
  if (!selectedFile || !newFileName) return;
  
  try {
    const oldPath = `${currentPath}/${selectedFile.name}`;
    const newPath = `${currentPath}/${newFileName}`;
    
    const response = await fetch(`${BASE_URL}/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        port: parseInt(port),
        username,
        password,
        oldPath,
        newPath
      })
    });

    if (!response.ok) {
      throw new Error('Failed to rename file');
    }

    await fetchDirectoryContents(currentPath);
    setShowRenameModal(false);
    Alert.alert('Success', `Renamed to "${newFileName}"`);
  } catch (error: any) {
    Alert.alert('Error', `Failed to rename: ${error.message}`);
  }
};



const RenameModal = () => (
  <Modal
    visible={showRenameModal}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowRenameModal(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Rename {selectedFile?.name}</Text>
        <TextInput
          style={styles.renameInput}
          value={newFileName}
          onChangeText={setNewFileName}
          autoFocus={true}
          selectTextOnFocus={true}
        />
        <View style={styles.renameButtons}>
          <TouchableOpacity 
            style={[styles.renameButton, styles.cancelButton]}
            onPress={() => setShowRenameModal(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.renameButton, styles.confirmButton]}
            onPress={confirmRename}
          >
            <Text style={styles.buttonText}>Rename</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);






const ImageViewerModal = () => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Build the query string properly
  const params = new URLSearchParams({
    path: imageUrl,
    host: host,
    port: port,
    username: username,
    password: password
  });

  const imageUri = `${BASE_URL}/file?${params.toString()}`;
  console.log('Loading image from:', imageUri);

  return (
    <Modal
      visible={showImageViewer}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowImageViewer(false)}
    >
      <View style={styles.imageViewerContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setShowImageViewer(false)}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
        <View style={styles.imageContainer}>
          {imageLoading && (
            <ActivityIndicator size="large" color="#fff" />
          )}
          <Image
            source={{ 
              uri: imageUri,
              headers: {
                Accept: 'image/jpeg,image/png,image/*;q=0.8'
              }
            }}
            style={[
              styles.fullImage,
              { display: imageError ? 'none' : 'flex' }
            ]}
            resizeMode="contain"
            onLoadStart={() => {
              console.log('Image load started');
              setImageLoading(true);
              setImageError(false);
            }}
            onLoadEnd={() => {
              console.log('Image load ended');
              setImageLoading(false);
            }}
            onError={(error) => {
              console.error('Image error:', JSON.stringify(error.nativeEvent, null, 2));
              setImageError(true);
              setImageLoading(false);
            }}
          />
          {imageError && !imageLoading && (
            <Text style={styles.errorText}>Failed to load image</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};



const handleNewFilePress = () => {
  Alert.prompt(
    'Create New File',
    'Enter file name:',
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Create',
        onPress: async (fileName?: string) => {
          if (!fileName) return;
          
          try {
            console.log('Creating file with params:', {
              host,
              port,
              username,
              path: `${currentPath}/${fileName}`,
              type: 'file'
            });

            const response = await fetch(`${BASE_URL}/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                host,
                port: parseInt(port),
                username,
                password,
                path: `${currentPath}/${fileName}`,
                type: 'file',
                content: '' // Add empty content for new file
              })
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
              throw new Error(data.error || 'Failed to create file');
            }

            await fetchDirectoryContents(currentPath);
            Alert.alert('Success', `File "${fileName}" created successfully`);
          } catch (error: any) {
            console.error('Error creating file:', error);
            Alert.alert('Error', `Failed to create file: ${error.message}`);
          }
        }
      }
    ],
    'plain-text'
  );
};

const handleNewFolderPress = () => {
  Alert.prompt(
    'Create New Folder',
    'Enter folder name:',
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Create',
        onPress: async (folderName?: string) => {
          if (!folderName) return;
          
          try {
            console.log('Creating folder with params:', {
              host,
              port,
              username,
              path: `${currentPath}/${folderName}`,
              type: 'directory'
            });

            const response = await fetch(`${BASE_URL}/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                host,
                port: parseInt(port),
                username,
                password,
                path: `${currentPath}/${folderName}`,
                type: 'directory'
              })
            });

            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
              throw new Error(data.error || 'Failed to create folder');
            }

            await fetchDirectoryContents(currentPath);
            Alert.alert('Success', `Folder "${folderName}" created successfully`);
          } catch (error: any) {
            console.error('Error creating folder:', error);
            Alert.alert('Error', `Failed to create folder: ${error.message}`);
          }
        }
      }
    ],
    'plain-text'
  );
};



const handleFileOpen = async (file: FileItem) => {
  if (file.type === 'directory') {
    await navigateToDirectory(file.name);
    return;
  }

  try {
    console.log('===== Opening File =====');
    console.log('File:', file);
    console.log('Current path:', currentPath);
    
    const fileType = file.name.split('.').pop()?.toLowerCase();
    console.log('File type:', fileType);
    
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    
    if (imageTypes.includes(fileType || '')) {
      console.log('Handling as image file');
      const fullPath = `${currentPath}/${file.name}`.replace(/\/+/g, '/');
      console.log('Full path:', fullPath);
      setImageUrl(fullPath);
      setShowImageViewer(true);
    }
    // ... rest of the function
  else if (textFileTypes.includes(fileType || '')) {
      console.log('Handling text file:', file.name); // Debug log
      const response = await fetch(`${BASE_URL}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host,
          port: parseInt(port),
          username,
          password,
          path: `${currentPath}/${file.name}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to open file');
      }

      try {
        const content = await response.text();
        if (fileType === 'json') {
          try {
            const jsonObj = JSON.parse(content);
            setFileContent(JSON.stringify(jsonObj, null, 2));
          } catch {
            setFileContent(content);
          }
        } else {
          setFileContent(content);
        }
        setSelectedFile(file);
        setShowFileContent(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to read file content. The file might be corrupted or too large.');
      }
    } else {
      console.log('Unsupported file type:', fileType); // Debug log
      Alert.alert(
        'Unsupported File Type',
        'This file type cannot be opened directly. Available actions:',
        [
          {
            text: 'Share',
            onPress: () => handleShare(file)
          },
          {
            text: 'Copy Path',
            onPress: () => handleCopyPath(file)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  } catch (error: any) {
    console.error('Error opening file:', error); // Debug log
    Alert.alert('Error', `Failed to open file: ${error.message}`);
  } finally {
    setLoading(false);
  }
};




// Add this component for displaying file content
const FileContentModal = () => (
  <Modal
    visible={showFileContent}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowFileContent(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { height: height * 0.8 }]}>
        <View style={styles.fileContentHeader}>
          <Text style={styles.modalTitle}>{selectedFile?.name}</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFileContent(false)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.fileContentScroll}>
          <Text style={styles.fileContentText}>{fileContent}</Text>
        </ScrollView>
      </View>
    </View>
  </Modal>
);


const FloatingActionButton = () => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuPress = () => {
    Alert.alert(
      'Create New',
      'Select what you want to create',
      [
                {
          text: 'Upload File',
          onPress: () => handleUploadPress()
        },
        
        {
          text: 'New File',
          onPress: () => handleNewFilePress()
        },
        {
          text: 'New Folder',
          onPress: () => handleNewFolderPress()
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={styles.fab}
      onPress={handleMenuPress}
    >
      <Text style={styles.fabIcon}>⋮</Text>
    </TouchableOpacity>
  );
};



  // UI Components
  const FileActionModal = () => (
    <Modal
      visible={showActionModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowActionModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowActionModal(false)}
      >
        <View style={styles.modalContent}>
          <ScrollView>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                selectedFile && handleCopyTo(selectedFile);
              }}
            >
              <Text style={styles.actionButtonText}>Copy to...</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                selectedFile && handleMoveTo(selectedFile);
              }}
            >
              <Text style={styles.actionButtonText}>Move to...</Text>
            </TouchableOpacity>
            
            

            <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
            setShowActionModal(false);
            selectedFile && handleRename(selectedFile);
             }}
            >
            <Text style={styles.actionButtonText}>Rename</Text>
            </TouchableOpacity>


            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                selectedFile && handleDuplicate(selectedFile);
              }}
            >
              <Text style={styles.actionButtonText}>Duplicate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                selectedFile && handleEdit(selectedFile);
              }}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                selectedFile && handleShare(selectedFile);
              }}
            >
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                selectedFile && handleCopyPath(selectedFile);
              }}
            >
              <Text style={styles.actionButtonText}>Copy Path</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setShowActionModal(false);
                selectedFile && handleFileInfo(selectedFile);
              }}
            >
              <Text style={styles.actionButtonText}>File Info</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                setShowActionModal(false);
                selectedFile && handleDelete(selectedFile);
              }}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>



              <TouchableOpacity 
              style={styles.actionButton}
               onPress={() => {
               setShowActionModal(false);
                selectedFile && handleDownload(selectedFile);
                 }}
                >
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>



            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );



const renderFileItem = ({ item }: { item: FileItem }) => (
  <TouchableOpacity 
    style={styles.fileItem}
    onPress={() => handleFileOpen(item)}
    onLongPress={() => handleFileAction(item)}
  >
    <View style={[styles.fileInfo, styles.fileRow]}>
      {item.name === '..' ? (
        <>
          <Text style={[styles.fileName, styles.backButton]}>← Back</Text>
        </>
      ) : (
        <>
          <Text style={styles.fileName}>
            {item.type === 'directory' ? '📁 ' : '📄 '}
            {item.name}
          </Text>
          {item.size && <Text style={styles.fileDetails}>Size: {item.size}</Text>}
          {item.modified && <Text style={styles.fileDetails}>Modified: {item.modified}</Text>}
        </>
      )}
    </View>
  </TouchableOpacity>
);


  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {!isConnected ? (
        <View style={styles.loginContainer}>
          <Image
            source={require('./assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>SFTP Client</Text>
          <TextInput
            style={styles.input}
            placeholder="Host (IP address)"
            value={host}
            onChangeText={setHost}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Port (default: 3003)"
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity 
            style={styles.button}
            onPress={connectToServer}
          >
            <Text style={styles.buttonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.fileManagerContainer}>
          <View style={styles.header}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search files..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
                    {/* Add the SortingHeader component RIGHT HERE, after the search input */}
          <SortingHeader 
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={(newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
          />
          <Text style={styles.pathText}>{currentPath}</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredFiles}
              renderItem={renderFileItem}
              keyExtractor={item => `${item.name}-${item.type}`}
              style={styles.fileList}
              contentContainerStyle={styles.fileListContent}
              showsVerticalScrollIndicator={true}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={21}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            />
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.disconnectButton]}
            onPress={disconnect}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
          <FloatingActionButton />
        </View>
      )}
      
      <FileActionModal />
      <FileContentModal />
      <ImageViewerModal />
      <RenameModal />
    </SafeAreaView>
  );
};



// Replace the entire styles section at the bottom with this cleaned up version:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loginContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileManagerContainer: {
    flex: 1,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#007AFF',
  },
  header: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    height: 36,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pathText: {
    fontSize: 12,
    color: '#666',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  input: {
    height: 40,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileList: {
    flex: 1,
  },
  fileListContent: {
    paddingBottom: 20,
  },
  fileItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fileInfo: {
    flexDirection: 'column',
  },
  fileName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
    marginLeft: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  cancelButton: {
    backgroundColor: '#8e8e93',
  },
  fileContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  fileContentScroll: {
    flex: 1,
    padding: 15,
  },
  fileContentText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: height - 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  imageErrorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },

// Add these to your styles
fab: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: '#007AFF',
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.30,
  shadowRadius: 4.65,
  zIndex: 1000,
},
fabIcon: {
  fontSize: 24,
  color: '#fff',
  fontWeight: 'bold',
  transform: [{ rotate: '90deg' }], // This makes the three dots horizontal
},

// Add to your StyleSheet
renameInput: {
  height: 40,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  paddingHorizontal: 10,
  marginVertical: 15,
  backgroundColor: '#fff',
},
renameButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},
renameButton: {
  flex: 1,
  padding: 15,
  borderRadius: 8,
  marginHorizontal: 5,
},
confirmButton: {
  backgroundColor: '#007AFF',
},
cancelButton: {
  backgroundColor: '#8e8e93',
},


});
export default App;