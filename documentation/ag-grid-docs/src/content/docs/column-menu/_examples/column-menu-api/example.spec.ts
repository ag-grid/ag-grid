import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('buttons show the column menu', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // showColumnMenu('age') opens the age column menu
        await page.locator('button', { hasText: 'Show Age Column Menu' }).click();
        await expect(agIdFor.menu()).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('buttons show the column filter, not the column menu', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // showColumnFilter('age') opens the filter popup on its own - the column menu is not shown.
        // Assert on the filter popup container rather than a filter-type-specific input: the generated
        // vanilla variant loads the whole enterprise bundle, so `filter: true` there resolves to the Set
        // Filter instead of the NumberFilterModule this example registers.
        await page.locator('button', { hasText: 'Show Age Filter' }).click();
        await expect(page.locator('.ag-filter-menu')).toBeVisible();
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('columnMenuVisibleChanged fires on open and on close', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        const logs: string[] = [];
        const handler = (msg: { type: () => string; text: () => string }) => {
            if (msg.type() === 'log' && msg.text().includes('columnMenuVisibleChanged')) {
                logs.push(msg.text());
            }
        };
        page.on('console', handler);

        // opening the menu emits the event once
        await page.locator('button', { hasText: 'Show Age Column Menu' }).click();
        await expect(agIdFor.menu()).toBeVisible();
        await expect(() => {
            expect(logs.length).toBeGreaterThanOrEqual(1);
        }).toPass();

        // clicking outside the menu closes it, emitting the event again
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.menu()).toHaveCount(0);
        await expect(() => {
            expect(logs.length).toBeGreaterThanOrEqual(2);
        }).toPass();
        page.off('console', handler);
    });
});
