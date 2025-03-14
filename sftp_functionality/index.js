
import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler';
import React from 'react';
import AppMain from './lockit_files/src/AppMain';
import {name as appName} from './app.json';
import { SettingsProvider } from './lockit_files/src/settings/contexts/SettingsContext';

// Create a wrapper component to provide settings
const App = () => (
  <SettingsProvider>
    <AppMain />
  </SettingsProvider>
);

// Register the wrapper component instead of AppMain directly
AppRegistry.registerComponent(appName, () => App);