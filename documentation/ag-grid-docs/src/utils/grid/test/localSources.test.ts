import type { Page, Route } from '@playwright/test';

import { routeSiteThroughMemo } from './localSources';

type Answer = { status: number; headers?: Record<string, string>; body?: string } | Error;

const BASE_URL = 'https://grid-staging.ag-grid.com/prefix/';

/** What a stand-in route was told to do, in place of a spy on each method. */
type Outcome = { fulfilled: unknown[]; fellBack: number; aborted: unknown[] };

/** Registers the memo on a stand-in page and returns what Playwright would see: the predicate and the handler. */
async function registerMemo() {
    let matches: (url: URL) => boolean = () => false;
    let handler: Parameters<Page['route']>[1] = () => {};
    const page: Pick<Page, 'route'> = {
        route: async (url, registered) => {
            if (typeof url !== 'function') {
                throw new Error('The memo must route by predicate');
            }
            matches = url;
            handler = registered;
            const dispose = async () => {};
            return { dispose, [Symbol.asyncDispose]: dispose };
        },
    };
    await routeSiteThroughMemo(page as Page, BASE_URL);

    // Each URL answers from its own queue, so a test states the origin's replies in order.
    const answers = new Map<string, Answer[]>();
    const fetches: { url: string; options: unknown }[] = [];
    const request = async (url: string, { method = 'GET', headers = {} as Record<string, string> } = {}) => {
        const outcome: Outcome = { fulfilled: [], fellBack: 0, aborted: [] };
        const route = {
            request: () => ({ url: () => url, method: () => method, headers: () => headers }),
            fetch: async (options: unknown) => {
                fetches.push({ url, options });
                const answer = answers.get(url)!.shift()!;
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
    return { matches: (url: string) => matches(new URL(url)), request, fetches, answer };
}

describe('routeSiteThroughMemo', () => {
    test('matches only the shared bundles and runner under the base, not pages, example files or other hosts', async () => {
        const match = (await registerMemo()).matches;

        expect(match(`${BASE_URL}files/ag-grid-community/dist/package/main.esm.mjs`)).toBe(true);
        expect(match(`${BASE_URL}example-runner/example-runner.js`)).toBe(true);
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

    test('forwards the request headers, a fallback override such as the WAF bypass included, and never follows a redirect', async () => {
        const { request, fetches, answer } = await registerMemo();
        const url = `${BASE_URL}files/headers.js`;
        answer(url, { status: 200 });

        await request(url, {
            headers: { 'x-ag-ci-verify': 'secret', 'if-none-match': '"etag"', 'accept-encoding': 'zstd' },
        });

        expect(fetches[0].options).toEqual({
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
});
