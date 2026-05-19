// ═══════════════════════════════════════════════════════
// Karigar AI — App Entry Point
// ═══════════════════════════════════════════════════════
// Sets up React Navigation with stack navigator.
// Routes: HomeScreen → ResultScreen → BookingScreen → TrackingScreen → DisputeScreen → ProviderScreen
// ═══════════════════════════════════════════════════════

import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LandingScreen from "./screens/LandingScreen";
import HomeScreen from "./screens/HomeScreen";
import ResultScreen from "./screens/ResultScreen";
import BookingScreen from "./screens/BookingScreen";
import TrackingScreen from "./screens/TrackingScreen";
import DisputeScreen from "./screens/DisputeScreen";
import ProviderScreen from "./screens/ProviderScreen";

const Stack = createStackNavigator();

export default function App() {
  console.log("[ANTIGRAVITY][APP] Karigar AI v1.0 initializing...");
  console.log(
    "[ANTIGRAVITY][APP] Agent pipeline ready: Intent → Discovery → Matching → Pricing → Booking → Followup"
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="LandingScreen"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: "#0D1B2A" },
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        >
          <Stack.Screen
            name="LandingScreen"
            component={LandingScreen}
            options={{ headerShown: false, animation: 'fade' }}
          />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} />
          <Stack.Screen name="BookingScreen" component={BookingScreen} />
          <Stack.Screen name="TrackingScreen" component={TrackingScreen} />
          <Stack.Screen name="DisputeScreen" component={DisputeScreen} />
          <Stack.Screen name="ProviderScreen" component={ProviderScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
