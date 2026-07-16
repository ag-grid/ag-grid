import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { SELECTION_COLUMN_ID } from 'ag-grid-community';

const usa = 'row-group-country-United States';

test.agExample(import.meta, () => {
    test.eachFramework(
        'checkboxLocation autoGroupColumn renders checkboxes in the group cell',
        async ({ page, agIdFor }) => {
            await waitForGridContent(page);

            // With checkboxLocation 'autoGroupColumn' there is no separate selection column;
            // the selection checkbox is rendered inside the auto group column cell instead.
            await expect(agIdFor.headerCell(SELECTION_COLUMN_ID)).toHaveCount(0);

            const usaCheckbox = agIdFor.autoGroupColumnCheckbox(usa).first();
            await expect(usaCheckbox).toBeVisible();

            // The checkbox sits within the auto group column cell (alongside the expand chevron).
            await expect(
                agIdFor.autoGroupCell(usa).first().locator('[data-testid^="ag-selection-checkbox"]')
            ).toHaveCount(1);

            // Clicking the in-cell checkbox selects the group row (groupSelects 'self').
            await usaCheckbox.click();
            await expect(agIdFor.rowNode(usa).first()).toHaveClass(/ag-row-selected/);
        }
    );
});
