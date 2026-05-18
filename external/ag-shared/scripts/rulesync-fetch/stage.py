#!/usr/bin/env python3
"""Stage fetched ag-dev-prompts content into .rulesync/ for non-Claude target generation.

Reads plugin-assignments.json, copies skills/agents/commands from the ag-dev-prompts
cache into .rulesync/ with frontmatter targets: rewritten to exclude claudecode,
so rulesync generate emits those items for Cursor/Codex/Gemini/Copilot only
(Claude already gets them via the plugin).

Shared guides (plugin guides/*.md without underscore prefix) are copied into
.rulesync/rules/ with targets: kept as ['*'] — Claude still receives rules via
rulesync because plugins cannot deliver glob-triggered rules.

Product plugins (ag-charts, ag-grid, ag-studio) are filtered so only the
current repo's product plugin is staged. Non-Claude tools in an ag-grid
checkout should not see ag-charts-specific skills/commands/agents (and vice
versa). Content from other products' plugins that was staged by a previous
run (pre-filter manifest, or product changed) is cleaned up at the end of
``stage()`` based on the diff between the full manifest and what was staged
this run.

Part of AG-17085 Phase 3 (rulesync fetch design); product filtering added
under AG-17098.
"""

from __future__ import annotations
import argparse
import json
import os
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[4]
CACHE_ROOT = Path(os.environ.get("AG_DEV_PROMPTS_CACHE", os.path.expanduser("~/.cache/ag-dev-prompts")))
CACHE_REPO = CACHE_ROOT / "repo"
# Manifest is read from the ag-dev-prompts cache (populated by fetch.sh) — the
# downloaded copy is the source of truth at runtime, so the consumer repo does
# not need its own copy under external/ag-shared/.claude-plugin/.
MANIFEST = CACHE_REPO / ".claude-plugin" / "plugin-assignments.json"
RULESYNC = REPO_ROOT / ".rulesync"
MARKER = RULESYNC / ".fetched-from-ag-dev-prompts"

NON_CLAUDE_TARGETS = ["cursor", "codexcli", "geminicli", "copilot", "agentsmd"]

# Product plugins — only the current repo's product plugin is staged. Keep in
# sync with .claude-plugin/marketplace.json. Other plugins (ag-core, ag-prodeng)
# are generic and staged regardless.
PRODUCT_PLUGINS = {"ag-charts", "ag-grid", "ag-studio"}


def detect_product() -> str:
    """Identify which product this checkout is. Matches the detection rule in
    setup-prompts.sh copy_extra_configs: $AG_PRODUCT env var first, falling
    back to the workspace root's package.json .name field. Exits with a clear
    error if neither source yields a known product name."""
    product = os.environ.get("AG_PRODUCT", "").strip()
    if not product:
        pkg_path = REPO_ROOT / "package.json"
        if pkg_path.is_file():
            try:
                product = json.loads(pkg_path.read_text()).get("name", "").strip()
            except json.JSONDecodeError:
                product = ""
    if product not in PRODUCT_PLUGINS:
        print(
            f"ERROR: cannot detect product from package.json .name "
            f"(got {product!r}); expected one of: {sorted(PRODUCT_PLUGINS)}.\n"
            f"Override with AG_PRODUCT env var if running from a non-standard "
            f"checkout.",
            file=sys.stderr,
        )
        sys.exit(1)
    return product


def included_plugins(manifest: dict, product: str) -> dict:
    """Return the manifest's plugins dict with other products filtered out."""
    return {
        name: spec
        for name, spec in manifest["plugins"].items()
        if name not in PRODUCT_PLUGINS or name == product
    }


def load_manifest() -> dict:
    with open(MANIFEST) as f:
        return json.load(f)


def rewrite_targets(content: str, new_targets: list[str] | str) -> str:
    """Rewrite the `targets:` node inside YAML frontmatter with a new flow-style
    value. Handles three source forms:

    - ``targets: ['*']`` (flow) — single line replaced.
    - ``targets: '*'`` (scalar) — single line replaced.
    - ``targets:\\n  - cursor\\n  - codex`` (block) — the ``targets:`` line plus
      the continuation list items are collapsed to a single flow-style line.

    Returns content unchanged if no frontmatter is found.
    """
    lines = content.split("\n")
    if not lines or lines[0].strip() != "---":
        return content
    end_fm = None
    for i in range(1, min(len(lines), 60)):
        if lines[i].strip() == "---":
            end_fm = i
            break
    if end_fm is None:
        return content

    target_start = None
    target_end = None  # inclusive
    for i in range(1, end_fm):
        stripped = lines[i].lstrip()
        if stripped.startswith("targets:"):
            target_start = i
            value = stripped[len("targets:") :].strip()
            if value in ("", "[]"):
                # Block-style list follows — consume indented '- ...' items.
                j = i + 1
                while j < end_fm:
                    lstripped = lines[j].lstrip()
                    if lstripped.startswith("- ") or lstripped == "-":
                        j += 1
                    else:
                        break
                target_end = j - 1
            else:
                target_end = i
            break

    if isinstance(new_targets, str):
        rendered = new_targets
    else:
        rendered = "[" + ", ".join(f"'{t}'" for t in new_targets) + "]"
    new_line = f"targets: {rendered}"

    if target_start is not None:
        lines[target_start : target_end + 1] = [new_line]
    else:
        lines.insert(end_fm, new_line)
    return "\n".join(lines)


def _replace_as_regular(dst: Path):
    """Ensure dst is not a symlink — if it exists as a symlink or any other
    file/dir, remove it so we can write a fresh regular file/dir."""
    if dst.is_symlink() or dst.exists():
        if dst.is_symlink() or dst.is_file():
            dst.unlink()
        else:
            shutil.rmtree(dst)


def _is_tracked(dst: Path, tracked: set[Path]) -> bool:
    """Return True if dst is currently tracked by git (relative to REPO_ROOT).

    Tracked files are authoritative local content — a plugin guide that
    happens to share a filename with a tracked rule must not silently
    replace it. Mirrors the guard already applied during stale cleanup at
    the bottom of ``stage()``.
    """
    rel = dst.relative_to(REPO_ROOT) if dst.is_absolute() else dst
    return rel in tracked


def stage_file(src: Path, dst: Path, targets: list[str] | str, staged: set[Path], tracked: set[Path]):
    if not src.exists():
        print(f"  WARN: source missing: {src}", file=sys.stderr)
        return
    if _is_tracked(dst, tracked):
        print(
            f"  skipping tracked {dst.relative_to(REPO_ROOT)} "
            f"(plugin would overwrite a local tracked file)",
            file=sys.stderr,
        )
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    _replace_as_regular(dst)
    content = src.read_text()
    content = rewrite_targets(content, targets)
    dst.write_text(content)
    staged.add(dst)


def stage_skill_dir(src: Path, dst: Path, targets: list[str] | str, staged: set[Path], tracked: set[Path]):
    if not src.exists():
        print(f"  WARN: source missing: {src}", file=sys.stderr)
        return
    if _is_tracked(dst, tracked):
        print(
            f"  skipping tracked {dst.relative_to(REPO_ROOT)}/ "
            f"(plugin would overwrite a local tracked skill dir)",
            file=sys.stderr,
        )
        return
    _replace_as_regular(dst)
    shutil.copytree(src, dst)
    staged.add(dst)
    for md in dst.rglob("*.md"):
        content = md.read_text()
        content = rewrite_targets(content, targets)
        md.write_text(content)


def stage(dry_run: bool = False) -> set[Path]:
    manifest = load_manifest()
    staged: set[Path] = set()
    # Track partial destinations to their source plugin so we can detect
    # cross-plugin filename collisions (e.g. two plugins shipping
    # commands/docs/_shared.md) rather than silently overwriting.
    partial_owner: dict[Path, str] = {}

    if not CACHE_REPO.exists():
        print(f"ERROR: cache missing at {CACHE_REPO}. Run fetch.sh first.", file=sys.stderr)
        sys.exit(1)

    if dry_run:
        print("DRY RUN — no files will be written")

    product = detect_product()
    print(f"Staging for product: {product}", file=sys.stderr)
    plugins_to_stage = included_plugins(manifest, product)

    # Snapshot tracked files once and pass through to stage_file / stage_skill_dir
    # so they refuse to overwrite a locally-tracked rule that happens to share a
    # filename with a plugin-contributed item. The stale-cleanup pass below
    # reuses the same snapshot.
    tracked = _tracked_files()

    for plugin_name, plugin in plugins_to_stage.items():
        plugin_src = CACHE_REPO / "plugins" / plugin_name
        if not plugin_src.exists():
            print(f"  WARN: plugin missing in cache: {plugin_src}", file=sys.stderr)
            continue

        for skill_name in plugin.get("skills", []):
            src = plugin_src / "skills" / skill_name
            dst = RULESYNC / "skills" / skill_name
            if dry_run:
                print(f"  skill {plugin_name}/{skill_name} → {dst.relative_to(REPO_ROOT)}")
                staged.add(dst)
            else:
                stage_skill_dir(src, dst, NON_CLAUDE_TARGETS, staged, tracked)

        for agent_name in plugin.get("agents", []):
            src = plugin_src / "agents" / f"{agent_name}.md"
            # Rulesync's source dir for subagents is .rulesync/subagents/, not
            # .rulesync/agents/. The plugin-assignments manifest uses `agents`
            # for consistency with the Claude plugin layout.
            dst = RULESYNC / "subagents" / f"{agent_name}.md"
            if dry_run:
                print(f"  agent {plugin_name}/{agent_name} → {dst.relative_to(REPO_ROOT)}")
                staged.add(dst)
            else:
                stage_file(src, dst, NON_CLAUDE_TARGETS, staged, tracked)

        for cmd_name in plugin.get("commands", []):
            src = plugin_src / "commands" / f"{cmd_name}.md"
            dst = RULESYNC / "commands" / f"{cmd_name}.md"
            if dry_run:
                print(f"  command {plugin_name}/{cmd_name} → {dst.relative_to(REPO_ROOT)}")
                staged.add(dst)
            else:
                stage_file(src, dst, NON_CLAUDE_TARGETS, staged, tracked)

        # Auto-stage underscore-prefixed runtime partials (any depth under commands/).
        # Wrappers read them via project-local paths like .rulesync/commands/docs/_foo.md.
        # Rulesync generators skip _*.md so they don't produce tool-specific outputs.
        cmd_dir = plugin_src / "commands"
        if cmd_dir.exists():
            for partial in sorted(cmd_dir.rglob("_*.md")):
                if not partial.is_file():
                    continue
                relpath = partial.relative_to(cmd_dir)
                dst = RULESYNC / "commands" / relpath
                prior_owner = partial_owner.get(dst)
                if prior_owner is not None and prior_owner != plugin_name:
                    print(
                        f"ERROR: partial collision — both {prior_owner!r} and "
                        f"{plugin_name!r} provide commands/{relpath}. "
                        f"Namespace the file under the plugin directory to resolve.",
                        file=sys.stderr,
                    )
                    sys.exit(1)
                partial_owner[dst] = plugin_name
                if dry_run:
                    print(f"  partial {plugin_name}/{relpath} → {dst.relative_to(REPO_ROOT)}")
                    staged.add(dst)
                else:
                    # Partials don't carry frontmatter, so rewrite_targets is a no-op.
                    stage_file(partial, dst, "['*']", staged, tracked)

        for guide_name in plugin.get("guides", []):
            if guide_name.startswith("_"):
                continue  # internal plugin guide, not a shared rule
            src = plugin_src / "guides" / guide_name
            dst = RULESYNC / "rules" / guide_name
            if dry_run:
                print(f"  rule {plugin_name}/{guide_name} → {dst.relative_to(REPO_ROOT)}")
                staged.add(dst)
            else:
                # Claude still consumes rules via rulesync (plugins don't do globs),
                # so keep targets: ['*'].
                stage_file(src, dst, "['*']", staged, tracked)

    # Top-level shared artefacts outside any plugin (e.g. mcp.json consumed by
    # rulesync's `mcp` generator). Source of truth lives in ag-dev-prompts/shared/.
    shared_src = CACHE_REPO / "shared" / "mcp.json"
    shared_dst = RULESYNC / "mcp.json"
    if shared_src.exists():
        if dry_run:
            print(f"  shared mcp.json → {shared_dst.relative_to(REPO_ROOT)}")
            staged.add(shared_dst)
        else:
            _replace_as_regular(shared_dst)
            shutil.copyfile(shared_src, shared_dst)
            staged.add(shared_dst)

    if not dry_run:
        # Remove any staged content from plugins we skipped this run (e.g. a
        # different product's plugin, or an item dropped from the manifest).
        # Computed as the set difference between what *any* plugin in the
        # manifest might contribute and what we actually staged for the
        # current product.
        #
        # Tracked files are skipped: a filename in the candidate stale set may
        # coincide with a local rule that predates the plugin sharing the same
        # filename (e.g. ag-grid's local .rulesync/rules/benchmarks.md vs the
        # ag-charts plugin's benchmarks.md guide). The local version is the
        # authoritative source for whichever product tracks it; staging should
        # never clobber it. The `tracked` snapshot is reused from the write
        # guard above.
        all_possible = _stageable_paths(manifest["plugins"])
        for stale in sorted(all_possible - staged):
            rel = stale.relative_to(REPO_ROOT) if stale.is_absolute() else stale
            if rel in tracked:
                print(f"  keeping tracked {rel} (not a stage-leftover)", file=sys.stderr)
                continue
            if stale.is_symlink() or stale.is_file():
                stale.unlink()
                print(f"  removed stale {rel}", file=sys.stderr)
            elif stale.is_dir():
                shutil.rmtree(stale)
                print(f"  removed stale {rel}/", file=sys.stderr)

        MARKER.write_text(
            "# Managed by external/ag-shared/scripts/rulesync-fetch/stage.py\n"
            "# Do not edit — regenerated on each setup-prompts run.\n"
        )

    print(f"Staged {len(staged)} items into .rulesync/", file=sys.stderr)
    return staged


def _tracked_files() -> set[Path]:
    """Return paths in .rulesync/ that git currently tracks, relative to the
    repo root. Used by the stale-cleanup pass to avoid deleting genuine local
    content that shares a filename with a plugin-contributed item.

    Returns an empty set if git is unavailable or the repo isn't initialised
    (preserves previous behaviour for one-off sandbox runs)."""
    import subprocess

    try:
        result = subprocess.run(
            ["git", "-C", str(REPO_ROOT), "ls-files", ".rulesync/"],
            capture_output=True,
            text=True,
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return set()
    return {Path(line) for line in result.stdout.splitlines() if line}


def _stageable_paths(plugins: dict) -> set[Path]:
    """Compute the set of paths the given plugins dict would contribute if
    staged. Used both for list_staged() and for the stale-cleanup pass."""
    out: set[Path] = set()
    for plugin_name, plugin in plugins.items():
        for name in plugin.get("skills", []):
            out.add(RULESYNC / "skills" / name)
        for name in plugin.get("agents", []):
            out.add(RULESYNC / "subagents" / f"{name}.md")
        for name in plugin.get("commands", []):
            out.add(RULESYNC / "commands" / f"{name}.md")
        plugin_src = CACHE_REPO / "plugins" / plugin_name
        cmd_dir = plugin_src / "commands"
        if cmd_dir.exists():
            for partial in cmd_dir.rglob("_*.md"):
                if partial.is_file():
                    out.add(RULESYNC / "commands" / partial.relative_to(cmd_dir))
        for name in plugin.get("guides", []):
            if name.startswith("_"):
                continue
            out.add(RULESYNC / "rules" / name)
    return out


def list_staged(*, filter_by_product: bool = True) -> set[Path]:
    """Enumerate what *would* be staged given the manifest. Filters to the
    current product's plugin + generic plugins by default; pass
    filter_by_product=False for the unfiltered view (used by the stale
    cleanup diff)."""
    manifest = load_manifest()
    if filter_by_product:
        plugins = included_plugins(manifest, detect_product())
    else:
        plugins = manifest["plugins"]
    out = _stageable_paths(plugins)
    if (CACHE_REPO / "shared" / "mcp.json").exists():
        out.add(RULESYNC / "mcp.json")
    return out


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--list", action="store_true", help="List items that would be staged")
    args = parser.parse_args()

    if args.list:
        for p in sorted(list_staged()):
            print(p.relative_to(REPO_ROOT))
        return

    stage(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
