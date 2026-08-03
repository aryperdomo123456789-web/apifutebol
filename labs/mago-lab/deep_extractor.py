import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

BASE_URL = "https://gerador.pro"
STATE_FILE = "/tmp/browser/gerador/state.json"
OUT_FILE = "/tmp/browser/gerador/mago_extraction.json"

async def extract_deep(page, route):
    print(f"Deep Extraction: {route}")
    try:
        await page.goto(f"{BASE_URL}/{route}", wait_until="networkidle")
        
        # O futbanner.php parece ser uma vitrine de modelos. Precisamos clicar neles ou ver os links.
        data = await page.evaluate(\"\"\"() => {
            const results = {
                route: window.location.pathname,
                title: document.title,
                links: Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText, href: a.href })),
                models: Array.from(document.querySelectorAll('.card, .thumbnail, [data-id]')).map(el => ({
                    id: el.getAttribute('data-id') || el.id,
                    text: el.innerText.trim(),
                    img: el.querySelector('img')?.src
                }))
            };
            return results;
        }\"\"\")
        
        # Se for uma pág de seleção de modelo (como futbanner), vamos tentar entrar em um modelo
        if \"futbanner\" in route:
            edit_link = await page.evaluate(\"\"\"() => {
                const a = Array.from(document.querySelectorAll('a')).find(a => a.href.includes('gerar') || a.href.includes('edit'));
                return a ? a.href : null;
            }\"\"\")
            if edit_link:
                await page.goto(edit_link, wait_until=\"networkidle\")
                form_data = await page.evaluate(\"\"\"() => {
                    return Array.from(document.querySelectorAll('form')).map(f => ({
                        action: f.action,
                        method: f.method,
                        inputs: Array.from(f.querySelectorAll('input, select, textarea')).map(i => ({
                            name: i.name,
                            type: i.type,
                            label: document.querySelector(`label[for=\"${i.id}\"]`)?.innerText || i.placeholder || i.name,
                            options: i.tagName === 'SELECT' ? Array.from(i.options).map(o => o.text) : []
                        }))
                    }));
                }\"\"\")
                data['form_structure'] = form_data
        
        return data
    except Exception as e:
        return {\"error\": str(e), \"route\": route}

async def main():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(
            storage_state=STATE_FILE if os.path.exists(STATE_FILE) else None,
            viewport={\"width\": 1280, \"height\": 1800}
        )
        page = await context.new_page()
        for r in [\"futbanner.php\", \"esportes.php\", \"lote.php\"]:
            results[r] = await extract_deep(page, r)
        await browser.close()

if __name__ == \"__main__\":
    asyncio.run(main())
