import type {
  PrototypeSeeker,
  PrototypeState,
  RegisterSeekerInput,
} from "./prototype-types";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function clearCurrentSeeker(state: PrototypeState): PrototypeState {
  return { ...state, currentSeekerId: null };
}

export type RegisterSeekerResult =
  | { ok: true; state: PrototypeState; seeker: PrototypeSeeker }
  | { ok: false; state: PrototypeState; reason: "phone_taken" | "invalid" };

export function registerSeeker(
  state: PrototypeState,
  input: RegisterSeekerInput,
): RegisterSeekerResult {
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  const password = input.password;

  if (!name || !phone || !password) {
    return { ok: false, state, reason: "invalid" };
  }

  const taken = (state.seekers ?? []).some(
    (seeker) =>
      seeker.password && normalizePhone(seeker.phone) === phone,
  );
  if (taken) {
    return { ok: false, state, reason: "phone_taken" };
  }

  const seeker: PrototypeSeeker = {
    id: createId("seek"),
    name,
    phone: input.phone.trim(),
    password,
    createdAt: new Date().toISOString(),
  };

  return {
    ok: true,
    seeker,
    state: {
      ...state,
      currentSeekerId: seeker.id,
      seekers: [seeker, ...(state.seekers ?? [])],
    },
  };
}

export type SeekerLoginResult =
  | { ok: true; state: PrototypeState; seeker: PrototypeSeeker }
  | { ok: false; state: PrototypeState; reason: "not_found" | "bad_password" };

export function findSeekerByPhone(
  state: PrototypeState,
  phone: string,
): PrototypeSeeker | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return (
    (state.seekers ?? []).find(
      (seeker) =>
        seeker.password && normalizePhone(seeker.phone) === normalized,
    ) ?? null
  );
}

export function loginSeeker(
  state: PrototypeState,
  phone: string,
  password: string,
): SeekerLoginResult {
  const seeker = findSeekerByPhone(state, phone);
  if (!seeker || !seeker.password) {
    return { ok: false, state, reason: "not_found" };
  }
  if (seeker.password !== password) {
    return { ok: false, state, reason: "bad_password" };
  }
  return {
    ok: true,
    seeker,
    state: { ...state, currentSeekerId: seeker.id },
  };
}

/**
 * Resolve the logged-in seeker for booking/job prototype actions.
 * Updates name/phone from the form when present.
 */
export function resolveSeekerForAction(
  state: PrototypeState,
  input: { name: string; phone: string },
): { state: PrototypeState; seeker: PrototypeSeeker } | null {
  const current = (state.seekers ?? []).find(
    (seeker) => seeker.id === state.currentSeekerId,
  );
  if (!current?.password) {
    return null;
  }
  const name = input.name.trim() || current.name;
  const phone = input.phone.trim() || current.phone;
  const seeker =
    current.name === name && current.phone === phone
      ? current
      : { ...current, name, phone };
  return {
    seeker,
    state: {
      ...state,
      currentSeekerId: seeker.id,
      seekers: (state.seekers ?? []).map((item) =>
        item.id === seeker.id ? seeker : item,
      ),
    },
  };
}
