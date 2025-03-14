// Modals.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
  Platform
} from 'react-native';
import { styles } from './Styles';
import { FileItem } from './Types';

const { height } = Dimensions.get('window');

export const FileActionModal = ({
  visible,
  selectedFile,
  onClose,
  handlers,
  isFavorite = false
}: {
  visible: boolean;
  selectedFile: FileItem | null;
  onClose: () => void;
  handlers: {
    handleCopyTo: (file: FileItem) => void;
    handleMoveTo: (file: FileItem) => void;
    handleRename: (file: FileItem) => void;
    handleDuplicate: (file: FileItem) => void;
    handleEdit: (file: FileItem) => void;
    handleShare: (file: FileItem) => void;
    handleCopyPath: (file: FileItem) => void;
    handleFileInfo: (file: FileItem) => void;
    handleDelete: (file: FileItem) => void;
    handleDownload: (file: FileItem) => void;
    handleToggleFavorite: (file: FileItem) => void;
  };
  isFavorite?: boolean;
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity 
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.modalContent}>
        <ScrollView>
          {/* Add Favorite/Unfavorite button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleToggleFavorite(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>
              {isFavorite ? '⭐ Remove from Favorites' : '☆ Add to Favorites'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleCopyTo(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>Copy to...</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleMoveTo(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>Move to...</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleRename(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>Rename</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleDuplicate(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>Duplicate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleEdit(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleShare(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleCopyPath(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>Copy Path</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleFileInfo(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>File Info</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleDownload(selectedFile);
            }}
          >
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              onClose();
              selectedFile && handlers.handleDelete(selectedFile);
            }}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

export const FileContentModal = ({
  visible,
  selectedFile,
  fileContent,
  onClose,
  onSave
}: {
  visible: boolean;
  selectedFile: FileItem | null;
  fileContent: string;
  onClose: () => void;
  onSave?: (content: string) => void;
}) => {
  const [editableContent, setEditableContent] = useState(fileContent);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setEditableContent(fileContent);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  }, [fileContent]);

  const handleContentChange = (text: string) => {
    setEditableContent(text);
    setHasUnsavedChanges(true);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them before closing?',
        [
          {
            text: 'Save',
            onPress: () => {
              handleSave();
              onClose();
            }
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: onClose
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editableContent);
      setHasUnsavedChanges(false);
      setIsEditing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: height * 0.8 }]}>
          <View style={styles.fileContentHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedFile?.name}
              </Text>
              {hasUnsavedChanges && (
                <Text style={styles.unsavedIndicator}>●</Text>
              )}
            </View>

            <View style={styles.headerButtons}>
              {!isEditing ? (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    !hasUnsavedChanges && styles.saveButtonDisabled
                  ]}
                  onPress={handleSave}
                  disabled={!hasUnsavedChanges}
                >
                  <Text style={[
                    styles.saveButtonText,
                    !hasUnsavedChanges && styles.saveButtonTextDisabled
                  ]}>
                    Save
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.fileContentScroll}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          >
            {isEditing ? (
              <TextInput
                style={[styles.fileContentText, styles.editableText]}
                value={editableContent}
                onChangeText={handleContentChange}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                textAlignVertical="top"
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.fileContentText}>{fileContent}</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


export const RenameModal = ({
  visible,
  selectedFile,
  newFileName,
  onNameChange,
  onConfirm,
  onClose
}: {
  visible: boolean;
  selectedFile: FileItem | null;
  newFileName: string;
  onNameChange: (text: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          Rename {selectedFile?.name}
        </Text>
        <TextInput
          style={styles.renameInput}
          value={newFileName}
          onChangeText={onNameChange}
          autoFocus={true}
          selectTextOnFocus={true}
        />
        <View style={styles.renameButtons}>
          <TouchableOpacity 
            style={[styles.renameButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.renameButton, styles.confirmButton]}
            onPress={onConfirm}
          >
            <Text style={styles.buttonText}>Rename</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);



export const ImageViewerModal = ({
  visible,
  imageUrl,
  BASE_URL,
  host,
  port,
  username,
  password,
  onClose
}) => {
  if (!visible) return null;
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Construct the full URL for the image
  const params = new URLSearchParams({
    path: imageUrl,
    host: host,
    port: port,
    username: username,
    password: password
  });
  const fullImageUrl = `${BASE_URL}/file?${params.toString()}`;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Close button at the top */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={onClose}
        >
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>×</Text>
        </TouchableOpacity>
        
        {/* Loading indicator */}
        {loading && (
          <ActivityIndicator 
            size="large" 
            color="white" 
            style={{ position: 'absolute', zIndex: 5 }}
          />
        )}
        
        {/* Error message */}
        {error && (
          <View style={{ 
            position: 'absolute', 
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 15,
            borderRadius: 8,
            zIndex: 5
          }}>
            <Text style={{ color: 'red', textAlign: 'center' }}>
              Failed to load image
            </Text>
          </View>
        )}
        
        {/* Full screen image */}
        <Image
          source={{ 
            uri: fullImageUrl,
            headers: {
              Accept: 'image/jpeg,image/png,image/*;q=0.8'
            }
          }}
          style={{
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            resizeMode: 'contain',
            display: error ? 'none' : 'flex'
          }}
          onLoadStart={() => {
            setLoading(true);
            setError(false);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      </View>
    </Modal>
  );
};