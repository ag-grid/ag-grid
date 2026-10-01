import { ensureGridReady, expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const panel = page.locator('.ag-filter-toolpanel');
        const expandedFilters = panel.locator('.ag-filter-toolpanel-instance-header[aria-expanded="true"]');
        const allFilters = panel.locator('.ag-filter-toolpanel-instance-header');
        const totalFilters = await allFilters.count();
        expect(totalFilters).toBeGreaterThan(2);

        // All filters are collapsed by default.
        await expect(expandedFilters).toHaveCount(0);

        // Expand Year & Sport -> exactly two filters expanded.
        await page.getByRole('button', { name: 'Expand Year & Sport' }).click();
        await expect(expandedFilters).toHaveCount(2);

        // Collapse Year -> one filter (Sport) remains expanded.
        await page.getByRole('button', { name: 'Collapse Year' }).click();
        await expect(expandedFilters).toHaveCount(1);

        // Collapse All -> no filters expanded.
        await page.getByRole('button', { name: 'Collapse All' }).click();
        await expect(expandedFilters).toHaveCount(0);

        // Expand All -> every filter expanded.
        await page.getByRole('button', { name: 'Expand All' }).click();
        await expect(expandedFilters).toHaveCount(totalFilters);
    });

    test.eachFramework('Expand Year & Sport expands exactly the Year and Sport filters', async ({ page }) => {
        await ensureGridReady(page);

        const filterHeader = namedFilterHeader(page);

        await expect(filterHeader('Year')).toHaveAttribute('aria-expanded', 'false');
        await expect(filterHeader('Sport')).toHaveAttribute('aria-expanded', 'false');

        await page.getByRole('button', { name: 'Expand Year & Sport' }).click();

        // Only the two named filters expand.
        await expect(filterHeader('Year')).toHaveAttribute('aria-expanded', 'true');
        await expect(filterHeader('Sport')).toHaveAttribute('aria-expanded', 'true');
        await expect(filterHeader('Name')).toHaveAttribute('aria-expanded', 'false');
        await expect(filterHeader('Age')).toHaveAttribute('aria-expanded', 'false');
        await expect(filterHeader('Date')).toHaveAttribute('aria-expanded', 'false');
        await expect(filterHeader('Country')).toHaveAttribute('aria-expanded', 'false');
    });

    test.eachFramework('Collapse Year collapses Year and leaves Sport expanded', async ({ page }) => {
        await ensureGridReady(page);

        const filterHeader = namedFilterHeader(page);

        await page.getByRole('button', { name: 'Expand Year & Sport' }).click();
        await expect(filterHeader('Year')).toHaveAttribute('aria-expanded', 'true');

        await page.getByRole('button', { name: 'Collapse Year' }).click();

        // Year collapses, Sport is untouched.
        await expect(filterHeader('Year')).toHaveAttribute('aria-expanded', 'false');
        await expect(filterHeader('Sport')).toHaveAttribute('aria-expanded', 'true');
    });
});

/** Locates a filter's header in the tool panel by its displayed filter name. */
function namedFilterHeader(page: Page) {
    const panel = page.locator('.ag-filter-toolpanel');
    return (name: string) =>
        panel.locator('.ag-filter-toolpanel-instance-header').filter({
            has: page.locator('.ag-header-cell-text', { hasText: new RegExp(`^${name}$`) }),
        });
}
