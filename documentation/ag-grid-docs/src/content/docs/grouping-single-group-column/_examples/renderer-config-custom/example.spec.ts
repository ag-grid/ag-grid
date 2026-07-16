import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Custom group cell renderer', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const autoGroupCells = page.locator(`.ag-cell[col-id="${GROUP_AUTO_COLUMN_ID}"]`);
        const firstCell = autoGroupCells.first();
        // The custom renderer replaces agGroupCellRenderer with its own arrow (a div with a
        // rotate transform) plus the group value text — the selector is framework-agnostic
        // because the arrow is identified by its inline rotate style, not by a class name.
        const firstArrow = firstCell.locator('div[style*="rotate"]');

        // Custom arrow is rendered, and the default group cell chevron test-ids are NOT emitted.
        await expect(firstArrow).toBeVisible();
        await expect(agIdFor.autoGroupExpanded(null)).toHaveCount(0);
        await expect(agIdFor.autoGroupContracted(null)).toHaveCount(0);

        // The custom renderer shows the group value text (a country name) in the group column.
        await expect(firstCell).toHaveText(/[A-Za-z]/, { useInnerText: true });

        // groupDefaultExpanded: 1 => top-level groups start expanded (arrow rotated 90deg)
        await expect(firstArrow).toHaveAttribute('style', /rotate\(90deg\)/);

        // Clicking the custom arrow collapses the group (documented expand/collapse behaviour),
        // rotating the arrow back to 0deg
        await firstArrow.click();
        await expect(firstArrow).toHaveAttribute('style', /rotate\(0deg\)/);
    });
});
