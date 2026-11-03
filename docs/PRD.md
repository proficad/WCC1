# PRD: Mini editor schémat v prohlížeči

**Stav:** v2 (po oponentuře), implementováno · **Datum:** 2026-11-02 · **Účel:** vlastní projekt účastníka školení vývoje s AI (PRD → implementace)

## 1. Shrnutí

Jednostránková webová aplikace, ve které uživatel kreslí jednoduchá elektrická schémata. Pokládá značky podle IEC/ČSN na mřížku, otáčí je a posouvá a spojuje jejich piny vodiči. Editor vede vodiče sám, pravoúhle. Schéma se průběžně ukládá do prohlížeče.

Rozsah je záměrně malý, aby se na něm dal v čase školení projít celý cyklus od zadání po hotový a otestovaný kód. **Odhad implementace s AI byl 2–3 h a nikdo ho neověřil.** Proto mají požadavky priority (sekce 4.0). Jako první se dokončí všechny MUST včetně jejich testů a teprve potom se pokračuje dál.

## 2. Cíle a necíle

### Cíle
- Nováček nakreslí smyčku baterie, spínač, rezistor, LED **do 2 minut bez vysvětlení**. Pomáhá mu nápověda ve stavovém řádku (F23). Ověřuje se chodbovým testem (AK 9).
- Kód má čistě oddělený datový model a logiku interakce od vykreslování, aby se obojí dalo testovat bez prohlížeče.
- Projekt je malý a srozumitelný, takže se dá projít celý v čase školení.

### Necíle (v1 je výslovně neřeší)
- Undo/redo
- Export (PNG, SVG, PDF), tisk, import a export souborů
- Popisky a hodnoty součástek (R1, 10k)
- Zoom a posun plátna
- Výběr více objektů, kopírování a vkládání
- Spojování vodičů s vodiči, uzly (junction) a ruční úpravy trasy vodiče
- Kontrola kolizí značek (značky se smějí překrývat, vodiče smějí vést přes těla značek)
- Simulace obvodu a elektrická kontrola (ERC)
- Ovládání dotykem a mobilní zařízení
- Značky podle ANSI

## 3. Uživatelé

Uživatel aplikace je kdokoli, kdo zná základní elektrotechnické značky. Aplikace se ovládá myší a klávesnicí na desktopu.

## 4. Funkční požadavky

### 4.0 Priority

| Priorita | Požadavky | Pravidlo |
|---|---|---|
| **MUST** | F1–F11, F13–F21, F23, značky baterie, spínač, rezistor, žárovka, LED, testy T3 | bez nich se nepředvádí |
| **SHOULD** | F12 (tažení) | jen když jsou všechny MUST hotové a otestované |
| **COULD** | F22 (Nové schéma), značky kondenzátor, dioda, zem | když zbude čas |

Bez tažení se značka přesune tak, že se smaže a položí znovu.

### 4.1 Plátno a mřížka
- **F1** Plátno vyplňuje prostor okna vedle palety značek. Vykresluje se přes SVG.
- **F2** Zobrazuje se tečkovaná mřížka s roztečí 20 px (1 mřížková jednotka = 1 gu).
- **F3** Všechny souřadnice v modelu jsou celočíselné v gu. Pozice značek i piny leží vždy na bodech mřížky.

### 4.2 Paleta a značky
- **F4** Paleta obsahuje až 8 značek podle IEC/ČSN (priority podle 4.0):

| Značka | Typ (`kind`) | Piny | Priorita | Poznámka |
|---|---|---|---|---|
| Rezistor | `resistor` | 2 | MUST | obdélník |
| Zdroj (baterie) | `battery` | 2 | MUST | delší čára = + = pin 0 |
| Žárovka | `lamp` | 2 | MUST | kruh s křížem |
| Spínač | `switch` | 2 | MUST | rozpojený kontakt |
| LED | `led` | 2 | MUST | dioda se dvěma šipkami, anoda = pin 0 |
| Kondenzátor | `capacitor` | 2 | COULD | dvě rovnoběžné čáry |
| Dioda | `diode` | 2 | COULD | trojúhelník s čárou, anoda = pin 0 |
| Zem | `ground` | 1 | COULD | pin nahoře |

- **F5** Dvoupinové značky mají v základní orientaci (0°) **pin 0 vlevo v bodě (−2, 0)** a **pin 1 vpravo v bodě (+2, 0)** gu vůči středu. Pin 0 je + baterie a anoda diody a LED, takže při 0° dioda vede proud doprava. Značka zem má pin 0 v bodě (0, −1).
- **F6** Značky se vykreslují jako jednobarevná SVG geometrie definovaná v kódu, ne jako obrázky.

### 4.3 Pokládání značek
- **F7** Kliknutím na značku v paletě se zapne režim pokládání a **zruší se aktuální výběr**. Pod kurzorem se zobrazí poloprůhledný náhled značky přichycený k mřížce.
- **F8** Kliknutím na plátno se značka položí. Režim pokládání zůstane aktivní, aby šlo položit více kusů stejné značky. V režimu pokládání se piny nezvýrazňují a nereagují.
- **F9** Klávesa **R** v režimu pokládání otočí náhled o 90° po směru hodinových ručiček. Položené značky se neotáčejí.
- **F10** Klávesa **Esc** nebo pravé tlačítko myši ukončí režim pokládání.

### 4.4 Výběr, posun, rotace, mazání
- **F11** Kliknutím na značku nebo vodič se objekt vybere. Výběr je zvýrazněný. Kliknutím do prázdna se výběr zruší. Vybraný může být nejvýš jeden objekt. O tom, co klik zasáhne, rozhodují pravidla v 4.6.
- **F12** *(SHOULD)* Značku lze přetáhnout za tělo. Během tažení se přichytává k mřížce a připojené vodiče se průběžně přepočítávají. Celé tažení je **jedna změna modelu** a uloží se až po puštění tlačítka myši.
- **F13** Klávesa **R** otočí vybranou značku o 90° po směru hodinových ručiček kolem jejího středu. Připojené vodiče se přepočítají.
- **F14** Klávesa **Delete** nebo **Backspace** smaže vybraný objekt. Se smazáním značky se smažou i všechny vodiče připojené k jejím pinům.

### 4.5 Vodiče
- **F15** Mimo režim pokládání se pin při najetí myší zvýrazní (malý kroužek).
- **F16** Stisk tlačítka na pinu začne kreslení vodiče. Od pinu ke kurzoru se zobrazuje náhled trasy. Kliknutím na jiný pin se vodič vytvoří. Kliknutí mimo pin nebo **Esc** kreslení zruší.
- **F17** Vodič vždy spojuje dva piny. Model ukládá jen odkazy na piny (`symbolId` a index pinu), trasa se vždy dopočítá.
- **F18** **Trasa (chytrý L-routing):** z bodu A(x1, y1) do bodu B(x2, y2) existují dvě varianty L:
  - **H→V:** vodorovně do (x2, y1), potom svisle do B,
  - **V→H:** svisle do (x1, y2), potom vodorovně do B.

  Zvolí se první varianta, která nevede přes žádný pin kromě A a B, v pořadí H→V, V→H. Když vedou přes cizí pin obě, použije se H→V. Když mají body stejné x nebo y, vznikne rovná úsečka. Trasa je čistá funkce `route(a, b, otherPins)` ve vrstvě `model/`.
- **F19** Jeden pin smí mít více vodičů. Zakázaný je vodič z pinu do téhož pinu a duplicitní vodič mezi stejnou dvojicí pinů v libovolném pořadí. Takový pokus se tiše ignoruje.

### 4.6 Zásah myší (hit-test)
- **H1** Priorita cílů při stisku i kliknutí: **pin > vodič > tělo značky > prázdno**. Pin tedy vyhrává i nad koncem vodiče, který na něm leží.
- **H2** Zásahová plocha pinu má poloměr 6 px kolem bodu pinu, zásahová plocha vodiče 4 px od úsečky. Tělo značky je její obdélník bez okolí pinů.
- **H3** Stisk na pinu vždy začne vodič (F16). Značka se táhne jen za tělo (F12).
- **H4** Tažení začne, až se myš po stisku posune o 4 px nebo víc. Při menším posunu jde o klik.

### 4.7 Ukládání
- **F20** Po každé změně modelu se schéma uloží do `localStorage` pod klíčem `mini-schematic:v1` jako JSON. Tažení (F12) je jedna změna.
- **F21** Při načtení stránky se uložené schéma obnoví. Data se validují podle pravidel F3, F5, F19 a §5: známý `kind`, index pinu v rozsahu, celočíselné souřadnice, platná rotace, unikátní `id`, existující odkazy, žádné vodiče z pinu do téhož pinu ani duplicitní. Když data chybí nebo jsou v čemkoli neplatná, začne se s prázdným plátnem a do konzole se zapíše varování. Aplikace nesmí spadnout.
- **F22** *(COULD)* Tlačítko **Nové schéma** vymaže plátno i uložená data po potvrzení přes `window.confirm`.

### 4.8 Stavový řádek
- **F23** Pod plátnem je stavový řádek s nápovědou podle aktuálního režimu, například:
  - výběr: „Klikni na značku v paletě · klikni na pin a pak na cílový pin · R otočí · Delete smaže“,
  - pokládání: „Klikni pro položení · R otočí · Esc konec“,
  - kreslení vodiče: „Klikni na cílový pin · Esc zruší“.

## 5. Datový model (návrh)

```ts
type Rotation = 0 | 90 | 180 | 270;

interface PlacedSymbol {   // not "Symbol": it would shadow the global Symbol
  id: string;           // unique, e.g. crypto.randomUUID()
  kind: SymbolKind;     // 'resistor' | 'battery' | ... | 'ground'
  x: number;            // center, grid units
  y: number;
  rotation: Rotation;
}

interface PinRef { symbolId: string; pin: number; }

interface Wire { id: string; a: PinRef; b: PinRef; }

interface Schematic { version: 1; symbols: PlacedSymbol[]; wires: Wire[]; }
```

Pozice pinu v absolutních souřadnicích = střed značky + lokální offset pinu otočený o `rotation`. Souřadnice jsou obrazovkové (osa y roste dolů), otočení o 90° po směru hodinových ručiček je (x, y) → (−y, x).

**Závazná referenční tabulka (testovací data pro T3):**

| Lokální offset | 0° | 90° | 180° | 270° |
|---|---|---|---|---|
| pin 0 dvoupinové značky | (−2, 0) | (0, −2) | (2, 0) | (0, 2) |
| pin 1 dvoupinové značky | (2, 0) | (0, 2) | (−2, 0) | (0, −2) |
| pin 0 zemi | (0, −1) | (1, 0) | (0, 1) | (−1, 0) |

## 6. Technické požadavky

- **T1** Vite + TypeScript (strict). Žádný UI framework, DOM a SVG se ovládají přímo.
- **T2** Architektura (vrstvy `model/` a `editor/` nesmějí sahat na DOM):
  - `model/`: čisté funkce (geometrie pinů, rotace, routing, příkazy add/move/rotate/delete, validace, serializace),
  - `editor/`: stavový automat režimů (výběr, pokládání, kreslení vodiče, tažení) jako čistá přechodová funkce `(state, event) → state`, kde události jsou abstraktní (`pointerDown` s výsledkem hit-testu, `key: 'R'`, …),
  - `view/`: vykreslení modelu, náhledů a stavového řádku do SVG a DOM,
  - `controller/`: tenká vrstva, která převádí DOM události na události automatu a provádí hit-test.
- **T3** Testy ve Vitestu pro `model/` a `editor/`, aspoň tyto případy:
  - pozice pinů pro všechny 4 rotace přesně podle referenční tabulky v §5,
  - L-routing: obecný případ, stejné x, stejné y, volba V→H při kolizi H→V s cizím pinem, návrat k H→V při kolizi obou variant,
  - smazání značky smaže připojené vodiče,
  - odmítnutí vodiče pin→tentýž pin a duplicitního vodiče,
  - serializace tam a zpět a odmítnutí neplatných dat (aspoň: špatný JSON, neznámý `kind`, index pinu mimo rozsah, odkaz na neexistující značku),
  - automat: R v režimu pokládání otočí jen náhled, ne vybranou značku; vstup do pokládání zruší výběr; Esc ukončí pokládání i kreslení vodiče; tažení vyvolá jedno uložení.
- **T4** Podporované prohlížeče: aktuální Chrome, Edge a Firefox na desktopu.
- **T5** Spuštění: `npm install`, `npm run dev`, testy přes `npm test`.
- **T6** Kód a komentáře jsou anglicky, texty v UI česky.

## 7. Akceptační kritéria

1. Na prázdné plátno položím baterii, spínač, rezistor a LED a pospojuji je do smyčky čtyřmi vodiči. Všechny vodiče jsou pravoúhlé a končí přesně na pinech.
2. Když otočím rezistor klávesou R, vodiče se přepojí na nové pozice pinů.
3. *(SHOULD)* Když přetáhnu žárovku jinam, vodiče ji následují a značka skončí na mřížce.
4. Když smažu spínač, zmizí i jeho dva vodiče a ostatní zůstanou.
5. Po obnovení stránky (F5) vypadá schéma stejně jako předtím.
6. Když ručně poškodím obsah `localStorage`, aplikace se načte s prázdným plátnem a nespadne.
7. `npm test` projde a pokryje případy z T3.
8. Když položím rezistor a vedu vodič z jeho levého pinu k pinu napravo dole, vodič nevede přes pravý pin rezistoru (použije se V→H).
9. Chodbový test: 2 ze 3 lidí, kteří editor neviděli, nakreslí smyčku z AK 1 do 2 minut bez vysvětlení, jen s nápovědou ve stavovém řádku.

## 8. Otevřené otázky

- Má se při tažení zabránit položení značky přes jinou značku? Zatím je překryv povolený.

## 9. Možná rozšíření (v2+)

Undo/redo, export SVG/PNG, popisky a hodnoty, zoom a posun plátna, uzly a spojování vodičů, ruční úprava tras, víc značek.
