import { expect, test } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID, GROUP_HIERARCHY_COLUMN_ID_PREFIX as vcolPrefix } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // groupHierarchy ['year', 'week'] groups the `date` column by year first, then a
        // custom "week" component defined via groupHierarchyConfig.
        const yearGroupId = `row-group-${vcolPrefix}-date-year-2008`;

        // Top-level group is the year, with a child count.
        await expect(agIdFor.autoGroupCell(yearGroupId)).toContainText(/^2008\s*\(\d+\)/, { useInnerText: true });

        // `total` has aggFunc 'sum', so the group row shows an aggregated numeric total.
        await expect(agIdFor.cell(yearGroupId, 'total')).toContainText(/\d/);

        // rowGroupPanelShow: 'always' surfaces the grouped column as a chip in the panel.
        await expect(page.locator('.ag-column-drop-cell')).not.toHaveCount(0);

        // Groups are collapsed by default; expanding the year reveals the custom week sub-groups.
        await agIdFor.groupContracted(yearGroupId, GROUP_AUTO_COLUMN_ID).click();
        await expect(agIdFor.autoGroupExpanded(yearGroupId)).toBeVisible();

        const weekGroup = page.locator(`.ag-row-group[row-id^="${yearGroupId}-${vcolPrefix}-date-week-"]`).first();
        await expect(weekGroup).toBeVisible();
    });
});
