import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { hasSeenIntro } from "../storage/Puritystorage";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      // The Intro screen shows a "Get Started" button only on the very
      // first open; on every later launch it waits 2 seconds and moves on.
      const seen = await hasSeenIntro();
      if (cancelled) return;
      navigation.replace("Intro", { isFirstLaunch: !seen });
    }, 5000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
       <Image
        source={require("../../assets/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>A2Gold</Text>
      <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 228,
    height: 228,
  },
  title: {
    color: "#D4AF37",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 12,
  },
});