import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Placeholder Screens (will implement in next steps)
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import RewardsScreen from './src/screens/RewardsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0a0a0a' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
