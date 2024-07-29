import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getAllRows } from '../../test-utils';
import { getRowsSnapshot } from '../row-snapshot-test-utils';
import { TreeDiagram, simpleHierarchyRowData, simpleHierarchyRowSnapshot } from './tree-test-utils';

describe('ag-grid grouping tree data with groupRows', () => {
    let consoleErrorSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);
    });

    beforeEach(() => {
        resetGrids();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy?.mockRestore();
    });

    test('tree grouping rows snapshot', async () => {
        const rowData = simpleHierarchyRowData();

        const getDataPath = (data: any) => data.orgHierarchy;

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'groupType',
                    valueGetter: (params) => (params.data ? 'Provided' : 'Filler'),
                },
            ],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: true,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath,
            groupDisplayType: 'groupRows',
        };

        const api = createMyGrid(gridOptions);

        new TreeDiagram(api).check(`
            ROOT_NODE_ID ROOT level:-1 id:ROOT_NODE_ID
            ├─┬ A LEAF level:0 id:0
            │ └── B LEAF level:1 id:1
            ├─┬ C filler level:0 id:row-group-0-C
            │ └── D LEAF level:1 id:2
            └─┬ E filler level:0 id:row-group-0-E
            · └─┬ F filler level:1 id:row-group-0-E-1-F
            · · └─┬ G filler level:2 id:row-group-0-E-1-F-2-G
            · · · └── H LEAF level:3 id:3`);

        const rows = getAllRows(api);

        expect(rows.length).toBe(8);

        const rowsSnapshot = getRowsSnapshot(rows);

        expect(rows[0].data).toEqual(rowData[0]);
        expect(rows[1].data).toEqual(rowData[1]);
        expect(rows[2].data).toEqual(undefined);
        expect(rows[3].data).toEqual(rowData[2]);
        expect(rows[4].data).toEqual(undefined);
        expect(rows[5].data).toEqual(undefined);
        expect(rows[6].data).toEqual(undefined);
        expect(rows[7].data).toEqual(rowData[3]);

        expect(rowsSnapshot).toMatchObject(
            simpleHierarchyRowSnapshot().map((row) => {
                return {
                    ...row,
                    groupData: {},
                };
            })
        );
    });
});
