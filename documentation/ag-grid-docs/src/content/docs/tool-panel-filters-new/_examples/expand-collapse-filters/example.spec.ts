import { ensureGridReady, expect, test } from '@utils/grid/test-utils';
import type { Page } from 'playwright/test';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        await ensureGridReady(page);

        const cardExpand = namedCardExpand(page);
        const expectExpanded = async (expected: Record<string, boolean>) => {
            for (const [name, expanded] of Object.entries(expected)) {
                await expect(cardExpand(name)).toHaveAttribute('aria-expanded', String(expanded));
            }
        };

        // All filter cards are collapsed by default.
        await expectExpanded({ Athlete: false, Age: false, Country: false });

        // Expand Age & Country -> only those two cards expand.
        await page.getByRole('button', { name: 'Expand Age & Country' }).click();
        await expectExpanded({ Athlete: false, Age: true, Country: true });

        // Collapse Age -> Country remains expanded.
        await page.getByRole('button', { name: 'Collapse Age' }).click();
        await expectExpanded({ Athlete: false, Age: false, Country: true });

        // Expand All -> every card expanded.
        await page.getByRole('button', { name: 'Expand All' }).click();
        await expectExpanded({ Athlete: true, Age: true, Country: true });

        // Collapse All -> no cards expanded.
        await page.getByRole('button', { name: 'Collapse All' }).click();
        await expectExpanded({ Athlete: false, Age: false, Country: false });
    });
});

/** Locates a filter card's expand button in the tool panel by its displayed filter name. */
function namedCardExpand(page: Page) {
    const panel = page.locator('.ag-filter-panel');
    return (name: string) =>
        panel.locator('.ag-filter-card-expand').filter({
            has: page.locator('.ag-filter-card-title', { hasText: new RegExp(`^${name}$`) }),
        });
}
