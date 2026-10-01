import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('age column appends custom items to the default menu', async ({ agIdFor, page }) => {
        // `sport` is row-grouped, so the top displayed rows are group rows without leaf cells;
        // just wait for the grid to render rather than asserting a specific leaf cell.
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('age').hover();
        await agIdFor.headerCellMenuButton('age').click();
        await expect(agIdFor.menu()).toBeVisible();
        // default item still present
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toBeVisible();
        // appended custom items
        await expect(page.locator('.ag-menu-option-text', { hasText: 'A Custom Item' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Custom Sub Menu' })).toBeVisible();
        await page.keyboard.press('Escape');
    });

    test.eachFramework('country column shows only custom items plus resetColumns', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('country').hover();
        await agIdFor.headerCellMenuButton('country').click();
        await expect(agIdFor.menu()).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'A Custom Item' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Another Custom Item' })).toBeVisible();
        // the single built-in item that was included
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Reset Columns' })).toBeVisible();
        // a default item that was NOT included is absent
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toHaveCount(0);
        await page.keyboard.press('Escape');
    });

    test.eachFramework('the value token aggregates Age on the group rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // the grid is grouped by sport, so the top-level rows are group rows
        const firstGroupAgeCell = page.locator('.ag-row[row-id^="row-group-"]').first().locator('[col-id="age"]');
        // age is not a value column yet, so the group rows show nothing for it
        await expect(firstGroupAgeCell).toHaveText('');

        await agIdFor.headerCell('age').hover();
        await agIdFor.headerCellMenuButton('age').click();
        await agIdFor.menuOption('Add Age to values').click();

        // age is now aggregated on the group rows
        await expect(firstGroupAgeCell).toContainText(/\d/);
    });

    test.eachFramework('year column removes separators, pinning and value aggregation', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('year').hover();
        await agIdFor.headerCellMenuButton('year').click();
        await expect(agIdFor.menu()).toBeVisible();

        // the three excluded entries are gone
        await expect(agIdFor.menu().locator('.ag-menu-separator')).toHaveCount(0);
        await expect(agIdFor.menuOption('Pin Column')).toHaveCount(0);
        await expect(agIdFor.menuOption('Value Aggregation')).toHaveCount(0);

        // the remaining default items are still shown
        await expect(agIdFor.menuOption('Sort Ascending')).toBeVisible();
        await expect(agIdFor.menuOption('Choose Columns')).toBeVisible();
        await expect(agIdFor.menuOption('Reset Columns')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('clicking a custom item logs to the console', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const logs: string[] = [];
        const handler = (msg: { type: () => string; text: () => string }) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        };
        page.on('console', handler);

        await agIdFor.headerCell('country').hover();
        await agIdFor.headerCellMenuButton('country').click();
        await agIdFor.menuOption('A Custom Item').click();

        // the log arrives over CDP asynchronously; retry until it is captured
        await expect(() => {
            expect(logs.some((l) => l.includes('A Custom Item selected'))).toBe(true);
        }).toPass();
        page.off('console', handler);
    });

    test.eachFramework('opens the custom sub menu on the age column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.headerCell('age').hover();
        await agIdFor.headerCellMenuButton('age').click();
        await expect(agIdFor.menu()).toBeVisible();

        await expect(agIdFor.menuOption('Black')).toHaveCount(0);
        await agIdFor.menuOption('Custom Sub Menu').hover();

        // the sub menu offers the three colour items
        await expect(agIdFor.menuOption('Black')).toBeVisible();
        await expect(agIdFor.menuOption('White')).toBeVisible();
        await expect(agIdFor.menuOption('Grey')).toBeVisible();
    });

    test.eachFramework('clicking a custom sub menu item logs to the console', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const logs: string[] = [];
        const handler = (msg: { type: () => string; text: () => string }) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        };
        page.on('console', handler);

        await agIdFor.headerCell('age').hover();
        await agIdFor.headerCellMenuButton('age').click();
        await agIdFor.menuOption('Custom Sub Menu').hover();
        await agIdFor.menuOption('Black').click();

        await expect(() => {
            expect(logs.some((l) => l.includes('Black was pressed'))).toBe(true);
        }).toPass();
        page.off('console', handler);
    });
});
