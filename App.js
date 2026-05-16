// ═══════════════════════════════════════════════════════
// Karigar AI — App Entry Point
// ═══════════════════════════════════════════════════════
// Sets up React Navigation with stack navigator.
// Routes: HomeScreen → ResultScreen
// ═══════════════════════════════════════════════════════

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./screens/HomeScreen";
import ResultScreen from "./screens/ResultScreen";

const Stack = createStackNavigator();

export default function App() {
  console.log("[ANTIGRAVITY][APP] Karigar AI initializing...");
  console.log("[ANTIGRAVITY][APP] Agent pipeline: Intent → Discovery → Matching");

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="HomeScreen"
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
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
