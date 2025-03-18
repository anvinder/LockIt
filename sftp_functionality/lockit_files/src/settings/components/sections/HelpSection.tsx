// src/settings/components/sections/HelpSection.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';

export const HelpSection = () => {
  const APP_VERSION = '1.0.0'; // You should get this from your app config

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact support:',
      [
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:support@yourapp.com?subject=Support Request');
          },
        },
        {
          text: 'In-App Message',
          onPress: () => {
            Alert.alert('Coming Soon', 'In-app messaging will be available in a future update');
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

const handleReportIssue = () => {
  Alert.alert(
    'Report an Issue',
    'Please describe the issue you are experiencing:',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Report',
        onPress: () => {
          // Here you would typically open a form or email
          Alert.alert('Thank You', 'Your report has been received. We will investigate and get back to you soon.');
        },
      },
    ]
  );
};

const handleFeatureRequest = () => {
  Alert.alert(
    'Feature Request',
    'Have an idea for improving the app? We would love to hear it!',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Submit Request',
        onPress: () => {
          Alert.alert('Thank You', 'Your feature request has been received. We will review it and consider it for future updates.');
        },
      },
    ]
  );
};

  const renderHelpItem = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <Text style={styles.helpIcon}>{icon}</Text>
      <View style={styles.helpContent}>
        <Text style={styles.helpTitle}>{title}</Text>
        <Text style={styles.helpDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Support Section */}
{/* Support Section */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Support</Text>
  {renderHelpItem(
    '📧',
    'Contact Support',
    'Get help from our support team',
    handleContactSupport
  )},
  {renderHelpItem(
    '🐛',
    'Report an Issue',
    'Let us know if something isnt working',
    handleReportIssue
  )},
  {renderHelpItem(
    '💡',
    'Feature Request',
    'Suggest new features or improvements',
    handleFeatureRequest
  )}
</View>

      {/* Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>{`${APP_VERSION}.1`}</Text>
          </View>
          <TouchableOpacity 
            style={styles.updateCheck}
            onPress={() => Alert.alert('Check for Updates', 'Your app is up to date!')}
          >
            <Text style={styles.updateCheckText}>Check for Updates</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Additional Resources */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => Alert.alert('Documentation', 'Opening documentation...')}
        >
          <Text style={styles.buttonText}>View Documentation</Text>
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  helpIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  updateCheck: {
    marginTop: 16,
    alignItems: 'center',
  },
  updateCheckText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HelpSection;