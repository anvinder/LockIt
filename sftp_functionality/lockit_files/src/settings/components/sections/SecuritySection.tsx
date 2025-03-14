// src/settings/components/sections/SecuritySection.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

export const SecuritySection = () => {
  const { settings, updateSettings } = useSettings();

  const updateSecuritySetting = (key: string, value: any) => {
    updateSettings({
      security: {
        ...settings.security,
        [key]: value,
      },
    });
  };

  const handleTwoFactorPress = () => {
    Alert.alert(
      'Feature In Progress',
      'Two-factor authentication will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleBiometricPress = () => {
    // In a real implementation, this would check device capability first
    Alert.alert(
      'Enable Biometric Login',
      'Would you like to use fingerprint or face recognition to unlock the app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enable',
          onPress: () => updateSecuritySetting('biometricEnabled', true)
        }
      ]
    );
  };

  const handleAppLockPress = () => {
    Alert.alert(
      'Set PIN Code',
      'Would you like to set up a PIN code to lock your app?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set PIN',
          onPress: () => {
            Alert.alert('PIN Setup', 'PIN setup will be implemented in the next update');
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    label: string,
    key: keyof typeof settings.security,
    description?: string,
    onPress?: () => void,
    isFeatureUpcoming: boolean = false
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
        {isFeatureUpcoming && (
          <Text style={styles.upcomingTag}>Coming Soon</Text>
        )}
      </View>
      {!onPress && (
        <Switch
          value={settings.security[key] as boolean}
          onValueChange={(value) => updateSecuritySetting(key, value)}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Authentication Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        {renderSettingItem(
          'Two-Factor Authentication',
          'twoFactorEnabled',
          'Add an extra layer of security',
          handleTwoFactorPress,
          true
        )}
        {renderSettingItem(
          'Biometric Login',
          'biometricEnabled',
          'Use fingerprint or face recognition',
          handleBiometricPress
        )}
        {renderSettingItem(
          'App Lock',
          'appLockEnabled',
          'Secure app with PIN code',
          handleAppLockPress
        )}
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        {renderSettingItem(
          'Hide File Information',
          'hideFileInfo',
          'Hide file details from others viewing your screen'
        )}
        {renderSettingItem(
          'Incognito Mode',
          'incognitoMode',
          'Browse without saving history'
        )}
        {renderSettingItem(
          'Usage Analytics',
          'analyticsEnabled',
          'Help improve the app by sharing usage data'
        )}
      </View>

      {/* Session Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sessions</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('Active Sessions', 'View and manage your active sessions')}
        >
          <Text style={styles.buttonText}>Manage Active Sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]}
          onPress={() => Alert.alert('Access Logs', 'View your recent access logs')}
        >
          <Text style={styles.buttonText}>View Access Logs</Text>
        </TouchableOpacity>
      </View>

      {/* Information */}
      <TouchableOpacity 
        style={styles.infoButton}
        onPress={() => {
          Alert.alert(
            'Privacy Information',
            'Your privacy is important to us. All data is stored locally on your device and your NAS. No data is shared with third parties unless explicitly enabled through settings.',
            [{ text: 'OK' }]
          );
        }}
      >
        <Text style={styles.infoButtonText}>Privacy Information</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  upcomingTag: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  infoButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SecuritySection;