import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.describe('enterprise grid in a real browser', () => {
    test('SSRM group and total rows fit wrapped content after expanding and dragging the column width', async ({
        page,
    }) => {
        const { cell, grid, headerCell, withApi } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'athlete', rowGroup: true }, { field: 'gold' }],
                defaultColDef: { flex: 1, minWidth: 100 },
                autoGroupColumnDef: { width: 140, flex: 0, wrapText: true, autoHeight: true, wrapHeaderText: true },
                rowModelType: 'serverSide',
                groupTotalRow: 'bottom',
                serverSideDatasource: {
                    getRows: (params) => {
                        const rowCount = params.request.groupKeys.length ? 8 : 1;
                        params.success({
                            rowData: Array.from({ length: rowCount }, () => ({ athlete: 'Michael Phelps', gold: 8 })),
                            rowCount,
                        });
                    },
                },
            }),
        });

        await grid.locator('.ag-group-contracted').first().click();
        await expect(
            grid.locator('.ag-grid-sticky-bottom-rows-container .ag-cell[col-id="ag-Grid-AutoColumn"]')
        ).toContainText('Total Michael Phelps');

        const expectContentToFit = async () => {
            for (const rowIndex of [0, 9]) {
                await expect(async () => {
                    const fits = await cell(rowIndex, 'ag-Grid-AutoColumn').evaluateAll(
                        (elements) =>
                            elements.length > 0 &&
                            elements.every((element) => {
                                const content = element.querySelector('.ag-group-value')!.getBoundingClientRect();
                                const row = element.closest('.ag-row')!.getBoundingClientRect();
                                const bounds = element.getBoundingClientRect();
                                return content.bottom <= row.bottom && content.right <= bounds.right;
                            })
                    );
                    expect(fits).toBe(true);
                }).toPass();
            }
        };
        await expectContentToFit();

        const narrowHeights = await withApi((api) =>
            [0, 9].map((index) => api.getDisplayedRowAtIndex(index)!.rowHeight!)
        );
        for (const width of [300, 140, 250, 140]) {
            const header = headerCell('ag-Grid-AutoColumn');
            const bounds = (await header.boundingBox())!;
            const handle = (await header.locator('.ag-header-cell-resize').boundingBox())!;
            await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
            await page.mouse.down();
            await page.mouse.move(handle.x + handle.width / 2 + width - bounds.width, handle.y + handle.height / 2, {
                steps: 10,
            });
            await page.mouse.up();
            await expectContentToFit();
            await expect(async () => {
                const heights = await withApi((api) =>
                    [0, 9].map((index) => api.getDisplayedRowAtIndex(index)!.rowHeight!)
                );
                for (let i = 0; i < heights.length; i++) {
                    if (width > 140) {
                        expect(heights[i]).toBeLessThan(narrowHeights[i]);
                    } else {
                        expect(heights[i]).toBe(narrowHeights[i]);
                    }
                }
            }).toPass();
        }
    });

    test('clicking a row group expands it and the arrow keys then move through its children', async ({ page }) => {
        const { cell, grid } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'athlete' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Country' },
                rowData: [
                    { country: 'Ireland', athlete: 'Katie Taylor', gold: 1 },
                    { country: 'Ireland', athlete: 'Kellie Harrington', gold: 1 },
                    { country: 'Norway', athlete: 'Karsten Warholm', gold: 1 },
                ],
            }),
        });

        const contractedGroups = grid.locator('.ag-group-contracted');
        await expect(contractedGroups).toHaveCount(2);
        await expect(grid.getByText('Katie Taylor')).toHaveCount(0);

        await contractedGroups.first().click();
        await expect(grid.getByText('Katie Taylor')).toBeVisible();
        await expect(grid.getByText('Kellie Harrington')).toBeVisible();

        await cell(1, 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await expect(cell(2, 'athlete')).toHaveClass(/ag-cell-focus/);
        await expect(cell(2, 'athlete')).toHaveText('Kellie Harrington');
    });
});
