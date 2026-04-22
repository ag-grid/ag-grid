import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        const rowGroupsArea = agIdFor.columnDropArea('panel', 'Row Groups');

        // Row group panel shows the two pills configured with `rowGroup: true`.
        await expect(rowGroupsArea).toBeVisible();
        await expect(rowGroupsArea.locator('.ag-column-drop-cell')).toHaveCount(2);
        await expect(rowGroupsArea.getByText('Country', { exact: true })).toBeVisible();
        await expect(rowGroupsArea.getByText('Year', { exact: true })).toBeVisible();

        // Auto group column renders country groups; drill into United States -> 2008.
        const usRowId = 'row-group-country-United States';
        await expect(agIdFor.autoGroupCell(usRowId)).toContainText('United States', { useInnerText: true });

        await agIdFor.autoGroupContracted(usRowId).click();
        await expect(agIdFor.autoGroupCell(`${usRowId}-year-2008`)).toContainText('2008', { useInnerText: true });
    });
});
