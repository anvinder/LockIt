// src/components/FloatingActionButton.tsx
import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  StyleSheet, 
  Animated 
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

  const toggleActions = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true
    }).start();
    setIsExpanded(!isExpanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

const renderActionButtons = () => {
  const actions = [
    { onPress: onNewFolder, icon: '📁', label: 'New Folder', offset: 210 },
    { onPress: onNewFile, icon: '📄', label: 'New File', offset: 140 },
    { onPress: onUpload, icon: '📤', label: 'Upload', offset: 70 }
  ];

  return actions.map((action, index) => (
    <Animated.View 
      key={action.label}
      style={[
        localStyles.actionButton,
        { 
          transform: [
            { 
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -action.offset]
              })
            },
            { 
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1]
              }) 
            }
          ],
          opacity: animation
        }
      ]}
    >
      <TouchableOpacity 
        style={localStyles.actionButtonInner}
        onPress={() => {
          action.onPress();
          toggleActions();
        }}
      >
        <Text style={localStyles.actionButtonIcon}>{action.icon}</Text>
        <Text style={localStyles.actionButtonLabel}>{action.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  ));
};

  return (
    <View style={localStyles.container}>
      <View style={localStyles.actionContainer}>
        {renderActionButtons()}
      </View>
      
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
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'flex-end',
  },
  actionButton: {
    position: 'absolute',
    right: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonLabel: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  }
});