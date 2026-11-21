import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

for (const native of [false, true]) {
    test(`automatic text tooltips follow real overflow and resizing (native=${native})`, async ({ page }) => {
        const { grid, withApi } = await mountGrid(page, {
            enterprise: true,
            options: native
                ? () => ({
                      columnDefs: [{ field: 'value', headerName: 'A very long column header name', width: 140 }],
                      rowData: [{ value: 'A very long displayed cell value that will be truncated' }],
                      enableBrowserTooltips: true,
                  })
                : () => ({
                      columnDefs: [{ field: 'value', headerName: 'A very long column header name', width: 140 }],
                      rowData: [{ value: 'A very long displayed cell value that will be truncated' }],
                      tooltipShowDelay: 0,
                      tooltipSwitchShowDelay: 0,
                  }),
        });
        const cell = grid.locator('.ag-cell[col-id="value"]');
        const header = grid.locator('.ag-header-cell[col-id="value"]');
        const tooltip = page.getByRole('tooltip');
        for (const source of [header, cell]) {
            await source.hover();
            const text = await (source === header ? header.locator('.ag-header-cell-text') : cell).textContent();
            if (native) {
                await expect(source).toHaveAttribute('title', text!);
            } else {
                await expect(tooltip).toHaveText(text!);
            }
            await page.mouse.move(0, 0);
            await expect(tooltip).toHaveCount(0);
        }
        await withApi((api) => api.setColumnWidths([{ key: 'value', newWidth: 700 }]));
        await expect.poll(() => cell.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        await page.clock.install();
        await cell.hover();
        await page.clock.runFor(1);
        if (native) {
            await expect(cell).toHaveAttribute('title', '');
        }
        await expect(tooltip).toHaveCount(0);
    });
}

test('Set Filter item previews do not expose the enclosing panel label tooltip', async ({ page }) => {
    const { grid } = await mountGrid(page, {
        enterprise: true,
        options: () => ({
            columnDefs: [
                {
                    field: 'value',
                    headerName: 'Different header information',
                    headerTooltip: 'Header information',
                    filter: 'agSetColumnFilter',
                },
            ],
            rowData: [{ value: 'A very long Set Filter option that cannot fit inside the tool panel' }],
            sideBar: { toolPanels: ['filters'], defaultToolPanel: 'filters' },
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        }),
    });
    await grid.locator('.ag-filter-toolpanel-group-title-bar').click();
    const option = grid.locator('.ag-set-filter-item .ag-label').filter({ hasText: 'A very long' });
    await option.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
        'A very long Set Filter option that cannot fit inside the tool panel'
    );
});

test('automatic previews use the current virtualised row after scrolling', async ({ page }) => {
    const { cell, withApi } = await mountGrid(page, {
        height: 240,
        options: () => ({
            columnDefs: [{ field: 'value', width: 140 }],
            rowData: Array.from({ length: 200 }, (_, index) => ({ value: `Long displayed value for row ${index}` })),
            rowBuffer: 0,
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            context: { scrollEnds: 0 },
            onBodyScrollEnd: ({ context }) => context.scrollEnds++,
        }),
    });
    const first = cell(0, 'value');
    const box = (await first.boundingBox())!;
    const point = { x: box.x + 40, y: box.y + box.height / 2 };
    await page.mouse.move(point.x, point.y);
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Long displayed value for row 0');
    await page.mouse.wheel(0, 1200);
    await expect.poll(() => withApi((api) => api.getGridOption('context').scrollEnds)).toBeGreaterThan(0);
    await expect(first).toHaveCount(0);
    const currentText = await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest('.ag-cell')?.textContent,
        point
    );
    expect(currentText).toMatch(/^Long displayed value for row \d+$/);
    await expect(tooltip).toHaveText(currentText!);
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
});
