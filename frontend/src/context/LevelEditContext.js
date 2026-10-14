import React, { createContext, useContext, useState } from "react";

// Lets the drawer's "Set Level" option switch the Home screen into
// level-reorder mode (Save / Reset buttons + drag to move rows).
const LevelEditContext = createContext({
  levelEditMode: false,
  setLevelEditMode: () => {},
});

export function LevelEditProvider({ children }) {
  const [levelEditMode, setLevelEditMode] = useState(false);
  return (
    <LevelEditContext.Provider value={{ levelEditMode, setLevelEditMode }}>
      {children}
    </LevelEditContext.Provider>
  );
}

export function useLevelEdit() {
  return useContext(LevelEditContext);
}