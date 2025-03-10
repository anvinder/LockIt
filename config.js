// config.js
// Central configuration for the application

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
  username: 'pi', // Default username for SFTP connection
  password: 'Cognizanceofcontemplation09!!', // Default password for SFTP connection
  port: 3003, // Default port for SFTP connection
};

// AsyncStorage keys
export const STORAGE_KEYS = {
  connectedDevices: 'lockit_connected_devices', // Key for storing connected devices
  lastSftpConnection: 'lockit_last_sftp_connection', // Key for storing last SFTP connection
};

// Export all configs as a single object for convenience
export default {
  BLE_CONFIG,
  WIFI_CONFIG,
  SFTP_CONFIG,
  STORAGE_KEYS,
};