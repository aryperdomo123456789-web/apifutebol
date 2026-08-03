#!/usr/bin/env python3
import asyncio, json, os, sys, re
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "https://gerador.pro"
DIR  = Path(__file__).parent
STATE = DIR / "state.json"
OUT = DIR / "shots"; OUT.mkdir(exist_ok=True)
USER = os.environ.get("GP_USER", "FUSION-TV")
PASS = os.environ.get("GP_PASS", "1234@Diogo")

async def kill_popups(page):
    await page.evaluate(\"\"\"() => {
      document.querySelectorAll('.popup-backdrop,.modal-backdrop,[id^=popup]').forEach(e=>e.remove());
      document.body.style.overflow='auto';
    }\"\"\")

async def new_ctx(pw, fresh=False):
    b = await pw.chromium.launch(headless=True)
    kw = {\"viewport\": {\"width\":1280,\"height\":1800}}
    if STATE.exists() and not fresh: kw[\"storage_state\"] = str(STATE)
    return b, await b.new_context(**kw)

async def do_login(page):
    await page.goto(f\"{BASE}/login.php\", wait_until=\"domcontentloaded\")
    await kill_popups(page)
    await page.fill('input[name=\"username\"]', USER)
    await page.fill('input[name=\"password\"]', PASS)
    await page.click('button[type=\"submit\"]')
    await page.wait_for_load_state(\"domcontentloaded\")
    return page.url

async def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else \"login\"
    async with async_playwright() as pw:
        b, ctx = await new_ctx(pw, fresh=(cmd==\"login\"))
        page = await ctx.new_page()
        if cmd == \"login\":
            url = await do_login(page)
            await ctx.storage_state(path=str(STATE))
            print(\"OK ->\", url)
        await b.close()
asyncio.run(main())
