# AGENTS.md

## Cursor Cloud specific instructions

### Overview

SpeechFix (sermonfix) is a fully client-side PWA for audio repair/enhancement. There is **no backend, no database, no Docker, and no environment variables** needed for local development. The entire app runs in the browser.

### Dev commands

Standard npm scripts — see `package.json`:

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type check | `npm run type-check` |
| Build | `npm run build` |

### Caveats

- **`--legacy-peer-deps`**: Use `npm ci --legacy-peer-deps` (or `npm install --legacy-peer-deps`) when installing dependencies; some packages have peer-dep conflicts.
- **COOP/COEP headers**: The Vite dev server is configured to send `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers (required for SharedArrayBuffer / FFmpeg WASM). These are set in `vite.config.ts` — no manual header setup needed.
- **Pre-existing lint errors**: The codebase has ~37 pre-existing ESLint errors (unused vars, setState-in-effect, etc.). `npm run lint` exits non-zero. `npm run type-check` passes cleanly.
- **Coding rules**: See `.cursor/rules/sermonfix.md` for style constraints (Tailwind-only, German UI labels, no inline styles, Radix primitives for controls, etc.).
- **No automated tests**: The project has no test framework or test files. Validation is done via type-check, lint, and manual browser testing.
