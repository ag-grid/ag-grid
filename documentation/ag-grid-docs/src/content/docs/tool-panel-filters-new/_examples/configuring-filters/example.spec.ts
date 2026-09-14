import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

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

    test.eachFramework("Switching Country's filter type swaps the rendered filter", async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        await agIdFor.filterToolPanelAddFilterButton().click();
        await page.getByRole('option', { name: 'Country' }).locator('div').click();

        const miniFilter = agIdFor.setFilterInstanceMiniFilterInput({
            source: 'filter-toolpanel',
            colLabel: 'Country',
        });
        const textInput = agIdFor.textFilterInstanceInput({ source: 'filter-toolpanel', colLabel: 'Country' });

        // Country lists the Set Filter first, so the Selection Filter is rendered by default.
        await expect(miniFilter).toBeVisible();
        await expect(textInput).toHaveCount(0);

        // Selecting the Simple Filter swaps the rendered filter UI.
        await agIdFor.filterToolPanelFilterTypeSelector('Country').click();
        await page.locator('.ag-list-item').filter({ hasText: 'Simple Filter' }).click();
        await expect(textInput).toBeVisible();
        await expect(miniFilter).toHaveCount(0);

        // The swapped-in filter drives the grid.
        await textInput.fill('Argentina');
        await textInput.press('Enter');
        await expect(page.locator('.ag-row').locator('[col-id="country"]').first()).toContainText('Argentina');
    });

    test.eachFramework('The custom Year filter can be selected and applied', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        await agIdFor.filterToolPanelAddFilterButton().click();
        await page.getByRole('option', { name: 'Year' }).locator('div').click();

        const yearFilter = page.locator('.year-filter');
        // The custom component is listed first, so it renders by default.
        await expect(yearFilter).toContainText('Select Year Range');

        // Switching to the Selection Filter replaces it...
        await agIdFor.filterToolPanelFilterTypeSelector('Year').click();
        await page.locator('.ag-list-item').filter({ hasText: 'Selection Filter' }).click();
        await expect(yearFilter).toHaveCount(0);

        // ...and selecting the Custom Filter renders it again.
        await agIdFor.filterToolPanelFilterTypeSelector('Year').click();
        await page.locator('.ag-list-item').filter({ hasText: 'Custom Filter' }).click();
        await expect(yearFilter).toContainText('Select Year Range');

        // Row 0 is a 2008 record, row 2 a 2012 one.
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');

        // The custom filter's doesFilterPass keeps only years after 2010.
        await yearFilter.locator('label').filter({ hasText: 'Since 2010' }).locator('input').check();
        await expect(agIdFor.cell('0', 'year')).not.toBeVisible();
        await expect(agIdFor.cell('2', 'year')).toContainText('2012');
    });
});
