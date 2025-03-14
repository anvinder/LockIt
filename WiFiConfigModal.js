import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
  Linking
} from 'react-native';
import Modal from 'react-native-modal';
import * as WifiManager from 'react-native-wifi-reborn';
import { request, PERMISSIONS, check, RESULTS, openSettings } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WIFI_CONFIG, STORAGE_KEYS } from './config'; // Import centralized config

// Service and characteristic UUIDs for the Raspberry Pi
const WIFI_SERVICE_UUID = WIFI_CONFIG.serviceUuid;
const SSID_CHAR_UUID = WIFI_CONFIG.ssidCharUuid;
const PASSWORD_CHAR_UUID = WIFI_CONFIG.passwordCharUuid;
const CONNECT_CHAR_UUID = WIFI_CONFIG.connectCharUuid;
const IP_ADDRESS_CHAR_UUID = WIFI_CONFIG.ipAddressCharUuid;
const DEVICE_NAME_CHAR_UUID = WIFI_CONFIG.deviceNameCharUuid;

// Storage key for connected devices (must match key used in DevicesScreen)
const STORAGE_KEY_CONNECTED_DEVICES = STORAGE_KEYS.connectedDevices;

const WiFiConfigModal = ({ isVisible, device, onClose, onConfigSuccess }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [showNetworkList, setShowNetworkList] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [configStatus, setConfigStatus] = useState('');

  // Initialize with device name if reconfiguring
  useEffect(() => {
    if (device && device.name) {
      setDeviceName(device.name);
    }
  }, [device]);

  // Helper function to decode base64 to string
  const decodeBase64ToString = (base64String) => {
    try {
      console.log("Raw base64 string:", base64String);
      
      // Try direct conversion from base64 to ASCII string
      const binaryString = atob(base64String);
      console.log("Binary string length:", binaryString.length);
      
      // Log each character and its code for debugging
      let charCodes = [];
      for (let i = 0; i < binaryString.length; i++) {
        const char = binaryString.charAt(i);
        const code = binaryString.charCodeAt(i);
        charCodes.push(code);
        console.log(`Position ${i}: Character '${char}', Code: ${code}`);
      }
      
      // Convert char codes to string
      const result = String.fromCharCode(...charCodes);
      console.log("Decoded result:", result);
      return result;
    } catch (error) {
      console.error('Error decoding base64:', error);
      return '';
    }
  };

  // Open app permissions settings directly
  const openAppSettings = async () => {
    try {
      // Try to open the app settings directly
      await openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
      
      // Fallback: Open general device settings
      if (Platform.OS === 'ios') {
        Linking.openURL('App-Prefs:root=Privacy&path=LOCATION');
      } else {
        Linking.openURL('app-settings:');
      }
    }
  };

  // Scan for WiFi networks
  const scanWifiNetworks = async () => {
    try {
      // First check for required permissions
      const permissionsGranted = await checkWifiScanPermissions();
      
      if (!permissionsGranted) {
        Alert.alert(
          'Permission Required', 
          'Location permission is required to scan for WiFi networks',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Open Settings',
              onPress: openAppSettings
            }
          ]
        );
        return;
      }
      
      setIsScanning(true);
      setShowNetworkList(true);
      
      console.log('Starting WiFi scan...');
      
      // Check if we're on iOS
      if (Platform.OS === 'ios') {
        // On iOS, we need to use a different approach
        try {
          // First check if the getCurrentWifiSSID function exists
          if (typeof WifiManager.getCurrentWifiSSID === 'function') {
            const currentSSID = await WifiManager.getCurrentWifiSSID();
            console.log('Current SSID:', currentSSID);
            
            // Just add the current network since iOS can only see the connected network
            setNetworks([{
              SSID: currentSSID,
              level: -50, // Assume good signal
              capabilities: 'WPA' // Assume secured
            }]);
          } else {
            // Fall back to manual entry
            Alert.alert(
              'WiFi Scanning Limited',
              'On iOS, WiFi scanning is limited. Please enter your network details manually.',
              [{ text: 'OK' }]
            );
            // Show an example network to demonstrate the UI
            setNetworks([{
              SSID: 'Your Connected Network',
              level: -50,
              capabilities: 'WPA'
            }]);
          }
        } catch (error) {
          console.error('iOS WiFi scan error:', error);
          Alert.alert(
            'WiFi Information Unavailable',
            'Unable to access WiFi information. Please enter your network details manually.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Android approach
        try {
          // Check if loadWifiList exists and is a function
          if (typeof WifiManager.loadWifiList === 'function') {
            const wifiList = await WifiManager.loadWifiList();
            console.log('WiFi scan results:', wifiList);
            
            // Sort by signal strength
            const sortedNetworks = wifiList.sort((a, b) => b.level - a.level);
            setNetworks(sortedNetworks);
          } else {
            throw new Error('loadWifiList function not available');
          }
        } catch (error) {
          console.error('Android WiFi scan error:', error);
          Alert.alert(
            'WiFi Scanning Failed',
            'Unable to scan for WiFi networks. Please enter your network details manually.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('General WiFi scan error:', error);
      Alert.alert(
        'WiFi Scan Error',
        'Unable to scan for WiFi networks. Please enter your network details manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Check required permissions for WiFi scanning
  const checkWifiScanPermissions = async () => {
    try {
      const permissions = [];

      if (Platform.OS === 'android') {
        // Add the required Android permissions
        if (Platform.Version >= 31) { // Android 12+
          permissions.push(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
          permissions.push(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
          permissions.push(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        } else if (Platform.Version >= 29) { // Android 10+
          permissions.push(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        } else {
          permissions.push(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
        }
      } else if (Platform.OS === 'ios') {
        // iOS permissions
        permissions.push(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      }

      let allGranted = true;
      for (const permission of permissions) {
        const result = await check(permission);
        if (result !== RESULTS.GRANTED) {
          const requestResult = await request(permission);
          if (requestResult !== RESULTS.GRANTED) {
            allGranted = false;
          }
        }
      }
      
      return allGranted;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  // Select a WiFi network
  const selectNetwork = (selectedSsid) => {
    setSsid(selectedSsid);
    setShowNetworkList(false);
  };

  // Enhanced updateDeviceWithIp function
  const updateDeviceWithIp = async (deviceId, ipAddress, deviceName = null, hostname = null) => {
    try {
      // Get stored devices
      const storedDevicesJSON = await AsyncStorage.getItem(STORAGE_KEY_CONNECTED_DEVICES);
      let storedDevices = [];
      
      if (storedDevicesJSON) {
        storedDevices = JSON.parse(storedDevicesJSON);
      }
      
      // Find the device to update
      const deviceIndex = storedDevices.findIndex(d => d.id === deviceId);
      
      if (deviceIndex === -1) {
        // Device not found, add it as a new device
        const newDevice = {
          id: deviceId,
          name: deviceName || device.name || 'Unknown Device',
          ipAddress: ipAddress,
          lastConnected: new Date().toISOString()
        };
        
        // Add hostname if provided
        if (hostname) {
          newDevice.hostname = hostname;
        }
        
        storedDevices.push(newDevice);
        console.log(`Added new device ${deviceId} with IP ${ipAddress}`);
      } else {
        // Update the existing device
        storedDevices[deviceIndex].ipAddress = ipAddress;
        storedDevices[deviceIndex].lastConnected = new Date().toISOString();
        
        // Update device name if provided
        if (deviceName) {
          storedDevices[deviceIndex].name = deviceName;
        }
        
        // Update hostname if provided
        if (hostname) {
          storedDevices[deviceIndex].hostname = hostname;
        }
        
        console.log(`Updated device ${deviceId} with IP ${ipAddress}`);
      }
      
      // Save back to storage
      await AsyncStorage.setItem(STORAGE_KEY_CONNECTED_DEVICES, JSON.stringify(storedDevices));
      console.log(`Saved devices list with ${storedDevices.length} devices`);
      return true;
    } catch (error) {
      console.error('Error updating device with IP:', error);
      return false;
    }
  };



// Configure WiFi - updated to remove device name sending and dialog popups
const configureWifi = async () => {
  if (!ssid) {
    Alert.alert('Error', 'Please enter WiFi name (SSID)');
    return;
  }

  try {
    setIsConfiguring(true);
    setConfigStatus('Starting configuration...');

    // Log WiFi configuration details
    console.log('===== WiFi Configuration Attempt =====');
    console.log(`SSID: "${ssid}"`);
    console.log(`Password Length: ${password ? password.length : 0}`);
    
    // Simple encoding: string to base64
    const toBase64 = (str) => btoa(str);
    
    // First check and ensure device connection
    let isConnected = false;
    try {
      console.log('Checking device connection status...');
      setConfigStatus('Checking device connection...');
      isConnected = await device.isConnected();
    } catch (e) {
      console.log('Error checking connection status:', e);
    }
    
    if (!isConnected) {
      console.log('Device not connected, attempting to reconnect...');
      setConfigStatus('Reconnecting to device...');
      try {
        await device.connect();
        await device.discoverAllServicesAndCharacteristics();
        console.log('Reconnected to device');
        
        // Additional delay after reconnection
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (reconnectError) {
        console.error('Reconnection error:', reconnectError);
        throw new Error('Failed to connect to device. Please try again.');
      }
    }

    // Skip sending device name to avoid UUID errors

    // Send SSID
    console.log('Sending SSID...');
    setConfigStatus('Sending WiFi name...');
    try {
      await device.writeCharacteristicWithResponseForService(
        WIFI_SERVICE_UUID,
        SSID_CHAR_UUID,
        toBase64(ssid)
      );
      console.log('SSID sent successfully');
    } catch (error) {
      console.error('Error sending SSID:', error);
      throw new Error('Failed to send WiFi name to device.');
    }
    
    // Wait briefly
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Send password
    console.log('Sending password...');
    setConfigStatus('Sending WiFi password...');
    try {
      await device.writeCharacteristicWithResponseForService(
        WIFI_SERVICE_UUID,
        PASSWORD_CHAR_UUID,
        toBase64(password || '')
      );
      console.log('Password sent successfully');
    } catch (error) {
      console.error('Error sending password:', error);
      throw new Error('Failed to send WiFi password to device.');
    }
    
    // Wait before sending connect command
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store device info before potential disconnect
    const deviceInfo = {
      id: device.id,
      name: device.name || 'My Device'
    };
    
    // Generate a hostname that would be used for mDNS
    const sanitizedName = deviceInfo.name.toLowerCase().replace(/\s+/g, '-');
    const hostname = sanitizedName.replace(/[^a-z0-9-]/g, '') + '.local';
    
    // Send connect command
    console.log('Sending connect command...');
    setConfigStatus('Connecting to WiFi...');
    try {
      await device.writeCharacteristicWithResponseForService(
        WIFI_SERVICE_UUID,
        CONNECT_CHAR_UUID,
        toBase64('connect')
      );
      console.log('Connect command sent successfully');
    } catch (error) {
      console.log('Connect command may have caused disconnect, continuing anyway:', error.message);
    }
    
    // Wait for WiFi to connect and IP to be assigned
    console.log('Waiting for WiFi connection to establish...');
    setConfigStatus('Waiting for WiFi connection...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second wait
    
    // Try to read the IP address from the BLE characteristic
    console.log('Attempting to read IP address from device...');
    setConfigStatus('Reading IP address from device...');
    
    // Maximum number of attempts to get the IP address
    const maxAttempts = 8;
    let ipAddress = null;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`IP read attempt ${attempt + 1}/${maxAttempts}`);
        
        // Check if we're still connected, reconnect if needed
        if (!(await device.isConnected())) {
          console.log('Reconnecting to device...');
          await device.connect();
          await device.discoverAllServicesAndCharacteristics();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Read the IP address characteristic
        const ipResult = await device.readCharacteristicForService(
          WIFI_SERVICE_UUID,
          IP_ADDRESS_CHAR_UUID
        );
        
        if (ipResult && ipResult.value) {
          // Use our helper function to decode base64
          const ipRawText = decodeBase64ToString(ipResult.value);
          console.log(`Raw IP text from device: "${ipRawText}"`);
          
          // Validate the IP address format
          if (ipRawText && 
              ipRawText !== "0.0.0.0" && 
              /^\d+\.\d+\.\d+\.\d+$/.test(ipRawText)) {
            ipAddress = ipRawText;
            console.log(`Valid IP address found: ${ipAddress}`);
            break;
          } else {
            console.log(`Invalid IP format: ${ipRawText}`);
          }
        } else {
          console.log('No IP data returned');
        }
        
        // Wait before the next attempt with exponential backoff
        const delay = Math.pow(1.5, attempt) * 1000;
        console.log(`Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error) {
        console.log(`Error reading IP on attempt ${attempt + 1}:`, error.message);
      }
    }
    
    setIsConfiguring(false);
    
    // Update device with the final IP (or keep "Connecting..." if none was found)
    if (ipAddress) {
      await updateDeviceWithIp(deviceInfo.id, ipAddress, deviceInfo.name, hostname);
    } else {
      // If no IP found, use a placeholder
      await updateDeviceWithIp(deviceInfo.id, 'Connecting...', deviceInfo.name, hostname);
    }
    
    // Show a simple "Device added" message and navigate
    Alert.alert(
      'Success',
      'Device added to LockitHub',
      [{
        text: 'OK',
        onPress: () => {
          onClose();
        }
      }]
    );
    
  } catch (error) {
    console.error('WiFi configuration error:', error);
    setIsConfiguring(false);
    
    Alert.alert(
      'WiFi Configuration Failed',
      error.message || 'Failed to configure WiFi. Please try again.',
      [{ text: 'OK' }]
    );
  }
};



  // Render a WiFi network item
  const renderNetwork = ({ item }) => (
    <TouchableOpacity 
      style={styles.networkItem} 
      onPress={() => selectNetwork(item.SSID)}
    >
      <Text style={styles.networkName}>{item.SSID}</Text>
      <Text style={styles.networkDetails}>
        Signal: {item.level} dBm • Secure: {item.capabilities.includes('WPA') ? 'Yes' : 'No'}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={isConfiguring ? undefined : onClose}
      onBackButtonPress={isConfiguring ? undefined : onClose}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Configure WiFi</Text>
        <Text style={styles.subtitle}>Device: {device?.name || 'Unknown Device'}</Text>
        
        {showNetworkList ? (
          <>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Available WiFi Networks</Text>
              <TouchableOpacity onPress={() => setShowNetworkList(false)}>
                <Text style={styles.backButton}>Back</Text>
              </TouchableOpacity>
            </View>
            
            {isScanning ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.scanningText}>Scanning for networks...</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={networks}
                  renderItem={renderNetwork}
                  keyExtractor={(item, index) => item.SSID || `network-${index}`}
                  style={styles.networkList}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No WiFi networks found</Text>
                  }
                />
                <TouchableOpacity 
                  style={styles.manualEntryButton}
                  onPress={() => setShowNetworkList(false)}
                >
                  <Text style={styles.manualEntryText}>Enter Network Manually</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.label}>WiFi Name (SSID)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={ssid}
                onChangeText={(text) => {
                  console.log("SSID changed to:", text);
                  setSsid(text);
                }}
                placeholder="Enter WiFi name"
                editable={!isConfiguring}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={scanWifiNetworks}
                disabled={isConfiguring}
              >
                <Text style={styles.scanButtonText}>Scan</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={(text) => {
                  console.log("Password changed, length:", text.length);
                  setPassword(text);
                }}
                placeholder="Enter WiFi password"
                secureTextEntry={!showPassword}
                editable={!isConfiguring}
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity 
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isConfiguring}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.configButton]}
                onPress={configureWifi}
                disabled={isConfiguring || !ssid}
              >
                <Text style={styles.buttonText}>
                  {isConfiguring ? 'Configuring...' : 'Configure WiFi'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        
        {isConfiguring && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{configStatus || 'Configuring WiFi...'}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#666',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
  },
showPasswordButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  showPasswordText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginLeft: 5,
    borderRadius: 5,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  cancelButton: {
    backgroundColor: '#999',
    flex: 1,
    marginRight: 5,
  },
  configButton: {
    flex: 2,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  networkList: {
    maxHeight: 300,
  },
  networkItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  networkName: {
    fontSize: 16,
    fontWeight: '500',
  },
  networkDetails: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scanningText: {
    marginTop: 10,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  manualEntryButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  manualEntryText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default WiFiConfigModal;