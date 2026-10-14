import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "../theme/colors";
import { markIntroSeen } from "../storage/Puritystorage";
import { navigateAfterIntro } from "../navigation/launchRoute";

// How long this screen lingers on repeat launches before auto-continuing,
// since there's no "Get Started" button to tap after the first time.
const AUTO_CONTINUE_MS = 2000;

export default function IntroScreen({ navigation, route }) {
  const styles = useMemo(() => createStyles(colors), []);
  const insets = useSafeAreaInsets();
  const isFirstLaunch = route?.params?.isFirstLaunch ?? true;

  const handleGetStarted = async () => {
    // Mark seen *before* navigating so every future launch skips the button.
    await markIntroSeen();
    navigateAfterIntro(navigation);
  };

  useEffect(() => {
    if (isFirstLaunch) return undefined;
    const timer = setTimeout(() => {
      navigateAfterIntro(navigation);
    }, AUTO_CONTINUE_MS);
    return () => clearTimeout(timer);
  }, [isFirstLaunch, navigation]);

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundLight]}
      style={styles.gradient}
    >
      {/* ScrollView keeps the centred look on tall screens but scrolls
          instead of clipping on short ones. */}
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Image
              source={require("../../assets/CompanyLogoIcon.png")}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.presentedBy}>POWERED BY</Text>
          <Text style={styles.brand}>A2mation</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>
            Innovating with purpose. We are thrilled to accompany you on your spiritual journey.
          </Text>
          <Text style={styles.companyName}>A2mation  Technology Solution(OPC) Pvt Ltd</Text>
          <Text style={styles.contactInfo}>+91 8777353002</Text>
          <Text style={styles.contactInfo}>a2mationsolution@gmail.com</Text>
        </View>

        {isFirstLaunch && (
          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    gradient: { flex: 1 },
    container: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    card: {
      backgroundColor: colors.backgroundLight,
      borderRadius: 24,
      padding: 32,
      alignItems: "center",
      width: "100%",
      marginBottom: 32,
    },
    iconBox: {
      width: 80,
      height: 80,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      overflow: "hidden",
    },
    iconImage: {
      width: 52,
      height: 52,
    },
    presentedBy: {
      color: colors.textMuted,
      fontSize: 12,
      letterSpacing: 2,
      marginBottom: 8,
    },
    brand: {
      color: colors.white,
      fontSize: 30,
      fontWeight: "700",
      marginBottom: 16,
    },
    divider: {
      width: 50,
      height: 3,
      backgroundColor: colors.gold,
      borderRadius: 2,
      marginBottom: 20,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 15,
      textAlign: "center",
      lineHeight: 22,
    },
    companyName: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 20,
    },
    contactInfo: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: "center",
      marginTop: 4,
    },
    button: {
      backgroundColor: colors.gold,
      borderRadius: 30,
      paddingVertical: 16,
      paddingHorizontal: 40,
      width: "100%",
      alignItems: "center",
    },
    buttonText: { color: colors.background, fontSize: 16, fontWeight: "700" },
  });