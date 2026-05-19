import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { C } from './src/constants/colors';

import LandingScreen  from './src/screens/LandingScreen';
import ChatScreen     from './src/screens/ChatScreen';
import MapScreen      from './src/screens/MapScreen';
import BookingScreen  from './src/screens/BookingScreen';
import ProfileScreen  from './src/screens/ProfileScreen';
import ResultScreen   from './src/screens/ResultScreen';
import ProviderScreen from './src/screens/ProviderScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import DisputeScreen  from './src/screens/DisputeScreen';
import TabBar         from './src/components/TabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Landing"  component={LandingScreen} />
      <Tab.Screen name="Chat"     component={ChatScreen}    />
      <Tab.Screen name="Map"      component={MapScreen}     />
      <Tab.Screen name="Booking"  component={BookingScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: C.bgDeep }}>
          <StatusBar style="light" translucent />
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                background: C.bgDeep,
                card: C.bgDeep,
                text: C.textPrimary,
                border: 'transparent',
                primary: C.primary,
              },
            }}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen name="ResultScreen" component={ResultScreen} />
              <Stack.Screen name="ProviderScreen" component={ProviderScreen} />
              <Stack.Screen name="TrackingScreen" component={TrackingScreen} />
              <Stack.Screen name="DisputeScreen" component={DisputeScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
