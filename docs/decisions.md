# Rozhodnutí

## 2026-11-02 · Oponentura PRD v1 (hlediska: pre-mortem, předpoklady, proveditelnost, alternativy a řez)

Souhrn oponentury je i na soukromé stránce https://claude.ai/artifact/Y9222BQnfe2CzK4iqCrzVr. Stránka je snímek ke 2. 11. 2026, platí tento soubor.

- **Odhad a priority:** Odhad je přepsaný z 1–2 h na neověřených 2–3 h a požadavky dostaly priority MUST/SHOULD/COULD (PRD §4.0). Tažení (F12) je SHOULD. Tlačítko Nové schéma (F22) a značky kondenzátor, dioda a zem jsou COULD. **Důvod:** odhad neměl podklad a rozšíření o posun ho překročilo. Bez určeného řezu hrozilo, že se v čase školení nedojde ke kroku „otestováno“.
- **Potvrzení přes `window.confirm`** místo vlastního dialogu. **Důvod:** vlastní dialog neměl vazbu na cíl a přidával do automatu modální stav.
- **Chytrý L-routing (F18):** zvolí se první varianta, H→V nebo V→H, která nevede přes cizí pin. Když vedou přes cizí pin obě, platí H→V. **Důvod:** pevné H→V vytvářelo zdánlivé spoje přes cizí piny a bez uzlů je nešlo odlišit od skutečného spojení.
- **Hit-test (PRD §4.6):** priorita pin > vodič > tělo > prázdno, poloměr zásahu pinu 6 px, vodiče 4 px, práh tažení 4 px. Stisk na pinu vždy začne vodič. **Důvod:** bez pravidel by AI pokaždé rozhodla jinak.
- **Rotace a polarita (PRD §5):** závazná tabulka pozic pinů pro 4 rotace (souřadnice obrazovky, (x, y) → (−y, x)). Pin 0 je + baterie a anoda diody a LED. **Důvod:** testy psané stejnou AI by jinak potvrdily jakýkoli výklad. Tím se zavřela i otevřená otázka A/K.
- **Stavový automat jako čistá funkce** ve vrstvě `editor/` s testy ve Vitestu. Vstup do pokládání zruší výběr, tažení je jedna změna a ukládá se při puštění myši. **Důvod:** nejsložitější logika byla mimo testy, takže `npm test` dával falešný pocit, že je kód otestovaný.
- **Stavový řádek s nápovědou (F23)** a měřitelný cíl „do 2 minut bez vysvětlení“ ověřený chodbovým testem (AK 9). **Důvod:** cíl „za minutu bez návodu“ neměl měřítko a ovládání bylo skryté.
- **Validace při načtení (F21)** je doplněná o úplný výčet. Při jakékoli chybě se dál zahazuje celé schéma, je to vědomé rozhodnutí podle AK 6.

## 2026-11-02 · Implementační plán

- **Vodič se kreslí klik–klik (F16)** a nápověda ve stavovém řádku (F23) je opravená. **Důvod:** F23 uváděla „táhni vodič“, což odporovalo F16. Klik–klik je jednodušší a tažení myší pak znamená jen posun značky.
- **Definice pinů všech 8 značek patří do fáze 1**, i značek s prioritou COULD. **Důvod:** T3 vyžaduje testovat pozice pinů podle referenční tabulky včetně země a stojí to jen pár řádků.

## 2026-11-02 · Implementace (fáze 0–7)

- **Typ značky se jmenuje `PlacedSymbol`**, ne `Symbol`. **Důvod:** `Symbol` by v TypeScriptu zastínil vestavěný globální `Symbol`. PRD §5 je upravené.
- **Chování automatu, které PRD neurčuje** (fáze 3):
  - Začátek kreslení vodiče zruší výběr.
  - Během kreslení vodiče se R a Delete ignorují a pravé tlačítko kreslení zruší, stejně jako u pokládání (F10).
  - Esc v režimu výběru zruší výběr.
  - Volba jiné značky v paletě během pokládání zachová aktuální rotaci. Uživatel to po fázi 4 vyzkoušel a schválil.

  **Důvod:** jednoznačné a nejjednodušší varianty. Žádná z nich není vidět v akceptačních kritériích.
- **Tažení (fáze 6):** během tažení se klávesy ignorují, Esc tažení nevrací zpět. Práh 4 px hlídá controller. Automat dostane `dragMove` až po jeho překročení a mimo režim tažení ho bere jako obyčejný pohyb myši. **Důvod:** PRD chování kláves při tažení neurčuje a vracení zpět by přidalo stav bez vazby na akceptační kritéria.
- **Vzhled značek** podle IEC/ČSN uživatel po fázi 4 zkontroloval a schválil.

## 2026-11-03 · Repozitář a role projektu

- **Projekt je vlastní projekt účastníka školení** (autor je jeden z účastníků, každý účastník dělal jiný projekt). Není to společné zadání ani lektorova ukázka. **Důsledek:** zkušební průchod se stopkami a kontrola `npm install` na školicích strojích jsou bezpředmětné a z `docs/todo.md` jsou vyškrtnuté. PRD §1 a §3 jsou upravené.
- **Výchozí větev na GitHubu je `master`** (https://github.com/proficad/WCC1). Větev `main`, kterou GitHub založil s README, je smazaná. **Zamítnuto:** přejmenovat lokální `master` na `main` a sloučit s README. **Důvod:** bez úprav historie a s menším počtem kroků.

## Zamítnuté námitky

*(zatím žádné)*
