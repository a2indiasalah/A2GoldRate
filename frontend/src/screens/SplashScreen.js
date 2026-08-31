import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Ad");
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🪙</Text>
      <Text style={styles.title}>Gold Rate App</Text>
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
    fontSize: 64,
  },
  title: {
    color: "#D4AF37",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 12,
  },
});