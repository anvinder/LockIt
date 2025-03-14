// src/settings/components/sections/DisplaySection.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';
import { ThemeMode, ViewMode } from '../../types/settings.types';

const DisplaySection = () => {
  const { settings, updateSettings } = useSettings();

  const updateDisplaySetting = (key: string, value: any) => {
    updateSettings({
      display: {
        ...settings.display,
        [key]: value,
      },
    });
  };

  const renderThemeOption = (mode: ThemeMode, label: string) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        settings.display.theme === mode && styles.themeOptionSelected,
        mode === 'dark' && styles.darkThemeOption,
      ]}
      onPress={() => updateDisplaySetting('theme', mode)}
    >
      <Text
        style={[
          styles.themeOptionText,
          settings.display.theme === mode && styles.themeOptionTextSelected,
          mode === 'dark' && styles.darkThemeOptionText,
        ]}
      >
        {label}
      </Text>
      {settings.display.theme === mode && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderViewModeOption = (mode: ViewMode, label: string) => (
    <TouchableOpacity
      style={[
        styles.viewModeOption,
        settings.display.viewMode === mode && styles.viewModeOptionSelected,
      ]}
      onPress={() => updateDisplaySetting('viewMode', mode)}
    >
      <Text
        style={[
          styles.viewModeOptionText,
          settings.display.viewMode === mode && styles.viewModeOptionTextSelected,
        ]}
      >
        {label}
      </Text>
      {settings.display.viewMode === mode && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  const renderToggleItem = (
    label: string,
    key: keyof typeof settings.display,
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
        value={settings.display[key] as boolean}
        onValueChange={(value) => updateDisplaySetting(key, value)}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Theme Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.themeOptions}>
          {renderThemeOption('light', 'Light Mode')}
          {renderThemeOption('dark', 'Dark Mode')}
          {renderThemeOption('system', 'System Default')}
        </View>
      </View>

      {/* List View Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>List View</Text>
        <View style={styles.viewModeOptions}>
          {renderViewModeOption('compact', 'Compact View')}
          {renderViewModeOption('comfortable', 'Comfortable View')}
        </View>
      </View>

      {/* File Display Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>File Display</Text>
        {renderToggleItem(
          'Show File Extensions',
          'showFileExtensions',
          'Display file extensions in the list'
        )}
        {renderToggleItem(
          'Show Hidden Files',
          'showHiddenFiles',
          'Show files that begin with a dot'
        )}
        {renderToggleItem(
          'Show File Size',
          'showFileSize',
          'Display file sizes in the list'
        )}
        {renderToggleItem(
          'Show Last Modified',
          'showLastModified',
          'Show when files were last modified'
        )}
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
  themeOptions: {
    flexDirection: 'column',
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  themeOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F2FF',
  },
  darkThemeOption: {
    backgroundColor: '#333',
  },
  themeOptionText: {
    fontSize: 16,
    color: '#333',
  },
  themeOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  darkThemeOptionText: {
    color: '#fff',
  },
  checkmark: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  viewModeOptions: {
    flexDirection: 'column',
    gap: 12,
  },
  viewModeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  viewModeOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F2FF',
  },
  viewModeOptionText: {
    fontSize: 16,
    color: '#333',
  },
  viewModeOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
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
});

export default DisplaySection;