// src/components/FloatingActionButton.tsx
import React, { useState, useEffect } from 'react';
import { 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Text, 
  View, 
  StyleSheet, 
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import styles from './Styles';

interface FloatingActionButtonProps {
  onUpload: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
}

export const FloatingActionButton = ({
  onUpload,
  onNewFile,
  onNewFolder
}: FloatingActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const { height } = Dimensions.get('window');

  // Close menu when back button is pressed
  useEffect(() => {
    return () => {
      if (isExpanded) {
        setIsExpanded(false);
      }
    };
  }, [isExpanded]);

  const toggleActions = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true
    }).start();
    setIsExpanded(!isExpanded);
  };

  const closeMenu = () => {
    Animated.spring(animation, {
      toValue: 0,
      friction: 5,
      useNativeDriver: true
    }).start(() => setIsExpanded(false));
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  // Action buttons now displayed in a Modal for better control and visibility
  const renderActionButtons = () => {
    return (
      <Modal
        visible={isExpanded}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={localStyles.overlay}>
            <View style={localStyles.actionButtonContainer}>
              <TouchableOpacity 
                style={localStyles.actionButton}
                onPress={() => {
                  onNewFolder();
                  closeMenu();
                }}
                activeOpacity={0.8}
              >
                <Text style={localStyles.actionButtonIcon}>📁</Text>
                <Text style={localStyles.actionButtonLabel}>New Folder</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={localStyles.actionButton}
                onPress={() => {
                  onNewFile();
                  closeMenu();
                }}
                activeOpacity={0.8}
              >
                <Text style={localStyles.actionButtonIcon}>📄</Text>
                <Text style={localStyles.actionButtonLabel}>New File</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={localStyles.actionButton}
                onPress={() => {
                  onUpload();
                  closeMenu();
                }}
                activeOpacity={0.8}
              >
                <Text style={localStyles.actionButtonIcon}>📤</Text>
                <Text style={localStyles.actionButtonLabel}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <>
      {renderActionButtons()}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={toggleActions}
      >
        <Animated.Text 
          style={[
            styles.fabIcon, 
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        >
          {isExpanded ? '×' : '+'}
        </Animated.Text>
      </TouchableOpacity>
    </>
  );
};

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 90, // Position above the FAB
    right: 25,
    borderRadius: 12,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionButtonLabel: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  }
});