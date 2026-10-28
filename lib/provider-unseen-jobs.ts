"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function storageKey(providerId: string) {
  return `servio-unseen-jobs:${providerId}`;
}

function emitChange() {
  for (const listener of listeners) listener();
}

export function getUnseenJobIds(providerId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(providerId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

function writeUnseenJobIds(providerId: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(providerId), JSON.stringify(ids));
  } catch {
    // Ignore quota / private-mode failures.
  }
  emitChange();
}

export function addUnseenJob(providerId: string, jobId: string) {
  const id = jobId.trim();
  if (!providerId || !id) return;
  const next = new Set(getUnseenJobIds(providerId));
  if (next.has(id)) return;
  next.add(id);
  writeUnseenJobIds(providerId, [...next]);
}

export function markJobsSeen(providerId: string, jobIds: string[]) {
  if (!providerId || jobIds.length === 0) return;
  const next = new Set(getUnseenJobIds(providerId));
  let changed = false;
  for (const jobId of jobIds) {
    const id = jobId.trim();
    if (!id) continue;
    if (next.delete(id)) changed = true;
  }
  if (!changed) return;
  writeUnseenJobIds(providerId, [...next]);
}

export function subscribeUnseenJobs(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUnseenJobCount(providerId: string | undefined): number {
  return useSyncExternalStore(
    subscribeUnseenJobs,
    () => (providerId ? getUnseenJobIds(providerId).length : 0),
    () => 0,
  );
}

export function useUnseenJobIdSet(providerId: string | undefined): Set<string> {
  const ids = useSyncExternalStore(
    subscribeUnseenJobs,
    () =>
      providerId
        ? getUnseenJobIds(providerId).join("\0")
        : "",
    () => "",
  );
  return new Set(ids ? ids.split("\0") : []);
}
