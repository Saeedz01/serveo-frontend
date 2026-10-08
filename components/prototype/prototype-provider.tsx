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
import { seedState } from "@/lib/prototype-seed";
import {
  loadPrototypeState,
  savePrototypeState,
} from "@/lib/prototype-store";
import type { PrototypeState } from "@/lib/prototype-types";
import { buildPrototypeValue } from "./build-prototype-value";
import type { PrototypeContextValue } from "./prototype-context";

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadPrototypeState());
    setReady(true);
  }, []);

  const commit = useCallback(
    (updater: (prev: PrototypeState) => PrototypeState) => {
      setState((prev) => {
        const next = updater(prev);
        savePrototypeState(next);
        return next;
      });
    },
    [],
  );

  const currentProvider = useMemo(
    () => state.providers.find((p) => p.id === state.currentProviderId) ?? null,
    [state.currentProviderId, state.providers],
  );

  const currentSeeker = useMemo(
    () =>
      (state.seekers ?? []).find(
        (seeker) => seeker.id === state.currentSeekerId,
      ) ?? null,
    [state.currentSeekerId, state.seekers],
  );

  const value = useMemo(
    () =>
      buildPrototypeValue({
        ready,
        state,
        currentProvider,
        currentSeeker,
        commit,
      }),
    [commit, currentProvider, currentSeeker, ready, state],
  );

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  );
}

export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error("usePrototype must be used within PrototypeProvider");
  }
  return context;
}
