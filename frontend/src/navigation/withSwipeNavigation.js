import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

// Order of tabs, left to right, used to work out which tab a swipe should
// land on. Keep this in sync with the Tab.Screen order in TabNavigator.js.
const TAB_ORDER = ["Home", "DeviceConnection"];

const SWIPE_DISTANCE_THRESHOLD = 35; // px of horizontal drag to count as a swipe
const SWIPE_VELOCITY_THRESHOLD = 400; // px/s — lets a quick flick count even if short

// Wraps a screen so a left/right swipe moves to the previous/next bottom tab,
// while still letting vertical scrolling (FlatList, ScrollView, etc.) inside
// the screen work as normal.
export default function withSwipeNavigation(ScreenComponent, routeName) {
  return function SwipeWrappedScreen(props) {
    const { navigation } = props;
    const currentIndex = TAB_ORDER.indexOf(routeName);

    const goToTab = (index) => {
      if (index >= 0 && index < TAB_ORDER.length) {
        navigation.navigate(TAB_ORDER[index]);
      }
    };

    const panGesture = Gesture.Pan()
      // Only claim the gesture once the drag is clearly horizontal, so a
      // vertical drag is left for the screen's own ScrollView/FlatList.
      .activeOffsetX([-20, 20])
      .failOffsetY([-15, 15])
      .onEnd((event) => {
        "worklet";
        const { translationX, velocityX } = event;
        const isSwipeLeft =
          translationX < -SWIPE_DISTANCE_THRESHOLD || velocityX < -SWIPE_VELOCITY_THRESHOLD;
        const isSwipeRight =
          translationX > SWIPE_DISTANCE_THRESHOLD || velocityX > SWIPE_VELOCITY_THRESHOLD;

        if (isSwipeLeft) {
          scheduleOnRN(goToTab, currentIndex + 1);
        } else if (isSwipeRight) {
          scheduleOnRN(goToTab, currentIndex - 1);
        }
      });

    return (
      <GestureDetector gesture={panGesture}>
        <ScreenComponent {...props} />
      </GestureDetector>
    );
  };
}