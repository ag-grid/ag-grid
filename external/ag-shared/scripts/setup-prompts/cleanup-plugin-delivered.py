#!/usr/bin/env python3
"""Remove plugin-delivered content from .rulesync/ and stale .claude/ output.

Reads the plugin-assignments manifest from the ag-dev-prompts cache (populated
by ``rulesync-fetch/fetch.sh``) and:

1. Removes SYMLINKS from ``.rulesync/{skills,agents,commands}/`` that correspond
   to plugin-delivered items. Actual local files are left untouched.
2. Removes stale generated files from ``.claude/{skills,agents,commands}/``
   that are now delivered by the plugin. These can linger when symlinks were
   removed from ``.rulesync/`` but rulesync's ``--delete`` did not catch them
   (e.g. agents where the category directory in ``.rulesync/`` is empty).

Use ``--verify`` to check both without making changes — useful from CI or
``setup-prompts.sh`` to catch regressions.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
from pathlib import Path

CACHE_ROOT = Path(os.environ.get("AG_DEV_PROMPTS_CACHE", os.path.expanduser("~/.cache/ag-dev-prompts")))
DEFAULT_MANIFEST = CACHE_ROOT / "repo" / ".claude-plugin" / "plugin-assignments.json"

CATEGORIES = {
    "skills": ("skills", True),  # (rulesync dir, is-directory)
    "agents": ("subagents", False),  # Plugin manifest key is "agents"; rulesync source dir is "subagents"
    "commands": ("commands", False),
}
# .claude/ output directory uses "agents" not "subagents" — track separately.
CLAUDE_SUBDIR_OVERRIDE = {"agents": "agents"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--manifest",
        type=Path,
        default=DEFAULT_MANIFEST,
        help=f"Plugin-assignments manifest (default: {DEFAULT_MANIFEST})",
    )
    parser.add_argument(
        "--rulesync",
        type=Path,
        default=Path(".rulesync"),
        help=".rulesync directory (default: .rulesync)",
    )
    parser.add_argument(
        "--claude",
        type=Path,
        default=Path(".claude"),
        help=".claude generated output directory (default: .claude)",
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Do not remove anything; exit non-zero if stale items remain",
    )
    args = parser.parse_args()

    manifest_path = args.manifest
    if not manifest_path.exists():
        print(f"ERROR: manifest not found at {manifest_path}", file=sys.stderr)
        return 1

    manifest = json.loads(manifest_path.read_text())
    plugins = manifest.get("plugins", {})

    plugin_delivered: dict[str, set[str]] = {
        "skills": set(),
        "agents": set(),
        "commands": set(),
    }
    for spec in plugins.values():
        for cat in plugin_delivered:
            for item in spec.get(cat, []):
                plugin_delivered[cat].add(item)

    removed: list[str] = []
    stale: list[str] = []

    # 1. .rulesync/ — remove symlinks for plugin-delivered items
    for cat, (subdir, is_dir) in CATEGORIES.items():
        rulesync_dir = args.rulesync / subdir
        if not rulesync_dir.exists():
            continue
        for item in plugin_delivered[cat]:
            target = rulesync_dir / (item if is_dir else f"{item}.md")
            if not target.is_symlink():
                continue
            if args.verify:
                stale.append(str(target))
            else:
                target.unlink()
                removed.append(str(target))

    # 2. .claude/ — remove stale generated files for plugin-delivered items
    #    (rulesync --delete sometimes misses files when the .rulesync source dir
    #    is empty, so we sweep defensively)
    for cat, (_, is_dir) in CATEGORIES.items():
        claude_subdir = CLAUDE_SUBDIR_OVERRIDE.get(cat, cat)
        claude_dir = args.claude / claude_subdir
        if not claude_dir.exists():
            continue
        for item in plugin_delivered[cat]:
            target = claude_dir / (item if is_dir else f"{item}.md")
            if not target.exists():
                continue
            if args.verify:
                stale.append(str(target))
            else:
                if target.is_dir():
                    shutil.rmtree(target)
                else:
                    target.unlink()
                removed.append(str(target))

    if args.verify:
        if stale:
            print("ERROR: plugin-delivered items still present outside their plugin:", file=sys.stderr)
            for s in stale:
                print(f"  {s}", file=sys.stderr)
            print("\nRun: python3 external/ag-shared/scripts/setup-prompts/cleanup-plugin-delivered.py", file=sys.stderr)
            return 2
        print("✓ .rulesync/ and .claude/ are clean of plugin-delivered duplicates")
        return 0

    if removed:
        print(f"Removed {len(removed)} plugin-delivered items:")
        for r in sorted(removed):
            print(f"  {r}")
    else:
        print("✓ Already clean — no plugin-delivered duplicates to remove")

    return 0


if __name__ == "__main__":
    sys.exit(main())
