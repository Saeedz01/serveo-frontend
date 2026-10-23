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
import { clearLegacyLocalStorage } from "@/lib/clear-legacy-storage";
import { seedState } from "@/lib/prototype-seed";
import type { PrototypeState } from "@/lib/prototype-types";
import { hydrateAuthSession } from "@/service/auth-session";
import { applyAuthUserToPrototype } from "@/service/sync-prototype-session";
import { buildPrototypeValue } from "./build-prototype-value";
import type { PrototypeContextValue } from "./prototype-context";
import { PublishedServicesSync } from "./published-services-sync";

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    clearLegacyLocalStorage();
    const user = hydrateAuthSession();
    let next = seedState();
    if (user) {
      // Restore provider/seeker/admin UI session from persisted auth.
      // Sentinel password marks registered seeker/provider accounts.
      next = applyAuthUserToPrototype(next, user, {
        password: user.role === "SEEKER" || user.role === "PROVIDER"
          ? "__account__"
          : undefined,
      });
    }
    setState(next);
    setReady(true);
  }, []);

  const commit = useCallback(
    (updater: (prev: PrototypeState) => PrototypeState) => {
      setState((prev) => updater(prev));
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
      <PublishedServicesSync />
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
