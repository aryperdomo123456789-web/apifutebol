from __future__ import annotations

from typing import Any


async def hunt_routes(page, routes: list[str], base_url: str = "https://gerador.pro") -> dict[str, Any]:
    report: dict[str, Any] = {}

    for route in routes:
        seen_requests: list[dict[str, Any]] = []
        seen_responses: list[dict[str, Any]] = []

        def on_request(req):
            if req.resource_type in {"xhr", "fetch", "document"}:
                seen_requests.append(
                    {
                        "method": req.method,
                        "url": req.url,
                        "resource_type": req.resource_type,
                    }
                )

        def on_response(resp):
            if resp.request.resource_type in {"xhr", "fetch", "document"}:
                seen_responses.append(
                    {
                        "status": resp.status,
                        "url": resp.url,
                        "resource_type": resp.request.resource_type,
                    }
                )

        page.on("request", on_request)
        page.on("response", on_response)
        try:
            await page.goto(f"{base_url}/{route.lstrip('/')}", wait_until="networkidle")
            await page.wait_for_timeout(500)
            report[route] = {
                "url": page.url,
                "title": await page.title(),
                "requests": seen_requests,
                "responses": seen_responses,
            }
        finally:
            page.remove_listener("request", on_request)
            page.remove_listener("response", on_response)

    return report
