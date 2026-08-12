import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const isCspIssue = (msg: string) => /Content-Security-Policy|Refused to (load|execute|connect)/i.test(msg);
// An actual enforced block, as opposed to a report-only policy that's merely being
// monitored ahead of enforcement. Enforced CSP violation messages vary in verb by
// directive ("Refused to load/execute/connect...", "Refused to apply inline style...",
// "Refused to frame...", "Refused to create a worker from...", "Refused to evaluate a
// string as JavaScript...", etc.) so rather than enumerate every verb, treat any
// CSP-related message that isn't marked report-only as enforced. Browsers prefix/suffix
// report-only violation messages with "report-only" or "[Report Only]" text
// (Chrome/Chromium use a space, not a hyphen, in the "[Report Only]" prefix).
const isEnforcedCspViolation = (msg: string) => isCspIssue(msg) && !/report[ -]only/i.test(msg);

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

// This is a smoke test suite: a page actually failing to load or render
// (checked via the assertions in each test below) is the main way a test
// fails. The one other hard-fail signal is a genuinely enforced CSP
// violation — something the browser actively blocked — since that's a
// real, actionable break we need to know about immediately, distinct from
// routine console noise. Everything else (console errors/warnings, uncaught
// exceptions, and report-only CSP monitoring that hasn't blocked anything
// yet) is surfaced as a test annotation for visibility in reports without
// failing the test. KNOWN_NOISE just keeps expected noise out of the
// annotations; it's report hygiene, not a safety mechanism.
async function setupPage(page: Page): Promise<string[]> {
    const cspViolations: string[] = [];

    const handle = (text: string, annotationPrefix: string) => {
        if (KNOWN_NOISE.some((n) => text.includes(n))) {
            return;
        }
        if (isEnforcedCspViolation(text)) {
            cspViolations.push(text);
            return;
        }
        const prefix = isCspIssue(text) ? '[CSP]' : annotationPrefix;
        test.info().annotations.push({ type: 'warning', description: `${prefix} ${text}` });
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

    return cspViolations;
}

// Every navigation below is base-relative (`'./'`, `'about/'`) rather than root-absolute (`'/about/'`)
// on purpose: Playwright resolves a leading-slash path against the base URL's *origin*, discarding any
// path prefix. A branch build is deployed under one (`https://testing.ag-grid.com/<TICKET>/`), so
// root-absolute paths there land on the site's 404 page instead of the page under test. Relative paths
// resolve against the whole base URL, so they work under a prefix and are unchanged for a root deploy.
test.describe('Page Verification', () => {
    // --- Homepage ---

    test('homepage loads with title and header visible', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('./');
        await expect(page).toHaveTitle(/AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('homepage shows Docs and Demos navigation links', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('./');
        // Both links appear in the large and small nav – use first() to target the large (desktop) nav
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Docs' }).first()).toBeVisible();
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Demos' }).first()).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    // --- Core pages ---

    test('demos page loads with an example grid', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('example');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await expect(page.locator('.ag-root-wrapper')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('theme builder page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('theme-builder/');
        await expect(page).toHaveTitle(/Theme Builder/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('API reference page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('react-data-grid/reference/');
        await expect(page).toHaveTitle(/Reference/);
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('community page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('community/');
        await expect(page).toHaveTitle(/Community/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('about page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('about/');
        await expect(page).toHaveTitle(/About AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('contact page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('contact/');
        await expect(page).toHaveTitle(/Contact AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('pricing page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('license-pricing/');
        await expect(page).toHaveTitle(/Licence and Pricing/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    // --- Docs pages ---

    test('docs getting-started page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('react-data-grid/getting-started/');
        await expect(page).toHaveTitle(/Quick Start/);
        // Left docs nav is always visible at desktop widths (CSS overrides mobile collapse)
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('clicking a left-nav link navigates to the correct doc page', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('react-data-grid/getting-started/');
        // 'Key Features' is a flat (non-grouped) item in the Getting Started section
        await page.locator('#docs-mobile-nav-collapser').getByRole('link', { name: 'Key Features' }).click();
        await expect(page).toHaveURL(/key-features/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    // The header's Docs button only toggles the left docs nav, so it must be gone at every
    // width where DocsNav pins that nav permanently open — from $breakpoint-docs-nav-medium
    // (1100px). Widths straddle that threshold, plus one well above it.
    test('docs button and left docs nav are never both visible', async ({ page }) => {
        const cspViolations = await setupPage(page);

        const docsButton = page.locator('#top-bar-docs-button');
        const docsNav = page.locator('#docs-mobile-nav-collapser');

        for (const { width, expectButton } of [
            { width: 1099, expectButton: true },
            { width: 1100, expectButton: false },
            { width: 1250, expectButton: false },
        ]) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto('react-data-grid/getting-started/');
            await expect(docsButton, `docs button at ${width}px`).toBeVisible({ visible: expectButton });
            await expect(docsNav, `docs nav at ${width}px`).toBeVisible({ visible: !expectButton });
        }

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    // A sticky header that is still showing the hamburger is a trap: the open menu is roughly as
    // tall as the page, so it could never scroll out of view. 1110px is below $nav-collapse, so
    // the hamburger is shown; 1250px is above it, where the nav is inline and must still stick.
    test('header only sticks once the nav is inline, not while the hamburger is shown', async ({ page }) => {
        const cspViolations = await setupPage(page);

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
        await page.goto('react-data-grid/getting-started/');
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
        await page.goto('react-data-grid/getting-started/');
        await expect(menuButton).toBeHidden();
        await page.evaluate(() => window.scrollTo(0, 1200));
        expect((await boxOf(header)).y, 'inline header stays pinned to the top').toBe(0);

        expect(cspViolations, 'CSP violations').toEqual([]);
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
                const cspViolations = await setupPage(page);

                // The standalone example page renders the grid directly in the top-level
                // document (no iframe), unlike the embedded docs-page runner.
                await page.goto(`examples/${pageName}/${exampleName}/${framework}`);
                await expect(page.locator('.ag-root-wrapper')).toBeVisible({ timeout: 30_000 });

                expect(cspViolations, 'CSP violations').toEqual([]);
            });
        }
    }

    // --- Product switcher ---

    test('product switcher opens and shows AG products', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('./');
        // The Products button opens the dropdown on hover (onMouseEnter)
        await page.getByRole('button', { name: 'Products' }).hover();
        // AG Charts and AG Studio links should now be visible in the dropdown
        await expect(page.getByRole('link', { name: /AG Charts/ }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /AG Studio/ }).first()).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });
});
