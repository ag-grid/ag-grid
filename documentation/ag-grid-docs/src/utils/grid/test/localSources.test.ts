import type { BrowserContext, Page, Route } from '@playwright/test';
import { readFile, readdir, rm, utimes, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
    routeExternalThroughMirror,
    routePdfFontsFromDisk,
    routePublicFilesFromDisk,
    routeSiteThroughMemo,
} from './localSources';

type Answer = { status: number; headers?: Record<string, string>; body?: string } | Error;

const BASE_URL = 'https://grid-staging.ag-grid.com/prefix/';

/** What a stand-in route was told to do, in place of a spy on each method. */
type Outcome = { fulfilled: unknown[]; fellBack: number; aborted: unknown[] };

/** The page members the routes use, so a stand-in can be cast to `Page` without `unknown`. */
type RoutedPage = Pick<Page, 'route' | 'url'> & {
    context(): Pick<BrowserContext, 'browser'>;
    evaluate(pageFunction: unknown): Promise<string>;
};

type StandIn = { userAgent?: string; browser?: ReturnType<BrowserContext['browser']> };

/** Registers a route on a stand-in page and returns what Playwright would see: the predicate and the handler. */
async function register(
    routeOn: (page: Page) => Promise<void>,
    { userAgent = 'test-agent', browser = null }: StandIn = {}
) {
    let matches: (url: URL) => boolean = () => false;
    let evaluations = 0;
    let handler: Parameters<Page['route']>[1] = () => {};
    const page: RoutedPage = {
        route: async (url, registered) => {
            if (typeof url !== 'function') {
                throw new Error('The route must match by predicate');
            }
            matches = url;
            handler = registered;
            const dispose = async () => {};
            return { dispose, [Symbol.asyncDispose]: dispose };
        },
        url: () => 'https://grid-staging.ag-grid.com/examples/page/example/vanilla/',
        context: () => ({ browser: () => browser }),
        evaluate: async () => {
            evaluations++;
            return userAgent;
        },
    };
    await routeOn(page as Page);

    // Each URL answers from its own queue, so a test states the origin's replies in order.
    const answers = new Map<string, Answer[]>();
    const fetches: { url: string; options: unknown }[] = [];
    const request = async (
        url: string,
        { method = 'GET', headers = {} as Record<string, string>, resourceType = 'image' } = {}
    ) => {
        if (!matches(new URL(url))) {
            throw new Error(`${url} never reaches this route`);
        }
        const outcome: Outcome = { fulfilled: [], fellBack: 0, aborted: [] };
        const route = {
            request: () => ({
                url: () => url,
                method: () => method,
                headers: () => headers,
                resourceType: () => resourceType,
            }),
            fetch: async (options: { url?: string } = {}) => {
                // The origin answers whatever URL is fetched, which a route may change from the one requested.
                const fetched = options.url ?? url;
                fetches.push({ url: fetched, options });
                const answer = answers.get(fetched)!.shift()!;
                if (answer instanceof Error) {
                    throw answer;
                }
                return {
                    status: () => answer.status,
                    headers: () => answer.headers ?? {},
                    body: async () => Buffer.from(answer.body ?? ''),
                };
            },
            fulfill: async (response: unknown) => {
                outcome.fulfilled.push(response);
            },
            fallback: async () => {
                outcome.fellBack++;
            },
            abort: async (code: unknown) => {
                outcome.aborted.push(code);
            },
        } as Route;
        await handler(route, route.request());
        return outcome;
    };
    const answer = (url: string, ...replies: Answer[]) => answers.set(url, replies);
    return {
        matches: (url: string) => matches(new URL(url)),
        request,
        fetches,
        answer,
        evaluations: () => evaluations,
    };
}

const registerMemo = () => register((page) => routeSiteThroughMemo(page, BASE_URL));

describe('routeSiteThroughMemo', () => {
    test('matches only what every test shares, not pages, example files or other hosts', async () => {
        const match = (await registerMemo()).matches;

        expect(match(`${BASE_URL}files/ag-grid-community/dist/package/main.esm.mjs`)).toBe(true);
        expect(match(`${BASE_URL}example-runner/example-runner.js`)).toBe(true);
        expect(match('https://grid-staging.ag-grid.com/fonts/pdf-export/IBMPlexSansJP-Bold.ttf')).toBe(true);
        expect(match('https://grid-staging.ag-grid.com/example-assets/olympic-winners.json')).toBe(true);
        expect(match(`${BASE_URL}examples/filter-multi/display-style/vanilla/main.js`)).toBe(false);
        expect(match(`${BASE_URL}react-data-grid/filter-multi/`)).toBe(false);
        expect(match('https://grid-staging.ag-grid.com/files/ag-grid-community/dist/package/main.esm.mjs')).toBe(false);
        expect(match('https://cdn.jsdelivr.net/prefix/files/react.js')).toBe(false);
    });

    test('fetches a bundle once per worker and replays it, without the framing headers of the decoded body', async () => {
        const { request, fetches, answer } = await registerMemo();
        const url = `${BASE_URL}files/once.js`;
        const headers = { 'content-type': 'text/javascript', 'content-encoding': 'br', 'content-length': '9' };
        answer(url, { status: 200, headers, body: 'export {}' });

        const first = await request(url);
        const second = await request(url);

        expect(fetches).toHaveLength(1);
        for (const outcome of [first, second]) {
            expect(outcome).toEqual({
                fulfilled: [
                    { status: 200, headers: { 'content-type': 'text/javascript' }, body: Buffer.from('export {}') },
                ],
                fellBack: 0,
                aborted: [],
            });
        }
    });

    test('shares one fetch between bundle URLs differing only in the page build stamp', async () => {
        const { request, fetches, answer } = await registerMemo();
        const url = `${BASE_URL}files/ag-grid-enterprise/dist/ag-grid-enterprise.min.js`;
        answer(`${url}?t=1`, { status: 200, body: 'umd' });

        const first = await request(`${url}?t=1`);
        const second = await request(`${url}?t=2`);

        expect(fetches.map((fetch) => fetch.url)).toEqual([`${url}?t=1`]);
        expect(second.fulfilled).toEqual(first.fulfilled);
    });

    test('keeps a non-numeric t, which is not the build stamp, in the key', async () => {
        const { request, fetches, answer } = await registerMemo();
        const url = `${BASE_URL}files/query.js`;
        answer(`${url}?t=a`, { status: 200 });
        answer(`${url}?t=b`, { status: 200 });

        await request(`${url}?t=a`);
        await request(`${url}?t=b`);

        expect(fetches.map((fetch) => fetch.url)).toEqual([`${url}?t=a`, `${url}?t=b`]);
    });

    test('forwards the request headers, a fallback override such as the WAF bypass included, and never follows a redirect', async () => {
        const { request, fetches, answer } = await registerMemo();
        const url = `${BASE_URL}files/headers.js`;
        answer(url, { status: 200 });

        await request(url, {
            headers: { 'x-ag-ci-verify': 'secret', 'if-none-match': '"etag"', 'accept-encoding': 'zstd' },
        });

        expect(fetches[0].options).toEqual({
            url,
            headers: { 'x-ag-ci-verify': 'secret', 'accept-encoding': 'gzip, deflate, br' },
            maxRedirects: 0,
        });
    });

    test('leaves a redirect to the browser, and keeps doing so without fetching it again', async () => {
        const { request, fetches, answer } = await registerMemo();
        const url = `${BASE_URL}files/moved.js`;
        answer(url, { status: 301, headers: { location: `${BASE_URL}files/new.js` } });

        for (const outcome of [await request(url), await request(url)]) {
            expect(outcome).toEqual({ fulfilled: [], fellBack: 1, aborted: [] });
        }
        expect(fetches).toHaveLength(1);
    });

    test('passes an error status through once and asks the origin again next time', async () => {
        const { request, fetches, answer } = await registerMemo();
        const url = `${BASE_URL}files/flaky.js`;
        answer(url, { status: 503, body: 'busy' }, { status: 200, body: 'ok' });

        const failed = await request(url);
        const recovered = await request(url);

        expect(failed.fulfilled).toEqual([{ status: 503, headers: {}, body: Buffer.from('busy') }]);
        expect(recovered.fulfilled).toEqual([{ status: 200, headers: {}, body: Buffer.from('ok') }]);
        expect(fetches).toHaveLength(2);
    });

    test('hands a failed fetch to the browser and does not keep the failure', async () => {
        const { request, fetches, answer } = await registerMemo();
        const url = `${BASE_URL}files/reset.js`;
        answer(url, new Error('read ECONNRESET'), { status: 200, body: 'ok' });

        const failed = await request(url);
        const recovered = await request(url);

        expect(failed).toEqual({ fulfilled: [], fellBack: 1, aborted: [] });
        expect(recovered.fulfilled).toEqual([{ status: 200, headers: {}, body: Buffer.from('ok') }]);
        expect(fetches).toHaveLength(2);
    });

    test('aborts a request whose page closed mid-fetch rather than handing it on', async () => {
        const { request, answer } = await registerMemo();
        const url = `${BASE_URL}files/closed.js`;
        answer(url, new Error('route.fetch: Target page, context or browser has been closed'));

        expect(await request(url)).toEqual({ fulfilled: [], fellBack: 0, aborted: ['aborted'] });
    });

    test('leaves anything but a GET to the browser', async () => {
        const { request, fetches } = await registerMemo();

        expect(await request(`${BASE_URL}files/post.js`, { method: 'POST' })).toEqual({
            fulfilled: [],
            fellBack: 1,
            aborted: [],
        });

        expect(fetches).toHaveLength(0);
    });

    test('fetches a PDF font asked for at the site root from below the base, where a prefixed build serves it', async () => {
        const { request, fetches, answer } = await registerMemo();
        const deployed = `${BASE_URL}fonts/pdf-export/IBMPlexSansJP-Bold.ttf`;
        answer(deployed, { status: 200, body: 'ttf' });

        const first = await request('https://grid-staging.ag-grid.com/fonts/pdf-export/IBMPlexSansJP-Bold.ttf');
        const second = await request(deployed);

        expect(fetches.map((fetch) => fetch.url)).toEqual([deployed]);
        expect(second.fulfilled).toEqual(first.fulfilled);
    });

    test('lets the page finish loading its fonts before answering a data request, never a script', async () => {
        const { request, answer, evaluations } = await register((page) =>
            routeSiteThroughMemo(page, 'https://www.ag-grid.com/')
        );
        answer('https://www.ag-grid.com/example-assets/olympic-winners.json', { status: 200, body: '[]' });
        answer('https://www.ag-grid.com/files/main.js', { status: 200, body: 'export {}' });

        await request('https://www.ag-grid.com/files/main.js', { resourceType: 'script' });
        expect(evaluations()).toBe(0);
        await request('https://www.ag-grid.com/example-assets/olympic-winners.json', { resourceType: 'fetch' });
        expect(evaluations()).toBe(1);
    });
});

// The mirror persists to disk, so the tests use a host of their own and remove what they wrote.
const MIRROR_DIR = fileURLToPath(new URL('../../../../.playwright-network-mirror/', import.meta.url));
const MIRROR_HOST = `localsources-test-${process.pid}.invalid`;
const SITE_ORIGIN = new URL(BASE_URL).origin;
const DAY_MS = 24 * 60 * 60 * 1000;

/** A worker's state lives in the module, so a fresh import stands in for the next worker, reading only disk. */
async function nextWorker(standIn?: StandIn) {
    vi.resetModules();
    const worker = await import('./localSources');
    const onPage = (pageStandIn?: StandIn) =>
        register((page) => worker.routeExternalThroughMirror(page, SITE_ORIGIN), pageStandIn);
    return { ...(await onPage(standIn)), worker, onPage };
}

const mirrorFiles = async () =>
    (await readdir(MIRROR_DIR).catch(() => [] as string[])).filter((name) => name.startsWith(MIRROR_HOST));

describe('routeExternalThroughMirror', () => {
    let path = 0;
    // Every test asks for URLs of its own, so one test's entries never answer another's.
    const mirrorUrl = (file = 'bundle.js') => `https://${MIRROR_HOST}/${++path}/${file}`;

    afterEach(async () => {
        vi.useRealTimers();
        const missMarker = `miss-${process.ppid}-`;
        const names = await readdir(MIRROR_DIR).catch(() => [] as string[]);
        await Promise.all(
            names
                .filter((name) => name.startsWith(MIRROR_HOST) || name.startsWith(missMarker))
                .map((name) => rm(`${MIRROR_DIR}${name}`, { force: true }))
        );
    });

    test('matches every http(s) request off the site origin, never the site under test', async () => {
        const { matches } = await register((page) => routeExternalThroughMirror(page, SITE_ORIGIN));

        expect(matches('https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js')).toBe(true);
        expect(matches('http://flags.fmcdn.net/data/flags/w20/gb.png')).toBe(true);
        expect(matches(`${BASE_URL}files/ag-grid-community/dist/package/main.esm.mjs`)).toBe(false);
        expect(matches('data:text/plain,hello')).toBe(false);
    });

    test('shares one entry between bundle URLs differing only in the page build stamp', async () => {
        const { request, fetches, answer } = await nextWorker();
        const url = mirrorUrl('ag-grid-enterprise.min.js');
        answer(`${url}?t=1`, { status: 200, body: 'umd' });

        const first = await request(`${url}?t=1`);
        const second = await request(`${url}?t=2`);

        expect(fetches.map((fetch) => fetch.url)).toEqual([`${url}?t=1`]);
        expect(first.fulfilled).toEqual([{ status: 200, headers: {}, body: Buffer.from('umd') }]);
        expect(second.fulfilled).toEqual(first.fulfilled);
    });

    test('serves the next worker from disk without asking the origin again', async () => {
        const url = mirrorUrl();
        const writer = await nextWorker();
        writer.answer(url, { status: 200, headers: { 'content-type': 'text/javascript' }, body: 'stored' });
        await writer.request(url);

        const reader = await nextWorker();

        expect((await reader.request(url)).fulfilled).toEqual([
            { status: 200, headers: { 'content-type': 'text/javascript' }, body: Buffer.from('stored') },
        ]);
        expect(reader.fetches).toHaveLength(0);
    });

    test.each([
        ['cut short', (file: Buffer) => file.subarray(0, -3)],
        ['without its metadata line', () => Buffer.from('no newline')],
    ])('fetches again over an entry on disk %s', async (_, damage) => {
        const url = mirrorUrl();
        const writer = await nextWorker();
        writer.answer(url, { status: 200, body: 'whole body' });
        await writer.request(url);
        const [name] = await mirrorFiles();
        const file = `${MIRROR_DIR}${name}`;
        await writeFile(file, damage(await readFile(file)));

        const reader = await nextWorker();
        reader.answer(url, { status: 200, body: 'fetched again' });

        expect((await reader.request(url)).fulfilled).toEqual([
            { status: 200, headers: {}, body: Buffer.from('fetched again') },
        ]);
    });

    // Read half an hour after it was stored, so every lifetime below is judged at the same age. The clock stays
    // near the real one: the sweep judges temporary files by their real write time.
    const HALF_HOUR_MS = 30 * 60 * 1000;
    const httpDate = (ms: number) => new Date(ms).toUTCString();

    test.each([
        ['immutable, whatever its max-age', () => ({ 'cache-control': 'max-age=60, immutable' }), false],
        ['a max-age the half hour has not used up', () => ({ 'cache-control': 'max-age=3600' }), false],
        ['a max-age the half hour has used up', () => ({ 'cache-control': 'max-age=60' }), true],
        ['no-cache', () => ({ 'cache-control': 'no-cache' }), true],
        ['no-store', () => ({ 'cache-control': 'no-store' }), true],
        ['no lifetime at all', () => ({}), false],
        [
            'a last-modified eleven days before, a day of life',
            (now: number) => ({ 'last-modified': httpDate(now - 11 * DAY_MS) }),
            false,
        ],
        [
            'a last-modified a minute before, six seconds of life',
            (now: number) => ({ 'last-modified': httpDate(now - 60_000) }),
            true,
        ],
    ])('a stored entry with %s, read half an hour later, is revalidated: %s', async (_, headersAt, revalidated) => {
        const now = Date.now();
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(now);
        const url = mirrorUrl();
        const writer = await nextWorker();
        writer.answer(url, { status: 200, headers: headersAt(now), body: 'stored' });
        await writer.request(url);

        vi.setSystemTime(now + HALF_HOUR_MS);
        const reader = await nextWorker();
        reader.answer(url, { status: 304 });
        await reader.request(url);

        expect(reader.fetches).toHaveLength(revalidated ? 1 : 0);
    });

    test('revalidates with the stored validators, replays the stored body on a 304 and renews its lifetime', async () => {
        const now = Date.now();
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(now);
        const url = mirrorUrl();
        const headers = { 'cache-control': 'max-age=60', etag: '"v1"', 'last-modified': httpDate(now - DAY_MS) };
        const writer = await nextWorker();
        writer.answer(url, { status: 200, headers, body: 'stored' });
        await writer.request(url);

        vi.setSystemTime(now + HALF_HOUR_MS);
        const reader = await nextWorker();
        reader.answer(url, { status: 304 });
        const outcome = await reader.request(url, { headers: { 'if-none-match': '"browser"' } });
        vi.setSystemTime(now + HALF_HOUR_MS + 30_000);
        const renewed = await nextWorker();
        await renewed.request(url);

        expect(reader.fetches[0].options).toEqual({
            url,
            headers: {
                'accept-encoding': 'gzip, deflate, br',
                'if-none-match': '"v1"',
                'if-modified-since': httpDate(now - DAY_MS),
            },
        });
        expect(outcome.fulfilled).toEqual([{ status: 200, headers, body: Buffer.from('stored') }]);
        expect(renewed.fetches).toHaveLength(0);
    });

    test('keeps serving a stored copy when its revalidation errors or fails outright', async () => {
        const url = mirrorUrl();
        const writer = await nextWorker();
        writer.answer(url, { status: 200, headers: { 'cache-control': 'no-cache' }, body: 'stale' });
        await writer.request(url);
        const stale = [{ status: 200, headers: { 'cache-control': 'no-cache' }, body: Buffer.from('stale') }];

        const erroring = await nextWorker();
        erroring.answer(url, { status: 503 });
        const failing = await nextWorker();
        failing.answer(url, new Error('read ECONNRESET'));

        expect((await erroring.request(url)).fulfilled).toEqual(stale);
        expect((await failing.request(url)).fulfilled).toEqual(stale);
    });

    test('settles a 4xx for the rest of the worker but asks again after a 5xx or a failed fetch', async () => {
        const { request, fetches, answer } = await nextWorker();
        const [gone, busy, reset] = [mirrorUrl('gone.js'), mirrorUrl('busy.js'), mirrorUrl('reset.js')];
        answer(gone, { status: 404 });
        answer(busy, { status: 503 }, { status: 200, body: 'ok' });
        answer(reset, new Error('read ECONNRESET'), { status: 200, body: 'ok' });

        for (const url of [gone, busy, reset]) {
            expect(await request(url)).toEqual({ fulfilled: [], fellBack: 1, aborted: [] });
        }
        expect(await request(gone)).toEqual({ fulfilled: [], fellBack: 1, aborted: [] });
        expect((await request(busy)).fulfilled).toEqual([{ status: 200, headers: {}, body: Buffer.from('ok') }]);
        expect((await request(reset)).fulfilled).toEqual([{ status: 200, headers: {}, body: Buffer.from('ok') }]);
        expect(fetches.map((fetch) => fetch.url)).toEqual([gone, busy, reset, busy, reset]);
    });

    test('names each URL that went to the network once, with the page that asked for it', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { request, answer, worker } = await nextWorker();
        const url = mirrorUrl('missing.js');
        answer(url, { status: 404 });

        await request(url);
        await request(url);
        worker.warnOnNetworkAccess();
        worker.warnOnNetworkAccess();

        expect(warn.mock.calls).toEqual([
            [
                `Not mirrored, so these went to the network:\n - ${url}\n   requested by https://grid-staging.ag-grid.com/examples/page/example/vanilla/`,
            ],
        ]);
        warn.mockRestore();
    });

    test('leaves a URL another worker of the run already named unreported', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const url = mirrorUrl('missing.js');
        const first = await nextWorker();
        first.answer(url, { status: 404 });
        await first.request(url);
        const second = await nextWorker();
        second.answer(url, { status: 404 });
        await second.request(url);

        first.worker.warnOnNetworkAccess();
        second.worker.warnOnNetworkAccess();

        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });

    test('keys an entry by the browser asking, reading its user agent once per browser', async () => {
        const url = mirrorUrl('font.css');
        const browser = {} as NonNullable<StandIn['browser']>;
        const chromium = await nextWorker({ userAgent: 'chromium', browser });
        chromium.answer(url, { status: 200, body: 'for chromium' });
        await chromium.request(url);
        await chromium.request(url);

        // The same worker, so the stored entry is there to be found if the key ignored the agent.
        const firefox = await chromium.onPage({ userAgent: 'firefox' });
        firefox.answer(url, { status: 200, body: 'for firefox' });

        expect((await firefox.request(url)).fulfilled).toEqual([
            { status: 200, headers: {}, body: Buffer.from('for firefox') },
        ]);
        expect(chromium.fetches).toHaveLength(1);
        expect(chromium.evaluations()).toBe(1);
    });

    test('answers a Google Fonts stylesheet for an installed family from the package, without the network', async () => {
        const { request, fetches } = await register((page) => routeExternalThroughMirror(page, SITE_ORIGIN));

        const outcome = await request('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400&display=swap');

        expect(outcome.fulfilled).toEqual([
            { contentType: 'text/css', body: expect.stringContaining("font-family: 'IBM Plex Sans'") },
        ]);
        expect(fetches).toHaveLength(0);
    });

    test('drops a download the test ended before, without reporting it or remembering it as failed', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { request, fetches, answer, worker } = await nextWorker();
        const url = mirrorUrl('lazy.png');
        answer(url, new Error('route.fetch: Test ended.'), { status: 200, body: 'png' });

        expect(await request(url)).toEqual({ fulfilled: [], fellBack: 0, aborted: ['aborted'] });
        worker.warnOnNetworkAccess();
        expect((await request(url)).fulfilled).toEqual([{ status: 200, headers: {}, body: Buffer.from('png') }]);

        expect(warn).not.toHaveBeenCalled();
        expect(fetches).toHaveLength(2);
        warn.mockRestore();
    });

    test('lets the page finish loading its fonts before answering a data request, never a script', async () => {
        const browser = {} as NonNullable<StandIn['browser']>;
        const { request, answer, evaluations } = await nextWorker({ browser });
        const [script, data] = [mirrorUrl('lib.js'), mirrorUrl('rows.json')];
        answer(script, { status: 200, body: 'export {}' });
        answer(data, { status: 200, body: '[]' });

        // The first request also reads the browser's user agent, once.
        await request(script, { resourceType: 'script' });
        expect(evaluations()).toBe(1);
        await request(data, { resourceType: 'fetch' });
        expect(evaluations()).toBe(2);
    });

    test('sweeps entries unused for 30 days and temporary files older than an hour, keeping the rest', async () => {
        const now = Date.now() / 1000;
        const planted = {
            [`${MIRROR_HOST}-stale`]: now - 31 * (DAY_MS / 1000),
            [`${MIRROR_HOST}-recent`]: now - 29 * (DAY_MS / 1000),
            [`${MIRROR_HOST}-orphan.tmp`]: now - 2 * 60 * 60,
            [`${MIRROR_HOST}-writing.tmp`]: now - 60,
        };
        for (const [name, time] of Object.entries(planted)) {
            await writeFile(`${MIRROR_DIR}${name}`, '');
            await utimes(`${MIRROR_DIR}${name}`, time, time);
        }

        await nextWorker();

        await vi.waitFor(async () =>
            expect((await mirrorFiles()).sort()).toEqual([`${MIRROR_HOST}-recent`, `${MIRROR_HOST}-writing.tmp`])
        );
    });
});

const PUBLIC_DIR = fileURLToPath(new URL('../../../../public/', import.meta.url));

describe('routePublicFilesFromDisk', () => {
    const fromDisk = (path: string) => ({ path, headers: { 'access-control-allow-origin': '*' } });

    test('serves a shipped file from the checkout, its percent-encoded name decoded', async () => {
        const { request } = await register((page) => routePublicFilesFromDisk(page));

        const outcome = await request('https://www.ag-grid.com/example-assets/space-company-logos/rocket%20lab.png');

        expect(outcome.fulfilled).toEqual([fromDisk(`${PUBLIC_DIR}example-assets/space-company-logos/rocket lab.png`)]);
    });

    test('serves any file shipped in public/, images too, for www.ag-grid.com only', async () => {
        const { request, matches } = await register((page) => routePublicFilesFromDisk(page));

        expect((await request('https://www.ag-grid.com/images/ag-grid-loading-spinner.svg')).fulfilled).toEqual([
            fromDisk(`${PUBLIC_DIR}images/ag-grid-loading-spinner.svg`),
        ]);
        expect(matches('https://grid-staging.ag-grid.com/images/ag-grid-loading-spinner.svg')).toBe(false);
    });

    test('lets the page finish loading its fonts before answering a data request, never an image', async () => {
        const { request, evaluations } = await register((page) => routePublicFilesFromDisk(page));

        await request('https://www.ag-grid.com/example-assets/olympic-winners.json', { resourceType: 'image' });
        expect(evaluations()).toBe(0);
        const data = await request('https://www.ag-grid.com/example-assets/olympic-winners.json', {
            resourceType: 'fetch',
        });
        expect(evaluations()).toBe(1);
        expect(data.fulfilled).toEqual([fromDisk(`${PUBLIC_DIR}example-assets/olympic-winners.json`)]);
    });

    test('leaves a file that is not shipped, or a path escaping public/, to the network', async () => {
        const { request } = await register((page) => routePublicFilesFromDisk(page));

        for (const url of [
            'https://www.ag-grid.com/example-assets/not-shipped.json',
            'https://www.ag-grid.com/example-assets/..%2f..%2fpackage.json',
            'https://www.ag-grid.com/example-assets/%E0%A4%A.json',
        ]) {
            expect(await request(url)).toEqual({ fulfilled: [], fellBack: 1, aborted: [] });
        }
    });
});

describe('routePdfFontsFromDisk', () => {
    test('serves a shipped PDF font under any path prefix of the site as a TrueType font', async () => {
        const { request, matches } = await register((page) => routePdfFontsFromDisk(page, SITE_ORIGIN));

        const outcome = await request(`${BASE_URL}fonts/pdf-export/IBMPlexSansJP-Bold.ttf`);

        expect(outcome.fulfilled).toEqual([
            { path: `${PUBLIC_DIR}fonts/pdf-export/IBMPlexSansJP-Bold.ttf`, contentType: 'font/ttf' },
        ]);
        expect(matches('https://www.ag-grid.com/fonts/pdf-export/IBMPlexSansJP-Bold.ttf')).toBe(false);
    });

    test('leaves a font that is not shipped, or a name escaping the folder, to the network', async () => {
        const { request } = await register((page) => routePdfFontsFromDisk(page, SITE_ORIGIN));

        for (const name of ['NotShipped.ttf', '..%2f..%2f..%2fpackage.json']) {
            expect(await request(`${BASE_URL}fonts/pdf-export/${name}`)).toEqual({
                fulfilled: [],
                fellBack: 1,
                aborted: [],
            });
        }
    });
});
