import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";


// Placeholder — replace with real demo content.
export default function DemoScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Ionicons name="flask-outline" size={48} color="#D4AF37" />
        <Text style={styles.title}>Demo</Text>
        <Text style={styles.subtitle}>This is a placeholder demo screen.</Text>
      </View>
     </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111111" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "700", marginTop: 12 },
  subtitle: { color: "#AAAAAA", fontSize: 14, textAlign: "center", marginTop: 8 },
});
