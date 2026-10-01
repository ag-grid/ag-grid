#!/bin/bash
#
# One-off: patch the .htaccess of every documentation archive already deployed on one web host
# (grid /archive/<v>/, charts /charts/archive/<v>/, studio /studio/archive/<v>/), so the archives
# deployed before the archive-aware generators get the same routing fixes as new archive builds.
# Archives are never rebuilt, so this is the only way they get them.
#
# WHAT IT DOES - per archive, via scripts/migrate-archive-htaccess.mjs (its header has the detail):
#   - every site: inserts a marked block straight after the file's first `RewriteEngine On` that
#     301s the alias hosts (ag-grid.com, blog., angulargrid./angular-grid./javascript-grid./
#     react-grid.ag-grid.com, angulargrid.com, www.angulargrid.com) to the SAME archive URL on
#     www in one hop, query string kept. Today they serve the archive with a 200, or (grid 36.x)
#     redirect to the CURRENT docs because the rule drops the /archive/<v>/ prefix. An archive with
#     no rewrite block of its own (charts 14.0.x, studio 2.0.x) gets one.
#   - grid: the block also carries the http -> https upgrade (prefix kept), and, for archives with
#     markdown twins (36.1.0, 36.2.0), negotiation on Accept: text/markdown under the archive base,
#     plus the Vary: Accept that goes with it. Removes every rule that sends a request OUT of the
#     archive: single-hop rewrites to the live site and their [S=n] host skip, the live /charts/
#     rules, the blog-host block, the prefix-dropping host/https/index.php/php-path rules, and
#     redirects to a live or external URL. Those URLs now 404 inside the archive, or take an
#     in-archive redirect. Every in-archive redirect is kept.
#   - charts and studio archives only get the block: nothing in them leaves the archive.
# Headers are not touched: the root .htaccess already applies the archive header fixes, and those
# (unlike rewrite rules) reach every archive.
#
# SAFETY
#   - DRY RUN by default: downloads, patches local copies and reports. Nothing on the host changes.
#   - A file with any rule or redirect the patcher does not recognise, or that names another
#     version, is REFUSED and left alone. Any refusal aborts the run before anything is uploaded,
#     unless --skip-unrecognised (which then leaves those files exactly as they are).
#   - --apply, per file: re-checks the live file is still the one that was patched (aborts if a
#     deploy changed it meanwhile), keeps a copy at .htaccess.bak-<timestamp> beside it, uploads
#     beside the live file and renames over it (atomic in one directory), then re-checks it.
#   - Idempotent: a re-run regenerates the block and finds nothing left to remove, so an already
#     migrated archive reports "unchanged" and is not uploaded again.
#   - Never touches the root, /charts/ or /studio/ top-level .htaccess, or any archive without its
#     own .htaccess (those predate archive .htaccess files and keep the parent's rules).
#
# HOW TO RUN - once per web host (both hosts carry their own copy), from the repo root:
#   export SSH_FILE=<key> SSH_PORT=<port> GRID_ROOT_DIR=<docroot> CHARTS_ROOT_DIR=<docroot>/charts STUDIO_ROOT_DIR=<docroot>/studio
#   ./scripts/deployments/prep_and_archive/migrateDeployedArchiveHtaccess.sh user@host
#   ./scripts/deployments/prep_and_archive/migrateDeployedArchiveHtaccess.sh user@host --apply
# Options: --site grid|charts|studio (repeatable; default all three), --version <x.y.z> (one
# archive only), --skip-unrecognised. Each run keeps its downloads, patched copies and diffs in a
# local work directory it prints at the start.
#
# ROLLBACK - every replaced file has its previous copy beside it; the run prints one restore
# command per file it changed, e.g.
#   ssh -i <key> -p <port> user@host "cp -p <dir>/.htaccess.bak-<ts> <dir>/.htaccess"
#
# VERIFY - the run prints curl commands (full browser UA, which the WAF needs) for a sample of the
# archives it changed. They go through CloudFront, so a cached archive response can still show the
# old behaviour until it expires or is invalidated. Once testing/edge-verification has landed,
# `NX_DAEMON=false yarn nx run ag-grid-edge-verification:test:edge-live` re-checks the live edge.
# Locally, documentation/ag-grid-docs/testing/htaccess-harness/archive-migration.sh runs the
# patcher against real Apache (before and after) on the deployed-archive fixtures.

usage() {
    echo "usage: $0 user@host [--apply] [--skip-unrecognised] [--site grid|charts|studio]... [--version x.y.z]"
    echo "Requires \$SSH_FILE, \$SSH_PORT, and \$GRID_ROOT_DIR / \$CHARTS_ROOT_DIR / \$STUDIO_ROOT_DIR for the sites run."
    echo "Dry run unless --apply. See the header of this script for what it changes."
}

HOST=""
APPLY=0
SKIP_UNRECOGNISED=0
ONLY_VERSION=""
SITES=()
while [ $# -gt 0 ]; do
    case "$1" in
        --apply) APPLY=1; shift;;
        --skip-unrecognised) SKIP_UNRECOGNISED=1; shift;;
        --site) SITES+=("${2:-}"); shift 2;;
        --version) ONLY_VERSION="${2:-}"; shift 2;;
        -h|--help) usage; exit 0;;
        -*) echo "Unknown option $1"; usage; exit 2;;
        *) [ -z "$HOST" ] || { usage; exit 2; }; HOST="$1"; shift;;
    esac
done
[ -n "$HOST" ] || { usage; exit 2; }
[ ${#SITES[@]} -gt 0 ] || SITES=(grid charts studio)
if [ -n "$ONLY_VERSION" ] && ! [[ "$ONLY_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "--version must look like 36.2.0"; exit 2
fi

[ -n "${SSH_FILE:-}" ] || { echo "\$SSH_FILE is not set"; exit 1; }
[ -n "${SSH_PORT:-}" ] || { echo "\$SSH_PORT is not set"; exit 1; }
rootOf() {
    case "$1" in
        grid) echo "${GRID_ROOT_DIR:-}";;
        charts) echo "${CHARTS_ROOT_DIR:-}";;
        studio) echo "${STUDIO_ROOT_DIR:-}";;
    esac
}
baseOf() { # site version -> the archive's public base path
    case "$1" in
        grid) echo "/archive/$2";;
        *) echo "/$1/archive/$2";;
    esac
}
for site in "${SITES[@]}"; do
    case "$site" in grid|charts|studio) ;; *) echo "Unknown site '$site'"; exit 2;; esac
    [ -n "$(rootOf "$site")" ] || { echo "The root dir for $site (\$$(echo "$site" | tr a-z A-Z)_ROOT_DIR) is not set"; exit 1; }
done

PATCHER="$(cd "$(dirname "$0")/../.." && pwd)/migrate-archive-htaccess.mjs"
[ -f "$PATCHER" ] || { echo "File [$PATCHER] doesn't exist - exiting script."; exit 1; }

TS="$(date +%Y%m%d%H%M%S)"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/archive-htaccess-migration-$TS-XXXX")"
SSH=(ssh -i "$SSH_FILE" -p "$SSH_PORT" "$HOST")
SCP=(scp -q -i "$SSH_FILE" -P "$SSH_PORT")
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'

echo "Host: $HOST    sites: ${SITES[*]}    mode: $([ $APPLY = 1 ] && echo APPLY || echo 'dry run')"
echo "Work dir (downloads, patched copies, diffs): $WORK"
echo

PATCHED=()   # "site version remote"
REFUSED=()
UNCHANGED=()
for site in "${SITES[@]}"; do
    root="$(rootOf "$site")"
    mkdir -p "$WORK/$site"
    if ! dirs="$("${SSH[@]}" "ls -1 '$root/archive'")"; then
        echo "Could not list $root/archive on $HOST - exiting."; exit 1
    fi
    # One listing of the archive .htaccess files rather than a round trip per version.
    withFile="$("${SSH[@]}" "cd '$root/archive' && ls -1 */.htaccess 2>/dev/null" | sed 's#/\.htaccess$##')"
    versions="$(printf '%s\n' "$dirs" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' | sort -V)"
    without=()
    for v in $versions; do
        [ -z "$ONLY_VERSION" ] || [ "$v" = "$ONLY_VERSION" ] || continue
        if ! printf '%s\n' "$withFile" | grep -qxF "$v"; then
            without+=("$v")
            continue
        fi
        remote="$root/archive/$v/.htaccess"
        orig="$WORK/$site/$v.htaccess.orig"
        patched="$WORK/$site/$v.htaccess"
        if ! "${SCP[@]}" "$HOST:$remote" "$orig"; then
            echo "Could not download $remote - exiting."; exit 1
        fi
        cp "$orig" "$patched"
        out="$(node "$PATCHER" "$patched" --site "$site" --base "$(baseOf "$site" "$v")" 2>&1)"
        rc=$?
        diff -u "$orig" "$patched" > "$WORK/$site/$v.diff"
        if [ $rc = 1 ]; then
            REFUSED+=("$site $v $remote")
            status="REFUSED"
        elif [ $rc != 0 ]; then
            echo "$out"; echo "The patcher failed on $remote - exiting."; exit 1
        elif cmp -s "$orig" "$patched"; then
            UNCHANGED+=("$site $v $remote")
            status="unchanged"
        else
            PATCHED+=("$site $v $remote")
            # Less the ---/+++ header line each.
            status="$(( $(grep -c '^-' "$WORK/$site/$v.diff") - 1 )) lines removed, $(( $(grep -c '^+' "$WORK/$site/$v.diff") - 1 )) added"
        fi
        printf '%-7s %-8s %s   (diff: %s)\n' "$site" "$v" "$status" "$WORK/$site/$v.diff"
        printf '%s\n' "$out" | tail -n +2
    done
    [ ${#without[@]} = 0 ] || echo "$site: no .htaccess of their own (keep the parent's rules, left alone): ${without[*]}"
    echo
done

echo "Summary: ${#PATCHED[@]} to patch, ${#UNCHANGED[@]} unchanged, ${#REFUSED[@]} refused."
if [ ${#REFUSED[@]} -gt 0 ]; then
    printf '  refused: %s\n' "${REFUSED[@]}"
    if [ $SKIP_UNRECOGNISED = 0 ]; then
        echo "Nothing has been changed. Review the refusals above (diffs in $WORK); re-run with --skip-unrecognised to patch the rest and leave those as they are."
        exit 1
    fi
fi

if [ $APPLY = 0 ]; then
    echo "Dry run - nothing on $HOST has changed. Review the diffs in $WORK, then re-run with --apply."
    exit 0
fi

APPLIED=()
applyFailed() {
    echo "$1"
    echo "Stopped. Files changed before this one stay changed (restore commands below); this one is untouched."
    printRollback
    exit 1
}
printRollback() {
    [ ${#APPLIED[@]} = 0 ] && return
    echo "Rollback, one line per file:"
    for entry in "${APPLIED[@]}"; do
        echo "ssh -i $SSH_FILE -p $SSH_PORT $HOST \"cp -p $entry.bak-$TS $entry\""
    done
}

for entry in "${PATCHED[@]}"; do
    read -r site v remote <<< "$entry"
    orig="$WORK/$site/$v.htaccess.orig"
    patched="$WORK/$site/$v.htaccess"
    staged="$remote.new-$TS"
    # Still the file that was patched? A deploy in between would otherwise be overwritten.
    live="$("${SSH[@]}" "cksum < '$remote'")" || applyFailed "Could not read $remote."
    [ "$live" = "$(cksum < "$orig")" ] || applyFailed "$remote changed on $HOST since it was downloaded."
    "${SSH[@]}" "cp -p '$remote' '$remote.bak-$TS'" || applyFailed "Could not back up $remote."
    # Upload beside the live file and rename over it: scp writes in place, so an interrupted
    # transfer straight onto .htaccess would leave the archive with a truncated one.
    "${SCP[@]}" "$patched" "$HOST:$staged" || { "${SSH[@]}" "rm -f '$staged'"; applyFailed "Could not upload $staged."; }
    "${SSH[@]}" "chmod 644 '$staged' && mv '$staged' '$remote'" || { "${SSH[@]}" "rm -f '$staged'"; applyFailed "Could not move $staged into place."; }
    APPLIED+=("$remote")
    [ "$("${SSH[@]}" "cksum < '$remote'")" = "$(cksum < "$patched")" ] || applyFailed "$remote does not read back as uploaded."
    echo "patched $remote (previous copy at $remote.bak-$TS)"
done

echo
printRollback

# A sample to verify by hand: the lowest and highest version changed per site.
echo
echo "Verify (expected result after each '#'):"
for site in "${SITES[@]}"; do
    sample="$(printf '%s\n' "${APPLIED[@]}" | grep -E "/archive/[0-9.]+/\.htaccess$" | grep -F "$(rootOf "$site")/archive/" | sed -E 's#.*/archive/([0-9.]+)/\.htaccess$#\1#' | sort -V | sed -n '1p;$p' | uniq)"
    for v in $sample; do
        base="$(baseOf "$site" "$v")"
        echo "curl -sS -o /dev/null -A '$UA' -w '%{http_code} %{redirect_url}\n' 'https://ag-grid.com$base/?probe=1'   # 301 https://www.ag-grid.com$base/?probe=1"
        echo "curl -sS -o /dev/null -A '$UA' -w '%{http_code} %{redirect_url}\n' 'https://blog.ag-grid.com$base/'   # 301 https://www.ag-grid.com$base/"
        echo "curl -sS -o /dev/null -A '$UA' -w '%{http_code}\n' 'https://www.ag-grid.com$base/.htaccess.bak-$TS'   # 403 or 404 (never 200)"
        if [ "$site" = grid ]; then
            echo "curl -sS -o /dev/null -A '$UA' -w '%{http_code} %{redirect_url}\n' 'https://www.ag-grid.com$base/index.php'   # 404 (was a 301 to the site root)"
            if grep -q '^AddType text/markdown md$' "$WORK/$site/$v.htaccess"; then
                echo "curl -sS -o /dev/null -A '$UA' -H 'Accept: text/markdown' -w '%{http_code} %{content_type}\n' 'https://www.ag-grid.com$base/react-data-grid/getting-started/'   # 200 text/markdown"
            fi
        fi
    done
done
