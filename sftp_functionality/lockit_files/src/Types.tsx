// Types.tsx
export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size?: string;
  modified?: string;
  path?: string;
}

export type SortCriteria = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface AppState {
  host: string;
  port: string;
  username: string;
  password: string;
  isConnected: boolean;
  status: string;
  currentPath: string;
  files: FileItem[];
  filteredFiles: FileItem[];
  loading: boolean;
  selectedFile: FileItem | null;
  showActionModal: boolean;
  searchQuery: string;
  refreshing: boolean;
  showFileContent: boolean;
  fileContent: string;
  showImageViewer: boolean;
  imageUrl: string;
  isFileOpen: boolean;
  selectedFiles: FileItem[];
  lastTap: number;
  offlineFiles: {[key: string]: FileItem[]};
  isUploading: boolean;
  uploadProgress: number;
  sortBy: SortCriteria;
  sortOrder: SortOrder;
  showRenameModal: boolean;
  newFileName: string;
}