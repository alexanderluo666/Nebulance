/**
 * Safely upgrades any legacy or modern payload to the canonical v6.0.0 structure.
 *
 * Legacy v1.0.0 – v3.0.0 only stored `highScore` (and optionally `username`).
 * Missing `version` is treated as v1.0.0. High scores are never reset.
 */
export { migratePlayerState } from "./migratePlayerState";
