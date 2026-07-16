import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        // groupDisplayType 'custom' with two showRowGroup columns: col-id '0' shows the
        // 'country' group level, col-id '1' shows the 'year' group level.
        const countryColId = '0';
        const yearColId = '1';
        await waitForGridContent(page);

        // Both custom group columns are visible under their headerNames.
        await expect(agIdFor.headerCell(countryColId)).toContainText('Country Groups');
        await expect(agIdFor.headerCell(yearColId)).toContainText('Year Groups');
        // Grouped source columns remain hidden.
        await expect(agIdFor.headerCell('country')).toHaveCount(0);
        await expect(agIdFor.headerCell('year')).toHaveCount(0);

        const usaId = 'row-group-country-United States';

        // The country value renders in the Country Groups column and is expandable there;
        // the Year Groups column is empty at the country level.
        await expect(agIdFor.cell(usaId, countryColId).first()).toContainText('United States');
        await expect(agIdFor.groupContracted(usaId, countryColId).first()).toBeVisible();
        await expect(agIdFor.cell(usaId, yearColId).first()).not.toContainText('United States');

        // Expand the country group - year sub-groups appear, displayed in the Year Groups column.
        await agIdFor.groupContracted(usaId, countryColId).first().click();
        await expect(agIdFor.groupExpanded(usaId, countryColId).first()).toBeVisible();
        const yearRow = page.locator(`.ag-row[row-id^="${usaId}-year-"]`).first();
        await expect(yearRow).toBeVisible();
        const yearRowId = await yearRow.getAttribute('row-id');
        const yearValue = yearRowId!.split('-year-')[1];
        // Year value shows in the Year Groups column, not the Country Groups column.
        await expect(agIdFor.cell(yearRowId, yearColId).first()).toContainText(yearValue);
        await expect(agIdFor.groupContracted(yearRowId, yearColId).first()).toBeVisible();
    });
});
