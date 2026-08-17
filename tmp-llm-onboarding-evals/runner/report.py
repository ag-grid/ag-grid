#!/usr/bin/env python3
"""Synthesise all harvested runs into results.csv and report.md.

Run folders are immutable evidence. Everything here is recomputed from them on every
invocation, so definitions can change without re-running any agents.

Only the per-check pass/fail verdicts come from an LLM. Everything else below is a
deterministic grep over the produced source or the transcript.
"""

import csv
import json
import os
import re
import sys

EVALS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUITE = sys.argv[1] if len(sys.argv) > 1 else "onboarding-v1"
SUITE_DIR = os.path.join(EVALS, "suites", SUITE)
RUNS = os.path.join(SUITE_DIR, "runs")
OUT = os.path.join(SUITE_DIR, "results")

# Deprecated / removed symbols, each confirmed against packages/ag-grid-*/src.
# version = the release the deprecation landed in, used for the recency correlation.
DEPRECATED = {
    "suppressLoadingOverlay": "32",
    "enableFillHandle": "32.2",
    "enableRangeHandle": "32.2",
    "enableRangeSelection": "32.2",
    "suppressMultiRangeSelection": "32.2",
    "suppressClearOnFillReduction": "32.2",
    "fillHandleDirection": "32.2",
    "fillOperation": "32.2",
    "suppressRowClickSelection": "32.2",
    "suppressRowDeselection": "32.2",
    "rowMultiSelectWithClick": "32.2",
    "groupSelectsChildren": "32.2",
    "groupSelectsFiltered": "32.2",
    "suppressCopySingleCellRanges": "32.2",
    "suppressCopyRowsToClipboard": "32.2",
    "onRangeSelectionChanged": "32.2",
    "onRangeDeleteStart": "32.2",
    "onRangeDeleteEnd": "32.2",
    "checkboxSelection": "32.2",
    "headerCheckboxSelection": "32.2",
    "headerCheckboxSelectionFilteredOnly": "32.2",
    "headerCheckboxSelectionCurrentPageOnly": "32.2",
    "showDisabledCheckboxes": "32.2",
    "groupRemoveSingleChildren": "33",
    "groupRemoveLowestSingleChildren": "33",
    "suppressRowGroupHidesColumns": "33",
    "suppressMakeColumnVisibleAfterUnGroup": "33",
    "RangeSelectionModule": "33",
    "rowGroupingHierarchy": "34.3",
    # removed outright
    "frameworkComponents": "removed",
    "reactUi": "removed",
}

LEGACY_CSS = re.compile(r"ag-grid\.css|ag-theme-[\w-]*\.css|['\"]ag-theme-[\w-]+['\"]")


def read_source(app_dir):
    src = {}
    for root, dirs, files in os.walk(app_dir):
        dirs[:] = [d for d in dirs if d != "node_modules"]
        for f in files:
            if f.endswith((".ts", ".tsx", ".js", ".jsx", ".css", ".html")):
                p = os.path.join(root, f)
                src[os.path.relpath(p, app_dir)] = open(p, encoding="utf-8", errors="ignore").read()
    return src


def editing_model(blob):
    if "onCellEditRequest" in blob and "readOnlyEdit" in blob:
        return "app-owned (readOnlyEdit + onCellEditRequest)"
    if "onCellValueChanged" in blob:
        return "grid-owned then synced (onCellValueChanged)"
    if "valueSetter" in blob:
        return "grid-owned (valueSetter)"
    if "editable" in blob:
        return "grid-owned (field)"
    return "n/a"


def module_strategy(blob):
    has_all = "AllCommunityModule" in blob or "AllEnterpriseModule" in blob
    granular = set(re.findall(r"\b([A-Z]\w+Module)\b", blob)) - {
        "AllCommunityModule", "AllEnterpriseModule", "ModuleRegistry", "ValidationModule",
    }
    registers = "registerModules" in blob or "modules=" in blob or "modules:" in blob
    if not registers:
        return "none"
    if has_all and granular:
        return "mixed"
    if has_all:
        return "all-bundle"
    return "granular" if granular else "none"


def collect():
    rows = []
    if not os.path.isdir(RUNS):
        return rows
    for criterion in sorted(os.listdir(RUNS)):
        cdir = os.path.join(RUNS, criterion)
        if not os.path.isdir(cdir):
            continue
        for run in sorted(os.listdir(cdir)):
            rdir = os.path.join(cdir, run)
            # Code and browser checks are verified by separate agents (see verify-code.sh /
            # verify-browser.sh) and land in separate files. A legacy combined result.json is
            # still read if present.
            res = {}
            for fn in ("result.json", "result-code.json", "result-browser.json"):
                p = os.path.join(rdir, fn)
                if os.path.exists(p):
                    res.update(json.load(open(p)))
            if not res:
                continue
            meta = {}
            mp = os.path.join(rdir, "meta.json")
            if os.path.exists(mp):
                meta = json.load(open(mp))

            def _cost(fn):
                p = os.path.join(rdir, fn)
                if not os.path.exists(p):
                    return 0.0
                try:
                    return json.load(open(p)).get("total_cost_usd") or 0.0
                except Exception:
                    return 0.0

            src = read_source(os.path.join(rdir, "app"))
            blob = "\n".join(src.values())
            code_src = "\n".join(v for k, v in src.items() if k.endswith((".ts", ".tsx", ".js", ".jsx")))

            found = sorted({s for s in DEPRECATED if re.search(rf"\b{re.escape(s)}\b", code_src)})

            code = res.get("codeChecks", [])
            brow = res.get("browserChecks", [])
            for c in code + brow:
                c.setdefault("id", "?")
            code_fail = [c for c in code if c["result"] == "fail"]
            brow_fail = [c for c in brow if c["result"] == "fail"]

            rows.append({
                "criterion": criterion,
                "run": run,
                "agGridVersion": meta.get("agGridVersion", ""),
                "codePass": len(code) - len(code_fail),
                "codeTotal": len(code),
                "browserPass": len(brow) - len(brow_fail),
                "browserTotal": len(brow),
                # The works-but-outdated case: it behaves correctly but the code is wrong.
                "worksButOutdated": bool(not brow_fail and (code_fail or found)),
                "deprecatedSymbols": ";".join(found),
                "moduleStrategy": module_strategy(blob),
                "editingModel": editing_model(code_src),
                "legacyCss": bool(LEGACY_CSS.search(blob)),
                "enableDevValidations": meta.get("enableDevValidationsPresent"),
                "fetchedDocs": meta.get("fetchedDocs"),
                "ranBuildOrTypecheck": meta.get("ranBuildOrTypecheck"),
                "numTurns": meta.get("numTurns"),
                "costUsd": meta.get("costUsd"),
                "verifyCodeUsd": _cost("verify-code.json"),
                "verifyBrowserUsd": _cost("verify-browser.json"),
                "failedChecks": " ".join(c["id"] for c in code_fail + brow_fail),
                "blocked": " ".join(c["id"] for c in code + brow if c["result"] == "blocked"),
                "_checkIds": [(criterion, c["id"], c["result"]) for c in code + brow],
            })
    return rows


def report(rows):
    n = len(rows)
    if not n:
        return "No harvested runs found.\n"
    L = []
    L.append("# AG Grid onboarding evals — results\n")
    L.append(f"{n} run(s) across {len({r['criterion'] for r in rows})} criteria. "
             "Regenerated from run folders; do not hand-edit.\n")

    clean = [r for r in rows if not r["deprecatedSymbols"] and r["codePass"] == r["codeTotal"]
             and r["browserPass"] == r["browserTotal"]]
    silent = [r for r in rows if r["worksButOutdated"]]
    broken = [r for r in rows if r["browserPass"] < r["browserTotal"]]

    L.append("## Headline\n")
    L.append(f"- Fully correct: **{len(clean)}/{n}**")
    L.append(f"- Works but outdated (all browser checks pass, code wrong): **{len(silent)}/{n}**")
    L.append(f"- Broken (a browser check fails): **{len(broken)}/{n}**\n")

    L.append("## Per criterion\n")
    L.append("| Criterion | Run | Code | Browser | Outdated | Deprecated symbols | Modules |")
    L.append("| --- | --- | --- | --- | --- | --- | --- |")
    for r in rows:
        L.append(f"| {r['criterion']} | {r['run']} | {r['codePass']}/{r['codeTotal']} | "
                 f"{r['browserPass']}/{r['browserTotal']} | {'yes' if r['worksButOutdated'] else 'no'} | "
                 f"{r['deprecatedSymbols'] or '—'} | {r['moduleStrategy']} |")
    L.append("")

    freq = {}
    for r in rows:
        for s in filter(None, r["deprecatedSymbols"].split(";")):
            freq[s] = freq.get(s, 0) + 1
    L.append("## Deprecated symbol frequency\n")
    if freq:
        L.append("| Symbol | Deprecated in | Runs |")
        L.append("| --- | --- | --- |")
        for s, c in sorted(freq.items(), key=lambda kv: -kv[1]):
            L.append(f"| `{s}` | v{DEPRECATED[s]} | {c} |")
    else:
        L.append("None found in any run.")
    L.append("")

    def rate(key):
        vals = [r[key] for r in rows if r[key] is not None]
        return f"{sum(1 for v in vals if v)}/{len(vals)}" if vals else "n/a"

    L.append("## Informational\n")
    L.append(f"- Called `enableDevValidations()` unprompted: **{rate('enableDevValidations')}**")
    L.append(f"- Fetched ag-grid.com during the run: **{rate('fetchedDocs')}**")
    L.append(f"- Ran a build or typecheck: **{rate('ranBuildOrTypecheck')}**")
    L.append(f"- Used legacy CSS themes: **{rate('legacyCss')}**")
    strat = {}
    for r in rows:
        strat[r["moduleStrategy"]] = strat.get(r["moduleStrategy"], 0) + 1
    L.append(f"- Module strategy: {', '.join(f'{k} {v}' for k, v in sorted(strat.items()))}")
    edit = {}
    for r in rows:
        if r["criterion"] in ("cell-editing", "app-owned-data-editing"):
            edit.setdefault(r["editingModel"], []).append(f"{r['criterion']}/{r['run']}")
    if edit:
        L.append("- Editing model chosen (not scored — both APIs are official):")
        for k, v in sorted(edit.items()):
            L.append(f"    - {k}: {len(v)} ({', '.join(v)})")
    imp = sum(r["costUsd"] or 0 for r in rows)
    vc = sum(r["verifyCodeUsd"] for r in rows)
    vb = sum(r["verifyBrowserUsd"] for r in rows)
    L.append(f"- Cost: implement ${imp:.2f} + verify-code ${vc:.2f} + verify-browser ${vb:.2f} "
             f"= **${imp + vc + vb:.2f}**\n")

    agg = {}
    for r in rows:
        for crit, cid, res_ in r.pop("_checkIds"):
            agg.setdefault((crit, cid), []).append(res_)
    fails = {k: v for k, v in agg.items() if any(x != "pass" for x in v)}
    L.append("## Checks that failed at least once\n")
    if fails:
        L.append("| Criterion | Check | Failed/blocked | Runs |")
        L.append("| --- | --- | --- | --- |")
        for (crit, cid), v in sorted(fails.items(), key=lambda kv: -sum(1 for x in kv[1] if x != "pass")):
            L.append(f"| {crit} | {cid} | {sum(1 for x in v if x != 'pass')} | {len(v)} |")
    else:
        L.append("Every check passed in every run.")
    L.append("")

    by_crit = {}
    for r in rows:
        by_crit.setdefault(r["criterion"], []).append(r)
    multi = {k: v for k, v in by_crit.items() if len(v) > 1}
    if multi:
        L.append("## Consistency across repeat runs\n")
        L.append("| Criterion | Runs | Clean runs | Verdict |")
        L.append("| --- | --- | --- | --- |")
        for crit, v in sorted(multi.items()):
            ok = sum(1 for r in v if r["codePass"] == r["codeTotal"]
                     and r["browserPass"] == r["browserTotal"] and not r["deprecatedSymbols"])
            verdict = ("always clean" if ok == len(v)
                       else "always fails" if ok == 0 else "INTERMITTENT")
            L.append(f"| {crit} | {len(v)} | {ok}/{len(v)} | {verdict} |")
        L.append("")

    if silent or broken:
        L.append("## Failed checks\n")
        for r in silent + broken:
            if r["failedChecks"]:
                L.append(f"- **{r['criterion']}/{r['run']}** — {r['failedChecks']}")
        L.append("")
    return "\n".join(L)


def main():
    rows = collect()
    os.makedirs(OUT, exist_ok=True)
    if rows:
        with open(os.path.join(OUT, "results.csv"), "w", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
    md = report(rows)
    open(os.path.join(OUT, "report.md"), "w").write(md)
    sys.stdout.write(md)


main()
