import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import TabNavigator from "./TabNavigator";
import welcomeScreen from "../screens/WelcomeScreen";
import CustomDrawerContent from "../components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#111111" },
        headerTintColor: "#FFFFFF",
        drawerStyle: { backgroundColor: "#1C1C1C" },
        drawerActiveTintColor: "#D4AF37",
        drawerInactiveTintColor: "#CCCCCC",
      }}
    >
      {/* Named "HomeTabs" (not "Home") to avoid a duplicate-name warning —
          the Tab.Screen one level below is also called "Home". TabNavigator
          supplies its own header (with the drawer toggle), so the Drawer's
          header is hidden here to avoid a double header. */}
      <Drawer.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={{
          title: "Home",
          headerShown: false,
          drawerIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={welcomeScreen}
        options={{
           title: "Setting",
          drawerIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
        }}
      />
    </Drawer.Navigator>
  );
}