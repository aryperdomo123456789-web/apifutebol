# Mago Lab - Sistema de Autenticação e Clonagem

Este documento descreve os métodos utilizados pelo **Mago Dev** para realizar a automação, login e extração de dados do painel `gerador.pro`.

## 1. O Laboratório Local

O laboratório utiliza **Playwright** (Python) para simular um navegador real, lidar com popups e persistir a sessão de usuário.

### Dependências
- Python 3.10+
- Playwright

## 2. Script de Automação Principal (`lab.py`)

Este script é responsável pelo login e navegação básica.

```python
import asyncio, json, os, sys, re
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "https://gerador.pro"
STATE = "state.json"

async def kill_popups(page):
    # O painel possui um popup de aviso do Telegram que bloqueia cliques
    await page.evaluate("""() => {
      document.querySelectorAll('.popup-backdrop,.modal-backdrop,[id^=popup]').forEach(e=>e.remove());
      document.body.style.overflow='auto';
    }""")

async def do_login(page):
    await page.goto(f"{BASE}/login.php", wait_until="domcontentloaded")
    await kill_popups(page)
    # Credenciais injetadas via ambiente ou constantes no lab
    await page.fill('input[name="username"]', "FUSION-TV")
    await page.fill('input[name="password"]', "1234@Diogo")
    await page.click('button[type="submit"]')
    await page.wait_for_load_state("domcontentloaded")
    return page.url
```

## 3. Script de Clonagem (`cloner.py`)

Extrai o HTML e o esquema de formulários de cada aba mapeada.

```python
async def clone_page(page, route):
    await page.goto(f"{BASE}/{route}", wait_until="networkidle")
    # Salva o HTML
    html = await page.content()
    # Extrai inputs para a API FUT casar os dados
    forms = await page.evaluate("""() => {
        return Array.from(document.querySelectorAll('form')).map(f => ({
            action: f.action,
            inputs: Array.from(f.querySelectorAll('input, select, textarea')).map(i => ({
                name: i.name, type: i.type, value: i.value
            }))
        }));
    }""")
```

## 4. Integração com API FUT

O objetivo final é usar o `MediaService` da API FUT para preencher automaticamente estes formulários clonados, gerando banners de futebol sem intervenção manual.
