// AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import HomeScreen from './screens/HomeScreen';
import DevicesScreen from './screens/DevicesScreen';
import SettingsScreen from './screens/SettingsScreen';
import SftpScreen from './screens/SftpScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for Devices screens
const DevicesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DevicesList" component={DevicesScreen} />
    <Stack.Screen name="Sftp" component={SftpScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#AAAAAA',
          tabBarStyle: {
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Devices"
          component={DevicesStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="cellphone-link" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name="cog" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;