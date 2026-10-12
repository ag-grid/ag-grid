import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { GridApi } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

// AG-18834: the Grid resolves CSS colour names with the browser rather than its own name table. These run in real
// browsers so that the names are resolved by each engine, not by happy-dom.

const INVALID_COLOUR = 'Color value is invalid';

/** Mounts an enterprise grid with integrated charts and opens a range chart's tool panel. */
async function openChartToolPanel(page: Page, panel: 'format' | 'settings') {
    await mountGrid(page, {
        enterprise: true,
        integratedCharts: true,
        options: () => ({
            columnDefs: [
                { field: 'country', chartDataType: 'category' },
                { field: 'gold', chartDataType: 'series' },
                { field: 'silver', chartDataType: 'series' },
            ],
            rowData: [
                { country: 'Russia', gold: 3, silver: 1 },
                { country: 'USA', gold: 4, silver: 2 },
            ],
            cellSelection: true,
            popupParent: document.body,
            chartThemes: ['colour-names'],
            customChartThemes: {
                'colour-names': { palette: { fills: ['purple', 'white', 'teal'], strokes: ['black'] } },
            },
        }),
    });
    // `withApi` serialises its callback, so the panel is passed in as an argument instead.
    await page.evaluate(async (panel) => {
        const api: GridApi = (window as any).gridApi;
        const chartRef = api.createRangeChart({
            cellRange: { columns: ['country', 'gold', 'silver'] },
            chartType: 'groupedColumn',
        })!;
        await chartRef.chart.waitForUpdate();
        api.openChartToolPanel({ chartId: chartRef.chartId, panel });
    }, panel);
}

/** Opens the first colour picker in the format panel's Chart Style group, returning its value and its text input. */
async function openFirstColourPicker(page: Page) {
    await openChartToolPanel(page, 'format');
    const format = page.locator('.ag-chart-format-wrapper');
    await format.getByText('Chart Style', { exact: true }).click();
    const picker = format.locator('.ag-color-picker >> visible=true').first();
    const value = picker.locator('.ag-color-picker-value');
    await expect(value).toHaveText(/^#[0-9A-F]{6}([0-9A-F]{2})?$/);
    await picker.locator('.ag-picker-field-wrapper').click();
    const input = page.locator('.ag-color-dialog .ag-color-panel .ag-color-input input');
    await expect(input).toBeVisible();
    return { value, input };
}

test.describe('integrated charts colour names', () => {
    for (const [name, hex] of [
        ['red', '#FF0000'],
        ['transparent', '#00000000'],
    ]) {
        test(`typing ${name} into the format panel colour input shows ${hex}`, async ({ page }) => {
            const { value, input } = await openFirstColourPicker(page);

            await input.fill(name);

            await expect(input).toHaveJSProperty('validationMessage', '');
            await expect(value).toHaveText(hex);
        });
    }

    for (const keyword of ['inherit', 'currentcolor']) {
        test(`typing ${keyword} marks the input invalid and leaves the picker unchanged`, async ({ page }) => {
            const { value, input } = await openFirstColourPicker(page);
            await input.fill('red');
            await expect(value).toHaveText('#FF0000');

            await input.fill(keyword);

            await expect(input).toHaveJSProperty('validationMessage', INVALID_COLOUR);
            await expect(value).toHaveText('#FF0000');
        });
    }

    test('the custom theme heatmap thumbnail runs from palette fill 0 towards fill 1', async ({ page }) => {
        await openChartToolPanel(page, 'settings');
        const heatmap = page
            .locator('.ag-chart-mini-thumbnail-svg')
            .filter({ has: page.locator('title', { hasText: /^Heatmap$/ }) });
        await expect(heatmap).toHaveCount(1);

        const cellFills = await heatmap
            .locator('path')
            .evaluateAll((paths) => paths.map((p) => (p.getAttribute('fill')!.match(/[\d.]+/g) ?? []).map(Number)));

        const purple = [128, 0, 128];
        const white = [255, 255, 255];
        const towardsWhite = purple.map((channel, i) => Math.round(channel + (white[i] - channel) * 0.2));
        expect(cellFills).toHaveLength(9);
        // Opaque colours serialise without an alpha component, so only the rgb channels are compared.
        expect(cellFills[0].slice(0, 3)).toEqual(purple);
        expect(cellFills[1].slice(0, 3)).toEqual(towardsWhite);
    });
});
