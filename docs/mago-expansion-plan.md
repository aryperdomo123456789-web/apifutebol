# Plano de Expansão de Fontes - API FUT (Mago Edition)

Com base no mapeamento do laboratório `gerador.pro` e na pesquisa de rede, identificamos as seguintes fontes para expandir a API além do Futebol:

## 1. NBA (Basquete)
- **Fonte Primária:** ESPN Public API (`site.api.espn.com`)
- **Endpoints:**
  - `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard` (Live Scores)
  - `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams` (Assets/Logos)
- **Estratégia:** Criar `EspnBasketballAdapter` no NestJS.

## 2. UFC (MMA)
- **Fonte Primária:** ESPN Public API
- **Endpoints:**
  - `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard`
- **Fonte Secundária:** API-Sports (MMA v1) - `api-sports.io`
- **Estratégia:** Criar `UfcAdapter` com suporte a rankings e cards de luta.

## 3. Fórmula 1 (Racing)
- **Fonte Primária:** API-Sports (Formula-1)
- **Endpoint:** `https://v1.formula-1.api-sports.io/rankings/drivers`
- **Estratégia:** Mapear pilotos e construtores para o Gerador de Banners.

## 4. Legado Gerador.Pro
- O legado não utiliza APIs dinâmicas para NBA/UFC; ele depende de inputs manuais via formulário. 
- **O Pulo do Gato:** A API FUT será SUPERIOR ao legado pois automatizará o que hoje é feito à mão no `gerador.pro`.

---
*Mapeado por Mago Dev - 03/08/2026*
