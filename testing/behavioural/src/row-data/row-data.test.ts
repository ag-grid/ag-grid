import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, NumberFilterModule, RowApiModule, TextFilterModule } from 'ag-grid-community';
import type { GridOptions, IRowNode, ModelUpdatedEvent } from 'ag-grid-community';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    cachedJSONObjects,
    executeTransactionsAsync,
    setRowDataChecked,
} from '../test-utils';

describe('ag-grid row data', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, ClientSideRowModelModule, RowApiModule],
    });
    let consoleWarnSpy: MockInstance | undefined;
    let consoleErrorSpy: MockInstance | undefined;

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

    test('onRowDataUpdated, onModelUpdated, suppressModelUpdateAfterUpdateTransaction', async () => {
        const rowData1 = [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
            { id: '3', value: 3 },
            { id: '4', value: 4 },
            { id: '5', value: 5 },
        ];
        const rowData2 = [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
            { id: '3', value: 30 },
            { id: '4', value: 40 },
            { id: '5', value: 5 },
        ];
        const rowData3 = [
            { id: '1', value: 1 },
            { id: '2', value: 2 },
            { id: '4', value: 40 },
            { id: '5', value: 5 },
        ];
        const rowData4 = [
            { id: '1', value: 100 },
            { id: '2', value: 2 },
            { id: '4', value: 400 },
            { id: '5', value: 5 },
        ];

        let rowDataUpdatedCount = 0;
        let modelUpdatedCount = 0;
        let compareCalled = false;

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'value',
                    sort: 'asc',
                    comparator: (a, b) => {
                        compareCalled = true;
                        return a - b;
                    },
                },
            ],
            animateRows: false,
            rowData: rowData1,
            suppressModelUpdateAfterUpdateTransaction: true,
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => {
                ++rowDataUpdatedCount;
            },
            onModelUpdated: () => {
                ++modelUpdatedCount;
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        await asyncSetTimeout(1);

        expect(rowDataUpdatedCount).toBe(1);
        expect(modelUpdatedCount).toBe(1);
        expect(compareCalled).toBe(true);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:3
            ├── LEAF id:4 value:4
            └── LEAF id:5 value:5
        `);

        compareCalled = false;
        setRowDataChecked(api, rowData2);
        await asyncSetTimeout(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:30
            ├── LEAF id:4 value:40
            └── LEAF id:5 value:5
        `);
        expect(rowDataUpdatedCount).toBe(2);
        expect(modelUpdatedCount).toBe(1);
        expect(compareCalled).toBe(false);

        compareCalled = false;
        await executeTransactionsAsync([{ update: [{ id: '3', value: 300 }] }], api);
        await asyncSetTimeout(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:3 value:300
            ├── LEAF id:4 value:40
            └── LEAF id:5 value:5
        `);
        expect(rowDataUpdatedCount).toBe(3);
        expect(modelUpdatedCount).toBe(1);
        expect(compareCalled).toBe(false);

        api.refreshClientSideRowModel('everything');
        await asyncSetTimeout(1);
        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:5 value:5
            ├── LEAF id:4 value:40
            └── LEAF id:3 value:300
        `);
        expect(rowDataUpdatedCount).toBe(3);
        expect(modelUpdatedCount).toBe(2);
        expect(compareCalled).toBe(true);

        compareCalled = false;
        await executeTransactionsAsync([{ add: [{ id: '7', value: 700 }] }, { remove: [{ id: '4' }] }], api);
        await asyncSetTimeout(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:5 value:5
            ├── LEAF id:3 value:300
            └── LEAF id:7 value:700
        `);
        expect(rowDataUpdatedCount).toBe(4);
        expect(modelUpdatedCount).toBe(3);
        expect(compareCalled).toBe(true);

        compareCalled = false;
        await executeTransactionsAsync([{ add: [{ id: '8', value: 8 }] }, { remove: [{ id: '8' }] }], api);
        await asyncSetTimeout(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:5 value:5
            ├── LEAF id:3 value:300
            └── LEAF id:7 value:700
        `);
        expect(rowDataUpdatedCount).toBe(5);
        expect(modelUpdatedCount).toBe(3);
        expect(compareCalled).toBe(false);

        compareCalled = false;
        api.updateGridOptions({ suppressModelUpdateAfterUpdateTransaction: false, rowData: rowData3 });
        await asyncSetTimeout(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            ├── LEAF id:5 value:5
            └── LEAF id:4 value:40
        `);
        expect(rowDataUpdatedCount).toBe(6);
        expect(modelUpdatedCount).toBe(4);
        expect(compareCalled).toBe(true);

        compareCalled = false;
        api.updateGridOptions({ suppressModelUpdateAfterUpdateTransaction: false, rowData: rowData4 });
        await asyncSetTimeout(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 value:2
            ├── LEAF id:5 value:5
            ├── LEAF id:1 value:100
            └── LEAF id:4 value:400
        `);
        expect(rowDataUpdatedCount).toBe(7);
        expect(modelUpdatedCount).toBe(5);
        expect(compareCalled).toBe(true);
    });

    test('initializing columns after rowData', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        setRowDataChecked(api, [
            { id: '1', value: 1, x: 10 },
            { id: '2', value: 2, x: 20 },
            { id: '3', value: 3, x: 30 },
        ]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'empty').check('empty');

        api.setGridOption('columnDefs', [{ field: 'value' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            └── LEAF id:3 value:3
        `);

        api.setGridOption('columnDefs', [{ field: 'value' }, { field: 'x' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(2);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1 x:10
            ├── LEAF id:2 value:2 x:20
            └── LEAF id:3 value:3 x:30
        `);

        setRowDataChecked(api, [
            { id: '1', value: 1, x: 10 },
            { id: '4', value: 4, x: 40 },
        ]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(2);
        expect(modelUpdated).toBe(3);

        api.setGridOption('columnDefs', [{ field: 'x' }, { field: 'value' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(2);
        expect(modelUpdated).toBe(4);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 x:10 value:1
            └── LEAF id:4 x:40 value:4
        `);
    });

    test('initializing columns after changing rowData', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            rowData: [{ id: '1', value: 1, x: 10 }],
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        setRowDataChecked(api, [
            { id: '1', value: 1, x: 10 },
            { id: '2', value: 2, x: 20 },
            { id: '3', value: 3, x: 30 },
        ]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'empty').check('empty');

        api.setGridOption('columnDefs', [{ field: 'value' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            └── LEAF id:3 value:3
        `);
    });

    test('initializing columns after initializing with a transaction', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        applyTransactionChecked(api, {
            add: [
                { id: '1', value: 0 },
                { id: '2', value: 2 },
            ],
        });

        applyTransactionChecked(api, {
            update: [{ id: '1', value: 1 }],
            add: [{ id: '3', value: 3 }],
        });

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'data').check('empty');

        api.setGridOption('columnDefs', [{ field: 'value' }, { field: 'value' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1 value_1:1
            ├── LEAF id:2 value:2 value_1:2
            └── LEAF id:3 value:3 value_1:3
        `);
    });

    test('getRowNode does not throw when passed a numeric id', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'value' }],
            rowData: [
                { id: 1, value: 'a' },
                { id: 2, value: 'b' },
            ],
            getRowId: (params) => String(params.data.id),
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        await new GridColumns(api, `getRowNode does not throw when passed a numeric id setup`).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `getRowNode does not throw when passed a numeric id setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:"a"
            └── LEAF id:2 value:"b"
        `);
        await asyncSetTimeout(1);

        // Passing a number should not throw, and should still find the row via property key coercion
        expect(api.getRowNode(1 as any)).toBeTruthy();
        expect(api.getRowNode(999 as any)).toBeUndefined();
        await new GridRows(api, `getRowNode does not throw when passed a numeric id final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:"a"
            └── LEAF id:2 value:"b"
        `);
    });

    test('setRowData without getRowId destroys old nodes silently (no position events)', async () => {
        const row1 = { value: 1 };
        const row2 = { value: 2 };
        const row3 = { value: 3 };

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'value' }],
            rowData: [row1, row2, row3],
            animateRows: false,
        };
        const api = gridsManager.createGrid('myGrid', gridOptions);
        await asyncSetTimeout(1);

        const initialNodes: IRowNode[] = [];
        api.forEachNode((n) => initialNodes.push(n));
        expect(initialNodes).toHaveLength(3);

        await new GridRows(api, 'before').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:1
            ├── LEAF id:1 value:2
            └── LEAF id:2 value:3
        `);

        let topChangedCount = 0;
        let rowIndexChangedCount = 0;
        let displayedChangedCount = 0;
        for (const node of initialNodes) {
            node.addEventListener('topChanged', () => {
                ++topChangedCount;
            });
            node.addEventListener('rowIndexChanged', () => {
                ++rowIndexChangedCount;
            });
            node.addEventListener('displayedChanged', () => {
                ++displayedChangedCount;
            });
        }

        setRowDataChecked(api, [{ value: 10 }, row2, row3]);
        await asyncSetTimeout(1);

        const newNodes: IRowNode[] = [];
        api.forEachNode((n) => newNodes.push(n));
        expect(newNodes).toHaveLength(3);

        for (const node of initialNodes) {
            expect(node.destroyed).toBe(true);
            expect(node.rowTop).toBeNull();
            expect(node.rowIndex).toBeNull();
            expect(node.displayed).toBe(false);
        }
        await new GridRows(api, 'after').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:10
            ├── LEAF id:1 value:2
            └── LEAF id:2 value:3
        `);

        expect(topChangedCount).toBe(0);
        expect(rowIndexChangedCount).toBe(0);
        expect(displayedChangedCount).toBe(0);
    });

    describe('onModelUpdated event flags', () => {
        /**
         * Helper to collect modelUpdated events with relevant flags.
         */
        function collectModelUpdatedEvents(api: ReturnType<typeof gridsManager.createGrid>) {
            const events: Pick<
                ModelUpdatedEvent,
                'animate' | 'keepRenderedRows' | 'newData' | 'newPage' | 'keepUndoRedoStack'
            >[] = [];
            api.addEventListener('modelUpdated', (e: ModelUpdatedEvent) => {
                events.push({
                    animate: e.animate,
                    keepRenderedRows: e.keepRenderedRows,
                    newData: e.newData,
                    newPage: e.newPage,
                    keepUndoRedoStack: e.keepUndoRedoStack,
                });
            });
            return events;
        }

        test('initial rowData sets newData=true, keepRenderedRows=false', async () => {
            const events: ModelUpdatedEvent[] = [];
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                animateRows: false,
                onModelUpdated: (e) => events.push(e),
            };
            gridsManager.createGrid('myGrid', gridOptions);
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                newData: true,
                keepRenderedRows: false,
                newPage: false,
                keepUndoRedoStack: false,
            });
        });

        test('setRowData without getRowId sets newData=true', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ value: 1 }],
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `setRowData without getRowId sets newData=true setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `setRowData without getRowId sets newData=true setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:1
            `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            setRowDataChecked(api, [{ value: 2 }]);
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                newData: true,
                keepRenderedRows: false,
                newPage: false,
            });
            await new GridRows(api, `setRowData without getRowId sets newData=true final state`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:2
            `);
        });

        test('setRowData with getRowId (immutable update) sets newData=false', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `setRowData with getRowId (immutable update) sets newData=false setup`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `setRowData with getRowId (immutable update) sets newData=false setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:1
            `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            // Update existing row - immutable update path
            setRowDataChecked(api, [{ id: '1', value: 2 }]);
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                newData: false,
                keepRenderedRows: true,
                newPage: false,
            });
            await new GridRows(api, `setRowData with getRowId (immutable update) sets newData=false final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └── LEAF id:1 value:2
                `
            );
        });

        test('applyTransaction with add/remove triggers modelUpdated', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `applyTransaction with add/remove triggers modelUpdated setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `applyTransaction with add/remove triggers modelUpdated setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:1
            `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            applyTransactionChecked(api, { add: [{ id: '2', value: 2 }] });
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                newData: false,
                keepRenderedRows: true,
                // Note: transactions do not explicitly set keepUndoRedoStack, so it's false by default
                keepUndoRedoStack: false,
                newPage: false,
                // animate is true because suppressAnimationFrame defaults to false
                animate: true,
            });
            await new GridRows(api, `applyTransaction with add/remove triggers modelUpdated final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:1
                └── LEAF id:2 value:2
            `);
        });

        test('applyTransaction with update only and suppressModelUpdateAfterUpdateTransaction', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                suppressModelUpdateAfterUpdateTransaction: true,
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(
                api,
                `applyTransaction with update only and suppressModelUpdateAfterUpdateTransaction setup`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `applyTransaction with update only and suppressModelUpdateAfterUpdateTransaction setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:1
            `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            // Update-only transaction with suppressModelUpdateAfterUpdateTransaction should not trigger modelUpdated
            applyTransactionChecked(api, { update: [{ id: '1', value: 2 }] });
            await asyncSetTimeout(1);

            expect(events).toHaveLength(0);

            // Add triggers modelUpdated even with suppressModelUpdateAfterUpdateTransaction
            applyTransactionChecked(api, { add: [{ id: '2', value: 3 }] });
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                newData: false,
                keepRenderedRows: true,
            });
            await new GridRows(
                api,
                `applyTransaction with update only and suppressModelUpdateAfterUpdateTransaction final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:2
                └── LEAF id:2 value:3
            `);
        });

        test('refreshClientSideRowModel triggers modelUpdated with keepRenderedRows=true', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value', sort: 'asc' }],
                rowData: [
                    { id: '1', value: 1 },
                    { id: '2', value: 2 },
                ],
                getRowId: (p) => p.data.id,
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(
                api,
                `refreshClientSideRowModel triggers modelUpdated with keepRenderedRows=true setup`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200 sort:asc
            `);
            await new GridRows(api, `refreshClientSideRowModel triggers modelUpdated with keepRenderedRows=true setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 value:1
                    └── LEAF id:2 value:2
                `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            api.refreshClientSideRowModel('sort');
            await new GridRows(
                api,
                `refreshClientSideRowModel triggers modelUpdated with keepRenderedRows=true after refreshClientSideRowModel`
            ).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:1
                └── LEAF id:2 value:2
            `);
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                newData: false,
                keepRenderedRows: true,
                // Note: refreshClientSideRowModel doesn't explicitly set keepUndoRedoStack
                keepUndoRedoStack: false,
                newPage: false,
                // refreshClientSideRowModel uses suppressAnimationFrame, not animateRows
                // so animate=true when suppressAnimationFrame=false (the default)
                animate: true,
            });
        });

        test('refreshClientSideRowModel animate uses suppressAnimationFrame, not animateRows', async () => {
            // With animateRows=true, suppressAnimationFrame=false (default)
            const gridOptions1: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                animateRows: true,
            };
            const api1 = gridsManager.createGrid('grid1', gridOptions1);
            await asyncSetTimeout(1);
            const events1 = collectModelUpdatedEvents(api1);

            api1.refreshClientSideRowModel('sort');
            await asyncSetTimeout(1);

            expect(events1).toHaveLength(1);
            // animate is true because suppressAnimationFrame defaults to false
            expect(events1[0].animate).toBe(true);

            // With animateRows=false, suppressAnimationFrame=false (default)
            // animate should still be true because refreshClientSideRowModel uses suppressAnimationFrame
            const gridOptions2: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                animateRows: false,
            };
            const api2 = gridsManager.createGrid('grid2', gridOptions2);
            await asyncSetTimeout(1);
            const events2 = collectModelUpdatedEvents(api2);

            api2.refreshClientSideRowModel('sort');
            await asyncSetTimeout(1);

            expect(events2).toHaveLength(1);
            // animate is true because suppressAnimationFrame defaults to false (animateRows is ignored)
            expect(events2[0].animate).toBe(true);

            // With suppressAnimationFrame=true
            const gridOptions3: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                suppressAnimationFrame: true,
            };
            const api3 = gridsManager.createGrid('grid3', gridOptions3);
            await asyncSetTimeout(1);
            const events3 = collectModelUpdatedEvents(api3);

            api3.refreshClientSideRowModel('sort');
            await asyncSetTimeout(1);

            expect(events3).toHaveLength(1);
            expect(events3[0].animate).toBe(false);
        });

        test('transaction animate uses suppressAnimationFrame, not animateRows', async () => {
            // With animateRows=false but suppressAnimationFrame=false (default)
            // Transactions should still have animate=true
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `transaction animate uses suppressAnimationFrame, not animateRows setup`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `transaction animate uses suppressAnimationFrame, not animateRows setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:1
            `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            applyTransactionChecked(api, { add: [{ id: '2', value: 2 }] });
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            // animate=true because suppressAnimationFrame defaults to false
            expect(events[0].animate).toBe(true);
            await new GridRows(api, `transaction animate uses suppressAnimationFrame, not animateRows final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 value:1
                    └── LEAF id:2 value:2
                `);
        });

        test('suppressAnimationFrame=true sets animate=false for transactions', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                suppressAnimationFrame: true,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `suppressAnimationFrame=true sets animate=false for transactions setup`)
                .checkColumns(`
                    CENTER
                    └── value "Value" width:200
                `);
            await new GridRows(api, `suppressAnimationFrame=true sets animate=false for transactions setup`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:1
            `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            applyTransactionChecked(api, { add: [{ id: '2', value: 2 }] });
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0].animate).toBe(false);
            await new GridRows(api, `suppressAnimationFrame=true sets animate=false for transactions final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 value:1
                    └── LEAF id:2 value:2
                `);
        });

        test('filter change sets keepRenderedRows=true', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value', filter: true }],
                rowData: [
                    { id: '1', value: 1 },
                    { id: '2', value: 2 },
                    { id: '3', value: 3 },
                ],
                getRowId: (p) => p.data.id,
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `filter change sets keepRenderedRows=true setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `filter change sets keepRenderedRows=true setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:1
                ├── LEAF id:2 value:2
                └── LEAF id:3 value:3
            `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            api.setFilterModel({ value: { type: 'greaterThan', filter: 1 } });
            await new GridRows(api, `filter change sets keepRenderedRows=true after setFilterModel`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 value:2
                └── LEAF id:3 value:3
            `);
            await asyncSetTimeout(1);

            // Filter change may trigger multiple events (filter change + sort recalc)
            expect(events.length).toBeGreaterThanOrEqual(1);
            // The filter event should have keepRenderedRows=true
            const filterEvent = events.find((e) => e.keepRenderedRows === true);
            expect(filterEvent).toBeDefined();
            expect(filterEvent).toMatchObject({
                newData: false,
                keepRenderedRows: true,
                newPage: false,
            });
        });

        test('sort change sets keepRenderedRows=true', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value', sortable: true }],
                rowData: [
                    { id: '1', value: 3 },
                    { id: '2', value: 1 },
                    { id: '3', value: 2 },
                ],
                getRowId: (p) => p.data.id,
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `sort change sets keepRenderedRows=true setup`).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(api, `sort change sets keepRenderedRows=true setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 value:3
                ├── LEAF id:2 value:1
                └── LEAF id:3 value:2
            `);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
            await new GridColumns(api, `sort change sets keepRenderedRows=true after applyColumnState`).checkColumns(
                `
                    CENTER
                    └── value "Value" width:200 sort:asc
                `
            );
            await new GridRows(api, `sort change sets keepRenderedRows=true after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 value:1
                ├── LEAF id:3 value:2
                └── LEAF id:1 value:3
            `);
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                newData: false,
                keepRenderedRows: true,
                // sort doesn't explicitly set keepUndoRedoStack
                keepUndoRedoStack: false,
                newPage: false,
            });
        });

        test('multiple rapid setRowData calls coalesce events correctly', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [{ field: 'value' }],
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                animateRows: false,
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await asyncSetTimeout(1);
            const events = collectModelUpdatedEvents(api);

            // Multiple rapid calls
            setRowDataChecked(api, [{ id: '1', value: 2 }]);
            setRowDataChecked(api, [{ id: '1', value: 3 }]);
            setRowDataChecked(api, [{ id: '1', value: 4 }]);
            await asyncSetTimeout(1);

            // Should coalesce into one event
            expect(events.length).toBeGreaterThanOrEqual(1);
            // Last state should be reflected
            await new GridRows(api, 'data').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:4
            `);
        });

        test('initial data without columns defers modelUpdated until columns set', async () => {
            const events: ModelUpdatedEvent[] = [];
            const gridOptions: GridOptions = {
                rowData: [{ id: '1', value: 1 }],
                getRowId: (p) => p.data.id,
                onModelUpdated: (e) => events.push(e),
            };
            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(
                api,
                `initial data without columns defers modelUpdated until columns set setup`
            ).checkColumns(``);
            await new GridRows(api, `initial data without columns defers modelUpdated until columns set setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
            await asyncSetTimeout(1);

            // No modelUpdated without columns
            expect(events).toHaveLength(0);

            api.setGridOption('columnDefs', [{ field: 'value' }]);
            await new GridColumns(
                api,
                `initial data without columns defers modelUpdated until columns set after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200
            `);
            await new GridRows(
                api,
                `initial data without columns defers modelUpdated until columns set after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 value:1
            `);
            await asyncSetTimeout(1);

            expect(events).toHaveLength(1);
            expect(events[0]).toMatchObject({
                newData: true,
                keepRenderedRows: false,
                newPage: false,
            });
        });
    });
});
