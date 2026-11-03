# Implementační plán: Mini editor schémat

**Stav:** všechny fáze hotové (2026-11-02), každá je jeden commit: fáze 0 `c7e5859`, 1 `128f252`, 2 `91431d5`, 3 `96f68d7`, 4 `90b21e0`, 5 `593691a`, 6 `0ab9d3b`, 7 `49d9a83`.

Zdroj: `docs/PRD.md` (v2). Pořadí fází odpovídá prioritám v PRD §4.0: nejdřív všechny MUST, pak SHOULD, nakonec COULD. Testy jsou jen ve fázích 1–3 a 6, protože T3 je požaduje jen pro vrstvy `model/` a `editor/`.

Vodič se kreslí klik–klik podle F16: klik na pin, pak klik na cílový pin. Tažení myší znamená jen posun značky.

## Fáze 0: Kostra projektu
- Vite + TypeScript (strict), Vitest, skripty `dev` a `test` (T1, T5).
- Složky `model/`, `editor/`, `view/`, `controller/` podle T2.

**Hotovo, když:** `npm run dev` ukáže prázdnou stránku, `npm test` proběhne bez chyb a `tsc` nehlásí žádné chyby.

## Fáze 1: Model, geometrie
- Typy z §5 a definice pinů pro **všech 8 značek**, i těch COULD. Stojí to pár řádků a T3 vyžaduje testovat zem podle referenční tabulky.
- `pinPosition(symbol, pin)` s rotací (x, y) → (−y, x).
- `route(a, b, otherPins)`: chytrý tvar L podle F18.

**Testy (T3):** pozice pinů pro 4 rotace přesně podle tabulky v §5, routing v obecném případě, při stejném x, při stejném y, volba V→H při kolizi a návrat k H→V, když kolidují obě varianty.
**Hotovo, když:** testy procházejí.

## Fáze 2: Model, příkazy a ukládání
- Příkazy `addSymbol`, `rotateSymbol`, `moveSymbol`, `deleteObject` (smazání značky smaže i její vodiče) a `addWire` (odmítne vodič z pinu do téhož pinu a duplicitní vodič).
- `serialize` / `deserialize` s úplnou validací podle F21.

**Testy (T3):** kaskádové mazání, odmítnutí neplatných vodičů, serializace tam a zpět, odmítnutí neplatných dat (špatný JSON, neznámý `kind`, index pinu mimo rozsah, odkaz na neexistující značku).
**Hotovo, když:** testy procházejí.

## Fáze 3: Editor, stavový automat (bez tažení)
- `(state, event) → state` s režimy výběr, pokládání a kreslení vodiče.
- Události jsou abstraktní: `pointerDown` s výsledkem hit-testu, klávesy `R`, `Esc`, `Delete`, pravé tlačítko.
- Výstupem je i příznak „uložit“, samotné ukládání do `localStorage` provede controller.

**Testy (T3):** R při pokládání otočí jen náhled, vstup do pokládání zruší výběr, Esc ukončí pokládání i kreslení vodiče.
**Hotovo, když:** testy procházejí.

## Fáze 4: Plátno, paleta, pokládání
- SVG plátno s mřížkou 20 px (F1–F3).
- SVG geometrie pro 5 značek MUST (F6).
- Paleta, náhled pod kurzorem, rotace náhledu, ukončení pokládání (F7–F10).
- Controller převádí události DOM na události automatu.

**Hotovo, když:** v prohlížeči jde položit všech 5 značek ve 4 rotacích a Esc nebo pravé tlačítko ukončí pokládání. Ověřuje se ručně.

## Fáze 5: Výběr, vodiče, mazání, ukládání, stavový řádek → milník MUST
- Hit-test podle H1–H3: pin 6 px, vodič 4 px, tělo značky.
- Zvýraznění pinu, náhled trasy vodiče, výběr a jeho zvýraznění.
- R otočí vybranou značku, Delete smaže (F11, F13–F19).
- Autosave a obnova po načtení (F20, F21).
- Stavový řádek (F23).

**Hotovo, když:** ručně projdou AK 1, 2, 4, 5, 6 a 8 a AK 7 (`npm test`) je zelené. Tady je hotové celé MUST a dá se to předvést.

## Fáze 6: Tažení (SHOULD)
- Stav tažení v automatu, práh 4 px (H4), průběžný přepočet vodičů (F12).
- Celé tažení je jedna změna a ukládá se při puštění myši.

**Test (T3):** tažení vyvolá právě jedno uložení.
**Hotovo, když:** projde AK 3 a test.

## Fáze 7: Doplňky (COULD)
- Tlačítko Nové schéma s `window.confirm` (F22).
- SVG geometrie pro kondenzátor, diodu a zem. Piny už existují z fáze 1.

**Hotovo, když:** nové značky jdou položit, otočit a zapojit a Nové schéma vymaže plátno i uložená data.

## Po fázi 5 nebo 6
Chodbový test podle AK 9 se 3 lidmi. Není automatický, je to ruční ověření (viz `docs/todo.md`).
