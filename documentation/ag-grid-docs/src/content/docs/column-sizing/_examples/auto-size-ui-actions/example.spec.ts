import { expect, getWidth, test, waitForColumnWidthsToSettle, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

function centerHeaderSection(page: Page): Locator {
    return page.locator('.ag-header-row .ag-grid-scrolling-cells').first();
}

test.agExample(import.meta, () => {
    test.eachFramework('column menu autosize applies scaleUpToFitGridWidth', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForColumnWidthsToSettle(page);

        const gridWidth = await getWidth(page.locator('.ag-root').first());

        await page.locator('button.reset-button').click();
        await waitForColumnWidthsToSettle(page);
        expect(await getWidth(centerHeaderSection(page))).toBeLessThan(gridWidth);

        await agIdFor.headerCell('athlete').locator('.ag-header-cell-menu-button').click();
        await page.getByText('Autosize All Columns').click();
        await waitForColumnWidthsToSettle(page);

        // the strategy's scaleUpToFitGridWidth fills the grid, which a default autosize would not
        // (a pixel of slack for the rounding in the width distribution)
        expect(await getWidth(centerHeaderSection(page))).toBeGreaterThanOrEqual(gridWidth - 1);
    });

    test.eachFramework('context menu autosize applies scaleUpToFitGridWidth', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForColumnWidthsToSettle(page);

        const gridWidth = await getWidth(page.locator('.ag-root').first());

        await page.locator('button.reset-button').click();
        await waitForColumnWidthsToSettle(page);

        await agIdFor.cell({ colId: 'athlete', rowIndex: 0 }).click({ button: 'right' });
        await page.getByText('Autosize All Columns').click();
        await waitForColumnWidthsToSettle(page);

        expect(await getWidth(centerHeaderSection(page))).toBeGreaterThanOrEqual(gridWidth - 1);
    });

    test.eachFramework('double-clicking a header edge applies the strategy', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForColumnWidthsToSettle(page);

        await page.locator('button.reset-button').click();
        await waitForColumnWidthsToSettle(page);
        const shrunkWidth = await getWidth(agIdFor.headerCell('country'));

        await agIdFor.headerCell('country').locator('.ag-header-cell-resize').dblclick();
        await waitForColumnWidthsToSettle(page);

        expect(await getWidth(agIdFor.headerCell('country'))).toBeGreaterThan(shrunkWidth);
    });

    test.describe('without applyToUiActions', () => {
        test.eachFramework('menu autosize does not fill the grid width', async ({ page, remoteGrid, agIdFor }) => {
            await waitForGridContent(page);

            const remoteApi = remoteGrid(page, '1');
            await remoteApi.setGridOption('autoSizeStrategy', {
                type: 'fitCellContents',
                scaleUpToFitGridWidth: true,
            });
            await waitForColumnWidthsToSettle(page);

            const gridWidth = await getWidth(page.locator('.ag-root').first());

            await page.locator('button.reset-button').click();
            await waitForColumnWidthsToSettle(page);

            await agIdFor.headerCell('athlete').locator('.ag-header-cell-menu-button').click();
            await page.getByText('Autosize All Columns').click();
            await waitForColumnWidthsToSettle(page);

            // content fit only — the columns do not stretch to fill the grid
            expect(await getWidth(centerHeaderSection(page))).toBeLessThan(gridWidth);
        });
    });
});
