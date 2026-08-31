import json
import urllib.request

vids = ["U454lXjpKi8", "Bah_PB9Ga4A", "B7ucTJxNgmA"]
for v in vids:
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={v}&format=json"
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            d = json.loads(r.read())
            print(v, "OK", d.get("title", "")[:60])
    except Exception as ex:
        print(v, "FAIL", str(ex)[:80])