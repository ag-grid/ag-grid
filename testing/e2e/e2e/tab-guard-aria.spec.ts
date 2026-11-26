import { expect, test } from '@playwright/test';
import type { run } from 'axe-core';
import { source } from 'axe-core';

import { mountGrid } from '../src/mountGrid';

declare global {
    interface Window {
        axe: { run: typeof run };
    }
}

test.describe('tab guard accessibility', () => {
    for (const surface of ['column', 'context', 'disabled'] as const) {
        test(`${surface} menu guards redirect focus without ARIA violations`, async ({ page }) => {
            const { withApi } = await mountGrid(page, {
                enterprise: true,
                options: () => ({
                    columnDefs: [{ field: 'value' }],
                    rowData: [{ value: 1 }],
                    getColumnMenuItems: () => [{ name: 'Action' }],
                    getContextMenuItems: () => [{ name: 'Action' }],
                }),
            });
            if (surface === 'disabled') {
                await withApi((api) =>
                    api.setGridOption('getColumnMenuItems', () => [{ name: 'Action', disabled: true }])
                );
            }
            if (surface === 'context') {
                await withApi((api) =>
                    api.showContextMenu({
                        rowNode: api.getDisplayedRowAtIndex(0),
                        column: api.getColumn('value')!,
                        value: 1,
                        source: 'api',
                    })
                );
            } else {
                await withApi((api) => api.showColumnMenu('value'));
            }
            const menu = page.getByRole('menu');
            const target = page.getByRole('menuitem', { name: 'Action' });
            await expect(target).toBeFocused();
            for (const guard of await menu.locator('.ag-tab-guard').all()) {
                await guard.focus();
                await expect(target).toBeFocused();
                await expect(guard).toHaveAttribute('aria-hidden', 'true');
                await expect(guard).not.toHaveAttribute('role');
            }

            await withApi((api) => api.setFocusedCell(0, 'value'));
            await page.addScriptTag({ content: source });
            const violations = await page.evaluate(async () => {
                const result = await window.axe.run(document.querySelector('.ag-menu')!, {
                    runOnly: ['presentation-role-conflict', 'aria-required-children', 'aria-hidden-focus'],
                });
                return result.violations;
            });
            expect(violations).toEqual([]);
        });
    }

    test('native Tab exits the grid without leaving focus on a hidden guard', async ({ page }) => {
        const { withApi, cell } = await mountGrid(page, {
            options: () => ({ columnDefs: [{ field: 'value' }], rowData: [{ value: 1 }] }),
        });
        await page.evaluate(() => {
            const button = document.createElement('button');
            button.tabIndex = 0;
            button.textContent = 'After grid';
            document.body.append(button);
        });
        await withApi((api) => api.setFocusedCell(0, 'value'));
        await expect(cell(0, 'value')).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'After grid' })).toBeFocused();
        await page.keyboard.press('Shift+Tab');
        await expect(cell(0, 'value')).toBeFocused();
    });
});
