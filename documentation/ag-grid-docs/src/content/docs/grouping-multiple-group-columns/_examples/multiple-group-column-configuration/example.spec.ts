import { expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

const COUNTRY_COL = 'ag-Grid-AutoColumn-country';
const YEAR_COL = 'ag-Grid-AutoColumn-year';

test.agExample(import.meta, () => {
    test.eachFramework('Multiple configured group columns', async ({ agIdFor, page }) => {
        // groupDisplayType: 'multipleColumns' produces one auto group column per grouped field.
        // headerValueGetter appends " Group Column" to each header name.
        await expect(agIdFor.headerCell(COUNTRY_COL)).toContainText('Country Group Column');
        await expect(agIdFor.headerCell(YEAR_COL)).toContainText('Year Group Column');

        // Top level groups are collapsed by default.
        const australia = 'row-group-country-Australia';
        await expect(agIdFor.groupContracted(australia, COUNTRY_COL)).toBeVisible();

        // suppressCount removes the "(n)" child count from the group cell.
        await expect(agIdFor.cell(australia, COUNTRY_COL)).not.toContainText('(');

        // Expanding via the chevron in the country group column reveals its children.
        await agIdFor.groupContracted(australia, COUNTRY_COL).click();
        await waitForRowAnimations(page);
        await expect(agIdFor.groupExpanded(australia, COUNTRY_COL)).toBeVisible();
    });
});
