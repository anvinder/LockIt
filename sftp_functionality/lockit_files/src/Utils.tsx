// Utils.tsx
//import { FileItem } from './Types';
import { FileItem, SortCriteria, SortOrder } from './Types';
import { SERVER_CONFIG } from '../../../config'; // Import from central config

// Constants
export const BASE_URL = SERVER_CONFIG.baseUrl;

export const textFileTypes = [
  'txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx', 
  'html', 'css', 'xml', 'yaml', 'yml', 'ini', 'conf',
  'sh', 'bash', 'log', 'env', 'config'
];

export const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

// Type definitions
export type SortCriteria = 'name' | 'date' | 'size';
export type SortOrder = 'asc' | 'desc';


export const sortFiles = (
  files: FileItem[], 
  sortBy: SortCriteria, 
  sortOrder: SortOrder
): FileItem[] => {
  // Always keep '..' at the top if it exists
  const backButton = files.find(file => file.name === '..');
  const filesToSort = files.filter(file => file.name !== '..');

  const sortedFiles = [...filesToSort].sort((a, b) => {
    // First sort by type (directories first)
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }

    // Then sort by the selected criteria
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);

      case 'date':
        const dateA = a.modified ? new Date(a.modified).getTime() : 0;
        const dateB = b.modified ? new Date(b.modified).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;

      case 'size':
        const sizeA = a.size ? parseInt(a.size) : 0;
        const sizeB = b.size ? parseInt(b.size) : 0;
        return sortOrder === 'asc' ? sizeA - sizeB : sizeB - sizeA;

      case 'type':
        const extA = a.name.split('.').pop()?.toLowerCase() || '';
        const extB = b.name.split('.').pop()?.toLowerCase() || '';
        return sortOrder === 'asc' 
          ? extA.localeCompare(extB)
          : extB.localeCompare(extA);

      default:
        return 0;
    }
  });

  // Add back the '..' entry at the beginning if it existed
  return backButton ? [backButton, ...sortedFiles] : sortedFiles;
};




// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};



// Update this function in Utils.tsx

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return the original string if parsing fails
    }
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return dateString; // Return the original string if any error occurs
  }
};





export const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  if (textFileTypes.includes(extension)) return 'text';
  if (imageTypes.includes(extension)) return 'image';
  return 'other';
};

export const isValidFileName = (fileName: string): boolean => {
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  return !invalidChars.test(fileName) && fileName.length > 0 && fileName.length <= 255;
};

export const sanitizePath = (path: string): string => {
  return path.replace(/\/+/g, '/');
};

// Error handling utilities
export const handleError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'An unknown error occurred';
};

// Path manipulation utilities
export const getParentPath = (path: string): string => {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
};

export const joinPaths = (...paths: string[]): string => {
  return sanitizePath(paths.join('/'));
};

export const getFileNameFromPath = (path: string): string => {
  return path.split('/').pop() || '';
};

// Debounce utility
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Deep comparison utility
export const isEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (!a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => isEqual(a[key], b[key]));
};

export default {
  BASE_URL,
  textFileTypes,
  imageTypes,
  sortFiles,
  formatFileSize,
  formatDate,
  getFileType,
  isValidFileName,
  sanitizePath,
  handleError,
  getParentPath,
  joinPaths,
  getFileNameFromPath,
  debounce,
  isEqual
};