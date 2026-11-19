import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

/** Names the focused element: the grid's last cell, a side bar part, or the input placed after the grid. */
function focusedName(page: Page): Promise<string> {
    return page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (el.matches('.ag-cell')) {
            return 'cell';
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

const cases: { name: string; position: 'left' | 'right'; enableRtl: boolean; stops: string[] }[] = [
    {
        name: 'side bar on the right',
        position: 'right',
        enableRtl: false,
        stops: ['border', 'Search', 'column list', 'Columns button'],
    },
    {
        name: 'side bar on the left',
        position: 'left',
        enableRtl: false,
        stops: ['Columns button', 'Search', 'column list', 'border'],
    },
    {
        name: 'enableRtl, which draws the side bar on the left',
        position: 'right',
        enableRtl: true,
        stops: ['border', 'Search', 'column list', 'Columns button'],
    },
];

test.describe('side bar Tab order follows the drawn order', () => {
    for (const { name, position, enableRtl, stops } of cases) {
        test(`${name}: Tab from the grid goes through the side bar, and Shift+Tab comes back the same way`, async ({
            page,
        }) => {
            const { cell } = await mountGrid(page, {
                enterprise: true,
                // enableRtl is an initial option, and these functions are serialised, so each is written out
                options: enableRtl
                    ? () => ({
                          enableRtl: true,
                          columnDefs: [{ field: 'athlete' }, { field: 'country' }],
                          rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
                      })
                    : () => ({
                          columnDefs: [{ field: 'athlete' }, { field: 'country' }],
                          rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
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
                const input = document.createElement('input');
                input.id = 'after-grid';
                document.body.append(input);
            }, position);

            await cell(0, 'country').click();
            await expectStops(page, 'Tab', [...stops, 'after-grid']);
            await expectStops(page, 'Shift+Tab', [...stops].reverse().concat('cell'));
        });
    }
});
