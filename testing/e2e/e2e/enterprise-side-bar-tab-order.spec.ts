import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

/** Names the focused element: a grid header or cell, a side bar part, or an input placed before or after the grid. */
function focusedName(page: Page): Promise<string> {
    return page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (el.matches('.ag-cell')) {
            return 'cell';
        }
        if (el.matches('.ag-header-cell')) {
            return 'header';
        }
        if (el.matches('.ag-tool-panel-horizontal-resize')) {
            return 'border';
        }
        if (el.matches('.ag-tool-panel-resize-button')) {
            return el.getAttribute('aria-label')!;
        }
        if (el.matches('.ag-side-button-button')) {
            return 'Columns button';
        }
        if (el.matches('.ag-column-select-header-filter-wrapper input')) {
            return 'Search';
        }
        if (el.matches('.ag-column-select-virtual-list-item')) {
            return 'column list';
        }
        return el.id || el.className;
    });
}

/** Presses `key` once per expected stop, waiting for each as the column list takes focus asynchronously. */
async function expectStops(page: Page, key: 'Tab' | 'Shift+Tab', stops: string[]): Promise<void> {
    for (const stop of stops) {
        await page.keyboard.press(key);
        await expect.poll(() => focusedName(page)).toBe(stop);
    }
}

// the side bar sits where it is drawn, left to right, so a side bar drawn on the left comes before the grid
const drawnOnRight = ['header', 'cell', 'border', 'Search', 'column list', 'Columns button'];
const drawnOnLeft = ['Columns button', 'Search', 'column list', 'border', 'header', 'cell'];

const cases: { name: string; position: 'left' | 'right'; enableRtl: boolean; stops: string[] }[] = [
    { name: 'side bar on the right', position: 'right', enableRtl: false, stops: drawnOnRight },
    { name: 'side bar on the left', position: 'left', enableRtl: false, stops: drawnOnLeft },
    { name: 'enableRtl, which draws the side bar on the left', position: 'right', enableRtl: true, stops: drawnOnLeft },
    {
        name: "enableRtl with position: 'left', which draws the side bar on the right",
        position: 'left',
        enableRtl: true,
        stops: drawnOnRight,
    },
];

test.describe('side bar Tab order follows the drawn order', () => {
    for (const { name, position, enableRtl, stops } of cases) {
        test(`${name}: Tab goes through the grid and side bar in order, and Shift+Tab comes back the same way`, async ({
            page,
        }) => {
            await mountGrid(page, {
                enterprise: true,
                // enableRtl is an initial option, and these functions are serialised, so each is written out
                options: enableRtl
                    ? () => ({
                          enableRtl: true,
                          columnDefs: [{ field: 'athlete' }],
                          rowData: [{ athlete: 'Michael Phelps' }],
                      })
                    : () => ({
                          columnDefs: [{ field: 'athlete' }],
                          rowData: [{ athlete: 'Michael Phelps' }],
                      }),
            });
            await page.evaluate((position) => {
                window.gridApi.setGridOption('sideBar', {
                    position,
                    // only the Search box and the column list inside the panel
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                            toolPanelParams: {
                                suppressPivotMode: true,
                                suppressRowGroups: true,
                                suppressValues: true,
                                suppressColumnSelectAll: true,
                            },
                        },
                    ],
                    defaultToolPanel: 'columns',
                });
                const before = Object.assign(document.createElement('input'), { id: 'before-grid' });
                const after = Object.assign(document.createElement('input'), { id: 'after-grid' });
                document.body.prepend(before);
                document.body.append(after);
            }, position);

            await page.locator('#before-grid').focus();
            await expectStops(page, 'Tab', [...stops, 'after-grid']);
            await expectStops(page, 'Shift+Tab', [...stops].reverse().concat('before-grid'));
        });
    }
});
