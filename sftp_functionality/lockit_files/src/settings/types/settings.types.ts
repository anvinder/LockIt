// src/settings/types/settings.types.ts
export type ThemeMode = 'light' | 'dark' | 'system';
export type ViewMode = 'compact' | 'comfortable';

export interface DeviceHistory {
  ip: string;
  location: string;
  lastAccess: string;
}

export interface NotificationPreferences {
  uploadNotifications: boolean;
  downloadNotifications: boolean;
  shareNotifications: boolean;
  deleteNotifications: boolean;
  errorAlerts: boolean;
  updateNotifications: boolean;
  sound: boolean;
  vibration: boolean;
  popupAlerts: boolean;
}

export interface DisplayPreferences {
  theme: ThemeMode;
  viewMode: ViewMode;
  showFileExtensions: boolean;
  showHiddenFiles: boolean;
  showFileSize: boolean;
  showLastModified: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  appLockEnabled: boolean;
  pinCode: string | null;
  hideFileInfo: boolean;
  incognitoMode: boolean;
  analyticsEnabled: boolean;
}

export interface StorageSettings {
  bandwidthLimit: number | null;
  autoSync: boolean;
  downloadLocation: string;
  offlineAccess: boolean;
  autoDownloadEnabled: boolean;
  storageQuota: number;
}

export interface Settings {
  username?: string; // Add this for UserProfileSection
  deviceHistory: DeviceHistory[];
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  security: SecuritySettings;
  storage: StorageSettings;
}

export const defaultSettings: Settings = {
  username: '', // Add default username
  deviceHistory: [],
  notifications: {
    uploadNotifications: true,
    downloadNotifications: true,
    shareNotifications: true,
    deleteNotifications: true,
    errorAlerts: true,
    updateNotifications: true,
    sound: true,
    vibration: true,
    popupAlerts: true,
  },
  display: {
    theme: 'system',
    viewMode: 'comfortable',
    showFileExtensions: true,
    showHiddenFiles: false,
    showFileSize: true,
    showLastModified: true,
  },
  security: {
    twoFactorEnabled: false,
    biometricEnabled: false,
    appLockEnabled: false,
    pinCode: null,
    hideFileInfo: false,
    incognitoMode: false,
    analyticsEnabled: true,
  },
  storage: {
    bandwidthLimit: null,
    autoSync: true,
    downloadLocation: 'Downloads',
    offlineAccess: false,
    autoDownloadEnabled: false,
    storageQuota: 1024 * 1024 * 1024, // 1GB default
  },
};