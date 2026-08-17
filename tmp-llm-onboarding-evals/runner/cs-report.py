#!/usr/bin/env python3
"""Regenerate the column-sizing results from the run folders.

Run folders are immutable evidence; this is recomputed from them on every invocation, so the
definitions below can change without re-running a single agent.

Only usedExpectedApproach and isMinimal come from an LLM. Everything else is arithmetic over
metrics.json, which is itself a set of greps.

usage: cs-report.py
"""

import json
import os
import re
from collections import defaultdict

EVALS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUITE_DIR = os.path.join(EVALS, "suites", "column-sizing")
RUNS = os.path.join(SUITE_DIR, "runs")
OUT = os.path.join(SUITE_DIR, "MEGA-AWESOME-COLUMN-SIZING-AUTO-DISCOVERY-RESULTS.md")

# Stage 1 is cold, stage 2 is primed with the brief. Runs are numbered per stage.
STAGE_OF_RUN = lambda r: "primed" if r >= 50 else "cold"


def load():
    rows = []
    if not os.path.isdir(RUNS):
        return rows
    for criterion in sorted(os.listdir(RUNS)):
        cdir = os.path.join(RUNS, criterion)
        if not os.path.isdir(cdir):
            continue
        for run in sorted(os.listdir(cdir)):
            rdir = os.path.join(cdir, run)
            result = os.path.join(rdir, "result.json")
            if not os.path.exists(result):
                continue
            row = {"criterion": criterion, "run": int(run), "dir": rdir}
            try:
                row.update(json.load(open(result)))
            except ValueError:
                continue
            for name in ("metrics", "meta"):
                p = os.path.join(rdir, "%s.json" % name)
                if os.path.exists(p):
                    try:
                        row[name] = json.load(open(p))
                    except ValueError:
                        row[name] = {}
            rows.append(row)
    return rows


def main():
    rows = load()
    if not rows:
        print("no completed runs yet")
        return

    for r in rows:
        r["stage"] = STAGE_OF_RUN(r["run"])

    stages = sorted({r["stage"] for r in rows}, reverse=True)
    criteria = sorted({r["criterion"] for r in rows})

    L = []
    L.append("# Mega Awesome Column Sizing Auto Discovery Results")
    L.append("")
    L.append("Data regenerated from run folders by `runner/cs-report.py`. Do not hand-edit this file —")
    L.append("edit `ANALYSIS.md` for the narrative, which is spliced in below, or the run folders for the data.")
    L.append("")
    analysis = os.path.join(SUITE_DIR, "ANALYSIS.md")
    if os.path.exists(analysis):
        L.append(open(analysis).read().rstrip())
        L.append("")
    L.append("`approach` = used the mechanism a competent AG Grid developer would have used, per the")
    L.append("criterion's expected-result text. `minimal` = close to the smallest change that does it.")
    L.append("Both come from an LLM judging the diff with evidence; everything else is a grep.")
    L.append("")

    # ---- headline ----------------------------------------------------------------------------
    L.append("## Headline")
    L.append("")
    for stage in stages:
        s = [r for r in rows if r["stage"] == stage]
        ok = sum(1 for r in s if r["usedExpectedApproach"] == "yes")
        mn = sum(1 for r in s if r["isMinimal"] == "yes")
        both = sum(1 for r in s if r["usedExpectedApproach"] == "yes" and r["isMinimal"] == "yes")
        L.append("- **%s** (%d runs): correct approach **%d/%d**, minimal **%d/%d**, both **%d/%d**"
                 % (stage, len(s), ok, len(s), mn, len(s), both, len(s)))
    L.append("")

    # ---- per criterion -----------------------------------------------------------------------
    L.append("## Per criterion")
    L.append("")
    header = "| Criterion | " + " | ".join("%s approach" % s for s in stages) + " |"
    L.append(header)
    L.append("| --- |" + " --- |" * len(stages))
    for c in criteria:
        cells = []
        for stage in stages:
            s = [r for r in rows if r["criterion"] == c and r["stage"] == stage]
            if not s:
                cells.append("—")
            else:
                ok = sum(1 for r in s if r["usedExpectedApproach"] == "yes")
                cells.append("%d/%d" % (ok, len(s)))
        L.append("| %s | %s |" % (c, " | ".join(cells)))
    L.append("")

    # ---- every run ---------------------------------------------------------------------------
    L.append("## Every run")
    L.append("")
    L.append("| Criterion | Run | Stage | Approach | Minimal | +/- lines | Added | Removed | Red flags | AG warnings |")
    L.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for r in sorted(rows, key=lambda r: (r["criterion"], r["run"])):
        m = r.get("metrics", {})
        L.append("| %s | %02d | %s | %s | %s | +%s/-%s | %s | %s | %s | %s |" % (
            r["criterion"], r["run"], r["stage"],
            r["usedExpectedApproach"], r["isMinimal"],
            m.get("linesAdded", "?"), m.get("linesRemoved", "?"),
            ", ".join(m.get("mechanismsAdded", [])) or "—",
            ", ".join(m.get("mechanismsRemoved", [])) or "—",
            ", ".join(m.get("redFlags", [])) or "—",
            ", ".join("#" + w for w in m.get("agGridWarnings", [])) or "—",
        ))
    L.append("")

    # ---- what went wrong ---------------------------------------------------------------------
    L.append("## Runs that did not use the expected approach")
    L.append("")
    bad = [r for r in rows if r["usedExpectedApproach"] == "no"]
    if not bad:
        L.append("None.")
    for r in sorted(bad, key=lambda r: (r["criterion"], r["run"])):
        L.append("### %s run %02d (%s)" % (r["criterion"], r["run"], r["stage"]))
        L.append("")
        L.append("%s" % r.get("summary", ""))
        L.append("")
        L.append("> %s" % r.get("approachEvidence", "").replace("\n", "\n> "))
        L.append("")

    L.append("## Runs judged not minimal")
    L.append("")
    nm = [r for r in rows if r["isMinimal"] == "no"]
    if not nm:
        L.append("None.")
    for r in sorted(nm, key=lambda r: (r["criterion"], r["run"])):
        L.append("- **%s run %02d** (%s) — %s" % (
            r["criterion"], r["run"], r["stage"], r.get("minimalEvidence", "").split("\n")[0][:400]))
    L.append("")

    # ---- behaviour ---------------------------------------------------------------------------
    L.append("## Agent behaviour")
    L.append("")
    devval = sum(1 for r in rows if r.get("metrics", {}).get("enableDevValidationsAdded"))
    docs = sum(1 for r in rows if r.get("meta", {}).get("fetchedDocs"))
    built = sum(1 for r in rows if r.get("meta", {}).get("ranBuildOrTypecheck"))
    cost = sum(r.get("meta", {}).get("costUsd") or 0 for r in rows)
    turns = [r.get("meta", {}).get("numTurns") for r in rows if r.get("meta", {}).get("numTurns")]
    L.append("- Enabled dev validations unprompted: **%d/%d**" % (devval, len(rows)))
    L.append("- Consulted ag-grid.com: **%d/%d**" % (docs, len(rows)))
    L.append("- Ran a build or typecheck: **%d/%d**" % (built, len(rows)))
    if turns:
        L.append("- Turns: median %d, max %d" % (sorted(turns)[len(turns) // 2], max(turns)))
    L.append("- Implementation cost: **$%.2f**" % cost)
    L.append("")

    flags = defaultdict(int)
    for r in rows:
        for f in r.get("metrics", {}).get("redFlags", []):
            flags[f] += 1
    if flags:
        L.append("Red-flag APIs, counted across all runs:")
        L.append("")
        for f, n in sorted(flags.items(), key=lambda kv: -kv[1]):
            L.append("- `%s` — %d run(s)" % (f, n))
        L.append("")

    open(OUT, "w").write("\n".join(L) + "\n")
    print("\n".join(L[:40]))
    print("\n-> %s" % OUT)


if __name__ == "__main__":
    main()
