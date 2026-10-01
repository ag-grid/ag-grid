import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const filterToolPanel = agIdFor.filterToolPanel();
        const addFilterButton = agIdFor.filterToolPanelAddFilterButton();
        await expect(filterToolPanel).toBeVisible();

        // validate order of filters in tool panel
        // count the number of ag-filter-card components
        const filterCards = filterToolPanel.locator('.ag-filter-card');
        expect(await filterCards.count()).toEqual(1);

        await addFilterButton.click();
        await page.getByRole('option', { name: 'Age' }).locator('div').click();

        const numberFilterInput = agIdFor.numberFilterInstanceInput({ source: 'filter-toolpanel', colLabel: 'Age' });
        await numberFilterInput.click();
        await numberFilterInput.fill('23');
        await numberFilterInput.press('Enter');

        await addFilterButton.click();
        await page.getByRole('option', { name: 'Country' }).locator('div').click();

        await agIdFor.filterToolPanelFilterTypeSelector('Country').click();

        await page.getByText('Selection Filter').click();

        await agIdFor
            .setFilterInstanceItem({ source: 'filter-toolpanel', colLabel: 'Country' }, '(Select All)')
            .uncheck();
        await agIdFor.setFilterInstanceItem({ source: 'filter-toolpanel', colLabel: 'Country' }, 'Argentina').check();

        // validate the rowIndex is 0 as the filter should have filtered out all other rows
        const firstCell = agIdFor.cell('1921', 'athlete');
        await expect(page.locator('.ag-row').filter({ has: firstCell }).first()).toHaveAttribute('row-index', '0');
        // assert age is 23 and country is Argentina
        await expect(firstCell).toHaveText('Juan Martín del Potro');
        await expect(agIdFor.cell('1921', 'age')).toHaveText('23');
        await expect(agIdFor.cell('1921', 'country')).toHaveText('Argentina');

        // Remove country filter
        const countryFilter = filterCards.nth(1);
        await expect(countryFilter.getByRole('button', { name: 'Country' })).toBeVisible();
        await countryFilter.getByRole('button', { name: 'Delete Filter' }).click();

        await expect(agIdFor.cell('0', 'athlete').first()).toHaveText('Michael Phelps');
        await expect(
            page
                .locator('.ag-row')
                .filter({ has: agIdFor.cell('0', 'athlete').first() })
                .first()
        ).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Floating filter row renders for every column', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // defaultColDef.floatingFilter = true, so every column gets a floating filter.
        for (const colId of ['athlete', 'age', 'country', 'date', 'total']) {
            await expect(agIdFor.floatingFilter(colId)).toBeVisible();
        }

        // The athlete floating filter is a text input as the column uses the simple filter.
        await expect(agIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'athlete' })).toBeVisible();
    });

    test.eachFramework('Add filter dropdown lists every filterable column', async ({ page, agIdFor }) => {
        const filterToolPanel = agIdFor.filterToolPanel();
        await expect(filterToolPanel).toBeVisible();

        // Baseline: nothing has been added yet, only the add-filter card is present.
        await expect(filterToolPanel.locator('.ag-filter-card')).toHaveCount(1);

        await agIdFor.filterToolPanelAddFilterButton().click();

        // Every column is filterable via defaultColDef, so all five are offered.
        await expect(page.getByRole('option')).toHaveCount(5);
        for (const name of ['Athlete', 'Age', 'Country', 'Date', 'Total']) {
            await expect(page.getByRole('option', { name })).toBeVisible();
        }
    });

    test.eachFramework('Filter set outside the tool panel is added to the tool panel', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const filterToolPanel = agIdFor.filterToolPanel();
        const filterCards = filterToolPanel.locator('.ag-filter-card');
        await expect(filterCards).toHaveCount(1);

        // Set the athlete filter from outside the tool panel, via the floating filter.
        const floatingInput = agIdFor.textFilterInstanceInput({ source: 'floating-filter', colId: 'athlete' });
        await floatingInput.fill('Alicia Coutts');
        await floatingInput.press('Enter');

        // The grid is filtered...
        await expect(agIdFor.cell('5', 'athlete')).toContainText('Alicia Coutts');
        // ...and a card for Athlete has automatically appeared in the tool panel.
        await expect(filterCards).toHaveCount(2);
        await expect(filterCards.nth(0).getByRole('button', { name: 'Athlete' })).toBeVisible();

        // The card remains once the filter is cleared, as it was not removed from the panel.
        await floatingInput.fill('');
        await floatingInput.press('Enter');
        await expect(agIdFor.cell('0', 'athlete').first()).toContainText('Michael Phelps');
        await expect(filterCards).toHaveCount(2);
    });
});
