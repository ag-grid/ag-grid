import { expect, test } from '@playwright/test';
import { blockConsentAndAnalytics } from '@utils/grid/test-utils';

// Example runners hydrate when they scroll into view (`client:visible`), so a page with many
// examples only mounts, and only fetches source for, the runners near the viewport. Off-screen
// runners keep their reserved height and mount when the reader reaches them.

// Fourteen runners, the most rendered on any docs page
const PAGE_PATH = 'react-data-grid/server-side-model-grouping/';

test.describe('Example runner lazy hydration', () => {
    test('mounts and fetches source only for runners the reader reaches', async ({ page }) => {
        await blockConsentAndAnalytics(page);
        await page.setViewportSize({ width: 1280, height: 800 });

        const contentsRequests = new Set<string>();
        page.on('request', (request) => {
            if (/\/examples\/.*\/contents\.json/.test(request.url())) {
                contentsRequests.add(request.url());
            }
        });

        await page.goto(PAGE_PATH);
        const runners = page.locator('.example-runner-outer');
        const codeButtons = page.getByRole('button', { name: 'Code', exact: true });
        await expect(runners.first()).toBeAttached();
        const runnerCount = await runners.count();
        expect(runnerCount).toBeGreaterThan(5);

        // Give any eager hydration time to happen before counting
        await page.waitForTimeout(2000);
        expect(await codeButtons.count(), 'runners mounted on load').toBeLessThan(runnerCount);
        expect(contentsRequests.size, 'contents.json requests on load').toBeLessThan(runnerCount);

        // Reaching a runner mounts it and loads its source
        const firstRunner = runners.first();
        await firstRunner.scrollIntoViewIfNeeded();
        await expect(firstRunner.getByRole('button', { name: 'Code', exact: true })).toBeVisible();
        await expect.poll(() => contentsRequests.size).toBeGreaterThan(0);
        const mountedAtFirst = await codeButtons.count();
        expect(mountedAtFirst, 'runners mounted with the first in view').toBeLessThan(runnerCount);

        const lastRunner = runners.last();
        await lastRunner.scrollIntoViewIfNeeded();
        await expect(lastRunner.getByRole('button', { name: 'Code', exact: true })).toBeVisible();
        expect(await codeButtons.count()).toBeGreaterThan(mountedAtFirst);

        // The reserved height keeps the layout stable while runners hydrate and switch views.
        // Document-relative, since the click may scroll the page.
        const documentTop = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;
        const topBefore = await lastRunner.evaluate(documentTop);
        await lastRunner.getByRole('button', { name: 'Code', exact: true }).click();
        await expect(lastRunner.getByRole('button', { name: 'Preview', exact: true })).toBeVisible();
        expect(await lastRunner.evaluate(documentTop)).toBe(topBefore);
    });
});
