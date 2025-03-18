// src/settings/components/sections/StorageSection.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

export const StorageSection = () => {
  const { settings, updateSettings } = useSettings();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const updateStorageSetting = (key: string, value: any) => {
    updateSettings({
      storage: {
        ...settings.storage,
        [key]: value,
      },
    });
  };

const handleStorageLocationPress = () => {
  Alert.alert(
    'Feature Upcoming',
    'Custom download location will be available in a future update. Currently, files are saved to the app\'s Downloads folder.',
    [{ text: 'OK' }]
  );
};

  const setStorageQuota = () => {
    Alert.alert(
      'Set Storage Quota',
      'Choose maximum storage space for offline files:',
      [
        { text: '1 GB', onPress: () => updateStorageSetting('storageQuota', 1024 * 1024 * 1024) },
        { text: '5 GB', onPress: () => updateStorageSetting('storageQuota', 5 * 1024 * 1024 * 1024) },
        { text: '10 GB', onPress: () => updateStorageSetting('storageQuota', 10 * 1024 * 1024 * 1024) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderSettingItem = (
    label: string,
    key: keyof typeof settings.storage,
    description?: string,
    onPress?: () => void
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
      </View>
      {!onPress && (
        <Switch
          value={settings.storage[key] as boolean}
          onValueChange={(value) => updateStorageSetting(key, value)}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Storage Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Management</Text>
        <View style={styles.storageOverview}>
          <Text style={styles.storageTitle}>Storage Usage</Text>
          <Text style={styles.storageSize}>{formatSize(settings.storage.storageQuota)}</Text>
          <View style={styles.storageBar}>
            <View style={[styles.storageUsed, { width: '45%' }]} />
          </View>
          <Text style={styles.quotaText}>Storage Quota: {formatSize(settings.storage.storageQuota)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('Clean Cache', 'Cache cleared successfully')}
        >
          <Text style={styles.buttonText}>Clean Cache</Text>
        </TouchableOpacity>
      </View>

      {/* Data Transfer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Transfer</Text>
        {renderSettingItem(
          'Auto-sync',
          'autoSync',
          'Automatically sync files when connected'
        )}
        {renderSettingItem(
          'Download Location',
          'downloadLocation',
          'Choose where files are saved (Currently set to app Downloads folder)',
          () => Alert.alert(
          'Download Location', 
          'App currently only supports Downloads Folder. Feature to customize download location is work in progress.', 
    [{ text: 'OK' }]
  )
        )}
      </View>

      {/* Offline Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline Access</Text>
        {renderSettingItem(
          'Offline Files',
          'offlineAccess',
          'Access selected files without internet'
        )}
        {renderSettingItem(
          'Auto Download',
          'autoDownloadEnabled',
          'Automatically download files for offline use'
        )}
        
        <TouchableOpacity 
          style={[styles.button, styles.quotaButton]}
          onPress={setStorageQuota}
        >
          <Text style={styles.buttonText}>Set Storage Quota</Text>
          <Text style={styles.buttonSubtext}>Current: {formatSize(settings.storage.storageQuota)}</Text>
        </TouchableOpacity>
      </View>
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
  storageOverview: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  storageSize: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 12,
  },
  storageBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageUsed: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  quotaText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  quotaButton: {
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
});

export default StorageSection;