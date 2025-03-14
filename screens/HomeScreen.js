// screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
  ScrollView,
  SafeAreaView
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Icon = ({ name, size, color }) => {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
};

import { useNavigation } from '@react-navigation/native';
import { BleManager } from 'react-native-ble-plx';
import { request, PERMISSIONS, RESULTS, check, checkMultiple } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WiFiConfigModal from '../WiFiConfigModal';
import { STORAGE_KEYS, BLE_CONFIG } from '../config'; // Import from config

// Create a BLE manager instance
const bleManager = new BleManager();

// Filter for devices starting with this prefix
const DEVICE_NAME_PREFIX = BLE_CONFIG.deviceNamePrefix;
const SCAN_TIMEOUT = BLE_CONFIG.scanTimeout;
// Set minimum RSSI to -85dB
const MINIMUM_RSSI = -85;

// Storage key for connected devices (must match key used in DevicesScreen)
const STORAGE_KEY_CONNECTED_DEVICES = STORAGE_KEYS.connectedDevices;

const HomeScreen = () => {
  const [devices, setDevices] = useState([]);
  const [allDevices, setAllDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showWifiConfig, setShowWifiConfig] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [deviceConnectionStatus, setDeviceConnectionStatus] = useState({});
  
  const navigation = useNavigation();
  
  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
    
    return () => {
      // Clean up
      if (selectedDevice) {
        selectedDevice.cancelConnection();
      }
    };
  }, []);

  // Check connection status for all devices
  const updateConnectionStatuses = useCallback(async () => {
    try {
      const storedDevicesJSON = await AsyncStorage.getItem(STORAGE_KEY_CONNECTED_DEVICES);
      if (!storedDevicesJSON) return;
      
      const storedDevices = JSON.parse(storedDevicesJSON);
      const statuses = {};
      
      // Build a map of device IDs to connection status
      storedDevices.forEach(device => {
        statuses[device.id] = device.ipAddress && 
                              device.ipAddress !== "Connecting..." && 
                              /^\d+\.\d+\.\d+\.\d+$/.test(device.ipAddress);
      });
      
      setDeviceConnectionStatus(statuses);
    } catch (error) {
      console.error('Error updating connection statuses:', error);
    }
  }, []);

  // Update displayed devices when new devices are found
  useEffect(() => {
    // Filter to only show RP devices with signal strength above threshold
    const rpDevices = allDevices.filter(device => 
      device.name && 
      device.name.startsWith(DEVICE_NAME_PREFIX) &&
      device.rssi >= MINIMUM_RSSI
    );
    
    setDevices(rpDevices);
    
    // Update connection statuses when devices change
    updateConnectionStatuses();
  }, [allDevices, updateConnectionStatuses]);
  
  // Check if a device is already connected
  const checkIfDeviceConnected = async (deviceId) => {
    try {
      const storedDevicesJSON = await AsyncStorage.getItem(STORAGE_KEY_CONNECTED_DEVICES);
      if (!storedDevicesJSON) return false;
      
      const storedDevices = JSON.parse(storedDevicesJSON);
      const device = storedDevices.find(d => d.id === deviceId);
      
      // Consider the device connected if it has a valid IP address that's not "Connecting..."
      return device && device.ipAddress && 
             device.ipAddress !== "Connecting..." && 
             /^\d+\.\d+\.\d+\.\d+$/.test(device.ipAddress);
    } catch (error) {
      console.error('Error checking device connection status:', error);
      return false;
    }
  };
  
  // Check permissions
  const checkPermissions = async () => {
    try {
      console.log('Checking permissions');
      
      if (Platform.OS === 'ios') {
        // For iOS, we only need to check Bluetooth permission
        const result = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
        console.log('Bluetooth permission status:', result);
        
        if (result === RESULTS.GRANTED) {
          setPermissionGranted(true);
          return true;
        }
        return false;
      } 
      else if (Platform.OS === 'android') {
        // Android permissions
        let permissions = [];
        
        if (Platform.Version >= 31) { // Android 12+
          permissions = [
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          ];
        } else {
          permissions = [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
        }
        
        const statuses = await checkMultiple(permissions);
        console.log('Permission statuses:', statuses);
        
        // Check if all permissions are granted
        const allGranted = Object.values(statuses).every(status => status === RESULTS.GRANTED);
        
        setPermissionGranted(allGranted);
        return allGranted;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  // Request permissions
  const requestPermissions = async () => {
    try {
      console.log('Requesting permissions');
      
      if (Platform.OS === 'ios') {
        // For iOS, request Bluetooth permission
        const result = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
        console.log('Bluetooth permission request result:', result);
        
        if (result === RESULTS.GRANTED) {
          setPermissionGranted(true);
          return true;
        }
        return false;
      }
      else if (Platform.OS === 'android') {
        // Android permissions
        let permissions = [];
        
        if (Platform.Version >= 31) { // Android 12+
          permissions = [
            PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
            PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          ];
        } else {
          permissions = [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
        }
        
        const results = await Promise.all(permissions.map(permission => request(permission)));
        
        // Check if all permissions are granted
        const allGranted = results.every(result => result === RESULTS.GRANTED);
        
        setPermissionGranted(allGranted);
        return allGranted;
      }
      
      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };
  
  // Enhanced pollForDeviceIp function
  const pollForDeviceIp = async (deviceId, currentIp, maxAttempts = 15) => {
    // This function will periodically check if the device's IP has changed in storage
    console.log(`Starting IP polling for device ${deviceId}, current IP: ${currentIp}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Wait between attempts - longer intervals for better chance of IP being ready
        const waitTime = 3000 + (attempt * 1000);  // 4s, 5s, 6s, etc.
        console.log(`Waiting ${waitTime}ms before poll attempt ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Read current devices from storage
        const storedDevicesJSON = await AsyncStorage.getItem(STORAGE_KEY_CONNECTED_DEVICES);
        if (!storedDevicesJSON) {
          console.log(`No stored devices found on attempt ${attempt}`);
          continue;
        }
        
        const storedDevices = JSON.parse(storedDevicesJSON);
        const device = storedDevices.find(d => d.id === deviceId);
        
        if (!device) {
          console.log(`Device ${deviceId} not found in storage on attempt ${attempt}`);
          continue;
        }
        
        console.log(`Current stored IP for device: ${device.ipAddress}`);
        
        // Accept any valid IP that's not "Connecting..." status
        if (device.ipAddress && 
            device.ipAddress !== currentIp && 
            device.ipAddress !== "Connecting..." &&
            /^\d+\.\d+\.\d+\.\d+$/.test(device.ipAddress)) {
          console.log(`Device IP changed from ${currentIp} to ${device.ipAddress}`);
          // Update connection statuses after successful IP change
          updateConnectionStatuses();
          return device.ipAddress;
        }
        
        // If we're on the last attempt and still have "Connecting..." status,
        // try to ping the hostname if available
        if (attempt === maxAttempts - 1 && 
            (device.ipAddress === "Connecting..." || device.ipAddress === currentIp) && 
            device.hostname) {
          console.log(`Trying to resolve hostname: ${device.hostname}`);
          
          // In a real implementation, we would try to resolve the hostname to an IP
          // For now, we'll continue with polling
        }
      } catch (error) {
        console.error(`Error polling for IP on attempt ${attempt}:`, error);
      }
    }
    
    console.log(`IP polling complete after ${maxAttempts} attempts`);
    // Update connection statuses at the end of polling
    updateConnectionStatuses();
    return null;
  };

  // Modified handleWifiConfigDone function
  const handleWifiConfigDone = (deviceWithIp) => {
    setShowWifiConfig(false);
    
    if (!deviceWithIp) {
      console.error("No device information provided to handleWifiConfigDone");
      navigation.navigate('Devices');
      return;
    }
    
    const initialIp = deviceWithIp.ipAddress || "Connecting...";
    const deviceId = deviceWithIp.id || selectedDevice.id;
    const deviceName = deviceWithIp.name || selectedDevice.name;
    const hostname = deviceWithIp.hostname || null;
    
    // Save the device with current IP address
    console.log(`Initially configured device with IP: ${initialIp}`);
    saveDeviceToStorage(
      { id: deviceId, name: deviceName }, 
      initialIp, 
      hostname
    ).then(() => {
      Alert.alert(
        'Device Configured', 
        `Device successfully connected to WiFi.\nInitial IP: ${initialIp}${hostname ? `\nHostname: ${hostname}` : ''}\n\nAttempting to get final IP address...`,
        [{ 
          text: 'OK', 
          onPress: async () => {
            // Begin polling for IP changes after user acknowledges
            pollForDeviceIp(deviceId, initialIp, 15).then(newIp => {
              if (newIp) {
                console.log(`Polling found new IP: ${newIp}`);
                Alert.alert(
                  'IP Address Updated',
                  `Your device's IP address has been updated to: ${newIp}`,
                  [{ text: 'OK', onPress: () => navigation.navigate('Devices') }]
                );
              } else {
                console.log("No IP change detected during polling");
                navigation.navigate('Devices');
              }
            }).catch(error => {
              console.error("Error during IP polling:", error);
              navigation.navigate('Devices');
            });
          }
        }]
      );
    });
  };

  // Updated saveDeviceToStorage function to handle hostname
  const saveDeviceToStorage = async (device, ipAddress = null, hostname = null) => {
    try {
      // Get existing devices
      const storedDevicesJSON = await AsyncStorage.getItem(STORAGE_KEY_CONNECTED_DEVICES);
      let storedDevices = storedDevicesJSON ? JSON.parse(storedDevicesJSON) : [];
      
      // Check if device already exists
      const existingDeviceIndex = storedDevices.findIndex(d => d.id === device.id);
      
      if (existingDeviceIndex >= 0) {
        // Update existing device
        storedDevices[existingDeviceIndex] = {
          ...storedDevices[existingDeviceIndex],
          lastConnected: new Date().toISOString()
        };
        
        // Update IP if provided
        if (ipAddress) {
          storedDevices[existingDeviceIndex].ipAddress = ipAddress;
        }
        
        // Update hostname if provided
        if (hostname) {
          storedDevices[existingDeviceIndex].hostname = hostname;
        }
      } else {
        // Add new device
        const newDevice = {
          id: device.id,
          name: device.name,
          ipAddress: ipAddress,
          lastConnected: new Date().toISOString()
        };
        
        // Add hostname if provided
        if (hostname) {
          newDevice.hostname = hostname;
        }
        
        storedDevices.push(newDevice);
      }
      
      // Save devices back to storage
      await AsyncStorage.setItem(STORAGE_KEY_CONNECTED_DEVICES, JSON.stringify(storedDevices));
      
      console.log('Device saved:', device.name, 
                  ipAddress ? `with IP ${ipAddress}` : 'without IP',
                  hostname ? `and hostname ${hostname}` : '');
                  
      // Update connection statuses after saving
      updateConnectionStatuses();
      return true;
    } catch (error) {
      console.error('Error saving device:', error);
      return false;
    }
  };
  
  // Modified connectToDevice function with reconnection prompt
  const connectToDevice = async (device) => {
    try {
      // First check if the device is already connected
      const isConnected = await checkIfDeviceConnected(device.id);
      
      if (isConnected) {
        // Show a prompt asking if user wants to reconnect
        Alert.alert(
          'Device Connected',
          'This device is already connected to the Hub. Reconnect?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Reconnect',
              onPress: async () => {
                // Proceed with connection process
                await connectDeviceProcess(device);
              }
            }
          ]
        );
        return;
      }
      
      // If not connected, proceed with connection directly
      await connectDeviceProcess(device);
    } catch (error) {
      console.error('Connection handling error:', error);
      Alert.alert('Connection Error', 'Failed to process device connection');
    }
  };

  // Actual connection process
  const connectDeviceProcess = async (device) => {
    try {
      setConnecting(true);
      // Connect to device
      const connectedDevice = await bleManager.connectToDevice(device.id);
      console.log('Connected to device:', device.name || 'Unknown');
      
      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      setSelectedDevice(connectedDevice);
      setConnecting(false);
      
      // Show WiFi configuration modal
      setShowWifiConfig(true);
            
      return connectedDevice;
    } catch (error) {
      console.error('Connection error:', error);
      setConnecting(false);
      Alert.alert('Connection Error', 'Failed to connect to device');
      return null;
    }
  };
  
  // Sort devices by signal strength
  const sortDevices = (deviceList) => {
    return deviceList.sort((a, b) => {
      // Sort by signal strength (stronger first)
      return (b.rssi || -100) - (a.rssi || -100);
    });
  };
  
  // Start scanning for devices
  const startScan = async () => {
    console.log('Start scan pressed');
    
    // Check for permissions
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Bluetooth permission is needed to scan for devices');
        return;
      }
    }

    // Clear devices
    setAllDevices([]);
    setDevices([]);
    setScanning(true);
    
    try {
      console.log(`Starting BLE scan with minimum RSSI of ${MINIMUM_RSSI}dB...`);
      
      // Use simpler scan options that match your previously working code
      const options = {
        allowDuplicates: false
      };
      
      // This will be called for each discovered device
      bleManager.startDeviceScan(null, options, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setScanning(false);
          return;
        }

        if (device) {
          // Log all discovered devices for debugging
          console.log(`Device: ${device.name || 'Unnamed'}, ID: ${device.id}, RSSI: ${device.rssi || 'unknown'}dB`);
          
          // Add to all devices list if not already there
          setAllDevices(prevDevices => {
            // Check if already in the list
            const exists = prevDevices.some(d => d.id === device.id);
            
            if (!exists) {
              const newDevices = [...prevDevices, device];
              // Sort devices by signal strength
              return sortDevices(newDevices);
            }
            
            return prevDevices;
          });
        }
      });

      // Stop scan after timeout
      setTimeout(() => {
        console.log('Stopping scan after timeout');
        bleManager.stopDeviceScan();
        setScanning(false);
        // Update connection statuses after scan
        updateConnectionStatuses();
      }, SCAN_TIMEOUT);
      
    } catch (error) {
      console.error('Scan start error:', error);
      setScanning(false);
      
      Alert.alert('Scan Error', error.message || 'Failed to start scanning');
    }
  };

  // Device status indicator component
  const DeviceStatusIndicator = ({ isConnected }) => (
    <View style={[
      styles.statusIndicator, 
      isConnected ? styles.connectedStatus : styles.disconnectedStatus
    ]}>
      <Text style={styles.statusText}>
        {isConnected ? 'Connected' : 'Connect'}
      </Text>
    </View>
  );

  // Render a device item with connection status
  const renderDeviceItem = ({ item }) => {
    const isConnected = deviceConnectionStatus[item.id] || false;
    
    return (
      <TouchableOpacity 
        style={styles.deviceItem}
        onPress={() => connectToDevice(item)}
      >
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
          <DeviceStatusIndicator isConnected={isConnected} />
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>LockitHub</Text>
          <Text style={styles.subtitle}>Your Private Local IoT Hub</Text>
          
          <TouchableOpacity 
            style={[styles.scanButton, scanning && styles.scanningButton]} 
            onPress={startScan}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Text style={styles.scanButtonText}>SCAN</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Device List Section */}
        {devices.length > 0 && (
          <View style={styles.devicesSection}>
            <Text style={styles.sectionTitle}>Available Devices</Text>
            
            <FlatList
              data={devices}
              renderItem={renderDeviceItem}
              keyExtractor={item => item.id}
              style={styles.devicesList}
            />
          </View>
        )}
        
        {/* WiFi Configuration Modal */}
        {selectedDevice && (
          <WiFiConfigModal
            isVisible={showWifiConfig}
            device={selectedDevice}
            onClose={() => {
              setShowWifiConfig(false);
              // Disconnect the device cleanly before navigating
              if (selectedDevice) {
                try {
                  selectedDevice.cancelConnection();
                } catch (e) {
                  console.log('Error disconnecting device:', e);
                }
              }
              navigation.navigate('Devices');
            }}
            onConfigSuccess={(deviceWithIp) => {
              console.log("WiFi config success with device:", deviceWithIp);
              
              // Generate a hostname based on device name
              const deviceName = deviceWithIp?.name || selectedDevice.name;
              const sanitizedName = deviceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              const hostname = `${sanitizedName}.local`;
              
              // If deviceWithIp has an IP, use it
              const ipAddress = deviceWithIp?.ipAddress || "Connecting...";
              
              // Handle the case properly
              handleWifiConfigDone({
                id: selectedDevice.id,
                name: deviceName,
                ipAddress: ipAddress,
                hostname: hostname
              });
            }}
          />
        )}

        {connecting && (
          <View style={styles.connectingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.connectingText}>Connecting...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  scanningButton: {
    backgroundColor: '#9E9E9E',
  },
  scanButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  devicesSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  devicesList: {
    width: '100%',
  },
  deviceItem: {
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    width: '100%',
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deviceId: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  deviceSignal: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  // Status indicator styles
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  connectedStatus: {
    backgroundColor: '#4CAF50',
  },
  disconnectedStatus: {
    backgroundColor: '#2196F3',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  connectingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;