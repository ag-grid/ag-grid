#!/usr/bin/env python3
"""Mechanical metrics for one column-sizing run. No LLM, no judgement.

These exist so the verifying agent is asked a narrow question against measured facts, rather than
being asked to eyeball size and complexity. Everything here is a count or a grep over the diff
between the template the agent was given and the app it produced.

usage: cs-metrics.py <criterion> <run>   ->  writes runs/<criterion>/<run>/metrics.json
"""

import json
import os
import re
import subprocess
import sys

EVALS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUITE_DIR = os.path.join(EVALS, "suites", "column-sizing")

SRC_EXT = (".ts", ".tsx", ".js", ".jsx", ".css")

# Sizing mechanisms. Presence in the final source, not in the diff — what the app ends up using
# is the question, whether the agent added it or left it there.
MECHANISMS = {
    "flex": r"\bflex\s*:",
    "initialFlex": r"\binitialFlex\b",
    "width": r"\bwidth\s*:",
    "initialWidth": r"\binitialWidth\b",
    "minWidth": r"\bminWidth\b",
    "maxWidth": r"\bmaxWidth\b",
    "autoSizeStrategy": r"\bautoSizeStrategy\b",
    "fitGridWidth": r"fitGridWidth",
    "fitProvidedWidth": r"fitProvidedWidth",
    "fitCellContents": r"fitCellContents",
    "scaleUpToFitGridWidth": r"\bscaleUpToFitGridWidth\b",
    "columnLimits": r"\bcolumnLimits\b",
    "applyToUiActions": r"\bapplyToUiActions\b",
    "defaultMinWidth": r"\bdefaultMinWidth\b",
    "suppressSizeToFit": r"\bsuppressSizeToFit\b",
    "suppressAutoSize": r"\bsuppressAutoSize\b",
    "sizeColumnsToFit": r"\bsizeColumnsToFit\s*\(",
    "autoSizeColumns": r"\bautoSizeColumns\s*\(",
    "autoSizeAllColumns": r"\bautoSizeAllColumns\s*\(",
    "getColumnState": r"\bgetColumnState\s*\(",
    "applyColumnState": r"\bapplyColumnState\s*\(",
    "resetColumnState": r"\bresetColumnState\s*\(",
    "initialState": r"\binitialState\b",
    "onStateUpdated": r"\bonStateUpdated\b",
}

# Things an experienced developer would not reach for to solve a column-sizing problem.
RED_FLAGS = {
    "ResizeObserver": r"\bResizeObserver\b",
    "windowResizeListener": r"addEventListener\(\s*['\"]resize['\"]",
    "measureText": r"\bmeasureText\b",
    "getBoundingClientRect": r"\bgetBoundingClientRect\b",
    "offsetWidth": r"\boffsetWidth\b",
    "scrollWidth": r"\bscrollWidth\b",
    "canvas": r"createElement\(\s*['\"]canvas['\"]",
    "debounceOrThrottle": r"\b(debounce|throttle)\b",
    "gridKeyRemount": r"<AgGridReact[^>]*\bkey=",
    "locationReload": r"location\.reload\s*\(",
}

HOOKS = ["useState", "useEffect", "useRef", "useMemo", "useCallback"]

GRID_EVENTS = r"\bon(?:GridReady|FirstDataRendered|GridSizeChanged|ColumnResized|RowDataUpdated|StateUpdated|ModelUpdated|ViewportChanged|GridPreDestroyed|CellValueChanged|ComponentStateChanged)\b"


COMMENT = re.compile(r"/\*.*?\*/|//[^\n]*", re.S)


def strip_comments(text):
    """Mechanism detection must not fire on prose.

    An agent that writes "the grid's own autoSizeStrategy measures only rendered rows" in a JSDoc
    while hand-rolling its own sizing would otherwise be recorded as having used autoSizeStrategy —
    the exact opposite of what happened.
    """
    return COMMENT.sub(" ", text)


def read_sources(root):
    """Concatenate every source file under root, skipping dependencies and build output."""
    out = {}
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in ("node_modules", "dist", ".vite")]
        for f in files:
            if f.endswith(SRC_EXT):
                p = os.path.join(base, f)
                rel = os.path.relpath(p, root)
                try:
                    out[rel] = open(p, encoding="utf-8", errors="ignore").read()
                except OSError:
                    pass
    return out


def main():
    criterion, run = sys.argv[1], "%02d" % int(sys.argv[2])
    run_dir = os.path.join(SUITE_DIR, "runs", criterion, run)
    app = os.path.join(run_dir, "app")
    template = os.path.join(SUITE_DIR, "criteria", criterion, "template")

    if not os.path.isdir(app):
        sys.exit("no app at %s" % app)

    diff = subprocess.run(
        ["diff", "-ruN", "-x", "node_modules", "-x", "dist", "-x", "*.tsbuildinfo",
         "-x", "package-lock.json", template, app],
        capture_output=True, text=True,
    ).stdout
    open(os.path.join(run_dir, "diff.patch"), "w").write(diff)

    before, after = read_sources(template), read_sources(app)
    src_after = strip_comments("\n".join(after.values()))
    src_before = strip_comments("\n".join(before.values()))

    added = sum(1 for l in diff.splitlines() if l.startswith("+") and not l.startswith("+++"))
    removed = sum(1 for l in diff.splitlines() if l.startswith("-") and not l.startswith("---"))

    touched = sorted(
        f for f in set(before) | set(after) if before.get(f) != after.get(f)
    )

    def deps(root):
        try:
            pkg = json.load(open(os.path.join(root, "package.json")))
        except OSError:
            return set()
        return set(pkg.get("dependencies", {})) | set(pkg.get("devDependencies", {}))

    metrics = {
        "criterion": criterion,
        "run": int(run),
        "filesTouched": touched,
        "filesTouchedCount": len(touched),
        "linesAdded": added,
        "linesRemoved": removed,
        "dependenciesAdded": sorted(deps(app) - deps(template)),
        "hooks": {
            h: {
                "before": len(re.findall(r"\b%s\b" % h, src_before)),
                "after": len(re.findall(r"\b%s\b" % h, src_after)),
            }
            for h in HOOKS
        },
        "gridEventHandlers": {
            "before": sorted(set(re.findall(GRID_EVENTS, src_before))),
            "after": sorted(set(re.findall(GRID_EVENTS, src_after))),
        },
        "mechanisms": {
            k: {
                "before": bool(re.search(v, src_before)),
                "after": bool(re.search(v, src_after)),
            }
            for k, v in MECHANISMS.items()
        },
        "redFlags": sorted(k for k, v in RED_FLAGS.items() if re.search(v, src_after)),
        "enableDevValidationsAdded": "enableDevValidations" in src_after,
    }

    # Derived summaries, so the verifier does not have to compute them.
    metrics["mechanismsAdded"] = sorted(
        k for k, v in metrics["mechanisms"].items() if v["after"] and not v["before"]
    )
    metrics["mechanismsRemoved"] = sorted(
        k for k, v in metrics["mechanisms"].items() if v["before"] and not v["after"]
    )
    metrics["gridEventHandlersAdded"] = sorted(
        set(metrics["gridEventHandlers"]["after"]) - set(metrics["gridEventHandlers"]["before"])
    )

    # capture-console.mjs writes { counts, agGridMessages, errors, warnings, all } where the message
    # lists are plain strings. Reading the wrong shape here fails silently and produces an empty
    # warning list, which reads identically to a clean run -- so the shape is asserted, not guessed.
    console_path = os.path.join(run_dir, "console.json")
    if os.path.exists(console_path):
        try:
            c = json.load(open(console_path))
            messages = list(c.get("agGridMessages", [])) + list(c.get("errors", [])) + list(c.get("warnings", []))
            metrics["consoleRelevant"] = c.get("counts", {}).get("relevant")
            metrics["licenceBannerPresent"] = c.get("licenceBannerPresent")
            metrics["agGridWarnings"] = sorted(
                set(re.findall(r"(?:AG Grid|ag-grid):?\s*(?:warning|error)\s*#?(\d+)", " ".join(messages), re.I))
            )
        except (ValueError, OSError, AttributeError) as e:
            metrics["consoleParseError"] = str(e)

    with open(os.path.join(run_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print("%s/%s  +%d/-%d lines, %d file(s), added=%s removed=%s flags=%s" % (
        criterion, run, added, removed, len(touched),
        ",".join(metrics["mechanismsAdded"]) or "-",
        ",".join(metrics["mechanismsRemoved"]) or "-",
        ",".join(metrics["redFlags"]) or "-",
    ))


if __name__ == "__main__":
    main()
