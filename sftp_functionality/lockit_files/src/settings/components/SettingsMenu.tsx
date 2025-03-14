// src/settings/components/SettingsMenu.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import UserProfileSection from './sections/UserProfileSection';
import NotificationSection from './sections/NotificationSection';
import DisplaySection from './sections/DisplaySection';
import SecuritySection from './sections/SecuritySection';
import StorageSection from './sections/StorageSection';
import HelpSection from './sections/HelpSection';

export const SettingsMenu = ({ onClose }: { onClose: () => void }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'profile',
      title: 'User Profile',
      icon: '👤',
      component: UserProfileSection,
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: '🔔',
      component: NotificationSection,
    },
    {
      id: 'display',
      title: 'Display Settings',
      icon: '🎨',
      component: DisplaySection,
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: '🔒',
      component: SecuritySection,
    },
    {
      id: 'storage',
      title: 'Storage & Data',
      icon: '💾',
      component: StorageSection,
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: '❓',
      component: HelpSection,
    },
  ];

  const handleBack = () => {
    if (activeSection) {
      setActiveSection(null);
    } else {
      onClose();
    }
  };

  const renderContent = () => {
    if (!activeSection) {
      return (
        <ScrollView style={styles.menuScroll}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={styles.menuItem}
              onPress={() => setActiveSection(section.id)}
            >
              <Text style={styles.menuIcon}>{section.icon}</Text>
              <Text style={styles.menuText}>{section.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }

    const SectionComponent = sections.find(
      (section) => section.id === activeSection
    )?.component;

    return SectionComponent ? <SectionComponent /> : null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>
            {activeSection ? '← Back' : 'Close'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {activeSection
            ? sections.find((s) => s.id === activeSection)?.title
            : 'Settings'}
        </Text>
        <View style={styles.placeholder} />
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 50,
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsMenu;