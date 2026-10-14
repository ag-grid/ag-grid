import { expect, test } from '@playwright/test';

import type { IFloatingFilterParams, IHeaderGroupParams } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

test.describe('column menu during header refresh', () => {
    for (const opening of ['button', 'mouse', 'context'] as const) {
        for (const pinned of [false, true]) {
            test(`preserves a split group header menu (${opening}, pinned: ${pinned})`, async ({ page }) => {
                const { grid, withApi } = await mountGrid(page, {
                    enterprise: true,
                    options: () => {
                        class GroupHeader {
                            private readonly button = document.createElement('button');
                            init(params: IHeaderGroupParams) {
                                this.button.textContent = `${params.columnGroup.getPinned() ?? 'center'} menu`;
                                this.button.onclick = (event) =>
                                    event.altKey
                                        ? params.showColumnMenuAfterMouseClick(event)
                                        : params.showColumnMenu(this.button);
                            }
                            getGui() {
                                return this.button;
                            }
                        }
                        return {
                            columnDefs: [
                                {
                                    headerName: 'Group',
                                    headerGroupComponent: GroupHeader,
                                    children: [{ field: 'year', pinned: 'left' }, { field: 'gold' }],
                                },
                            ],
                            rowData: [{ year: '2004', gold: 1 }],
                            getColumnMenuItems: () => [{ name: 'Action' }],
                        };
                    },
                });
                await page.clock.install();
                const header = grid
                    .locator('.ag-header-group-cell')
                    .filter({ hasText: pinned ? 'left menu' : 'center menu' });
                if (opening === 'context') {
                    await header.click({ button: 'right' });
                } else {
                    await header.getByRole('button').click({ modifiers: opening === 'mouse' ? ['Alt'] : [] });
                }
                const item = page.getByRole('menuitem', { name: 'Action', exact: true });
                await expect(item).toBeFocused();
                const originalItem = await item.elementHandle();
                for (let i = 0; i < 2; i++) {
                    await withApi((api) => api.refreshHeader());
                    await page.clock.runFor(600);
                    expect(await originalItem!.evaluate((element) => element === document.activeElement)).toBe(true);
                }
                await page.keyboard.press('Escape');
                await expect(item).toHaveCount(0);
                await expect(header).toBeFocused();
                await header.getByRole('button').click();
                await expect(item).toBeVisible();
            });
        }
    }

    for (const custom of [false, true]) {
        test(`preserves a floating-filter menu (custom launch: ${custom})`, async ({ page }) => {
            const { grid, withApi } = await mountGrid(page, {
                enterprise: true,
                options: () => {
                    class FloatingFilter {
                        private readonly button = document.createElement('button');
                        init(params: IFloatingFilterParams) {
                            this.button.textContent = 'Open parent filter';
                            this.button.onclick = () => params.showParentFilter();
                        }
                        getGui() {
                            return this.button;
                        }
                        onParentModelChanged() {}
                    }
                    return {
                        columnDefs: [
                            {
                                field: 'year',
                                filter: 'agTextColumnFilter',
                                floatingFilter: true,
                                floatingFilterComponent: FloatingFilter,
                            },
                        ],
                        rowData: [{ year: '2004' }],
                    };
                },
            });
            if (custom) {
                await withApi((api) => api.setGridOption('defaultColDef', { suppressFloatingFilterButton: true }));
            }
            await page.clock.install();
            const header = grid.locator('.ag-floating-filter[col-id="year"]');
            const button = custom
                ? header.getByRole('button', { name: 'Open parent filter' })
                : header.locator('.ag-floating-filter-button-button');
            await button.focus();
            await page.keyboard.press('Enter');
            const menu = page.locator('.ag-filter-menu');
            const input = menu.getByRole('textbox').first();
            await input.fill('2004');
            const originalInput = await input.elementHandle();
            for (let i = 0; i < 2; i++) {
                await withApi((api) => api.refreshHeader());
                await page.clock.runFor(600);
                expect(await originalInput!.evaluate((element) => element === document.activeElement)).toBe(true);
                await expect(input).toHaveValue('2004');
            }
            await page.keyboard.press('Escape');
            await expect(menu).toHaveCount(0);
            await expect(custom ? header : button).toBeFocused();
            await button.click();
            await expect(menu).toBeVisible();
            if (!custom) {
                await withApi((api) => api.refreshHeader());
                await button.click();
                await expect(menu).toHaveCount(0);
            }
        });
    }

    for (const pinned of [false, true]) {
        for (const opening of ['keyboard', 'button'] as const) {
            test(`preserves the menu and focused item (${opening}, pinned: ${pinned})`, async ({ page }) => {
                const { headerCell, withApi } = await mountGrid(page, {
                    enterprise: true,
                    options: () => ({
                        columnDefs: [{ field: 'year' }, { field: 'gold' }],
                        rowData: [{ year: '2004', gold: 1 }],
                        suppressMenuHide: true,
                        popupParent: document.body,
                    }),
                });
                if (pinned) {
                    await withApi((api) => api.applyColumnState({ state: [{ colId: 'year', pinned: 'left' }] }));
                }
                await page.clock.install();
                const header = headerCell('year');
                const button = header.locator('.ag-header-cell-menu-button');
                if (opening === 'keyboard') {
                    await header.focus();
                    await page.keyboard.press('Alt+ArrowDown');
                } else {
                    await button.click();
                }
                const menu = page.locator('.ag-column-menu');
                await expect(menu).toBeVisible();
                await page.keyboard.press('ArrowDown');
                const focusedItem = await page.evaluateHandle(() => document.activeElement!);
                const originalMenu = await menu.elementHandle();

                for (let i = 0; i < 3; i++) {
                    await withApi((api) => api.refreshHeader());
                    // Exercise the popup's position tracker after its original anchor has been removed.
                    await page.clock.runFor(600);
                    expect(await originalMenu!.evaluate((element) => element.isConnected)).toBe(true);
                    expect(await focusedItem.evaluate((element) => element === document.activeElement)).toBe(true);
                }

                await page.keyboard.press('Escape');
                await expect(menu).toHaveCount(0);
                await expect(header).toBeFocused();

                await button.click();
                await expect(menu).toBeVisible();
                await withApi((api) => api.refreshHeader());
                await button.click();
                await expect(menu).toHaveCount(0);
            });
        }
    }

    test('preserves an open submenu and its focused item', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'year' }, { field: 'gold' }],
                rowData: [{ year: '2004', gold: 1 }],
            }),
        });
        await page.clock.install();
        await headerCell('year').focus();
        await page.keyboard.press('Alt+ArrowDown');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        await expect(page.getByRole('menuitem', { name: 'Pin Column', exact: true })).toBeFocused();
        await page.keyboard.press('ArrowRight');
        await expect(page.getByRole('menuitemcheckbox', { name: 'No Pin', exact: true })).toBeFocused();
        const pinLeft = page.getByRole('menuitemcheckbox', { name: 'Pin Left', exact: true });
        await page.keyboard.press('ArrowDown');
        await expect(pinLeft).toBeFocused();

        await withApi((api) => api.refreshHeader());
        await page.clock.runFor(600);
        await expect(pinLeft).toBeFocused();
        await page.keyboard.press('Enter');
        expect(await withApi((api) => api.getColumn('year')!.getPinned())).toBe('left');
        await expect(headerCell('year')).toBeFocused();
    });

    test('positions an async filter against the refreshed header', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, {
            enterprise: true,
            options: () => {
                class AsyncFilter {
                    private readonly input = document.createElement('input');

                    init(): Promise<void> {
                        this.input.placeholder = 'Async filter';
                        return new Promise((resolve) => {
                            document.addEventListener('finish-filter-init', () => resolve(), { once: true });
                        });
                    }

                    getGui() {
                        return this.input;
                    }
                    getModel() {
                        return null;
                    }
                    setModel() {}
                    isFilterActive() {
                        return false;
                    }
                    doesFilterPass() {
                        return true;
                    }
                }

                return {
                    columnDefs: [{ field: 'year' }, { field: 'gold', filter: AsyncFilter }],
                    rowData: [{ year: '2004', gold: 1 }],
                };
            },
        });
        await page.clock.install();
        await headerCell('gold').locator('.ag-header-cell-filter-button').click();
        const menu = page.locator('.ag-filter-menu');
        const position = (await menu.boundingBox())!;

        await withApi((api) => api.refreshHeader());
        await page.clock.runFor(600);
        await page.evaluate(() => document.dispatchEvent(new Event('finish-filter-init')));
        await expect(page.getByPlaceholder('Async filter')).toBeVisible();
        await page.clock.runFor(600);

        const loadedPosition = (await menu.boundingBox())!;
        expect(loadedPosition.x).toBeCloseTo(position.x);
        expect(loadedPosition.y).toBeCloseTo(position.y);
    });

    test('opens the filter from the refreshed header', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'year', filter: true, suppressHeaderFilterButton: true }],
                rowData: [{ year: '2004' }],
            }),
        });
        await page.clock.install();
        await headerCell('year').focus();
        await page.keyboard.press('Alt+ArrowDown');
        await withApi((api) => api.refreshHeader());
        await page.clock.runFor(600);
        await page.getByRole('menuitem', { name: 'Column Filter', exact: true }).click();
        await page.clock.runFor(600);
        await expect(page.locator('.ag-filter')).toBeVisible();
    });
});
