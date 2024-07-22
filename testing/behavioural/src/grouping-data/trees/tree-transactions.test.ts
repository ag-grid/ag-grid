import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, IRowNode } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getRowsSnapshot } from '../row-snapshot-test-utils';
import { simpleHierarchyRowSnapshot } from './tree-data-snapshots';

describe('ag-grid tree transactions', () => {
    let consoleErrorSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function getAllRows(api: GridApi) {
        const rows: IRowNode<any>[] = [];
        api.forEachNode((node) => {
            rows.push(node);
        });
        return rows;
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

    test('ag-grid tree transactions', async () => {
        const rowA = { id: '0', orgHierarchy: ['A'] };

        const rowZ1 = { id: '99', orgHierarchy: ['X', 'Y', 'Z'] };
        const rowZ2 = { id: '99', orgHierarchy: ['A', 'Y', 'Z'] };

        const rowB = { id: '1', orgHierarchy: ['A', 'B'] };
        const rowD = { id: '2', orgHierarchy: ['C', 'D'] };

        const rowH1 = { id: '3', orgHierarchy: ['X', 'Y', 'Z', 'H'] };
        const rowH2 = { id: '3', orgHierarchy: ['E', 'F', 'G', 'H'] };

        const getDataPath = (data: any) => data.orgHierarchy;

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'x',
                },
                {
                    field: 'groupType',
                    valueGetter: (params) => (params.data ? 'Provided' : 'Filler'),
                },
            ],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: true,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowZ1],
            getRowId: (params) => params.data.id,
            getDataPath,
        };

        const api = createMyGrid(gridOptions);

        api.applyTransaction({
            add: [rowB, rowD],
            update: [rowZ2],
        });

        api.applyTransaction({
            add: [rowH1],
            remove: [rowZ2],
        });

        api.applyTransaction({
            update: [rowH2],
        });

        const rows = getAllRows(api);

        expect(rows.length).toBe(8);

        const rowsSnapshot = getRowsSnapshot(rows);

        expect(rows[0].data).toEqual(rowA);
        expect(rows[1].data).toEqual(rowB);
        expect(rows[2].data).toEqual(undefined);
        expect(rows[3].data).toEqual(rowD);
        expect(rows[4].data).toEqual(undefined);
        expect(rows[5].data).toEqual(undefined);
        expect(rows[6].data).toEqual(undefined);
        expect(rows[7].data).toEqual(rowH2);

        expect(rowsSnapshot).toMatchObject(simpleHierarchyRowSnapshot());
    });
});
