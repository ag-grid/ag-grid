import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function width(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

function headerWidth(page: Page, colId: string): Promise<number> {
    return width(page.locator(`.ag-header-cell[col-id="${colId}"]`).first());
}

/** The configured width of every column, so a content fit having run means a column is narrower. */
const CONFIGURED_WIDTH = 300;

async function waitForInitialFit(page: Page): Promise<void> {
    await waitForGridContent(page);
    await expect(async () => {
        expect(await headerWidth(page, 'athlete')).toBeLessThan(CONFIGURED_WIDTH);
    }).toPass();
}

test.agExample(import.meta, () => {
    test.eachFramework('a column made visible is auto-sized to its content', async ({ page }) => {
        await waitForInitialFit(page);
        await expect(page.locator('.ag-header-cell[col-id="country"]')).toHaveCount(0);

        await page.locator('button.show-country-button').click();

        // sized to content rather than left at its configured width
        await expect(async () => {
            const countryWidth = await headerWidth(page, 'country');
            expect(countryWidth).toBeGreaterThan(0);
            expect(countryWidth).toBeLessThan(CONFIGURED_WIDTH);
        }).toPass();
    });

    test.eachFramework('changing page re-runs the strategy', async ({ page }) => {
        await waitForInitialFit(page);

        await page.locator('button.widen-button').click();
        await expect(async () => {
            expect(await headerWidth(page, 'athlete')).toBe(400);
        }).toPass();

        await page.locator('.ag-paging-button[data-ref="btNext"]').click();

        await expect(async () => {
            expect(await headerWidth(page, 'athlete')).toBeLessThan(400);
        }).toPass();
    });

    test.eachFramework('a transaction adding a longer value widens the column', async ({ page }) => {
        await waitForInitialFit(page);
        const before = await headerWidth(page, 'athlete');

        await page.locator('button.add-row-button').click();

        // the added athlete name is far longer than any already in the grid
        await expect(async () => {
            expect(await headerWidth(page, 'athlete')).toBeGreaterThan(before);
        }).toPass();
    });
});
