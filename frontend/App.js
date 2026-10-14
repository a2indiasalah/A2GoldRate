import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import TermsScreen from "./src/screens/TermsScreen";
import SplashScreen from "./src/screens/SplashScreen";
import AboutScreen from "./src/screens/AboutScreen";
import IntroScreen from "./src/screens/IntroScreen";
import AdScreen from "./src/screens/AdScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import AddMorePurityScreen from "./src/screens/AddMorePurityScreen";
import DrawerNavigator from "./src/navigation/DrawerNavigator";
import { DeviceConnectionProvider } from "./src/context/DeviceConnectionContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <DeviceConnectionProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Intro" component={IntroScreen} />
            <Stack.Screen name="Ad" component={AdScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AddMorePurity" component={AddMorePurityScreen} />
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen name="About" component={AboutScreen} />
              <Stack.Screen name="Terms" component={TermsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DeviceConnectionProvider>
    </GestureHandlerRootView>
  );
}