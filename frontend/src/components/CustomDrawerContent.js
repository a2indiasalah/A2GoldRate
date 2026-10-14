import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking,   Platform, Alert } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useLevelEdit } from "../context/LevelEditContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  APP_NAME,
  APP_VERSION,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  COMPANY_NAME,
  COMPANY_WEBSITE,
  ANDROID_PACKAGE_NAME,
} from "../constants/appInfo";

// // ---- Edit these to match your real details ----
// const APP_NAME = "Gold Rate App";
// const SUPPORT_EMAIL = "yourapp@example.com";
// const SUPPORT_PHONE = "+911234567890";
// const COMPANY_NAME = "Your Company";
// const COMPANY_WEBSITE = "https://example.com";
// const APP_VERSION = "1.0.0";
// // -------------------------------------------------

function DrawerTextRow({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.textRow} activeOpacity={0.65}>
      <Text style={styles.textRowLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const { setLevelEditMode } = useLevelEdit();

  // "Set Level": turns on reorder mode on the Home screen (Save / Reset
  // buttons, long-press + drag rows). If the user is on another screen
  // (Settings, Device tab) bring the Home tab forward first.
  const handleSetLevel = () => {
    const current = props.state?.routes?.[props.state.index];
    const onHomeTab =
      current?.name === "HomeTabs" && (current.state?.index ?? 0) === 0;
    if (!onHomeTab) {
      props.navigation.navigate("HomeTabs", { screen: "Home" });
    }
    setLevelEditMode(true);
    props.navigation.closeDrawer();
  };

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
    const handleAboutThisApp = () => {
    // "About" is registered on the root Stack (App.js), not on this
    // Drawer navigator, so this call bubbles up to the parent Stack,
    // which pushes it as a normal screen with a back button.
    props.navigation.navigate("About");
  };

    const handleTermsAndPrivacy = () => {
    props.navigation.navigate("Terms");
  };

    const handleRateApp = async () => {
    if (Platform.OS === "android") {
      const marketUrl = `market://details?id=${ANDROID_PACKAGE_NAME}`;
      const webUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;
      try {
        // market:// opens the Play Store app directly; falls back to the
        // browser if the Play Store app isn't available (e.g. some emulators).
        const canOpenMarket = await Linking.canOpenURL(marketUrl);
        await Linking.openURL(canOpenMarket ? marketUrl : webUrl);
      } catch {
        Linking.openURL(webUrl);
      }
      return;
    }

    if (Platform.OS === "ios") {
      if (!IOS_APP_STORE_ID) {
        // Not published on the App Store yet — nothing to link to.
        Alert.alert("Not available yet", "This app isn't on the App Store yet.");
        return;
      }
      const storeUrl = `itms-apps://itunes.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`;
      const webUrl = `https://apps.apple.com/app/id${IOS_APP_STORE_ID}?action=write-review`;
      try {
        const canOpenStore = await Linking.canOpenURL(storeUrl);
        await Linking.openURL(canOpenStore ? storeUrl : webUrl);
      } catch {
        Linking.openURL(webUrl);
      }
    }
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
      <DrawerItem
        label="Set Level"
        inactiveTintColor="#CCCCCC"
        icon={({ color, size }) => (
          <Ionicons name="reorder-three" color={color} size={size} />
        )}
        onPress={handleSetLevel}
      />

      <View style={styles.sectionGap} />

      {/* Contact Us */}
      <Text style={styles.sectionTitle}>CONTACT US</Text>
      <DrawerTextRow label="Send Us an Email" onPress={handleEmail} />
      <DrawerTextRow label="Report an Issue" onPress={handleReportIssue} />
      <DrawerTextRow label="Suggest a Feature" onPress={handleSuggestFeature} />

      {/* About */}
      <View style={styles.sectionGap} />
      <Text style={styles.sectionTitle}>A2GOLD</Text>
      <DrawerTextRow
        label="About This App"
        onPress={handleAboutThisApp}
      />
      <DrawerTextRow
        label="Rate The App"
        onPress={handleRateApp}
      />
      {/* <DrawerTextRow
        label="Invite friends"
        onPress={() => handlePlaceholder("Invite friends")}
      /> */}
      <DrawerTextRow
        label="Terms of Use And Privacy"
        onPress={handleTermsAndPrivacy}
      />
     

      {/* Company links */}
      <View style={styles.sectionGap} />
      <Text style={styles.sectionTitle}>A2MATION APP</Text>
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