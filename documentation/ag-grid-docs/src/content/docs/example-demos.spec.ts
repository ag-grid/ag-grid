import { expect, test } from '@playwright/test';
import { setupConsoleExpectations } from '@utils/grid/test-utils';

// These could be extended to actually interact with the examples more
// but for now just a basic load test to ensure no errors / warnings in console
// and the grid loads without issues

test.describe(`Demo Examples`, async () => {
    let errors: string[];

    test.beforeEach(async ({ page }) => {
        errors = setupConsoleExpectations(page);
    });

    test.afterEach(async () => {
        expect(errors, 'Example Errors').toEqual([]);
    });

    test('example', async ({ page }) => {
        await page.goto('example');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await page.waitForTimeout(1000);

        await page.locator('button').filter({ hasText: 'Rows, 22 Cols' }).click();
        await page.getByText('1,000 Rows, 22 Cols').click();
        await page.locator('button').filter({ hasText: 'Quartz' }).click();
        await page.getByText('Balham').click();
        await page.getByRole('textbox', { name: 'Filter:' }).click();
        await page.getByRole('textbox', { name: 'Filter:' }).fill('');
        await page.getByText('Drag here to set row groups').first().click();
        await page.getByRole('grid').getByText('Country').click();
        await page.locator('.ag-cell-label-container.ag-header-cell-sorted-asc > .ag-header-icon > .ag-icon').click();
        await page.getByText('Group by Country').click();
        await page.getByRole('tab', { name: 'Columns' }).click();
    });

    test('example-finance', async ({ page }) => {
        await page.goto('example-finance');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await page.waitForTimeout(1000);

        await page
            .locator(
                '.ag-header-cell.ag-header-parent-hidden.ag-header-cell-sortable.ag-right-aligned-header > .ag-header-cell-comp-wrapper > .ag-cell-label-container > .ag-header-icon.ag-header-cell-menu-button > .ag-icon'
            )
            .first()
            .click();
        await page.getByText('Group by Instrument').click();
        await page.locator('.ag-icon.ag-icon-menu-alt').first().click();
        await page.getByText('Collapse All Row Groups').click();
    });

    test('example-hr', async ({ page }) => {
        await page.goto('example-hr');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await page.waitForTimeout(1000);
        await page
            .locator(
                '.ag-cell-wrapper.ag-cell-expandable.ag-row-group.ag-row-group-indent-1 > .ag-group-expanded > .ag-icon'
            )
            .first()
            .click();
        await page.getByRole('columnheader', { name: 'Department' }).locator('div').nth(3).click();
        await page.getByRole('columnheader', { name: 'Department' }).locator('div').nth(3).click();
    });

    test('example-inventory', async ({ page }) => {
        await page.goto('example-inventory');
        await page.waitForSelector('.ag-root-wrapper', { state: 'visible' });
        await page.waitForTimeout(1000);

        await page.getByRole('textbox', { name: 'Search product...' }).fill('Lon');
        await page.getByRole('button', { name: 'Active' }).click();
        await page.getByRole('button', { name: 'On Hold' }).click();
        await page.getByRole('button', { name: 'Out of Stock' }).click();
        await page.getByRole('button', { name: 'All' }).click();
    });
});
