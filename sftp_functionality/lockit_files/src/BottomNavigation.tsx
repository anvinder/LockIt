import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomNavigationProps {
  onHomePress: () => void;
  onDevicesPress: () => void;
  onSettingsPress: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onHomePress,
  onDevicesPress,
  onSettingsPress
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={onHomePress}>
        <Text style={styles.navIcon}>🏠</Text>
        <Text style={styles.navLabel}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={onDevicesPress}>
        <Text style={styles.navIcon}>📱</Text>
        <Text style={styles.navLabel}>Devices</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem} onPress={onSettingsPress}>
        <Text style={styles.navIcon}>⚙️</Text>
        <Text style={styles.navLabel}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 50, // Reduced height
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20, // Slightly smaller
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10, // Smaller font
    color: '#4B5563',
  },
});