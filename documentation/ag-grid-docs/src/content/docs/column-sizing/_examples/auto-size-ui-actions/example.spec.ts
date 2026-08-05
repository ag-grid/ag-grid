import { expect, test, waitForGridContent } from '@utils/grid/test-utils';
import type { Locator, Page } from 'playwright/test';

async function getWidth(locator: Locator): Promise<number> {
    return (await locator.boundingBox())?.width ?? 0;
}

// wait twice as long as the animation so we know widths have settled
async function waitForAnimation(page: Page): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(page.locator('.ag-animate-autosize')).not.toBeVisible();
}

function centerHeaderSection(page: Page): Locator {
    return page.locator('.ag-header-row .ag-grid-scrolling-cells').first();
}

test.agExample(import.meta, () => {
    test.eachFramework('column menu autosize applies scaleUpToFitGridWidth', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        const gridWidth = await getWidth(page.locator('.ag-root').first());

        await page.locator('button.reset-button').click();
        await waitForAnimation(page);
        expect(await getWidth(centerHeaderSection(page))).toBeLessThan(gridWidth);

        await agIdFor.headerCell('athlete').locator('.ag-header-cell-menu-button').click();
        await page.getByText('Autosize All Columns').click();
        await waitForAnimation(page);

        // the strategy's scaleUpToFitGridWidth fills the grid, which a default autosize would not
        expect(await getWidth(centerHeaderSection(page))).toBeGreaterThanOrEqual(gridWidth - 1);
    });

    test.eachFramework('context menu autosize applies scaleUpToFitGridWidth', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        const gridWidth = await getWidth(page.locator('.ag-root').first());

        await page.locator('button.reset-button').click();
        await waitForAnimation(page);

        await agIdFor.cell({ colId: 'athlete', rowIndex: 0 }).click({ button: 'right' });
        await page.getByText('Autosize All Columns').click();
        await waitForAnimation(page);

        expect(await getWidth(centerHeaderSection(page))).toBeGreaterThanOrEqual(gridWidth - 1);
    });

    test.eachFramework('double-clicking a header edge applies the strategy', async ({ page, agIdFor }) => {
        await waitForGridContent(page);
        await waitForAnimation(page);

        await page.locator('button.reset-button').click();
        await waitForAnimation(page);
        const shrunkWidth = await getWidth(agIdFor.headerCell('country'));

        await agIdFor.headerCell('country').locator('.ag-header-cell-resize').dblclick();
        await waitForAnimation(page);

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
            await waitForAnimation(page);

            const gridWidth = await getWidth(page.locator('.ag-root').first());

            await page.locator('button.reset-button').click();
            await waitForAnimation(page);

            await agIdFor.headerCell('athlete').locator('.ag-header-cell-menu-button').click();
            await page.getByText('Autosize All Columns').click();
            await waitForAnimation(page);

            // content fit only — the columns do not stretch to fill the grid
            expect(await getWidth(centerHeaderSection(page))).toBeLessThan(gridWidth);
        });
    });
});
