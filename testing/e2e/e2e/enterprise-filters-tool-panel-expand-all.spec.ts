import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.describe('Filters tool panel expand-all button', () => {
    test('is reached in Tab order and toggles with Enter and Space', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [
                    { headerName: 'Details', children: [{ field: 'athlete' }, { field: 'country' }] },
                    { headerName: 'Results', children: [{ field: 'gold' }, { field: 'silver' }] },
                ],
                defaultColDef: { filter: true },
                sideBar: { toolPanels: ['filters'], defaultToolPanel: 'filters' },
                rowData: [],
            }),
        });
        const sideButton = grid.getByRole('tab', { name: 'Filters' });
        const expandAll = grid.getByRole('button', { name: /^(Expand|Collapse) All Filter Groups$/ });
        const search = grid.getByRole('textbox', { name: 'Filter Columns Input' });
        const expectNameAndState = async (name: string, expanded: string) => {
            await expect(expandAll).toHaveAccessibleName(name);
            await expect(expandAll).toHaveAttribute('aria-expanded', expanded);
        };

        await sideButton.focus();
        await page.keyboard.press('Tab');
        await expect(expandAll).toBeFocused();
        await expectNameAndState('Collapse All Filter Groups', 'true');

        await page.keyboard.press('Enter');
        await expectNameAndState('Expand All Filter Groups', 'false');
        await expect(expandAll).toBeFocused();

        await page.keyboard.press('Space');
        await expectNameAndState('Collapse All Filter Groups', 'true');
        await expect(expandAll).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(search).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(expandAll).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(sideButton).toBeFocused();
    });
});
