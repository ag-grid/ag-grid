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

        // Filter not applied as Apply button has not been clicked
        await expect(agIdFor.cell('0', 'athlete').first()).toHaveText('Michael Phelps');
        await expect(
            page
                .locator('.ag-row')
                .filter({ has: agIdFor.cell('0', 'athlete').first() })
                .first()
        ).toHaveAttribute('row-index', '0');

        await filterToolPanel.getByRole('button', { name: 'Apply' }).click();

        // validate the rowIndex is 0 as the filter should have filtered out all other rows
        const firstCell = agIdFor.cell('1921', 'athlete');
        await expect(page.locator('.ag-row').filter({ has: firstCell }).first()).toHaveAttribute('row-index', '0');
        // assert age is 23 and country is Argentina
        await expect(firstCell).toHaveText('Juan Martín del Potro');
        await expect(agIdFor.cell('1921', 'age')).toHaveText('23');
        await expect(agIdFor.cell('1921', 'country')).toHaveText('Argentina');
    });

    test.eachFramework('Cancel discards unapplied changes to the filters', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const filterToolPanel = agIdFor.filterToolPanel();
        await expect(filterToolPanel).toBeVisible();

        await agIdFor.filterToolPanelAddFilterButton().click();
        await page.getByRole('option', { name: 'Age' }).locator('div').click();

        const ageInput = agIdFor.numberFilterInstanceInput({ source: 'filter-toolpanel', colLabel: 'Age' });
        await ageInput.fill('23');
        await filterToolPanel.getByRole('button', { name: 'Apply' }).click();

        // Age = 23 is applied - row 1 (age 19) is filtered out.
        await expect(agIdFor.cell('0', 'age').first()).toContainText('23');
        await expect(agIdFor.cell('1', 'age')).not.toBeVisible();

        // Edit the filter value without applying it, then Cancel.
        await ageInput.fill('24');
        await filterToolPanel.getByRole('button', { name: 'Cancel' }).click();

        // The panel reverts to the applied model...
        await expect(ageInput).toHaveValue('23');
        // ...and the grid is still filtered on age 23.
        await expect(agIdFor.cell('0', 'age').first()).toContainText('23');
        await expect(agIdFor.cell('1', 'age')).not.toBeVisible();
    });

    test.eachFramework('Only the global buttons show inside the tool panel', async ({ page, agIdFor }) => {
        const filterToolPanel = agIdFor.filterToolPanel();
        await expect(filterToolPanel).toBeVisible();

        await agIdFor.filterToolPanelAddFilterButton().click();
        await page.getByRole('option', { name: 'Age' }).locator('div').click();

        // The tool panel shows the global buttons configured via toolPanelParams...
        await expect(filterToolPanel.getByRole('button', { name: 'Apply' })).toBeVisible();
        await expect(filterToolPanel.getByRole('button', { name: 'Cancel' })).toBeVisible();
        // ...and the filter's own buttons are not rendered inside the filter card.
        await expect(
            agIdFor.setFilterApplyPanelButton({ source: 'filter-toolpanel', colLabel: 'Age' }, 'Apply')
        ).toHaveCount(0);

        // The same filter instance does show its own Apply button in the column menu.
        await agIdFor.headerFilterButton('age').click();
        await expect(agIdFor.setFilterApplyPanelButton({ source: 'column-filter' }, 'Apply')).toBeVisible();
    });
});
