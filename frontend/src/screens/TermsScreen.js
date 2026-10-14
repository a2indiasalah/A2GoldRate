import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  APP_NAME,
  SUPPORT_EMAIL,
  COMPANY_NAME,
  LEGAL_LAST_UPDATED,
} from "../constants/appInfo";

// Reached from the drawer's "ABOUT" > "Terms of use and Privacy" row.
// Registered as a Stack.Screen (see App.js), same pattern as AboutScreen —
// a normal pushed screen with a back button, not a drawer destination.
//
// NOTE: this is placeholder legal copy written to match what the app
// actually does (local storage, WiFi pairing with an ESP32 display, no
// accounts). It is NOT a substitute for review by a lawyer before you
// publish — update the wording (and LEGAL_LAST_UPDATED) if that changes.
export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Last updated: {LEGAL_LAST_UPDATED}</Text>

        {/* ---------------- Terms of Use ---------------- */}
        <Text style={styles.h1}>Terms of Use</Text>

        <Text style={styles.h2}>1. Acceptance</Text>
        <Text style={styles.body}>
          By downloading or using {APP_NAME} ("the app"), you agree to these
          Terms of Use. If you don't agree, please don't use the app.
        </Text>

        <Text style={styles.h2}>2. What the app does</Text>
        <Text style={styles.body}>
          {APP_NAME} lets you enter and view gold/silver rates, and connect
          the app to a compatible display device over WiFi to push those
          rates to it. Rates you enter are for your own reference only.
        </Text>

        <Text style={styles.h2}>3. Rate accuracy</Text>
        <Text style={styles.body}>
          Any gold/silver rates shown or entered in the app are provided
          "as is" for convenience and are not guaranteed to be accurate,
          real-time, or suitable for trading or pricing decisions. You are
          responsible for verifying rates independently before relying on
          them commercially.
        </Text>

        <Text style={styles.h2}>4. Device connection</Text>
        <Text style={styles.body}>
          Connecting to a display device requires joining the device's own
          WiFi network from your phone. We aren't responsible for issues
          arising from your device's WiFi hardware, firmware, or network
          environment.
        </Text>

        <Text style={styles.h2}>5. Acceptable use</Text>
        <Text style={styles.body}>
          You agree not to misuse the app — including attempting to reverse
          engineer it, interfere with its normal operation, or use it in any
          way that violates applicable law.
        </Text>

        <Text style={styles.h2}>6. Changes</Text>
        <Text style={styles.body}>
          We may update the app and these terms from time to time. Continued
          use after an update means you accept the revised terms.
        </Text>

        <Text style={styles.h2}>7. Disclaimer & liability</Text>
        <Text style={styles.body}>
          The app is provided without warranties of any kind. To the extent
          permitted by law, {COMPANY_NAME} is not liable for any damages
          arising from your use of the app.
        </Text>

        <View style={styles.divider} />

        {/* ---------------- Privacy Policy ---------------- */}
        <Text style={styles.h1}>Privacy Policy</Text>

        <Text style={styles.h2}>1. Data stored on your device</Text>
        <Text style={styles.body}>
          Rates you enter are saved locally on your phone (using on-device
          storage) so the app can show them again next time you open it.
          This data is not uploaded to us or to any third party.
        </Text>

        <Text style={styles.h2}>2. WiFi & location permission</Text>
        <Text style={styles.body}>
          To connect to a display device's WiFi hotspot, Android requires
          apps to hold location permission — this is an Android platform
          requirement for any app that can scan or manage WiFi connections,
          not something we use to track your location. We don't collect,
          store, or share your location.
        </Text>

        <Text style={styles.h2}>3. No accounts, no analytics</Text>
        <Text style={styles.body}>
          The app doesn't require you to create an account, and it doesn't
          use third-party analytics or advertising SDKs to track your
          activity.
        </Text>

        <Text style={styles.h2}>4. Contacting us</Text>
        <Text style={styles.body}>
          If you email us for support (e.g. "Send us an email" in the menu),
          we'll only use your message and email address to reply to you.
        </Text>

        <Text style={styles.h2}>5. Changes to this policy</Text>
        <Text style={styles.body}>
          If this policy changes, we'll update the "Last updated" date above.
        </Text>

        <Text style={styles.h2}>6. Contact</Text>
        <Text style={styles.body}>
          Questions about these terms or this policy? Email us at{" "}
          {SUPPORT_EMAIL}.
        </Text>

        <View style={{ height: 24 }} />
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
  content: { padding: 24 },
  updated: { color: "#888888", fontSize: 12, marginBottom: 20 },
  h1: {
    color: "#D4AF37",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
  },
  h2: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 4,
  },
  body: { color: "#CCCCCC", fontSize: 14, lineHeight: 21 },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 24,
  },
});