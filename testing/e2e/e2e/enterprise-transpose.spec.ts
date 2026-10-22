import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

const SCREENSHOTS = process.env.TRANSPOSE_SCREENSHOT_DIR;

/** 200 companies, transposed: one record column each, plus the field-name column and the totals column. */
const manyRecords = () => ({
    columnDefs: [
        { field: 'name', headerName: 'Company' },
        {
            headerName: 'Details',
            groupId: 'details',
            children: [{ field: 'region' }, { field: 'sector' }],
        },
        { field: 'revenue', aggFunc: 'sum' },
    ],
    rowData: Array.from({ length: 200 }, (_, i) => ({
        id: `r${i}`,
        name: `Company ${i}`,
        region: ['EMEA', 'APAC', 'AMER'][i % 3],
        sector: ['Retail', 'Tech'][i % 2],
        revenue: i + 1,
    })),
    getRowId: (params: { data: { id: string } }) => params.data.id,
    transpose: true,
    transposeHeaderColId: 'name',
    grandTotalRow: 'bottom' as const,
});

test.describe('transposed view in a real browser', () => {
    test('virtualises record columns, keeps the field names pinned, and renders far records and the totals', async ({
        page,
    }) => {
        const { grid, headerCell, withApi } = await mountGrid(page, { enterprise: true, options: manyRecords });
        const renderedRecordHeaders = () => grid.locator('.ag-header-cell[col-id^="ag-Grid-TransposeRecord-"]').count();
        const revenueRow = grid.locator('.ag-row[row-id="ag-Grid-TransposeField-revenue"]');

        await expect(headerCell('ag-Grid-TransposeRecord-r0')).toContainText('Company 0');
        const rendered = await renderedRecordHeaders();
        expect(rendered).toBeGreaterThan(0);
        expect(rendered).toBeLessThan(50);

        await withApi((api) => api.ensureColumnVisible('ag-Grid-TransposeRecord-r199'));
        await expect(headerCell('ag-Grid-TransposeRecord-r199')).toContainText('Company 199');
        await expect(revenueRow.locator('.ag-cell[col-id="ag-Grid-TransposeRecord-r199"]')).toHaveText('200');
        await expect(headerCell('ag-Grid-TransposeRecord-r0')).toHaveCount(0);

        await withApi((api) => api.ensureColumnVisible('ag-Grid-TransposeTotal'));
        await expect(revenueRow.locator('.ag-cell[col-id="ag-Grid-TransposeTotal"]')).toHaveText('20100');

        // The field names stay pinned and readable after scrolling sideways.
        const label = revenueRow.locator('.ag-cell[col-id="ag-Grid-TransposeField"]');
        await expect(label).toContainText('Revenue');
        await expect(label).toBeInViewport();

        // Every rendered record cell in the revenue row has a value: none render blank after scrolling.
        const blanks = await revenueRow
            .locator('.ag-cell[col-id^="ag-Grid-TransposeRecord-"]')
            .evaluateAll((cells) => cells.filter((cell) => cell.textContent === '').length);
        expect(blanks).toBe(0);
        if (SCREENSHOTS) {
            await page.screenshot({ path: `${SCREENSHOTS}/virtualised-far-end.png` });
        }
    });

    test('resizes a record column by dragging its header edge', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, { enterprise: true, options: manyRecords });
        const header = headerCell('ag-Grid-TransposeRecord-r1');
        const before = (await header.boundingBox())!.width;
        const handle = (await header.locator('.ag-header-cell-resize').boundingBox())!;
        await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
        await page.mouse.down();
        await page.mouse.move(handle.x + handle.width / 2 + 120, handle.y + handle.height / 2, { steps: 10 });
        await page.mouse.up();
        await expect(async () => {
            const width = await withApi((api) => api.getColumn('ag-Grid-TransposeRecord-r1')!.getActualWidth());
            expect(width).toBeGreaterThan(before + 100);
        }).toPass();
    });

    test('keyboard navigation crosses virtualised record columns and moves down the field rows', async ({ page }) => {
        const { grid, withApi } = await mountGrid(page, { enterprise: true, options: manyRecords });
        const revenueIndex = await withApi((api) => {
            for (let i = 0; i < api.getDisplayedRowCount(); i++) {
                if (api.getDisplayedRowAtIndex(i)!.id === 'ag-Grid-TransposeField-revenue') {
                    return i;
                }
            }
            return -1;
        });
        await withApi((api) => api.setFocusedCell(1, 'ag-Grid-TransposeRecord-r0'));
        await grid.locator('.ag-cell-focus').waitFor();
        for (let i = 0; i < 40; i++) {
            await page.keyboard.press('ArrowRight');
        }
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        const focused = await withApi((api) => {
            const cell = api.getFocusedCell();
            return { rowIndex: cell?.rowIndex, colId: cell?.column.getColId() };
        });
        expect(focused).toEqual({ rowIndex: 3, colId: 'ag-Grid-TransposeRecord-r40' });
        expect(revenueIndex).toBe(3);
        const focusedCell = grid.locator('.ag-cell-focus');
        await expect(focusedCell).toHaveText('41');
        await expect(focusedCell).toBeInViewport();
    });

    test('a record column dragged by its header keeps its place through a refresh and a toggle', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'name', headerName: 'Company' }, { field: 'revenue' }],
                rowData: [
                    { id: 'a', name: 'Northwind', revenue: 1 },
                    { id: 'b', name: 'Contoso', revenue: 2 },
                    { id: 'c', name: 'Fabrikam', revenue: 3 },
                ],
                getRowId: (params: { data: { id: string } }) => params.data.id,
                transpose: true,
                transposeHeaderColId: 'name',
                transposeRecordColumnDef: { width: 120 },
            }),
        });
        const records = () =>
            withApi((api) =>
                api
                    .getAllDisplayedColumns()
                    .map((col) => col.getColId())
                    .filter((colId) => colId.startsWith('ag-Grid-TransposeRecord-'))
                    .map((colId) => colId.slice('ag-Grid-TransposeRecord-'.length))
            );
        const from = (await headerCell('ag-Grid-TransposeRecord-a').boundingBox())!;
        const to = (await headerCell('ag-Grid-TransposeRecord-c').boundingBox())!;
        await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
        await page.mouse.down();
        await page.mouse.move(to.x + to.width - 5, to.y + to.height / 2, { steps: 20 });
        await page.mouse.up();
        await expect.poll(records).toEqual(['b', 'c', 'a']);

        await withApi((api) => api.refreshClientSideRowModel());
        expect(await records()).toEqual(['b', 'c', 'a']);
        await withApi((api) => {
            api.setGridOption('transpose', false);
            api.setGridOption('transpose', true);
        });
        expect(await records()).toEqual(['b', 'c', 'a']);
    });

    test('observe: wrapped field labels and values', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [
                    { field: 'name', headerName: 'Company' },
                    { field: 'notes', wrapText: true, autoHeight: true },
                    { field: 'revenue' },
                ],
                rowData: [
                    {
                        id: 'a',
                        name: 'Northwind',
                        notes: 'A long note that should wrap onto several lines',
                        revenue: 1,
                    },
                    { id: 'b', name: 'Contoso', notes: 'Short', revenue: 2 },
                ],
                getRowId: (params: { data: { id: string } }) => params.data.id,
                transpose: true,
                transposeHeaderColId: 'name',
                transposeRecordColumnDef: { width: 120 },
            }),
        });
        const notesRow = grid.locator('.ag-row[row-id="ag-Grid-TransposeField-notes"]');
        const revenueRow = grid.locator('.ag-row[row-id="ag-Grid-TransposeField-revenue"]');
        const heights = {
            notes: (await notesRow.boundingBox())?.height,
            revenue: (await revenueRow.boundingBox())?.height,
        };
        console.log(`OBSERVE ${JSON.stringify({ heights })}`);
        if (SCREENSHOTS) {
            await page.screenshot({ path: `${SCREENSHOTS}/wrap.png` });
        }
    });
});
