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
import { flushSync } from "react-dom";
import { seedState } from "@/lib/prototype-seed";
import {
  createBooking as createBookingInStore,
  createService as createServiceInStore,
  loadPrototypeState,
  loginAdmin as loginAdminInStore,
  loginProvider as loginProviderInStore,
  logoutAdmin as logoutAdminInStore,
  registerProvider as registerProviderInStore,
  removeService as removeServiceInStore,
  savePrototypeState,
  setBookingStatus,
  setCurrentProvider as setCurrentProviderInStore,
  setProviderStatus,
  setServiceStatus,
  verifyProviderAndPublishDrafts,
} from "@/lib/prototype-store";
import type {
  CreateBookingInput,
  CreateServiceInput,
  PrototypeBooking,
  PrototypeProvider,
  PrototypeService,
  PrototypeState,
  RegisterProviderInput,
} from "@/lib/prototype-types";

type ProviderLoginOutcome =
  | { ok: true; provider: PrototypeProvider }
  | { ok: false; reason: "not_found" | "bad_password" };

type AdminLoginOutcome = { ok: true } | { ok: false; reason: "bad_credentials" };

type PrototypeContextValue = {
  ready: boolean;
  state: PrototypeState;
  currentProvider: PrototypeProvider | null;
  adminAuthenticated: boolean;
  registerProvider: (input: RegisterProviderInput) => PrototypeProvider;
  loginProvider: (phone: string, password: string) => ProviderLoginOutcome;
  loginAdmin: (email: string, password: string) => AdminLoginOutcome;
  logoutAdmin: () => void;
  verifyProvider: (providerId: string) => void;
  rejectProvider: (providerId: string) => void;
  createService: (input: CreateServiceInput) => void;
  publishService: (serviceId: string) => void;
  unpublishService: (serviceId: string) => void;
  suspendService: (serviceId: string) => void;
  restoreService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
  createBooking: (input: CreateBookingInput) => void;
  acceptBooking: (bookingId: string) => void;
  declineBooking: (bookingId: string) => void;
  switchProvider: (providerId: string) => void;
  logout: () => void;
  servicesForProvider: (providerId: string) => PrototypeService[];
  bookingsForProvider: (providerId: string) => PrototypeBooking[];
  getPublishedService: (serviceId: string) => PrototypeService | undefined;
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(seedState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadPrototypeState());
    setReady(true);
  }, []);

  const commit = useCallback((updater: (prev: PrototypeState) => PrototypeState) => {
    setState((prev) => {
      const next = updater(prev);
      savePrototypeState(next);
      return next;
    });
  }, []);

  const currentProvider = useMemo(
    () =>
      state.providers.find((provider) => provider.id === state.currentProviderId) ??
      null,
    [state.currentProviderId, state.providers],
  );

  const value = useMemo<PrototypeContextValue>(
    () => ({
      ready,
      state,
      currentProvider,
      adminAuthenticated: state.adminAuthenticated,
      registerProvider: (input) => {
        let created!: PrototypeProvider;
        // Flush so session is available before auth redirects run.
        flushSync(() => {
          commit((prev) => {
            const next = registerProviderInStore(prev, input);
            created = next.providers[0];
            return next;
          });
        });
        return created;
      },
      loginProvider: (phone, password) => {
        let outcome: ProviderLoginOutcome = { ok: false, reason: "not_found" };
        flushSync(() => {
          commit((prev) => {
            const result = loginProviderInStore(prev, phone, password);
            if (result.ok) {
              outcome = { ok: true, provider: result.provider };
              return result.state;
            }
            outcome = { ok: false, reason: result.reason };
            return result.state;
          });
        });
        return outcome;
      },
      loginAdmin: (email, password) => {
        let outcome: AdminLoginOutcome = { ok: false, reason: "bad_credentials" };
        flushSync(() => {
          commit((prev) => {
            const result = loginAdminInStore(prev, email, password);
            if (result.ok) {
              outcome = { ok: true };
              return result.state;
            }
            outcome = { ok: false, reason: result.reason };
            return result.state;
          });
        });
        return outcome;
      },
      logoutAdmin: () => {
        commit((prev) => logoutAdminInStore(prev));
      },
      verifyProvider: (providerId) => {
        commit((prev) => verifyProviderAndPublishDrafts(prev, providerId));
      },
      rejectProvider: (providerId) => {
        commit((prev) => setProviderStatus(prev, providerId, "rejected"));
      },
      createService: (input) => {
        commit((prev) => {
          const provider = prev.providers.find(
            (item) => item.id === input.providerId,
          );
          const status =
            provider?.status === "verified" ? input.status : "draft";
          return createServiceInStore(prev, { ...input, status });
        });
      },
      publishService: (serviceId) => {
        commit((prev) => {
          const service = prev.services.find((item) => item.id === serviceId);
          const provider = prev.providers.find(
            (item) => item.id === service?.providerId,
          );
          if (provider?.status !== "verified") return prev;
          return setServiceStatus(prev, serviceId, "published");
        });
      },
      unpublishService: (serviceId) => {
        commit((prev) => {
          const service = prev.services.find((item) => item.id === serviceId);
          if (!service || service.status !== "published") return prev;
          return setServiceStatus(prev, serviceId, "draft");
        });
      },
      suspendService: (serviceId) => {
        commit((prev) => setServiceStatus(prev, serviceId, "suspended"));
      },
      restoreService: (serviceId) => {
        commit((prev) => setServiceStatus(prev, serviceId, "published"));
      },
      removeService: (serviceId) => {
        commit((prev) => removeServiceInStore(prev, serviceId));
      },
      createBooking: (input) => {
        commit((prev) => createBookingInStore(prev, input));
      },
      acceptBooking: (bookingId) => {
        commit((prev) => setBookingStatus(prev, bookingId, "accepted"));
      },
      declineBooking: (bookingId) => {
        commit((prev) => setBookingStatus(prev, bookingId, "declined"));
      },
      switchProvider: (providerId) => {
        commit((prev) => setCurrentProviderInStore(prev, providerId));
      },
      logout: () => {
        commit((prev) => setCurrentProviderInStore(prev, null));
      },
      servicesForProvider: (providerId) =>
        state.services.filter((service) => service.providerId === providerId),
      bookingsForProvider: (providerId) =>
        state.bookings.filter((booking) => booking.providerId === providerId),
      getPublishedService: (serviceId) =>
        state.services.find(
          (service) =>
            service.id === serviceId && service.status === "published",
        ),
    }),
    [commit, currentProvider, ready, state],
  );

  return (
    <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
  );
}

export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error("usePrototype must be used within PrototypeProvider");
  }
  return context;
}
