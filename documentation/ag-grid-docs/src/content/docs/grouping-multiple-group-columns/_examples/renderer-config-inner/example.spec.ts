import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const totalColId = `${GROUP_AUTO_COLUMN_ID}-total`;
        await waitForGridContent(page);

        // autoGroupColumnDef.headerName overrides the group column header
        await expect(agIdFor.headerCell(totalColId)).toContainText('Gold Medals');

        // The custom innerRenderer draws one gold-star image per medal (group key = total)
        const totalOneCell = agIdFor.cell('row-group-total-1', totalColId).first();
        await expect(totalOneCell.locator('img.medalIcon')).toHaveCount(1);

        const totalTwoCell = agIdFor.cell('row-group-total-2', totalColId).first();
        await expect(totalTwoCell.locator('img.medalIcon')).toHaveCount(2);

        // suppressCount: true removes the group child-count suffix from the group cell
        await expect(totalOneCell).not.toContainText('(');
    });
});
