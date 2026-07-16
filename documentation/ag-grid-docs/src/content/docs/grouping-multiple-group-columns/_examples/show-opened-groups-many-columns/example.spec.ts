import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const countryColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const yearColId = `${GROUP_AUTO_COLUMN_ID}-year`;
        await waitForGridContent(page);

        // The United States country group cell shows its own value in the country group column
        await expect(agIdFor.cell('row-group-country-United States', countryColId).first()).toContainText(
            'United States',
            { useInnerText: true }
        );

        // showOpenedGroup: true surfaces the opened parent (country) value in the country
        // group column on the child year group row, alongside the year value in its own column
        await expect(agIdFor.cell('row-group-country-United States-year-2008', countryColId).first()).toContainText(
            'United States',
            { useInnerText: true }
        );
        await expect(agIdFor.cell('row-group-country-United States-year-2008', yearColId).first()).toContainText(
            '2008',
            { useInnerText: true }
        );
    });
});
