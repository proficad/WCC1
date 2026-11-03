# Mini editor schémat

Jednostránková webová aplikace pro kreslení jednoduchých elektrických schémat. Značky podle IEC/ČSN se pokládají na mřížku, otáčejí se a posouvají a jejich piny se spojují vodiči, které editor vede pravoúhle. Schéma se průběžně ukládá v prohlížeči.

Je to ukázkový projekt ke školení vývoje s AI. Prošel celým cyklem: PRD → oponentura → implementační plán → implementace po fázích s testy. Každá fáze je jeden commit.

## Spuštění

Potřebuješ Node.js 20 nebo novější.

```
npm install
npm run dev
```

Pak otevři adresu, kterou Vite vypíše (obvykle http://localhost:5173).

| Příkaz | Co dělá |
|---|---|
| `npm run dev` | vývojový server |
| `npm test` | testy (Vitest) |
| `npm run typecheck` | kontrola typů |
| `npm run build` | produkční build do `dist/` |

## Ovládání

| Akce | Jak |
|---|---|
| Položit značku | klik na značku v paletě, pak klik do plátna (pokládání pokračuje) |
| Otočit | **R**, při pokládání i u vybrané značky |
| Ukončit pokládání | **Esc** nebo pravé tlačítko |
| Nakreslit vodič | klik na pin, pak klik na cílový pin |
| Vybrat | klik na značku nebo vodič |
| Posunout značku | táhnout za tělo |
| Smazat | **Delete** nebo **Backspace**, se značkou zmizí i její vodiče |
| Začít znovu | tlačítko **Nové schéma** |

Nápověda pro aktuální režim je vždy ve stavovém řádku pod plátnem.

Paleta: rezistor, baterie, žárovka, spínač, LED, kondenzátor, dioda, zem.

## Architektura

Vite + TypeScript (strict), bez UI frameworku. Kód je rozdělený do čtyř vrstev (PRD T2):

| Vrstva | Odpovědnost | DOM |
|---|---|---|
| `src/model/` | datový model, geometrie pinů, vedení vodičů, příkazy, validace a serializace | ne |
| `src/editor/` | stavový automat režimů jako čistá funkce `(state, event) → state` | ne |
| `src/view/` | vykreslení do SVG, geometrie značek, stavový řádek | ano |
| `src/controller/` | převod událostí myši a klávesnice, hit-test, ukládání do `localStorage` | ano |

Testy pokrývají vrstvy bez DOM, tedy `model/` a `editor/`. Ostatní vrstvy se ověřují ručně podle akceptačních kritérií v PRD §7.

## Dokumentace

| Soubor | Obsah |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | zadání: požadavky, priority, datový model, akceptační kritéria |
| [`docs/plan.md`](docs/plan.md) | implementační plán po fázích s kritérii hotovo |
| [`docs/decisions.md`](docs/decisions.md) | rozhodnutí z oponentury a implementace včetně důvodů |
| [`docs/todo.md`](docs/todo.md) | otevřené otázky a odložené věci |
