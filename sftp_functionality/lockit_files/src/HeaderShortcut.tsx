// HeaderShortcut.tsx
import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  Modal, 
  StyleSheet,
  Dimensions,
  Alert
} from 'react-native';

interface HeaderShortcutProps {
  onGalleryPress: () => void;
  onSharePress: () => void;
  onVaultPress: () => void;
  onFavoritesPress: () => void;
  onPowerPress: () => void;
}

const HeaderShortcut: React.FC<HeaderShortcutProps> = ({
  onGalleryPress,
  onSharePress,
  onVaultPress,
  onFavoritesPress,
  onPowerPress
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPowerSubMenu, setShowPowerSubMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setShowPowerSubMenu(false); // Reset power submenu when main menu toggles
  };

  const handleOptionPress = (handler: () => void) => {
    handler();
    setShowMenu(false);
  };

  const showPowerOptions = () => {
    setShowPowerSubMenu(true);
  };

  const handlePowerOption = (option: string) => {
    setShowMenu(false);
    setShowPowerSubMenu(false);
    
    switch(option) {
      case 'switch':
        onPowerPress();
        break;
      case 'signout':
        onPowerPress();
        break;
      default:
        break;
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.shortcutButton}
        onPress={toggleMenu}
      >
        <Text style={styles.shortcutIcon}>≡</Text>
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            {/* Main menu options */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleOptionPress(onGalleryPress)}
            >
              <Text style={styles.menuIcon}>🖼️</Text>
              <Text style={styles.menuText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleOptionPress(onSharePress)}
            >
              <Text style={styles.menuIcon}>📤</Text>
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleOptionPress(onVaultPress)}
            >
              <Text style={styles.menuIcon}>🔒</Text>
              <Text style={styles.menuText}>Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleOptionPress(onFavoritesPress)}
            >
              <Text style={styles.menuIcon}>⭐</Text>
              <Text style={styles.menuText}>Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={showPowerOptions}
            >
              <Text style={styles.menuIcon}>⚡</Text>
              <Text style={styles.menuText}>Power</Text>
              <Text style={styles.submenuIndicator}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Power submenu */}
          {showPowerSubMenu && (
            <View style={styles.submenuContainer}>
              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => handlePowerOption('switch')}
              >
                <Text style={styles.submenuText}>Switch Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submenuItem, styles.signoutItem]}
                onPress={() => handlePowerOption('signout')}
              >
                <Text style={styles.signoutText}>Sign Out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submenuItem}
                onPress={() => setShowPowerSubMenu(false)}
              >
                <Text style={styles.submenuText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  shortcutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F6F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  shortcutIcon: {
    fontSize: 20,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 70, // Position below the header
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  submenuIndicator: {
    fontSize: 12,
    color: '#6B7280',
  },
  submenuContainer: {
    position: 'absolute',
    top: 70, // Same position as main menu
    right: 200, // Position to the left of the main menu
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 160,
  },
  submenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  submenuText: {
    fontSize: 16,
    color: '#1F2937',
  },
  signoutItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  signoutText: {
    fontSize: 16,
    color: '#EF4444', // Red for signout
  },
});

export default HeaderShortcut;