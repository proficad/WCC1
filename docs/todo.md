# TODO

## Otevřené otázky

- **Předpoklad:** implementace MUST požadavků s AI se vejde do času školení. · **Test:** jeden zkušební průchod podle PRD se stopkami, zapsat čas po MUST, SHOULD a COULD. · **Kritérium zastavení:** když MUST včetně testů nejsou hotové do 90 minut, zúžit MUST, například vynechat F23 nebo chytrý routing.
- **Předpoklad:** nováček zvládne ovládání jen s nápovědou ve stavovém řádku (AK 9). · **Test:** chodbový test se 3 lidmi na prvním funkčním buildu. · **Kritérium zastavení:** když uspěje méně než 2 ze 3, doplnit nápovědu, nebo změnit chování F8 (pokládání po položení skončí).
- **Předpoklad:** na školicích strojích funguje Node a `npm install` (proxy, práva). · **Test:** `npm create vite` a `npm install` na stroji v místě školení. · **Kritérium zastavení:** když to selže, připravit repozitář s `node_modules`, nebo offline cache.

## Odloženo

- Překryv značek při tažení: zatím povolený (PRD §8).
