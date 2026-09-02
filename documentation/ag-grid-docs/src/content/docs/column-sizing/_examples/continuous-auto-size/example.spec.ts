import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function width(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

function columnWidth(page: Page, colId: string): Promise<number> {
    return width(page.locator(`.ag-header-cell[col-id="${colId}"]`).first());
}

/** Settle the width animation so measurements are stable. */
async function waitForWidths(page: Page): Promise<void> {
    await expect(page.locator('.ag-animate-autosize')).toHaveCount(0);
}

test.agExample(import.meta, () => {
    test.eachFramework('longer data re-sizes the eligible columns but not the fixed one', async ({ page }) => {
        await waitForGridContent(page);
        await waitForWidths(page);

        const athleteWidth = await columnWidth(page, 'athlete');
        const sportWidth = await columnWidth(page, 'sport');

        await page.locator('button.longer-values-button').click();
        await waitForGridContent(page);
        await waitForWidths(page);

        await expect(async () => {
            expect(await columnWidth(page, 'sport')).toBeGreaterThan(sportWidth);
        }).toPass();
        expect(await columnWidth(page, 'athlete')).toBe(athleteWidth);
    });

    test.eachFramework('the `suppressAutoSize` column keeps its starting width', async ({ page }) => {
        await waitForGridContent(page);
        await waitForWidths(page);

        expect(await columnWidth(page, 'athlete')).toBe(150);
    });
});
