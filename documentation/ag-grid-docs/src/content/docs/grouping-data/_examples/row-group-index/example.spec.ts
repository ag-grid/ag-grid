import { expect, test } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // The auto group column is present.
        await expect(agIdFor.headerCell(GROUP_AUTO_COLUMN_ID)).toBeVisible();

        // rowGroupIndex 0 is `year`, so the top-level groups are years.
        const topGroupRow = page.locator('.ag-row-group.ag-row-level-0').first();
        await expect(topGroupRow).toBeVisible();

        const topGroupId = await topGroupRow.getAttribute('row-id');
        // Grouped by year first (rowGroupIndex 0).
        expect(topGroupId).toMatch(/^row-group-year-/);
        // Top-level group cell shows a 4-digit year and child count.
        await expect(agIdFor.autoGroupCell(topGroupId)).toContainText(/^\d{4}\s*\(\d+\)/, { useInnerText: true });

        // groupDefaultExpanded: 1 means the top (year) level is expanded by default,
        // revealing the second-level country groups underneath.
        await expect(agIdFor.autoGroupExpanded(topGroupId)).toBeVisible();

        const secondLevelGroup = page.locator('.ag-row-group.ag-row-level-1').first();
        await expect(secondLevelGroup).toBeVisible();
        const secondGroupId = await secondLevelGroup.getAttribute('row-id');
        // Second grouping level is country (rowGroupIndex 1).
        expect(secondGroupId).toMatch(/^row-group-year-.+-country-/);
        // Country groups are collapsed at this depth (only one level auto-expanded).
        await expect(agIdFor.autoGroupContracted(secondGroupId)).toBeVisible();

        // Collapsing the top year group hides the nested country groups.
        await agIdFor.groupExpanded(topGroupId, GROUP_AUTO_COLUMN_ID).click();
        await expect(agIdFor.autoGroupContracted(topGroupId)).toBeVisible();
    });
});
