# TODO

## Kde jsme skončili

**2026-11-03** · session `0a494916-b57e-4507-901e-605169419001` · větev `master` @ `eb500c1` (před commitem tohoto zápisu) · prompty 47/47

**Na čem se dělalo:** Od nápadu přes PRD, oponenturu a implementační plán k hotovému editoru. Všech 8 fází z `docs/plan.md` je hotových, každá je jeden commit a všechno je pushnuté na GitHub (`origin/master`).

**Rozdělané:** nic, vše hotové a commitnuté.

**První krok příště:** Rozhodni, jestli chceš udělat volitelné kroky z `## Otevřené otázky` a `## Nápady` níž. Kód podle PRD žádnou práci nevyžaduje. Pro kontrolu stavu `npm install`, `npm test` (45 testů) a `npm run dev`.

**Důsledky dnešních rozhodnutí:**
- Projekt je tvůj vlastní projekt ze školení, ne společné zadání. Zkušební průchod a kontrola `npm install` na školicích strojích proto padly (`docs/decisions.md`, 2026-11-03).
- Výchozí větev na GitHubu je `master`, `main` neexistuje (`docs/decisions.md`).
- Na GitHub se pushuje ručně, až když to uživatel řekne.

**Čeká na uživatele:** nic povinného.

**Neověřeno:**
- AK 9 (chodbový test s lidmi) neproběhl.
- Rotaci 270° jsem v prohlížeči neviděl, pokrývá ji jen unit test.
- Stránka pro tým na claude.ai je snímek z doby oponentury a neobsahuje plán ani implementaci.

## Otevřené otázky

- **AK 9, chodbový test:** zvládne nováček ovládání jen s nápovědou ve stavovém řádku? · **Co chybí:** 2–3 lidé, kteří editor neviděli. · **Jak se to zjistí:** `npm run dev`, zadání „nakresli baterii, spínač, rezistor a LED v okruhu“, stopky, bez rad. Když uspějí méně než 2 ze 3, doplnit nápovědu, nebo změnit chování F8 (pokládání po položení skončí).

## Odloženo

- Překryv značek při tažení: zatím povolený (PRD §8).

## Nápady (nerozhodnuto)

- Vodič k otočené zemi vede přes tělo značky. PRD to povoluje (necíl), jen to vypadá nezvykle. Řešení by bylo, aby routing bral těla značek jako překážky (v2).
- Aktualizovat stránku pro tým (odkaz v `docs/decisions.md`) o plán a výsledek implementace, nebo ji smazat.
- Nezávislé review celé větve přes `/codex-review`.
