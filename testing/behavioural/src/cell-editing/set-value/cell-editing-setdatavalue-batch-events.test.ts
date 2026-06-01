import { getByTestId } from '@testing-library/dom';

import type { BatchEditingStartedEvent, BatchEditingStoppedEvent, CellValueChangedEvent } from 'ag-grid-community';
import {
    CheckboxEditorModule,
    DateEditorModule,
    LargeTextEditorModule,
    NumberEditorModule,
    RenderApiModule,
    SelectEditorModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
} from '../../test-utils';

/**
 * Tests for event dispatching during setDataValue in batch mode.
 *
 * Verifies that cellValueChanged, batchEditingStarted, batchEditingStopped,
 * cellEditingStarted, and cellEditingStopped fire at the correct times with
 * the correct arguments.
 */
describe('Cell Editing: setDataValue in Batch Mode — events', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            BatchEditModule,
            TextEditorModule,
            NumberEditorModule,
            DateEditorModule,
            SelectEditorModule,
            CheckboxEditorModule,
            LargeTextEditorModule,
            RenderApiModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test.each(['commit', 'cancel'] as const)(
        'setDataValue in batch mode fires correct events on %s',
        async (action) => {
            const cellValueChangedEvents: Pick<
                CellValueChangedEvent,
                'oldValue' | 'newValue' | 'newRawValue' | 'source'
            >[] = [];
            const batchStartedEvents: BatchEditingStartedEvent[] = [];
            const batchStoppedEvents: BatchEditingStoppedEvent[] = [];

            const api = await gridMgr.createGridAndWait(`events-batch-${action}`, {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
                onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                    cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
                },
                onBatchEditingStarted: (event) => batchStartedEvents.push(event),
                onBatchEditingStopped: (event) => batchStoppedEvents.push(event),
            });
            const eventTracker = new EditEventTracker(api);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'changed');
            await asyncSetTimeout(1);

            // Before commit/cancel: no cellValueChanged, batchEditingStarted fires on first edit
            expect(cellValueChangedEvents).toHaveLength(0);
            expect(batchStartedEvents).toHaveLength(1);
            expect(batchStoppedEvents).toHaveLength(0);

            if (action === 'commit') {
                api.commitBatchEdit();
            } else {
                api.cancelBatchEdit();
            }
            await asyncSetTimeout(1);

            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 0,
                cellEditingStopped: 0,
                cellValueChanged: action === 'commit' ? 1 : 0,
                rowValueChanged: 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 1,
                batchEditingStopped: 1,
            });

            if (action === 'commit') {
                expect(cellValueChangedEvents).toHaveLength(1);
                expect(cellValueChangedEvents[0]).toEqual(
                    expect.objectContaining({
                        oldValue: 'initial',
                        newValue: 'changed',
                        newRawValue: 'changed',
                    })
                );
            } else {
                expect(cellValueChangedEvents).toHaveLength(0);
            }

            // batchEditingStopped contains changes
            expect(batchStoppedEvents).toHaveLength(1);
            if (action === 'commit') {
                expect(batchStoppedEvents[0].changes).toEqual([
                    expect.objectContaining({
                        rowIndex: 0,
                        columnId: 'a',
                        oldValue: 'initial',
                        newValue: 'changed',
                    }),
                ]);
            } else {
                expect(batchStoppedEvents[0].changes).toEqual([]);
            }

            eventTracker.destroy();
        }
    );

    test('setDataValue with multiple cells fires cellValueChanged for each on commit', async () => {
        const cellValueChangedEvents: Pick<
            CellValueChangedEvent,
            'oldValue' | 'newValue' | 'newRawValue' | 'source'
        >[] = [];
        const batchStoppedEvents: BatchEditingStoppedEvent[] = [];

        const api = await gridMgr.createGridAndWait('events-multi-cell', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [{ id: '0', a: 'a-init', b: 'b-init' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
            },
            onBatchEditingStopped: (event) => batchStoppedEvents.push(event),
        });
        await new GridColumns(api, `setDataValue with multiple cells fires cellValueChanged for each on commit setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `setDataValue with multiple cells fires cellValueChanged for each on commit setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"a-init" b:"b-init"
            `);
        const eventTracker = new EditEventTracker(api);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'a-new', 'batch');
        rowNode.setDataValue('b', 'b-new', 'batch');
        await asyncSetTimeout(1);

        // No events yet
        expect(cellValueChangedEvents).toHaveLength(0);

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 2,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });

        // cellValueChanged fires for each cell with correct args
        expect(cellValueChangedEvents).toHaveLength(2);
        expect(cellValueChangedEvents).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ oldValue: 'a-init', newValue: 'a-new', newRawValue: 'a-new' }),
                expect.objectContaining({ oldValue: 'b-init', newValue: 'b-new', newRawValue: 'b-new' }),
            ])
        );

        // batchEditingStopped contains both changes
        expect(batchStoppedEvents).toHaveLength(1);
        expect(batchStoppedEvents[0].changes).toHaveLength(2);
        expect(batchStoppedEvents[0].changes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ columnId: 'a', oldValue: 'a-init', newValue: 'a-new' }),
                expect.objectContaining({ columnId: 'b', oldValue: 'b-init', newValue: 'b-new' }),
            ])
        );

        eventTracker.destroy();
        await new GridRows(
            api,
            `setDataValue with multiple cells fires cellValueChanged for each on commit final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"a-new" b:"b-new"
        `);
    });

    test("'data' source during batch fires cellValueChanged immediately, not deferred", async () => {
        const cellValueChangedEvents: Pick<
            CellValueChangedEvent,
            'oldValue' | 'newValue' | 'newRawValue' | 'source'
        >[] = [];

        const api = await gridMgr.createGridAndWait('events-data-source', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
            },
        });
        await new GridColumns(api, `'data' source during batch fires cellValueChanged immediately, not deferred setup`)
            .checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        await new GridRows(api, `'data' source during batch fires cellValueChanged immediately, not deferred setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);
        const eventTracker = new EditEventTracker(api);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'direct', 'data');
        await asyncSetTimeout(1);

        // 'data' bypasses batch — fires immediately
        expect(cellValueChangedEvents).toHaveLength(1);
        expect(cellValueChangedEvents[0]).toEqual(
            expect.objectContaining({
                oldValue: 'initial',
                newValue: 'direct',
                newRawValue: 'direct',
                source: 'data',
            })
        );

        // No batch events since 'data' bypasses batch entirely
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        api.cancelBatchEdit();
        eventTracker.destroy();
        await new GridRows(
            api,
            `'data' source during batch fires cellValueChanged immediately, not deferred final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"direct"
        `);
    });

    test("'edit' source with open editor fires no events until commit", async () => {
        const cellValueChangedEvents: Pick<
            CellValueChangedEvent,
            'oldValue' | 'newValue' | 'newRawValue' | 'source'
        >[] = [];

        const api = await gridMgr.createGridAndWait('events-edit-source', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
            },
        });
        await new GridColumns(api, `'edit' source with open editor fires no events until commit setup`).checkColumns(
            `
                CENTER
                └── a "A" width:200 editable
            `
        );
        await new GridRows(api, `'edit' source with open editor fires no events until commit setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);
        const eventTracker = new EditEventTracker(api);
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.startBatchEdit();
        await asyncSetTimeout(1);

        // Open editor
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        await waitForInput(gridDiv, cellA, { popup: false });

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // Push via 'edit' — no cellValueChanged
        rowNode.setDataValue('a', 'pushed', 'edit');
        await asyncSetTimeout(1);

        expect(cellValueChangedEvents).toHaveLength(0);
        expect(eventTracker.counts.cellValueChanged).toBe(0);
        expect(eventTracker.counts.cellEditingStarted).toBe(1);

        // Stop editing, then commit
        api.stopEditing();
        await asyncSetTimeout(1);

        // cellValueChanged still deferred (batch active)
        expect(cellValueChangedEvents).toHaveLength(0);

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // Now cellValueChanged fires
        expect(cellValueChangedEvents).toHaveLength(1);
        expect(cellValueChangedEvents[0]).toEqual(
            expect.objectContaining({
                oldValue: 'initial',
                newValue: 'pushed',
                newRawValue: 'pushed',
            })
        );

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: 1,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });

        eventTracker.destroy();
        await new GridRows(api, `'edit' source with open editor fires no events until commit final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"pushed"
        `);
    });

    test("'edit' source with no editor and no batch fires cellValueChanged immediately", async () => {
        const cellValueChangedEvents: Pick<
            CellValueChangedEvent,
            'oldValue' | 'newValue' | 'newRawValue' | 'source'
        >[] = [];

        const api = await gridMgr.createGridAndWait('events-edit-no-batch', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
            },
        });
        await new GridColumns(api, `'edit' source with no editor and no batch fires cellValueChanged immediately setup`)
            .checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        await new GridRows(api, `'edit' source with no editor and no batch fires cellValueChanged immediately setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);
        const eventTracker = new EditEventTracker(api);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'direct', 'edit');
        await asyncSetTimeout(1);

        // No batch — fires immediately
        expect(cellValueChangedEvents).toHaveLength(1);
        expect(cellValueChangedEvents[0]).toEqual(
            expect.objectContaining({
                oldValue: 'initial',
                newValue: 'direct',
                newRawValue: 'direct',
                source: 'edit',
            })
        );

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        eventTracker.destroy();
        await new GridRows(
            api,
            `'edit' source with no editor and no batch fires cellValueChanged immediately final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"direct"
        `);
    });

    test('default source outside batch fires cellValueChanged immediately with correct source', async () => {
        const cellValueChangedEvents: Pick<
            CellValueChangedEvent,
            'oldValue' | 'newValue' | 'newRawValue' | 'source'
        >[] = [];

        const api = await gridMgr.createGridAndWait('events-default-no-batch', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
            },
        });
        await new GridColumns(
            api,
            `default source outside batch fires cellValueChanged immediately with correct sou setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `default source outside batch fires cellValueChanged immediately with correct sou setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);
        const eventTracker = new EditEventTracker(api);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await asyncSetTimeout(1);

        expect(cellValueChangedEvents).toHaveLength(1);
        expect(cellValueChangedEvents[0]).toEqual(
            expect.objectContaining({
                oldValue: 'initial',
                newValue: 'changed',
                newRawValue: 'changed',
                source: undefined,
            })
        );

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        eventTracker.destroy();
        await new GridRows(
            api,
            `default source outside batch fires cellValueChanged immediately with correct sou final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"changed"
        `);
    });

    test("'batch' source outside batch fires cellValueChanged immediately", async () => {
        const cellValueChangedEvents: Pick<
            CellValueChangedEvent,
            'oldValue' | 'newValue' | 'newRawValue' | 'source'
        >[] = [];

        const api = await gridMgr.createGridAndWait('events-batch-outside', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
            },
        });
        await new GridColumns(api, `'batch' source outside batch fires cellValueChanged immediately setup`)
            .checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        await new GridRows(api, `'batch' source outside batch fires cellValueChanged immediately setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);
        const eventTracker = new EditEventTracker(api);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed', 'batch');
        await asyncSetTimeout(1);

        expect(cellValueChangedEvents).toHaveLength(1);
        expect(cellValueChangedEvents[0]).toEqual(
            expect.objectContaining({
                oldValue: 'initial',
                newValue: 'changed',
                newRawValue: 'changed',
                source: 'batch',
            })
        );

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        eventTracker.destroy();
        await new GridRows(api, `'batch' source outside batch fires cellValueChanged immediately final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `
        );
    });

    test('overwriting a pending value fires only one cellValueChanged on commit (latest value)', async () => {
        const cellValueChangedEvents: Pick<
            CellValueChangedEvent,
            'oldValue' | 'newValue' | 'newRawValue' | 'source'
        >[] = [];

        const api = await gridMgr.createGridAndWait('events-overwrite', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
            },
        });
        await new GridColumns(
            api,
            `overwriting a pending value fires only one cellValueChanged on commit (latest va setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `overwriting a pending value fires only one cellValueChanged on commit (latest va setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial"
        `);
        const eventTracker = new EditEventTracker(api);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'first');
        rowNode.setDataValue('a', 'second');
        rowNode.setDataValue('a', 'third');
        await asyncSetTimeout(1);

        expect(cellValueChangedEvents).toHaveLength(0);

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // Only one cellValueChanged with oldValue=initial and newValue=third
        expect(cellValueChangedEvents).toHaveLength(1);
        expect(cellValueChangedEvents[0]).toEqual(
            expect.objectContaining({
                oldValue: 'initial',
                newValue: 'third',
                newRawValue: 'third',
            })
        );

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });

        eventTracker.destroy();
        await new GridRows(
            api,
            `overwriting a pending value fires only one cellValueChanged on commit (latest va final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"third"
        `);
    });

    test('batchEditingStarted fires lazily on first edit, not on startBatchEdit', async () => {
        const batchStartedEvents: BatchEditingStartedEvent[] = [];

        const api = await gridMgr.createGridAndWait('events-lazy-start', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onBatchEditingStarted: (event) => batchStartedEvents.push(event),
        });
        await new GridColumns(api, `batchEditingStarted fires lazily on first edit, not on startBatchEdit setup`)
            .checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        await new GridRows(api, `batchEditingStarted fires lazily on first edit, not on startBatchEdit setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `
        );
        const eventTracker = new EditEventTracker(api);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        // batchEditingStarted has NOT fired yet — no edits made
        expect(batchStartedEvents).toHaveLength(0);
        expect(eventTracker.counts.batchEditingStarted).toBe(0);

        // Make the first edit
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await asyncSetTimeout(1);

        // Now it fires
        expect(batchStartedEvents).toHaveLength(1);
        expect(eventTracker.counts.batchEditingStarted).toBe(1);

        // A second edit should NOT fire batchEditingStarted again
        rowNode.setDataValue('a', 'changed2');
        await asyncSetTimeout(1);

        expect(batchStartedEvents).toHaveLength(1);
        expect(eventTracker.counts.batchEditingStarted).toBe(1);

        api.cancelBatchEdit();
        eventTracker.destroy();
        await new GridRows(api, `batchEditingStarted fires lazily on first edit, not on startBatchEdit final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);
    });

    test('multiple rows: cellValueChanged fires for each changed cell on commit', async () => {
        const cellValueChangedEvents: Pick<
            CellValueChangedEvent,
            'oldValue' | 'newValue' | 'newRawValue' | 'source'
        >[] = [];
        const batchStoppedEvents: BatchEditingStoppedEvent[] = [];

        const api = await gridMgr.createGridAndWait('events-multi-row', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [
                { id: '0', a: 'a0', b: 'b0' },
                { id: '1', a: 'a1', b: 'b1' },
            ],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue, source });
            },
            onBatchEditingStopped: (event) => batchStoppedEvents.push(event),
        });
        await new GridColumns(api, `multiple rows: cellValueChanged fires for each changed cell on commit setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200 editable
            `);
        await new GridRows(api, `multiple rows: cellValueChanged fires for each changed cell on commit setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"a0" b:"b0"
                └── LEAF id:1 a:"a1" b:"b1"
            `
        );
        const eventTracker = new EditEventTracker(api);

        api.startBatchEdit();
        await asyncSetTimeout(1);

        const row0 = api.getDisplayedRowAtIndex(0)!;
        const row1 = api.getDisplayedRowAtIndex(1)!;
        row0.setDataValue('a', 'a0-new');
        row1.setDataValue('b', 'b1-new');
        await asyncSetTimeout(1);

        expect(cellValueChangedEvents).toHaveLength(0);

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // 2 cells changed across 2 rows
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 2,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 1,
            batchEditingStopped: 1,
        });

        expect(cellValueChangedEvents).toHaveLength(2);
        expect(cellValueChangedEvents).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ oldValue: 'a0', newValue: 'a0-new', newRawValue: 'a0-new' }),
                expect.objectContaining({ oldValue: 'b1', newValue: 'b1-new', newRawValue: 'b1-new' }),
            ])
        );

        // batchEditingStopped changes reflect both edits
        expect(batchStoppedEvents).toHaveLength(1);
        expect(batchStoppedEvents[0].changes).toHaveLength(2);
        expect(batchStoppedEvents[0].changes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ rowIndex: 0, columnId: 'a', oldValue: 'a0', newValue: 'a0-new' }),
                expect.objectContaining({ rowIndex: 1, columnId: 'b', oldValue: 'b1', newValue: 'b1-new' }),
            ])
        );

        eventTracker.destroy();
        await new GridRows(api, `multiple rows: cellValueChanged fires for each changed cell on commit final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"a0-new" b:"b0"
                └── LEAF id:1 a:"a1" b:"b1-new"
            `);
    });
});
