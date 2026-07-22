# Camada de Midia e Media Pack

Data: 2026-07-22

## 1. Objetivo

Esta camada adiciona suporte a assets visuais para:

- banners;
- thumbnails;
- overlays;
- cards de jogo;
- preview de partida;
- geracao de videos derivados;
- dashboards e telas de apresentacao.

## 2. O que a API deve entregar

Por partida, time, competicao e canal, a API deve conseguir fornecer:

- logo;
- badge;
- banner;
- background;
- thumbnail;
- poster;
- paleta de cores;
- nome curto e nome oficial;
- status do jogo;
- horario;
- dados do evento mais recente;
- referencias de clip ou stream, quando houver licenca.

## 3. Regras de conteudo

- logos e imagens podem ser armazenados e servidos como assets;
- videos completos somente com origem e licenca permitida;
- tudo precisa ter rastreabilidade;
- assets devem ter versao e hash;
- nenhum asset deve ser tratado como verdade sem origem.

## 4. Modelo de dados recomendado

Entidades sugeridas:

- `media_assets`
- `media_asset_variants`
- `media_licenses`
- `media_sources`
- `match_media`
- `team_media`
- `competition_media`
- `channel_media`
- `media_packs`

## 5. Tipos de asset

- `logo`
- `badge`
- `banner`
- `thumbnail`
- `background`
- `poster`
- `overlay`
- `graphic_pack`
- `video_clip`
- `stream_preview`

## 6. Media pack por partida

O media pack deve resumir tudo que um gerador de banner ou video precisa:

```json
{
  "match": {
    "id": "123",
    "status": "live",
    "kickoff_at": "2026-07-22T21:30:00Z",
    "home_team": {
      "name": "Internacional",
      "logo": "https://cdn.example.com/teams/internacional.png"
    },
    "away_team": {
      "name": "Cruzeiro",
      "logo": "https://cdn.example.com/teams/cruzeiro.png"
    },
    "competition": {
      "name": "Brasileirao",
      "logo": "https://cdn.example.com/competitions/brasileirao.png"
    },
    "channel": {
      "name": "Premiere",
      "logo": "https://cdn.example.com/channels/premiere.png"
    },
    "score": {
      "home": 1,
      "away": 0
    }
  },
  "graphics": {
    "primary_color": "#D50032",
    "secondary_color": "#0057B8",
    "background": "https://cdn.example.com/media/match-123/bg.jpg",
    "thumbnail": "https://cdn.example.com/media/match-123/thumb.jpg",
    "banner": "https://cdn.example.com/media/match-123/banner.jpg"
  },
  "video": {
    "clip_urls": [],
    "stream_preview": null
  },
  "meta": {
    "license": "internal",
    "source": "futebol_na_tv"
  }
}
```

## 7. Endpoints sugeridos

- `GET /api/v1/matches/:id/media`
- `GET /api/v1/matches/:id/media-pack`
- `GET /api/v1/teams/:id/media`
- `GET /api/v1/competitions/:id/media`
- `GET /api/v1/channels/:id/media`
- `GET /api/v1/assets/:id`
- `GET /api/v1/assets/:id/variants`
- `GET /api/v1/assets/:id/license`

## 8. Composicao automatica

A camada de mídia deve permitir que sistemas externos montem:

- banner de jogo;
- thumb de transmissão;
- arte de live;
- card de resultado;
- preview para video;
- overlay para stream.

## 9. Licenca e governanca

Todo asset precisa registrar:

- origem;
- licenca;
- data de captura;
- hash;
- versao;
- status ativo/inativo.

## 10. Critérios de aceite

- media pack por jogo;
- logos associados a times, canais e competicoes;
- assets com rastreabilidade;
- endpoints de media funcionando;
- docs de uso para gerador externo;
- sem violar a regra de licenca de video.

