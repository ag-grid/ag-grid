import type { Page, Route } from '@playwright/test';
import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile, readdir, rename, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { GOOGLE_FONTS_CSS, localFontStylesheet } from './localFonts';
import { isLocalRun } from './localRun';
import { isAbandoned, whileTheRequestMatters } from './routeGuard';

const PUBLIC_SITE_ORIGIN = 'https://www.ag-grid.com';
const PUBLIC_DIR = fileURLToPath(new URL('../../../../public/', import.meta.url));

/** The checkout's copy of a URL path under `public/`, or undefined for one that escapes it or does not decode. */
function localPathFor(urlPath: string): string | undefined {
    let decoded: string;
    try {
        decoded = decodeURIComponent(urlPath);
    } catch {
        return undefined;
    }
    const filePath = join(PUBLIC_DIR, decoded);
    return filePath.startsWith(PUBLIC_DIR) ? filePath : undefined;
}

/** Not `access`, which also passes for a directory - `fulfill` would then throw EISDIR and strand the route. */
const isFile = (path: string): Promise<boolean> =>
    stat(path).then(
        (info) => info.isFile(),
        () => false
    );

/** The only types safe to hold: an image or stylesheet delays `load`, so waiting on `load` would deadlock. */
const TEXT_MEASURABLE_RESOURCE_TYPES = ['fetch', 'xhr'];

/**
 * Inlined faces cover the families examples measure, but not every one they can ask for, so data answered
 * from disk or memory can still beat a font that is still arriving and be measured in the fallback.
 */
async function waitForTextMeasurable(page: Page): Promise<void> {
    await page
        .evaluate(() => {
            const loaded =
                document.readyState === 'complete'
                    ? Promise.resolve()
                    : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }));
            return loaded.then(() => document.fonts.ready).then(() => undefined);
        })
        .catch(() => undefined);
}

/** Holds a data answer until the page's fonts are in: answered from memory or disk, it would beat them. */
async function fulfillMeasurable(page: Page, route: Route, response: Parameters<Route['fulfill']>[0]): Promise<void> {
    if (TEXT_MEASURABLE_RESOURCE_TYPES.includes(route.request().resourceType())) {
        await waitForTextMeasurable(page);
    }
    await route.fulfill(response);
}

/** Answers `www.ag-grid.com` from the checkout's `public/`, read per request so an edit is served at once. */
export async function routePublicFilesFromDisk(page: Page): Promise<void> {
    await page.route(
        (url) => url.origin === PUBLIC_SITE_ORIGIN,
        whileTheRequestMatters(async (route) => {
            const filePath = localPathFor(new URL(route.request().url()).pathname);
            if (!filePath || !(await isFile(filePath))) {
                await route.fallback();
                return;
            }
            // The page's origin is localhost, so the response needs to allow the cross-origin read.
            await fulfillMeasurable(page, route, { path: filePath, headers: { 'access-control-allow-origin': '*' } });
        })
    );
}

const MIRROR_DIR = fileURLToPath(new URL('../../../../.playwright-network-mirror/', import.meta.url));

/** One file per entry so a single rename publishes it whole; the first newline ends the metadata. */
const META_SEPARATOR = 0x0a;

type MirrorMeta = { status: number; headers: Record<string, string>; bytes: number; fetchedAt: number };
type MirrorEntry = { body: Buffer; meta: MirrorMeta };

/**
 * `getCacheBustingUrl` stamps a bundle URL with its page's build time (`?t=<ms>`), which names the page, not the
 * bytes: keyed with it, every page would fetch and hold the same bundle again.
 */
function withoutBuildStamp(url: URL): string {
    if (/^\d+$/.test(url.searchParams.get('t') ?? '')) {
        url.searchParams.delete('t');
    }
    return url.href;
}

/** What identifies an entry to this run, where it lives, and its URL without the build stamp. */
type MirrorId = { key: string; path: string; url: string };

/**
 * Keyed by user agent as well as URL, so a host that negotiates cannot answer the wrong browser: Google
 * Fonts serves `font-stretch: 100%` to one and `normal` to another. A browser upgrade earns a fresh key.
 * The digest keeps paths unique; the readable stem is so an entry can be identified and deleted by hand.
 */
function mirrorIdFor(url: string, userAgent: string): MirrorId {
    const parsed = new URL(url);
    const stem = `${parsed.hostname}${parsed.pathname}`.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 100);
    const unstamped = withoutBuildStamp(parsed);
    const key = `${userAgent}\n${unstamped}`;
    const digest = createHash('sha1').update(key).digest('hex').slice(0, 12);
    return { key, path: join(MIRROR_DIR, `${stem}-${digest}`), url: unstamped };
}

/** Any read failure - absent, truncated, mid-write - just means "not mirrored yet". */
async function readEntry(path: string): Promise<MirrorEntry | undefined> {
    try {
        const file = await readFile(path);
        const split = file.indexOf(META_SEPARATOR);
        if (split < 0) {
            return undefined;
        }
        const meta: MirrorMeta = JSON.parse(file.subarray(0, split).toString('utf8'));
        const body = file.subarray(split + 1);
        // The rename publishes a whole entry, so a short body means the file was damaged afterwards -
        // serving it would fail as a corrupt bundle rather than as a cache miss.
        if (body.length !== meta.bytes) {
            return undefined;
        }
        // Marks the entry as still in use so the sweep only reclaims what nothing asks for any more.
        const now = new Date();
        void utimes(path, now, now).catch(() => undefined);
        return { meta, body };
    } catch {
        return undefined;
    }
}

/** Written to a pid-suffixed name first: two workers renaming at once must not interleave one entry. */
async function writeEntry(path: string, { body, meta }: MirrorEntry): Promise<void> {
    const tmp = `${path}.${process.pid}.tmp`;
    await mkdir(MIRROR_DIR, { recursive: true });
    await writeFile(tmp, `${JSON.stringify(meta)}\n`, 'utf8');
    await appendFile(tmp, body);
    await rename(tmp, path);
}

/**
 * Housekeeping, not invalidation: a read renews the entry, so anything still wanted never ages out and this
 * only reclaims what nothing asks for any more - the superseded URL after a version bump, say.
 */
const MIRROR_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** A temporary file lives for milliseconds, so anything this old was orphaned by a worker that was killed. */
const TMP_MAX_AGE_MS = 60 * 60 * 1000;

let mirrorSweep: Promise<void> | undefined;

/** Deleting a live entry only costs one refetch, so age is judged on last use rather than first write. */
function sweepMirror(): Promise<void> {
    mirrorSweep ??= (async () => {
        const now = Date.now();
        const names = await readdir(MIRROR_DIR).catch(() => [] as string[]);
        await Promise.all(
            names.map(async (name) => {
                const path = join(MIRROR_DIR, name);
                const maxAge = name.endsWith('.tmp') ? TMP_MAX_AGE_MS : MIRROR_MAX_AGE_MS;
                const info = await stat(path).catch(() => undefined);
                if (info && now - info.mtimeMs > maxAge) {
                    await rm(path, { force: true }).catch(() => undefined);
                }
            })
        );
    })();
    return mirrorSweep;
}

const IMMUTABLE = /\bimmutable\b/;
const NO_REUSE = /\bno-(store|cache)\b/;
const MAX_AGE = /\bmax-age=(\d+)/;

/** RFC 9111's heuristic for a response that declares no lifetime: a tenth of how long it has existed. */
const HEURISTIC_FRACTION = 0.1;

/** How long the origin says the bytes stay good. Silence is not staleness, so it means "keep them". */
function freshnessMs(meta: MirrorMeta): number {
    const control = meta.headers['cache-control'] ?? '';
    if (NO_REUSE.test(control)) {
        return 0;
    }
    if (IMMUTABLE.test(control)) {
        return Infinity;
    }
    const maxAge = MAX_AGE.exec(control);
    if (maxAge) {
        return Number(maxAge[1]) * 1000;
    }
    const lastModified = Date.parse(meta.headers['last-modified'] ?? '');
    return isNaN(lastModified) ? Infinity : (meta.fetchedAt - lastModified) * HEURISTIC_FRACTION;
}

/**
 * Only ever asked on the first request for a URL in a worker - every later one is served from the memo - so
 * a run never re-checks something it has already answered, however long it runs.
 */
const isFresh = (meta: MirrorMeta): boolean => Date.now() - meta.fetchedAt < freshnessMs(meta);

function withoutHeaders(headers: Record<string, string>, drop: string[]): Record<string, string> {
    const kept = { ...headers };
    for (let i = 0, len = drop.length; i < len; ++i) {
        delete kept[drop[i]];
    }
    return kept;
}

/** `route.fetch` hands back a decoded body, so the origin's framing headers no longer describe it. */
const BODY_FRAMING_HEADERS = ['content-encoding', 'content-length'];

/**
 * `route.fetch` only decodes the encodings it knows, and zstd is not one of them - a body negotiated that
 * way arrives compressed, is then stored with its `content-encoding` dropped, and replays as bytes the
 * browser reads as text. Firefox is the one that asks for zstd, so only its stylesheets and scripts broke.
 */
const DECODABLE_ENCODINGS = 'gzip, deflate, br';

/** The browser's own, which would earn a 304 with no body on a cold fetch. Ours are sent deliberately. */
const CONDITIONAL_HEADERS = ['if-none-match', 'if-modified-since'];

/** The request's own headers, a fallback's overrides included, asking only for a body `route.fetch` can decode. */
const forwardedHeaders = (route: Route): Record<string, string> => ({
    ...withoutHeaders(route.request().headers(), CONDITIONAL_HEADERS),
    'accept-encoding': DECODABLE_ENCODINGS,
});

/** Asks the origin "still this?", so a revalidation costs a round trip and no body when nothing changed. */
function validatorsFor(headers: Record<string, string>): Record<string, string> {
    const etag = headers['etag'];
    const lastModified = headers['last-modified'];
    return {
        ...(etag ? { 'if-none-match': etag } : {}),
        ...(lastModified ? { 'if-modified-since': lastModified } : {}),
    };
}

/**
 * A 4xx is the origin's settled answer, so re-asking would cost a round trip per test for the same reply.
 * Confined to the run and never written to disk: a stored failure would outlive a CDN's bad minute.
 */
const settledFailures = new Set<string>();

/**
 * Fetches, or revalidates what is already stored. A stored copy is only ever discarded for a 2xx that
 * replaces it - an error or an unreachable origin keeps serving it, since stale beats failing the suite.
 */
async function fetchIntoMirror(
    route: Route,
    url: string,
    id: MirrorId,
    stored: MirrorEntry | undefined
): Promise<MirrorEntry | undefined> {
    let entry: MirrorEntry;
    try {
        const sent = forwardedHeaders(route);
        const response = await route.fetch({
            url,
            headers: stored ? { ...sent, ...validatorsFor(stored.meta.headers) } : sent,
        });
        const status = response.status();
        if (stored && status === 304) {
            entry = { body: stored.body, meta: { ...stored.meta, fetchedAt: Date.now() } };
        } else if (status < 200 || status >= 300) {
            // `route.fetch` has already followed any redirect, so nothing here carries the bytes.
            if (status >= 400 && status < 500 && !stored) {
                settledFailures.add(id.key);
            }
            return stored;
        } else {
            const body = await response.body();
            entry = {
                body,
                meta: {
                    status,
                    headers: withoutHeaders(response.headers(), BODY_FRAMING_HEADERS),
                    bytes: body.length,
                    fetchedAt: Date.now(),
                },
            };
        }
    } catch (error) {
        // A test ending mid-download is not the origin failing: nothing to report, and the copy is still wanted.
        if (isAbandoned(error)) {
            throw error;
        }
        return stored;
    }
    // Persisting is best effort - a full or read-only disk should not cost us a response already in hand.
    await writeEntry(id.path, entry).catch(() => undefined);
    return entry;
}

/**
 * Single-flight per worker: every caller of a key awaits one load. A rejected load, or one `keep` declines, is
 * forgotten, so a transient failure or a test ending mid-load is never replayed to the rest of the worker.
 */
function singleFlight<V>(
    cache: Map<string, Promise<V>>,
    key: string,
    load: () => Promise<V>,
    keep: (value: V) => boolean
): Promise<V> {
    let pending = cache.get(key);
    if (!pending) {
        pending = load();
        cache.set(key, pending);
        const forget = () => cache.delete(key);
        void pending.then((value) => keep(value) || forget(), forget);
    }
    return pending;
}

/** Bodies are multi-MB (`typescript.min.js` alone is ~6MB) and every test wants them, so resolve each once. */
const mirrorEntries = new Map<string, Promise<MirrorEntry | undefined>>();

const isStored = (entry: MirrorEntry | undefined): boolean => entry !== undefined;

/** Resolved once per worker, so a run judges a URL's freshness once however long it lasts. */
function loadMirrorEntry(route: Route, url: string, id: MirrorId): Promise<MirrorEntry | undefined> {
    if (settledFailures.has(id.key)) {
        return Promise.resolve(undefined);
    }
    return singleFlight(
        mirrorEntries,
        id.key,
        () =>
            readEntry(id.path).then((stored) =>
                stored && isFresh(stored.meta) ? stored : fetchIntoMirror(route, url, id, stored)
            ),
        isStored
    );
}

/** Every test wants the same handful of URLs, so report each one once rather than once per test. */
const reportedMisses = new Set<string>();
let unreportedMisses: string[] = [];

/**
 * Workers are separate processes, so an in-memory set would still report once per worker. The marker is
 * scoped to the run and named `.tmp` so the existing sweep reclaims it, leaving the next run free to warn.
 */
async function claimMissReport(url: string): Promise<boolean> {
    if (reportedMisses.has(url)) {
        return false;
    }
    reportedMisses.add(url);
    const marker = join(MIRROR_DIR, `miss-${process.ppid}-${createHash('sha1').update(url).digest('hex')}.tmp`);
    try {
        await mkdir(MIRROR_DIR, { recursive: true });
        await writeFile(marker, '', { flag: 'wx' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Names whatever the mirror could not answer, so the gap is visible without failing an otherwise fine run.
 * Silent once warm, so anything printed after the first run never mirrors at all - a 403, a 404, or a
 * response that is not eligible - rather than noise.
 */
export function warnOnNetworkAccess(): void {
    if (unreportedMisses.length > 0) {
        const urls = unreportedMisses.join('\n - ');
        unreportedMisses = [];
        // eslint-disable-next-line no-console
        console.warn(`Not mirrored, so these went to the network:\n - ${urls}`);
    }
}

/**
 * Everything off the site's own origin is mirrored. An allowlist of known CDNs leaves every host nobody
 * thought of reaching the public internet - `flags.fmcdn.net` already needed its own per-spec stub - so
 * the default is "mirror it" and only the build under test is exempt.
 */
const isExternalTo =
    (siteOrigin: string) =>
    (url: URL): boolean =>
        url.origin !== siteOrigin && (url.protocol === 'https:' || url.protocol === 'http:');

/**
 * Mirrors off-origin responses to disk, shared by every worker. Without this a cold run re-fetches the same
 * multi-MB bundles for every test, and under parallel load those requests time tests out.
 */
export async function routeExternalThroughMirror(page: Page, siteOrigin: string): Promise<void> {
    void sweepMirror();
    await page.route(
        isExternalTo(siteOrigin),
        whileTheRequestMatters(async (route) => {
            const url = route.request().url();
            const fontCss = url.startsWith(GOOGLE_FONTS_CSS) ? await localFontStylesheet(url) : undefined;
            if (fontCss) {
                await route.fulfill({ contentType: 'text/css', body: fontCss });
                return;
            }
            const id = mirrorIdFor(url, route.request().headers()['user-agent'] ?? '');
            const entry = await loadMirrorEntry(route, url, id);
            if (!entry) {
                // The example page, not the spec: every framework variant shares one spec, so only the URL
                // identifies which example asked for it.
                if (await claimMissReport(id.url)) {
                    unreportedMisses.push(`${url}\n   requested by ${page.url()}`);
                }
                await route.fallback();
                return;
            }
            await fulfillMeasurable(page, route, {
                status: entry.meta.status,
                headers: entry.meta.headers,
                body: entry.body,
            });
        })
    );
}

/** Exactly what `route.fulfill` takes, so a stored answer replays as the origin gave it. */
type SiteResponse = { status: number; headers: Record<string, string>; body: Buffer };

const isRedirect = (status: number): boolean => status >= 300 && status < 400;

/** A redirect is kept too, so the browser follows it without a fetch first; an error may be a bad minute. */
const isSettled = (response: SiteResponse): boolean => response.status >= 200 && response.status < 400;

/** The build under test, in memory only: each run's new workers fetch it afresh; a rebuild mid-run is not seen. */
const siteResponses = new Map<string, Promise<SiteResponse>>();

async function fetchSiteResponse(route: Route, url: string): Promise<SiteResponse> {
    // Unfollowed because WebKit cannot fulfil a redirect, and its body would resolve relative imports wrongly.
    const response = await route.fetch({ url, headers: forwardedHeaders(route), maxRedirects: 0 });
    return {
        status: response.status(),
        headers: withoutHeaders(response.headers(), BODY_FRAMING_HEADERS),
        body: await response.body(),
    };
}

const loadSiteResponse = (route: Route, url: string): Promise<SiteResponse> =>
    singleFlight(siteResponses, withoutBuildStamp(new URL(url)), () => fetchSiteResponse(route, url), isSettled);

/** At the site root: only the public site's examples load their data from their own origin. */
const EXAMPLE_ASSETS_URL_PREFIX = '/example-assets/';

/** Staging answers `no-cache` and each test is a fresh context, so this keeps what every test shares, never pages. */
export async function routeSiteThroughMemo(page: Page, baseURL: string): Promise<void> {
    // Resolved against the base, so a build deployed under a path prefix is matched too.
    const { origin } = new URL(baseURL);
    const filesPath = new URL('files/', baseURL).pathname;
    const runnerPath = new URL('example-runner/', baseURL).pathname;
    const pdfFontsPath = new URL('fonts/pdf-export/', baseURL).pathname;
    await page.route(
        (url) => {
            if (url.origin !== origin) {
                return false;
            }
            const pathname = url.pathname;
            return (
                pathname.startsWith(filesPath) ||
                pathname.startsWith(runnerPath) ||
                pathname.startsWith(pdfFontsPath) ||
                pathname.startsWith(EXAMPLE_ASSETS_URL_PREFIX)
            );
        },
        whileTheRequestMatters(async (route) => {
            const request = route.request();
            let response: SiteResponse | undefined;
            if (request.method() === 'GET') {
                try {
                    response = await loadSiteResponse(route, request.url());
                } catch (error) {
                    if (isAbandoned(error)) {
                        throw error;
                    }
                    // Left to the browser, whose own request fails or succeeds as it would without the memo.
                }
            }
            if (!response || isRedirect(response.status)) {
                await route.fallback();
                return;
            }
            await fulfillMeasurable(page, route, response);
        })
    );
}

/** The site's request routes, registered in turn: the later route matches first, so a shipped file wins. */
export async function routeSiteSources(page: Page, baseURL: string): Promise<void> {
    await routeExternalThroughMirror(page, new URL(baseURL).origin);
    await routeSiteThroughMemo(page, baseURL);
    // Only a local run serves the checkout; a deployed run gets the files its visitors get.
    if (isLocalRun(baseURL)) {
        await routePublicFilesFromDisk(page);
    }
}
