import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

const CELL = 'rgb(255, 0, 0)';
const PINNED = 'rgb(0, 128, 0)';
const PINNED_SOURCE = 'rgb(128, 0, 128)';
const APP_ROW = 'rgb(255, 165, 0)';
const SELECTED = 'rgb(0, 0, 255)';

const textColor = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).color);

test('selectedRowTextColor only overrides the text colour of selected rows when it is set', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, {
        css: `
            #myGrid {
                --ag-cell-text-color: ${CELL};
                --ag-pinned-row-text-color: ${PINNED};
                --ag-pinned-source-row-text-color: ${PINNED_SOURCE};
            }
            .app-row { --ag-cell-text-color: ${APP_ROW}; }
        `,
        options: () => ({
            theme: (window as any).agGrid.themeQuartz,
            columnDefs: [{ field: 'athlete' }],
            rowSelection: { mode: 'multiRow' },
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.athlete === 'Pinned' ? 'top' : null),
            rowClassRules: { 'app-row': (params) => params.data?.athlete === 'App' },
            getRowId: (params) => params.data.athlete,
            rowData: [{ athlete: 'Pinned' }, { athlete: 'Plain' }, { athlete: 'App' }, { athlete: 'Unselected' }],
        }),
    });
    await withApi((api) => {
        for (const id of ['Pinned', 'Plain', 'App']) {
            api.getRowNode(id)!.setSelected(true);
        }
    });

    const rowCell = (rowSelector: string) => grid.locator(`${rowSelector} .ag-cell[col-id="athlete"]`).first();
    const pinned = rowCell('.ag-row-pinned.ag-row-selected');
    const pinnedSource = rowCell('.ag-row-pinned-source.ag-row-selected');
    const plain = rowCell('.ag-row[row-id="Plain"]');
    const app = rowCell('.ag-row[row-id="App"]');
    const unselected = rowCell('.ag-row[row-id="Unselected"]');

    // not set: selected rows keep the colour they would have had without selection
    expect(await textColor(plain)).toBe(CELL);
    expect(await textColor(pinned)).toBe(PINNED);
    expect(await textColor(pinnedSource)).toBe(PINNED_SOURCE);
    expect(await textColor(app)).toBe(APP_ROW);
    expect(await textColor(unselected)).toBe(CELL);

    await grid.evaluate((el, color) => el.style.setProperty('--ag-selected-row-text-color', color), SELECTED);

    // set: every selected row uses it
    expect(await textColor(plain)).toBe(SELECTED);
    expect(await textColor(pinned)).toBe(SELECTED);
    expect(await textColor(pinnedSource)).toBe(SELECTED);
    expect(await textColor(app)).toBe(SELECTED);
    expect(await textColor(unselected)).toBe(CELL);
});
