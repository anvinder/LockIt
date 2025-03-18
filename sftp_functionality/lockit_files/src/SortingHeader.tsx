import React, { useState } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  Modal,
  StyleSheet
} from 'react-native';
import { SortCriteria, SortOrder } from './Types';

interface SortingHeaderProps {
  sortBy: SortCriteria;
  sortOrder: SortOrder;
  viewMode: 'grid' | 'list';
  onSortChange: (newSortBy: SortCriteria, newSortOrder: SortOrder) => void;
  onViewChange: (newView: 'grid' | 'list') => void;
}

const sortOptions = [
  { label: 'Grid View', value: 'grid', type: 'view' },
  { label: 'List View', value: 'list', type: 'view' },
  { divider: true },
  { label: 'Name', value: 'name', type: 'sort' },
  { label: 'Date Modified', value: 'date', type: 'sort' },
  { label: 'Type', value: 'type', type: 'sort' },
  { label: 'Size', value: 'size', type: 'sort' }
];

export const SortingHeader: React.FC<SortingHeaderProps> = ({ 
  sortBy, 
  sortOrder, 
  viewMode,
  onSortChange, 
  onViewChange 
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleOptionSelect = (option: { label: string, value: string, type?: string }) => {
    if (option.type === 'view') {
      // Ensure the value is either 'grid' or 'list'
      const newView = option.value === 'grid' ? 'grid' : 'list';
      onViewChange(newView);
    } else if (option.type === 'sort') {
      // Handle sorting
      const newOrder = sortBy === option.value ? 
        (sortOrder === 'asc' ? 'desc' : 'asc') : 
        'asc';
      onSortChange(option.value as SortCriteria, newOrder);
    }
    setShowModal(false);
  };

  return (
    <View style={styles.sortingHeader}>
      {/* Removing the + button, empty View will maintain spacing if needed */}
      <View style={styles.spacer} />

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
            {sortOptions.map((option, index) => {
              if (option.divider) {
                return <View key={`divider-${index}`} style={styles.divider} />;
              }
              
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    (option.value === viewMode && option.type === 'view') && styles.modalOptionSelected,
                    (option.value === sortBy && option.type === 'sort') && styles.modalOptionSelected
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    (option.value === viewMode && option.type === 'view') && styles.modalOptionTextSelected,
                    (option.value === sortBy && option.type === 'sort') && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                    {option.value === viewMode && option.type === 'view' && ' ✓'}
                    {option.value === sortBy && option.type === 'sort' && ` ${sortOrder === 'asc' ? '↑' : '↓'}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F4F6F9',
  },
  spacer: {
    width: 36, // Same width as the previous button for consistent spacing
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  modalOptionSelected: {
    backgroundColor: '#F3F4F6',
  },
  modalOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalOptionCancel: {
    marginTop: 10,
  },
  modalOptionCancelText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
});