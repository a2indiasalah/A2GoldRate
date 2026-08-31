import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import DeviceConnectScreen from "../screens/DeviceConnectScreen";
import { useDeviceConnection } from "../context/DeviceConnectionContext";

const Tab = createBottomTabNavigator();

// Tabs live inside the Drawer, so opening the drawer means reaching up to
// the parent (Drawer) navigator rather than calling openDrawer() directly.
function DrawerMenuButton({ navigation }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.getParent()?.openDrawer()}
      style={{ paddingHorizontal: 16 }}
    >
      <Ionicons name="menu" size={26} color="#D4AF37" />
    </TouchableOpacity>
  );
}

// Shown in the header of every tab screen — green "Connected" when the
// display is linked up, red "Disconnected" otherwise.
function ConnectionStatusBadge() {
  const { isConnected } = useDeviceConnection();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isConnected ? "#1C3A24" : "#3A1C1C",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        marginRight: 12,
      }}
    >
      <Ionicons
        name={isConnected ? "checkmark-circle" : "close-circle"}
        size={14}
        color={isConnected ? "#2E7D32" : "#C62828"}
        style={{ marginRight: 5 }}
      />
      <Text style={{ color: isConnected ? "#2E7D32" : "#C62828", fontSize: 12, fontWeight: "700" }}>
        {isConnected ? "Connected" : "Disconnected"}
      </Text>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: "#111111" },
        headerTitleStyle: { color: "#FFFFFF" },
        headerLeft: () => <DrawerMenuButton navigation={navigation} />,
        headerRight: () => <ConnectionStatusBadge />,
        tabBarStyle: { backgroundColor: "#1C1C1C", borderTopColor: "#2A2A2A" },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "#888888",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Gold Rates",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="DeviceConnection"
        component={DeviceConnectScreen}
        options={{
          title: "Device Connection",
          tabBarLabel: "Device",
          tabBarIcon: ({ color, size }) => <Ionicons name="wifi" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}