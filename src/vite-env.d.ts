/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base: http://localhost:8788 (dev) or "" (production → same-origin /api/save) */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
