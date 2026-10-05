import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

/**
 * Eviction needs real layout: the viewport has to cover only part of the level so `maxBlocksInCache` evicts blocks
 * outside it, which happy-dom cannot do as it renders every row.
 */
test.describe('SSRM level consistency check with evicted blocks', () => {
    async function mountLevel(page: Page) {
        return mountGrid(page, {
            enterprise: true,
            options: () => {
                const win = window as any;
                win.serverRows = Array.from({ length: 200 }, (_, i) => ({ id: String(i) }));
                win.requestedStartRows = [];
                win.inconsistencies = [];
                return {
                    columnDefs: [{ field: 'id' }],
                    rowModelType: 'serverSide',
                    cacheBlockSize: 10,
                    maxBlocksInCache: 2,
                    maxConcurrentDatasourceRequests: 1,
                    getRowId: ({ data }: any) => data.id,
                    serverSideCheckLevelConsistency: true,
                    serverSideDatasource: {
                        getRows: (params: any) => {
                            const { startRow, endRow } = params.request;
                            win.requestedStartRows.push(startRow);
                            const rowData = win.serverRows.slice(startRow, endRow);
                            const rowCount = win.serverRows.length;
                            setTimeout(() => params.success({ rowData, rowCount }));
                        },
                    },
                    onServerSideLevelInconsistent: (event: any) => win.inconsistencies.push(...event.inconsistencies),
                };
            },
        });
    }

    /** Shows `rowIndex` at the top of the viewport and waits until every displayed row has loaded. */
    async function scrollTo(page: Page, rowIndex: number) {
        await page.evaluate((index) => (window as any).gridApi.ensureIndexVisible(index, 'top'), rowIndex);
        const grid = page.locator('#myGrid');
        await expect(grid.locator(`.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="id"]`)).not.toBeEmpty();
        await expect(grid.locator('.ag-row-loading')).toHaveCount(0);
    }

    /** The event is dispatched by a load check queued after the last response, so let one more task run. */
    async function getInconsistencies(page: Page) {
        await page.evaluate(() => new Promise((resolve) => setTimeout(resolve)));
        return page.evaluate(() => (window as any).inconsistencies);
    }

    function deleteServerRow(page: Page, index: number) {
        return page.evaluate((i) => (window as any).serverRows.splice(i, 1), index);
    }

    test('does not compare reloaded blocks with blocks evicted before the data changed', async ({ page }) => {
        const { cell, withApi } = await mountLevel(page);
        await scrollTo(page, 0);

        await scrollTo(page, 190);
        // the top blocks were evicted to make room for the bottom ones
        expect(await withApi((api) => api.getRowNode('0') != null)).toBe(false);

        // the evicted blocks' rows move up by one, but no loaded block sits next to them any more
        await deleteServerRow(page, 3);
        await scrollTo(page, 0);

        const startRows: number[] = await page.evaluate(() => (window as any).requestedStartRows);
        expect(startRows.filter((startRow) => startRow === 0)).toHaveLength(2);
        await expect(cell(3, 'id')).toHaveText('4');
        expect(await getInconsistencies(page)).toEqual([]);
    });

    test('compares a block reloaded next to a block still in the cache', async ({ page }) => {
        await mountLevel(page);
        await scrollTo(page, 0);
        await scrollTo(page, 190);

        // block 170 is read after rows shift up by one, so it returns row 180, which the cached block 180 also holds
        await deleteServerRow(page, 3);
        await scrollTo(page, 172);

        await expect
            .poll(() => getInconsistencies(page))
            .toContainEqual({ type: 'duplicated', boundaryIndex: 180, rowIds: ['180'] });
    });
});
