import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  ScrollView,
  StyleSheet,
  Easing,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

// A small drag-to-reorder list (no extra npm package needed).
// Long-press a row, then drag it up/down; the other rows slide out of the
// way. Near the top/bottom edge the list auto-scrolls.
//
// Props:
//   items          [{ key, label, valueText }]  - the rows
//   order          array of keys - the order to show (controlled)
//   onOrderChange  (newOrderKeys) => void - called when a drag ends
//   header         optional node shown above the rows (scrolls with them)
//   footer         optional node shown below the last row (scrolls with them)

const CARD_HEIGHT = 62;
const ROW_GAP = 12;
const ROW_HEIGHT = CARD_HEIGHT + ROW_GAP;
const LONG_PRESS_MS = 250;
const EDGE_ZONE = 90; // px from the top/bottom edge that triggers auto-scroll
const SCROLL_STEP = 12; // px per tick while auto-scrolling

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const LevelRow = React.memo(function LevelRow({
  item,
  y,
  active,
  onStart,
  onMove,
  onEnd,
}) {
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(LONG_PRESS_MS)
        .runOnJS(true)
        .onStart(() => onStart(item.key))
        .onUpdate((e) => onMove(e.translationY, e.absoluteY))
        .onFinalize(() => onEnd(item.key)),
    [item.key, onStart, onMove, onEnd],
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.row,
          {
            zIndex: active ? 10 : 1,
            transform: [{ translateY: y }, { scale: active ? 1.03 : 1 }],
          },
        ]}
      >
        <View style={[styles.card, active && styles.cardActive]}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.right}>
            <Text style={styles.value}>{item.valueText}</Text>
            <Ionicons
              name="reorder-three"
              size={26}
              color={active ? "#D4AF37" : "#888888"}
              style={styles.handle}
            />
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});

export default function DraggableLevelList({
  items,
  order,
  onOrderChange,
  header,
  footer,
  bottomPadding = 40,
}) {
  // Final list of keys to show: the requested order first, then any item
  // that isn't in it yet (so a row can never go missing).
  const keys = useMemo(() => {
    const itemKeys = items.map((i) => i.key);
    const base = (order || []).filter((k) => itemKeys.includes(k));
    const rest = itemKeys.filter((k) => !base.includes(k));
    return [...base, ...rest];
  }, [items, order]);
  const keySig = keys.join("|");
  const keysRef = useRef(keys);
  keysRef.current = keys;

  const orderRef = useRef(keys);
  const ys = useRef({}); // key -> Animated.Value (row's top position)
  const dragRef = useRef({
    key: null,
    startY: 0,
    startScroll: 0,
    dy: 0,
    absY: 0,
  });
  const scrollRef = useRef(null);
  const wrapRef = useRef(null);
  const scrollY = useRef(0);
  const contentH = useRef(0);
  const viewH = useRef(0);
  const viewport = useRef({ top: 0, bottom: 0 });
  const timerRef = useRef(null);
  const [draggingKey, setDraggingKey] = useState(null);

  keys.forEach((k, i) => {
    if (!ys.current[k]) ys.current[k] = new Animated.Value(i * ROW_HEIGHT);
  });

  const animateTo = useCallback((k, idx) => {
    const v = ys.current[k];
    if (!v) return;
    Animated.timing(v, {
      toValue: idx * ROW_HEIGHT,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  // Whenever the order coming from the parent changes (e.g. Reset, or the
  // first load), slide every row to its slot.
  useEffect(() => {
    if (dragRef.current.key) return;
    orderRef.current = keysRef.current.slice();
    orderRef.current.forEach((k, i) => animateTo(k, i));
  }, [keySig, animateTo]);

  const updateDragPosition = useCallback(() => {
    const d = dragRef.current;
    if (!d.key) return;
    const n = orderRef.current.length;
    const raw = d.startY + d.dy + (scrollY.current - d.startScroll);
    const y = clamp(raw, 0, (n - 1) * ROW_HEIGHT);
    ys.current[d.key].setValue(y);

    const target = clamp(Math.round(y / ROW_HEIGHT), 0, n - 1);
    const cur = orderRef.current.indexOf(d.key);
    if (target !== cur) {
      const next = orderRef.current.slice();
      next.splice(cur, 1);
      next.splice(target, 0, d.key);
      orderRef.current = next;
      next.forEach((k, i) => {
        if (k !== d.key) animateTo(k, i);
      });
    }
  }, [animateTo]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStart = useCallback(
    (key) => {
      const idx = orderRef.current.indexOf(key);
      if (idx < 0) return;
      dragRef.current = {
        key,
        startY: idx * ROW_HEIGHT,
        startScroll: scrollY.current,
        dy: 0,
        absY: 0,
      };
      wrapRef.current?.measureInWindow?.((x, yy, w, h) => {
        viewport.current = { top: yy, bottom: yy + h };
      });
      setDraggingKey(key);

      // Auto-scroll while the finger is near the top/bottom edge.
      stopTimer();
      timerRef.current = setInterval(() => {
        const d = dragRef.current;
        if (!d.key || !d.absY) return;
        const { top, bottom } = viewport.current;
        let step = 0;
        if (d.absY < top + EDGE_ZONE) step = -SCROLL_STEP;
        else if (d.absY > bottom - EDGE_ZONE) step = SCROLL_STEP;
        if (!step) return;
        const max = Math.max(0, contentH.current - viewH.current);
        const next = clamp(scrollY.current + step, 0, max);
        if (next !== scrollY.current) {
          scrollY.current = next;
          scrollRef.current?.scrollTo({ y: next, animated: false });
          updateDragPosition();
        }
      }, 16);
    },
    [stopTimer, updateDragPosition],
  );

  const handleMove = useCallback(
    (dy, absY) => {
      const d = dragRef.current;
      if (!d.key) return;
      d.dy = dy;
      d.absY = absY;
      updateDragPosition();
    },
    [updateDragPosition],
  );

  const handleEnd = useCallback(
    (key) => {
      // onFinalize also fires for taps / scrolls that never became a drag.
      if (dragRef.current.key !== key) return;
      stopTimer();
      const finalIdx = orderRef.current.indexOf(key);
      animateTo(key, finalIdx);
      dragRef.current = { ...dragRef.current, key: null };
      setDraggingKey(null);
      onOrderChange && onOrderChange(orderRef.current.slice());
    },
    [animateTo, stopTimer, onOrderChange],
  );

  useEffect(() => stopTimer, [stopTimer]);

  const itemByKey = useMemo(() => {
    const m = {};
    items.forEach((i) => {
      m[i.key] = i;
    });
    return m;
  }, [items]);

  return (
    <View ref={wrapRef} style={styles.wrap} collapsable={false}>
      <ScrollView
        ref={scrollRef}
        scrollEnabled={!draggingKey}
        scrollEventThrottle={16}
        onScroll={(e) => {
          // While dragging, the auto-scroll timer owns the offset.
          if (!dragRef.current.key) {
            scrollY.current = e.nativeEvent.contentOffset.y;
          }
        }}
        onContentSizeChange={(w, h) => {
          contentH.current = h;
        }}
        onLayout={(e) => {
          viewH.current = e.nativeEvent.layout.height;
        }}
        contentContainerStyle={styles.content}
      >
        {header}
        <View style={{ height: keys.length * ROW_HEIGHT }}>
          {keys.map((k) => (
            <LevelRow
              key={k}
              item={itemByKey[k]}
              y={ys.current[k]}
              active={draggingKey === k}
              onStart={handleStart}
              onMove={handleMove}
              onEnd={handleEnd}
            />
          ))}
        </View>
        {footer}
        <View style={{ height: bottomPadding }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  content: { padding: 16 },
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: ROW_HEIGHT,
  },
  card: {
    height: CARD_HEIGHT,
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardActive: {
    borderColor: "#D4AF37",
    backgroundColor: "#242424",
    elevation: 8,
  },
  label: { color: "#D4AF37", fontSize: 20, fontWeight: "700" },
  right: { flexDirection: "row", alignItems: "center" },
  value: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  handle: { marginLeft: 14 },
});