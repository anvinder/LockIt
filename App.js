import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './AppNavigator';

// Ignore specific warnings
LogBox.ignoreLogs(['new NativeEventEmitter']); 

const App = () => {
  return <AppNavigator />;
};

export default App;