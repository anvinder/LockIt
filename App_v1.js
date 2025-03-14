import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
  Alert,
  Platform,
  LogBox,
} from 'react-native';
import {BleManager} from 'react-native-ble-plx';
import {
  request,
  PERMISSIONS,
  RESULTS,
  checkMultiple,
} from 'react-native-permissions';

// Ignore specific warnings
LogBox.ignoreLogs(['new NativeEventEmitter']); 

// Create a single instance
const bleManager = new BleManager();

// Minimum signal strength to display a device (in dBm)
const MIN_RSSI_THRESHOLD = -80;

const App = () => {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
    
    return () => {
      // Clean up
      bleManager.destroy();
    };
  }, []);

  // Check permissions
  const checkPermissions = async () => {
    try {
      console.log('Checking permissions');
      const permissions = Platform.OS === 'ios' 
        ? [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL]
        : [];
      
      const statuses = await checkMultiple(permissions);
      console.log('Permission statuses:', statuses);
      
      if (Platform.OS === 'ios' && 
          statuses[PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL] === RESULTS.GRANTED) {
        setPermissionGranted(true);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  // Request permissions
  const requestPermissions = async () => {
    try {
      console.log('Requesting Bluetooth permission');
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
        console.log('Permission result:', result);
        
        if (result === RESULTS.GRANTED) {
          setPermissionGranted(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  // Generate a device display name
  const getDeviceDisplayName = (device) => {
    if (device.name) {
      return device.name;
    }
    
    // Try to get manufacturer data if available
    if (device.manufacturerData) {
      return `Device (Manufacturer: ${device.manufacturerData})`;
    }
    
    // Include the first 6 chars of the MAC as part of the name
    const shortId = device.id.substring(0, 8);
    return `Device ${shortId}`;
  };

  const startScan = async () => {
    console.log('Start scan pressed');
    
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Bluetooth permission is needed');
        return;
      }
    }

    // Clear devices
    setDevices([]);
    setScanning(true);

    try {
      console.log('Starting BLE scan...');
      
      // This will be called for each discovered device
      bleManager.startDeviceScan(null, {allowDuplicates: false}, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setScanning(false);
          return;
        }

        if (device && device.rssi >= MIN_RSSI_THRESHOLD) {
          console.log('Found device with good signal:', device.name || 'Unknown', device.id, 'RSSI:', device.rssi);
          
          // Add to devices list if not already there
          setDevices(prevDevices => {
            // Check if already in the list
            const exists = prevDevices.some(d => d.id === device.id);
            if (!exists) {
              // Add the new device and sort the list
              const newDevices = [...prevDevices, device];
              return sortDevices(newDevices);
            }
            return prevDevices;
          });
        } else if (device) {
          console.log('Ignoring device with weak signal:', device.name || 'Unknown', 'RSSI:', device.rssi);
        }
      });

      // Stop scan after 10 seconds
      setTimeout(() => {
        console.log('Stopping scan after timeout');
        bleManager.stopDeviceScan();
        setScanning(false);
      }, 10000);
    } catch (error) {
      console.error('Scan start error:', error);
      setScanning(false);
    }
  };

  // Sort devices: named devices first, then by signal strength
  const sortDevices = (deviceList) => {
    return deviceList.sort((a, b) => {
      // First priority: devices with names come before unnamed devices
      const aHasName = !!a.name;
      const bHasName = !!b.name;
      
      if (aHasName && !bHasName) return -1;
      if (!aHasName && bHasName) return 1;
      
      // Second priority: stronger signal (higher RSSI) comes first
      return b.rssi - a.rssi;
    });
  };

  const renderDevice = ({ item }) => (
    <TouchableOpacity 
      style={styles.deviceItem}
      onPress={() => {
        Alert.alert(
          'Device Details',
          `Name: ${item.name || 'Unknown'}\nMAC/ID: ${item.id}\nRSSI: ${item.rssi} dBm`
        );
      }}
    >
      <Text style={styles.deviceName}>{getDeviceDisplayName(item)}</Text>
      <Text style={styles.macAddress}>MAC: {item.id}</Text>
      <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>BLE Scanner</Text>
      
      <TouchableOpacity
        style={[styles.scanButton, scanning && styles.scanningButton]}
        onPress={startScan}
        disabled={scanning}>
        <Text style={styles.buttonText}>
          {scanning ? 'Scanning...' : 'Start Scan'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.deviceHeader}>
        <Text style={styles.deviceCount}>Devices Found: {devices.length}</Text>
        <Text style={styles.signalThreshold}>Signal Threshold: {MIN_RSSI_THRESHOLD} dBm</Text>
        <Text style={styles.permissionStatus}>
          Permission: {permissionGranted ? 'Granted' : 'Not Granted'}
        </Text>
      </View>
      
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={renderDevice}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {scanning ? 'Searching for devices...' : 'No devices found'}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  scanningButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deviceHeader: {
    backgroundColor: '#E0E0E0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  deviceCount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  signalThreshold: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  permissionStatus: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  deviceItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  macAddress: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    fontFamily: 'Courier',
  },
  deviceRssi: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#757575',
  },
});

export default App;