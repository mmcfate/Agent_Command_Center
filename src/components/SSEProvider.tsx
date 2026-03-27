"use client";

import { useEffect, useRef } from "react";
import { useDashboardStore, connectStream } from "@/store";

const HISTORY_SIZE = 60; // keep last 60 data points per metric

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Use the store's connectStream which uses true EventSource
    cleanupRef.current = connectStream();

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return <>{children}</>;
}

// Ring-buffer hook for metric history
export function useMetricHistory(key: keyof typeof useDashboardStore.getState extends () => infer S ? S extends { system: infer Sys } ? Sys : never : never, field: string, size = HISTORY_SIZE) {
  const historyRef = useRef<number[]>([]);

  const system = useDashboardStore((s) => (s as any).system);
  const value = system?.[field] as number | undefined;

  if (value !== undefined) {
    historyRef.current.push(value);
    if (historyRef.current.length > size) {
      historyRef.current.shift();
    }
  }

  return { value: value ?? 0, history: [...historyRef.current] };
}
