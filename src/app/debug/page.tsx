"use client";

import { useState, useEffect } from "react";
import { create } from "zustand";

interface TestStore {
  count: number;
  inc: () => void;
}

const testStore = create<TestStore>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

export default function DebugPage() {
  const [result, setResult] = useState<string[]>([]);
  const testCount = testStore((s) => s.count);

  useEffect(() => {
    const lines: string[] = [];
    lines.push(`1. Component mounted. testCount=${testCount}`);
    setResult([...lines]);

    // Test 1: direct state
    lines.push(`2. Calling testStore.inc()`);
    testStore.getState().inc();
    lines.push(`3. testCount after inc = ${testStore.getState().count}`);
    setResult([...lines]);

    // Test 2: fetch
    lines.push(`4. Fetching /api/overview...`);
    setResult([...lines]);
    fetch("/api/overview")
      .then(r => r.json())
      .then(data => {
        lines.push(`5. Fetched ${data.agents?.length} agents`);
        setResult([...lines]);
        
        // Test 3: setAll
        lines.push(`6. Calling setAll...`);
        setResult([...lines]);
        
        const store = require("@/store").useDashboardStore.getState();
        store.setAll(data);
        
        lines.push(`7. Store agents=${store.agents.length} after setAll`);
        setResult([...lines]);
      })
      .catch((e: Error) => {
        lines.push(`ERROR: ${e.message}`);
        setResult([...lines]);
      });
  }, []);

  return (
    <div style={{ padding: "20px", color: "#f0f0f5", fontFamily: "monospace", fontSize: "13px" }}>
      <h1 style={{ color: "#fff" }}>Debug</h1>
      <p>testCount (Zustand direct): <strong style={{ color: "#fbbf24" }}>{testCount}</strong></p>
      <p>Component re-render count: <strong style={{ color: "#fbbf24" }}>{testCount}</strong></p>
      <hr style={{ borderColor: "#2a2a3a", margin: "16px 0" }} />
      <pre style={{ background: "#12121a", padding: "12px", borderRadius: "6px", color: "#34d399" }}>
        {result.map((line, i) => `${i + 1}. ${line}`).join("\n")}
      </pre>
    </div>
  );
}
