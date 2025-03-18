// sortingUtils.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size?: string;
  modified?: string;
  path?: string;
  createdAt?: string;
  lastAccessed?: string;
  sizeInBytes?: number;
}

export type SortCriteria = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

export const sortFiles = (
  filesToSort: FileItem[], 
  sortBy: SortCriteria, 
  sortOrder: SortOrder
): FileItem[] => {
  const sortedFiles = [...filesToSort];
  
  // Always keep '..' at the top if it exists
  const backDir = sortedFiles.find(file => file.name === '..');
  const otherFiles = sortedFiles.filter(file => file.name !== '..');
  
  otherFiles.sort((a, b) => {
    // First sort by type (directories first)
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }

    // Then sort by the selected criterion
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      
      case 'date':
        const dateA = new Date(a.modified || '').getTime();
        const dateB = new Date(b.modified || '').getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      
      case 'size':
        const sizeA = parseInt(a.size || '0');
        const sizeB = parseInt(b.size || '0');
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

  // Add back directory back at the top if it existed
  return backDir ? [backDir, ...otherFiles] : otherFiles;
};

interface SortingHeaderProps {
  sortBy: SortCriteria;
  sortOrder: SortOrder;
  onSortChange: (newSortBy: SortCriteria, newSortOrder: SortOrder) => void;
}

interface SortOption {
  label: string;
  value: SortCriteria;
}

const sortOptions: SortOption[] = [
  { label: 'Name', value: 'name' },
  { label: 'Date Modified', value: 'date' },
  { label: 'Size', value: 'size' },
  { label: 'Type', value: 'type' }
];

export const SortingHeader: React.FC<SortingHeaderProps> = ({ 
  sortBy, 
  sortOrder, 
  onSortChange 
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleSortSelect = (criteria: SortCriteria) => {
    const newOrder = sortBy === criteria && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(criteria, newOrder);
    setShowModal(false);
  };

  return (
    <View style={styles.sortingHeader}>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.sortButtonText}>
          Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label} {sortOrder === 'asc' ? '↑' : '↓'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  sortBy === option.value && styles.modalOptionSelected
                ]}
                onPress={() => handleSortSelect(option.value)}
              >
                <Text style={[
                  styles.modalOptionText,
                  sortBy === option.value && styles.modalOptionTextSelected
                ]}>
                  {option.label} {sortBy === option.value && (sortOrder === 'asc' ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalOption, styles.modalOptionCancel]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalOptionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sortingHeader: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sortButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 10,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalOptionCancel: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  modalOptionCancelText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
});