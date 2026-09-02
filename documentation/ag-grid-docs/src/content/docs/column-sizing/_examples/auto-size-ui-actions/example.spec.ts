import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function width(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

/** The centre header section hugs its cells, so this is the space the columns occupy. */
function columnsWidth(page: Page): Promise<number> {
    return width(page.locator('.ag-header-row .ag-grid-scrolling-cells').first());
}

function gridWidth(page: Page): Promise<number> {
    return width(page.locator('.ag-header').first());
}

/** Settle the width animation so measurements are stable. */
async function waitForWidths(page: Page): Promise<void> {
    await expect(page.locator('.ag-animate-autosize')).toHaveCount(0);
}

/** The strategy sets `scaleUpToFitGridWidth`, so a run honouring it leaves no empty space. */
async function expectColumnsFillGrid(page: Page): Promise<void> {
    await expect(async () => {
        expect(await columnsWidth(page)).toBeGreaterThan((await gridWidth(page)) * 0.95);
    }).toPass();
}

async function narrowColumns(page: Page): Promise<void> {
    await page.locator('button.narrow-button').click();
    await expect(async () => {
        expect(await columnsWidth(page)).toBeLessThan((await gridWidth(page)) * 0.9);
    }).toPass();
}

test.agExample(import.meta, () => {
    test.eachFramework('the initial strategy scales columns up to fill the grid', async ({ page }) => {
        await waitForGridContent(page);
        await waitForWidths(page);

        await expectColumnsFillGrid(page);
    });

    test.eachFramework('column menu Autosize All Columns reuses the strategy', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForWidths(page);
        await narrowColumns(page);

        await agIdFor.headerCell('athlete').hover();
        await page.locator('.ag-header-cell[col-id="athlete"] .ag-header-cell-menu-button').first().click();
        await page.locator('.ag-menu-option-text', { hasText: 'Autosize All Columns' }).first().click();
        await waitForWidths(page);

        await expectColumnsFillGrid(page);
    });
});
