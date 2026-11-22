"""Rename underscore-prefixed paths in ./out (e.g. /_next/) for hosts that reserve them, rewriting every reference."""
import os, re, shutil, sys
root = sys.argv[1] if len(sys.argv) > 1 else "out"
reps = [("/_next/", "/nx/"), ("_buildManifest.js", "bm.js"), ("_ssgManifest.js", "sm.js"),
        ("pages/_app-", "pages/app0-"), ("pages/_error-", "pages/error0-"), ("app/_not-found/page-", "app/not-found0/page-")]
# 1. rewrite text files
for d, _, fs in os.walk(root):
    for f in fs:
        if f.endswith((".html", ".txt", ".js", ".css", ".json", ".xml")):
            p = os.path.join(d, f); s = open(p, encoding="utf-8").read(); o = s
            for a, b in reps: s = s.replace(a, b)
            if s != o: open(p, "w", encoding="utf-8").write(s)
# 2. rename paths (deepest first)
ren = {"_next": "nx", "_buildManifest.js": "bm.js", "_ssgManifest.js": "sm.js", "_not-found": "not-found0"}
for d, ds, fs in os.walk(root, topdown=False):
    for n in fs + ds:
        new = ren.get(n) or (re.sub(r"^_app-", "app0-", n) if n.startswith("_app-") else re.sub(r"^_error-", "error0-", n) if n.startswith("_error-") else None)
        if new: shutil.move(os.path.join(d, n), os.path.join(d, new))
left = [os.path.join(d, n) for d, ds, fs in os.walk(root) for n in fs + ds if n.startswith("_")]
print("remaining underscore paths:", left)
