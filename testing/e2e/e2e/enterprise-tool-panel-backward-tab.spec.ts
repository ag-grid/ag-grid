import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

/** Clicks an input placed after the grid and presses Shift+Tab. */
async function shiftTabFromInputAfterGrid(page: Page): Promise<void> {
    await page.evaluate(() => {
        const input = document.createElement('input');
        input.id = 'after-grid';
        document.body.append(input);
    });
    await page.locator('#after-grid').click();
    await page.keyboard.press('Shift+Tab');
}

/** Describes the focused element, and whether it is fully visible within every scrollable ancestor. */
function describeFocusedElement(page: Page) {
    return page.evaluate(() => {
        const active = document.activeElement as HTMLElement;
        const target = active.getBoundingClientRect();
        const scrolls = (overflow: string) => overflow === 'auto' || overflow === 'scroll';
        let inView = true;
        for (let el = active.parentElement; el; el = el.parentElement) {
            const { overflowX, overflowY } = getComputedStyle(el);
            if (scrolls(overflowX) || scrolls(overflowY)) {
                const container = el.getBoundingClientRect();
                inView &&=
                    target.top >= container.top - 1 &&
                    target.bottom <= container.bottom + 1 &&
                    target.left >= container.left - 1 &&
                    target.right <= container.right + 1;
            }
        }
        return { className: active.className, text: active.textContent?.trim() ?? '', inView };
    });
}

test.describe('Shift+Tab into a tool panel from after the grid', () => {
    test('columns tool panel focuses the last column and scrolls it into view', async ({ page }) => {
        await mountGrid(page, {
            enterprise: true,
            height: 300,
            options: () => ({
                columnDefs: [
                    'athlete',
                    'age',
                    'country',
                    'year',
                    'date',
                    'sport',
                    'gold',
                    'silver',
                    'bronze',
                    'total',
                ].map((field) => ({ field })),
                sideBar: true,
                rowData: [],
            }),
        });

        await shiftTabFromInputAfterGrid(page);
        await expect
            .poll(() => describeFocusedElement(page))
            .toMatchObject({ className: expect.stringContaining('ag-virtual-list-item'), text: 'Total', inView: true });
    });

    test('columns tool panel with no search matches focuses the search clear button', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            height: 300,
            options: () => ({
                columnDefs: [{ field: 'athlete' }, { field: 'age' }],
                sideBar: true,
                rowData: [],
            }),
        });
        await grid.locator('.ag-column-select-header-filter-wrapper input').fill('no match');
        await expect(grid.locator('.ag-column-select-virtual-list-item')).toHaveCount(0);

        await shiftTabFromInputAfterGrid(page);
        await expect
            .poll(() => describeFocusedElement(page))
            .toMatchObject({ className: expect.stringContaining('ag-input-field-clear-button'), inView: true });
    });

    test('columns tool panel values drop zone focuses the last pill and scrolls it into view', async ({ page }) => {
        await mountGrid(page, {
            enterprise: true,
            height: 490,
            options: () => ({
                columnDefs: [
                    'athlete',
                    'age',
                    'country',
                    'year',
                    'date',
                    'sport',
                    'gold',
                    'silver',
                    'bronze',
                    'total',
                ].map((field, index) => (index > 5 ? { field, aggFunc: 'sum' } : { field })),
                sideBar: true,
                rowData: [],
            }),
        });

        await shiftTabFromInputAfterGrid(page);
        await expect.poll(() => describeFocusedElement(page)).toMatchObject({ text: 'sum(Total)', inView: true });
    });

    test('filters tool panel focuses the last filter and scrolls it into view', async ({ page }) => {
        await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: ['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total']
                    .concat(['athlete', 'age', 'country', 'year', 'date', 'sport', 'gold', 'silver', 'bronze', 'total'])
                    .map((field) => ({ field })),
                defaultColDef: { filter: true },
                sideBar: 'filters',
                rowData: [],
            }),
        });

        await shiftTabFromInputAfterGrid(page);
        await expect.poll(() => describeFocusedElement(page)).toMatchObject({ text: 'Total', inView: true });
    });

    test('new filters tool panel focuses the add filter button below the last filter and scrolls it into view', async ({
        page,
    }) => {
        await mountGrid(page, {
            enterprise: true,
            height: 300,
            options: () => ({
                columnDefs: [
                    'athlete',
                    'age',
                    'country',
                    'year',
                    'date',
                    'sport',
                    'gold',
                    'silver',
                    'bronze',
                    'total',
                ].map((field) => ({ field })),
                defaultColDef: { filter: true },
                enableFilterHandlers: true,
                sideBar: 'filters-new',
                initialState: {
                    sideBar: {
                        visible: true,
                        position: 'right',
                        openToolPanel: 'filters-new',
                        toolPanels: {
                            'filters-new': {
                                filters: ['athlete', 'gold', 'country', 'total'].map((colId) => ({
                                    colId,
                                    expanded: true,
                                })),
                            },
                        },
                    },
                },
                rowData: [],
            }),
        });

        await shiftTabFromInputAfterGrid(page);
        await expect.poll(() => describeFocusedElement(page)).toMatchObject({ text: 'Add Filter', inView: true });
    });
});
