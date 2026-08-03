# Mago Lab

CLI local para abrir o painel, guardar sessao e extrair rotas/formularios.

## Setup

```bash
cd /www/wwwroot/apifut.vr766.com/labs/mago-lab
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium
```

Ou use o atalho:

```bash
./run.sh routes
./run.sh login
./run.sh extract
```

## Uso

```bash
# Login e salvar state.json
GP_USER='...' GP_PASS='...' python lab.py login

# Listar rotas do map.json
python lab.py routes

# Abrir uma rota
python lab.py open futbanner.php

# Extrair rotas do mapa para JSON
python lab.py extract

# Mapear requests XHR/fetch das rotas
python lab.py hunt

# Inspecionar formularios de uma rota
python lab.py forms futbanner.php
```

## Arquivos

- `lab.py`: comando principal
- `deep_extractor.py`: extracao de links e formularios
- `api_hunter.py`: captura de requests e responses
- `mago_form_scraper.py`: resumo de formularios
- `map.json`: rotas mapeadas
