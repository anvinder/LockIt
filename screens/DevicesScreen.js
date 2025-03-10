import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
  Alert,
  ActivityIndicator,
  StatusBar,
  Linking,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sftpManager from '../SftpManager';
import { SFTP_CONFIG, STORAGE_KEYS } from '../config'; // Import centralized config

// Storage key from config
const STORAGE_KEY_CONNECTED_DEVICES = STORAGE_KEYS.connectedDevices;

const DevicesScreen = () => {
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const navigation = useNavigation();

  // Load saved devices on mount and when screen is focused
  useEffect(() => {
    loadConnectedDevices();
    
    // Add a listener to reload devices when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadConnectedDevices();
    });
    
    // Clean up the listener
    return unsubscribe;
  }, [navigation]);

  // Load connected devices from storage
  const loadConnectedDevices = async () => {
    try {
      setLoading(true);
      console.log('Loading connected devices from storage...');
      
      const storedDevices = await AsyncStorage.getItem(STORAGE_KEY_CONNECTED_DEVICES);
      
      if (storedDevices) {
        // Parse and log the stored devices
        const devices = JSON.parse(storedDevices);
        console.log(`Found ${devices.length} stored devices:`);
        
        // Log each device's details for debugging
        devices.forEach((device, index) => {
          console.log(`Device ${index + 1}: ${device.name}`);
          console.log(`- ID: ${device.id}`);
          console.log(`- IP Address: ${device.ipAddress || 'Not available'}`);
          console.log(`- Last Connected: ${device.lastConnected}`);
        });
        
        setConnectedDevices(devices);
      } else {
        console.log('No stored devices found');
        setConnectedDevices([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading connected devices:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load devices');
    }
  };

  // Save connected devices to storage
  const saveConnectedDevices = async (devices) => {
    try {
      console.log(`Saving ${devices.length} devices to storage`);
      await AsyncStorage.setItem(STORAGE_KEY_CONNECTED_DEVICES, JSON.stringify(devices));
      return true;
    } catch (error) {
      console.error('Error saving connected devices:', error);
      return false;
    }
  };

  // Show login options dialog
  const showLoginOptionsDialog = (device) => {
    setSelectedDevice(device);
    setShowLoginOptions(true);
  };

  // Handle New User selection
  const handleNewUser = () => {
    setShowLoginOptions(false);
    
    // Here you could navigate to a registration flow or handle new user setup
    Alert.alert(
      'New User',
      'This would typically navigate to user registration. For now, we\'ll proceed with default credentials.',
      [
        {
          text: 'OK',
          onPress: () => connectWithCredentials(selectedDevice, SFTP_CONFIG.username, SFTP_CONFIG.password)
        }
      ]
    );
  };

  // Handle Login selection
  const handleLogin = () => {
    setShowLoginOptions(false);
    
    // Here you could navigate to a login screen or show login fields
    // For now, we'll just use the default credentials from config
    connectWithCredentials(selectedDevice, SFTP_CONFIG.username, SFTP_CONFIG.password);
  };

  // Connect with provided credentials
  const connectWithCredentials = (device, username, password) => {
    if (!device.ipAddress) {
      Alert.alert('Error', 'Device IP address not available. Please reconfigure the device.');
      return;
    }

    if (device.ipAddress === 'Connecting...') {
      Alert.alert('Device Not Ready', 'This device is still trying to connect to WiFi. Please wait a moment and try again.');
      return;
    }

    setConnecting(true);
    console.log(`Connecting to device at IP: ${device.ipAddress}`);
    
    // Use port from config
    const { port } = SFTP_CONFIG;
    
    console.log(`Connecting to SFTP with: ${username}@${device.ipAddress}:${port}`);
      
    // Attempt to connect to the device
    sftpManager.connect(device.ipAddress, username, password, port)
      .then(connected => {
        setConnecting(false);
        if (connected) {
          // Get real connection timestamp
          const updatedDevices = connectedDevices.map(d => {
            if (d.id === device.id) {
              return {
                ...d,
                lastConnected: new Date().toISOString(),
                status: 'Connected'
              };
            }
            return d;
          });
          
          setConnectedDevices(updatedDevices);
          saveConnectedDevices(updatedDevices);
          
          navigation.navigate('Sftp', {
            deviceIp: device.ipAddress,
            deviceName: device.name,
            // Pass the credentials to SftpScreen
            sftpUsername: username,
            sftpPassword: password,
            sftpPort: port
          });
        } else {
          Alert.alert('Connection Failed', 'Could not connect to the device. Please ensure the device is powered on and connected to WiFi.');
        }
      })
      .catch(error => {
        setConnecting(false);
        console.error('SFTP connection error:', error);
        Alert.alert('Connection Error', error.message || 'Failed to connect to the device. Check network connectivity.');
      });
  };

  // Connect to a device using IP address (now shows login options)
  const connectToDevice = (device) => {
    if (!device.ipAddress) {
      Alert.alert('Error', 'Device IP address not available. Please reconfigure the device.');
      return;
    }

    if (device.ipAddress === 'Connecting...') {
      Alert.alert('Device Not Ready', 'This device is still trying to connect to WiFi. Please wait a moment and try again.');
      return;
    }

    // Show login options instead of connecting directly
    showLoginOptionsDialog(device);
  };

  // Reset a device (remove from saved devices)
  const resetDevice = (deviceId) => {
    Alert.alert(
      'Reset Device',
      'Are you sure you want to reset this device? This will remove it from your saved devices.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const updatedDevices = connectedDevices.filter(d => d.id !== deviceId);
            setConnectedDevices(updatedDevices);
            saveConnectedDevices(updatedDevices);
          }
        }
      ]
    );
  };

  // Render a device item with refined UI
  const renderConnectedDevice = ({ item }) => (
    <View style={styles.deviceItem}>
      <View style={styles.deviceHeader}>
        <Icon 
          name="nas" 
          size={24} 
          color="#4CAF50" 
          style={styles.deviceIcon}
        />
        <Text style={styles.deviceName}>{item.name}</Text>
      </View>
      
      <View style={styles.deviceDivider} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="ip-network" size={16} color="#757575" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>IP Address:</Text>
            <Text style={styles.detailValue}>
              {item.ipAddress ? 
                (item.ipAddress === 'Connecting...' ? 
                  'Connecting...' : 
                  item.ipAddress
                ) : 
                'Not available'
              }
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={16} color="#757575" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Last connected:</Text>
            <Text style={styles.detailValue}>
              {new Date(item.lastConnected).toLocaleString()}
            </Text>
          </View>
        </View>
        
        {item.hostname && (
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="web" size={16} color="#757575" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Hostname:</Text>
              <Text style={styles.detailValue}>{item.hostname}</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.actionContainer}>
        {item.ipAddress && item.ipAddress !== 'Connecting...' ? (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => connectToDevice(item)}
          >
            <Icon name="connection" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Connect</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.reconfigureButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Icon name="cog-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Reconfigure</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => resetDevice(item.id)}
        >
          <Icon name="delete-outline" size={18} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configured Devices</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading devices...</Text>
        </View>
      ) : (
        <View style={styles.section}>
          {connectedDevices.length > 0 ? (
            <FlatList
              data={connectedDevices}
              keyExtractor={item => item.id}
              renderItem={renderConnectedDevice}
              style={styles.deviceList}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="devices" size={60} color="#CCCCCC" />
              <Text style={styles.emptyText}>No configured devices</Text>
              <Text style={styles.emptySubtext}>Go to Home screen to scan for new devices</Text>
            </View>
          )}
        </View>
      )}
      
      {/* Login Options Modal - Refined Minimalist Design */}
      <Modal
        visible={showLoginOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoginOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select Option
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowLoginOptions(false)}
              >
                <Icon name="close" size={20} color="#757575" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalDivider} />
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleNewUser}
            >
              <Icon name="account-plus-outline" size={22} color="#4CAF50" style={styles.optionIcon} />
              <Text style={styles.optionText}>New User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleLogin}
            >
              <Icon name="login" size={22} color="#2196F3" style={styles.optionIcon} />
              <Text style={styles.optionText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Connecting indicator */}
      {connecting && (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.connectingText}>Connecting...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  section: {
    flex: 1,
    margin: 16,
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
  deviceList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  
  // Refined device item styles
  deviceItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#FAFAFA',
  },
  deviceIcon: {
    marginRight: 12,
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  deviceDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  detailsContainer: {
    padding: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
    marginRight: 6,
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  reconfigureButton: {
    backgroundColor: '#FF9800',
  },
  actionText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  resetButton: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 10,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  connectingText: {
    marginTop: 16,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Refined minimalist modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '75%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    width: '100%',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '400',
  },
});

export default DevicesScreen;