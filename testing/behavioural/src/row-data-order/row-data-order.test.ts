import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';

import { executeTransactionsAsync, getAllRowData, verifyPositionInRootChildren } from '../test-utils';

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
        consoleWarnSpy?.mockRestore();
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

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }]);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual(rowData2);

        api.applyTransaction({ add: [{ x: 7 }, { x: 5 }] });

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([{ x: 2 }, { x: 1 }, { x: 4 }, { x: 7 }, { x: 5 }]);

        api.applyTransaction({ addIndex: 1, add: [{ x: 6 }] });

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

        const allRowData = getAllRowData(verifyPositionInRootChildren(api));
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

    test('duplicate IDs do not cause positionInRootChildren to be invalid', async () => {
        const rowData1 = [
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
            { id: '3', x: 5 },
            { id: '3', x: 6 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        };

        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = createMyGrid(gridOptions);

        expect(consoleWarnSpy).toHaveBeenCalled();
        consoleWarnSpy.mockReset();

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
            { id: '3', x: 5 },
            { id: '3', x: 6 },
        ]);

        await executeTransactionsAsync(
            [
                {
                    addIndex: 1,
                    add: [
                        { id: '13', x: 131 },
                        { id: '13', x: 132 },
                    ],
                },
                { addIndex: 5, add: [{ id: '13', x: 133 }] },
                { remove: [{ id: '4' }], update: [{ id: '2', x: 33 }] },
                { addIndex: 3, add: [{ id: '13', x: 134 }] },
            ],
            api
        );

        expect(consoleWarnSpy).toHaveBeenCalled();
        consoleWarnSpy.mockReset();

        allRowData = getAllRowData(verifyPositionInRootChildren(api));

        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '13', x: 131 },
            { id: '13', x: 132 },
            { id: '13', x: 134 },
            { id: '2', x: 33 },
            { id: '3', x: 3 },
            { id: '13', x: 133 },
            { id: '3', x: 5 },
            { id: '3', x: 6 },
        ]);
    });

    test('addIndex is tolerant to floating point numbers, negative values, and values bigger than the array', async () => {
        const rowData = [
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
            { id: '5', x: 5 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData,
            getRowId: (params) => params.data.id,
        };

        const api = createMyGrid(gridOptions);

        await executeTransactionsAsync(
            [
                { addIndex: rowData.length / 2, add: [{ id: '7', x: 7 }] },
                { addIndex: 1.5, add: [{ id: '6', x: 6 }] },
                { addIndex: -1, add: [{ id: '8', x: 8 }] },
                { addIndex: rowData.length + 3, add: [{ id: '9', x: 9 }] },
                { addIndex: rowData.length + 10, add: [{ id: '10', x: 10 }] },
            ],
            api
        );

        const allRowData = getAllRowData(verifyPositionInRootChildren(api));

        expect(allRowData).toEqual([
            { id: '8', x: 8 },
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '6', x: 6 },
            { id: '3', x: 3 },
            { id: '7', x: 7 },
            { id: '4', x: 4 },
            { id: '5', x: 5 },
            { id: '9', x: 9 },
            { id: '10', x: 10 },
        ]);
    });
});
