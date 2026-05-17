import type { SaveVersion } from "./types";
import { CURRENT_SAVE_VERSION } from "./types";

const VERSION_ORDER: SaveVersion[] = ["1.0.0", "2.0.0", "3.0.0", "4.0.0", "5.0.0", "6.0.0"];

/** Missing or malformed version strings resolve to v1.0.0. */
export function normalizeVersion(raw: unknown): SaveVersion {
  if (typeof raw !== "string") return "1.0.0";
  const trimmed = raw.trim();
  if (VERSION_ORDER.includes(trimmed as SaveVersion)) {
    return trimmed as SaveVersion;
  }
  const majorMinor = trimmed.match(/^(\d+)\.(\d+)/);
  if (majorMinor) {
    const candidate = `${majorMinor[1]}.${majorMinor[2]}.0` as SaveVersion;
    if (VERSION_ORDER.includes(candidate)) return candidate;
  }
  return "1.0.0";
}

export function compareVersions(a: SaveVersion, b: SaveVersion): number {
  return VERSION_ORDER.indexOf(a) - VERSION_ORDER.indexOf(b);
}

export function isAtLeast(version: SaveVersion, target: SaveVersion): boolean {
  return compareVersions(version, target) >= 0;
}

export function isCurrentVersion(version: SaveVersion): boolean {
  return version === CURRENT_SAVE_VERSION;
}
