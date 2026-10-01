import type { Locator, Page } from '@playwright/test';
import { type AgGridFixtures, ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

type AgIdFor = AgGridFixtures['agIdFor'];

const ROW_COUNT = 200;
// 70 (pinned ID) + 5 x 150 (defaultColDef width)
const COLUMNS_WIDTH = 820;
const NORMAL_GRID_WIDTH = 400;

const rootWrapper = (page: Page) => page.locator('.ag-root-wrapper');
const bodyRows = (page: Page) => page.locator('.ag-grid-scrolling-container > .ag-row');
const bodyPinnedLeftLanes = (page: Page) =>
    page.locator('.ag-grid-scrolling-container > .ag-row > .ag-grid-pinned-left-cells');
const headerLastLeftPinnedCell = (page: Page) => page.locator('.ag-header-row-column .ag-header-cell-last-left-pinned');
const firstRowScrollingLane = (page: Page) => page.locator('.ag-row[row-id="0"] > .ag-grid-scrolling-cells');
const firstRowLastLeftPinnedCell = (page: Page) => firstRowScrollingLane(page).locator('> .ag-cell-last-left-pinned');

async function expectApproxWidth(locator: Locator, expected: number): Promise<void> {
    await expect(async () => {
        const box = await locator.boundingBox();
        expect(box).not.toBeNull();
        expect(Math.abs(box!.width - expected)).toBeLessThanOrEqual(5);
    }).toPass();
}

async function expectRowCountBetween(page: Page, min: number, max: number): Promise<void> {
    await expect(async () => {
        const count = await bodyRows(page).count();
        expect(count).toBeGreaterThanOrEqual(min);
        expect(count).toBeLessThanOrEqual(max);
    }).toPass();
}

async function expectNormalLayout(page: Page, agIdFor: AgIdFor): Promise<void> {
    await expectApproxWidth(rootWrapper(page), NORMAL_GRID_WIDTH);

    // row and column virtualisation: 200px of rows and 400px of columns cannot show everything
    // (the last column starts beyond the grid's fixed 200px column render buffer)
    await expectRowCountBetween(page, 1, ROW_COUNT - 1);
    await expect(agIdFor.headerCell('model')).toBeVisible();
    await expect(agIdFor.headerCell('country')).toHaveCount(0);
    await expect(agIdFor.cell('0', 'country')).toHaveCount(0);

    // the pinned column renders in its own lane
    await expect(bodyPinnedLeftLanes(page).first()).toBeVisible();
    await expect(bodyPinnedLeftLanes(page).first().locator('.ag-cell-last-left-pinned')).toBeVisible();
}

async function expectPrintLayout(page: Page, agIdFor: AgIdFor): Promise<void> {
    // no virtualisation: every row and every column is in the DOM
    await expect(bodyRows(page)).toHaveCount(ROW_COUNT);
    await expect(agIdFor.headerCell('country')).toBeVisible();
    await expect(agIdFor.cell('0', 'country')).toBeVisible();
    await expect(agIdFor.cell(`${ROW_COUNT - 1}`, 'country')).toBeVisible();

    // the grid is sized by its columns, not by its container
    await expectApproxWidth(rootWrapper(page), COLUMNS_WIDTH);
    await expectApproxWidth(firstRowScrollingLane(page), COLUMNS_WIDTH);

    // pinned columns join the single scrolling lane, at the left edge of the row
    await expect(bodyPinnedLeftLanes(page)).toHaveCount(0);
    await expect(firstRowLastLeftPinnedCell(page)).toBeVisible();
    await expect(async () => {
        const [cell, lane] = await Promise.all([
            firstRowLastLeftPinnedCell(page).boundingBox(),
            firstRowScrollingLane(page).boundingBox(),
        ]);
        expect(Math.abs(cell!.x - lane!.x)).toBeLessThanOrEqual(1);
    }).toPass();

    // the pinned header cell lines up with the pinned body cell
    await expect(async () => {
        const [header, cell] = await Promise.all([
            headerLastLeftPinnedCell(page).boundingBox(),
            firstRowLastLeftPinnedCell(page).boundingBox(),
        ]);
        expect(Math.abs(header!.x + header!.width - (cell!.x + cell!.width))).toBeLessThanOrEqual(1);
    }).toPass();
}

test.agExample(import.meta, () => {
    test.eachFramework('Print layout renders every row and column at column width', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expectNormalLayout(page, agIdFor);

        await page.getByRole('button', { name: 'Printer Friendly Layout' }).click();
        await expectPrintLayout(page, agIdFor);

        // the grid's @media print rules change container display types, which changes what `width: auto` means
        await page.emulateMedia({ media: 'print' });
        await expectPrintLayout(page, agIdFor);
        await page.emulateMedia({ media: null });

        await page.getByRole('button', { name: 'Normal Layout' }).click();
        await expectNormalLayout(page, agIdFor);
    });
});
