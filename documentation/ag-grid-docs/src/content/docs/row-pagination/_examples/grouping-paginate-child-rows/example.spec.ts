import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Shows grouped rows paginated to 10 rows', async ({ agIdFor, page }) => {
        // First group is "United States"
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });

        // Page 1 with page size 10
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();

        // Exactly 10 rows visible on the page
        const rows = page.locator('.ag-row[row-index]');
        await expect(rows).toHaveCount(10);
    });

    test.eachFramework('Expanding group keeps 10 rows per page', async ({ agIdFor, page }) => {
        // Count rows before expand
        const rows = page.locator('.ag-row[row-index]');
        await expect(rows).toHaveCount(10);

        // Expand "United States" group
        await agIdFor.autoGroupContracted('row-group-country-United States').click();

        // paginateChildRows: true means total rows on page stays at 10
        await expect(rows).toHaveCount(10);

        // Still on page 1
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();
    });
});
