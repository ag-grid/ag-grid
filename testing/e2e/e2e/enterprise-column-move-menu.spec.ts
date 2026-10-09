import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.describe('column movement menus', () => {
    test.use({ hasTouch: true });

    for (const surface of ['header', 'panel'] as const) {
        for (const group of [false, true]) {
            test(`${surface} ${group ? 'group' : 'column'} can be moved by long press and tap`, async ({ page }) => {
                const { grid, headerCell, withApi } = await mountGrid(page, {
                    enterprise: true,
                    options: () => ({
                        columnDefs: [
                            { field: 'a' },
                            { headerName: 'Group', children: [{ field: 'b' }, { field: 'c' }] },
                            { field: 'd' },
                        ],
                        defaultColDef: { width: 100 },
                        rowData: [{}],
                        sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
                    }),
                });
                const name = group ? 'Group' : 'B';
                const header = group
                    ? grid.locator('.ag-header-group-cell').filter({ hasText: name })
                    : headerCell('b');
                const panelItem = grid
                    .locator('.ag-column-select .ag-virtual-list-item')
                    .filter({ has: page.getByText(name, { exact: true }) });
                const target = surface === 'header' ? header : panelItem;
                await expect(target).toBeVisible();
                const box = (await target.boundingBox())!;
                const touch = { identifier: 1, clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 };
                const pressTarget = target.getByText(name, { exact: true });
                await pressTarget.dispatchEvent('touchstart', { touches: [touch], changedTouches: [touch] });
                const action = page.getByRole('menuitem', {
                    name: surface === 'header' ? 'Move Right' : 'Move Down',
                    exact: true,
                });
                await expect(action).toBeVisible();
                await pressTarget.dispatchEvent('touchend', { touches: [], changedTouches: [touch] });
                await action.tap();
                expect(await withApi((api) => api.getColumnState().map(({ colId }) => colId))).toEqual(
                    group ? ['a', 'd', 'b', 'c'] : ['a', 'c', 'b', 'd']
                );
                await expect(target).toBeFocused();
                await expect(action).toHaveCount(0);
            });
        }
    }

    test('tool-panel keyboard movement and menu activation restore focus', async ({ page }) => {
        const { grid, withApi } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
                rowData: [{}],
                sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
            }),
        });
        const item = grid
            .locator('.ag-column-select .ag-virtual-list-item')
            .filter({ has: page.getByText('B', { exact: true }) });
        await item.focus();
        await page.keyboard.press('Shift+ArrowDown');
        expect(await withApi((api) => api.getColumnState().map(({ colId }) => colId))).toEqual(['a', 'c', 'b']);
        await expect(item).toBeFocused();
        await page.keyboard.press('Shift+F10');
        const moveUp = page.getByRole('menuitem', { name: 'Move Up', exact: true });
        await moveUp.focus();
        await page.keyboard.press('Enter');
        expect(await withApi((api) => api.getColumnState().map(({ colId }) => colId))).toEqual(['a', 'b', 'c']);
        await expect(item).toBeFocused();
    });

    for (const chooser of [false, true]) {
        test(`restores focus to the moved split group in the ${chooser ? 'chooser' : 'tool panel'}`, async ({
            page,
        }) => {
            const { grid, withApi } = await mountGrid(page, {
                enterprise: true,
                options: () => ({
                    columnDefs: [
                        { headerName: 'Group', children: [{ field: 'b' }, { field: 'c' }] },
                        { field: 'x' },
                        { field: 'y' },
                    ],
                    rowData: [{}],
                    sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns' },
                }),
            });
            await withApi((api) => api.moveColumns(['x'], 1));
            if (chooser) {
                await withApi((api) => api.showColumnChooser());
            }
            const root = chooser ? page.getByRole('dialog') : grid;
            const movedGroup = root
                .locator('.ag-column-select-virtual-list-item')
                .filter({ has: page.getByText('Group', { exact: true }) })
                .nth(1);
            await movedGroup.click({ button: 'right' });
            await page.getByRole('menuitem', { name: 'Move Down', exact: true }).click();
            expect(await withApi((api) => api.getColumnState().map(({ colId }) => colId))).toEqual([
                'b',
                'x',
                'y',
                'c',
            ]);
            await expect(movedGroup).toBeFocused();
        });
    }

    test('moving a column beyond the viewport scrolls its header into view', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, {
            enterprise: true,
            width: 400,
            options: () => ({
                columnDefs: [
                    { field: 'a', width: 100 },
                    {
                        headerName: 'Married',
                        marryChildren: true,
                        children: Array.from({ length: 12 }, (_, i) => ({ field: `b${i}`, width: 100 })),
                    },
                ],
                rowData: [{}],
            }),
        });
        await expect(headerCell('b11')).toHaveCount(0);
        await headerCell('a').click({ button: 'right' });
        await page.getByRole('menuitem', { name: 'Move Right', exact: true }).click();
        expect(await withApi((api) => api.getColumnState().at(-1)!.colId)).toBe('a');
        await expect(headerCell('a')).toBeVisible();
        await expect(headerCell('a')).toBeFocused();
        await expect(headerCell('b0')).toHaveCount(0);
    });
});
