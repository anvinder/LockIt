import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Modern Color Palette
const Colors = {
  background: '#F4F6F9',
  primary: '#3B82F6',
  secondary: '#10B981',
  text: {
    dark: '#1F2937',
    medium: '#4B5563',
    light: '#6B7280'
  },
  border: '#E5E7EB',
  white: '#FFFFFF',
  card: '#FFFFFF'
};

export const styles = StyleSheet.create({
  // Global Colors
  colors: Colors,

  // Global Container
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    margin: 0,
    padding: 0,
  },

  // Login Container
  loginContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginTop: 0,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 24,
    borderRadius: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.dark,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.dark,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },

  // File Manager Container
 fileManagerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 0, // Remove top padding
    paddingBottom: 0,
    margin: 0,
    marginTop: 0,
    marginBottom: 0,
  },

  // Header Styles

  username: {
    fontSize: 16,
    color: Colors.text.dark,
  },
  usernameAccount: {
    fontWeight: '600',
    color: Colors.primary,
  },
  // Search Input
header: {
  paddingHorizontal: 8,
  paddingVertical: 2, // Reduced padding
  backgroundColor: Colors.white,
  marginTop: 0, // Remove any margin
  marginBottom: 0,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
searchInput: {
  backgroundColor: Colors.background,
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 6,
  fontSize: 14,
  color: Colors.text.dark,
},
  // Path Text
pathText: {
  fontSize: 10,
  color: Colors.text.medium,
  padding: 2, // Reduced padding
  paddingHorizontal: 8,
  backgroundColor: Colors.background,
},


  // File List Styles
fileList: {
  flex: 1,
  width: '100%',  // Ensure it uses full width
  marginBottom: 0,
},

listContainer: {
  backgroundColor: 'transparent',
  flexGrow: 1,
  paddingBottom: 0, // Add padding to prevent content from being hidden behind FAB
},

  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  fileIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    padding: 2,
  },
  fileIcon: {
    fontSize: 24,
    color: '#5FC9F8',
  },
    safeAreaContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  fileDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  fileMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  fileMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  backButton: {
    color: Colors.primary,
    fontWeight: 'bold',
  },

  // Floating Action Button
fab: {
  position: 'absolute',
  bottom: 10, // Position just above the bottom nav
  right: 24,
  backgroundColor: Colors.primary,
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: Colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 5,
  zIndex: 999,
},
  fabIcon: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '500',
  },

  // Side Menu Styles
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: '100%',
    backgroundColor: Colors.white,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },

  // Sorting Header
  sortingHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sortButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: Colors.text.dark,
  },

searchInput: {
  backgroundColor: Colors.background,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  fontSize: 14,
  color: Colors.text.dark,
},
pathText: {
  fontSize: 10,
  color: Colors.text.medium,
  padding: 4, // Reduced padding
  paddingHorizontal: 12,
  backgroundColor: Colors.background,
},

  container: {
    flex: 1,
    backgroundColor: Colors.background,
      margin: 0,
      padding: 0,
  },
gridContainer: {
  //paddingHorizontal: 16,
  //paddingTop: 16,
  flexGrow: 1,
  paddingBottom: 0, // Add padding to prevent content from being hidden behind FAB
  //backgroundColor: 'transparent',
},
  gridItem: {
    width: (Dimensions.get('window').width - 48) / 3, // Slightly less padding for bigger items
    marginBottom: 24,
    alignItems: 'center',
  },
  gridIconContainer: {
    width: 84,  // Larger icon container
    height: 68, // Maintain aspect ratio
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
     padding: 4,
  },
  folderIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#5AC8F5', // Precise iOS folder blue
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  fileIcon: {
    fontSize: 48, // Larger file icons
    color: '#5FC9F8',
  },
 gridFileName: {
    fontSize: 12,
    color: '#000000', // Changed from '#FFFFFF' to ensure visibility
    textAlign: 'center',
    width: 100,
    marginTop: 4,
    backgroundColor: 'transparent',
  },
  gridDateText: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
  },
folderCountText: {
  fontSize: 13,
  color: '#8E8E93',
  textAlign: 'center',
  padding: 50,
  backgroundColor: 'transparent',
  position: 'absolute',
  bottom: 10, // Position above FAB
  left: 0,
  right: 0,
},
 listFolderIcon: {
    width: 40,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#5AC8F5', // Matching blue
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  // In Styles.tsx, update/add these styles:

headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8, // Reduced from 16
    paddingVertical: 0, // Reduced from 8
    backgroundColor: Colors.white,
    borderBottomWidth: 0,
    zIndex: 100,
    marginTop: 0,
    marginBottom: 0,
},
header: {
  paddingHorizontal: 3,
  paddingVertical: 0, // Reduced padding
  backgroundColor: Colors.white,
  marginTop: 0, // Remove any margin
  marginBottom: 0,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
headerButtons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

headerButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: Colors.background,
  justifyContent: 'center',
  alignItems: 'center',
},

headerButtonIcon: {
  fontSize: 18,
  color: Colors.text.dark,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'flex-end',  // This aligns content to bottom
},
actionButtonPanel: {
  position: 'absolute',
  maxHeight: 250, // Limit maximum height
  overflow: 'visible',
  bottom: 80, // Position above the bottom navigation
  right: 24,
  zIndex: 1000, // Ensure visibility
},

modalContent: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingVertical: 16,
  paddingHorizontal: 16,
  maxHeight: '80%',  // Limits height to 80% of screen
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.7)',
},

actionButton: {
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 8,
  marginBottom: 8,
  backgroundColor: '#F3F4F6',
},
actionButtonText: {
  fontSize: 16,
  color: '#1F2937',
  textAlign: 'center',
},


});

export default styles;