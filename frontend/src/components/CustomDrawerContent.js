import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ---- Edit these to match your real details ----
const APP_NAME = "Gold Rate App";
const SUPPORT_EMAIL = "yourapp@example.com";
const SUPPORT_PHONE = "+911234567890";
const COMPANY_NAME = "Your Company";
const COMPANY_WEBSITE = "https://example.com";
const APP_VERSION = "1.0.0";
// -------------------------------------------------

function DrawerTextRow({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.textRow} activeOpacity={0.65}>
      <Text style={styles.textRowLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();

  const handleEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Support`);
  };

  const handleReportIssue = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const handleSuggestFeature = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Feature%20Suggestion`);
  };

  const handlePlaceholder = (label) => {
    // TODO: hook these up to real screens/links as you build them out.
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + 26 },
      ]}
    >
      {/* App name header */}
      <Text style={styles.appTitle}>{APP_NAME}</Text>
      <View style={styles.divider} />

      {/* Default drawer items (Home, Settings, etc. from DrawerNavigator) */}
      <DrawerItemList {...props} />

      <View style={styles.sectionGap} />

      {/* Contact Us */}
      <Text style={styles.sectionTitle}>CONTACT US</Text>
      <DrawerTextRow label="Send us an email" onPress={handleEmail} />
      <DrawerTextRow label="Report an issue" onPress={handleReportIssue} />
      <DrawerTextRow label="Suggest a feature" onPress={handleSuggestFeature} />

      {/* About */}
      <View style={styles.sectionGap} />
      <Text style={styles.sectionTitle}>ABOUT</Text>
      <DrawerTextRow
        label="About this app"
        onPress={() => handlePlaceholder("About")}
      />
      <DrawerTextRow
        label="Rate the app"
        onPress={() => handlePlaceholder("Rate the app")}
      />
      <DrawerTextRow
        label="Invite friends"
        onPress={() => handlePlaceholder("Invite friends")}
      />
      <DrawerTextRow
        label="Terms of use and Privacy"
        onPress={() => handlePlaceholder("Terms of use")}
      />
      <View style={styles.textRow}>
        <Text style={styles.versionText}>Current version {APP_VERSION}</Text>
      </View>

      {/* Company links */}
      <View style={styles.sectionGap} />
      <Text style={styles.sectionTitle}>{COMPANY_NAME.toUpperCase()}</Text>
      <DrawerTextRow
        label="Our Website"
        onPress={() => Linking.openURL(COMPANY_WEBSITE)}
      />

      <View style={{ height: 32 }} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: "#1C1C1C",
  },
  appTitle: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginBottom: 8,
  },
  sectionGap: { height: 16 },
  sectionTitle: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  textRow: { paddingVertical: 13, paddingHorizontal: 20 },
  textRowLabel: { color: "#FFFFFF", fontSize: 15 },
  versionText: { color: "#888888", fontSize: 13 },
});