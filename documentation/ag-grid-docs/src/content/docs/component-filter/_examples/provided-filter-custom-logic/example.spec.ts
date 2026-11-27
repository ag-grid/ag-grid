import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Row-id 0 is Michael Phelps aged 23, row-id 1 is Michael Phelps aged 19.

test.agExample(import.meta, () => {
    test.eachFramework('selecting the Under 20 band keeps only athletes younger than 20', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        await expect(agIdFor.cell('0', 'age')).toContainText('23');

        await agIdFor.floatingFilterButton('age').click();
        const setFilter = page.locator('.ag-set-filter');
        await expect(setFilter.locator('.ag-set-filter-item')).toHaveText([
            '(Select All)',
            'Under 20',
            '20 to 29',
            '30 and over',
        ]);
        const itemCheckbox = (label: string) =>
            setFilter.locator('.ag-set-filter-item').filter({ hasText: label }).locator('.ag-checkbox-input');

        await itemCheckbox('(Select All)').click();
        await itemCheckbox('Under 20').click();
        await page.keyboard.press('Escape');

        await expect(agIdFor.cell('0', 'age')).not.toBeVisible();
        await expect(agIdFor.cell('1', 'age')).toContainText('19');
        await expect(page.locator('.ag-set-floating-filter-input input')).toHaveValue('(1) Under 20');
    });

    test.eachFramework('the Mini Filter searches the band labels', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('age').click();
        const setFilter = page.locator('.ag-set-filter');
        await setFilter.locator('input').first().fill('30');

        await expect(setFilter.locator('.ag-set-filter-item')).toHaveText(['(Select All)', '30 and over']);
    });
});
