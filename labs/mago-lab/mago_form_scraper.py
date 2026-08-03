from __future__ import annotations

from typing import Any


async def scrape_forms(page) -> dict[str, Any]:
    return await page.evaluate(
        """() => ({
          url: window.location.href,
          title: document.title,
          forms: Array.from(document.querySelectorAll('form')).map((form) => ({
            action: form.action || '',
            method: form.method || 'get',
            fields: Array.from(form.querySelectorAll('input, select, textarea')).map((el) => ({
              name: el.name || '',
              id: el.id || '',
              type: el.type || el.tagName.toLowerCase(),
              value: 'value' in el ? el.value : '',
              placeholder: el.placeholder || '',
              required: !!el.required,
              options: el.tagName === 'SELECT' ? Array.from(el.options).map((o) => o.text) : []
            }))
          }))
        })"""
    )
