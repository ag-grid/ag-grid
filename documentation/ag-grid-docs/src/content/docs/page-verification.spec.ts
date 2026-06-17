import { expect, test } from '@playwright/test';
import { setupConsoleExpectations } from '@utils/grid/test-utils';

type PlaywrightPage = Parameters<typeof setupConsoleExpectations>[0];

const isCspIssue = (msg: string) => /Content-Security-Policy|Refused to (load|execute|connect)/i.test(msg);

// Sets up console error/warning collection, uncaught exception capture,
// and blocks the cookie-consent banner. Returns the hard-error array.
// CSP violations are silently routed to test.info() annotations so they show
// up as warnings in the report without failing the test.
async function setupPage(page: PlaywrightPage): Promise<string[]> {
    const errors = setupConsoleExpectations(page);

    // Override push on the array returned by setupConsoleExpectations so that
    // any future push() call (from the already-registered console listener, or
    // our pageerror listener below) routes CSP messages to annotations instead.
    const originalPush = errors.push.bind(errors);
    errors.push = (...items: string[]) => {
        for (const item of items) {
            if (isCspIssue(item)) {
                test.info().annotations.push({ type: 'warning', description: `[CSP] ${item}` });
            } else {
                originalPush(item);
            }
        }
        return errors.length;
    };

    await page.route('**://cdn.cookielaw.org/**', (route) => route.abort());
    page.on('pageerror', (error) => {
        errors.push(`Uncaught exception: ${error.message}`);
    });

    return errors;
}

test.describe('Page Verification', () => {
    // --- Homepage ---

    test('homepage loads with title and header visible', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/');
        await expect(page).toHaveTitle(/AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('homepage shows Docs and Demos navigation links', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/');
        // Both links appear in the large and small nav – use first() to target the large (desktop) nav
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Docs' }).first()).toBeVisible();
        await expect(page.locator('.site-header').getByRole('link', { name: 'AG Grid Demos' }).first()).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    // --- Core pages ---

    test('demos page loads with an example grid', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/example');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await expect(page.locator('.ag-root-wrapper')).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('theme builder page loads', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/theme-builder/');
        await expect(page).toHaveTitle(/Theme Builder/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('API reference page loads', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/react-data-grid/reference/');
        await expect(page).toHaveTitle(/Reference/);
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('community page loads', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/community/');
        await expect(page).toHaveTitle(/Community/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('about page loads', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/about/');
        await expect(page).toHaveTitle(/About AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('contact page loads', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/contact/');
        await expect(page).toHaveTitle(/Contact AG Grid/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('pricing page loads', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/license-pricing/');
        await expect(page).toHaveTitle(/Licence and Pricing/);
        await expect(page.locator('.site-header')).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    // --- Docs pages ---

    test('docs getting-started page loads', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/react-data-grid/getting-started/');
        await expect(page).toHaveTitle(/Quick Start/);
        // Left docs nav is always visible at desktop widths (CSS overrides mobile collapse)
        await expect(page.locator('#docs-mobile-nav-collapser')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('clicking a left-nav link navigates to the correct doc page', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/react-data-grid/getting-started/');
        // 'Key Features' is a flat (non-grouped) item in the Getting Started section
        await page.locator('#docs-mobile-nav-collapser').getByRole('link', { name: 'Key Features' }).click();
        await expect(page).toHaveURL(/key-features/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    test('docs page with an inline example renders a grid', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/react-data-grid/row-sorting/');
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        // Docs examples load inside an iframe — use contentFrame() to reach inside it
        const exampleFrame = page.locator('.example-runner-outer iframe').first().contentFrame();
        await expect(exampleFrame.locator('.ag-root-wrapper')).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });

    // --- Product switcher ---

    test('product switcher opens and shows AG products', async ({ page }) => {
        const errors = await setupPage(page);

        await page.goto('/');
        // The Products button opens the dropdown on hover (onMouseEnter)
        await page.getByRole('button', { name: 'Products' }).hover();
        // AG Charts and AG Studio links should now be visible in the dropdown
        await expect(page.getByRole('link', { name: /AG Charts/ }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /AG Studio/ }).first()).toBeVisible();

        expect(errors, 'Console Errors').toEqual([]);
    });
});
