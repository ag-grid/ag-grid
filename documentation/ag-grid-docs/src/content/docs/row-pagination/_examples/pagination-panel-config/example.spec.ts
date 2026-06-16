import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Panel-level page size overrides the grid-level option', async ({ agIdFor }) => {
        // Grid-level paginationPageSize is 20, but the pageSize panel sets it to 100.
        await expect(agIdFor.paginationPanelSizePickerDisplay('100')).toBeVisible();
    });
});
