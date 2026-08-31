import React, { createContext, useContext, useState } from "react";

const DeviceConnectionContext = createContext(null);

export function DeviceConnectionProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <DeviceConnectionContext.Provider value={{ isConnected, setIsConnected }}>
      {children}
    </DeviceConnectionContext.Provider>
  );
}

// Usage: const { isConnected, setIsConnected } = useDeviceConnection();
export function useDeviceConnection() {
  const ctx = useContext(DeviceConnectionContext);
  if (!ctx) {
    throw new Error("useDeviceConnection must be used within a DeviceConnectionProvider");
  }
  return ctx;
}