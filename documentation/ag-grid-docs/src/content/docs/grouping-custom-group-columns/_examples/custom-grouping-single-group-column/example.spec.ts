import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        // groupDisplayType 'custom' with a single showRowGroup column renders all group
        // levels (country then year) in one user-defined column with col-id '0'.
        const groupColId = '0';
        await waitForGridContent(page);

        // The custom group column is present under its headerName; the grouped source
        // columns (country, year) are hidden so have no header cells.
        await expect(agIdFor.headerCell(groupColId)).toBeVisible();
        await expect(agIdFor.headerCell(groupColId)).toContainText('Group');
        await expect(agIdFor.headerCell('country')).toHaveCount(0);
        await expect(agIdFor.headerCell('year')).toHaveCount(0);

        // Top-level country groups are displayed in the custom group column.
        const usaId = 'row-group-country-United States';
        await expect(agIdFor.cell(usaId, groupColId).first()).toContainText('United States');

        // Group cell is expandable and starts contracted.
        await expect(agIdFor.groupContracted(usaId, groupColId).first()).toBeVisible();

        // Expanding the country group reveals the year sub-groups in the SAME column.
        await agIdFor.groupContracted(usaId, groupColId).first().click();
        await expect(agIdFor.groupExpanded(usaId, groupColId).first()).toBeVisible();
        const yearGroup = page.locator(`.ag-row[row-id^="${usaId}-year-"]`).first();
        await expect(yearGroup).toBeVisible();
        await expect(yearGroup.locator(`[col-id="${groupColId}"]`)).toHaveCount(1);
    });
});
