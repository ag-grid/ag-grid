import { expect, test } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // The auto group column is present (added because `country` has `rowGroup: true`).
        await expect(agIdFor.headerCell(GROUP_AUTO_COLUMN_ID)).toBeVisible();

        // Rows are grouped by country: group rows are rendered.
        const firstGroupRow = page.locator('.ag-row-group').first();
        await expect(firstGroupRow).toBeVisible();

        const groupRowId = await firstGroupRow.getAttribute('row-id');
        // Group id follows `row-group-{field}-{value}`, i.e. grouped by the country field.
        expect(groupRowId).toMatch(/^row-group-country-/);

        // The group cell is expandable and shows an aggregated child count in parentheses.
        await expect(agIdFor.autoGroupCell(groupRowId)).toContainText(/\(\d+\)/, { useInnerText: true });

        // Groups are collapsed by default (no groupDefaultExpanded set).
        await expect(agIdFor.autoGroupContracted(groupRowId)).toBeVisible();

        // Expanding the group reveals its leaf rows.
        await agIdFor.groupContracted(groupRowId, GROUP_AUTO_COLUMN_ID).click();
        await expect(agIdFor.autoGroupExpanded(groupRowId)).toBeVisible();

        // A leaf (non-group) row is now shown, carrying the ungrouped detail columns such as athlete.
        const leafRow = page.locator('.ag-row:not(.ag-row-group)').first();
        await expect(leafRow).toBeVisible();
        await expect(leafRow.locator('[col-id="athlete"]')).not.toBeEmpty();
    });
});
