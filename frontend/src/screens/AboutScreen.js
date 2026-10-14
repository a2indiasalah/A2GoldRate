import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  SUPPORT_EMAIL,
  COMPANY_NAME,
  COMPANY_WEBSITE,
} from "../constants/appInfo";

// Reached from the drawer's "ABOUT" > "About this app" row. Registered
// as a Stack.Screen (see App.js) rather than a Drawer.Screen so it opens
// as a normal pushed screen with a back button, instead of becoming a
// permanent entry in the side menu.
export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* Custom header — the root Stack hides its default header
          (screenOptions: { headerShown: false } in App.js), so each
          screen that needs one builds its own, same as TabNavigator does. */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About this app</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="diamond" size={48} color="#D4AF37" />
        </View>

        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>

        <Text style={styles.description}>{APP_DESCRIPTION}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>DEVELOPED BY</Text>
        <Text style={styles.rowText}>{COMPANY_NAME}</Text>

        <TouchableOpacity
          onPress={() => Linking.openURL(COMPANY_WEBSITE)}
          style={styles.linkRow}
        >
          <Ionicons name="globe-outline" size={18} color="#D4AF37" />
          <Text style={styles.linkText}>{COMPANY_WEBSITE}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          style={styles.linkRow}
        >
          <Ionicons name="mail-outline" size={18} color="#D4AF37" />
          <Text style={styles.linkText}>{SUPPORT_EMAIL}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.footerText}>
          © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111111" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#111111",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: { width: 40, alignItems: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  content: { padding: 24, alignItems: "center" },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  appName: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  version: { color: "#888888", fontSize: 13, marginTop: 4, marginBottom: 20 },
  description: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#2A2A2A",
    marginVertical: 16,
  },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  rowText: { color: "#FFFFFF", fontSize: 15, marginBottom: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  linkText: { color: "#D4AF37", fontSize: 14, marginLeft: 8 },
  footerText: { color: "#666666", fontSize: 12, textAlign: "center" },
});