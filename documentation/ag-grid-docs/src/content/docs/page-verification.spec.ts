import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import type { CspViolationRecord } from '../../utils/csp/cspViolationReport';
import {
    CSP_HASH_HINT_ANNOTATION,
    CSP_VIOLATION_ANNOTATION,
    parseCspHashHint,
} from '../../utils/csp/cspViolationReport';

// Chromium writes the policy name with spaces in some messages and hyphens in others.
const isCspIssue = (msg: string) => /Content[- ]Security[- ]Policy|Refused to (load|execute|connect)/i.test(msg);

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
    const handle = (text: string, annotationPrefix: string) => {
        if (KNOWN_NOISE.some((n) => text.includes(n))) {
            return;
        }
        // The securitypolicyviolation listener below owns CSP reporting; all the console
        // text adds is the hash the browser suggests for a blocked inline script, which
        // the event itself doesn't carry.
        if (isCspIssue(text)) {
            const hint = parseCspHashHint(text, page.url());
            if (hint) {
                test.info().annotations.push({
                    type: CSP_HASH_HINT_ANNOTATION,
                    description: JSON.stringify(hint),
                });
            }
            return;
        }
        test.info().annotations.push({ type: 'warning', description: `${annotationPrefix} ${text}` });
    };

    page.on('console', (msg) => {
        if (msg.type() !== 'error' && msg.type() !== 'warning') {
            return;
        }
        handle(msg.text(), '[Console]');
    });

    page.on('pageerror', (error) => {
        handle(`Uncaught exception: ${error.message}`, '[Exception]');
    });

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

        await page.goto('/');
        await expect(page).toHaveTitle(/AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('homepage shows Docs and Demos navigation links', async ({ page }) => {
        await setupPage(page);

        await page.goto('/');
        // Both links appear in the large and small nav – use first() to target the large (desktop) nav
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Docs' }).first()).toBeVisible();
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Demos' }).first()).toBeVisible();
    });

    // --- Core pages ---

    test('demos page loads with an example grid', async ({ page }) => {
        await setupPage(page);

        await page.goto('/example');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await expect(page.locator('.ag-root-wrapper')).toBeVisible();
    });

    test('theme builder page loads', async ({ page }) => {
        await setupPage(page);

        await page.goto('/theme-builder/');
        await expect(page).toHaveTitle(/Theme Builder/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('API reference page loads', async ({ page }) => {
        await setupPage(page);

        await page.goto('/react-data-grid/reference/');
        await expect(page).toHaveTitle(/Reference/);
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('community page loads', async ({ page }) => {
        await setupPage(page);

        await page.goto('/community/');
        await expect(page).toHaveTitle(/Community/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('about page loads', async ({ page }) => {
        await setupPage(page);

        await page.goto('/about/');
        await expect(page).toHaveTitle(/About AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('contact page loads', async ({ page }) => {
        await setupPage(page);

        await page.goto('/contact/');
        await expect(page).toHaveTitle(/Contact AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    test('pricing page loads', async ({ page }) => {
        await setupPage(page);

        await page.goto('/license-pricing/');
        await expect(page).toHaveTitle(/Licence and Pricing/);
        await expect(page.locator('.site-header')).toBeVisible();
    });

    // --- Docs pages ---

    test('docs getting-started page loads', async ({ page }) => {
        await setupPage(page);

        await page.goto('/react-data-grid/getting-started/');
        await expect(page).toHaveTitle(/Quick Start/);
        // Left docs nav is always visible at desktop widths (CSS overrides mobile collapse)
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('clicking a left-nav link navigates to the correct doc page', async ({ page }) => {
        await setupPage(page);

        await page.goto('/react-data-grid/getting-started/');
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
            await page.goto('/react-data-grid/getting-started/');
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
        await page.goto('/react-data-grid/getting-started/');
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
        await page.goto('/react-data-grid/getting-started/');
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
                await page.goto(`/examples/${pageName}/${exampleName}/${framework}`);
                await expect(page.locator('.ag-root-wrapper')).toBeVisible({ timeout: 30_000 });
            });
        }
    }

    // --- Product switcher ---

    test('product switcher opens and shows AG products', async ({ page }) => {
        await setupPage(page);

        await page.goto('/');
        // The Products button opens the dropdown on hover (onMouseEnter)
        await page.getByRole('button', { name: 'Products' }).hover();
        // AG Charts and AG Studio links should now be visible in the dropdown
        await expect(page.getByRole('link', { name: /AG Charts/ }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /AG Studio/ }).first()).toBeVisible();
    });

    // --- CSP capture ---

    // Since no test fails on a CSP violation any more, a break in the capture path would
    // otherwise be invisible: the suite would stay green while quietly reporting nothing.
    // Serving an inline script the policy cannot authorise proves the whole path still works.
    test('captures a blocked inline script with the hash needed to authorise it', async ({ page }) => {
        await setupPage(page);

        // Route the URL the run actually resolved, so this holds for a build deployed under
        // a path prefix as well as at a domain root.
        await page.goto('/');
        await page.route(page.url(), async (route) => {
            const response = await route.fetch();
            const body = (await response.text()).replace(
                '</head>',
                '<script>window.__agCspSelfCheck = true;</script></head>'
            );
            await route.fulfill({ response, body });
        });
        await page.reload();

        const annotations = test.info().annotations;
        const captured = annotations.filter(
            (annotation) => annotation.type === CSP_VIOLATION_ANNOTATION || annotation.type === CSP_HASH_HINT_ANNOTATION
        );
        // The injected script is this test's own doing, so drop what it provoked before
        // asserting: only violations the site really has should reach the report, whether or
        // not the assertions below hold.
        annotations.splice(
            0,
            annotations.length,
            ...annotations.filter((annotation) => !captured.includes(annotation))
        );

        const violations = captured
            .filter((annotation) => annotation.type === CSP_VIOLATION_ANNOTATION)
            .map((annotation) => JSON.parse(annotation.description ?? '{}') as CspViolationRecord);
        expect(violations, 'blocked inline script').toContainEqual(
            expect.objectContaining({ blockedUri: 'inline', disposition: 'enforce' })
        );
        expect(
            captured.filter((annotation) => annotation.type === CSP_HASH_HINT_ANNOTATION).length,
            'hashes suggested for the blocked script'
        ).toBeGreaterThan(0);
    });
});
