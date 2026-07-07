import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

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

    // Fulfill rather than abort so the browser doesn't log net::ERR_FAILED to the console.
    await page.route('**://cdn.cookielaw.org/**', (route) =>
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
    );
    page.on('pageerror', (error) => {
        handle(`Uncaught exception: ${error.message}`, '[Exception]');
    });

    return cspViolations;
}

test.describe('Page Verification', () => {
    // --- Homepage ---

    test('homepage loads with title and header visible', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/');
        await expect(page).toHaveTitle(/AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('homepage shows Docs and Demos navigation links', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/');
        // Both links appear in the large and small nav – use first() to target the large (desktop) nav
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Docs' }).first()).toBeVisible();
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Demos' }).first()).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    // --- Core pages ---

    test('demos page loads with an example grid', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/example');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await expect(page.locator('.ag-root-wrapper')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('theme builder page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/theme-builder/');
        await expect(page).toHaveTitle(/Theme Builder/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('API reference page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/react-data-grid/reference/');
        await expect(page).toHaveTitle(/Reference/);
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('community page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/community/');
        await expect(page).toHaveTitle(/Community/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('about page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/about/');
        await expect(page).toHaveTitle(/About AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('contact page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/contact/');
        await expect(page).toHaveTitle(/Contact AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('pricing page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/license-pricing/');
        await expect(page).toHaveTitle(/Licence and Pricing/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    // --- Docs pages ---

    test('docs getting-started page loads', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/react-data-grid/getting-started/');
        await expect(page).toHaveTitle(/Quick Start/);
        // Left docs nav is always visible at desktop widths (CSS overrides mobile collapse)
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('clicking a left-nav link navigates to the correct doc page', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/react-data-grid/getting-started/');
        // 'Key Features' is a flat (non-grouped) item in the Getting Started section
        await page.locator('#docs-mobile-nav-collapser').getByRole('link', { name: 'Key Features' }).click();
        await expect(page).toHaveURL(/key-features/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    test('docs page with an inline example renders a grid', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/react-data-grid/row-sorting/');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        // The iframe uses IntersectionObserver to lazy-load its src.
        // scrollIntoViewIfNeeded() alone doesn't reliably trigger the observer in headless Chrome —
        // mouse.wheel() simulates a real scroll event and fires it more reliably.
        const iframeLocator = page.locator('iframe.exampleRunner').first();
        await iframeLocator.scrollIntoViewIfNeeded();
        await page.mouse.wheel(0, 100);
        await expect(iframeLocator).toHaveAttribute('src', /example-runner/, { timeout: 30_000 });

        const exampleFrame = page.locator('iframe.exampleRunner').first().contentFrame();
        await expect(exampleFrame.locator('.ag-root-wrapper')).toBeVisible({ timeout: 30_000 });

        expect(cspViolations, 'CSP violations').toEqual([]);
    });

    // --- Product switcher ---

    test('product switcher opens and shows AG products', async ({ page }) => {
        const cspViolations = await setupPage(page);

        await page.goto('/');
        // The Products button opens the dropdown on hover (onMouseEnter)
        await page.getByRole('button', { name: 'Products' }).hover();
        // AG Charts and AG Studio links should now be visible in the dropdown
        await expect(page.getByRole('link', { name: /AG Charts/ }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /AG Studio/ }).first()).toBeVisible();

        expect(cspViolations, 'CSP violations').toEqual([]);
    });
});
