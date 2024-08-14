import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, RowNode } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

import { executeTransactionsAsync, getAllRowData } from '../test-utils';

function verifyPositionInRootChildren(rows: GridApi | RowNode[]) {
    if (!Array.isArray(rows)) {
        rows = getAllRowData(rows);
    }

    const errors: string[] = [];
    let errorsCount = 0;

    let prevOrder = -1;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const newOrder = row.positionInRootChildren;
        if (newOrder < prevOrder) {
            ++errorsCount;
            errors.push(
                `Row at index ${i} id:'${row.id}' has positionInRootChildren ${newOrder}, expected to be greater than ${prevOrder}`
            );
            if (errors.length > 100) {
                break;
            }
        }
        prevOrder = newOrder;
    }

    if (errorsCount > 0) {
        if (errorsCount > errors.length) {
            errors.push(`And ${errorsCount - errors.length} more errors...`);
        }
        const error = new Error(errors.join('\n'));
        Error.captureStackTrace(error, verifyPositionInRootChildren);
        throw error;
    }
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

        let allRowData = getAllRowData(api);
        expect(allRowData).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }]);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(api);
        expect(allRowData).toEqual(rowData2);

        api.applyTransaction({ add: [{ x: 7 }, { x: 5 }] });

        allRowData = getAllRowData(api);
        expect(allRowData).toEqual([{ x: 2 }, { x: 1 }, { x: 4 }, { x: 7 }, { x: 5 }]);

        api.applyTransaction({ addIndex: 1, add: [{ x: 6 }] });

        allRowData = getAllRowData(api);
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

        let allRowData = getAllRowData(api);
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(api);
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

        allRowData = getAllRowData(api);
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

        allRowData = getAllRowData(api);
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

        allRowData = getAllRowData(api);
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

        let allRowData = getAllRowData(api);
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

        allRowData = getAllRowData(api);
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

        let allRowData = getAllRowData(api);
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(api);
        expect(allRowData).toEqual([
            { id: '1', x: 11 },
            { id: '3', x: 13 },
            { id: '4', x: 14 },
            { id: '5', x: 15 },
            { id: '6', x: 16 },
        ]);
    });
});
