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

  // Reset state when modal content changes
  useEffect(() => {
    setEditableContent(fileContent);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  }, [fileContent, visible]);

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

  const toggleEditMode = () => {
    console.log("Toggle edit mode called, current state:", isEditing);
    setIsEditing(!isEditing);
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
          {/* Header with clear buttons */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#e0e0e0' 
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: '#333'
              }} numberOfLines={1}>
                {selectedFile?.name}
              </Text>
              {hasUnsavedChanges && (
                <Text style={{ color: 'red', fontSize: 12 }}>Unsaved changes</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row' }}>
              {/* Edit/Save button */}
              <TouchableOpacity
                style={{
                  backgroundColor: isEditing ? '#4CAF50' : '#2196F3',
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 6,
                  marginRight: 10
                }}
                onPress={isEditing ? handleSave : toggleEditMode}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>
                  {isEditing ? 'Save' : 'Edit'}
                </Text>
              </TouchableOpacity>
              
              {/* Clear Close button */}
              <TouchableOpacity 
                style={{
                  backgroundColor: '#f44336',
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 6
                }}
                onPress={handleClose}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content area */}
          <ScrollView 
            style={{ flex: 1 }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          >
            {isEditing ? (
              <TextInput
                style={{
                  flex: 1,
                  padding: 15,
                  fontSize: 16,
                  color: '#333',
                  backgroundColor: '#f9f9f9',
                  minHeight: height * 0.6
                }}
                value={editableContent}
                onChangeText={handleContentChange}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                textAlignVertical="top"
                scrollEnabled={true}
              />
            ) : (
              <Text style={{
                padding: 15,
                fontSize: 16,
                color: '#333',
                lineHeight: 24
              }}>{fileContent}</Text>
            )}
          </ScrollView>
          
          {/* Footer with edit mode indicator */}
          <View style={{
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            backgroundColor: isEditing ? '#e8f5e9' : 'transparent'
          }}>
            <Text style={{ 
              textAlign: 'center', 
              color: isEditing ? '#388e3c' : '#757575',
              fontWeight: isEditing ? 'bold' : 'normal'
            }}>
              {isEditing ? 'EDIT MODE' : 'Read Only - Press Edit to make changes'}
            </Text>
          </View>
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
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}>
      <View style={{
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 15,
          textAlign: 'center'
        }}>
          Rename {selectedFile?.name}
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 5,
            padding: 10,
            marginBottom: 20,
            fontSize: 16
          }}
          value={newFileName}
          onChangeText={onNameChange}
          autoFocus={true}
          selectTextOnFocus={true}
        />
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <TouchableOpacity 
            style={{
              flex: 1,
              marginRight: 10,
              padding: 12,
              borderRadius: 5,
              backgroundColor: '#f0f0f0',
              alignItems: 'center'
            }}
            onPress={onClose}
          >
            <Text style={{
              color: '#333',
              fontWeight: '600'
            }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 5,
              backgroundColor: '#3B82F6',
              alignItems: 'center'
            }}
            onPress={onConfirm}
          >
            <Text style={{
              color: 'white',
              fontWeight: '600'
            }}>Rename</Text>
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
  
  // Use the host directly instead of BASE_URL
  const apiUrl = `http://${host}:3001`;
  const fullImageUrl = `${apiUrl}/file?${params.toString()}`;
  
  console.log('Loading image from URL:', fullImageUrl);
  
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
          onError={(e) => {
            console.error('Image loading error:', e.nativeEvent);
            setError(true);
            setLoading(false);
          }}
        />
      </View>
    </Modal>
  );
};