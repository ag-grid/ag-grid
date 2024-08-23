import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions, RowDataTransaction } from '@ag-grid-community/core';

import {
    TestGridsManager,
    cachedJSONObjects,
    checkRowNodesDom,
    executeTransactionsAsync,
    getAllRowData,
    verifyPositionInRootChildren,
} from '../test-utils';

describe('ag-grid rows-ordering', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    let consoleWarnSpy: jest.SpyInstance | undefined;
    let consoleErrorSpy: jest.SpyInstance | undefined;

    beforeEach(() => {
        cachedJSONObjects.clear();
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
        consoleErrorSpy?.mockRestore();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
        consoleErrorSpy?.mockRestore();
    });

    test('row order is the same as row data (without id)', async () => {
        const rowData1 = [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }];
        const rowData2 = [{ x: 2 }, { x: 1 }, { x: 4 }];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }]);
        checkRowNodesDom('myGrid', api);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual(rowData2);
        checkRowNodesDom('myGrid', api);

        api.applyTransaction({ add: [{ x: 7 }, { x: 5 }] });

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([{ x: 2 }, { x: 1 }, { x: 4 }, { x: 7 }, { x: 5 }]);
        checkRowNodesDom('myGrid', api);

        api.applyTransaction({ addIndex: 1, add: [{ x: 6 }] });

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([{ x: 2 }, { x: 6 }, { x: 1 }, { x: 4 }, { x: 7 }, { x: 5 }]);
        checkRowNodesDom('myGrid', api);
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

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        });

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);
        checkRowNodesDom('myGrid', api);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([
            { id: '2', x: 2 },
            { id: '1', x: 1 },
            { id: '4', x: 4 },
        ]);
        checkRowNodesDom('myGrid', api);

        api.applyTransaction({
            add: [
                { id: '7', x: 7 },
                { id: '5', x: 5 },
            ],
        });
        checkRowNodesDom('myGrid', api);

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
        checkRowNodesDom('myGrid', api);

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([
            { id: '2', x: 2 },
            { id: '6', x: 6 },
            { id: '1', x: 1 },
            { id: '4', x: 4 },
            { id: '7', x: 7 },
            { id: '5', x: 5 },
        ]);
        checkRowNodesDom('myGrid', api);

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
                        { id: '9', x: 91 },
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
            { id: '9', x: 91 },
            { id: '10', x: 10 },
            { id: '9', x: 9 },
            { id: '8', x: 80 },
        ]);
    });

    test('setRowData after a transaction overrides the order (with id)', async () => {
        const rowData1 = [{ id: '1', x: 1 }];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        });

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
        checkRowNodesDom('myGrid', api);

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
        checkRowNodesDom('myGrid', api);
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

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
            suppressMaintainUnsortedOrder: true,
        });

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([
            { id: '1', x: 1 },
            { id: '2', x: 2 },
            { id: '3', x: 3 },
            { id: '4', x: 4 },
        ]);
        checkRowNodesDom('myGrid', api);

        api.setGridOption('rowData', rowData2);

        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual([
            { id: '1', x: 11 },
            { id: '3', x: 13 },
            { id: '4', x: 14 },
            { id: '5', x: 15 },
            { id: '6', x: 16 },
        ]);
        checkRowNodesDom('myGrid', api);
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

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        });

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
        checkRowNodesDom('myGrid', api);

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
        checkRowNodesDom('myGrid', api);
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

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        });

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
        checkRowNodesDom('myGrid', api);
    });

    test('can swap rows by updating row data', async () => {
        const rowData1 = cachedJSONObjects.array([
            { id: '0', x: 1 },
            { id: '1', x: 1 },
            { id: '2', x: 1 },
            { id: '3', x: 1 },
            { id: '4', x: 1 },
            { id: '5', x: 1 },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { id: '0', x: 1 },
            { id: '1', x: 1 },
            { id: '3', x: 1 },
            { id: '2', x: 1 },
            { id: '4', x: 1 },
            { id: '5', x: 1 },
        ]);

        const rowData3 = cachedJSONObjects.array([
            { id: '4', x: 1 },
            { id: '1', x: 1 },
            { id: '3', x: 1 },
            { id: '2', x: 1 },
            { id: '0', x: 1 },
            { id: '5', x: 1 },
        ]);

        const rowData4 = cachedJSONObjects.array([
            { id: '5', x: 1 },
            { id: '1', x: 1 },
            { id: '3', x: 1 },
            { id: '2', x: 1 },
            { id: '0', x: 1 },
            { id: '4', x: 1 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            rowData: rowData1,
            getRowId: (params) => params.data.id,
        });

        let allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual(rowData1);
        checkRowNodesDom('myGrid', api);

        api.setGridOption('rowData', rowData2);
        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual(rowData2);
        checkRowNodesDom('myGrid', api);

        api.setGridOption('rowData', rowData3);
        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual(rowData3);
        checkRowNodesDom('myGrid', api);

        api.setGridOption('rowData', rowData4);
        allRowData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allRowData).toEqual(rowData4);
        checkRowNodesDom('myGrid', api);
    });

    describe('complex transaction', () => {
        test('ag-grid sync complex transaction', async () => {
            const row0 = { id: '0', x: '0' };
            const row1a = { id: '1', x: '1a' };
            const row2 = { id: '2', x: '2' };
            const row3 = { id: '3', x: '3' };
            const row4 = { id: '4', x: '4' };
            const row5a = { id: '5', x: '5a' };
            const row6a = { id: '6', x: '6a' };

            const row1b = { id: '1', x: '1b' };
            const row5b = { id: '5', x: '5b' };
            const row6b = { id: '6', x: '6b' };

            const rowData = [row0, row1a];
            const transactions: RowDataTransaction[] = [
                { add: [row2] },
                { update: [row1b], add: [row3, row4] },
                { remove: [row1b], add: [row5a, row6a] },
                { remove: [row2], update: [row6b] },
                { update: [row5b] },
            ];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'x' }],
                animateRows: false,
                rowData,
                getRowId: (params) => params.data.id,
            });

            let allData = getAllRowData(verifyPositionInRootChildren(api));
            expect(allData).toEqual([row0, row1a]);
            checkRowNodesDom('myGrid', api);

            api.applyTransaction(transactions[0]);

            allData = getAllRowData(verifyPositionInRootChildren(api));
            expect(allData).toEqual([row0, row1a, row2]);
            checkRowNodesDom('myGrid', api);

            api.applyTransaction(transactions[1]);

            allData = getAllRowData(verifyPositionInRootChildren(api));
            expect(allData).toEqual([row0, row1b, row2, row3, row4]);
            checkRowNodesDom('myGrid', api);

            api.applyTransaction(transactions[2]);

            allData = getAllRowData(verifyPositionInRootChildren(api));
            expect(allData).toEqual([row0, row2, row3, row4, row5a, row6a]);
            checkRowNodesDom('myGrid', api);

            api.applyTransaction(transactions[3]);

            allData = getAllRowData(verifyPositionInRootChildren(api));
            expect(allData).toEqual([row0, row3, row4, row5a, row6b]);
            checkRowNodesDom('myGrid', api);

            api.applyTransaction(transactions[4]);

            allData = getAllRowData(verifyPositionInRootChildren(api));
            expect(allData).toEqual([row0, row3, row4, row5b, row6b]);
            checkRowNodesDom('myGrid', api);
        });

        test('ag-grid async complex transaction', async () => {
            const row0 = { id: '0', x: '0' };
            const row1a = { id: '1', x: '1a' };
            const row2 = { id: '2', x: '2' };
            const row3 = { id: '3', x: '3' };
            const row4 = { id: '4', x: '4' };
            const row5a = { id: '5', x: '5a' };
            const row6a = { id: '6', x: '6a' };

            const row1b = { id: '1', x: '1b' };
            const row5b = { id: '5', x: '5b' };
            const row6b = { id: '6', x: '6b' };

            const rowData = [row0, row1a];
            const transactions: RowDataTransaction[] = [
                { add: [row2] },
                { update: [row1b], add: [row3, row4] },
                { remove: [row1b], add: [row5a, row6a] },
                { remove: [row2], update: [row6b] },
                { update: [row5b] },
            ];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'x' }],
                animateRows: false,
                rowData,
                getRowId: (params) => params.data.id,
            });

            await executeTransactionsAsync(transactions, api);

            const allData = getAllRowData(verifyPositionInRootChildren(api));
            expect(allData).toEqual([row0, row3, row4, row5b, row6b]);
            checkRowNodesDom('myGrid', api);
        });
    });

    describe('edge cases', () => {
        test('updating rows that do not exists do not add them', async () => {
            const rowData1 = [
                { id: '1', x: 1 },
                { id: '2', x: 2 },
            ];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'x' }],
                animateRows: false,
                rowData: rowData1,
                getRowId: (params) => params.data.id,
            });

            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            api.applyTransaction({ update: [{ id: 'jhDjSi3Ec-3', x: 3 }] });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'AG Grid: could not find row id=jhDjSi3Ec-3, data item was not found for this id'
            );
            checkRowNodesDom('myGrid', api);

            await executeTransactionsAsync({ update: [{ id: 'jhDjSi3Ec-4', x: 4 }] }, api);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'AG Grid: could not find row id=jhDjSi3Ec-4, data item was not found for this id'
            );

            consoleErrorSpy.mockRestore();

            const allRowData = getAllRowData(verifyPositionInRootChildren(api));
            expect(allRowData).toEqual([
                { id: '1', x: 1 },
                { id: '2', x: 2 },
            ]);
            checkRowNodesDom('myGrid', api);
        });

        test('duplicate IDs do not cause sourceRowIndex to be invalid', async () => {
            const rowData1 = [
                { id: '1', x: 1 },
                { id: '2', x: 2 },
                { id: '3', x: 3 },
                { id: '4', x: 4 },
                { id: '3', x: 5 },
                { id: '3', x: 6 },
            ];

            consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'x' }],
                animateRows: false,
                rowData: rowData1,
                getRowId: (params) => params.data.id,
            });

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

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'x' }],
                animateRows: false,
                rowData: rowData,
                getRowId: (params) => params.data.id,
            });

            await executeTransactionsAsync(
                [
                    { addIndex: rowData.length / 2, add: [{ id: '7', x: 7 }] },
                    { addIndex: 1.5, add: [{ id: '6', x: 6 }] },
                    { addIndex: -1, add: [{ id: '8', x: 8 }] },
                    { addIndex: rowData.length + 3, add: [{ id: '9', x: 9 }] },
                    { addIndex: rowData.length + 10, add: [{ id: '10', x: 10 }] },
                    { addIndex: Number.NEGATIVE_INFINITY, add: [{ id: '11', x: 11 }] },
                    { addIndex: Number.POSITIVE_INFINITY, add: [{ id: '12', x: 12 }] },
                    { addIndex: Number.NaN, add: [{ id: '13', x: 13 }] },
                ],
                api
            );

            const allRowData = getAllRowData(verifyPositionInRootChildren(api));

            expect(allRowData).toEqual([
                { id: '1', x: 1 },
                { id: '2', x: 2 },
                { id: '6', x: 6 },
                { id: '3', x: 3 },
                { id: '7', x: 7 },
                { id: '4', x: 4 },
                { id: '5', x: 5 },
                { id: '8', x: 8 },
                { id: '9', x: 9 },
                { id: '10', x: 10 },
                { id: '11', x: 11 },
                { id: '12', x: 12 },
                { id: '13', x: 13 },
            ]);

            checkRowNodesDom('myGrid', api);
        });
    });
});
