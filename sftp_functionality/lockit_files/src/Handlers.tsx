// Handlers.tsx
import { Alert, Platform, PermissionsAndroid, Share, Clipboard, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import DocumentPicker from 'react-native-document-picker';
import { FileItem } from './Types';

// Helper function to get API URL
const getApiUrl = (state) => `http://${state.host}:3001`;

export const createHandlers = (
  state: any,
  setState: any,
  fetchDirectoryContents: (path: string) => Promise<void>,
  BASE_URL: string
) => ({
  handleConnect: async () => {
    try {
      setState(prev => ({ ...prev, status: `Attempting to connect to ${state.host}...` }));
      const initialPath = `/srv/dev-disk-by-uuid-19d8f6c6-4438-47dc-a6ba-730d2d31cc6c/${state.username}`;
      
      console.log('Making connection request to:', state.host);
      const apiUrl = getApiUrl(state);
      const response = await fetch(`${apiUrl}/connect`, {
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
  },

  handleDisconnect: () => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      status: 'Disconnected',
      files: [],
      currentPath: '',
      selectedFile: null,
      searchQuery: ''
    }));
  },

  handleDownload: async (file: FileItem) => {
    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      const isMedia = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'heic'].includes(fileType || '');
      
      const params = new URLSearchParams({
        path: `${state.currentPath}/${file.name}`,
        host: state.host,
        port: state.port,
        username: state.username,
        password: state.password
      });
      
      const apiUrl = getApiUrl(state);
      const downloadUrl = `${apiUrl}/download?${params.toString()}`;
      console.log('Download URL:', downloadUrl);

      const documentsPath = RNFS.DocumentDirectoryPath;
      const downloadsPath = `${documentsPath}/Downloads`;

      // Ensure Downloads directory exists
      try {
        const exists = await RNFS.exists(downloadsPath);
        if (!exists) {
          await RNFS.mkdir(downloadsPath);
          console.log('Created Downloads directory at:', downloadsPath);
        }
      } catch (dirError) {
        console.error('Error creating directory:', dirError);
        throw new Error('Could not create Downloads folder');
      }

      const localPath = `${downloadsPath}/${file.name}`;
      console.log('Downloading to:', localPath);

      const downloadOptions = {
        fromUrl: downloadUrl,
        toFile: localPath,
        background: true,
        begin: (res: any) => {
          console.log('Download started:', JSON.stringify(res));
          Alert.alert('Downloading', 'File download started...');
        },
        progress: (res: any) => {
          if (res.bytesWritten && res.contentLength) {
            const progress = ((res.bytesWritten / res.contentLength) * 100).toFixed(2);
            console.log(`Download progress: ${progress}%`);
          }
        }
      };

      // Perform the download
      const downloadResult = await RNFS.downloadFile(downloadOptions);
      
      // Validate download result
      if (!downloadResult || !downloadResult.promise) {
        throw new Error('Download initialization failed');
      }

      // Wait for download to complete
      const response = await downloadResult.promise;

      // Check download status
      if (!response || response.statusCode !== 200) {
        throw new Error(`Download failed with status: ${response ? response.statusCode : 'Unknown'}`);
      }

      // Check if file was actually created
      const fileExists = await RNFS.exists(localPath);
      if (!fileExists) {
        throw new Error('Downloaded file not found');
      }

      // Handle media files for camera roll
      if (isMedia) {
        try {
          await CameraRoll.save(localPath, {
            type: 'auto',
            album: 'Downloads'
          });
        } catch (mediaError) {
          console.warn('Could not save to camera roll:', mediaError);
        }
      }

      // Success alert
      Alert.alert(
        'Download Complete', 
        'File downloaded to the app\'s Downloads folder.\n\nYou can find it in:\nFiles app > On My iPhone > Your App Name > Downloads',
        [
          {
            text: 'OK',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('shareddocuments://');
              }
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('FULL Download Error:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
      }

      // User-friendly error alert
      Alert.alert(
        'Download Error', 
        `Failed to download file: ${error.message || 'Unknown error occurred'}`,
        [{ text: 'OK' }]
      );
    }
  },

  handleUploadPress: async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Storage permission denied');
        }
      }

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      const file = result[0];
      const fileContent = await RNFS.readFile(file.uri, 'base64');
      
      Alert.alert('Uploading', 'File upload started...');
      const apiUrl = getApiUrl(state);

      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: state.host,
          port: parseInt(state.port),
          username: state.username,
          password: state.password,
          path: `${state.currentPath}/${file.name}`,
          content: fileContent
        })
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await fetchDirectoryContents(state.currentPath);
      Alert.alert('Success', 'File uploaded successfully');
    } catch (error: any) {
      if (DocumentPicker.isCancel(error)) {
        return;
      }
      console.error('Upload error:', error);
      Alert.alert('Error', `Failed to upload: ${error.message}`);
    }
  },

  handleNewFilePress: () => {
    Alert.prompt(
      'Create New File',
      'Enter file name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (fileName?: string) => {
            if (!fileName) return;
            
            try {
              const apiUrl = getApiUrl(state);
              console.log(`Creating new file at: ${apiUrl}/create`);
              
              const response = await fetch(`${apiUrl}/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  host: state.host,
                  port: parseInt(state.port),
                  username: state.username,
                  password: state.password,
                  path: `${state.currentPath}/${fileName}`,
                  type: 'file',
                  content: ''
                })
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('Create file error:', errorText);
                throw new Error('Failed to create file');
              }

              await fetchDirectoryContents(state.currentPath);
              Alert.alert('Success', `File "${fileName}" created successfully`);
            } catch (error: any) {
              Alert.alert('Error', `Failed to create file: ${error.message}`);
            }
          }
        }
      ],
      'plain-text'
    );
  },

  handleCopyTo: async (file: FileItem) => {
    try {
      Alert.prompt(
        'Copy To',
        'Enter destination path:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Copy',
            onPress: async (destinationPath?: string) => {
              if (!destinationPath) return;
              
              // Ensure paths start with /
              const sourcePath = state.currentPath.startsWith('/') 
                ? `${state.currentPath}/${file.name}`
                : `/${state.currentPath}/${file.name}`;
                
              const fullDestPath = destinationPath.startsWith('/')
                ? `${destinationPath}/${file.name}`
                : `/${destinationPath}/${file.name}`;
              
              console.log('Copying file:', {
                sourcePath,
                fullDestPath
              });

              // Show loading indicator
              Alert.alert('Copying', 'File copy in progress...');
              
              const apiUrl = getApiUrl(state);
              const response = await fetch(`${apiUrl}/copy`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  host: state.host,
                  port: parseInt(state.port),
                  username: state.username,
                  password: state.password,
                  sourcePath,
                  destinationPath: fullDestPath
                })
              });

              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.error || 'Failed to copy file');
              }

              Alert.alert('Success', `File copied to ${destinationPath}`);
              await fetchDirectoryContents(state.currentPath);
            }
          }
        ],
        'plain-text',
        state.currentPath // default value
      );
    } catch (error: any) {
      console.error('Copy error:', error);
      Alert.alert('Error', `Failed to copy file: ${error.message}`);
    }
  },

  handleMoveTo: async (file: FileItem) => {
    try {
      Alert.prompt(
        'Move To',
        'Enter destination path:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Move',
            onPress: async (destinationPath?: string) => {
              if (!destinationPath) return;
              
              // Ensure paths start with /
              const sourcePath = state.currentPath.startsWith('/') 
                ? `${state.currentPath}/${file.name}`
                : `/${state.currentPath}/${file.name}`;
                
              const fullDestPath = destinationPath.startsWith('/')
                ? `${destinationPath}/${file.name}`
                : `/${destinationPath}/${file.name}`;
              
              console.log('Moving file:', {
                sourcePath,
                fullDestPath
              });

              // Show loading indicator
              Alert.alert('Moving', 'File move in progress...');
              
              const apiUrl = getApiUrl(state);
              const response = await fetch(`${apiUrl}/move`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  host: state.host,
                  port: parseInt(state.port),
                  username: state.username,
                  password: state.password,
                  sourcePath,
                  destinationPath: fullDestPath
                })
              });

              const data = await response.json();
              
              if (!response.ok) {
                throw new Error(data.error || 'Failed to move file');
              }

              Alert.alert('Success', `File moved to ${destinationPath}`);
              await fetchDirectoryContents(state.currentPath);
            }
          }
        ],
        'plain-text',
        state.currentPath // default value
      );
    } catch (error: any) {
      console.error('Move error:', error);
      Alert.alert('Error', `Failed to move file: ${error.message}`);
    }
  },

  handleNewFolderPress: () => {
    Alert.prompt(
      'Create New Folder',
      'Enter folder name:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (folderName?: string) => {
            if (!folderName) return;
            
            try {
              const apiUrl = getApiUrl(state);
              const response = await fetch(`${apiUrl}/create`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  host: state.host,
                  port: parseInt(state.port),
                  username: state.username,
                  password: state.password,
                  path: `${state.currentPath}/${folderName}`,
                  type: 'directory'
                })
              });

              if (!response.ok) {
                throw new Error('Failed to create folder');
              }

              await fetchDirectoryContents(state.currentPath);
              Alert.alert('Success', `Folder "${folderName}" created successfully`);
            } catch (error: any) {
              Alert.alert('Error', `Failed to create folder: ${error.message}`);
            }
          }
        }
      ],
      'plain-text'
    );
  },

  handleShare: async (file: FileItem) => {
    try {
      await Share.share({
        title: file.name,
        message: `${state.currentPath}/${file.name}`,
      });
    } catch (error: any) {
      Alert.alert('Error', 'Failed to share file');
    }
  },

  handleCopyPath: (file: FileItem) => {
    const fullPath = `${state.currentPath}/${file.name}`;
    Clipboard.setString(fullPath);
    Alert.alert('Success', 'Path copied to clipboard');
  },

  handleFileInfo: (file: FileItem) => {
    Alert.alert(
      'File Information',
      `Name: ${file.name}\nType: ${file.type}\nSize: ${file.size || 'N/A'}\nModified: ${file.modified || 'N/A'}\nPath: ${state.currentPath}/${file.name}`
    );
  },

  handleDelete: async (file: FileItem) => {
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete ${file.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const fullPath = `${state.currentPath}/${file.name}`.replace(/\/+/g, '/');
              const apiUrl = getApiUrl(state);
              
              console.log(`Deleting file: ${fullPath} via ${apiUrl}/delete`);
              const response = await fetch(`${apiUrl}/delete`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  host: state.host,
                  port: parseInt(state.port),
                  username: state.username,
                  password: state.password,
                  path: fullPath,
                  type: file.type
                })
              });

              console.log('Delete response status:', response.status);
              
              if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete error response:', errorText);
                throw new Error('Failed to delete');
              }

              await fetchDirectoryContents(state.currentPath);
              Alert.alert('Success', `${file.name} deleted successfully`);
            } catch (error: any) {
              console.error('Delete operation error:', error);
              Alert.alert('Error', `Failed to delete: ${error.message}`);
            }
          }
        }
      ]
    );
  },

handleRename: async (file: FileItem) => {
  console.log('Rename initiated for file:', file.name);
  setState(prev => ({
    ...prev,
    selectedFile: file,
    newFileName: file.name,
    showRenameModal: true
  }));
},

confirmRename: async () => {
  if (!state.selectedFile || !state.newFileName) {
    console.error('Cannot rename: missing file or name');
    return;
  }
  
  console.log('Confirming rename from', state.selectedFile.name, 'to', state.newFileName);
  
  try {
    const oldPath = `${state.currentPath}/${state.selectedFile.name}`;
    const newPath = `${state.currentPath}/${state.newFileName}`;
    
    const apiUrl = `http://${state.host}:3001`;
    console.log(`Renaming file from ${oldPath} to ${newPath} via ${apiUrl}/rename`);
    
    const response = await fetch(`${apiUrl}/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: state.host,
        port: parseInt(state.port),
        username: state.username,
        password: state.password,
        oldPath,
        newPath
      })
    });

    console.log('Rename response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rename error response:', errorText);
      throw new Error('Failed to rename file');
    }

    await fetchDirectoryContents(state.currentPath);
    setState(prev => ({ ...prev, showRenameModal: false }));
    Alert.alert('Success', `Renamed to "${state.newFileName}"`);
  } catch (error: any) {
    console.error('Rename operation error:', error);
    
      Alert.alert('Error', `Failed to rename: ${error.message}`);
    }
  },

  handleDuplicate: async (file: FileItem) => {
    try {
      const baseName = file.name;
      const extension = baseName.includes('.') ? baseName.split('.').pop() : '';
      const nameWithoutExt = baseName.includes('.') ? baseName.substring(0, baseName.lastIndexOf('.')) : baseName;
      const newFileName = `${nameWithoutExt}_copy${extension ? '.' + extension : ''}`;
      const apiUrl = getApiUrl(state);

      // For text files, we need to get the content first
      if (file.type === 'file') {
        console.log(`Getting content for duplication via ${apiUrl}/open`);
        const response = await fetch(`${apiUrl}/open`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: state.host,
            port: parseInt(state.port),
            username: state.username,
            password: state.password,
            path: `${state.currentPath}/${file.name}`
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error getting file content for duplication:', errorText);
          throw new Error('Failed to read file content');
        }

        const content = await response.text();
        console.log(`Creating duplicate file via ${apiUrl}/create`);

        // Create the duplicate file with the same content
        const createResponse = await fetch(`${apiUrl}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: state.host,
            port: parseInt(state.port),
            username: state.username,
            password: state.password,
            path: `${state.currentPath}/${newFileName}`,
            type: 'file',
            content: content
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('Error creating duplicate file:', errorText);
          throw new Error('Failed to create duplicate file');
        }
      } else {
        // For directories
        console.log(`Creating duplicate directory via ${apiUrl}/create`);
        const createResponse = await fetch(`${apiUrl}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: state.host,
            port: parseInt(state.port),
            username: state.username,
            password: state.password,
            path: `${state.currentPath}/${newFileName}`,
            type: 'directory'
          })
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('Error creating duplicate directory:', errorText);
          throw new Error('Failed to create duplicate directory');
        }
      }

      await fetchDirectoryContents(state.currentPath);
      Alert.alert('Success', `Created duplicate: ${newFileName}`);
    } catch (error: any) {
      console.error('Duplication error:', error);
      Alert.alert('Error', `Failed to duplicate: ${error.message}`);
    }
  },

  handleEdit: async (file: FileItem) => {
    if (file.type === 'file') {
      try {
        const apiUrl = getApiUrl(state);
        console.log(`Editing file via ${apiUrl}/open`);
        
        const response = await fetch(`${apiUrl}/open`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: state.host,
            port: parseInt(state.port),
            username: state.username,
            password: state.password,
            path: `${state.currentPath}/${file.name}`
          })
        });

        console.log('Edit file response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error opening file for edit:', errorText);
          throw new Error('Failed to open file');
        }

        const content = await response.text();
        setState(prev => ({
          ...prev,
          selectedFile: file,
          fileContent: content,
          showFileContent: true
        }));
      } catch (error: any) {
        console.error('Edit operation error:', error);
        Alert.alert('Error', `Failed to edit file: ${error.message}`);
      }
    }
  },

  handleFileOpen: async (file: FileItem) => {
    console.log('handleFileOpen called with file:', JSON.stringify(file));
    
    if (file.type === 'directory') {
      console.log('Navigating to directory:', file.name);
      await fetchDirectoryContents(`${state.currentPath}/${file.name}`);
      return;
    }

    try {
      console.log('Attempting to open file:', file.name);
      console.log('Current path:', state.currentPath);
      console.log('Current connection state:', {
        host: state.host,
        port: state.port,
        username: state.username,
        hasPassword: !!state.password
      });
      
      const fileType = file.name.split('.').pop()?.toLowerCase();
      console.log('File type detected:', fileType);
      
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      const textTypes = ['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'xml', 'yaml', 'yml', 'ini', 'conf', 'sh', 'bash', 'log'];
      
      // Use the helper function for consistent URL
      const apiUrl = getApiUrl(state);
      
      if (imageTypes.includes(fileType || '')) {
        console.log('Handling as image file');
        const fullPath = `${state.currentPath}/${file.name}`.replace(/\/+/g, '/');
        console.log('Full image path:', fullPath);
        
        // Add this to check if the file exists first
        try {
          console.log('Verifying file exists before showing viewer');
          const checkResponse = await fetch(`${apiUrl}/open`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              host: state.host,
              port: parseInt(state.port),
              username: state.username,
              password: state.password,
              path: fullPath
            })
          });
          
          if (!checkResponse.ok) {
            console.error('File existence check failed:', await checkResponse.text());
            throw new Error('Unable to access image file');
          }
          
          console.log('File exists, showing image viewer');
        } catch (checkError) {
          console.error('Error checking file:', checkError);
          // Continue anyway to see if image viewer can handle it
        }
        
        setState(prev => ({
          ...prev,
          imageUrl: fullPath,
          showImageViewer: true
        }));
        console.log('Image viewer opened with URL:', fullPath);
      } 
      else if (textTypes.includes(fileType || '')) {
        console.log('Handling as text file:', file.name);
        const fullPath = `${state.currentPath}/${file.name}`.replace(/\/+/g, '/');
        console.log('Full text file path:', fullPath);
        
        console.log('Fetching text file content from server');
        const response = await fetch(`${apiUrl}/open`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: state.host,
            port: parseInt(state.port),
            username: state.username,
            password: state.password,
            path: fullPath
          })
        });

        console.log('Server response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error opening text file:', errorText);
          throw new Error(`Failed to open file: ${errorText}`);
        }

        console.log('Reading response content');
        const content = await response.text();
        console.log('Content received, length:', content.length);
        
        setState(prev => ({
          ...prev,
          selectedFile: file,
          fileContent: content,
          showFileContent: true
        }));
        console.log('Text viewer opened successfully');
      }
      else {
        console.log('Unsupported file type, showing actions dialog');
        Alert.alert(
          'File Action',
          'What would you like to do with this file?',
          [
            {
              text: 'Download',
              onPress: () => {
                console.log('Download option selected');
                this.handleDownload(file);
              }
            },
            {
              text: 'Share',
              onPress: () => {
                console.log('Share option selected');
                this.handleShare(file);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error in handleFileOpen:', error);
      console.error('Error stack:', error.stack);
      Alert.alert('Error', `Failed to open file: ${error.message}`);
    }
  },

  handleSaveFile: async (content: string) => {
    if (!state.selectedFile) {
      Alert.alert('Error', 'No file selected');
      return;
    }
    
    try {
      console.log('Saving file:', state.selectedFile.name);
      const apiUrl = getApiUrl(state);
      console.log(`Saving file via ${apiUrl}/update`);
      
      const response = await fetch(`${apiUrl}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: state.host,
          port: parseInt(state.port),
          username: state.username,
          password: state.password,
          path: `${state.currentPath}/${state.selectedFile.name}`,
          content: content
        })
      });

      console.log('Save response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error saving file:', errorText);
        throw new Error('Failed to save file');
      }

      setState(prev => ({
        ...prev,
        fileContent: content,
        showFileContent: false
      }));
      
      await fetchDirectoryContents(state.currentPath);
      Alert.alert('Success', 'File saved successfully');
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', `Failed to save file: ${error.message}`);
    }
  },
});

export default createHandlers;