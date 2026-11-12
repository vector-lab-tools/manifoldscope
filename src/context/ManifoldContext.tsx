// SPDX-License-Identifier: GPL-3.0-or-later
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { BackendStatus } from "@/types/manifold";

type ModelFields = {
  model_id?: string;
  comparison_model_id?: string;
};

type ManifoldContextValue = {
  sampleName: string;
  setSampleName: (name: string) => void;
  backendStatus: BackendStatus | null;
  backendReachable: boolean;
  refreshStatus: () => Promise<void>;
  modelId: string;
  setModelId: (id: string) => void;
  comparisonModelId: string;
  setComparisonModelId: (id: string) => void;
  modelFields: ModelFields;
};

const ManifoldContext = createContext<ManifoldContextValue | null>(null);

const MODEL_KEY = "manifoldscope.modelId";
const COMPARISON_MODEL_KEY = "manifoldscope.comparisonModelId";

const storeListeners = new Set<() => void>();

function subscribeStored(onChange: () => void) {
  storeListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    storeListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readStored(key: string): string {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function writeStored(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {}
  storeListeners.forEach((l) => l());
}

function useStored(key: string): string {
  return useSyncExternalStore(
    subscribeStored,
    () => readStored(key),
    () => "",
  );
}

export function ManifoldProvider({ children }: { children: ReactNode }) {
  const [sampleName, setSampleName] = useState<string>(
    "philosophy-of-technology-v1",
  );
  const modelId = useStored(MODEL_KEY);
  const comparisonModelId = useStored(COMPARISON_MODEL_KEY);

  const setModelId = useCallback((id: string) => {
    writeStored(MODEL_KEY, id.trim());
  }, []);

  const setComparisonModelId = useCallback((id: string) => {
    writeStored(COMPARISON_MODEL_KEY, id.trim());
  }, []);

  // Empty means "backend default", so the field is omitted rather than sent blank.
  const modelFields = useMemo<ModelFields>(() => {
    const f: ModelFields = {};
    if (modelId) f.model_id = modelId;
    if (comparisonModelId) f.comparison_model_id = comparisonModelId;
    return f;
  }, [modelId, comparisonModelId]);
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
      modelId,
      setModelId,
      comparisonModelId,
      setComparisonModelId,
      modelFields,
    }),
    [
      sampleName,
      backendStatus,
      backendReachable,
      refreshStatus,
      modelId,
      setModelId,
      comparisonModelId,
      setComparisonModelId,
      modelFields,
    ],
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
