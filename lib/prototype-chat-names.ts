import type {
  ChatParticipant,
  ChatThread,
  PrototypeState,
} from "./prototype-types";

export function participantKey(participant: ChatParticipant): string {
  return `${participant.role}:${participant.id}`;
}

/** URL-safe thread id (no colons/dots) for App Router dynamic segments. */
export function makeThreadId(
  a: ChatParticipant,
  b: ChatParticipant,
): string {
  const part = (participant: ChatParticipant) =>
    `${participant.role}_${participant.id}`;
  return [part(a), part(b)].sort().join("__");
}

export function resolveParticipantName(
  state: PrototypeState,
  participant: ChatParticipant,
): string {
  if (participant.role === "admin") {
    return "Serveo Admin";
  }
  if (participant.role === "provider") {
    return (
      state.providers.find((provider) => provider.id === participant.id)
        ?.name ?? "Provider"
    );
  }
  return (
    (state.seekers ?? []).find((seeker) => seeker.id === participant.id)
      ?.name ?? "Seeker"
  );
}

export function displayNameForParticipant(
  state: PrototypeState,
  participant: ChatParticipant,
  thread?: ChatThread,
): string {
  const key = participantKey(participant);
  const fromThread = thread?.participantNames?.[key]?.trim();
  if (fromThread && fromThread !== "Seeker" && fromThread !== "Provider") {
    return fromThread;
  }
  return resolveParticipantName(state, participant);
}

export function snapshotParticipantNames(
  state: PrototypeState,
  participants: ChatParticipant[],
  previous?: Record<string, string>,
): Record<string, string> {
  const names = { ...(previous ?? {}) };
  for (const participant of participants) {
    const key = participantKey(participant);
    const resolved = resolveParticipantName(state, participant);
    if (resolved !== "Seeker" && resolved !== "Provider") {
      names[key] = resolved;
    } else if (!names[key]) {
      names[key] = resolved;
    }
  }
  return names;
}
