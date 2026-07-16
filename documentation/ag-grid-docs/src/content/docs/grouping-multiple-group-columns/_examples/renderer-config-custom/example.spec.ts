import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        const countryColId = `${GROUP_AUTO_COLUMN_ID}-country`;
        const yearColId = `${GROUP_AUTO_COLUMN_ID}-year`;
        await waitForGridContent(page);

        // autoGroupColumnDef.cellRenderer fully replaces the group cell with the custom component,
        // which renders its own expand arrow (a div with a rotate transform) and the value text.
        // The arrow is matched by its inline rotate style so the selector works across frameworks.
        const usCell = agIdFor.cell('row-group-country-United States', countryColId).first();
        await expect(usCell.locator('div[style*="rotate"]')).toBeVisible();
        await expect(usCell).toContainText('United States', { useInnerText: true });

        // Top level expanded by default (groupDefaultExpanded: 1): child year group rows visible
        await expect(agIdFor.cell('row-group-country-United States-year-2008', yearColId).first()).toBeVisible();

        // onCellDoubleClicked toggles expansion on the group column; collapsing hides the children
        await usCell.dblclick();
        await expect(agIdFor.cell('row-group-country-United States-year-2008', yearColId)).toHaveCount(0);
    });
});
