# Projekt

Mini editor schémat: jednostránková webová aplikace pro kreslení jednoduchých elektrických schémat (značky IEC/ČSN na mřížce, pravoúhlé vodiče, autosave do `localStorage`). Je to vlastní projekt autora ze školení vývoje s AI. Zadání je v `docs/PRD.md`, všechny fáze z `docs/plan.md` jsou hotové.

# Příkazy

- `npm install`: závislosti (Node 20+, kvůli Vitestu)
- `npm run dev`: vývojový server Vite
- `npm test`: testy Vitest (`src/**/*.test.ts`)
- `npm run typecheck`: `tsc --noEmit`
- `npm run build`: typecheck a produkční build do `dist/`

# Kde co je

- `src/model/`: datový model, geometrie pinů, routing, příkazy, validace a serializace. Bez DOM, s testy.
- `src/editor/`: stavový automat `transition(state, event, deps)`. Bez DOM, s testy.
- `src/view/`: SVG geometrie značek (`symbols.ts`), vykreslení a stavový řádek (`render.ts`).
- `src/controller/`: DOM události, hit-test (`hitTest.ts`), ukládání do `localStorage`.
- `docs/PRD.md`: zadání. `docs/plan.md`: fáze. `docs/decisions.md`: rozhodnutí s důvody. `docs/todo.md`: stav a otevřené věci. `docs/gotchas.md`: záludnosti.
- `README.md`: popis pro člověka.
- Remote: https://github.com/proficad/WCC1, výchozí větev `master`.

# Pravidla

- Na začátku session si přečti `docs/todo.md` → `## Kde jsme skončili` a navaž na první krok.
- Kód a komentáře anglicky, texty v UI česky, komunikace s uživatelem česky.
- Vrstvy `model/` a `editor/` nesmějí sahat na DOM. Testy se píšou jen pro ně (PRD T3), ostatní se ověřuje ručně podle akceptačních kritérií v PRD §7.
- Do SVG markupu nevkládat id ani jiné uložené texty. Data z `localStorage` jsou nedůvěryhodná.
- Commit po každé ucelené fázi. Push jen na pokyn uživatele.
- Chování, které PRD neurčuje, zapsat do `docs/decisions.md` i s důvodem.
