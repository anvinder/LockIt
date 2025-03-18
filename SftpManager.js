import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { SFTP_CONFIG, STORAGE_KEYS } from './config'; // Import centralized config


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
    console.log(`CONNECTING TO: ${ip}:${port} with username: ${username}`);
    
    this.connectionStatus = 'connecting';
    this.deviceIp = ip;
    this.username = username;
    this.password = password;
    this.port = port;
    
    // Test connection with a basic ping request
    const pingUrl = `http://${ip}:3001/ping`;
    console.log(`Testing connection with ping to: ${pingUrl}`);
    
    try {
      const pingResponse = await fetch(pingUrl);
      const pingData = await pingResponse.json();
      console.log('Ping response:', pingData);
    } catch (pingError) {
      console.error('Ping test failed:', pingError);
      // Continue anyway to see if the main connection works
    }
    
    // Now try the actual connection
    console.log(`Making connection request to http://${ip}:3001/connect`);
    const response = await fetch(`http://${ip}:3001/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: ip,
        port: parseInt(port),
        username,
        password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Connection failed');
    }

    const data = await response.json();
    console.log('Connection response:', data);

    this.connectionStatus = 'connected';
    this.currentDirectory = `/home/${username}`;
    
    return true;
  } catch (error) {
    console.error('SFTP connection error:', error);
    console.error('Error message:', error.message);
    if (error.cause) console.error('Error cause:', error.cause);
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
      // Use fetch to call the server API running on the Raspberry Pi
      const response = await fetch(`http://${this.deviceIp}:3001/ls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: this.deviceIp,
          port: this.port,
          username: this.username,
          password: this.password,
          path
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to list directory');
      }
      
      // Set current directory
      this.currentDirectory = path;
      
      // Return the directory listing
      return await response.json();
    } catch (error) {
      console.error(`Error listing directory ${path}:`, error);
      throw error;
    }
  }

  // Additional methods for file operations
  async downloadFile(remotePath, localPath) {
    console.log(`Downloading file from ${remotePath} to ${localPath}`);
    
    if (!this.isConnected()) {
      throw new Error('Not connected to SFTP server');
    }
    
    try {
      // Create a URL with query parameters
      const params = new URLSearchParams({
        path: remotePath,
        host: this.deviceIp,
        port: this.port.toString(),
        username: this.username,
        password: this.password
      });
      
      // Use fetch to download the file
      const response = await fetch(`http://${this.deviceIp}:3001/download?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      // Return the response which can be used to save the file
      return response;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  async uploadFile(localPath, remotePath) {
    console.log(`Uploading file from ${localPath} to ${remotePath}`);
    
    if (!this.isConnected()) {
      throw new Error('Not connected to SFTP server');
    }
    
    try {
      // Read the file content
      const content = await fetch(localPath).then(res => res.text());
      
      // Use fetch to upload the file
      const response = await fetch(`http://${this.deviceIp}:3001/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: this.deviceIp,
          port: this.port,
          username: this.username,
          password: this.password,
          path: remotePath,
          content: btoa(content) // Base64 encode the content
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async deleteFile(path) {
    console.log(`Deleting file at ${path}`);
    
    if (!this.isConnected()) {
      throw new Error('Not connected to SFTP server');
    }
    
    try {
      // Determine if it's a file or directory
      const listing = await this.listDirectory(path.substring(0, path.lastIndexOf('/')));
      const item = listing.find(item => item.name === path.split('/').pop());
      
      if (!item) {
        throw new Error('File or directory not found');
      }
      
      // Use fetch to delete the file or directory
      const response = await fetch(`http://${this.deviceIp}:3001/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host: this.deviceIp,
          port: this.port,
          username: this.username,
          password: this.password,
          path,
          type: item.type
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
      
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}

export const sftpManager = new SftpManager();
export default sftpManager;