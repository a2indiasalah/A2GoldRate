import React, { useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// How long the ad stays on screen before auto-continuing to Welcome.
const AUTO_CONTINUE_MS = 3000;

export default function AdScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, AUTO_CONTINUE_MS);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <Ionicons name="diamond-outline" size={40} color="#D4AF37" />
        </View>

        <Text style={styles.presentedBy}>POWERED BY</Text>
        <Text style={styles.brand}>A2mation</Text>
        <View style={styles.divider} />

        <Text style={styles.tagline}>Innovating with purpose.</Text>
        <Text style={styles.description}>
          We build smart, reliable software solutions that help businesses move faster.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.companyName}>
            A2mation Technology Solution (OPC) Pvt Ltd
          </Text>
          <Text style={styles.contactInfo}>+91 8777353002</Text>
          <Text style={styles.contactInfo}>a2mationsolution@gmail.com</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111111" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconBox: {
    width: 84,
    height: 84,
    borderRadius: 18,
    backgroundColor: "#1C1C1C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  presentedBy: { color: "#888888", fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  brand: { color: "#FFFFFF", fontSize: 32, fontWeight: "700", marginBottom: 16 },
  divider: { width: 50, height: 3, backgroundColor: "#D4AF37", borderRadius: 2, marginBottom: 20 },
  tagline: { color: "#D4AF37", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  description: {
    color: "#AAAAAA",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  footer: { marginTop: 48, alignItems: "center" },
  companyName: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  contactInfo: { color: "#888888", fontSize: 12, textAlign: "center", marginTop: 4 },
});