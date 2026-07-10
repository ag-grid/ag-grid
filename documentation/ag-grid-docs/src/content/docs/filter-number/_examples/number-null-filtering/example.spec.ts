import { expect, test } from '@utils/grid/test-utils';

// Row data (fixed): Alberto=36 (id 0), Niall=40 (id 1), Sean=null (id 2), Robert=undefined (id 3).
test.agExample(import.meta, () => {
    test.eachFramework('Blank cells excluded from lessThan by default', async ({ page, agIdFor }) => {
        const filterButton = agIdFor.headerFilterButton('age');
        await expect(filterButton).toBeVisible();
        await filterButton.click();

        await agIdFor.filterInstancePickerDisplay({ source: 'column-filter' }).click();
        await page.getByText('Less than', { exact: true }).click();

        await agIdFor.numberFilterInstanceInput({ source: 'column-filter' }).fill('40');

        // close the filter popup
        await agIdFor.cell('0', 'age').click();

        // Only Alberto (36 < 40) remains; blanks excluded by default.
        await expect(agIdFor.cell('0', 'age')).toContainText('36');
        await expect(agIdFor.rowNode('1')).not.toBeVisible();
        await expect(agIdFor.rowNode('2')).not.toBeVisible();
        await expect(agIdFor.rowNode('3')).not.toBeVisible();
    });

    test.eachFramework('includeBlanksInLessThan toggle includes blank rows', async ({ page, agIdFor }) => {
        const filterButton = agIdFor.headerFilterButton('age');
        await filterButton.click();

        await agIdFor.filterInstancePickerDisplay({ source: 'column-filter' }).click();
        await page.getByText('Less than', { exact: true }).click();

        await agIdFor.numberFilterInstanceInput({ source: 'column-filter' }).fill('40');
        await agIdFor.cell('0', 'age').click();

        // Blank rows (Sean, Robert) are excluded before the toggle.
        await expect(agIdFor.rowNode('2')).not.toBeVisible();
        await expect(agIdFor.rowNode('3')).not.toBeVisible();

        // Toggle includeBlanksInLessThan on, which re-applies the filter.
        await page.locator('#checkboxLessThan').check();

        // Alberto (36) plus both blank rows are now shown.
        await expect(agIdFor.cell('0', 'age')).toContainText('36');
        await expect(agIdFor.rowNode('2')).toBeVisible();
        await expect(agIdFor.rowNode('3')).toBeVisible();
        // Niall (40) is still excluded (40 is not < 40 and is not blank).
        await expect(agIdFor.rowNode('1')).not.toBeVisible();
    });
});
