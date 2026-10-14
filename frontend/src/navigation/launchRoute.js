import { setEspAllowedPurities } from "../api/goldRateApi";
import {
  hasSeenAd,
  loadCustomPurities,
  loadGramUnit,
  loadAddedPurities,
} from "../storage/Puritystorage";

// Where the app goes after the Intro screen:
//  - first launch (ad not seen yet): Ad -> Welcome -> Home
//  - later launches: straight to Home with the user's last saved settings
export async function navigateAfterIntro(navigation) {
  const seen = await hasSeenAd();

  if (!seen) {
    navigation.replace("Ad");
    return;
  }

  const [custom, gramUnit, added] = await Promise.all([
    loadCustomPurities(),
    loadGramUnit(),
    loadAddedPurities(),
  ]);

  const purities = [...custom, ...added.map((a) => a.name)];
  const customDigits = Object.fromEntries(
    added.map((a) => [a.name, a.maxDigits]),
  );
  // Restore which fields the device payload may include (otherwise
  // it would reset to "send everything" after an app restart).
  setEspAllowedPurities(purities.length ? purities : null);

  navigation.replace("Main", {
    screen: "HomeTabs",
    params: {
      screen: "Home",
      params: {
        purities: purities.length ? purities : undefined,
        gramUnit,
        customDigits,
      },
    },
  });
}