import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import createPlugin from '../../plugins/agLinkChecker';

// The JUnit report is only written in CI and is not what these tests are about. The built processor
// exposes named exports only, which the plugin's default import reaches under Node but not under Vitest.
vi.mock('ag-shared/processor', () => ({
    default: {
        TestSuites: class {
            addTestSuite() {}
            writeJunitReport() {}
        },
        TestSuite: class {
            addTestCase() {}
        },
        TestCase: class {
            setFailure() {}
        },
    },
}));

type PluginOptions = Parameters<typeof createPlugin>[0];

const page = (body: string) => `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`;

const roots: string[] = [];

/** Writes a built site: each key is a path under the build directory, each value its contents. */
const buildSite = (files: Record<string, string>): string => {
    const root = mkdtempSync(join(tmpdir(), 'ag-link-checker-'));
    roots.push(root);
    for (const [path, contents] of Object.entries(files)) {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), contents);
    }
    return root;
};

/** Runs the plugin's build hook over `root`; resolves to the failure message, or undefined if the build passes. */
const checkSite = async (root: string, options: Partial<PluginOptions> = {}): Promise<string | undefined> => {
    const hook = createPlugin({ include: true, ...options }).hooks['astro:build:done'] as (
        args: unknown
    ) => Promise<void>;
    try {
        await hook({ dir: pathToFileURL(`${root}/`), logger: { info: () => undefined } });
        return undefined;
    } catch (error) {
        return (error as Error).message;
    }
};

/** A site whose home page carries `body`, beside the `/about/` page it can link to. */
const siteWithHome = (body: string, extra: Record<string, string> = {}) =>
    buildSite({ 'index.html': page(body), 'about/index.html': page('<h1 id="team">About</h1>'), ...extra });

beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.UPDATE_LINK_BASELINE;
    for (const root of roots.splice(0)) {
        rmSync(root, { recursive: true, force: true });
    }
});

describe('agLinkChecker', () => {
    it('passes a site whose links are all good', async () => {
        const root = siteWithHome('<a href="/about/">About</a><a href="/about/#team">Team</a>');
        expect(await checkSite(root)).toBeUndefined();
    });

    it('does nothing when it is not included', async () => {
        const root = siteWithHome('<a href="/missing/">Missing</a>');
        expect(await checkSite(root, { include: false })).toBeUndefined();
    });

    describe('a link to a page that does not exist', () => {
        it('fails the build', async () => {
            const root = siteWithHome('<a href="/missing/">Missing</a>');
            expect(await checkSite(root)).toContain('Link to missing/ could not be resolved');
        });

        it('fails the build for a fragment the page does not have', async () => {
            const root = siteWithHome('<a href="/about/#nobody">Nobody</a>');
            expect(await checkSite(root)).toContain('Link to /about/#nobody could not be resolved');
        });

        it('leaves an absolute link to the canonical host alone unless asked to check it', async () => {
            const root = siteWithHome('<a href="https://www.ag-grid.com/missing/">Missing</a>');
            expect(await checkSite(root)).toBeUndefined();
        });

        it('fails the build for an absolute link to the canonical host when asked to check it', async () => {
            const root = siteWithHome('<a href="https://www.ag-grid.com/missing/">Missing</a>');
            const checkCanonicalHostLinks = { isServedElsewhere: () => false };
            expect(await checkSite(root, { checkCanonicalHostLinks })).toContain(
                'Link to missing/ could not be resolved'
            );
        });

        it('accepts an absolute link to a page the build has', async () => {
            const root = siteWithHome('<a href="https://www.ag-grid.com/about/#team">Team</a>');
            const checkCanonicalHostLinks = { isServedElsewhere: () => false };
            expect(await checkSite(root, { checkCanonicalHostLinks })).toBeUndefined();
        });

        it('accepts an absolute link to a page another site serves', async () => {
            const root = siteWithHome('<a href="https://www.ag-grid.com/charts/">Charts</a>');
            const checkCanonicalHostLinks = {
                isServedElsewhere: (pathname: string) => pathname.startsWith('/charts/'),
            };
            expect(await checkSite(root, { checkCanonicalHostLinks })).toBeUndefined();
        });
    });

    describe('a link that redirects', () => {
        it('fails the build for a link missing its trailing slash', async () => {
            const root = siteWithHome('<a href="/about">About</a>');
            expect(await checkSite(root)).toContain('missing its trailing slash');
        });

        it('fails the build for a link to a retired host', async () => {
            const root = siteWithHome('<a href="https://ag-grid.com/about/">About</a>');
            expect(await checkSite(root)).toContain('which redirects to www.ag-grid.com');
        });

        it('fails the build for a link to an address the site redirects, naming where it goes', async () => {
            const root = siteWithHome('<a href="/old-about/">About</a>');
            const resolveRedirect = vi.fn(({ pathname }: { pathname: string }) =>
                pathname === '/old-about/' ? 'https://www.ag-grid.com/about/' : undefined
            );
            const message = await checkSite(root, { resolveRedirect });
            expect(message).toContain('Link /old-about/ redirects to https://www.ag-grid.com/about/');
            expect(message).not.toContain('could not be resolved');
        });

        it('asks about the slashed form of an address, as the missing slash is its own finding', async () => {
            const root = siteWithHome('<a href="/old-about">About</a>');
            const resolveRedirect = vi.fn(() => undefined);
            await checkSite(root, { resolveRedirect });
            expect(resolveRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/old-about/' }));
        });

        it('only asks about links the build cannot resolve', async () => {
            const root = siteWithHome('<a href="/about/">About</a>');
            const resolveRedirect = vi.fn(() => 'https://www.ag-grid.com/elsewhere/');
            expect(await checkSite(root, { resolveRedirect })).toBeUndefined();
            expect(resolveRedirect).not.toHaveBeenCalled();
        });

        it('lets the redirect see which files the build has', async () => {
            const root = siteWithHome('<a href="/old-about/">About</a>');
            const resolveRedirect = vi.fn(
                ({ fileExists, dirExists }: Parameters<NonNullable<PluginOptions['resolveRedirect']>>[0]) => {
                    expect([fileExists('/index.html'), fileExists('/about/'), dirExists('/about/')]).toEqual([
                        true,
                        false,
                        true,
                    ]);
                    return undefined;
                }
            );
            await checkSite(root, { resolveRedirect });
            expect(resolveRedirect).toHaveBeenCalled();
        });

        it('does not ask when the build is served under a prefix', async () => {
            const root = siteWithHome('<a href="/archive/1.0.0/old-about/">About</a>');
            const resolveRedirect = vi.fn(() => 'https://www.ag-grid.com/about/');
            await checkSite(root, { prefix: '/archive/1.0.0/', resolveRedirect });
            expect(resolveRedirect).not.toHaveBeenCalled();
        });
    });

    describe('a link to an ag-grid.com page with UTM parameters', () => {
        it('fails the build for a root-relative link', async () => {
            const root = siteWithHome('<a href="/about/?utm_source=home">About</a>');
            expect(await checkSite(root)).toContain('carries utm_source');
        });

        it('fails the build for an absolute link', async () => {
            const root = siteWithHome(
                '<a href="https://www.ag-grid.com/about/?utm_medium=email&amp;utm_campaign=x">About</a>'
            );
            expect(await checkSite(root)).toContain('carries utm_medium, utm_campaign');
        });

        it('accepts a link to someone else with UTM parameters', async () => {
            const root = siteWithHome('<a href="https://example.com/?utm_source=ag-grid">Partner</a>');
            expect(await checkSite(root)).toBeUndefined();
        });
    });

    describe('a link with no text, image alt text or label', () => {
        it('fails the build', async () => {
            const root = siteWithHome('<a href="/about/"></a>');
            expect(await checkSite(root)).toContain('Link /about/ has no text, image alt text or label');
        });

        it('fails the build for an icon-only link', async () => {
            const root = siteWithHome('<a href="/about/"><svg viewBox="0 0 1 1"><path d="M0 0"/></svg></a>');
            expect(await checkSite(root)).toContain('has no text, image alt text or label');
        });

        it.each([
            ['text', '<a href="/about/">About</a>'],
            ['an image alt', '<a href="/about/"><img src="/a.svg" alt="About"></a>'],
            ['an aria-label', '<a href="/about/" aria-label="About"><svg></svg></a>'],
            ['text after an icon', '<a href="/about/"><span><svg></svg></span><span> About </span></a>'],
        ])('accepts %s', async (_, link) => {
            expect(await checkSite(siteWithHome(link))).toBeUndefined();
        });

        it('does not police a link to someone else', async () => {
            const root = siteWithHome('<a href="https://example.com/"></a>');
            expect(await checkSite(root)).toBeUndefined();
        });

        it('does not take text from after the link', async () => {
            const root = siteWithHome('<a href="/about/"></a>About');
            expect(await checkSite(root)).toContain('has no text, image alt text or label');
        });
    });

    describe('the baseline of known problems', () => {
        const writeBaseline = (contents: object) => {
            const root = buildSite({ 'baseline.json': JSON.stringify(contents) });
            return join(root, 'baseline.json');
        };

        it('tolerates a listed problem and fails an unlisted one', async () => {
            const baselineFile = writeBaseline({ 'missing-page': ['/known/'] });
            const root = siteWithHome('<a href="/known/">Known</a><a href="/new/">New</a>');
            const message = await checkSite(root, { baselineFile });
            expect(message).toContain('Link to new/ could not be resolved');
            expect(message).not.toContain('known/');
        });

        it('passes when everything wrong is listed', async () => {
            const baselineFile = writeBaseline({
                'missing-page': ['/known/'],
                'utm-parameters': ['/about/?utm_source=x'],
                'unlabelled-link': ['/about/'],
            });
            const root = siteWithHome(
                '<a href="/known/">Known</a><a href="/about/?utm_source=x">About</a><a href="/about/"></a>'
            );
            expect(await checkSite(root, { baselineFile })).toBeUndefined();
        });

        it('does not let a listing for one rule excuse another', async () => {
            const baselineFile = writeBaseline({ 'unlabelled-link': ['/known/'] });
            const root = siteWithHome('<a href="/known/">Known</a>');
            expect(await checkSite(root, { baselineFile })).toContain('could not be resolved');
        });

        it('says which listed problems have been fixed', async () => {
            const baselineFile = writeBaseline({ 'missing-page': ['/fixed/'] });
            const root = siteWithHome('<a href="/about/">About</a>');
            expect(await checkSite(root, { baselineFile })).toBeUndefined();
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('missing-page /fixed/'));
        });

        it('treats a missing baseline file as an empty one', async () => {
            const root = siteWithHome('<a href="/missing/">Missing</a>');
            const baselineFile = join(root, 'no-such-file.json');
            expect(await checkSite(root, { baselineFile })).toContain('could not be resolved');
        });

        it('is rewritten with the current problems instead of failing when asked to', async () => {
            const baselineFile = writeBaseline({ 'missing-page': ['/fixed/'] });
            const root = siteWithHome('<a href="/missing/">Missing</a><a href="/about/"></a>');
            process.env.UPDATE_LINK_BASELINE = 'true';
            expect(await checkSite(root, { baselineFile })).toBeUndefined();
            expect(JSON.parse(readFileSync(baselineFile, 'utf8'))).toEqual({
                'missing-page': ['/missing/'],
                'unlabelled-link': ['/about/'],
            });
        });

        it('is created, with its folder, the first time it is written', async () => {
            const root = siteWithHome('<a href="/missing/">Missing</a>');
            const baselineFile = join(root, 'testing', 'baseline.json');
            process.env.UPDATE_LINK_BASELINE = 'true';
            expect(await checkSite(root, { baselineFile })).toBeUndefined();
            expect(JSON.parse(readFileSync(baselineFile, 'utf8'))).toEqual({ 'missing-page': ['/missing/'] });
        });
    });
});
