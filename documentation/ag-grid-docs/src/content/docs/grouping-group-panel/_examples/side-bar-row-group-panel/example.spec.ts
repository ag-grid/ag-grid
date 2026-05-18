import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // Side bar is displaying the columns tool panel with its own Row Groups drop area.
        await expect(agIdFor.columnToolPanel()).toBeVisible();

        const panelRowGroups = agIdFor.columnDropArea('toolbar', 'Row Groups');
        await expect(panelRowGroups).toBeVisible();
        await expect(panelRowGroups.locator('.ag-column-drop-cell')).toHaveCount(2);
        await expect(panelRowGroups.getByText('Country', { exact: true })).toBeVisible();
        await expect(panelRowGroups.getByText('Year', { exact: true })).toBeVisible();

        // Aggregated Total is rendered on the country group row.
        const usRowId = 'row-group-country-United States';
        await expect(agIdFor.autoGroupCell(usRowId)).toContainText('United States', { useInnerText: true });
        await expect(agIdFor.cell(usRowId, 'total')).not.toHaveText('');
    });
});
