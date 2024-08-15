import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, RowNode } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

import { executeTransactionsAsync, getAllRowData, getAllRows } from '../test-utils';

function verifyPositionInRootChildren(rows: GridApi | RowNode[]) {
    if (!Array.isArray(rows)) {
        rows = getAllRows(rows);
    }
    const errors: string[] = [];
    for (let index = 0; index < rows.length; ++index) {
        const row = rows[index];
        if (row.positionInRootChildren !== index) {
            errors.push(
                `Row id:'${row.id}' at index ${index} has positionInRootChildren:${row.positionInRootChildren}`
            );
        }
    }

    const errorsCount = errors.length;
    if (errorsCount > 0) {
        errors.push(JSON.stringify(rows.map((row) => row.positionInRootChildren)));
        if (errorsCount > 20) {
            errors.splice(20);
            errors.push(`And ${errorsCount - errors.length} more errors...`);
        }
        const error = new Error(errors.join('\n'));
        Error.captureStackTrace(error, verifyPositionInRootChildren);
        throw error;
    }
    return getAllRowData(rows);
}

describe('ag-grid rows-ordering', () => {
    let consoleWarnSpy: jest.SpyInstance;

    function createMyGrid(gridOptions: GridOptions) {
        return createGrid(document.getElementById('myGrid')!, gridOptions);
    }

    function resetGrids() {
        document.body.innerHTML = '<div id="myGrid"></div>';
    }

    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule]);
    });

    beforeEach(() => {
        resetGrids();
    });

    afterEach(() => {
        consoleWarnSpy?.mockRestore();
    });

    test('row order is the same as row data (without id)', async () => {
        const rowData1 = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }];
        const rowData2 = [{ x: 2 }, { x: 1 }, { x: 4 }];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
        };

        const api = createMyGrid(gridOptions);

        let allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }]);

        api.setGridOption('rowData', rowData2);

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual(rowData2);

        api.applyTransaction({ add: [{ x: 7 }, { x: 5 }] });

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([{ x: 2 }, { x: 1 }, { x: 4 }, { x: 7 }, { x: 5 }]);

        api.applyTransaction({ addIndex: 1, add: [{ x: 6 }] });

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([{ x: 2 }, { x: 6 }, { x: 1 }, { x: 4 }, { x: 7 }, { x: 5 }]);
    });

    test('row order is the same as row data (with id)', async () => {
        const rowData1 = [
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ];
        const rowData2 = [
            { id: '2', x: 2 },
            { id: '1', x: 1 },
            { id: '4', x: 4 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        };

        const api = createMyGrid(gridOptions);

        let allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);

        api.setGridOption('rowData', rowData2);

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '2', x: 2 },
            { id: '1', x: 1 },
            { id: '4', x: 4 },
        ]);

        api.applyTransaction({
            add: [
                { id: '7', x: 7 },
                { id: '5', x: 5 },
            ],
        });

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '2', x: 2 },
            { id: '1', x: 1 },
            { id: '4', x: 4 },
            { id: '7', x: 7 },
            { id: '5', x: 5 },
        ]);

        api.applyTransaction({
            addIndex: 1,
            add: [{ id: '6', x: 6 }],
        });

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '2', x: 2 },
            { id: '6', x: 6 },
            { id: '1', x: 1 },
            { id: '4', x: 4 },
            { id: '7', x: 7 },
            { id: '5', x: 5 },
        ]);

        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        await executeTransactionsAsync(
            [
                {
                    add: [
                        { id: '9', x: 9 },
                        { id: '8', x: 8 },
                    ],
                },
                {
                    addIndex: 5,
                    remove: [{ id: '6' }],
                    update: [{ id: '8', x: 80 }],
                    add: [
                        { id: '9', x: 'duplicate-9' },
                        { id: '10', x: 10 },
                    ],
                },
            ],
            api
        );

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "AG Grid: duplicate node id '9' detected from getRowId callback, this could cause issues in your grid."
        );

        consoleWarnSpy.mockRestore();

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '2', x: 2 },
            { id: '1', x: 1 },
            { id: '4', x: 4 },
            { id: '7', x: 7 },
            { id: '5', x: 5 },
            { id: '9', x: 'duplicate-9' },
            { id: '10', x: 10 },
            { id: '9', x: 9 },
            { id: '8', x: 80 },
        ]);
    });

    test('setRowData after a transaction overrides the order (with id)', async () => {
        const rowData1 = [{ id: '1', x: 1 }];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        };

        const api = createMyGrid(gridOptions);

        api.applyTransaction({
            add: [{ id: '2', x: 2 }],
        });

        api.setGridOption('rowData', [
            { id: '2', x: 2 },
            { id: '1', x: 1 },
        ]);

        let allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '2', x: 2 },
            { id: '1', x: 1 },
        ]);

        api.setGridOption('suppressMaintainUnsortedOrder', true);

        api.applyTransaction({
            add: [{ id: '3', x: 3 }],
        });

        api.setGridOption('rowData', [
            { id: '3', x: 13 },
            { id: '2', x: 12 },
            { id: '1', x: 11 },
        ]);

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '2', x: 12 },
            { id: '1', x: 11 },
            { id: '3', x: 13 },
        ]);
    });

    test('suppressMaintainUnsortedOrder (with id)', async () => {
        const rowData1 = [
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ];
        const rowData2 = [
            { id: '4', x: 14 },
            { id: '1', x: 11 },
            { id: '3', x: 13 },
            { id: '5', x: 15 },
            { id: '6', x: 16 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
            suppressMaintainUnsortedOrder: true,
        };

        const api = createMyGrid(gridOptions);

        let allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);

        api.setGridOption('rowData', rowData2);

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '1', x: 11 },
            { id: '3', x: 13 },
            { id: '4', x: 14 },
            { id: '5', x: 15 },
            { id: '6', x: 16 },
        ]);
    });

    test('complex setRowData with remove, update, change order, add', () => {
        const rowData1 = [
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
            { id: '5', x: 5 },
            { id: '6', x: 6 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        };

        const api = createMyGrid(gridOptions);

        api.setGridOption('rowData', [
            { id: '5', x: 11 },
            { id: '2', x: 13 },
            { id: '6', x: 12 },
            { id: '3', x: 14 },
        ]);

        let allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '5', x: 11 },
            { id: '2', x: 13 },
            { id: '6', x: 12 },
            { id: '3', x: 14 },
        ]);

        api.applyTransaction({
            remove: [{ id: '5' }],
            update: [
                { id: '6', x: 100 },
                { id: '3', x: 101 },
            ],
            addIndex: 1,
            add: [
                { id: '7', x: 102 },
                { id: '8', x: 103 },
                { id: '9', x: 104 },
            ],
        });

        allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '2', x: 13 },
            { id: '7', x: 102 },
            { id: '8', x: 103 },
            { id: '9', x: 104 },
            { id: '6', x: 100 },
            { id: '3', x: 101 },
        ]);
    });

    test('multiple interleaved addIndex with async transaction', async () => {
        const rowData1 = [
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
            { id: '5', x: 5 },
            { id: '6', x: 6 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        };

        const api = createMyGrid(gridOptions);

        await executeTransactionsAsync(
            [
                {
                    remove: [{ id: '5' }],
                    addIndex: 1,
                    add: [
                        { id: '7', x: 7 },
                        { id: '8', x: 8 },
                    ],
                },
                {
                    remove: [{ id: '6' }],
                    update: [{ id: '7', x: 33 }],
                    addIndex: 3,
                    add: [{ id: '9', x: 9 }],
                },
                {
                    addIndex: 5,
                    update: [{ id: '9', x: 99 }],
                    add: [
                        { id: '10', x: 10 },
                        { id: '5', x: 105 },
                        { id: '11', x: 11 },
                    ],
                },
            ],
            api
        );

        const allRowData = verifyPositionInRootChildren(api);
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '7', x: 33 },
            { id: '8', x: 8 },
            { id: '9', x: 99 },
            { id: '2', x: 2 },
            { id: '10', x: 10 },
            { id: '5', x: 105 },
            { id: '11', x: 11 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);
    });
});
