// AppMain.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from './settings/contexts/SettingsContext';
import { SettingsMenu } from './settings/components/SettingsMenu';
import { SFTP_CONFIG, PATH_CONFIG, SERVER_CONFIG } from '../../../config'; 
import HeaderShortcut from './HeaderShortcut';

import {
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Image,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { 
  FileItem,
  formatDate,
  sortFiles 
} from './Utils';

import { SortingHeader } from './SortingHeader';
import { SortCriteria, SortOrder } from './Types';
import { FloatingActionButton } from './FloatingActionButton';
import styles from './Styles';
import { 
  FileActionModal, 
  FileContentModal, 
  ImageViewerModal, 
  RenameModal 
} from './Modals';
import { createHandlers } from './Handlers';
const BASE_URL = SERVER_CONFIG.baseUrl;

// Helper function to determine file icon - moved outside component
const getFileIcon = (item: FileItem): string => {
  if (!item) return '📄';
  if (item.name === '..') return '↩️';
  if (item.type === 'directory') return '📁';
  
  const ext = item.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'txt': return '📄';
    case 'pdf': return '📕';
    case 'doc': 
    case 'docx': return '📘';
    case 'xls':
    case 'xlsx': return '📗';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return '🖼️';
    case 'mp3':
    case 'wav': return '🎵';
    case 'mp4':
    case 'avi': return '🎬';
    default: return '📄';
  }
};

// Define interface for props
interface AppMainProps {
  initialConnectionParams?: {
    host: string;
    port: string;
    username: string;
    password: string;
  };
}

const AppMain = ({ initialConnectionParams }: AppMainProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [menuAnimation] = useState(new Animated.Value(-Dimensions.get('window').width * 0.75));
  const { settings } = useSettings();
  
  // State declarations
  const [state, setState] = useState(()=>{
  const initialState = {
      host: initialConnectionParams?.host || '',
      port: initialConnectionParams?.port || SFTP_CONFIG.port.toString(), // Use config
      username: initialConnectionParams?.username || SFTP_CONFIG.username,
      password: initialConnectionParams?.password || SFTP_CONFIG.password,
    isConnected: false,
    status: '',
    currentPath: '',
    files: [] as FileItem[],
    filteredFiles: [] as FileItem[],
    loading: false,
    selectedFile: null as FileItem | null,
    showActionModal: false,
    searchQuery: '',
    refreshing: false,
    showFileContent: false,
    fileContent: '',
    showImageViewer: false,
    imageUrl: '',
    isFileOpen: false,
    selectedFiles: [] as FileItem[],
    lastTap: 0,
    offlineFiles: {} as {[key: string]: FileItem[]},
    isUploading: false,
    uploadProgress: 0,
    sortBy: 'name' as SortCriteria,
    sortOrder: 'asc' as SortOrder,
    showRenameModal: false,
    newFileName: '',
    favorites: [] as FileItem[],
    showingGallery: false,
    showingFavorites: false,
    viewMode: 'list' as 'list' | 'grid',
  };
  console.log('Initial state set:', {
    host: initialState.host,
    port: initialState.port,
    username: initialState.username,
    hasPassword: !!initialState.password
  });
  return initialState;
});


  // Auto-connect if initialConnectionParams is provided
useEffect(() => {
  console.log('Connection params available:', 
    initialConnectionParams ? {
      host: initialConnectionParams.host,
      port: initialConnectionParams.port,
      username: initialConnectionParams.username,
      hasPassword: !!initialConnectionParams.password
    } : 'none'
  );
  if (initialConnectionParams) {
    console.log('Pre-filling connection form with available parameters');
    // No auto-connect, just use the values to pre-fill the form
  }
}, [initialConnectionParams]);
  // Toggle menu function
  const toggleMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: isMenuOpen ? -Dimensions.get('window').width * 0.75 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  // Fetch directory contents function
  const fetchDirectoryContents = async (path: string) => {
  console.log('fetchDirectoryContents called with path:', path);
  console.log('Current state:', {
    host: state.host,
    port: state.port,
    username: state.username,
    hasPassword: !!state.password
  });

    try {
      console.log('Setting loading: true');
      setState(prev => ({ ...prev, loading: true }));
          console.log('Fetching directory:', path);
    console.log('Using BASE_URL:', BASE_URL);
    console.log('Request body:', {
      host: state.host,
      port: parseInt(state.port),
      username: state.username,
      password: state.password ? '***' : 'empty'
    });

const apiUrl = `http://${state.host}:3001`;
const response = await fetch(`${apiUrl}/ls`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    host: state.host,
    port: parseInt(state.port),
    username: state.username,
    password: state.password,
    path
  })
});
      console.log('LS response status:', response.status);
    

      if (!response.ok) {
      console.error('LS response not OK');
      const errorText = await response.text();
      console.error('Error response text:', errorText);
        throw new Error('Failed to fetch directory contents');
      }
console.log('Parsing JSON response');
    const data = await response.json();
    console.log('Data parsed, items count:', data.length);
    
    const filesList = path !== PATH_CONFIG.getHomePath(state.username)
      ? [{ name: '..', type: 'directory' }, ...data]
      : data;
    
    console.log('Final files list prepared, items count:', filesList.length);
    const sortedFiles = sortFiles(filesList, state.sortBy, state.sortOrder);
    
    console.log('Files sorted, updating state');
    setState(prev => ({
      ...prev,
      files: sortedFiles,
      filteredFiles: sortedFiles,
      currentPath: path,
      loading: false
    }));
    console.log('State updated successfully');
  } catch (error) {
    console.error('Error in fetchDirectoryContents:', error);
    console.error('Error stack:', error.stack);
    Alert.alert('Error', error.message);
    setState(prev => ({ ...prev, loading: false }));
  }
};





  // Create handlers with current state and setState
  const handlers = createHandlers(state, setState, fetchDirectoryContents, BASE_URL);



const handleConnect = async () => {
    console.log('handleConnect called with state:', {
    host: state.host,
    port: state.port,
    username: state.username,
    passwordLength: state.password ? state.password.length : 0
  });

  try {
    setState(prev => ({ 
      ...prev, 
      status: `Attempting to connect to ${state.host}...` 
    }));
    
    const initialPath = PATH_CONFIG.getHomePath(state.username);
    
console.log('Making connection request:', `http://${state.host}:3001/connect`);
const response = await fetch(`http://${state.host}:3001/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: state.host,
        port: parseInt(state.port),
        username: state.username,
        password: state.password
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

    // Handle special case from server when credentials are empty
    if (data.needCredentials) {
      // Skip authentication check - just connect anyway
      setState(prev => ({
        ...prev,
        isConnected: true,
        status: `Connected to ${state.host}\nNote: No credentials provided`
      }));
      
      await fetchDirectoryContents(initialPath);
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || 'Connection failed');
    }

    setState(prev => ({
      ...prev,
      isConnected: true,
      status: `Connected to ${state.host}\nUser: ${state.username}\nPath: ${initialPath}`
    }));
    
    await fetchDirectoryContents(initialPath);
  } catch (error: any) {
    console.error('Connection error details:', error);
    setState(prev => ({ ...prev, status: `Error: ${error.message}` }));
    Alert.alert('Connection Error', error.message);
  }
};



  // Filter files based on search
  const filterFiles = useCallback(() => {
    let filtered = state.files;
    
    if (state.searchQuery.trim()) {
      filtered = state.files.filter(file =>
        file.name.toLowerCase().includes(state.searchQuery.toLowerCase())
      );
    }
    
    const sortedAndFiltered = sortFiles(filtered, state.sortBy, state.sortOrder);
    setState(prev => ({ ...prev, filteredFiles: sortedAndFiltered }));
  }, [state.searchQuery, state.files, state.sortBy, state.sortOrder]);

  useEffect(() => {
    filterFiles();
  }, [state.sortBy, state.sortOrder, state.searchQuery]);

  // Toggle favorite handler
  const handleToggleFavorite = (file: FileItem) => {
    setState(prev => {
      const isFavorite = prev.favorites.some(f => f.name === file.name && f.path === state.currentPath);
      const newFavorites = isFavorite
        ? prev.favorites.filter(f => !(f.name === file.name && f.path === state.currentPath))
        : [...prev.favorites, { ...file, path: state.currentPath }];
      
      Alert.alert(
        isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
        `${file.name} has been ${isFavorite ? 'removed from' : 'added to'} favorites`
      );
      
      return { ...prev, favorites: newFavorites };
    });
  };

  // Find images recursively
  const findImagesRecursively = async (path: string): Promise<FileItem[]> => {
    try {
      const response = await fetch(`${BASE_URL}/ls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: state.host,
          port: parseInt(state.port),
          username: state.username,
          password: state.password,
          path
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch directory contents');
      }

      const files = await response.json();
      let images: FileItem[] = [];

      for (const file of files) {
        if (file.type === 'directory' && file.name !== '.' && file.name !== '..') {
          const subImages = await findImagesRecursively(`${path}/${file.name}`);
          images = [...images, ...subImages];
        } else if (file.type === 'file') {
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
            images.push({
              ...file,
              path: path // Add the path to the file item
            });
          }
        }
      }

      return images;
    } catch (error) {
      console.error('Error scanning directory:', error);
      return [];
    }
  };

  // Gallery handler
  const handleGalleryPress = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const initialPath = PATH_CONFIG.getHomePath(state.username);
      const images = await findImagesRecursively(initialPath);
      
      if (images.length === 0) {
        Alert.alert('No Images', 'No images found in your directory');
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        files: images,
        filteredFiles: images,
        showingGallery: true,
        loading: false,
        viewMode: 'grid' // Force grid view for gallery
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to load gallery');
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Favorites handler
  const handleFavoritesPress = () => {
    setState(prev => ({ ...prev, showingFavorites: !prev.showingFavorites }));
  };

  // Power handler
  const handlePowerPress = () => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      status: 'Disconnected',
      files: [],
      currentPath: '',
      selectedFile: null,
      searchQuery: ''
    }));
  };

  // Render file item
  const renderFileItem = ({ item }: { item: FileItem }) => {
    const handlePress = () => {
      handlers.handleFileOpen(item);
    };

    const handleLongPress = () => {
      setState(prev => ({ 
        ...prev, 
        selectedFile: item,
        showActionModal: true 
      }));
    };

    if (state.viewMode === 'list') {
      return (
        <TouchableOpacity 
          style={styles.fileItem}
          onPress={handlePress}
          onLongPress={handleLongPress}
        >
          <View style={styles.fileIconContainer}>
            {item.type === 'directory' ? (
              <View style={styles.listFolderIcon} />
            ) : (
              <Text style={styles.fileIcon}>
                {getFileIcon(item)}
              </Text>
            )}
          </View>
          <View style={styles.fileDetailsContainer}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.modified && (
              <Text style={styles.fileMetaText}>
                {formatDate(item.modified)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    // Grid view
    return (
      <TouchableOpacity 
        style={styles.gridItem}
        onPress={handlePress}
        onLongPress={handleLongPress}
      >
        <View style={styles.gridIconContainer}>
          {item.type === 'directory' ? (
            <View style={styles.folderIcon} />
          ) : (
            <Text style={styles.fileIcon}>
              {getFileIcon(item)}
            </Text>
          )}
        </View>
        <Text 
          style={styles.gridFileName}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };




const renderLoginScreen = () => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={{ flex: 1 }}
    keyboardVerticalOffset={100}
  >
    <ScrollView 
      contentContainerStyle={{ 
        flexGrow: 1,
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20
      }}
    >
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appTitle}>SFTP Client</Text>
      <TextInput
        style={styles.input}
        placeholder="Host (IP address)"
        placeholderTextColor="#999"
        value={state.host}
        onChangeText={(text) => setState(prev => ({ ...prev, host: text }))}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Port (default: 3003)"
        placeholderTextColor="#999"
        value={state.port}
        onChangeText={(text) => setState(prev => ({ ...prev, port: text }))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        value={state.username}
        onChangeText={(text) => setState(prev => ({ ...prev, username: text }))}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {/* Password field with view toggle */}
      <View style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        width: '100%',
        marginBottom: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        height: 40
      }}>
        <TextInput
          style={{
            flex: 1,
            paddingHorizontal: 10,
            height: 40,
          }}
          placeholder="Password"
          placeholderTextColor="#999"
          value={state.password}
          onChangeText={(text) => setState(prev => ({ ...prev, password: text }))}
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity 
          style={{
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          <Text style={{fontSize: 20}}>
            {passwordVisible ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleConnect}
      >
        <Text style={styles.buttonText}>Connect</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
);





  
// Modifications to AppMain.tsx to better utilize the full screen space

// 1. Remove the BottomNavigation component entirely
// Delete this import:
// import { BottomNavigation } from './BottomNavigation';

// 2. Replace the renderFileManager function with this updated version that uses the full screen

const renderFileManager = () => (
  <View style={[styles.fileManagerContainer, { flex: 1, paddingTop:0, paddingBottom: 0, marginBottom: 0, marginTop:0 }]}>


        <View style={[styles.headerContainer, { 
      paddingVertical: 2, 
      marginTop: 0,
      marginBottom: 0,
              flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    }]}>
      {state.showingGallery ? (
        // Back button when in gallery mode
        <TouchableOpacity 
          onPress={async () => {
            setState(prev => ({ ...prev, loading: true }));
            await fetchDirectoryContents(state.currentPath);
            setState(prev => ({ 
              ...prev, 
              showingGallery: false,
              loading: false,
              viewMode: 'list' // Reset to list view
            }));
          }}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonIcon}>←</Text>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
      ) : (
        // Normal account header
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.username}>
            <Text style={styles.usernameAccount}>{state.username}</Text>
            <Text> Account</Text>
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Header Shortcut Component */}
      <HeaderShortcut 
        onGalleryPress={handleGalleryPress}
        onSharePress={() => Alert.alert('Coming Soon', 'This feature is under development')}
        onVaultPress={() => Alert.alert('Coming Soon', 'This feature is under development')}
        onFavoritesPress={handleFavoritesPress}
        onPowerPress={handlePowerPress}
      />
      
      <View style={styles.headerButtons}>
        {!state.showingGallery && (
          <>
            {/* Three dots menu for view/sort options */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                Alert.alert(
                  'View Options',
                  'Choose an option',
                  [
                    {
                      text: 'Grid View',
                      onPress: () => setState(prev => ({ ...prev, viewMode: 'grid' })),
                      style: state.viewMode === 'grid' ? 'default' : 'plain'
                    },
                    {
                      text: 'List View',
                      onPress: () => setState(prev => ({ ...prev, viewMode: 'list' })),
                      style: state.viewMode === 'list' ? 'default' : 'plain'
                    },
                    { text: '──────────────', disabled: true },
                    {
                      text: `Sort by Name ${state.sortBy === 'name' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}`,
                      onPress: () => setState(prev => ({
                        ...prev,
                        sortBy: 'name',
                        sortOrder: prev.sortBy === 'name' ? (prev.sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      }))
                    },
                    {
                      text: `Sort by Date ${state.sortBy === 'date' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}`,
                      onPress: () => setState(prev => ({
                        ...prev,
                        sortBy: 'date',
                        sortOrder: prev.sortBy === 'date' ? (prev.sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      }))
                    },
                    {
                      text: `Sort by Type ${state.sortBy === 'type' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}`,
                      onPress: () => setState(prev => ({
                        ...prev,
                        sortBy: 'type',
                        sortOrder: prev.sortBy === 'type' ? (prev.sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      }))
                    },
                    {
                      text: `Sort by Size ${state.sortBy === 'size' ? (state.sortOrder === 'asc' ? '↑' : '↓') : ''}`,
                      onPress: () => setState(prev => ({
                        ...prev,
                        sortBy: 'size',
                        sortOrder: prev.sortBy === 'size' ? (prev.sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                      }))
                    },
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    }
                  ]
                );
              }}
            >
              <Text style={styles.headerButtonIcon}>⋮</Text>
            </TouchableOpacity>

            {/* Home button */}
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={async () => {
                try {
                  const homePath = PATH_CONFIG.getHomePath(state.username);
                  setState(prev => ({ ...prev, showingFavorites: false }));
                  await fetchDirectoryContents(homePath);
                } catch (error) {
                  console.error('Error navigating to home:', error);
                  Alert.alert('Error', 'Failed to navigate to home directory');
                }
              }}
            >
              <Text style={styles.headerButtonIcon}>🏠</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>

    {/* Settings Menu and Overlay */}
    {isMenuOpen && (
      <>
        <Animated.View 
          style={[
            styles.sideMenu,
            {
              transform: [{ translateX: menuAnimation }],
            },
          ]}
        >
          <SettingsMenu onClose={() => setIsMenuOpen(false)} />
        </Animated.View>

        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={0.5}
          onPress={toggleMenu}
        />
      </>
    )}

    {!state.showingGallery && (
      <>
        <SortingHeader
          sortBy={state.sortBy}
          sortOrder={state.sortOrder}
          viewMode={state.viewMode}
          onSortChange={(newSortBy, newSortOrder) => {
            setState(prev => ({
              ...prev,
              sortBy: newSortBy,
              sortOrder: newSortOrder
            }));
          }}
          onViewChange={(newView) => {
            setState(prev => ({
              ...prev,
              viewMode: newView
            }));
          }}
        />

        <View style={styles.header}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search files..."
            placeholderTextColor="#999"
            value={state.searchQuery}
            onChangeText={(text) => setState(prev => ({ ...prev, searchQuery: text }))}
            clearButtonMode="while-editing"
          />
        </View>

        <Text style={styles.pathText}>
          {state.currentPath}
        </Text>
      </>
    )}

    {state.loading ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    ) : (
      <FlatList
        data={state.showingFavorites ? state.favorites : state.filteredFiles}
        renderItem={renderFileItem}
        keyExtractor={item => `${item.name}-${item.type}-${item.path || ''}`}
        numColumns={state.viewMode === 'grid' ? 3 : 1}
        key={state.viewMode}
        contentContainerStyle={[
          state.viewMode === 'grid' ? styles.gridContainer : styles.listContainer,
          { 
            flexGrow:1,
            paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0
           } // Add padding at the bottom to ensure content isn't hidden by FAB
        ]}
        style={[
          styles.fileList,
          { flex: 1, 
          marginTop: 0, 
          marginBottom: 0,
                    paddingTop: 0,
          paddingBottom: 0
           } // Make sure the list takes all available space
        ]}
        refreshControl={
          <RefreshControl
            refreshing={state.refreshing}
            onRefresh={() => state.showingGallery ? handleGalleryPress() : fetchDirectoryContents(state.currentPath)}
          />
        }
      />
    )}

    {state.viewMode === 'grid' && !state.showingGallery && (
      <Text style={styles.folderCountText}>
        {state.files.filter(f => f.type === 'directory').length} Folders, {state.files.filter(f => f.type === 'file').length} Files
      </Text>
    )}

    {!state.showingGallery && (
      <FloatingActionButton
        onUpload={handlers.handleUploadPress}
        onNewFile={handlers.handleNewFilePress}
        onNewFolder={handlers.handleNewFolderPress}
      />
    )}
  </View>
);
  // Main render
  return (
      <SafeAreaView style={[
    styles.container, 
    { 
      flex: 1, 
      paddingTop: 0, 
      margin: 0,
      padding:0,
      marginTop: 0,
      paddingBottom: 0,
      marginBottom: 0 
    }
  ]}>
      {!state.isConnected ? renderLoginScreen() : renderFileManager()}
      
      {/* Add menu overlay */}
      {isMenuOpen && (
        <TouchableOpacity
          style={styles.menuOverlay}
          onPress={toggleMenu}
        />
      )}
      
      <FileActionModal
        visible={state.showActionModal}
        selectedFile={state.selectedFile}
        onClose={() => setState(prev => ({ ...prev, showActionModal: false }))}
        handlers={{
          ...handlers,
          handleToggleFavorite
        }}
        isFavorite={
          state.selectedFile 
            ? state.favorites.some(f => 
                f.name === state.selectedFile.name && 
                f.path === state.currentPath
              ) 
            : false
        }
      />
      <FileContentModal
        visible={state.showFileContent}
        selectedFile={state.selectedFile}
        fileContent={state.fileContent}
        onClose={() => setState(prev => ({ ...prev, showFileContent: false }))}
        onSave={(content) => {
          handlers.handleSaveFile(content);
        }}
      />
      <ImageViewerModal
        visible={state.showImageViewer}
        imageUrl={state.imageUrl}
        BASE_URL={BASE_URL}
        host={state.host}
        port={state.port}
        username={state.username}
        password={state.password}
        onClose={() => setState(prev => ({ ...prev, showImageViewer: false }))}
      />
      <RenameModal
        visible={state.showRenameModal}
        selectedFile={state.selectedFile}
        newFileName={state.newFileName}
        onNameChange={(text) => setState(prev => ({ ...prev, newFileName: text }))}
        onConfirm={handlers.confirmRename}
        onClose={() => setState(prev => ({ ...prev, showRenameModal: false }))}
      />
    </SafeAreaView>
  );
};

export default AppMain;