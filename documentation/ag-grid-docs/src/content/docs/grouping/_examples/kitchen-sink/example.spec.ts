import { expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // The row group panel (rowGroupPanelShow: 'always') shows the two grouped columns.
        const rowGroupsArea = agIdFor.columnDropArea('panel', 'Row Groups');
        await expect(rowGroupsArea).toBeVisible();
        await expect(rowGroupsArea.locator('.ag-column-drop-cell')).toHaveCount(2);
        await expect(rowGroupsArea.getByText('Country', { exact: true })).toBeVisible();
        await expect(rowGroupsArea.getByText('Year', { exact: true })).toBeVisible();

        // Default groupDisplayType renders a single auto group column.
        await expect(agIdFor.headerCell(GROUP_AUTO_COLUMN_ID)).toBeVisible();

        // Grouping by country produces a group row per unique country, with a count of contained rows.
        const usRowId = 'row-group-country-United States';
        await expect(agIdFor.autoGroupCell(usRowId)).toContainText('United States', { useInnerText: true });
        // Count suffix, e.g. "United States (N)".
        await expect(agIdFor.autoGroupCell(usRowId)).toContainText(/\(\d+\)/, { useInnerText: true });

        // groupDefaultExpanded: 1 means the country groups start expanded.
        await expect(agIdFor.autoGroupExpanded(usRowId)).toBeVisible();

        // Collapsing the country group toggles it to the contracted state.
        await agIdFor.autoGroupExpanded(usRowId).click();
        await waitForRowAnimations(page);
        await expect(agIdFor.autoGroupContracted(usRowId)).toBeVisible();
    });
});
