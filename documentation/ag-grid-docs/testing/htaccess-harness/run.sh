#!/usr/bin/env bash
#
# Local Apache behavioural harness for the generated .htaccess redirect rules.
#
# Runs the REAL Apache (system httpd) against the REAL generated .htaccess from both repos,
# on localhost — so it exercises actual mod_rewrite/mod_alias behaviour (ordering, precedence,
# the parent docroot + /charts subdirectory interaction, 410s, single-hop) WITHOUT touching
# production (CloudFront would 403 any curl to the live site).
#
# Usage:
#   ./run.sh                         # emit both .htaccess from source, then assert expectations.tsv
#   PORT=9100 ./run.sh               # use a different port
#   CHARTS_REPO=/path/to/charts ./run.sh
#   SKIP_CHARTS_EMIT=1 ./run.sh      # reuse an existing .work/htdocs/charts/.htaccess (don't re-emit)
#   KEEP_RUNNING=1 ./run.sh          # leave httpd up afterwards for manual curl/poking
#
set -uo pipefail

HARNESS_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCS_DIR="$(cd "$HARNESS_DIR/../.." && pwd)"                 # documentation/ag-grid-docs
MAIN_REPO="$(cd "$DOCS_DIR/../.." && pwd)"                   # clean-latest
CHARTS_REPO="${CHARTS_REPO:-$MAIN_REPO/../charts-clean}"
CHARTS_PKG="$CHARTS_REPO/packages/ag-charts-website"
PORT="${PORT:-8899}"

# Which site host the redirect targets should resolve to, taken from URL_CONFIG in src/constants.ts.
# Selected by the Nx configuration via `--env staging|production`; defaults to production (local).
HTACCESS_ENV="${HTACCESS_ENV:-production}"
while [ $# -gt 0 ]; do
  case "$1" in
    --env) HTACCESS_ENV="$2"; shift 2;;
    --env=*) HTACCESS_ENV="${1#*=}"; shift;;
    *) shift;;
  esac
done
case "$HTACCESS_ENV" in staging|production) ;; *) echo "invalid --env '$HTACCESS_ENV' (use staging|production)"; exit 1;; esac

# Work dir lives OUTSIDE the repo tree on purpose: if the docroot were inside the project, Apache
# would walk up and read real ancestor .htaccess files (which contain <IfModule>, invalid in that
# context) and 500. ${TMPDIR} is outside the repo.
WORK="${HARNESS_WORK:-${TMPDIR:-/tmp}/ag-htaccess-harness}"
HTDOCS="$WORK/htdocs"

# --- locate Apache across macOS / Linux (override with HTTPD=... HTTPD_MODULES=...) ---
# If Apache or any required module is unavailable, SKIP (exit 0) rather than fail — so this target,
# wired into `nx test:e2e`, stays green on machines/CI without Apache. Set HTTPD_REQUIRED=1 to turn
# the skips into hard failures (e.g. an environment where Apache is meant to be present).
REQUIRED_MODS="mpm_prefork unixd authz_core log_config mime dir alias rewrite headers"
skip_or_fail() {
  if [ "${HTTPD_REQUIRED:-}" = "1" ]; then echo "ERROR: $1 (HTTPD_REQUIRED=1)"; exit 1; fi
  echo "==> SKIP test:htaccess — $1."
  echo "    Install Apache (macOS: built-in; Debian/Ubuntu: apt-get install apache2; RHEL: yum install httpd)"
  echo "    with mod_rewrite/mod_alias/mod_headers, or set HTTPD=/HTTPD_MODULES= to run the harness."
  exit 0
}

HTTPD="${HTTPD:-}"
if [ -z "$HTTPD" ]; then
  for c in httpd apache2 /usr/sbin/httpd /usr/sbin/apache2; do
    if command -v "$c" >/dev/null 2>&1; then HTTPD="$(command -v "$c")"; break; fi
    [ -x "$c" ] && { HTTPD="$c"; break; }
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
# Debian/Ubuntu compile some modules (e.g. unixd, log_config) statically into the apache2 binary;
# these appear in `httpd -l` and have NO `.so` on disk, so they must be neither required on disk nor
# LoadModule'd (doing so errors with "module is built-in"). macOS ships them as separate `.so` files.
# Build the LoadModule block dynamically: require + load only the modules that aren't built-in.
BUILTIN="$("$HTTPD" -l 2>/dev/null || true)"
LOADMODULES=""
for m in $REQUIRED_MODS; do
  if printf '%s\n' "$BUILTIN" | grep -Eq "mod_$m\.c$"; then
    continue
  fi
  [ -f "$MODS/mod_$m.so" ] || skip_or_fail "required Apache module mod_$m.so not found in $MODS"
  LOADMODULES="$LOADMODULES
LoadModule ${m}_module $MODS/mod_$m.so"
done
echo "==> using httpd: $HTTPD ; modules: $MODS"

rm -rf "$WORK"; mkdir -p "$HTDOCS/charts" "$WORK/logs"

# Resolve the canonical site host for this env from URL_CONFIG (src/constants.ts) — the single source
# of truth, not hardcoded here. Emitted via `tsx` (the repo's existing TS runner); nothing is written
# into the source tree. PUBLIC_BASE_URL='' satisfies urlWithBaseUrl under a plain node runtime.
SITE_HOST="$(
  cd "$DOCS_DIR" && PUBLIC_BASE_URL='' HENV="$HTACCESS_ENV" npx tsx -e \
    "import('./src/constants.ts').then(m => process.stdout.write(m.URL_CONFIG[process.env.HENV].hosts[0]))" 2>/dev/null
)"
[ -n "$SITE_HOST" ] || { echo "could not resolve site host from URL_CONFIG for env '$HTACCESS_ENV'"; exit 1; }
echo "==> env=$HTACCESS_ENV  site=https://$SITE_HOST"

# --- emit the production .htaccess via tsx (NO temp files written into src/) ---
emit() { # <repo-pkg-dir> <out-file>
  local pkg="$1" out="$2"
  ( cd "$pkg" && PUBLIC_BASE_URL='' HARNESS_OUT="$out" npx tsx -e \
    "import('./src/utils/htaccess/htaccessRules.ts').then(async (m) => { const { writeFileSync } = await import('node:fs'); writeFileSync(process.env.HARNESS_OUT, m.getHtaccessContent({ env: 'production' })); })" >/dev/null 2>&1 )
  [ -s "$out" ] || return 1
}

echo "==> emitting main .htaccess from $DOCS_DIR"
emit "$DOCS_DIR" "$HTDOCS/.htaccess" \
  || { echo "FAILED to emit main .htaccess"; exit 1; }

# The charts rules are generated by the charts repo's OWN build (Astro plugin), and a bare
# `npx vitest` there can't load its config / base URL (renders '/' not '/charts'). So source the
# charts .htaccess from its build output, or an explicit path — not a standalone emit.
CHARTS_OK=1
CHARTS_BUILD="$CHARTS_REPO/dist/packages/ag-charts-website/.htaccess"
if [ -n "${CHARTS_HTACCESS:-}" ]; then
  echo "==> using charts .htaccess from \$CHARTS_HTACCESS"
  cp "$CHARTS_HTACCESS" "$HTDOCS/charts/.htaccess"
elif [ -f "$CHARTS_BUILD" ]; then
  echo "==> using built charts .htaccess: $CHARTS_BUILD"
  cp "$CHARTS_BUILD" "$HTDOCS/charts/.htaccess"
else
  # Charts is a SEPARATE repo (its rules come from its own build). When it isn't available — e.g.
  # main-repo CI — run main-only and skip the /charts/* rows rather than failing.
  CHARTS_OK=0
  rmdir "$HTDOCS/charts" 2>/dev/null || true
  echo "==> WARN: no charts .htaccess found — skipping /charts/* rows."
  echo "    For full coverage: ( cd \"$CHARTS_REPO\" && npx nx build ag-charts-website ), or CHARTS_HTACCESS=/path ./run.sh"
fi
[ -s "$HTDOCS/.htaccess" ] || { echo "main .htaccess empty"; exit 1; }
[ "$CHARTS_OK" = 0 ] || [ -s "$HTDOCS/charts/.htaccess" ] || { echo "charts .htaccess empty"; exit 1; }

# Scope B: the generated rules carry the production canonical host (www.ag-grid.com). Map it to the
# host resolved from URL_CONFIG for this env in both the served .htaccess and the expectations (below)
# so the two stay consistent. Idempotent for production (maps the host to itself).
sed -i.bak "s|https://www\.ag-grid\.com|https://$SITE_HOST|g" "$HTDOCS/.htaccess" && rm -f "$HTDOCS/.htaccess.bak"
[ "$CHARTS_OK" = 1 ] && { sed -i.bak "s|https://www\.ag-grid\.com|https://$SITE_HOST|g" "$HTDOCS/charts/.htaccess" && rm -f "$HTDOCS/charts/.htaccess.bak"; }

# --- create placeholder pages for every 200-expected path (so 'no-shadow' rows can be 200) ---
while IFS=$'\t' read -r host path status loc; do
  [[ "$host" =~ ^#|^$ ]] && continue
  [ "$CHARTS_OK" = 0 ] && [[ "$path" == /charts/* ]] && continue
  if [ "$status" = "200" ]; then
    d="$HTDOCS${path%/}"; mkdir -p "$d"; echo "ok" > "$d/index.html"
  fi
done < <(cat "$HARNESS_DIR"/expectations.tsv "$HARNESS_DIR"/expectations.generated.tsv 2>/dev/null)

# --- minimal httpd.conf (portable across macOS + Linux) ---
cat > "$WORK/httpd.conf" <<EOF
# ServerRoot/runtime/mutex point at the writable work dir so we don't depend on a distro's
# default lock/runtime dirs or the Debian APACHE_* envvars. Everything else is absolute.
ServerRoot "$WORK"
DefaultRuntimeDir "$WORK"
Mutex file:$WORK default
TypesConfig /dev/null
Listen $PORT$LOADMODULES
ServerName localhost
PidFile "$WORK/httpd.pid"
ErrorLog "$WORK/logs/error.log"
DocumentRoot "$HTDOCS"
<Directory />
    AllowOverride None
    Require all denied
</Directory>
<Directory "$HTDOCS">
    AllowOverride All
    Require all granted
</Directory>
EOF

"$HTTPD" -f "$WORK/httpd.conf" -k start || { echo "httpd failed to start"; cat "$WORK/logs/error.log"; exit 1; }
sleep 1
stop_httpd() { "$HTTPD" -f "$WORK/httpd.conf" -k stop >/dev/null 2>&1; }
[ "${KEEP_RUNNING:-}" = "1" ] || trap stop_httpd EXIT

# --- run assertions ---
pass=0; fail=0; skipped=0
printf '%-5s %-46s %-6s %s\n' "STAT" "PATH" "CODE" "RESULT"
while IFS=$'\t' read -r host path status loc; do
  [[ "$host" =~ ^#|^$ ]] && continue
  if [ "$CHARTS_OK" = 0 ] && [[ "$path" == /charts/* ]]; then skipped=$((skipped+1)); continue; fi
  hostarg=(); [ "$host" = "apex" ] && hostarg=(-H "Host: ag-grid.com")
  read -r code redir < <(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "${hostarg[@]}" "http://localhost:$PORT$path")
  loc="${loc//www.ag-grid.com/$SITE_HOST}"   # no-op for production; maps to the env host otherwise
  ok=1
  [ "$code" = "$status" ] || ok=0
  if [ -n "${loc:-}" ] && [[ "$redir" != *"$loc"* ]]; then ok=0; fi
  if [ "$ok" = 1 ]; then pass=$((pass+1)); res="PASS";
  else fail=$((fail+1)); res="FAIL  want=$status${loc:+ loc~$loc} got=$code ${redir}"; fi
  printf '%-5s %-46s %-6s %s\n' "$res" "${host}:${path}" "$code" "${res#PASS}"
done < <(cat "$HARNESS_DIR"/expectations.tsv "$HARNESS_DIR"/expectations.generated.tsv 2>/dev/null)

echo
echo "==> $pass passed, $fail failed$([ "$skipped" -gt 0 ] && echo ", $skipped skipped (/charts/* — charts .htaccess not available)")"
[ "${KEEP_RUNNING:-}" = "1" ] && echo "httpd left running on :$PORT (stop: $HTTPD -f $WORK/httpd.conf -k stop)"
[ "$fail" = 0 ]
