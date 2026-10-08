import { normalizePhone } from "./prototype-store";
import type {
  PrototypeProvider,
  PrototypeState,
  UpdateProviderProfileInput,
} from "./prototype-types";

export type UpdateProviderProfileResult =
  | { ok: true; state: PrototypeState; provider: PrototypeProvider }
  | { ok: false; state: PrototypeState; reason: "not_found" | "phone_taken" };

export function updateProviderProfile(
  state: PrototypeState,
  providerId: string,
  input: UpdateProviderProfileInput,
): UpdateProviderProfileResult {
  const current = state.providers.find((provider) => provider.id === providerId);
  if (!current) {
    return { ok: false, state, reason: "not_found" };
  }

  const phone = input.phone.trim();
  const phoneTaken = state.providers.some(
    (provider) =>
      provider.id !== providerId &&
      normalizePhone(provider.phone) === normalizePhone(phone),
  );
  if (phoneTaken) {
    return { ok: false, state, reason: "phone_taken" };
  }

  const nextPassword = input.password?.trim();
  const provider: PrototypeProvider = {
    ...current,
    name: input.name.trim(),
    phone,
    password: nextPassword ? nextPassword : current.password,
  };

  return {
    ok: true,
    provider,
    state: {
      ...state,
      providers: state.providers.map((item) =>
        item.id === providerId ? provider : item,
      ),
    },
  };
}
