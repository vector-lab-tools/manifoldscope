"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { BackendStatus } from "@/types/manifold";

type ManifoldContextValue = {
  sampleName: string;
  setSampleName: (name: string) => void;
  backendStatus: BackendStatus | null;
  backendReachable: boolean;
  refreshStatus: () => Promise<void>;
};

const ManifoldContext = createContext<ManifoldContextValue | null>(null);

export function ManifoldProvider({ children }: { children: ReactNode }) {
  const [sampleName, setSampleName] = useState<string>(
    "philosophy-of-technology-v1",
  );
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [backendReachable, setBackendReachable] = useState<boolean>(false);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/backend/status");
      if (!response.ok) {
        setBackendReachable(false);
        setBackendStatus(null);
        return;
      }
      const data = (await response.json()) as BackendStatus;
      setBackendStatus(data);
      setBackendReachable(data.status === "ok");
    } catch {
      setBackendReachable(false);
      setBackendStatus(null);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
    const interval = setInterval(() => {
      void refreshStatus();
    }, 10_000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const value = useMemo(
    () => ({
      sampleName,
      setSampleName,
      backendStatus,
      backendReachable,
      refreshStatus,
    }),
    [sampleName, backendStatus, backendReachable, refreshStatus],
  );

  return (
    <ManifoldContext.Provider value={value}>
      {children}
    </ManifoldContext.Provider>
  );
}

export function useManifold() {
  const ctx = useContext(ManifoldContext);
  if (!ctx) throw new Error("useManifold must be used inside <ManifoldProvider>");
  return ctx;
}
