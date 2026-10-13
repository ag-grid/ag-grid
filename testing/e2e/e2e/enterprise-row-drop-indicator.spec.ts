import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { GetDetailRowDataParams, GridOptions } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

const treeOptions = (): GridOptions => ({
    treeData: true,
    getDataPath: (data) => data.path,
    groupDefaultExpanded: -1,
    autoGroupColumnDef: { rowDrag: true, width: 320 },
    columnDefs: [{ field: 'assignee' }, { field: 'status' }],
    rowData: [
        { path: ['Marketing'] },
        { path: ['Marketing', 'Design'] },
        { path: ['Marketing', 'Design', 'Logo'] },
        { path: ['Marketing', 'Design', 'Logo', 'Draft'] },
        { path: ['Sales'] },
    ],
});

const setIndicator = (page: Page, rowIndex: number, position: 'above' | 'below') =>
    page.evaluate(
        ([index, dropIndicatorPosition]) => {
            const api = window.gridApi;
            api.setRowDropPositionIndicator({ row: api.getDisplayedRowAtIndex(index), dropIndicatorPosition });
        },
        [rowIndex, position] as const
    );

/**
 * For each part of the row the drop line is drawn in, where the line starts, and where the row's own group label
 * starts in the part holding it, both measured in pixels from the part's inline-start edge.
 */
const measureDropLine = (page: Page, rowIndex: number) =>
    page.evaluate((index) => {
        const root = document.querySelector('.ag-root-wrapper');
        const row = Array.from(document.querySelectorAll<HTMLElement>(`.ag-row[row-index="${index}"]`)).find(
            (element) => element.closest('.ag-root-wrapper') === root
        )!;
        const parts = row.matches('.ag-full-width-row:not(.ag-embedded-full-width-row)')
            ? [row]
            : Array.from(row.querySelectorAll<HTMLElement>(':scope > [class*="-cells"]'));
        const lines: Record<string, number> = {};
        let label: { part: string; offset: number } | null = null;
        for (const part of parts) {
            const after = getComputedStyle(part, '::after');
            if (after.content === 'none') {
                continue;
            }
            const rtl = getComputedStyle(part).direction === 'rtl';
            const left = part.getBoundingClientRect().left + part.clientLeft;
            const offsetOf = (rect: DOMRect) => (rtl ? left + part.clientWidth - rect.right : rect.left - left);
            const name = part === row ? 'row' : part.classList[0];
            // Firefox misreports a pseudo-element's resolved `right` in RTL, so the end is derived from `left`
            const lineLeft = parseFloat(after.left) + parseFloat(after.marginLeft);
            lines[name] = Math.round(rtl ? part.clientWidth - lineLeft - parseFloat(after.width) : lineLeft);
            const ownLabel = Array.from(part.querySelectorAll('.ag-group-value')).find(
                (element) =>
                    element.closest('.ag-row') === row &&
                    element.textContent !== '' &&
                    !element.closest('.ag-cell:not([col-id="ag-Grid-AutoColumn"])')
            );
            if (ownLabel) {
                label = { part: name, offset: Math.round(offsetOf(ownLabel.getBoundingClientRect())) };
            }
        }
        return { lines, label };
    }, rowIndex);

/** The line starts at the row's group label in the part showing it, and at the inline-start edge of every other part. */
const expectLineFromLabel = async (page: Page, rowIndex: number, labelPart: string) => {
    let offset = 0;
    await expect(async () => {
        const { lines, label } = await measureDropLine(page, rowIndex);
        expect(label?.part).toBe(labelPart);
        offset = label!.offset;
        expect(lines).toEqual(
            Object.fromEntries(Object.keys(lines).map((part) => [part, part === labelPart ? offset : 0]))
        );
    }).toPass({ timeout: 5000 });
    return offset;
};

const expectFlushLine = async (page: Page, rowIndex: number) => {
    await expect(async () => {
        const { lines } = await measureDropLine(page, rowIndex);
        expect(Object.keys(lines).length).toBeGreaterThan(0);
        expect(Object.values(lines).every((offset) => offset === 0)).toBe(true);
    }).toPass({ timeout: 5000 });
};

/** Drops at levels 1 to 3, alternating above and below, each further in by one group indent. */
const expectIndentPerLevel = async (page: Page, labelPart: string) => {
    const offsets: number[] = [];
    for (const [rowIndex, position] of [
        [1, 'above'],
        [2, 'below'],
        [3, 'above'],
    ] as const) {
        await setIndicator(page, rowIndex, position);
        offsets.push(await expectLineFromLabel(page, rowIndex, labelPart));
    }
    expect(offsets[0]).toBeGreaterThan(0);
    expect(offsets[1] - offsets[0]).toBeGreaterThan(0);
    expect(offsets[2] - offsets[1]).toBe(offsets[1] - offsets[0]);
};

/** Drops on a detail row whose nested grid shows indented group labels: no part of its line is indented. */
const expectDetailRowFlush = async (page: Page) => {
    await page.evaluate(() => {
        const api = window.gridApi;
        api.updateGridOptions({
            masterDetail: true,
            isRowMaster: (data) => data.path.length === 2,
            detailCellRendererParams: {
                detailGridOptions: {
                    groupDisplayType: 'groupRows',
                    groupDefaultExpanded: -1,
                    columnDefs: [
                        { field: 'team', rowGroup: true, hide: true },
                        { field: 'unit', rowGroup: true, hide: true },
                        { field: 'name' },
                    ],
                },
                getDetailRowData: (params: GetDetailRowDataParams) =>
                    params.successCallback([{ team: 'Brand', unit: 'Web', name: 'Ann' }]),
            },
        });
        api.getDisplayedRowAtIndex(1)!.setExpanded(true);
    });
    await expect(page.locator('.ag-details-row .ag-row-group-indent-1 > .ag-group-value')).toBeVisible();

    const detailIndex = await page.evaluate(() =>
        Number(document.querySelector('.ag-details-row')!.closest('.ag-row')!.getAttribute('row-index'))
    );
    await setIndicator(page, detailIndex, 'above');
    await expectFlushLine(page, detailIndex);

    // the nested grid's own indicator, on a level 0 row, is not indented by the row hosting the grid
    await page.evaluate(() =>
        window.gridApi.forEachDetailGridInfo(({ api }) =>
            api!.setRowDropPositionIndicator({ row: api!.getDisplayedRowAtIndex(0)!, dropIndicatorPosition: 'above' })
        )
    );
    await expect
        .poll(() =>
            page.evaluate(() => {
                const nestedRow = document.querySelector<HTMLElement>('.ag-details-row .ag-row[row-index="0"]')!;
                const after = getComputedStyle(nestedRow, '::after');
                return [after.content, parseFloat(after.left) + parseFloat(after.marginLeft)];
            })
        )
        .toEqual(['""', 0]);

    // the nested grid's indented label stays its own: the hosting row's line still starts at its edge
    await page.evaluate(() =>
        window.gridApi.forEachDetailGridInfo(({ api }) =>
            api!.setRowDropPositionIndicator({ row: api!.getDisplayedRowAtIndex(1)!, dropIndicatorPosition: 'above' })
        )
    );
    await expect(page.locator('.ag-details-row .ag-row-highlight-indent')).toHaveCount(1);
    await expectFlushLine(page, detailIndex);
};

test.describe('row drop indicator in a real browser', () => {
    test('with the group column pinned, only its part is indented, up to its label', async ({ page }) => {
        await mountGrid(page, { enterprise: true, options: treeOptions });
        await page.evaluate(() =>
            window.gridApi.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', pinned: 'left' }] })
        );

        await expectIndentPerLevel(page, 'ag-grid-pinned-left-cells');

        await setIndicator(page, 0, 'below');
        await expectFlushLine(page, 0);

        await page.evaluate(() =>
            window.gridApi.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', pinned: 'right' }] })
        );
        await expectIndentPerLevel(page, 'ag-grid-pinned-right-cells');

        await page.evaluate(() => window.gridApi.setGridOption('domLayout', 'print'));
        await setIndicator(page, 2, 'above');
        await expectLineFromLabel(page, 2, 'ag-grid-scrolling-cells');
    });

    test("a detail row's line ignores the indented group labels of the grid nested in it", async ({ page }) => {
        await mountGrid(page, { enterprise: true, options: treeOptions });

        await expectDetailRowFlush(page);
    });

    test('lines up with the group label when the drag handle and another group renderer are in other columns, and follows the column moving and resizing', async ({
        page,
    }) => {
        await mountGrid(page, { enterprise: true, options: treeOptions });
        await page.evaluate(() => {
            const api = window.gridApi;
            api.setGridOption('autoGroupColumnDef', { width: 320 });
            api.setGridOption('columnDefs', [
                { field: 'assignee', rowDrag: true },
                {
                    colId: 'detail',
                    valueGetter: () => 'Detail',
                    cellRenderer: 'agGroupCellRenderer',
                    cellRendererParams: { suppressPadding: true },
                },
            ]);
        });

        await expectIndentPerLevel(page, 'ag-grid-scrolling-cells');

        const unmoved = await expectLineFromLabel(page, 3, 'ag-grid-scrolling-cells');
        await page.evaluate(() =>
            window.gridApi.applyColumnState({
                state: [{ colId: 'assignee' }, { colId: 'ag-Grid-AutoColumn' }, { colId: 'detail' }],
                applyOrder: true,
            })
        );
        // the cells slide to their new place, so the offset is polled until they settle
        await expect.poll(() => expectLineFromLabel(page, 3, 'ag-grid-scrolling-cells')).toBe(unmoved + 200);
        await page.evaluate(() => window.gridApi.setColumnWidths([{ key: 'assignee', newWidth: 300 }]));
        await expect.poll(() => expectLineFromLabel(page, 3, 'ag-grid-scrolling-cells')).toBe(unmoved + 300);
    });

    test('lines up with the label right to left', async ({ page }) => {
        await mountGrid(page, {
            enterprise: true,
            options: () => ({
                enableRtl: true,
                treeData: true,
                getDataPath: (data) => data.path,
                groupDefaultExpanded: -1,
                autoGroupColumnDef: { rowDrag: true, width: 320 },
                columnDefs: [{ field: 'assignee' }],
                rowData: [
                    { path: ['Marketing'] },
                    { path: ['Marketing', 'Design'] },
                    { path: ['Marketing', 'Design', 'Logo'] },
                    { path: ['Marketing', 'Design', 'Logo', 'Draft'] },
                ],
            }),
        });
        await page.evaluate(() =>
            window.gridApi.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', pinned: 'left' }] })
        );

        await expectIndentPerLevel(page, 'ag-grid-pinned-left-cells');
    });

    test('lines up with the label in a legacy theme', async ({ page }) => {
        await mountGrid(page, {
            enterprise: true,
            className: 'ag-theme-quartz',
            options: () => ({
                theme: 'legacy',
                treeData: true,
                getDataPath: (data) => data.path,
                groupDefaultExpanded: -1,
                autoGroupColumnDef: { rowDrag: true, width: 320, pinned: 'left' },
                columnDefs: [
                    {
                        colId: 'detail',
                        valueGetter: () => 'Detail',
                        cellRenderer: 'agGroupCellRenderer',
                        pinned: 'left',
                    },
                ],
                rowData: [
                    { path: ['Marketing'] },
                    { path: ['Marketing', 'Design'] },
                    { path: ['Marketing', 'Design', 'Logo'] },
                    { path: ['Marketing', 'Design', 'Logo', 'Draft'] },
                ],
            }),
        });

        await expectIndentPerLevel(page, 'ag-grid-pinned-left-cells');
        await expectDetailRowFlush(page);
    });

    test('lines up with the label of a full-width group row', async ({ page }) => {
        await mountGrid(page, {
            enterprise: true,
            options: () => ({
                groupDisplayType: 'groupRows',
                groupDefaultExpanded: -1,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'athlete', rowDrag: true },
                ],
                rowData: [{ country: 'Italy', sport: 'Fencing', athlete: 'Valentina' }],
            }),
        });

        await setIndicator(page, 1, 'above');
        await expectLineFromLabel(page, 1, 'row');
    });

    test('an embedded full-width group row is indented only in the part showing its label, padding overrides included', async ({
        page,
    }) => {
        await mountGrid(page, {
            enterprise: true,
            css: '#myGrid .ag-cell-wrapper { padding-inline-start: 7px; }',
            options: () => ({
                groupDisplayType: 'groupRows',
                embedFullWidthRows: true,
                groupDefaultExpanded: -1,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'athlete', rowDrag: true, pinned: 'left' },
                    { field: 'year' },
                ],
                rowData: [{ country: 'Italy', sport: 'Fencing', athlete: 'Valentina', year: 2004 }],
            }),
        });

        await setIndicator(page, 1, 'above');
        await expectLineFromLabel(page, 1, 'ag-grid-pinned-left-cells');
    });

    test('right to left, an embedded full-width group row with only the left side pinned is indented in the centre part, which shows its label', async ({
        page,
    }) => {
        await mountGrid(page, {
            enterprise: true,
            options: () => ({
                enableRtl: true,
                groupDisplayType: 'groupRows',
                embedFullWidthRows: true,
                groupDefaultExpanded: -1,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'athlete', rowDrag: true, pinned: 'left' },
                    { field: 'year' },
                ],
                rowData: [{ country: 'Italy', sport: 'Fencing', athlete: 'Valentina', year: 2004 }],
            }),
        });

        await setIndicator(page, 1, 'above');
        await expectLineFromLabel(page, 1, 'ag-grid-scrolling-cells');
    });
});
