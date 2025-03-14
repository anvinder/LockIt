// BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface BottomNavigationProps {
  onGalleryPress: () => void;
  onFavoritesPress: () => void;
  onPowerPress: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onGalleryPress,
  onFavoritesPress,
  onPowerPress,
}) => {
  const showFeatureUnderWorks = () => {
    Alert.alert('Coming Soon', 'This feature is under development');
  };

  const showPowerOptions = () => {
    Alert.alert(
      'Account Options',
      'Choose an option',
      [
        {
          text: 'Switch Account',
          onPress: () => onPowerPress(),
        },
        {
          text: 'Sign Out',
          onPress: () => onPowerPress(),
          style: 'destructive'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={onGalleryPress}>
        <Text style={styles.icon}>🖼️</Text>
        <Text style={styles.label}>Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={showFeatureUnderWorks}>
        <Text style={styles.icon}>📤</Text>
        <Text style={styles.label}>Share</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={showFeatureUnderWorks}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.label}>Vault</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={onFavoritesPress}>
        <Text style={styles.icon}>⭐</Text>
        <Text style={styles.label}>Favorites</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={showPowerOptions}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={styles.label}>Power</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 5,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#4B5563',
  },
});