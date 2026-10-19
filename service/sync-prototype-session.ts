import type { PrototypeState, ProviderStatus } from "@/lib/prototype-types";
import type { AuthUser } from "./api/types";

function mapProviderStatus(status: AuthUser["status"]): ProviderStatus {
  if (status === "VERIFIED") return "verified";
  if (status === "REJECTED") return "rejected";
  if (status === "PENDING") return "pending";
  return "pending";
}

/**
 * Keep the local prototype session in sync after a successful API auth call
 * so existing screens that read currentProvider / currentSeeker / admin still work.
 */
export function applyAuthUserToPrototype(
  state: PrototypeState,
  user: AuthUser,
  extras?: {
    password?: string;
    idFrontUrl?: string;
    idBackUrl?: string;
  },
): PrototypeState {
  if (user.role === "ADMIN") {
    return { ...state, adminAuthenticated: true };
  }

  if (user.role === "SEEKER") {
    const phone = (user.phone ?? "").replace(/\D/g, "");
    const existing = (state.seekers ?? []).find(
      (seeker) =>
        seeker.id === user.id ||
        (phone && seeker.phone.replace(/\D/g, "") === phone),
    );

    const seeker = {
      id: user.id,
      name: user.name,
      phone: user.phone ?? existing?.phone ?? "",
      email: existing?.email,
      password: extras?.password ?? existing?.password,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    const seekers = existing
      ? (state.seekers ?? []).map((item) =>
          item.id === existing.id ||
          item.phone.replace(/\D/g, "") === phone
            ? seeker
            : item,
        )
      : [seeker, ...(state.seekers ?? [])];

    return {
      ...state,
      currentSeekerId: seeker.id,
      seekers,
    };
  }

  if (user.role === "PROVIDER") {
    const phone = (user.phone ?? "").replace(/\D/g, "");
    const providerId = user.profileId ?? user.id;
    const existing = state.providers.find(
      (provider) =>
        provider.id === providerId ||
        provider.id === user.id ||
        provider.phone.replace(/\D/g, "") === phone,
    );

    const provider = {
      id: providerId,
      name: user.name,
      phone: user.phone ?? existing?.phone ?? "",
      password: extras?.password ?? existing?.password ?? "",
      idFrontUrl: extras?.idFrontUrl ?? existing?.idFrontUrl ?? "",
      idBackUrl: extras?.idBackUrl ?? existing?.idBackUrl ?? "",
      status: mapProviderStatus(user.status),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    const providers = existing
      ? state.providers.map((item) =>
          item.id === existing.id ||
          item.phone.replace(/\D/g, "") === phone
            ? provider
            : item,
        )
      : [provider, ...state.providers];

    return {
      ...state,
      currentProviderId: provider.id,
      providers,
    };
  }

  return state;
}
