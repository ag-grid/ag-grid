import { expect, test } from '@utils/grid/test-utils';
import { a } from 'vitest/dist/chunks/suite.B2jumIFP.js';

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
        await expect(agIdFor.cell('0', 'athlete').first().locator('..')).toHaveAttribute('row-index', '0');

        await filterToolPanel.getByRole('button', { name: 'Apply' }).click();

        // validate the rowIndex is 0 as the filter should have filtered out all other rows
        const firstCell = agIdFor.cell('1921', 'athlete');
        await expect(firstCell.locator('..')).toHaveAttribute('row-index', '0');
        // assert age is 23 and country is Argentina
        await expect(firstCell).toHaveText('Juan Martín del Potro');
        await expect(agIdFor.cell('1921', 'age')).toHaveText('23');
        await expect(agIdFor.cell('1921', 'country')).toHaveText('Argentina');
    });
});
