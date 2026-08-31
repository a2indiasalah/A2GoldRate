import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ESP_HOTSPOT_SSID,
  ESP_HOTSPOT_IP,
  connectToEspHotspot,
  disconnectFromEspHotspot,
  pingEspHotspot,
} from "../wifi/espHotspot";
import { getLatestRates, sendRatesToDevice } from "../api/goldRateApi";
import { useDeviceConnection } from "../context/DeviceConnectionContext";

// Placeholder scan — replace with real WiFi/IoT device discovery
// (e.g. via a local network scan, mDNS/Bonjour lookup, or your device's SDK).
const MOCK_DEVICES = [
  { id: "1", name: "Gold Display - Counter 1", ip: "192.168.1.21" },
  { id: "2", name: "Gold Display - Counter 2", ip: "192.168.1.22" },
];

export default function DeviceConnectScreen() {
  const { isConnected: hotspotConnected, setIsConnected: setHotspotConnected } = useDeviceConnection();
  const [hotspotConnecting, setHotspotConnecting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedId, setConnectedId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // After any disconnect (manual tap, or the ping-poll below detecting a
  // dropped connection), the Connect button is locked for a few seconds.
  // Reconnecting immediately tends to fail (Android hasn't finished
  // releasing the previous WiFi session yet), so this gives it a moment
  // and tells the user why if they tap during that window instead of
  // just silently ignoring the tap.
  const CONNECT_LOCK_MS = 5000;
  const [connectLocked, setConnectLocked] = useState(false);
  const connectLockTimeoutRef = useRef(null);

  const lockConnectButton = () => {
    setConnectLocked(true);
    if (connectLockTimeoutRef.current) {
      clearTimeout(connectLockTimeoutRef.current);
    }
    connectLockTimeoutRef.current = setTimeout(() => {
      setConnectLocked(false);
      connectLockTimeoutRef.current = null;
    }, CONNECT_LOCK_MS);
  };

  useEffect(() => {
    return () => {
      if (connectLockTimeoutRef.current) {
        clearTimeout(connectLockTimeoutRef.current);
      }
    };
  }, []);

  const handleConnectToDevice = async () => {
    if (connectLocked) {
      Alert.alert("Please wait", "Please try after 4 seconds.");
      return;
    }

    setHotspotConnecting(true);
    try {
      await connectToEspHotspot();
      setHotspotConnected(true);

      setScanning(true);
      setDevices([]);
      // Simulate a network scan delay
      setTimeout(() => {
        setDevices(MOCK_DEVICES);
        setScanning(false);
      }, 1500);
    } catch (err) {
      if (err?.code === "wifiDisabled") {
        Alert.alert("WiFi is off", "Please turn on WiFi, then tap Connect to Device again.");
      } else if (err?.code === "locationServicesOff") {
        Alert.alert(
          "Location Services is off",
          "Android requires Location Services to be turned on (in your phone's system settings, not just app permissions) to connect to a WiFi network. Turn it on, then try again.",
        );
      } else {
        Alert.alert(
          "Connection failed",
          err?.message || "Could not connect to the display. Make sure it is powered on and in range.",
        );
      }
    } finally {
      setHotspotConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectFromEspHotspot();
    setHotspotConnected(false);
    setDevices([]);
    setConnectedId(null);
    lockConnectButton();
  };

  const handleSyncDevice = async () => {
    // TODO: implement fetching current data/rates from the device here.
    setSyncing(true);
    Alert.alert("Sync complete", "The device synced successfully.");
    try {
      // ...
    } finally {
      setSyncing(false);
    }
  };





  const handleUpdateDevice = async () => {
  const rates = getLatestRates();
  if (!rates) {
    Alert.alert(
      "No rates loaded",
      "Open the Home tab first so rates can load, then come back and update the display.",
    );
    return;
  }

  setUpdating(true);
  try {
    // Sends whatever is already on the Home screen — no need to re-fetch
    // from the backend here, since the phone is on the ESP's own WiFi
    // hotspot at this point and usually has no route to the backend.
    await sendRatesToDevice(ESP_HOTSPOT_IP, rates);
    Alert.alert("Update complete", "The display has been updated successfully.");
  } catch (err) {
    Alert.alert(
      "Update failed",
      err?.message || "Could not update the display. Make sure it stays powered on and in range.",
    );
  } finally {
    setUpdating(false);
  }
};

  // Once connected, poll /ping every few seconds so the screen notices if
  // the display goes away (powered off, out of range) instead of showing
  // "Connected" forever. One dropped packet is tolerated — only two
  // consecutive misses are treated as a real disconnect.
  useEffect(() => {
    if (!hotspotConnected) return undefined;

    const PING_INTERVAL_MS = 6000;
    const MAX_CONSECUTIVE_MISSES = 2;
    let consecutiveMisses = 0;
    let cancelled = false;

    const intervalId = setInterval(async () => {
      const reachable = await pingEspHotspot();
      if (cancelled) return;

      if (reachable) {
        consecutiveMisses = 0;
        return;
      }

      consecutiveMisses += 1;
      if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) {
        setHotspotConnected(false);
        setDevices([]);
        setConnectedId(null);
        lockConnectButton();
        Alert.alert("Device disconnected", "Lost connection to the display. Reconnect and try again.");
      }
    }, PING_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [hotspotConnected]);

  const connectToDevice = (id) => {
    setConnectedId(id);
    // TODO: implement real device-selection handshake here
  };

  const busy = hotspotConnecting || scanning;

  const buttonLabel = hotspotConnecting ? "Connecting..." : "Connect to Device";

 return (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Text style={styles.title}>Connect Display Device</Text>
        <Text style={styles.subtitle}>
          Make sure the device is powered on and connected to the same WiFi network.
        </Text>

        {!hotspotConnected && (
          <TouchableOpacity
            style={[styles.scanButton, connectLocked && styles.scanButtonLocked]}
            onPress={handleConnectToDevice}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#111111" />
            ) : (
              <>
                <Ionicons name="wifi" size={18} color="#111111" style={{ marginRight: 8 }} />
                <Text style={styles.scanButtonText}>{buttonLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {hotspotConnected && (
          <View style={styles.connectedRow}>
            <View style={styles.connectedStatus}>
              <Ionicons name="checkmark-circle" size={18} color="#2E7D32" style={{ marginRight: 8 }} />
              <Text style={styles.connectedStatusText}>Connected</Text>
            </View>
          </View>
        )}

        {hotspotConnected && (
          <TouchableOpacity
            style={[styles.updateButton, updating && styles.updateButtonDisabled]}
            onPress={handleUpdateDevice}
            disabled={updating}
            activeOpacity={0.8}
          >
            {updating ? (
              <>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.updateButtonText}>Updating...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.updateButtonText}>Update Device</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {hotspotConnected && (
          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
            onPress={handleSyncDevice}
            disabled={syncing}
            activeOpacity={0.8}
          >
            {syncing ? (
              <>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.updateButtonText}>Syncing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sync-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.updateButtonText}>Sync Device</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {hotspotConnected && (
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={handleDisconnect}
          activeOpacity={0.8}
        >
          <Text style={styles.disconnectButtonText}>Disconnect</Text>
        </TouchableOpacity>
      )}
    </View>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111111" },
  container: { flex: 1, padding: 20 },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "700", marginBottom: 6 },
  topContent: { flex: 1 },
  subtitle: { color: "#AAAAAA", fontSize: 14, marginBottom: 20 },
  scanButton: {
    flexDirection: "row",
    backgroundColor: "#D4AF37",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonConnected: { backgroundColor: "#2E7D32" },
  scanButtonLocked: { opacity: 0.5 },
  scanButtonText: { color: "#111111", fontWeight: "700", fontSize: 15 },
  connectedSsid: { color: "#888888", fontSize: 13, marginTop: 8, textAlign: "center" },
connectedRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#152E1B",
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderWidth: 1,
  borderColor: "#2E7D32",
},
connectedStatus: { flexDirection: "row", alignItems: "center" },
connectedStatusText: { color: "#2E7D32", fontWeight: "700", fontSize: 15 },
disconnectButton: {
  flexDirection: "row",
  backgroundColor: "#B3261E",
  paddingVertical: 13,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
},
disconnectButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },  updateButton: {
    flexDirection: "row",
    backgroundColor: "#1F5FBF",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#1F5FBF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  updateButtonDisabled: {
    backgroundColor: "#274B7A",
    shadowOpacity: 0,
    elevation: 0,
  },
  updateButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15, letterSpacing: 0.2 },
  syncButton: {
    flexDirection: "row",
    backgroundColor: "#333333",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  syncButtonDisabled: { opacity: 0.6 },
  emptyText: { color: "#888888", textAlign: "center", marginTop: 30 },
  deviceCard: {
    backgroundColor: "#1C1C1C",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  deviceName: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  deviceIp: { color: "#888888", fontSize: 12, marginTop: 2 },
  connectButton: {
    backgroundColor: "#333333",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectedButton: { backgroundColor: "#2E7D32" },
  connectButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
});