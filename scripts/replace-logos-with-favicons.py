#!/usr/bin/env python3
"""Replace tool logo_url values with Google s2 favicon URLs.

Google's favicon service: https://www.google.com/s2/favicons?domain={domain}&sz={N}
- Free, no API key
- Returns 301 redirect to t1.gstatic.com/faviconV2 with the actual favicon
- Returns 404 (via t1.gstatic.com) when the domain has no favicon — the
  <img onError> in components/tool-logo.tsx falls back to a letter avatar then.
"""

import json
from urllib.parse import urlparse

TOOLS_PATH = "data/tools.json"

with open(TOOLS_PATH, "r") as f:
    tools = json.load(f)

changed = 0
for tool in tools:
    url = tool.get("url", "")
    try:
        domain = urlparse(url).hostname or ""
        if domain.startswith("www."):
            domain = domain[4:]
        if not domain:
            continue
        new_logo = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
        if tool.get("logo_url") != new_logo:
            tool["logo_url"] = new_logo
            changed += 1
    except Exception:
        pass

with open(TOOLS_PATH, "w") as f:
    json.dump(tools, f, indent=2, ensure_ascii=False)

print(f"Updated {changed}/{len(tools)} tools with Google s2 favicon URLs")