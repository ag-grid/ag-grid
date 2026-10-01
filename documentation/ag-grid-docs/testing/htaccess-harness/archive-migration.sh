#!/usr/bin/env bash
#
# Real-Apache check of scripts/migrate-archive-htaccess.mjs: serves the deployed-archive fixtures
# (src/utils/htaccess/__fixtures__/deployed-archives) under the current root .htaccess, first as
# deployed and then patched, and asserts what each request gets in both phases. The "before" rows
# pin the defects the migration exists for, so a fixture that stopped reproducing them fails too.
#
# Usage:
#   ./archive-migration.sh               # PORT=8898 by default
#   KEEP_RUNNING=1 ./archive-migration.sh   # leave httpd up (patched docroot) for manual curls
#
# Skips (exit 0) when Apache or a module is missing, as run.sh does; HTTPD_REQUIRED=1 fails instead.
set -uo pipefail

HARNESS_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCS_DIR="$(cd "$HARNESS_DIR/../.." && pwd)"
REPO_DIR="$(cd "$DOCS_DIR/../.." && pwd)"
FIXTURES="${ARCHIVE_FIXTURES:-$DOCS_DIR/src/utils/htaccess/__fixtures__/deployed-archives}"
PATCHER="$REPO_DIR/scripts/migrate-archive-htaccess.mjs"
PORT="${PORT:-8898}"
# Outside the repo, so Apache never walks up into a real ancestor .htaccess.
WORK="${HARNESS_WORK:-${TMPDIR:-/tmp}/ag-archive-migration-harness}"
HTDOCS="$WORK/htdocs"

skip_or_fail() {
  if [ "${HTTPD_REQUIRED:-}" = "1" ]; then echo "ERROR: $1 (HTTPD_REQUIRED=1)"; exit 1; fi
  echo "==> SKIP archive migration harness - $1."
  exit 0
}

HTTPD="${HTTPD:-}"
if [ -z "$HTTPD" ]; then
  for c in httpd apache2 /usr/sbin/httpd /usr/sbin/apache2; do
    if command -v "$c" >/dev/null 2>&1; then HTTPD="$(command -v "$c")"; break; fi
  done
fi
[ -n "$HTTPD" ] || skip_or_fail "no httpd/apache2 binary found"
MODS="${HTTPD_MODULES:-}"
if [ -z "$MODS" ]; then
  for d in /usr/libexec/apache2 /usr/lib/apache2/modules /usr/lib64/httpd/modules /etc/httpd/modules /usr/lib/httpd/modules; do
    [ -f "$d/mod_rewrite.so" ] && { MODS="$d"; break; }
  done
fi
[ -n "$MODS" ] || skip_or_fail "Apache modules directory not found"
BUILTIN="$("$HTTPD" -l 2>/dev/null || true)"
LOADMODULES=""
for m in mpm_prefork unixd authz_core log_config mime dir alias rewrite headers; do
  printf '%s\n' "$BUILTIN" | grep -Eq "mod_$m\.c$" && continue
  [ -f "$MODS/mod_$m.so" ] || skip_or_fail "required Apache module mod_$m.so not found in $MODS"
  LOADMODULES="$LOADMODULES
LoadModule ${m}_module $MODS/mod_$m.so"
done

rm -rf "$WORK"; mkdir -p "$HTDOCS" "$WORK/logs"

# The live root .htaccess, emitted from source as run.sh does.
( cd "$DOCS_DIR" && PUBLIC_BASE_URL='' HARNESS_OUT="$HTDOCS/.htaccess" npx tsx -e \
  "import('./src/utils/htaccess/htaccessRules.ts').then(async (m) => { const { writeFileSync } = await import('node:fs'); writeFileSync(process.env.HARNESS_OUT, m.getHtaccessContent({ env: 'production' })); })" >/dev/null 2>&1 )
[ -s "$HTDOCS/.htaccess" ] || { echo "FAILED to emit the root .htaccess"; exit 1; }
echo "not found" > "$HTDOCS/404.html"

page() { mkdir -p "$HTDOCS/$1"; echo "html $1" > "$HTDOCS/$1/index.html"; }
twin() { page "$1"; echo "# md $1" > "$HTDOCS/$1.md"; }

# site, version, a doc page path below the archive, whether it ships markdown twins
ARCHIVES="grid 35.3.1 react-data-grid/getting-started no
grid 36.0.0 react-data-grid/getting-started no
grid 36.0.1 react-data-grid/getting-started no
grid 36.0.2 react-data-grid/getting-started no
grid 36.1.0 react-data-grid/getting-started yes
grid 36.2.0 react-data-grid/getting-started yes
charts 12.3.1 react/bar-series no
charts 13.3.1 react/bar-series no
charts 14.0.0 react/bar-series no
charts 14.0.1 react/bar-series no
charts 14.0.2 react/bar-series no
charts 14.1.0 react/bar-series yes
charts 14.2.0 react/bar-series yes
studio 2.0.0 react/getting-started no
studio 2.0.1 react/getting-started no
studio 2.1.0 react/getting-started yes
studio 2.1.1 react/getting-started yes
studio 2.1.2 react/getting-started yes
studio 3.0.0 react/getting-started yes"

mkdir -p "$HTDOCS/charts" "$HTDOCS/studio"
cp "$FIXTURES/charts-top-level.htaccess" "$HTDOCS/charts/.htaccess"
cp "$FIXTURES/studio-top-level.htaccess" "$HTDOCS/studio/.htaccess"
# The parents' own error pages, which their ErrorDocument names.
echo "charts not found" > "$HTDOCS/charts/404.html"
echo "studio not found" > "$HTDOCS/studio/404.html"
while read -r site version doc md; do
  case "$site" in grid) dir="archive/$version";; *) dir="$site/archive/$version";; esac
  page "$dir"; echo "not found" > "$HTDOCS/$dir/404.html"
  if [ "$md" = yes ]; then twin "$dir/$doc"; echo "# md home" > "$HTDOCS/$dir/index.md"; else page "$dir/$doc"; fi
  [ -f "$FIXTURES/$site-$version.htaccess" ] && cp "$FIXTURES/$site-$version.htaccess" "$HTDOCS/$dir/.htaccess"
done <<< "$ARCHIVES"
# In-archive redirect targets the fixtures keep, so they resolve to a page.
page "archive/36.0.0/changelog"
page "archive/36.2.0/javascript-data-grid/grouping-display-types"

cat > "$WORK/httpd.conf" <<EOF
ServerRoot "$WORK"
DefaultRuntimeDir "$WORK"
Mutex file:$WORK default
TypesConfig /dev/null
AddType text/html .html
Listen $PORT$LOADMODULES
ServerName localhost:$PORT
UseCanonicalName On
PidFile "$WORK/httpd.pid"
ErrorLog "$WORK/logs/error.log"
DocumentRoot "$HTDOCS"
DirectoryIndex index.html
<Directory />
    AllowOverride None
    Require all denied
</Directory>
<Directory "$HTDOCS">
    AllowOverride All
    Require all granted
</Directory>
EOF

stop_httpd() { "$HTTPD" -f "$WORK/httpd.conf" -k stop >/dev/null 2>&1; sleep 1; }
start_httpd() {
  "$HTTPD" -f "$WORK/httpd.conf" -k start || { echo "httpd failed to start"; cat "$WORK/logs/error.log"; exit 1; }
  sleep 1
}

LOCAL="http://localhost:$PORT"
W="https://www.ag-grid.com"
pass=0; fail=0

# phase (before, after, both, charts-rc, grid-rc)  host  path  accept  status  expectation  [cache-control]
#   expectation: a redirect's exact Location (@ = this server), or for a 200 a comma list of
#   ct:<content-type prefix>, vary:<token>, novary:<token>
#   cache-control: when given, the exact Cache-Control header (absent = none at all)
ROWS="
# --- grid 36.x: alias hosts kept the archive path? Before: dropped it, landing on the current docs.
before	ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/?q=1	-	301	$W/react-data-grid/getting-started/?q=1
after	ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/?q=1	-	301	$W/archive/36.2.0/react-data-grid/getting-started/?q=1
before	react-grid.ag-grid.com	/archive/36.1.0/react-data-grid/getting-started/	-	301	$W/react-data-grid/getting-started/
after	react-grid.ag-grid.com	/archive/36.1.0/react-data-grid/getting-started/	-	301	$W/archive/36.1.0/react-data-grid/getting-started/
before	www.angulargrid.com	/archive/36.0.0/react-data-grid/getting-started/	-	301	$W/react-data-grid/getting-started/
after	www.angulargrid.com	/archive/36.0.0/react-data-grid/getting-started/	-	301	$W/archive/36.0.0/react-data-grid/getting-started/
before	blog.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/	-	301	$W/blog/react-data-grid/getting-started/
after	blog.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/	-	301	$W/archive/36.2.0/react-data-grid/getting-started/
before	blog.ag-grid.com	/archive/36.0.0/react-data-grid/getting-started/	-	200	ct:text/html
after	blog.ag-grid.com	/archive/36.0.0/react-data-grid/getting-started/	-	301	$W/archive/36.0.0/react-data-grid/getting-started/
# A slash-less URL gets its slash in the same hop, as the archive-aware generator does it.
after	ag-grid.com	/archive/36.2.0/react-data-grid/getting-started	-	301	$W/archive/36.2.0/react-data-grid/getting-started/
after	blog.ag-grid.com	/archive/36.0.0/react-data-grid/getting-started?q=1	-	301	$W/archive/36.0.0/react-data-grid/getting-started/?q=1
after	angulargrid.com	/charts/archive/14.0.0/react/bar-series	-	301	$W/charts/archive/14.0.0/react/bar-series/
after	ag-grid.com	/charts/archive/14.2.0/react/bar-series	-	301	$W/charts/archive/14.2.0/react/bar-series/
after	react-grid.ag-grid.com	/studio/archive/2.0.0/react/getting-started	-	301	$W/studio/archive/2.0.0/react/getting-started/
# ...but a file keeps its name.
after	ag-grid.com	/archive/36.2.0/images/logo.png	-	301	$W/archive/36.2.0/images/logo.png
# A bare archive root on an alias host: mod_rewrite leaves it to mod_dir (the archive's own
# .htaccess is in that directory), so the root's <If> redirect adds the slash and the host at once.
both	ag-grid.com	/archive/36.2.0	-	301	$W/archive/36.2.0/
both	blog.ag-grid.com	/archive/36.0.0?q=1	-	301	$W/archive/36.0.0/?q=1
both	angulargrid.com	/charts/archive/14.1.0	-	301	$W/charts/archive/14.1.0/
both	ag-grid.com	/studio/archive/3.0.0	-	301	$W/studio/archive/3.0.0/
# An archive with no .htaccess of its own is the root's rewrite rules' to answer.
both	ag-grid.com	/archive/35.3.1	-	301	$W/archive/35.3.1/
# www is mod_dir's single hop; a missing version is not a directory, so it is left alone.
both	www.ag-grid.com	/archive/36.2.0	-	301	@/archive/36.2.0/
both	ag-grid.com	/archive/99.9.9	-	301	$W/archive/99.9.9
# Escaping: the path goes out as it came in. Hence no [NE]: with it, %20 went out as a raw space,
# %2541 as %41 (a different URL), %23 as a fragment and UTF-8 as raw bytes (verified on Apache 2.4).
after	ag-grid.com	/archive/36.2.0/a%20b/	-	301	$W/archive/36.2.0/a%20b/
after	ag-grid.com	/archive/36.2.0/%E2%9C%93/	-	301	$W/archive/36.2.0/%e2%9c%93/
after	ag-grid.com	/archive/36.2.0/a%2541/	-	301	$W/archive/36.2.0/a%2541/
after	ag-grid.com	/archive/36.2.0/x%23y/	-	301	$W/archive/36.2.0/x%23y/
after	ag-grid.com	/archive/36.2.0/p/?q=a%20b&r=1	-	301	$W/archive/36.2.0/p/?q=a%20b&r=1
# An encoded '?' carried into a substitution is refused by Apache itself (CVE-2024-38474), as it is
# by the live generator's %{REQUEST_URI} rules.
after	ag-grid.com	/archive/36.2.0/x%3Fy/	-	403	-
# www is untouched.
both	www.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/	-	200	ct:text/html
both	www.ag-grid.com	/archive/36.0.0/react-data-grid/getting-started	-	301	@/archive/36.0.0/react-data-grid/getting-started/
# An archive without its own .htaccess keeps the root's rules, which keep the path.
both	ag-grid.com	/archive/35.3.1/react-data-grid/getting-started/	-	301	$W/archive/35.3.1/react-data-grid/getting-started/
# --- grid markdown: negotiated under the archive. Before: root-anchored, so never.
before	www.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/	text/markdown	200	ct:text/html
after	www.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/	text/markdown	200	ct:text/markdown,vary:Accept
# Slash-less: mod_dir's DirectorySlash answers first (as on the live site, finding 11), then it negotiates.
after	www.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started	text/markdown	301	@/archive/36.2.0/react-data-grid/getting-started/
after	www.ag-grid.com	/archive/36.1.0/	text/markdown	200	ct:text/markdown
after	www.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/	-	200	ct:text/html,vary:Accept
after	www.ag-grid.com	/archive/36.2.0/react-data-grid/nope/	text/markdown	404	-
before	www.ag-grid.com	/archive/36.2.0/	-	200	ct:text/html,novary:Accept
# --- grid out-of-archive redirects: before they left the archive, after they stay in it.
before	www.ag-grid.com	/archive/36.2.0/react-data-grid/whats-new	-	301	$W/whats-new/
after	www.ag-grid.com	/archive/36.2.0/react-data-grid/whats-new	-	301	@/archive/36.2.0/react-data-grid/whats-new/
before	www.ag-grid.com	/archive/36.2.0/charts/react/fonts/	-	301	$W/charts/react/text/
after	www.ag-grid.com	/archive/36.2.0/charts/react/fonts/	-	404	-
before	www.ag-grid.com	/archive/36.2.0/index.php	-	301	@/
after	www.ag-grid.com	/archive/36.2.0/index.php	-	404	-
before	www.ag-grid.com	/archive/36.0.0/a/index.php	-	301	@/a/
after	www.ag-grid.com	/archive/36.0.0/a/index.php	-	404	-
before	www.ag-grid.com	/archive/36.2.0/sitemap.xml	-	301	$W/sitemap-index.xml
after	www.ag-grid.com	/archive/36.2.0/sitemap.xml	-	404	-
before	www.ag-grid.com	/archive/36.0.0/ag-grid-angular-aot-dynamic-components/	-	301	https://medium.com/ag-grid/understanding-aot-and-dynamic-components-in-angular-2-9b7548ce5845
after	www.ag-grid.com	/archive/36.0.0/ag-grid-angular-aot-dynamic-components/	-	404	-
# ...and the in-archive ones are kept.
both	www.ag-grid.com	/archive/36.2.0/javascript-data-grid/grouping-sticky-groups/	-	301	@/archive/36.2.0/javascript-data-grid/grouping-display-types/
both	www.ag-grid.com	/archive/36.0.0/ag-grid-changelog/	-	301	@/archive/36.0.0/changelog/
# --- charts: 14.0.x has no rewrite block, so it inherited /charts/'s apex rule but nothing else.
both	ag-grid.com	/charts/archive/14.0.0/react/bar-series/	-	301	$W/charts/archive/14.0.0/react/bar-series/
before	blog.ag-grid.com	/charts/archive/14.0.0/react/bar-series/	-	200	ct:text/html
after	blog.ag-grid.com	/charts/archive/14.0.0/react/bar-series/	-	301	$W/charts/archive/14.0.0/react/bar-series/
before	ag-grid.com	/charts/archive/14.1.0/react/bar-series/	-	200	ct:text/html
after	ag-grid.com	/charts/archive/14.1.0/react/bar-series/	-	301	$W/charts/archive/14.1.0/react/bar-series/
before	angulargrid.com	/charts/archive/14.2.0/react/bar-series/	-	200	ct:text/html
after	angulargrid.com	/charts/archive/14.2.0/react/bar-series/	-	301	$W/charts/archive/14.2.0/react/bar-series/
both	ag-grid.com	/charts/archive/14.2.0/react/bar-series/	-	301	$W/charts/archive/14.2.0/react/bar-series/
both	www.ag-grid.com	/charts/archive/14.1.0/react/bar-series/	text/markdown	200	ct:text/markdown
# Charts' own prefix-match Redirect defect (finding 2) is in-archive, so the migration leaves it.
both	www.ag-grid.com	/charts/archive/14.2.0/react/fonts/	-	301	@/charts/archive/14.2.0/react/text//
# --- charts archive caching. 14.x serves its 404 through an ErrorDocument under the archive, which
# the root's released-archive long cache matches; the root overrides error statuses to no-cache.
# 12.x/13.x ship no .htaccess, so /charts/404.html answers there, outside the archive.
both	www.ag-grid.com	/charts/archive/14.0.0/no-such-page/	-	404	-	no-cache
both	www.ag-grid.com	/charts/archive/14.1.0/no-such-page/	-	404	-	no-cache
both	www.ag-grid.com	/charts/archive/14.2.0/no-such-page/	-	404	-	no-cache
both	www.ag-grid.com	/charts/archive/12.3.1/no-such-page/	-	404	-	no-cache
both	www.ag-grid.com	/charts/archive/13.3.1/no-such-page/	-	404	-	no-cache
both	www.ag-grid.com	/charts/archive/14.0.0/react/bar-series/	-	200	ct:text/html	public, max-age=604800, s-maxage=31536000
both	www.ag-grid.com	/charts/archive/12.3.1/react/bar-series/	-	200	ct:text/html	public, max-age=604800, s-maxage=31536000
# --- in flight per product (scripts/uncached-archives.mjs on the root): a charts-only release
# candidate leaves grid archive caching alone, and the reverse.
charts-rc	www.ag-grid.com	/charts/archive/14.2.0/react/bar-series/	-	200	ct:text/html	no-cache
charts-rc	www.ag-grid.com	/charts/archive/14.1.0/react/bar-series/	-	200	ct:text/html	public, max-age=604800, s-maxage=31536000
charts-rc	www.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/	-	200	ct:text/html	public, max-age=604800, s-maxage=31536000
grid-rc	www.ag-grid.com	/archive/36.2.0/react-data-grid/getting-started/	-	200	ct:text/html	no-cache
grid-rc	www.ag-grid.com	/archive/36.1.0/react-data-grid/getting-started/	-	200	ct:text/html	public, max-age=604800, s-maxage=31536000
grid-rc	www.ag-grid.com	/charts/archive/14.2.0/react/bar-series/	-	200	ct:text/html	public, max-age=604800, s-maxage=31536000
both	www.ag-grid.com	/charts/archive/14.2.0/react/bar-series	-	301	@/charts/archive/14.2.0/react/bar-series/	no-cache
both	www.ag-grid.com	/archive/36.2.0/no-such-page/	-	404	-	no-cache
# --- studio: no host canonicalisation at all before.
before	ag-grid.com	/studio/archive/2.0.0/react/getting-started/	-	200	ct:text/html
after	ag-grid.com	/studio/archive/2.0.0/react/getting-started/	-	301	$W/studio/archive/2.0.0/react/getting-started/
before	javascript-grid.ag-grid.com	/studio/archive/3.0.0/react/getting-started/	-	200	ct:text/html
after	javascript-grid.ag-grid.com	/studio/archive/3.0.0/react/getting-started/	-	301	$W/studio/archive/3.0.0/react/getting-started/
after	blog.ag-grid.com	/studio/archive/2.1.0/	-	301	$W/studio/archive/2.1.0/
both	www.ag-grid.com	/studio/archive/3.0.0/react/getting-started/	text/markdown	200	ct:text/markdown
both	www.ag-grid.com	/studio/archive/2.1.0/	text/markdown	200	ct:text/markdown
"

check_phase() {
  local phase="$1"
  echo "==> $phase"
  while IFS=$'\t' read -r when host path accept status expect cc; do
    [[ -z "$when" || "$when" == \#* ]] && continue
    # 'both' is the before and after phases; the in-flight phases run only their own rows.
    { [ "$when" = both ] && [[ "$phase" == before || "$phase" == after ]]; } || [ "$when" = "$phase" ] || continue
    local acc=()
    [ "$accept" = "-" ] || acc=(-H "Accept: $accept")
    local out code loc ct vary gotcc
    out="$(curl -s -o /dev/null -D - -H "Host: $host" "${acc[@]}" "$LOCAL$path" | tr -d '\r')"
    code="$(printf '%s\n' "$out" | awk 'NR==1{print $2}')"
    loc="$(printf '%s\n' "$out" | awk -F': ' 'tolower($1)=="location"{print $2}')"
    ct="$(printf '%s\n' "$out" | awk -F': ' 'tolower($1)=="content-type"{print $2}')"
    vary="$(printf '%s\n' "$out" | awk -F': ' 'tolower($1)=="vary"{print $2}' | paste -sd, -)"
    gotcc="$(printf '%s\n' "$out" | awk -F': ' 'tolower($1)=="cache-control"{print $2}' | paste -sd, -)"
    local ok=1 want="${expect//@/$LOCAL}"
    [ "$code" = "$status" ] || ok=0
    if [[ "$status" == 3* ]]; then
      [ "$loc" = "$want" ] || ok=0
    elif [ "$expect" != "-" ]; then
      IFS=',' read -ra checks <<< "$expect"
      for c in "${checks[@]}"; do
        case "$c" in
          ct:*) [[ "$ct" == "${c#ct:}"* ]] || ok=0;;
          vary:*) [[ ",$vary," == *"${c#vary:}"* ]] || ok=0;;
          novary:*) [[ ",$vary," != *"${c#novary:}"* ]] || ok=0;;
        esac
      done
    fi
    if [ "$cc" = absent ]; then
      [ -z "$gotcc" ] || ok=0
    elif [ -n "$cc" ]; then
      [ "$gotcc" = "$cc" ] || ok=0
    fi
    if [ "$ok" = 1 ]; then pass=$((pass+1)); printf 'PASS  %-6s %-28s %-62s %s\n' "$phase" "$host" "$path${accept:+ [$accept]}" "$code";
    else fail=$((fail+1)); printf 'FAIL  %-6s %-28s %-62s want %s %s, got %s loc=%s ct=%s vary=%s cc=%s\n' "$phase" "$host" "$path [$accept]" "$status" "$want${cc:+ cc=$cc}" "$code" "$loc" "$ct" "$vary" "$gotcc"; fi
  done <<< "$ROWS"
}

trap stop_httpd EXIT
start_httpd
check_phase before
stop_httpd

# Patch every archive .htaccess in place, twice: the second run must change nothing.
while read -r site version doc md; do
  case "$site" in grid) dir="archive/$version";; *) dir="$site/archive/$version";; esac
  f="$HTDOCS/$dir/.htaccess"
  [ -f "$f" ] || continue
  node "$PATCHER" "$f" --site "$site" --base "/$dir" | head -1
  cp "$f" "$f.once"
  node "$PATCHER" "$f" --site "$site" --base "/$dir" >/dev/null
  cmp -s "$f" "$f.once" || { echo "FAIL  second run changed $f"; fail=$((fail+1)); }
  rm -f "$f.once"
done <<< "$ARCHIVES"

start_httpd
check_phase after
stop_httpd

# Release candidates per product, set with the real patcher on the root .htaccess.
INFLIGHT="$REPO_DIR/scripts/uncached-archives.mjs"
node "$INFLIGHT" "$HTDOCS/.htaccess" set - 14.2.0 || { echo "FAIL  could not set charts in flight"; fail=$((fail+1)); }
start_httpd
check_phase charts-rc
stop_httpd
node "$INFLIGHT" "$HTDOCS/.htaccess" clear - 14.2.0 && node "$INFLIGHT" "$HTDOCS/.htaccess" set 36.2.0 - \
  || { echo "FAIL  could not move the in-flight entry to grid"; fail=$((fail+1)); }
start_httpd
check_phase grid-rc
if [ "${KEEP_RUNNING:-}" = "1" ]; then
  trap - EXIT
  echo "httpd left running on :$PORT (stop: $HTTPD -f $WORK/httpd.conf -k stop)"
fi
echo
echo "==> $pass passed, $fail failed"
[ "$fail" = 0 ]
