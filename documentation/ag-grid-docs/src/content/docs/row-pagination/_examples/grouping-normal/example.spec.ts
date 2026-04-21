import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Shows grouped rows with pagination', async ({ agIdFor }) => {
        // First country group in data order is "United States"
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });

        // Pagination shows page 1
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();
    });

    test.eachFramework('Expanding group does not change page', async ({ agIdFor }) => {
        // Expand "United States" group
        await agIdFor.autoGroupContracted('row-group-country-United States').click();

        // Still on page 1 — children appear inline
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();

        // Child group rows (year) are now visible under United States
        await expect(agIdFor.autoGroupCell('row-group-country-United States-year-2008')).toContainText('2008', {
            useInnerText: true,
        });
    });
});
