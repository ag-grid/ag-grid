import {
    absoluteAiApiProxyUrls,
    createFirstTimeCheck,
    isSameOriginRequest,
    removeCorsHeaders,
} from '@ag-website-shared/utils/aiApiProxy';

describe('isSameOriginRequest', () => {
    test.each`
        secFetchSite     | expected
        ${'same-origin'} | ${true}
        ${'same-site'}   | ${false}
        ${'cross-site'}  | ${false}
        ${'none'}        | ${false}
        ${undefined}     | ${false}
    `('Sec-Fetch-Site: $secFetchSite -> $expected', ({ secFetchSite, expected }) => {
        expect(isSameOriginRequest({ 'sec-fetch-site': secFetchSite })).toBe(expected);
    });
});

describe('removeCorsHeaders', () => {
    it('removes every Access-Control header and keeps the rest', () => {
        const headers = {
            'access-control-allow-origin': 'https://www.ag-grid.com',
            'access-control-allow-methods': 'GET,POST',
            'access-control-allow-headers': '*',
            'access-control-expose-headers': '*',
            'content-type': 'text/event-stream',
            vary: 'Origin',
        };

        removeCorsHeaders(headers);

        expect(headers).toEqual({ 'content-type': 'text/event-stream', vary: 'Origin' });
    });
});

describe('createFirstTimeCheck', () => {
    it('is true only the first time each key is seen', () => {
        const isFirstTime = createFirstTimeCheck();

        expect(isFirstTime('https://run.plnkr.co')).toBe(true);
        expect(isFirstTime('https://run.plnkr.co')).toBe(false);
        expect(isFirstTime('https://abc.csb.app')).toBe(true);
        expect(isFirstTime('')).toBe(true);
        expect(isFirstTime('')).toBe(false);
    });
});

describe('absoluteAiApiProxyUrls', () => {
    const origin = 'https://localhost:4610';

    test.each`
        content                                            | expected
        ${"const BASE_URL = '/ai-api-proxy';"}             | ${"const BASE_URL = 'https://localhost:4610/ai-api-proxy';"}
        ${'const BASE_URL = "/ai-api-proxy";'}             | ${'const BASE_URL = "https://localhost:4610/ai-api-proxy";'}
        ${'fetch(`/ai-api-proxy/responses`)'}              | ${'fetch(`https://localhost:4610/ai-api-proxy/responses`)'}
        ${"fetch('/ai-api-proxy/chat/completions')"}       | ${"fetch('https://localhost:4610/ai-api-proxy/chat/completions')"}
        ${"const URL = 'https://ai-api.ag-grid.com/api';"} | ${"const URL = 'https://ai-api.ag-grid.com/api';"}
        ${"const PATH = '/ai-api-proxy-other';"}           | ${"const PATH = '/ai-api-proxy-other';"}
        ${"const PATH = '/docs/ai-api-proxy';"}            | ${"const PATH = '/docs/ai-api-proxy';"}
    `('$content -> $expected', ({ content, expected }) => {
        const files = { 'main.ts': content };

        absoluteAiApiProxyUrls(files, origin);

        expect(files['main.ts']).toBe(expected);
    });

    it('rewrites every occurrence in every file', () => {
        const files = {
            'chatgptApi.ts': "const A = '/ai-api-proxy';\nconst B = '/ai-api-proxy';",
            'main.ts': 'const C = "/ai-api-proxy";',
            'styles.css': 'body {}',
        };

        absoluteAiApiProxyUrls(files, origin);

        expect(files).toEqual({
            'chatgptApi.ts': `const A = '${origin}/ai-api-proxy';\nconst B = '${origin}/ai-api-proxy';`,
            'main.ts': `const C = "${origin}/ai-api-proxy";`,
            'styles.css': 'body {}',
        });
    });
});
