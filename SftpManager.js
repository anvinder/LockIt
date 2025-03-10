import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { SFTP_CONFIG } from './config'; // Import centralized config


class SftpManager {
  constructor() {
    this.connectionStatus = 'disconnected';
    this.currentDirectory = null;
    this.deviceIp = null;
    this.username = SFTP_CONFIG.username;
    this.password = SFTP_CONFIG.password;
    this.port = SFTP_CONFIG.port;
  }


 async connect(ip, username = SFTP_CONFIG.username, password = SFTP_CONFIG.password, port = SFTP_CONFIG.port) {
    try {
      this.connectionStatus = 'connecting';
      this.deviceIp = ip;
      this.username = username;
      this.password = password;
      this.port = port;
      
      console.log(`Connecting to ${ip}:${port} with username: ${username}`);
      
      // Save connection information
      await AsyncStorage.setItem('lastSftpConnection', JSON.stringify({
        ip, username, password, port,
        timestamp: new Date().toISOString()
      }));

      
      
      // In a real implementation, you would establish an actual SFTP connection here
      // For now, we'll simulate a successful connection with a slight delay
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate connection time
      
      this.connectionStatus = 'connected';
      
      // Update the current directory to point to the user's home directory
      this.currentDirectory = `/home/${username}`;
      console.log(`Connected to SFTP at ${ip}:${port}, current directory: ${this.currentDirectory}`);
      
      return true;
    } catch (error) {
      console.error('SFTP connection error:', error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  disconnect() {
    this.connectionStatus = 'disconnected';
    this.currentDirectory = null;
    console.log('Disconnected from SFTP');
    return true;
  }

  isConnected() {
    return this.connectionStatus === 'connected';
  }

  async listDirectory(path = this.currentDirectory) {
    console.log(`Listing directory: ${path}`);
    
    if (!this.isConnected()) {
      throw new Error('Not connected to SFTP server');
    }
    
    try {
      // In a real implementation, you would fetch the directory contents from the SFTP server
      // For now, we'll return mock data based on the requested path
      
      // Set current directory
      this.currentDirectory = path;
      
      // Use the username from the connection for home directory paths
      const homeDir = `/home/${this.username}`;
      
      // Generate different mock data depending on the path
      if (path === homeDir) {
        return [
          {
            name: 'Documents',
            isDirectory: true,
            size: 4096,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'Pictures',
            isDirectory: true,
            size: 4096,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'Downloads',
            isDirectory: true,
            size: 4096,
            lastModified: new Date().toISOString(),
          },
          {
            name: '.bashrc',
            isDirectory: false,
            size: 3771,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'config.txt',
            isDirectory: false,
            size: 1024,
            lastModified: new Date().toISOString(),
          },
        ];
      } else if (path === `${homeDir}/Documents`) {
        return [
          {
            name: 'project',
            isDirectory: true,
            size: 4096,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'notes.txt',
            isDirectory: false,
            size: 2048,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'report.pdf',
            isDirectory: false,
            size: 104857,
            lastModified: new Date().toISOString(),
          },
        ];
      } else if (path === `${homeDir}/Pictures`) {
        return [
          {
            name: 'vacation',
            isDirectory: true,
            size: 4096,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'photo1.jpg',
            isDirectory: false,
            size: 2097152,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'photo2.jpg',
            isDirectory: false,
            size: 3145728,
            lastModified: new Date().toISOString(),
          },
        ];
      } else if (path === `${homeDir}/Downloads`) {
        return [
          {
            name: 'software',
            isDirectory: true,
            size: 4096,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'document.pdf',
            isDirectory: false,
            size: 52428,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'archive.zip',
            isDirectory: false,
            size: 10485760,
            lastModified: new Date().toISOString(),
          },
        ];
      } else {
        // Default directory listing
        return [
          {
            name: 'folder',
            isDirectory: true,
            size: 4096,
            lastModified: new Date().toISOString(),
          },
          {
            name: 'file.txt',
            isDirectory: false,
            size: 1024,
            lastModified: new Date().toISOString(),
          },
        ];
      }
    } catch (error) {
      console.error(`Error listing directory ${path}:`, error);
      throw error;
    }
  }

  // Additional methods for file operations
  async downloadFile(remotePath, localPath) {
    console.log(`Downloading file from ${remotePath} to ${localPath}`);
    // Simulated download
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Download complete: ${remotePath}`);
        resolve(true);
      }, 2000);
    });
  }

  async uploadFile(localPath, remotePath) {
    console.log(`Uploading file from ${localPath} to ${remotePath}`);
    // Simulated upload
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Upload complete: ${remotePath}`);
        resolve(true);
      }, 2000);
    });
  }

  async deleteFile(path) {
    console.log(`Deleting file at ${path}`);
    // Simulated deletion
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`Delete complete: ${path}`);
        resolve(true);
      }, 1000);
    });
  }
}

export const sftpManager = new SftpManager();
export default sftpManager;