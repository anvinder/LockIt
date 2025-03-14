// src/settings/components/sections/UserProfileSection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

const UserProfileSection = () => {
  const { settings } = useSettings();
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

  const handleChangePassword = () => {
    Alert.alert(
      'Feature Upcoming',
      'Password change functionality will be available in a future update.'
    );
  };

  const renderDeviceHistory = () => (
    <View style={styles.subsection}>
      <Text style={styles.subtitle}>Device History</Text>
      {settings.deviceHistory.length > 0 ? (
        settings.deviceHistory.map((device, index) => (
          <View key={index} style={styles.deviceItem}>
            <Text style={styles.deviceIp}>{device.ip}</Text>
            <Text style={styles.deviceLocation}>{device.location}</Text>
            <Text style={styles.deviceTime}>{device.lastAccess}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No device history available</Text>
      )}
    </View>
  );

  const renderProfileInfo = () => (
    <View style={styles.subsection}>
      <View style={styles.infoItem}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{settings.username || 'Not set'}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleChangePassword}
      >
        <Text style={styles.buttonText}>Change Password</Text>
        <Text style={styles.featureTag}>Feature Upcoming</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        {renderProfileInfo()}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Activity</Text>
        {renderDeviceHistory()}
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
    marginBottom: 16,
    color: '#333',
  },
  subsection: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#666',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureTag: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  deviceItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceIp: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  deviceLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deviceTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default UserProfileSection;