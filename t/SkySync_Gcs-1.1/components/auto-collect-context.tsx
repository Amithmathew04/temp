"use client";

import React, { createContext, useContext, useRef, useState, useCallback } from "react";

interface AutoCollectContextType {
  autoCollect: boolean;
  collecting: boolean;
  toggleAutoCollect: () => void;
  collectCurrentData: () => Promise<void>;
}

const AutoCollectContext = createContext<AutoCollectContextType | undefined>(undefined);

export const useAutoCollect = () => {
  const ctx = useContext(AutoCollectContext);
  if (!ctx) throw new Error("useAutoCollect must be used within AutoCollectProvider");
  return ctx;
};

export const AutoCollectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autoCollect, setAutoCollect] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const collectCurrentData = useCallback(async () => {
    setCollecting(true);
    try {
      await fetch("/api/history-data?action=collect", { method: "GET", cache: "no-store" });
    } catch (error) {
      console.error("Error collecting data:", error);
    } finally {
      setCollecting(false);
    }
  }, []);

  const toggleAutoCollect = useCallback(() => {
    if (autoCollect) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAutoCollect(false);
    } else {
      collectCurrentData();
      intervalRef.current = setInterval(collectCurrentData, 5000);
      setAutoCollect(true);
    }
  }, [autoCollect, collectCurrentData]);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <AutoCollectContext.Provider value={{ autoCollect, collecting, toggleAutoCollect, collectCurrentData }}>
      {children}
    </AutoCollectContext.Provider>
  );
}; 