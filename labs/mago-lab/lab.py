#!/usr/bin/env python3
from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path
from typing import Any

from playwright.async_api import async_playwright

from api_hunter import hunt_routes
from deep_extractor import extract_deep
from mago_form_scraper import scrape_forms

BASE_URL = os.environ.get("MAGO_BASE_URL", "https://gerador.pro").rstrip("/")
DIR = Path(__file__).parent
STATE_FILE = DIR / "state.json"
OUT_DIR = DIR / "shots"
OUT_DIR.mkdir(exist_ok=True)
MAP_FILE = DIR / "map.json"
USER = os.environ.get("GP_USER", "FUSION-TV")
PASS = os.environ.get("GP_PASS", "1234@Diogo")


def load_routes() -> list[dict[str, str]]:
    if not MAP_FILE.exists():
        return []
    try:
        data = json.loads(MAP_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    if isinstance(data, list):
        return [row for row in data if isinstance(row, dict) and row.get("h")]
    return []


async def kill_popups(page) -> None:
    await page.evaluate(
        """() => {
          document.querySelectorAll('.popup-backdrop,.modal-backdrop,[id^=popup],[class*="popup"],[id*="modal"]')
            .forEach((e) => e.remove());
          if (document.body) document.body.style.overflow = 'auto';
        }"""
    )


async def new_context(pw, fresh: bool = False):
    browser = await pw.chromium.launch(headless=True)
    kwargs: dict[str, Any] = {"viewport": {"width": 1280, "height": 1800}}
    if STATE_FILE.exists() and not fresh:
        kwargs["storage_state"] = str(STATE_FILE)
    return browser, await browser.new_context(**kwargs)


async def do_login(page) -> str:
    await page.goto(f"{BASE_URL}/login.php", wait_until="domcontentloaded")
    await kill_popups(page)
    await page.fill('input[name="username"]', USER)
    await page.fill('input[name="password"]', PASS)
    await page.click('button[type="submit"]')
    await page.wait_for_load_state("domcontentloaded")
    return page.url


async def cmd_login(args) -> int:
    async with async_playwright() as pw:
        browser, ctx = await new_context(pw, fresh=True)
        page = await ctx.new_page()
        url = await do_login(page)
        await ctx.storage_state(path=str(STATE_FILE))
        await browser.close()
        print(f"OK -> {url}")
    return 0


async def cmd_routes(args) -> int:
    for row in load_routes():
        print(f"{row.get('t', '')} -> {row.get('h', '')}")
    return 0


async def cmd_open(args) -> int:
    route = args.route.lstrip("/")
    async with async_playwright() as pw:
        browser, ctx = await new_context(pw)
        page = await ctx.new_page()
        await page.goto(f"{BASE_URL}/{route}", wait_until="domcontentloaded")
        await kill_popups(page)
        print(page.url)
        if args.screenshot:
            target = OUT_DIR / args.screenshot
            await page.screenshot(path=str(target), full_page=True)
            print(f"screenshot -> {target}")
        await browser.close()
    return 0


async def cmd_extract(args) -> int:
    routes = load_routes() or [{"h": "index.php"}]
    out: dict[str, Any] = {}
    async with async_playwright() as pw:
        browser, ctx = await new_context(pw)
        page = await ctx.new_page()
        for row in routes:
            route = row["h"]
            out[route] = await extract_deep(page, route, base_url=BASE_URL)
        await browser.close()
    target = Path(args.out or (DIR / "mago_extraction.json"))
    target.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved -> {target}")
    return 0


async def cmd_hunt(args) -> int:
    routes = [r["h"] for r in load_routes()] or ["index.php"]
    async with async_playwright() as pw:
        browser, ctx = await new_context(pw)
        page = await ctx.new_page()
        report = await hunt_routes(page, routes, base_url=BASE_URL)
        await browser.close()
    target = Path(args.out or (DIR / "mago_network.json"))
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"saved -> {target}")
    return 0


async def cmd_forms(args) -> int:
    route = args.route.lstrip("/")
    async with async_playwright() as pw:
        browser, ctx = await new_context(pw)
        page = await ctx.new_page()
        await page.goto(f"{BASE_URL}/{route}", wait_until="domcontentloaded")
        await kill_popups(page)
        data = await scrape_forms(page)
        await browser.close()
    print(json.dumps(data, ensure_ascii=False, indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Mago Lab CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("login", help="faz login e salva state.json")
    sub.add_parser("routes", help="lista rotas do map.json")

    op = sub.add_parser("open", help="abre uma rota especifica")
    op.add_argument("route")
    op.add_argument("--screenshot")

    ex = sub.add_parser("extract", help="extrai rotas do mapa")
    ex.add_argument("--out")

    hn = sub.add_parser("hunt", help="captura requests/xhr das rotas")
    hn.add_argument("--out")

    fm = sub.add_parser("forms", help="mostra a estrutura de formularios")
    fm.add_argument("route")

    return parser


async def dispatch(args) -> int:
    table = {
        "login": cmd_login,
        "routes": cmd_routes,
        "open": cmd_open,
        "extract": cmd_extract,
        "hunt": cmd_hunt,
        "forms": cmd_forms,
    }
    return await table[args.cmd](args)


def main() -> int:
    args = build_parser().parse_args()
    return asyncio.run(dispatch(args))


if __name__ == "__main__":
    raise SystemExit(main())
