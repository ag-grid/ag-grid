#!/usr/bin/env bash
#
# cleanup_old_releases.sh
#
# Scans a target directory for known release file/directory patterns and
# deletes entries older than a given age (default: 2 months), while always
# leaving at least one entry of each type behind.
#
# The directories named exactly "public_html", "mta-sts", "ghost", "charts",
# or "html" (i.e. no date suffix) are NEVER deleted under any circumstances,
# regardless of age or pattern matching.
#
# Usage:
#   cleanup_old_releases.sh [-n|--dry-run] [-m|--months N] <directory>
#
# Options:
#   -n, --dry-run     Show what would be deleted / kept, but change nothing.
#   -m, --months N    Age threshold in months (default: 2).
#   -h, --help        Show this help.

set -euo pipefail

# ---------------------------------------------------------------------------
# Defaults / arg parsing
# ---------------------------------------------------------------------------

DRY_RUN=0
MONTHS=2
TARGET_DIR=""

usage() {
    awk 'NR==1{next} /^#/{print substr($0,2); next} {exit}' "$0"
    exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -n|--dry-run)
            DRY_RUN=1
            shift
            ;;
        -m|--months)
            [[ $# -ge 2 ]] || { echo "Error: --months requires a value" >&2; exit 1; }
            MONTHS="$2"
            shift 2
            ;;
        -h|--help)
            usage 0
            ;;
        -*)
            echo "Unknown option: $1" >&2
            usage 1
            ;;
        *)
            if [[ -n "$TARGET_DIR" ]]; then
                echo "Error: multiple directories given ('$TARGET_DIR' and '$1')" >&2
                exit 1
            fi
            TARGET_DIR="$1"
            shift
            ;;
    esac
done

if [[ -z "$TARGET_DIR" ]]; then
    echo "Error: target directory required." >&2
    usage 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
    echo "Error: '$TARGET_DIR' is not a directory." >&2
    exit 1
fi

# Normalize to an absolute path without trailing slash.
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

# ---------------------------------------------------------------------------
# GNU date / stat helpers
# ---------------------------------------------------------------------------

NOW_EPOCH=$(date +%s)
CUTOFF_EPOCH=$(date -d "-${MONTHS} months" +%s)

mtime_epoch() {
    stat -c %Y "$1"
}

# ---------------------------------------------------------------------------
# Hard-protected names — these are NEVER deleted, no matter what, even if a
# pattern below would otherwise match them (e.g. a future edit to a glob, or
# a typo). Checked by exact basename, both when building candidate lists and
# again immediately before any actual delete, as a defense-in-depth guard.
# ---------------------------------------------------------------------------

PROTECTED_NAMES=("public_html" "mta-sts" "ghost" "charts" "html")

is_protected() {
    # $1 = path
    local base
    base="$(basename "$1")"
    local name
    for name in "${PROTECTED_NAMES[@]}"; do
        [[ "$base" == "$name" ]] && return 0
    done
    return 1
}

# ---------------------------------------------------------------------------
# Type definitions
#
# Each entry: "label|kind|pattern"
#   kind = file | dir
#   pattern = shell glob evaluated relative to TARGET_DIR (top level only)
#
# Order matters: earlier patterns "claim" matching entries first so that
# overlapping globs (e.g. agStudioCom_*.zip vs agStudioCom*.zip) don't double
# count the same file under two types.
# ---------------------------------------------------------------------------

TYPES=(
    "studio_release_*.zip|file|studio_release_*.zip"
    "agStudioCom_*.zip|file|agStudioCom_*.zip"
    "charts_*.zip|file|charts_*.zip"
    "agCharts_*.zip|file|agCharts_*.zip"
    "agStudioCom*.zip|file|agStudioCom*.zip"
    "public_html_YYYYMMDD|dir|public_html_[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]"
    "studio_YYYYMMDD|dir|studio_[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]"
    "charts_YYYYMMDD|dir|charts_[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]"
)

declare -A CLAIMED   # basename -> 1, once matched by an earlier type

TOTAL_DELETE=0
TOTAL_KEEP=0

echo "Target directory : $TARGET_DIR"
echo "Age threshold    : ${MONTHS} month(s) (cutoff: $(date -d "@$CUTOFF_EPOCH"))"
if [[ $DRY_RUN -eq 1 ]]; then
    echo "Mode             : DRY RUN (nothing will be deleted)"
else
    echo "Mode             : LIVE (matching entries will be deleted)"
fi
echo

shopt -s nullglob

for spec in "${TYPES[@]}"; do
    IFS='|' read -r label kind pattern <<< "$spec"

    matches=()
    protected_list=()
    for entry in "$TARGET_DIR"/$pattern; do
        [[ -e "$entry" ]] || continue
        base="$(basename "$entry")"

        if [[ "$kind" == "dir" && ! -d "$entry" ]]; then
            continue
        fi
        if [[ "$kind" == "file" && ! -f "$entry" ]]; then
            continue
        fi
        if [[ -n "${CLAIMED[$base]:-}" ]]; then
            continue
        fi
        CLAIMED[$base]=1

        if is_protected "$entry"; then
            protected_list+=("$entry")
            continue
        fi

        matches+=("$entry")
    done

    if [[ ${#matches[@]} -eq 0 ]]; then
        echo "== $label =="
        if [[ ${#protected_list[@]} -eq 0 ]]; then
            echo "  (no matching entries found)"
        else
            for path in "${protected_list[@]}"; do
                echo "  PROTECTED (never deleted): $path"
            done
        fi
        echo
        continue
    fi

    # Build "epoch<TAB>path" pairs, sorted oldest first.
    pairs=()
    for m in "${matches[@]}"; do
        pairs+=("$(mtime_epoch "$m")	$m")
    done
    IFS=$'\n' sorted=($(printf '%s\n' "${pairs[@]}" | sort -n)); unset IFS

    old_list=()
    new_list=()
    for p in "${sorted[@]}"; do
        epoch="${p%%$'\t'*}"
        path="${p#*$'\t'}"
        if [[ "$epoch" -lt "$CUTOFF_EPOCH" ]]; then
            old_list+=("$path")
        else
            new_list+=("$path")
        fi
    done

    delete_list=("${old_list[@]}")

    # Safety rule: if deleting all "old" entries would leave nothing of this
    # type behind (i.e. there are no "new" entries either), spare the
    # most-recently-modified entry among the old ones.
    if [[ ${#new_list[@]} -eq 0 && ${#delete_list[@]} -gt 0 ]]; then
        spared="${delete_list[-1]}"        # last = newest, since old_list is oldest-first
        unset 'delete_list[-1]'
        new_list=("$spared")
    fi

    echo "== $label  (${#matches[@]} found, ${#delete_list[@]} to delete, ${#new_list[@]} kept, ${#protected_list[@]} protected) =="

    for path in "${protected_list[@]}"; do
        echo "  PROTECTED (never deleted): $path"
    done

    for path in "${delete_list[@]}"; do
        echo "  DELETE  $path"
        TOTAL_DELETE=$((TOTAL_DELETE + 1))
    done

    for path in "${new_list[@]}"; do
        echo "  KEEP    $path"
        TOTAL_KEEP=$((TOTAL_KEEP + 1))
    done
    echo

    if [[ $DRY_RUN -eq 0 ]]; then
        for path in "${delete_list[@]}"; do
            if is_protected "$path"; then
                echo "  REFUSING to delete protected path: $path" >&2
                continue
            fi
            if [[ -d "$path" ]]; then
                rm -rf -- "$path"
            else
                rm -f -- "$path"
            fi
        done
    fi
done

echo "---------------------------------------------"
echo "Total to delete: $TOTAL_DELETE"
echo "Total kept     : $TOTAL_KEEP"
[[ $DRY_RUN -eq 1 ]] && echo "(dry run - no files were actually removed)"
