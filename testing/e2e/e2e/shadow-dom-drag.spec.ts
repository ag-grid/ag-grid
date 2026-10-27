import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test('column resizing continues outside the shadow root and ends when released there', async ({ page }) => {
    const { grid, headerCell, withApi } = await mountGrid(page, {
        shadowDom: true,
        width: 520,
        height: 300,
        css: 'body{background:red;min-height:100vh}#shadow-host{display:inline-block}',
        options: () => ({
            suppressDragLeaveHidesColumns: true,
            defaultColDef: { width: 100 },
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }],
            rowData: [
                { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
                { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
                { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
            ],
        }),
    });
    await grid.evaluate((element) => {
        const greenArea = document.createElement('div');
        greenArea.style.cssText = 'padding:40px;background:green';
        element.before(greenArea);
        greenArea.appendChild(element);
    });

    const handle = headerCell('model').locator('.ag-header-cell-resize');
    const handleBox = (await handle.boundingBox())!;
    const gridBox = (await grid.boundingBox())!;
    const hostBox = (await page.locator('#shadow-host').boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const y = handleBox.y + handleBox.height / 2;
    const width = () => withApi((api) => api.getColumn('model')!.getActualWidth());
    const initialWidth = await width();

    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(gridBox.x + gridBox.width + 20, y, { steps: 5 });
    const widthInGreen = await width();
    expect(widthInGreen).toBeGreaterThan(initialWidth);

    await page.mouse.move(hostBox.x + hostBox.width + 20, y, { steps: 5 });
    const widthOnExit = await width();
    await page.mouse.move(hostBox.x + hostBox.width + 60, y, { steps: 3 });
    const widthInRed = await width();
    expect.soft(widthInRed).toBeGreaterThan(widthOnExit);
    await page.mouse.up();

    await page.mouse.move(startX + 20, y, { steps: 5 });
    expect(await width()).toBe(widthInRed);

    // A new click gesture must still reach the resize handle for autosizing.
    await withApi((api) => api.setColumnWidths([{ key: 'model', newWidth: 250 }]));
    await handle.dblclick();
    await expect.poll(width).toBeLessThan(250);
});

for (const rangeHandle of [false, true]) {
    test(`cell selection keeps its original target and stops after an outside release, range handle=${rangeHandle}`, async ({
        page,
    }) => {
        const { cell, grid, withApi } = await mountGrid(page, {
            enterprise: true,
            shadowDom: true,
            width: 520,
            height: 300,
            options: () => ({
                columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
                defaultColDef: { width: 120 },
                rowData: [
                    { make: 'Tesla', model: 'Model Y', price: 64950 },
                    { make: 'Ford', model: 'F-Series', price: 33850 },
                    { make: 'Toyota', model: 'Corolla', price: 29600 },
                ],
                cellSelection: true,
            }),
        });
        if (rangeHandle) {
            await withApi((api) => api.setGridOption('cellSelection', { handle: { mode: 'range' } }));
        }
        const start = (await cell(0, 'make').boundingBox())!;
        const end = (await cell(2, 'price').boundingBox())!;
        await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
        await page.mouse.down();
        await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });

        const ranges = () =>
            withApi((api) =>
                api.getCellRanges()!.map((range) => ({
                    start: range.startRow!.rowIndex,
                    end: range.endRow!.rowIndex,
                    columns: range.columns.map((column) => column.getColId()),
                }))
            );
        const expected = [{ start: 0, end: 2, columns: ['make', 'model', 'price'] }];
        expect(await ranges()).toEqual(expected);

        const gridBox = (await grid.boundingBox())!;
        await page.mouse.move(gridBox.x + gridBox.width + 40, end.y + end.height / 2);
        await page.mouse.up();
        await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2, { steps: 8 });
        expect(await ranges()).toEqual(expected);
    });
}

for (const mode of ['fill', 'range'] as const) {
    test(`dialogs fade while the ${mode} handle is dragged`, async ({ page }) => {
        const { cell } = await mountGrid(page, {
            enterprise: true,
            integratedCharts: true,
            shadowDom: true,
            width: 1000,
            height: 700,
            options: () => ({
                columnDefs: [
                    { field: 'country', chartDataType: 'category' },
                    { field: 'gold', chartDataType: 'series' },
                ],
                rowData: [
                    { country: 'Russia', gold: 3 },
                    { country: 'USA', gold: 4 },
                    { country: 'China', gold: 2 },
                ],
                cellSelection: true,
            }),
        });
        await page.evaluate(async (mode) => {
            const api = (window as any).gridApi;
            const chartRef = api.createRangeChart({
                cellRange: { columns: ['country', 'gold'] },
                chartType: 'groupedColumn',
            });
            await chartRef.chart.waitForUpdate();
            api.setGridOption('cellSelection', { handle: { mode } });
        }, mode);
        const dialog = page.locator('.ag-dialog');
        // Keep the chart dialog clear of the cells the handle is dragged across.
        await dialog.evaluate((el: HTMLElement) => {
            el.style.top = '400px';
            el.style.left = '400px';
        });
        const opacity = () => dialog.evaluate((el) => getComputedStyle(el).opacity);

        await cell(0, 'gold').click();
        const handleBox = (await page.locator(`.ag-${mode}-handle`).boundingBox())!;
        const target = (await cell(2, 'gold').boundingBox())!;
        expect(await opacity()).toBe('1');

        await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 5 });
        expect(await opacity()).toBe('0.7');

        await page.mouse.up();
        expect(await opacity()).toBe('1');
    });
}
