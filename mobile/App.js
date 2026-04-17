import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Theme } from './src/theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Placeholder Screens (will implement in next steps)
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import RewardsScreen from './src/screens/RewardsScreen';

import PersonnelScreen from './src/screens/PersonnelScreen';
import CampaignsScreen from './src/screens/CampaignsScreen';
import TreasuryScreen from './src/screens/TreasuryScreen';
import ProtocolScreen from './src/screens/ProtocolScreen';
import InvitationScreen from './src/screens/InvitationScreen';
import CreateCampaignScreen from './src/screens/CreateCampaignScreen';
import CreateProtocolScreen from './src/screens/CreateProtocolScreen';
import OrganizationRegistryScreen from './src/screens/OrganizationRegistryScreen';
import ActivityLogScreen from './src/screens/ActivityLogScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setInitialRoute('Dashboard');
        }
      } catch (e) {
        console.error('Failed to check auth state', e);
      } finally {
        setIsReady(true);
      }
    };
    checkAuthStatus();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.background }}>
        <ActivityIndicator size="large" color={Theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={{
        dark: false,
        colors: {
          primary: Theme.primary,
          background: Theme.background,
          card: Theme.background,
          text: Theme.text,
          border: Theme.border,
          notification: Theme.primary,
        }
      }}>
        <StatusBar style="dark" />
        <Stack.Navigator 
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: Theme.background }
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Scanner" component={ScannerScreen} />
          <Stack.Screen name="Rewards" component={RewardsScreen} />
          <Stack.Screen name="Personnel" component={PersonnelScreen} />
          <Stack.Screen name="Campaigns" component={CampaignsScreen} />
          <Stack.Screen name="Treasury" component={TreasuryScreen} />
          <Stack.Screen name="Protocols" component={ProtocolScreen} />
          <Stack.Screen name="Invitation" component={InvitationScreen} />
          <Stack.Screen name="CreateCampaign" component={CreateCampaignScreen} />
          <Stack.Screen name="CreateProtocol" component={CreateProtocolScreen} />
          <Stack.Screen name="Organizations" component={OrganizationRegistryScreen} />
          <Stack.Screen name="Activity" component={ActivityLogScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
