# Záludnosti

- **Vite dev server spuštěný na pozadí přes `npx vite &` po skončení příkazu běží dál** a drží port. Další spuštění se `--strictPort` pak hlásí „Port is already in use“. Před novým spuštěním zkontroluj a ukonči staré procesy, ve Windows například `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` a hledat `vite` v `CommandLine`.
- **Import CSS v `main.ts` potřebuje `src/vite-env.d.ts`** s `/// <reference types="vite/client" />`, jinak `tsc` hlásí TS2882.
- **npm nainstaloval TypeScript 7** (nový kompilátor v Go). Typecheck s ním funguje. Kdyby se objevila nekompatibilita nástrojů, zkus TypeScript 5.x.
- **`rotatePoint` normalizuje `-0` na `0`** (`+ 0`). Vitest `toEqual` jinak rozlišuje `-0` a `0` a testy rotací padají.
- **`window.confirm` u tlačítka Nové schéma** zablokuje automatizaci prohlížeče (Claude in Chrome). Při automatickém testu ho předem nahraď: `window.confirm = () => true` (nebo `false`).
- **Snímky obrazovky přes Claude in Chrome občas vyprší** (timeout `Page.captureScreenshot`), hlavně u akce `zoom`. Opakovaný běžný snímek projde, stránka nezamrzla.
- **GitHub při založení repozitáře s README vytvoří větev `main`**, která nemá společnou historii s lokální `master`. Po prvním pushi pak výchozí větev ukazuje jen README. Řešení viz `docs/decisions.md` (2026-11-03).
