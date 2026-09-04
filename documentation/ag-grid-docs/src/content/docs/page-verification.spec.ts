import { expect, test } from '@playwright/test';
import type { Locator, Page, Request } from '@playwright/test';
import { createHash } from 'node:crypto';

import type { CspHashHint, CspViolationRecord } from '../../utils/csp/cspViolationReport';
import {
    CSP_HASH_HINT_ANNOTATION,
    CSP_VIOLATION_ANNOTATION,
    parseCspHashHint,
} from '../../utils/csp/cspViolationReport';

declare global {
    interface Window {
        __agCspSelfCheck?: boolean;
    }
}

/** Inline script the site policy cannot authorise, used to prove CSP capture still works. */
const CSP_SELF_CHECK_SCRIPT = 'window.__agCspSelfCheck = true;';
/**
 * SHA-256 of CSP_SELF_CHECK_SCRIPT: the hash the browser suggests when it blocks that script.
 * Nothing on the site has this hash, so if a post-deploy report ever lists it as a new blocked
 * inline script, the self-check test's clean-up (the afterEach beside it) did not run; the fix
 * is there, never in cspRules.ts. The test asserts this stays in step with the script.
 */
const CSP_SELF_CHECK_HASH = 'sha256-7OSnlh1HS3NTqM1IBkxOwGCmWtSFJgwSwUQYW0y1FH4=';

const isCspAnnotation = (annotation: { type: string }) =>
    annotation.type === CSP_VIOLATION_ANNOTATION || annotation.type === CSP_HASH_HINT_ANNOTATION;

// Index in the self-check test's annotations from which every CSP annotation is synthetic. Set
// by the test once its real navigation has been recorded, consumed by the afterEach beside it.
let selfCheckInjectionStart: number | undefined;

// Chromium writes the policy name with spaces in some messages and hyphens in others.
const isCspIssue = (msg: string) => /Content[- ]Security[- ]Policy|Refused to (load|execute|connect)/i.test(msg);

/**
 * Navigate without waiting for the load event.
 *
 * Playwright's default, `waitUntil: 'load'`, does not resolve until every subresource in the
 * document's delay-the-load-event set has settled. On these pages that set reaches hosts nobody
 * here controls: plausible.io on every page, img.youtube.com and img.shields.io on /community/,
 * and whatever Google Tag Manager injects. One slow vendor therefore times out a navigation to a
 * page the site rendered perfectly well — which is what turned three post-deploy runs red on
 * 2 September 2026 while the deployed site was fine. Two runs that day tested the same commit
 * minutes apart, one green and one red, so nothing in the build was ever the variable.
 *
 * `'domcontentloaded'` does not fix it: the Plausible tag is `defer`, and deferred scripts block
 * DOMContentLoaded as well. `'commit'` resolves once the response starts, and the auto-waiting
 * assertions in each test then do the real verification — as they always did, so nothing this
 * suite checks is lost. The load event is still given a bounded chance to arrive afterwards, for
 * the CSP report's sake; see settleThirdPartyTags.
 */
async function visit(page: Page, path: string): Promise<void> {
    await page.goto(path, { waitUntil: 'commit' });
}

/**
 * Requests still in flight per page, so a navigation that does time out can say what the browser
 * was waiting for. Without this the failure reads only as "Test timeout of 60000ms exceeded": the
 * three red runs on 2 September could be traced to the load event but never to a host, because
 * traces are off for this project and nothing else recorded the network.
 */
const inFlightRequests = new WeakMap<Page, Set<Request>>();

/** When the page last started a request, used to tell whether the tags have stopped arriving. */
const lastRequestStartedAt = new WeakMap<Page, number>();

/** Enough pending URLs to name the culprit; a stalled page can have dozens. */
const MAX_REPORTED_IN_FLIGHT_URLS = 12;

function annotateInFlightRequests(page: Page): void {
    const pending = inFlightRequests.get(page);
    if (!pending?.size) {
        return;
    }

    const countByHost = new Map<string, number>();
    for (const request of pending) {
        const url = URL.canParse(request.url()) ? new URL(request.url()) : undefined;
        // A request URL can be a scheme with no host (data:, blob:); group those under the scheme.
        const host = url ? url.host || url.protocol : '?';
        countByHost.set(host, (countByHost.get(host) ?? 0) + 1);
    }
    const hosts = [...countByHost]
        .sort(([, a], [, b]) => b - a)
        .map(([host, count]) => `${host}×${count}`)
        .join(', ');
    const urls = [...pending].slice(0, MAX_REPORTED_IN_FLIGHT_URLS).map((request) => `  ${request.url()}`);

    test.info().annotations.push({
        type: 'warning',
        description: `[In flight] ${pending.size} request(s) unfinished when the test ended — ${hosts}\n${urls.join('\n')}`,
    });
}

/**
 * Total budget for letting the third-party tags finish once a test's assertions have passed.
 *
 * The CSP report is only as complete as the tags that got a chance to run, and navigating on
 * 'commit' no longer waits for them — nor did waiting for 'load' ever really do it, since Google
 * Tag Manager injects its children asynchronously and their violations can land after the load
 * event. What used to buy the report that time was simply how long each test took; on 'commit' a
 * test finishes in about a second, which is not long enough. So the wait is explicit here rather
 * than incidental, and bounded: a hanging vendor costs this much for the test it hangs, plus an
 * annotation, instead of the whole suite.
 */
const THIRD_PARTY_TAG_SETTLE_TIMEOUT = 10_000;

/**
 * How long without a new request starting counts as the tags having finished arriving. Deliberately
 * not a list of vendor hostnames: the tag set is authored in GTM, outside this repo, so anything
 * hardcoded here would silently stop covering whatever is added there next.
 */
const THIRD_PARTY_TAG_QUIET_PERIOD = 1_000;

async function settleThirdPartyTags(page: Page): Promise<void> {
    if (page.isClosed()) {
        return;
    }
    const deadline = Date.now() + THIRD_PARTY_TAG_SETTLE_TIMEOUT;
    const remaining = () => deadline - Date.now();

    try {
        await page.waitForLoadState('load', { timeout: Math.max(1, remaining()) });
    } catch {
        test.info().annotations.push({
            type: 'warning',
            description: `[Tags] page never reached 'load' within ${THIRD_PARTY_TAG_SETTLE_TIMEOUT}ms, so CSP capture for it may be incomplete`,
        });
        // The one moment worth naming the host: a green run whose tags never finished is the
        // early warning that used to arrive only as a red run nobody could attribute.
        annotateInFlightRequests(page);
        return;
    }

    // Then wait out the asynchronously-injected tags, which the load event does not cover.
    while (remaining() > 0) {
        const quietFor = Date.now() - (lastRequestStartedAt.get(page) ?? 0);
        if (quietFor >= THIRD_PARTY_TAG_QUIET_PERIOD) {
            return;
        }
        await page.waitForTimeout(Math.min(THIRD_PARTY_TAG_QUIET_PERIOD - quietFor, remaining()));
    }
}

// Console messages that are known browser/environment noise unrelated to the
// site under test. Matched by substring so new message formats stay filtered.
const KNOWN_NOISE = [
    'ResizeObserver loop',
    'Failed to load resource: the server responded with a status of 404',
    'InstallTrigger is deprecated',
    'has a Report-Only policy without a report-uri',
    "was delivered in report-only mode, but does not specify a 'report-uri'",
    "was delivered in report-only mode, but does not specify a 'report-to'",
    "directive 'frame-ancestors' is ignored when delivered in a report-only policy",
    'License Key Not Found',
    'AG Grid and AG Charts Enterprise License',
    'All AG Grid and AG Charts Enterprise features are unlocked for trial.',
    'If you want to hide the watermark please email info@ag-grid.com for a trial license key',
    '**************************************',
];

// This is a smoke test suite: a page failing to load or render, per the assertions in
// each test below, is the only way a test fails here. Everything else the page reports
// (console errors/warnings, uncaught exceptions, CSP violations) is recorded as a test
// annotation for visibility without failing the test. CSP is annotated rather than
// asserted because the policy authorises inline scripts injected by tags authored in
// Google Tag Manager, outside this repo: editing a tag there invalidates its hash, which
// must not turn every page in the suite red. The post-deploy workflow reports those
// annotations to the team that owns the policy instead. KNOWN_NOISE just keeps expected
// noise out of the annotations; it's report hygiene, not a safety mechanism.
async function setupPage(page: Page): Promise<void> {
    const handle = (text: string, annotationPrefix: string, sourceUrl: string) => {
        if (KNOWN_NOISE.some((n) => text.includes(n))) {
            return;
        }
        if (isCspIssue(text)) {
            // What the console adds over the violation event is the hash the browser suggests
            // for a blocked inline script, which the event doesn't carry.
            const hint = parseCspHashHint(text, sourceUrl);
            if (hint) {
                test.info().annotations.push({
                    type: CSP_HASH_HINT_ANNOTATION,
                    description: JSON.stringify(hint),
                });
                return;
            }
            // Otherwise keep it visible in the report: the violation listener is installed on
            // documents, so a worker's CSP failure reaches the console and nothing else.
            test.info().annotations.push({ type: 'warning', description: `[CSP] ${text}` });
            return;
        }
        test.info().annotations.push({ type: 'warning', description: `${annotationPrefix} ${text}` });
    };

    page.on('console', (msg) => {
        if (msg.type() !== 'error' && msg.type() !== 'warning') {
            return;
        }
        // The message's own location, not page.url(): a violation inside an iframe is reported
        // against that frame's document, and a hash has to be matched to the page that needs it.
        handle(msg.text(), '[Console]', msg.location()?.url || page.url());
    });

    page.on('pageerror', (error) => {
        handle(`Uncaught exception: ${error.message}`, '[Exception]', page.url());
    });

    const pending = new Set<Request>();
    inFlightRequests.set(page, pending);
    page.on('request', (request) => {
        pending.add(request);
        lastRequestStartedAt.set(page, Date.now());
    });
    page.on('requestfinished', (request) => pending.delete(request));
    page.on('requestfailed', (request) => pending.delete(request));

    await watchCspViolations(page);
}

const REPORT_CSP_VIOLATION_BINDING = '__agReportCspViolation';

// The browser's own violation event, rather than the console text: it reports the
// effective directive, what was blocked and whether the policy enforced or merely
// reported it, and it catches violations that never reach the console at all (a
// blocked eval surfaces as an exception the calling script can swallow).
async function watchCspViolations(page: Page): Promise<void> {
    await page.exposeBinding(REPORT_CSP_VIOLATION_BINDING, (_source, violation: CspViolationRecord) => {
        test.info().annotations.push({ type: CSP_VIOLATION_ANNOTATION, description: JSON.stringify(violation) });
    });
    await page.addInitScript((binding) => {
        document.addEventListener('securitypolicyviolation', (event) => {
            const report = (window as unknown as Record<string, (violation: CspViolationRecord) => void>)[binding];
            report({
                directive: event.effectiveDirective || event.violatedDirective,
                blockedUri: event.blockedURI,
                disposition: event.disposition,
                sourceFile: event.sourceFile,
                pageUrl: document.location.href,
            });
        });
    }, REPORT_CSP_VIOLATION_BINDING);
}

test.describe('Page Verification', () => {
    // --- Homepage ---

    test('homepage loads with title and header visible', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/');
        await expect(page).toHaveTitle(/AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('homepage shows Docs and Demos navigation links', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/');
        // Both links appear in the large and small nav – use first() to target the large (desktop) nav
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Docs' }).first()).toBeVisible();
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Demos' }).first()).toBeVisible();
    });

    // --- Core pages ---

    test('demos page loads with an example grid', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/example');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await expect(page.locator('.ag-root-wrapper')).toBeVisible();
    });

    test('theme builder page loads', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/theme-builder/');
        await expect(page).toHaveTitle(/Theme Builder/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('API reference page loads', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/react-data-grid/reference/');
        await expect(page).toHaveTitle(/Reference/);
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('community page loads', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/community/');
        await expect(page).toHaveTitle(/Community/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('about page loads', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/about/');
        await expect(page).toHaveTitle(/About AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('contact page loads', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/contact/');
        await expect(page).toHaveTitle(/Contact AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('pricing page loads', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/license-pricing/');
        await expect(page).toHaveTitle(/Licence and Pricing/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    // The cookie policy itself is generated by Enzuzo and injected client-side (AG-18194), so this
    // asserts the shell the site is responsible for — the wrapper and a correctly-addressed loader —
    // rather than the injected policy, which would make this suite depend on a third-party request.
    // The loader must stay inside the content wrapper: it inserts the policy as its own next
    // sibling, so its position is what places the policy on the page.
    test('cookies page loads with the Enzuzo policy loader in the content wrapper', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/cookies/');
        await expect(page).toHaveTitle(/Cookies Policy/);
        await expect(page.locator('.site-header')).toBeVisible();

        // Injected by public/scripts/enzuzo-policy-embed.js rather than rendered, so this also
        // asserts that script ran: without it the policy never loads at all (AG-18194).
        const loader = page.locator('.layout-max-width-small > script#__enzuzo-root-script');
        await expect(loader).toHaveCount(1);
        await expect(loader).toHaveAttribute('src', /^https:\/\/app\.enzuzo\.com\/scripts\/cookies\/[\da-f-]+$/);

        // The vendor policy HTML ships three inline <script>s that the site CSP refuses; the embed
        // script strips them before insertion. Asserting zero rather than the policy's presence
        // keeps this off the vendor's availability — if the fetch fails there is simply no policy
        // and nothing to strip.
        await expect(page.locator('[ez-policy] script')).toHaveCount(0);
    });

    // --- Docs pages ---

    test('docs getting-started page loads', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/react-data-grid/getting-started/');
        await expect(page).toHaveTitle(/Quick Start/);
        // Left docs nav is always visible at desktop widths (CSS overrides mobile collapse)
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('clicking a left-nav link navigates to the correct doc page', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/react-data-grid/getting-started/');
        // 'Key Features' is a flat (non-grouped) item in the Getting Started section
        await page.locator('#docs-mobile-nav-collapser').getByRole('link', { name: 'Key Features' }).click();
        await expect(page).toHaveURL(/key-features/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    // The header's Docs button only toggles the left docs nav, so it must be gone at every
    // width where DocsNav pins that nav permanently open — from $breakpoint-docs-nav-medium
    // (1100px). Widths straddle that threshold, plus one well above it.
    test('docs button and left docs nav are never both visible', async ({ page }) => {
        await setupPage(page);

        const docsButton = page.locator('#top-bar-docs-button');
        const docsNav = page.locator('#docs-mobile-nav-collapser');

        for (const { width, expectButton } of [
            { width: 1099, expectButton: true },
            { width: 1100, expectButton: false },
            { width: 1250, expectButton: false },
        ]) {
            await page.setViewportSize({ width, height: 900 });
            await visit(page, '/react-data-grid/getting-started/');
            await expect(docsButton, `docs button at ${width}px`).toBeVisible({ visible: expectButton });
            await expect(docsNav, `docs nav at ${width}px`).toBeVisible({ visible: !expectButton });
        }
    });

    // A sticky header that is still showing the hamburger is a trap: the open menu is roughly as
    // tall as the page, so it could never scroll out of view. 1110px is below $nav-collapse, so
    // the hamburger is shown; 1250px is above it, where the nav is inline and must still stick.
    test('header only sticks once the nav is inline, not while the hamburger is shown', async ({ page }) => {
        await setupPage(page);

        const header = page.locator('.site-header');
        const menuButton = page.getByRole('button', { name: 'Toggle navigation' });
        const boxOf = async (locator: Locator) => {
            const box = await locator.boundingBox();
            if (!box) {
                throw new Error(`no layout box for ${locator}`);
            }
            return box;
        };

        await page.setViewportSize({ width: 1110, height: 900 });
        await visit(page, '/react-data-grid/getting-started/');
        await expect(menuButton).toBeVisible();

        await page.evaluate(() => window.scrollTo(0, 1200));
        const closed = await boxOf(header);
        expect(closed.y + closed.height, 'collapsed header scrolls away with the page').toBeLessThanOrEqual(0);
        // Nothing is pinned above the left docs nav, so it has nothing to offset itself for.
        const docsNav = await boxOf(page.locator('#docs-nav-scroll'));
        expect(docsNav.y, 'left docs nav pinned to the top of the viewport').toBe(0);

        // The header nav is a hydrated island, so a click can land before it is interactive.
        // Retry, clicking only while the button reports closed so a late click can't undo it.
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(async () => {
            if ((await menuButton.getAttribute('aria-expanded')) !== 'true') {
                await menuButton.click();
            }
            await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
        }).toPass();
        await expect(page.locator('#mobile-docs-nav')).toBeVisible();

        await page.evaluate(() => window.scrollTo(0, 1200));
        const open = await boxOf(header);
        expect(open.y + open.height, 'open nav scrolls away with the page').toBeLessThanOrEqual(0);

        // Reload rather than just resize: the open nav leaves inline heights on the collapsible.
        await page.setViewportSize({ width: 1250, height: 900 });
        await visit(page, '/react-data-grid/getting-started/');
        await expect(menuButton).toBeHidden();
        await page.evaluate(() => window.scrollTo(0, 1200));
        expect((await boxOf(header)).y, 'inline header stays pinned to the top').toBe(0);
    });

    // Sense-check the standalone example runner across frameworks by loading a couple of
    // examples directly at their framework-specific URLs and asserting the grid renders. This
    // exercises each framework's example compiler head-on — in particular the vanilla
    // (JavaScript) build. The docs-page inline runner defaults to the TypeScript variant, so it
    // can render successfully while the vanilla compiler is broken; loading `/vanilla` directly
    // is what actually catches that.
    const exampleRenderChecks = [
        { pageName: 'getting-started', exampleName: 'quick-start-example' },
        { pageName: 'row-sorting', exampleName: 'multi-column' },
    ];
    for (const { pageName, exampleName } of exampleRenderChecks) {
        for (const framework of ['reactFunctionalTs', 'vanilla']) {
            test(`example runner renders a grid: ${pageName}/${exampleName} (${framework})`, async ({ page }) => {
                await setupPage(page);

                // The standalone example page renders the grid directly in the top-level
                // document (no iframe), unlike the embedded docs-page runner.
                await visit(page, `/examples/${pageName}/${exampleName}/${framework}`);
                await expect(page.locator('.ag-root-wrapper')).toBeVisible({ timeout: 30_000 });
            });
        }
    }

    // --- Product switcher ---

    test('product switcher opens and shows AG products', async ({ page }) => {
        await setupPage(page);

        await visit(page, '/');
        // The Products button opens the dropdown on hover (onMouseEnter)
        await page.getByRole('button', { name: 'Products' }).hover();
        // AG Charts and AG Studio links should now be visible in the dropdown
        await expect(page.getByRole('link', { name: /AG Charts/ }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /AG Studio/ }).first()).toBeVisible();
    });

    // --- CSP capture ---

    // The synthetic violation is removed here rather than at the end of the test body: a timeout
    // mid-reload abandons the body before it can clean up, but Playwright still runs afterEach.
    // The CSP reporter reads every attempt's annotations, passed or not, so without this a flaky
    // attempt leaked CSP_SELF_CHECK_HASH into the post-deploy report as a real violation.
    test.afterEach(() => {
        if (selfCheckInjectionStart === undefined) {
            return;
        }
        const start = selfCheckInjectionStart;
        selfCheckInjectionStart = undefined;
        const annotations = test.info().annotations;
        annotations.splice(
            0,
            annotations.length,
            ...annotations.filter((annotation, index) => index < start || !isCspAnnotation(annotation))
        );
    });

    // Since no test fails on a CSP violation any more, a break in the capture path would
    // otherwise be invisible: the suite would stay green while quietly reporting nothing.
    // Serving an inline script the policy cannot authorise proves the whole path still works.
    test('captures a blocked inline script with the hash needed to authorise it', async ({ page }) => {
        await setupPage(page);

        // Route the URL the run actually resolved, so this holds for a build deployed under
        // a path prefix as well as at a domain root.
        await visit(page, '/');
        const annotations = test.info().annotations;
        selfCheckInjectionStart = annotations.length;

        await page.route(page.url(), async (route) => {
            const response = await route.fetch();
            const body = (await response.text()).replace('</head>', `<script>${CSP_SELF_CHECK_SCRIPT}</script></head>`);
            await route.fulfill({ response, body });
        });
        await page.reload({ waitUntil: 'commit' });

        // 'commit' resolves before the parser has reached the injected <script>, so wait for the
        // document to finish parsing. readyState leaves 'loading' at the end of parsing, ahead of
        // the deferred scripts that block DOMContentLoaded — verified against staging with every
        // third-party host stalled — so this barrier does not put a vendor back on the path.
        await page.waitForFunction(() => document.readyState !== 'loading');

        // The violation and the hash hint reach the test over an exposeBinding round-trip and a
        // console message respectively, so wait for both rather than assuming they have landed by
        // the time parsing finished. The assertions below then check their content, not arrival.
        await expect
            .poll(
                () => {
                    const recorded = annotations.slice(selfCheckInjectionStart).filter(isCspAnnotation);
                    return {
                        violation: recorded.some((annotation) => annotation.type === CSP_VIOLATION_ANNOTATION),
                        hashHint: recorded.some((annotation) => annotation.type === CSP_HASH_HINT_ANNOTATION),
                    };
                },
                { message: 'the blocked inline script reported a violation and a hash hint' }
            )
            .toEqual({ violation: true, hashHint: true });

        // Only what the injected reload provoked is this test's own doing: anything the first
        // navigation reported is a real violation and stays in the report. The afterEach above
        // removes the synthetic part whether or not the assertions below get to run.
        const synthetic = annotations.slice(selfCheckInjectionStart).filter(isCspAnnotation);

        expect(await page.evaluate(() => window.__agCspSelfCheck === true), 'injected script ran').toBe(false);

        const violations = synthetic
            .filter((annotation) => annotation.type === CSP_VIOLATION_ANNOTATION)
            .map((annotation) => JSON.parse(annotation.description ?? '{}') as CspViolationRecord);
        expect(violations, 'the injected script reported as blocked').toContainEqual(
            expect.objectContaining({
                blockedUri: 'inline',
                disposition: 'enforce',
                directive: expect.stringContaining('script-src'),
            })
        );

        const hashes = synthetic
            .filter((annotation) => annotation.type === CSP_HASH_HINT_ANNOTATION)
            .map((annotation) => (JSON.parse(annotation.description ?? '{}') as CspHashHint).hash);
        expect(CSP_SELF_CHECK_HASH, 'the hash documented beside CSP_SELF_CHECK_SCRIPT').toBe(
            `sha256-${createHash('sha256').update(CSP_SELF_CHECK_SCRIPT, 'utf8').digest('base64')}`
        );
        expect(hashes, 'the hash that would authorise the injected script').toContain(CSP_SELF_CHECK_HASH);
    });

    // Deliberately the last hook in the file, not the first: afterEach hooks run in declaration
    // order, and the settle below collects CSP annotations that the self-check clean-up above
    // would otherwise splice out as synthetic. Moving this up would quietly drop real violations
    // from that test's contribution to the report.
    test.afterEach(async ({ page }) => {
        const info = test.info();
        if (info.status !== info.expectedStatus) {
            // A failed test wants the diagnostic, not another wait: say what the browser was
            // still fetching and get out. This is the line that would have named the host behind
            // the 2 September failures from a single run.
            annotateInFlightRequests(page);
            return;
        }
        await settleThirdPartyTags(page);
    });
});
