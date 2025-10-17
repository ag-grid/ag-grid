import { dragOverTo, expect, test } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID, GROUP_HIERARCHY_COLUMN_ID_PREFIX as vcolPrefix } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.describe(() => {
        test.use({
            agModules: ['RowGroupingModule', 'SideBarModule'],
        });

        test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.setGridOption('columnDefs', [
                { field: 'athlete' },
                { field: 'country', rowGroup: true },
                { field: 'sport' },
                {
                    field: 'date',
                    enablePivot: true,
                    groupHierarchy: ['year', 'month'],
                },
                { field: 'total', aggFunc: 'sum' },
            ]);
            await remoteApi.setGridOption('sideBar', 'columns');

            // TODO: This call is only necessary because we currently do not reset state in `PivotColSvc` when column definitions change
            await remoteApi.setPivotColumns([]);

            await expect(
                agIdFor.columnDropArea('toolbar', 'Column Labels').locator('.ag-column-drop-cell')
            ).toHaveCount(0);

            // Pivot by date column
            await dragOverTo(
                agIdFor.columnSelectListItemDragHandle('Date Column'),
                agIdFor.columnDropArea('toolbar', 'Column Labels')
            );

            const headerGroupCell = agIdFor.headerGroupCell(
                `pivotGroup_${vcolPrefix}-date-year-${vcolPrefix}-date-month-date_2000_0`
            );
            await expect(headerGroupCell).toBeVisible();

            // Expand header group to verify pivot hierarchy
            await headerGroupCell.locator('.ag-header-expand-icon-collapsed').click();
            await expect(
                agIdFor.headerGroupCell(`pivotGroup_${vcolPrefix}-date-year-${vcolPrefix}-date-month-date_2000-10_0`)
            ).toBeVisible();

            // Uncheck all columns
            await agIdFor.columnSelectListItemCheckbox('Date Column').click();
            await expect(
                agIdFor.columnDropArea('toolbar', 'Column Labels').locator('.ag-column-drop-cell')
            ).toHaveCount(2);

            await agIdFor.columnSelectListItemCheckbox('Date (Month) Column').click();
            await expect(
                agIdFor.columnDropArea('toolbar', 'Column Labels').locator('.ag-column-drop-cell')
            ).toHaveCount(1);

            await agIdFor.columnSelectListItemCheckbox('Date (Year) Column').click();
            await expect(
                agIdFor.columnDropArea('toolbar', 'Column Labels').locator('.ag-column-drop-cell')
            ).toHaveCount(0);

            // Re-check all columns
            // ...checking Date should make Month/Year appear
            await agIdFor.columnSelectListItemCheckbox('Date Column').click();
            await expect(
                agIdFor.columnDropArea('toolbar', 'Column Labels').locator('.ag-column-drop-cell')
            ).toHaveCount(3);
            await expect(agIdFor.columnSelectListItemCheckbox('Date (Month) Column')).toBeChecked();
            await expect(agIdFor.columnSelectListItemCheckbox('Date (Year) Column')).toBeChecked();
        });

        test.eachFramework('Example with pivotIndex', async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.setGridOption('columnDefs', [
                { field: 'athlete' },
                { field: 'country', rowGroup: true },
                { field: 'sport' },
                {
                    field: 'date',
                    pivotIndex: 0,
                    groupHierarchy: ['year', 'month'],
                },
                { field: 'total', aggFunc: 'sum' },
            ]);

            const headerGroupCell = agIdFor.headerGroupCell(
                `pivotGroup_${vcolPrefix}-date-year-${vcolPrefix}-date-month-date_2000_0`
            );
            await expect(headerGroupCell).toBeVisible();
        });
    });
});
