import { SSH_CONFIG, STORAGE_KEYS } from './config'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Alert, 
  Platform 
} from 'react-native';


export const saveDeviceConfiguration = async (ipAddress) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.deviceIp, ipAddress);
    await AsyncStorage.setItem(STORAGE_KEYS.deviceConfigured, 'true');
    console.log('Device configuration saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving device configuration:', error);
    return false;
  }
};

export const checkDeviceConfiguration = async () => {
  try {
    const ipAddress = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_IP);
    const isConfigured = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_CONFIGURED);
    
    if (isConfigured === 'true' && ipAddress) {
      const confirmAction = await new Promise((resolve) => {
        Alert.alert(
          'Existing Configuration',
          `Device previously configured with IP: ${ipAddress}`,
          [
            {
              text: 'Show Home Directory',
              onPress: () => resolve('show')
            },
            {
              text: 'Reconfigure',
              style: 'destructive',
              onPress: () => resolve('reconfigure')
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve('cancel')
            }
          ]
        );
      });

      switch (confirmAction) {
        case 'show':
          await showHomeDirectory(ipAddress);
          return true;
        case 'reconfigure':
          await clearDeviceConfiguration();
          return false;
        default:
          return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking device configuration:', error);
    return false;
  }
};

export const listHomeDirectory = async (ipAddress = null) => {
  try {
    // If no IP provided, try to get stored IP
    if (!ipAddress) {
      ipAddress = await AsyncStorage.getItem(STORAGE_KEYS.deviceIp);
      
      if (!ipAddress) {
        throw new Error('No IP address provided or stored');
      }
    }


    // Build the request payload
    const payload = {
      host: ipAddress,
      port: SSH_CONFIG.port,
      username: SSH_CONFIG.username,
      password: SSH_CONFIG.password,
      path: `/home/${SSH_CONFIG.username}`
    };

    console.log('SSH Directory Listing Payload:', payload);

    // Make the API call to list directory contents - use the device IP
    const response = await fetch(`http://${ipAddress}:3001/ls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to list directory');
    }

    // Parse the directory contents
    const directoryContents = await response.json();

    // Log and return the directory contents
    console.log('Home Directory Contents:', directoryContents);
    return directoryContents;
  } catch (error) {
    console.error('SSH Directory Listing Error:', error);
    
    // Show error alert
    Alert.alert(
      'Connection Error', 
      `Failed to list home directory: ${error.message}`,
      [{ text: 'OK' }]
    );

    return null;
  }
};

export const showHomeDirectory = async (ipAddress = null) => {
  try {
    const directoryContents = await listHomeDirectory(ipAddress);
    
    if (directoryContents) {
      // Format directory contents for display
      const formattedContents = directoryContents
        .map(item => `${item.type === 'directory' ? '📁' : '📄'} ${item.name}`)
        .join('\n');

      // Show directory contents in an alert
      Alert.alert(
        'Home Directory Contents', 
        formattedContents,
        [{ text: 'OK' }]
      );
    }
  } catch (error) {
    console.error('Error showing home directory:', error);
  }
};

export const clearDeviceConfiguration = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_IP);
    await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_CONFIGURED);
    console.log('Device configuration cleared');
  } catch (error) {
    console.error('Error clearing device configuration:', error);
  }
};