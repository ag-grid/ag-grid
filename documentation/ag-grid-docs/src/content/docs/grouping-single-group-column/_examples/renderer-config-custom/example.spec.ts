import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Custom group cell renderer', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const autoGroupCells = page.locator(`.ag-cell[col-id="${GROUP_AUTO_COLUMN_ID}"]`);

        // The custom renderer entirely replaces agGroupCellRenderer: it renders its own
        // .eGroupStatus arrow and .eValueContainer value span, and does NOT emit the default
        // group cell renderer chevron test-ids.
        await expect(page.locator('.eValueContainer').first()).toBeVisible();
        await expect(page.locator('.eGroupStatus').first()).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(null)).toHaveCount(0);
        await expect(agIdFor.autoGroupContracted(null)).toHaveCount(0);

        // The custom renderer shows the group value text in the group column
        await expect(autoGroupCells.first().locator('.eValueContainer')).not.toBeEmpty();

        // groupDefaultExpanded: 1 => top-level groups start expanded (arrow rotated 90deg)
        const firstArrow = page.locator('.eGroupStatus').first();
        await expect(firstArrow).toHaveAttribute('style', /rotate\(90deg\)/);

        // Clicking the custom arrow collapses the group (documented expand/collapse behaviour),
        // rotating the arrow back to 0deg
        await firstArrow.click();
        await expect(firstArrow).toHaveAttribute('style', /rotate\(0deg\)/);
    });
});
