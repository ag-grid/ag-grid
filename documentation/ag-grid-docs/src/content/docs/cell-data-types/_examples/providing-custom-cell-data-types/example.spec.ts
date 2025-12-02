import { expect, test } from '@utils/grid/test-utils';

import { GROUP_AUTO_COLUMN_ID, GROUP_HIERARCHY_COLUMN_ID_PREFIX as vcolPrefix } from 'ag-grid-community';

test.agExample(import.meta, () => {
    test.describe(() => {
        test.use({
            agModules: [
                'RowGroupingModule',
                'PivotModule',
                'SideBarModule',
                'ColumnsToolPanelModule',
                'FiltersToolPanelModule',
                'NumberEditorModule',
            ],
        });

        test.eachFramework('Example', async ({ agIdFor, page, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');

            await remoteApi.setGridOption('animateRows', false); // This is needed or duplicate test ids appear due to animation timing

            await remoteApi.setGridOption('columnDefs', [
                { field: 'athlete' },
                { field: 'countryObject', headerName: 'Country' },
                { field: 'sportObject', headerName: 'Sport' },
                {
                    field: 'date',
                    rowGroup: true,
                    enableRowGroup: true,
                    enablePivot: true,
                    groupHierarchy: ['year', 'month'],
                },
                { field: 'total', aggFunc: 'sum' },
            ]);
            await remoteApi.setGridOption('sideBar', true);
            await remoteApi.setGridOption('defaultColDef', {});

            const level0GroupRowId = `row-group-${vcolPrefix}-date-year-2008`;
            const level1GroupRowId = `${level0GroupRowId}-${vcolPrefix}-date-month-8`;
            const level2GroupRowId = `${level1GroupRowId}-date-24/08/2008`;

            // Assert has grouped by date parts
            await expect(agIdFor.autoGroupCell(level0GroupRowId)).toContainText('2008 (1872)', { useInnerText: true });

            // Expanding year group shows month group
            await agIdFor.groupContracted(level0GroupRowId, GROUP_AUTO_COLUMN_ID).click();
            await expect(agIdFor.autoGroupCell(level1GroupRowId)).toHaveText('8 (1872)', {
                useInnerText: true,
            });

            // Expanding month group shows original group
            await agIdFor.groupContracted(level1GroupRowId, GROUP_AUTO_COLUMN_ID).click();
            await expect(agIdFor.autoGroupCell(level2GroupRowId)).toHaveText('24/08/2008 (1872)', {
                useInnerText: true,
            });

            await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(
                3
            );

            // Check virtual columns
            await agIdFor.columnSelectListItemCheckbox('Date (Year) Column').click();
            await agIdFor.columnSelectListItemCheckbox('Date (Month) Column').click();
            await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(
                3
            );

            // Remove date columns from grouping one by one
            await agIdFor.columnDropCellCancelButton('toolbar', 'Row Groups', 'Date').click();
            await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(
                2
            );

            await agIdFor.columnDropCellCancelButton('toolbar', 'Row Groups', 'Date (Month)').click();
            await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(
                1
            );

            await agIdFor.columnDropCellCancelButton('toolbar', 'Row Groups', 'Date (Year)').click();
            await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').locator('.ag-column-drop-cell')).toHaveCount(
                0
            );
        });
    });
});
