#!/usr/bin/env bash
# Usage: plnkr.sh <download|upload> [args...]
#
# Subcommands:
#   download <id-or-url> [output-dir]   Download a plunk to local files
#   upload   <dir> [--title T] [--tags a,b]  Upload local files as a new plunk
#
# Output: key=value pairs on stdout. Errors: ERROR=<message> on stderr, exit 1.
set -euo pipefail

die() { echo "ERROR=$*" >&2; exit 1; }

# Global temp directory for all scratch files — cleaned up on exit
_TMPDIR=$(mktemp -d)
trap 'rm -rf "$_TMPDIR"' EXIT

# ---------------------------------------------------------------------------
# download <id-or-url> [output-dir]
# ---------------------------------------------------------------------------
cmd_download() {
    local input="${1:-}"
    [[ -n "$input" ]] || die "Usage: plnkr.sh download <id-or-url> [output-dir]"

    # Extract plunk ID from URL or raw ID
    local id
    id=$(echo "$input" | sed -E 's|^https?://plnkr\.co/edit/||; s|[?#].*||; s|/$||')
    [[ -n "$id" ]] || die "Could not extract plunk ID from: $input"

    local outdir="${2:-/tmp/plnkr-$id}"
    mkdir -p "$outdir"

    # Fetch plunk JSON
    local tmpjson="$_TMPDIR/plunk.json"

    echo "Fetching plunk $id ..." >&2
    if ! curl -sf "https://api.plnkr.co/plunks/$id" -o "$tmpjson"; then
        die "Failed to fetch plunk $id"
    fi

    # Write files to disk + metadata
    node -e "
const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync('$tmpjson', 'utf8'));
const dir = '$outdir';

// Write each file
const filenames = [];
for (const [name, entry] of Object.entries(data.files || {})) {
    const filePath = path.join(dir, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, entry.content || '');
    filenames.push(name);
}

// Write metadata
fs.writeFileSync(dir + '/.plnkr-meta.json', JSON.stringify({
    id: data.id,
    description: data.description || '',
    tags: data.tags || [],
}, null, 2));

// Output key=value pairs
console.log('DIR=' + dir);
console.log('ID=' + data.id);
console.log('DESCRIPTION=' + (data.description || ''));
console.log('FILES=' + filenames.join(','));
"
}

# ---------------------------------------------------------------------------
# upload <dir> [--title "..."] [--tags "a,b"]
# ---------------------------------------------------------------------------
cmd_upload() {
    local dir="${1:-}"
    [[ -n "$dir" && -d "$dir" ]] || die "Usage: plnkr.sh upload <dir> [--title T] [--tags a,b]"
    shift

    local title="" tags=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --title) title="$2"; shift 2 ;;
            --tags)  tags="$2";  shift 2 ;;
            *) die "Unknown flag: $1" ;;
        esac
    done

    # Fall back to .plnkr-meta.json
    local meta="$dir/.plnkr-meta.json"
    if [[ -f "$meta" ]]; then
        [[ -n "$title" ]] || title=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$meta','utf8')).description||'')")
        [[ -n "$tags" ]]  || tags=$(node -e "console.log((JSON.parse(require('fs').readFileSync('$meta','utf8')).tags||[]).join(','))")
    fi
    [[ -n "$title" ]] || title="Untitled"

    # Get access token
    local cookiefile="$_TMPDIR/cookies.txt"
    local payloadfile="$_TMPDIR/payload.json"
    local responsefile="$_TMPDIR/response.json"

    echo "Getting access token ..." >&2
    curl -sf -c "$cookiefile" 'https://plnkr.co/edit/' > /dev/null || die "Failed to load plnkr.co for token"
    local token
    token=$(grep 'plnkr.access_token' "$cookiefile" | awk '{print $7}')
    [[ -n "$token" ]] || die "Could not extract access token from cookies"

    # Build entries payload via node (reads files from disk, avoids shell escaping)
    echo "Building payload ..." >&2
    PLNKR_TITLE="$title" PLNKR_TAGS="$tags" node -e "
const fs = require('fs');
const path = require('path');
const dir = '$dir';
const title = process.env.PLNKR_TITLE;
const tagsStr = process.env.PLNKR_TAGS;

const entries = [];
function walk(base, rel) {
    for (const name of fs.readdirSync(path.join(base, rel))) {
        if (name.startsWith('.')) continue;
        const relPath = rel ? rel + '/' + name : name;
        const full = path.join(base, relPath);
        if (fs.statSync(full).isDirectory()) {
            walk(base, relPath);
        } else {
            entries.push({ type: 'file', pathname: relPath, content: fs.readFileSync(full, 'utf8') });
        }
    }
}
walk(dir, '');

const payload = { title, entries };
payload.tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

fs.writeFileSync('$payloadfile', JSON.stringify(payload));
"

    # Upload
    echo "Uploading plunk ..." >&2
    curl -sf -X POST 'https://api.plnkr.co/v2/plunks' \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $token" \
        -d "@$payloadfile" \
        -o "$responsefile" || die "Upload failed"

    node -e "
const r = JSON.parse(require('fs').readFileSync('$responsefile', 'utf8'));
console.log('ID=' + r.id);
console.log('URL=https://plnkr.co/edit/' + r.id + '?open=main.js');
"
}

# ---------------------------------------------------------------------------
# Main dispatch
# ---------------------------------------------------------------------------
case "${1:-}" in
    download) shift; cmd_download "$@" ;;
    upload)   shift; cmd_upload "$@" ;;
    *)        die "Usage: plnkr.sh <download|upload> [args...]" ;;
esac
