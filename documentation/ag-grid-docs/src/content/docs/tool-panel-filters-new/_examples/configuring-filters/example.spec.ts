import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const filterToolPanel = agIdFor.filterToolPanel();
        const addFilterButton = agIdFor.filterToolPanelAddFilterButton();
        await expect(filterToolPanel).toBeVisible();

        // The tool panel starts empty (only the add-filter card).
        const filterCards = filterToolPanel.locator('.ag-filter-card');
        await expect(filterCards).toHaveCount(1);

        // Add-filter list excludes Date (suppressFiltersToolPanel) and Total (filter: false).
        await addFilterButton.click();
        await expect(page.getByRole('option', { name: 'Athlete' })).toBeVisible();
        await expect(page.getByRole('option', { name: 'Age' })).toBeVisible();
        await expect(page.getByRole('option', { name: 'Country' })).toBeVisible();
        await expect(page.getByRole('option', { name: 'Year' })).toBeVisible();
        await expect(page.getByRole('option', { name: 'Date' })).toHaveCount(0);
        await expect(page.getByRole('option', { name: 'Total' })).toHaveCount(0);

        // Athlete has filter: 'agSetColumnFilter', so no filter-type dropdown is shown.
        await page.getByRole('option', { name: 'Athlete' }).locator('div').click();
        await expect(agIdFor.filterToolPanelFilterTypeSelector('Athlete')).toBeHidden();

        // Age uses agSelectableColumnFilter -> shows the three default grid filter options.
        await addFilterButton.click();
        await page.getByRole('option', { name: 'Age' }).locator('div').click();
        await agIdFor.filterToolPanelFilterTypeSelector('Age').click();
        const listItems = page.locator('.ag-list-item');
        await expect(listItems.filter({ hasText: 'Simple Filter' })).toBeVisible();
        await expect(listItems.filter({ hasText: 'Selection Filter' })).toBeVisible();
        await expect(listItems.filter({ hasText: 'Combo Filter' })).toBeVisible();
        await page.keyboard.press('Escape');

        // Country is configured to show the Set Filter (Selection) and the Text (Simple) filter.
        await addFilterButton.click();
        await page.getByRole('option', { name: 'Country' }).locator('div').click();
        await agIdFor.filterToolPanelFilterTypeSelector('Country').click();
        await expect(listItems.filter({ hasText: 'Selection Filter' })).toBeVisible();
        await expect(listItems.filter({ hasText: 'Simple Filter' })).toBeVisible();
        await page.keyboard.press('Escape');

        // Year is configured with a custom filter component alongside the Set Filter.
        await addFilterButton.click();
        await page.getByRole('option', { name: 'Year' }).locator('div').click();
        await agIdFor.filterToolPanelFilterTypeSelector('Year').click();
        await expect(listItems.filter({ hasText: 'Custom Filter' })).toBeVisible();
        await expect(listItems.filter({ hasText: 'Selection Filter' })).toBeVisible();
        await page.keyboard.press('Escape');

        // Filtering from the tool panel updates the grid: Age = 23 leaves only age-23 rows.
        const ageInput = agIdFor.numberFilterInstanceInput({ source: 'filter-toolpanel', colLabel: 'Age' });
        await ageInput.click();
        await ageInput.fill('23');
        await ageInput.press('Enter');
        const firstRowAge = page.locator('.ag-row').locator('[col-id="age"]').first();
        await expect(firstRowAge).toHaveText('23');
    });
});
