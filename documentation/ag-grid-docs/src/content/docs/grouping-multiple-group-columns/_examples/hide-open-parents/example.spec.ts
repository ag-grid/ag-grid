import { expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

const COUNTRY_COL = 'ag-Grid-AutoColumn-country';
const YEAR_COL = 'ag-Grid-AutoColumn-year';

test.agExample(import.meta, () => {
    test.eachFramework('Hide open parents', async ({ agIdFor, page }) => {
        // One auto group column per grouped field.
        await expect(agIdFor.headerCell(COUNTRY_COL)).toBeVisible();
        await expect(agIdFor.headerCell(YEAR_COL)).toBeVisible();

        const australia = 'row-group-country-Australia';

        // Collapsed by default: the country group row is its own visible row, with an aggregated total.
        await expect(agIdFor.groupContracted(australia, COUNTRY_COL)).toBeVisible();
        await expect(agIdFor.cell(australia, 'total')).toContainText(/\d/);

        // groupHideOpenParents: true removes the open parent's own row when it is expanded.
        await agIdFor.groupContracted(australia, COUNTRY_COL).click();
        await waitForRowAnimations(page);
        await expect(agIdFor.rowNode(australia)).not.toBeVisible();
    });
});
