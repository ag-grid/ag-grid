import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Single group column configuration', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const autoHeader = agIdFor.headerCell(GROUP_AUTO_COLUMN_ID);

        // headerName override
        await expect(autoHeader).toContainText('My Group');

        // minWidth: 220 applied to the auto group column
        const headerBox = await autoHeader.boundingBox();
        expect(headerBox!.width).toBeGreaterThanOrEqual(220);

        // suppressCount: true removes the child-count value from group cells (the count
        // container is rendered but empty rather than showing e.g. "(123)")
        await expect(
            page.locator(`.ag-cell[col-id="${GROUP_AUTO_COLUMN_ID}"] .ag-group-child-count`).first()
        ).toBeEmpty();

        // field: 'athlete' => leaf-level rows display the athlete value in the group column.
        // groupDefaultExpanded: -1 expands everything, so leaf rows (level 2) are rendered.
        const leafAutoCell = page.locator(`.ag-row-level-2 .ag-cell[col-id="${GROUP_AUTO_COLUMN_ID}"]`).first();
        await expect(leafAutoCell).toBeVisible();
        await expect(leafAutoCell).not.toBeEmpty();
    });
});
