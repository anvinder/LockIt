// src/settings/components/sections/NotificationSection.tsx
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

const NotificationSection = () => {
  const { settings, updateSettings } = useSettings();

  const updateNotificationSetting = (key: string, value: boolean) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const renderToggleItem = (
    label: string,
    key: keyof typeof settings.notifications,
    description?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={settings.notifications[key]}
        onValueChange={(value) => updateNotificationSetting(key, value)}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* File Operations Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>File Operations</Text>
        {renderToggleItem(
          'Upload Notifications',
          'uploadNotifications',
          'Get notified when file uploads complete'
        )}
        {renderToggleItem(
          'Download Notifications',
          'downloadNotifications',
          'Get notified when file downloads complete'
        )}
        {renderToggleItem(
          'Share Notifications',
          'shareNotifications',
          'Get notified when files are shared with you'
        )}
        {renderToggleItem(
          'Delete Notifications',
          'deleteNotifications',
          'Get notified when files are deleted'
        )}
      </View>

      {/* System Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Notifications</Text>
        {renderToggleItem(
          'Error Alerts',
          'errorAlerts',
          'Get notified about app errors'
        )}
        {renderToggleItem(
          'Update Notifications',
          'updateNotifications',
          'Get notified when app updates are available'
        )}
      </View>

      {/* Notification Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        {renderToggleItem(
          'Sound',
          'sound',
          'Play sound for notifications'
        )}
        {renderToggleItem(
          'Vibration',
          'vibration',
          'Vibrate for notifications'
        )}
        {renderToggleItem(
          'Pop-up Alerts',
          'popupAlerts',
          'Show pop-up notifications'
        )}
      </View>

      {/* Test Notifications Button */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={() => {
          Alert.alert(
            'Test Notification',
            'This is a test notification to preview your settings.',
            [{ text: 'OK' }]
          );
        }}
      >
        <Text style={styles.testButtonText}>Test Notifications</Text>
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
  testButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationSection;