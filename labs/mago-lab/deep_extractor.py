from __future__ import annotations

from typing import Any


async def extract_deep(page, route: str, base_url: str = "https://gerador.pro") -> dict[str, Any]:
    await page.goto(f"{base_url}/{route.lstrip('/')}", wait_until="domcontentloaded")
    await page.wait_for_load_state("networkidle")

    data = await page.evaluate(
        """() => {
          return {
            route: window.location.pathname,
            url: window.location.href,
            title: document.title,
            links: Array.from(document.querySelectorAll('a')).map((a) => ({
              text: (a.innerText || a.textContent || '').trim(),
              href: a.href || ''
            })),
            buttons: Array.from(document.querySelectorAll('button,input[type="submit"],input[type="button"]')).map((el) => ({
              text: (el.innerText || el.value || '').trim(),
              id: el.id || '',
              name: el.name || ''
            })),
            forms: Array.from(document.querySelectorAll('form')).map((form) => ({
              action: form.action || '',
              method: form.method || 'get',
              inputs: Array.from(form.querySelectorAll('input, select, textarea')).map((el) => ({
                name: el.name || '',
                id: el.id || '',
                type: el.type || el.tagName.toLowerCase(),
                value: 'value' in el ? el.value : '',
                placeholder: el.placeholder || '',
                label: el.id ? (document.querySelector(`label[for="${el.id}"]`)?.innerText || '') : '',
                options: el.tagName === 'SELECT' ? Array.from(el.options).map((o) => o.text) : []
              }))
            })),
            headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => h.innerText.trim()),
            images: Array.from(document.querySelectorAll('img')).map((img) => ({
              alt: img.alt || '',
              src: img.src || ''
            }))
          };
        }"""
    )

    if "futbanner" in route.lower():
        edit_link = await page.evaluate(
            """() => {
              const a = Array.from(document.querySelectorAll('a')).find((link) => {
                const href = link.href || '';
                return href.includes('gerar') || href.includes('edit') || href.includes('novo');
              });
              return a ? a.href : null;
            }"""
        )
        if edit_link:
            await page.goto(edit_link, wait_until="domcontentloaded")
            await page.wait_for_load_state("networkidle")
            data["edit_link"] = edit_link
            data["form_structure"] = await page.evaluate(
                """() => Array.from(document.querySelectorAll('form')).map((form) => ({
                  action: form.action || '',
                  method: form.method || 'get',
                  inputs: Array.from(form.querySelectorAll('input, select, textarea')).map((el) => ({
                    name: el.name || '',
                    id: el.id || '',
                    type: el.type || el.tagName.toLowerCase(),
                    placeholder: el.placeholder || '',
                    label: el.id ? (document.querySelector(`label[for="${el.id}"]`)?.innerText || '') : ''
                  }))
                }))"""
            )

    return data
