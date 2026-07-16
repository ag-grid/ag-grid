import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const countryColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const yearColId = `${GROUP_AUTO_COLUMN_ID}-year`;
        await waitForGridContent(page);

        // groupDisplayType 'multipleColumns' renders one group column per grouped column
        await expect(agIdFor.headerCell(countryColId)).toBeVisible();
        await expect(agIdFor.headerCell(yearColId)).toBeVisible();

        // Top level (country) is expanded by default (groupDefaultExpanded: 1)
        await expect(agIdFor.groupExpanded('row-group-country-United States', countryColId).first()).toBeVisible();
        await expect(agIdFor.cell('row-group-country-United States', countryColId).first()).toContainText(
            'United States',
            { useInnerText: true }
        );

        // The year group value is displayed in its own (year) group column
        await expect(agIdFor.cell('row-group-country-United States-year-2008', yearColId).first()).toContainText(
            '2008',
            { useInnerText: true }
        );
    });
});
