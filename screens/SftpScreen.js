// screens/SftpScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { SettingsProvider } from '../sftp_functionality/lockit_files/src/settings/contexts/SettingsContext';
import { SFTP_CONFIG } from '../config';
// Dynamically import AppMain to avoid initializing it immediately
let AppMain = null;
try {
  AppMain = require('../sftp_functionality/lockit_files/src/AppMain').default;
} catch (error) {
  console.error('Error importing AppMain:', error);
}

//console.log('SftpScreen rendering with route params:', route.params);

const SftpScreen = ({ route, navigation }) => {
  const { deviceIp, deviceName, sftpUsername, sftpPassword, sftpPort } = route.params || {};
  
  useEffect(() => {
    console.log('SFTP Screen loaded with params:', {
      deviceIp, 
      deviceName, 
      sftpUsername, 
      sftpPassword,
      sftpPort
    });
    
    // Set navigation header title
    if (navigation && deviceName) {
      navigation.setOptions({
        title: `${deviceName} - SFTP`,
      });
    }
    

    console.log('About to render AppMain with initialConnectionParams:', {
  host: deviceIp || '',
  port: sftpPort?.toString() || '3003',
  username: sftpUsername || '',
  hasPassword: !!(sftpPassword || '')
});


    return () => {
      // Cleanup when component unmounts
      console.log('SFTP Screen unmounting');
    };
  }, [deviceIp, deviceName, sftpUsername, sftpPassword, sftpPort, navigation]);

  // If AppMain failed to load, show a placeholder
  if (!AppMain) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load SFTP functionality. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SettingsProvider>
        <AppMain 
          initialConnectionParams={{
            host: deviceIp || '',
            port: sftpPort?.toString() || SFTP_CONFIG.port.toString(), // Use config
            username: sftpUsername || SFTP_CONFIG.username,
            password: sftpPassword || SFTP_CONFIG.password
          }}
        />
      </SettingsProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  }
});

export default SftpScreen;