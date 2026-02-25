import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const countryColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const yearColId = `${GROUP_AUTO_COLUMN_ID}-year`;
        const sportColId = `${GROUP_AUTO_COLUMN_ID}-sport`;
        await waitForGridContent(page);

        // Initially only the country group column is visible
        await expect(agIdFor.headerCell(countryColId)).toBeVisible();
        await expect(agIdFor.headerCell(yearColId)).not.toBeVisible();
        await expect(agIdFor.headerCell(sportColId)).not.toBeVisible();

        // Expand a country group - reveals the year group column
        await agIdFor.groupContracted('row-group-country-Canada', countryColId).first().click();
        await expect(agIdFor.headerCell(yearColId)).toBeVisible();
        await expect(agIdFor.headerCell(sportColId)).not.toBeVisible();

        // Expand a year group - reveals the sport group column
        await agIdFor.groupContracted('row-group-country-Canada-year-2006', yearColId).first().click();
        await expect(agIdFor.headerCell(sportColId)).toBeVisible();

        // Collapse the year group - sport column hides again
        await agIdFor.groupExpanded('row-group-country-Canada-year-2006', yearColId).first().click();
        await expect(agIdFor.headerCell(sportColId)).not.toBeVisible();

        // Collapse the country group - year column hides again
        await agIdFor.groupExpanded('row-group-country-Canada', countryColId).first().click();
        await expect(agIdFor.headerCell(yearColId)).not.toBeVisible();
    });
});
