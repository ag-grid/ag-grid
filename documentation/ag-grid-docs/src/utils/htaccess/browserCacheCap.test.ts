// The site-wide browser-cache cap: nothing generated here may let a browser keep a response for
// more than 7 days. CloudFront's s-maxage is exempt, as it can be invalidated; max-age (with or
// without `immutable`), an Expires header and mod_expires lifetimes are not.
import type * as Constants from '../../constants';
import { getBlogVhostHeaderFragment, getHtaccessContent } from './htaccessRules';

const CAP_SECONDS = 604800;

const UNIT_SECONDS: Record<string, number> = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000,
    year: 31536000,
};

/** The lifetime an "access plus 1 month 2 days" (or "modification plus ...") expression grants. */
function expiresSeconds(expression: string): number | null {
    const m = expression.match(/^\s*(?:access|now|modification)\s+plus\s+(.+?)\s*$/i);
    if (!m) {
        // The "A<seconds>" / "M<seconds>" shorthand.
        const short = expression.match(/^\s*[AM](\d+)\s*$/);
        return short ? Number(short[1]) : null;
    }
    let total = 0;
    for (const [, n, unit] of m[1].matchAll(/(\d+)\s+(second|minute|hour|day|week|month|year)s?/gi)) {
        total += Number(n) * UNIT_SECONDS[unit.toLowerCase()];
    }
    return total;
}

/** max-age values in a Cache-Control value, s-maxage excluded. */
const maxAges = (value: string): number[] =>
    [...value.matchAll(/(?<![-\w])max-age\s*=\s*"?(\d+)/gi)].map((m) => Number(m[1]));

/** Every directive in `content` that would let a browser cache a response beyond the cap. */
function browserCacheViolations(content: string): string[] {
    const out: string[] = [];
    for (const raw of content.split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }
        const header = line.match(
            /^Header\s+(?:always\s+|onsuccess\s+)?(set|append|merge|add|edit\*?)\s+(Cache-Control|Expires)\s+(.*)$/i
        );
        if (header) {
            const [, action, name, rest] = header;
            const args = [...rest.matchAll(/"((?:[^"\\]|\\.)*)"|(\S+)/g)].map((m) => m[1] ?? m[2]);
            // edit takes a regex then its replacement; the others take the value.
            const value = action.toLowerCase().startsWith('edit') ? args[1] : args[0];
            if (name.toLowerCase() === 'cache-control') {
                if (maxAges(value ?? '').some((s) => s > CAP_SECONDS)) {
                    out.push(line);
                }
            } else {
                const until = Date.parse(value ?? '');
                // An Expires header set to a fixed date: allowed only if it cannot exceed the cap.
                if (Number.isNaN(until) || until - Date.now() > CAP_SECONDS * 1000) {
                    out.push(line);
                }
            }
            continue;
        }
        const expires = line.match(/^Expires(Default|ByType)\s+(.*)$/i);
        if (expires) {
            const expression = expires[1].toLowerCase() === 'bytype' ? expires[2].replace(/^\S+\s+/, '') : expires[2];
            const seconds = expiresSeconds(expression.replace(/^"|"$/g, ''));
            if (seconds === null || seconds > CAP_SECONDS) {
                out.push(line);
            }
        }
    }
    return out;
}

describe('browser-cache cap: nothing generated is cached by a browser for more than 7 days', () => {
    const configs: Array<[string, () => string]> = [
        ['production root', () => getHtaccessContent({ env: 'production' })],
        ['staging root', () => getHtaccessContent({ env: 'staging' })],
        [
            'production root with the in-flight block populated',
            () =>
                getHtaccessContent({
                    env: 'production',
                    uncachedGridArchive: '36.3.0',
                    uncachedChartsArchive: '14.3.0',
                }),
        ],
        ['blog vhost fragment', () => getBlogVhostHeaderFragment({ env: 'production' }, 'enforce')],
    ];

    it.each(configs)('%s', (_, content) => {
        const text = content();
        // The parser must have something to judge: every config sets Cache-Control somewhere.
        expect(text).toMatch(/Header\s+(?:always\s+)?set\s+Cache-Control/);
        expect(browserCacheViolations(text)).toEqual([]);
    });

    describe('an archive build', () => {
        let archiveContent: string;

        beforeAll(async () => {
            vi.resetModules();
            vi.doMock('../../constants', async (importActual) => {
                const actual = await importActual<typeof Constants>();
                return { ...actual, SITE_BASE_URL: '/archive/36.3.0/' };
            });
            const archiveRules = await import('./htaccessRules');
            archiveContent = archiveRules.getHtaccessContent({ env: 'production' });
        });

        afterAll(() => {
            vi.doUnmock('../../constants');
            vi.resetModules();
        });

        it('stays within the cap', () => {
            expect(archiveContent).toMatch(/Cache-Control/);
            expect(browserCacheViolations(archiveContent)).toEqual([]);
        });
    });

    describe('the check itself', () => {
        it.each([
            [
                'a year-long max-age',
                'Header set Cache-Control "public, max-age=31536000" "expr=%{REQUEST_URI} =~ m#^/x/#"',
            ],
            ['immutable with a long max-age', 'Header always set Cache-Control "max-age=2592000, immutable"'],
            ['an edit that raises max-age', 'Header edit Cache-Control "max-age=\\d+" "max-age=31536000"'],
            ['ExpiresByType a year', 'ExpiresByType text/css "access plus 1 year"'],
            ['ExpiresDefault 8 days', 'ExpiresDefault "access plus 8 days"'],
            ['ExpiresDefault in seconds', 'ExpiresDefault A700000'],
            ['an Expires header far ahead', 'Header set Expires "Thu, 01 Jan 2099 00:00:00 GMT"'],
        ])('fails %s, naming the line', (_, line) => {
            expect(browserCacheViolations(`${getHtaccessContent({ env: 'production' })}\n${line}\n`)).toEqual([line]);
        });

        it.each([
            [
                's-maxage of a year with a 7-day max-age',
                'Header set Cache-Control "public, max-age=604800, s-maxage=31536000"',
            ],
            ['ExpiresByType 1 week', 'ExpiresByType text/css "access plus 1 week"'],
            ['ExpiresDefault 1 hour', 'ExpiresDefault "access plus 1 hour"'],
        ])('passes %s', (_, line) => {
            expect(browserCacheViolations(line)).toEqual([]);
        });
    });
});
