import CryptoJS from 'crypto-js';

// Service and characteristic UUIDs
const WIFI_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
const SSID_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef1";
const PASSWORD_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef2";
const CONNECT_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef3";

// Encryption key (in a real app, use a secure key exchange method)
const ENCRYPTION_KEY = "LockitHubSecretKey123";

export const configureWifi = async (device, ssid, password) => {
  try {
    // Encrypt the credentials
    const encryptedSSID = CryptoJS.AES.encrypt(ssid, ENCRYPTION_KEY).toString();
    const encryptedPassword = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
    
    console.log('Sending encrypted WiFi credentials to device');
    
    // Send SSID
    await device.writeCharacteristicWithResponseForService(
      WIFI_SERVICE_UUID,
      SSID_CHAR_UUID,
      Buffer.from(encryptedSSID).toString('base64')
    );
    
    // Send password
    await device.writeCharacteristicWithResponseForService(
      WIFI_SERVICE_UUID,
      PASSWORD_CHAR_UUID,
      Buffer.from(encryptedPassword).toString('base64')
    );
    
    // Trigger connection
    await device.writeCharacteristicWithResponseForService(
      WIFI_SERVICE_UUID,
      CONNECT_CHAR_UUID,
      Buffer.from("connect").toString('base64')
    );
    
    return true;
  } catch (error) {
    console.error('Failed to configure WiFi:', error);
    return false;
  }
};