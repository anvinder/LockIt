// config.js
// Central configuration for the application

// Add this new section for server configuration
export const SERVER_CONFIG = {
  // This will be dynamically replaced with the device's IP after WiFi configuration
  baseUrl: 'http://{DEVICE_IP}:3001', // Node.js server URL
  port: 3001,
};

// BLE configuration
export const BLE_CONFIG = {
  deviceNamePrefix: 'RP4APS', // Prefix for BLE device names to filter during scanning
  scanTimeout: 10000, // Timeout for BLE scanning in milliseconds
  deviceScanOptions: {
    allowDuplicates: false,
    scanMode: 2, // Android only: 1 = SCAN_MODE_LOW_POWER, 2 = SCAN_MODE_BALANCED, 3 = SCAN_MODE_LOW_LATENCY
    minimumRssi: -85, // Accept devices with signal strength stronger than -85dB
  },
};

// WiFi configuration for Raspberry Pi BLE service
export const WIFI_CONFIG = {
  serviceUuid: '12345678-1234-5678-1234-56789abcdef0',
  ssidCharUuid: '12345678-1234-5678-1234-56789abcdef1',
  passwordCharUuid: '12345678-1234-5678-1234-56789abcdef2',
  connectCharUuid: '12345678-1234-5678-1234-56789abcdef3',
  ipAddressCharUuid: '12345678-1234-5678-1234-56789abcdef4',
};

// SFTP configuration
export const SFTP_CONFIG = {
  username: 'Avi', // Default username for SFTP connection
  password: 'Cognizanceofcontemplation09!!', // Default password for SFTP connection
  port: 3003, // Default port for SFTP connection
  defaultPath: '/home', // Default path for SFTP connection
};

// Default Raspberry Pi SSH configuration
export const SSH_CONFIG = {
  username: 'pi',
  password: 'Cognizanceofcontemplation09!!',
  port: 3003,
};

// AsyncStorage keys
export const STORAGE_KEYS = {
  connectedDevices: 'lockit_connected_devices', // Key for storing connected devices
  lastSftpConnection: 'lockit_last_sftp_connection', // Key for storing last SFTP connection
  deviceIp: '@WiFiConfig:DeviceIP',
  deviceConfigured: '@WiFiConfig:Configured',
};


export const PATH_CONFIG = {
  // Base path for the Raspberry Pi filesystem
  raspiBasePath: '/srv/dev-disk-by-uuid-19d8f6c6-4438-47dc-a6ba-730d2d31cc6c',
  // Function to get home directory path
  getHomePath: (username) => `/srv/dev-disk-by-uuid-19d8f6c6-4438-47dc-a6ba-730d2d31cc6c/${username}`
};


// Export all configs as a single object for convenience
export default {
  SERVER_CONFIG,
  BLE_CONFIG,
  WIFI_CONFIG,
  SFTP_CONFIG,
  SSH_CONFIG,
  STORAGE_KEYS,
  PATH_CONFIG
};