import { collectLegacyLocalStoragePayload } from "./legacyBridge";
import { runMigrationPipeline } from "./migrations/pipeline";
import type { ModernPlayerState, UnknownSavePayload } from "./types";

function coerceToRecord(rawData: unknown): UnknownSavePayload {
  if (rawData === null || rawData === undefined) return {};
  if (typeof rawData === "string") {
    try {
      const parsed: unknown = JSON.parse(rawData);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as UnknownSavePayload;
      }
    } catch {
      return {};
    }
    return {};
  }
  if (typeof rawData === "object" && !Array.isArray(rawData)) {
    return { ...(rawData as UnknownSavePayload) };
  }
  return {};
}

function mergeWithoutDataLoss(target: UnknownSavePayload, source: UnknownSavePayload): UnknownSavePayload {
  const merged: UnknownSavePayload = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    if (key === "highScore" && typeof merged.highScore === "number" && typeof value === "number") {
      merged.highScore = Math.max(merged.highScore, value);
      continue;
    }
    if (merged[key] === undefined || merged[key] === null) {
      merged[key] = value;
    }
  }
  return merged;
}

/**
 * Safely upgrades any legacy or modern payload to the canonical v6.0.0 structure.
 * Never deletes legacy high scores or usernames.
 */
export function migratePlayerState(rawData: unknown): ModernPlayerState {
  const coerced = coerceToRecord(rawData);
  const scattered = collectLegacyLocalStoragePayload();
  const merged = mergeWithoutDataLoss(coerced, scattered);

  const sessionSeed =
    typeof merged.session === "object" && merged.session && "worldSeed" in (merged.session as object)
      ? String((merged.session as { worldSeed: string }).worldSeed ?? "").trim()
      : typeof scattered.worldSeed === "string"
        ? scattered.worldSeed.trim()
        : "";

  return runMigrationPipeline(merged, sessionSeed);
}
