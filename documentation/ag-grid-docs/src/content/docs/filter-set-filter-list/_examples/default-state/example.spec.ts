import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const selectAllItem = (page: any) =>
    page.locator('.ag-set-filter').first().locator('.ag-set-filter-item').filter({ hasText: '(Select All)' }).first();

test.agExample(import.meta, () => {
    test.eachFramework(
        'Athlete filter starts fully selected; clearing it hides all rows',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await agIdFor.floatingFilterButton('athlete').click();
            const selectAll = selectAllItem(page);
            await expect(selectAll.locator('.ag-checkbox-input')).toBeChecked();

            // Deselecting everything leaves no values selected, filtering out all rows.
            await selectAll.click();
            await page.keyboard.press('Escape');
            await expect(page.locator('.ag-row')).toHaveCount(0);
        }
    );

    test.eachFramework('Country filter starts with nothing selected and does not filter', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // defaultToNothingSelected: true => (Select All) is unchecked when first opened.
        await agIdFor.floatingFilterButton('country').click();
        await expect(selectAllItem(page).locator('.ag-checkbox-input')).not.toBeChecked();

        // No filtering occurs until a value is chosen, so the data is still shown.
        await page.keyboard.press('Escape');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
