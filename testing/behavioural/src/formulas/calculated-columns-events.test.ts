import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, GridColumns, GridRows, asyncSetTimeout, clickMenuOption } from 'ag-test-utils';
import { onTestFinished, vi } from 'vitest';

import type {
    AgColumn,
    ColDef,
    GridApi,
    GridOptions,
    GridState,
    ICellRendererComp,
    ICellRendererParams,
} from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';

import {
    addCalculatedColumnDef,
    clickDialogButton,
    createGrid,
    getExpressionInput,
    openEditDialogViaMenu,
    removeColumnDef,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
    updateCalculatedColumnDef,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    test('live dialog commits report validity changes after the column change event', async () => {
        const changed = vi.fn();
        const validity = vi.fn();
        const api = createGrid('calculated-live-validity', {
            columnDefs: [
                { field: 'sales' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[sales] - [cost]' },
            ],
            rowData: [{ id: 'r1', sales: 100, cost: 60 }],
            onCalculatedColumnChanged: changed,
            onCalculatedColumnValidationStateChanged: validity,
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Sales] - [Cots]');
        await waitFor(() => expect(validity).toHaveBeenCalledTimes(1));
        expect(validity.mock.lastCall![0]).toMatchObject({
            column: api.getColumn('profit'),
            expression: '[sales] - [Cots]',
            source: 'calculatedColumn',
            valid: false,
            reason: 'unknownReference',
        });
        expect(changed.mock.invocationCallOrder[0]).toBeLessThan(validity.mock.invocationCallOrder[0]);

        setExpression('[Sales] + [Cots]');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
        await asyncSetTimeout(0);
        expect(validity).toHaveBeenCalledTimes(1);

        setExpression('[Sales] + [Cost]');
        await waitFor(() => expect(validity).toHaveBeenCalledTimes(2));
        expect(validity.mock.lastCall![0]).toMatchObject({ valid: true, reason: undefined });

        setExpression('[Sales] - [Cost]');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(4));
        await asyncSetTimeout(0);
        expect(validity).toHaveBeenCalledTimes(2);
    });

    test('deferred dialog correction reports validity only after Apply', async () => {
        const validity = vi.fn();
        const api = createGrid('calculated-deferred-validity', {
            calculatedColumns: { applyMode: 'deferred' },
            columnDefs: [{ field: 'sales' }, { colId: 'profit', calculatedExpression: '[missing]' }],
            rowData: [{ id: 'r1', sales: 100 }],
            onCalculatedColumnValidationStateChanged: validity,
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Sales]');
        await asyncSetTimeout(0);
        expect(validity).not.toHaveBeenCalled();
        expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[missing]');

        clickDialogButton('Apply');
        await waitFor(() => expect(validity).toHaveBeenCalledTimes(1));
        expect(validity.mock.lastCall![0]).toMatchObject({
            column: api.getColumn('profit'),
            expression: '[sales]',
            source: 'calculatedColumn',
            valid: true,
            reason: undefined,
        });
    });

    test('pivot mode tracks lifecycle and validity of primary calculated columns', async () => {
        const changed = vi.fn();
        const created = vi.fn();
        const removed = vi.fn();
        const validity = vi.fn();
        const base: ColDef[] = [
            { field: 'country', rowGroup: true },
            { field: 'year', pivot: true },
            { field: 'revenue', aggFunc: 'sum' },
        ];
        const profit: ColDef = { colId: 'profit', calculatedExpression: '[revenue] * 2', aggFunc: 'sum' };
        const api = createGrid('calculated-pivot-lifecycle', {
            pivotMode: true,
            rowData: [{ id: 'r1', country: 'UK', year: 2026, revenue: 10 }],
            columnDefs: [...base, profit],
            onCalculatedColumnCreated: created,
            onCalculatedColumnChanged: changed,
            onCalculatedColumnRemoved: removed,
            onCalculatedColumnValidationStateChanged: validity,
        });
        await asyncSetTimeout(0);
        api.setGridOption('columnDefs', [...base, { ...profit, calculatedExpression: '[revenue] * 3' }]);
        await waitFor(() =>
            expect(changed).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    changes: {
                        calculatedExpression: { oldValue: '[revenue] * 2', newValue: '[revenue] * 3' },
                    },
                    expression: '[revenue] * 3',
                    source: 'api',
                })
            )
        );
        expect(changed).toHaveBeenCalledTimes(1);
        expect(created).not.toHaveBeenCalled();
        expect(removed).not.toHaveBeenCalled();
        expect(validity).not.toHaveBeenCalled();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(30);
        api.setGridOption('columnDefs', base);
        await waitFor(() => expect(removed).toHaveBeenCalledTimes(1));
        api.setGridOption('columnDefs', [...base, profit]);
        await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
        api.setGridOption('columnDefs', [...base.slice(0, 2), profit]);
        await waitFor(() =>
            expect(validity).toHaveBeenCalledWith(expect.objectContaining({ valid: false, reason: 'unknownReference' }))
        );
        api.setGridOption('columnDefs', [...base, profit]);
        await waitFor(() => expect(validity).toHaveBeenCalledWith(expect.objectContaining({ valid: true })));
    });

    test('dispatches calculated column columnDefs lifecycle events', async () => {
        const created = vi.fn();
        const changed = vi.fn();
        const removed = vi.fn();
        const api = createGrid('calculated-api-events', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            onCalculatedColumnCreated: created,
            onCalculatedColumnChanged: changed,
            onCalculatedColumnRemoved: removed,
        });
        await new GridColumns(api, `dispatches calculated column columnDefs lifecycle events setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
        await new GridRows(api, `dispatches calculated column columnDefs lifecycle events setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await waitFor(() =>
            expect(created).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    expression: '[revenue] - [cost]',
                    source: 'api',
                })
            )
        );

        updateCalculatedColumnDef(api, 'profit', { headerName: 'Profit' });
        await waitFor(() =>
            expect(changed).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    changes: { headerName: { oldValue: undefined, newValue: 'Profit' } },
                    expression: '[revenue] - [cost]',
                    source: 'api',
                })
            )
        );

        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[revenue] * [cost]' });
        await waitFor(() =>
            expect(changed).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    changes: {
                        calculatedExpression: { oldValue: '[revenue] - [cost]', newValue: '[revenue] * [cost]' },
                    },
                    expression: '[revenue] * [cost]',
                    source: 'api',
                })
            )
        );

        const removedColumn = api.getColumn('profit');
        removeColumnDef(api, 'profit');
        await waitFor(() =>
            expect(removed).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: removedColumn,
                    expression: '[revenue] * [cost]',
                    source: 'api',
                })
            )
        );
        await new GridRows(api, `dispatches calculated column columnDefs lifecycle events final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);
    });

    test('a column whose formula reference shifts when the first calculated column is added is told once, of its final reference', () => {
        const api = createGrid('calculated-formula-ref-once', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        const cost = api.getColumn('cost') as AgColumn;
        const seen: (string | null)[] = [];
        cost.addEventListener('formulaRefChanged', () => seen.push(cost.formulaRef));

        api.setGridOption('columnDefs', [
            { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            { field: 'revenue' },
            { field: 'cost' },
        ]);

        expect(seen).toEqual(['C']);
    });

    test('a column whose formula reference the first calculated column shifts is told once, of its final one', () => {
        const api = createGrid('calculated-formula-ref-once', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        const seen: string[] = [];
        api.getColumn('cost')!.addEventListener('formulaRefChanged', () =>
            seen.push(
                api
                    .getAllGridColumns()
                    .map((column) => column.getColId())
                    .join()
            )
        );

        api.setGridOption('columnDefs', [
            { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            { field: 'revenue' },
            { field: 'cost' },
        ]);

        expect(seen).toEqual(['profit,revenue,cost']);
    });

    test('a rendered cell is refreshed once when the first calculated column turns formulas on', async () => {
        let refreshes = 0;
        class CountingRenderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init(params: ICellRendererParams): void {
                this.eGui.textContent = String(params.value);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                ++refreshes;
                return true;
            }
        }
        const columnDefs: ColDef[] = [{ field: 'revenue', cellRenderer: CountingRenderer }, { field: 'cost' }];
        const api = createGrid('calculated-formula-refresh-once', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs,
        });
        await asyncSetTimeout(0);

        api.setGridOption('columnDefs', [
            ...columnDefs,
            { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
        ]);

        expect(refreshes).toBe(1);
    });

    test('a cell first drawn by the update turning formulas on is drawn once', () => {
        const drawn: string[] = [];
        class CountingRenderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            public init(params: ICellRendererParams): void {
                drawn.push('init ' + params.value);
                this.eGui.textContent = String(params.value);
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(params: ICellRendererParams): boolean {
                drawn.push('refresh ' + params.value);
                return true;
            }
        }
        const columnDefs: ColDef[] = [{ field: 'revenue', cellRenderer: CountingRenderer }, { field: 'cost' }];
        const api = createGrid('calculated-formula-refresh-once', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs,
        });

        api.setGridOption('columnDefs', [
            ...columnDefs,
            { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
        ]);

        expect(drawn).toEqual(['init 10']);
    });

    test('calculated column columnDefs mutations dispatch newColumnsLoaded', async () => {
        const newColumnsLoaded = vi.fn();
        const api = createGrid('calc-col-newColumnsLoaded', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            onNewColumnsLoaded: newColumnsLoaded,
        });
        // Initial grid setup dispatches it once; clear so we count subsequent triggers cleanly.
        await waitFor(() => expect(newColumnsLoaded).toHaveBeenCalled());
        newColumnsLoaded.mockClear();

        // Each mutation must dispatch exactly once. Gate on the dispatch arriving, drain the queue, then
        // count: polling the count would resolve the moment it reached 1, and counting without the drain
        // would miss a duplicate queued for a later flush.
        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await waitFor(() => expect(newColumnsLoaded).toHaveBeenCalled());
        await asyncSetTimeout(0);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);

        newColumnsLoaded.mockClear();
        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[revenue] * [cost]' });
        await waitFor(() => expect(newColumnsLoaded).toHaveBeenCalled());
        await asyncSetTimeout(0);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);

        newColumnsLoaded.mockClear();
        removeColumnDef(api, 'profit');
        await waitFor(() => expect(newColumnsLoaded).toHaveBeenCalled());
        await asyncSetTimeout(0);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);
    });

    test('removeCalculatedColumn then re-adding the same colId yields a working live column', async () => {
        const api = createGrid('calc-col-readd-same-id', {
            rowData: [
                { id: 'r1', revenue: 10, cost: 3 },
                { id: 'r2', revenue: 20, cost: 8 },
            ],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await waitFor(() => expect(api.getColumn('profit')).toBeTruthy());

        removeColumnDef(api, 'profit');
        await waitFor(() => expect(api.getColumn('profit')).toBeNull());

        // Re-add the SAME colId. Must NOT resurrect the destroyed AgColumn from the first add.
        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await waitFor(() => expect(api.getColumn('profit')).toBeTruthy());

        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: api.getRowNode('r2')!, colKey: 'profit', useFormatter: false })).toBe(12);

        // It must behave as a live column: sorting through it must work.
        api.applyColumnState({ state: [{ colId: 'profit', sort: 'desc' }] });
        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe('r2'));
        expect(api.getDisplayedRowAtIndex(1)?.data.id).toBe('r1');
        await new GridColumns(api, 'removeCalculatedColumn then re-adding the same colId yields a working live column')
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200 sort:desc ƒ
            `);
    });

    test('calculated column columnDefs updates invalidate the formula service per-cell cache', async () => {
        const api = createGrid('calc-col-formula-cache-invalidation', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'result', calculatedExpression: '[revenue] - [cost]' },
            ],
        });
        const rowNode = api.getRowNode('r1')!;
        await waitFor(() => expect(api.getCellValue({ rowNode, colKey: 'result', useFormatter: false })).toBe(7));

        updateCalculatedColumnDef(api, 'result', { calculatedExpression: '[revenue] * [cost]' });
        await waitFor(() => expect(api.getCellValue({ rowNode, colKey: 'result', useFormatter: false })).toBe(30));

        updateCalculatedColumnDef(api, 'result', { calculatedExpression: '[revenue] + [cost]' });
        await waitFor(() => expect(api.getCellValue({ rowNode, colKey: 'result', useFormatter: false })).toBe(13));
    });

    test('calculated column columnDefs updates apply column-state changes (width, pinned, hide) to the live column', async () => {
        const api = createGrid('calc-col-state-update', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', width: 100 },
            ],
        });
        await waitFor(() => expect(api.getColumn('profit')!.getActualWidth()).toBe(100));
        const profit = api.getColumn('profit')!;
        expect(profit.isPinned()).toBe(false);
        expect(profit.isVisible()).toBe(true);

        updateCalculatedColumnDef(api, 'profit', { width: 250, pinned: 'left', hide: true });
        await waitFor(() => expect(api.getColumn('profit')!.getActualWidth()).toBe(250));
        const updatedProfit = api.getColumn('profit')!;
        expect(updatedProfit.getPinned()).toBe('left');
        expect(updatedProfit.isVisible()).toBe(false);

        addCalculatedColumnDef(api, { colId: 'margin', calculatedExpression: '[revenue] - [cost]', width: 120 });
        await waitFor(() => expect(api.getColumn('margin')!.getActualWidth()).toBe(120));

        updateCalculatedColumnDef(api, 'margin', { width: 260, pinned: 'right' });
        await waitFor(() => expect(api.getColumn('margin')!.getActualWidth()).toBe(260));
        const updatedMargin = api.getColumn('margin')!;
        expect(updatedMargin.getPinned()).toBe('right');
        await new GridColumns(
            api,
            'calculated column columnDefs updates apply column-state changes (width, pinned, hide) to the live column'
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
            RIGHT
            └── margin width:260 ƒ
        `);
    });

    test('dispatches lifecycle events for invalid calculated column columnDefs mutations', async () => {
        const created = vi.fn();
        const changed = vi.fn();
        const api = createGrid('calculated-invalid-coldef-events', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            onCalculatedColumnCreated: created,
            onCalculatedColumnChanged: changed,
        });
        await new GridColumns(
            api,
            `dispatches lifecycle events for invalid calculated column columnDefs mutations setup`
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
        `);
        await new GridRows(api, `dispatches lifecycle events for invalid calculated column columnDefs mutations setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 revenue:10 cost:3 profit:7
            `);

        addCalculatedColumnDef(api, { colId: 'bad', calculatedExpression: '[missing] + 1' });
        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[missing] + 1' });

        await waitFor(() => {
            expect(api.getColumn('bad')).toBeTruthy();
            expect(created).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('bad'),
                    expression: '[missing] + 1',
                    source: 'api',
                })
            );
        });
        await waitFor(() =>
            expect(changed).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    changes: {
                        calculatedExpression: { oldValue: '[revenue] - [cost]', newValue: '[missing] + 1' },
                    },
                    expression: '[missing] + 1',
                    source: 'api',
                })
            )
        );
        await new GridRows(
            api,
            `dispatches lifecycle events for invalid calculated column columnDefs mutations final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:"#PARSE!" bad:"#PARSE!"
        `);
    });

    test('dispatches calculated column UI update and remove events', async () => {
        const changed = vi.fn();
        const removed = vi.fn();
        const api = createGrid('calculated-ui-events', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            onCalculatedColumnChanged: changed,
            onCalculatedColumnRemoved: removed,
        });
        await new GridColumns(api, `dispatches calculated column UI update and remove events setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit "Profit" width:200 ƒ
        `);
        await new GridRows(api, `dispatches calculated column UI update and remove events setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

        showColumnMenu(api, 'profit');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getExpressionInput());

        setExpression('[Revenue] * [Cost]');
        clickDialogButton('Apply');

        await waitFor(() =>
            expect(changed).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    changes: {
                        calculatedExpression: { oldValue: '[revenue] - [cost]', newValue: '[revenue] * [cost]' },
                    },
                    expression: '[revenue] * [cost]',
                    source: 'calculatedColumn',
                })
            )
        );

        const removedColumn = api.getColumn('profit');
        showColumnMenu(api, 'profit');
        await clickMenuOption('Remove Calculated Column');

        await waitFor(() =>
            expect(removed).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: removedColumn,
                    expression: '[revenue] * [cost]',
                    source: 'calculatedColumn',
                })
            )
        );
        await new GridRows(api, `dispatches calculated column UI update and remove events final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);
    });

    test('dispatches calculated column validation state changes after column references change', async () => {
        const validationStateChanged = vi.fn();
        const api = createGrid('calculated-validation-events', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            onCalculatedColumnValidationStateChanged: validationStateChanged,
        });
        await new GridColumns(
            api,
            `dispatches calculated column validation state changes after column references ch setup`
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
        `);
        await new GridRows(
            api,
            `dispatches calculated column validation state changes after column references ch setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

        // Flush the batched public-event queue after the initial setup above.
        await asyncSetTimeout(0);
        expect(validationStateChanged).not.toHaveBeenCalled();

        api.updateGridOptions({
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' }],
        });

        await waitFor(() =>
            expect(validationStateChanged).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    valid: false,
                    reason: 'unknownReference',
                })
            )
        );

        validationStateChanged.mockClear();
        api.updateGridOptions({
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });

        await waitFor(() =>
            expect(validationStateChanged).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    valid: true,
                })
            )
        );
        expect(validationStateChanged.mock.calls[0][0].reason).toBeUndefined();
        await new GridRows(
            api,
            `dispatches calculated column validation state changes after column references ch final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);
    });

    test('does not dispatch validation state changes for initial invalid calculated columns', async () => {
        const validationStateChanged = vi.fn();
        createGrid('calculated-initial-invalid-validation-events', {
            rowData: [{ id: 'r1', revenue: 10 }],
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue] - [missing]' }],
            onCalculatedColumnValidationStateChanged: validationStateChanged,
        });

        // Flush the batched public-event queue so a missed dispatch would have landed by now.
        await asyncSetTimeout(0);
        expect(validationStateChanged).not.toHaveBeenCalled();
    });

    describe('updateGridOptions changing calculatedColumns together with columnDefs', () => {
        const columnDefs = (badExpression: string): ColDef[] => [
            { field: 'a' },
            { field: 'b' },
            { colId: 'calc', calculatedExpression: '[a] + [b]' },
            { colId: 'bad', calculatedExpression: badExpression },
        ];

        // Records the calculated column events as [type, colId, detail?] and the `newColumnsLoaded` count.
        function recordEvents(api: GridApi) {
            const events: unknown[][] = [];
            const loaded = { count: 0 };
            api.addGlobalListener((type: string, event: any) => {
                if (type === 'newColumnsLoaded') {
                    ++loaded.count;
                } else if (type === 'calculatedColumnExpressionChanged') {
                    events.push([type, event.column.getColId(), event.oldExpression, event.expression]);
                } else if (type === 'calculatedColumnValidationStateChanged') {
                    events.push([type, event.column.getColId(), event.valid]);
                } else if (type.startsWith('calculatedColumn')) {
                    events.push([type, event.column.getColId()]);
                }
            });
            return { events, loaded };
        }

        test('turning calculatedColumns on with columnDefs compares them with the definitions before the call, and turning it off with columnDefs raises no calculated column event', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const api = createGrid('calculated-toggle-with-defs', {
                calculatedColumns: false,
                columnDefs: columnDefs('[a]'),
                rowData: [{ id: 'r1', a: 1, b: 2 }],
            });
            const { events, loaded } = recordEvents(api);
            await asyncSetTimeout(0);
            events.length = 0;
            let loadedBefore = loaded.count;

            api.updateGridOptions({ calculatedColumns: true, columnDefs: columnDefs('[zz]') });

            await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore));
            await asyncSetTimeout(0);
            expect(events).toEqual([
                ['calculatedColumnChanged', 'bad'],
                ['calculatedColumnExpressionChanged', 'bad', '[a]', '[zz]'],
                ['calculatedColumnValidationStateChanged', 'bad', false],
            ]);

            events.length = 0;
            loadedBefore = loaded.count;
            api.updateGridOptions({ calculatedColumns: false, columnDefs: columnDefs('[a]') });

            await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore));
            await asyncSetTimeout(0);
            expect(events).toEqual([]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('one updateGridOptions changing calculatedColumns with columnDefs or defaultColDef raises newColumnsLoaded and columnEverythingChanged once each, from the api', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());

            // Runs `change` on a new grid; returns its newColumnsLoaded and columnEverythingChanged as 'type:source'.
            const loadedSources = async (gridOptions: Partial<GridOptions>, change: Partial<GridOptions>) => {
                const api = createGrid('calculated-toggle-loaded-sources', {
                    columnDefs: columnDefs('[a]'),
                    rowData: [{ id: 'r1', a: 1, b: 2 }],
                    ...gridOptions,
                });
                const sources: string[] = [];
                api.addEventListener('newColumnsLoaded', (event) => sources.push(`newColumnsLoaded:${event.source}`));
                api.addEventListener('columnEverythingChanged', (event) =>
                    sources.push(`columnEverythingChanged:${event.source}`)
                );
                await asyncSetTimeout(0);
                sources.length = 0;

                api.updateGridOptions(change);
                await waitFor(() => {
                    expect(sources.some((source) => source.startsWith('newColumnsLoaded:'))).toBe(true);
                    expect(sources.some((source) => source.startsWith('columnEverythingChanged:'))).toBe(true);
                });
                await asyncSetTimeout(0);
                api.destroy();
                return sources.sort();
            };

            const alone = await loadedSources({ calculatedColumns: true }, { calculatedColumns: false });
            const on = await loadedSources(
                { calculatedColumns: false },
                { calculatedColumns: true, columnDefs: columnDefs('[zz]') }
            );
            const off = await loadedSources(
                { calculatedColumns: true },
                { calculatedColumns: false, columnDefs: columnDefs('[zz]') }
            );
            const withDefaultColDef = await loadedSources(
                { calculatedColumns: true },
                { calculatedColumns: { processColDef: () => undefined }, defaultColDef: { width: 123 } }
            );

            expect({ alone, on, off, withDefaultColDef }).toEqual({
                alone: ['columnEverythingChanged:gridOptionsChanged', 'newColumnsLoaded:gridOptionsChanged'],
                on: ['columnEverythingChanged:api', 'newColumnsLoaded:api'],
                off: ['columnEverythingChanged:api', 'newColumnsLoaded:api'],
                withDefaultColDef: ['columnEverythingChanged:api', 'newColumnsLoaded:api'],
            });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('calculatedColumns turned on with a column default tells an invalid column after newColumnsLoaded, with its source', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const api = createGrid('calculated-toggle-defaults-order', {
                calculatedColumns: false,
                columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'bad', calculatedExpression: '[zz]' }],
                rowData: [{ id: 'r1', a: 1, b: 2 }],
            });
            const recorded: string[] = [];
            for (const type of ['newColumnsLoaded', 'calculatedColumnValidationStateChanged'] as const) {
                api.addEventListener(type, (event) => recorded.push(`${type}:${event.source}`));
            }
            await asyncSetTimeout(0);
            recorded.length = 0;

            api.updateGridOptions({ calculatedColumns: true, defaultColDef: { width: 123 } });
            await waitFor(() => expect(recorded.length).toBeGreaterThanOrEqual(2), { timeout: 1000 });
            await asyncSetTimeout(0);

            expect({ recorded, width: api.getColumn('a')!.getActualWidth() }).toEqual({
                recorded: ['newColumnsLoaded:api', 'calculatedColumnValidationStateChanged:api'],
                width: 123,
            });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('turning calculatedColumns on alone raises only the validation state of an invalid column', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const api = createGrid('calculated-toggle-on-alone', {
                calculatedColumns: false,
                columnDefs: columnDefs('[zz]'),
                rowData: [{ id: 'r1', a: 1, b: 2 }],
            });
            const events = recordEvents(api).events;
            await asyncSetTimeout(0);
            events.length = 0;

            api.updateGridOptions({ calculatedColumns: true });

            await waitFor(() => expect(events).toEqual([['calculatedColumnValidationStateChanged', 'bad', false]]));
            await asyncSetTimeout(0);
            expect(events).toEqual([['calculatedColumnValidationStateChanged', 'bad', false]]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test.each([
            {
                name: 'a user-created column',
                gridOptions: {
                    columnDefs: [{ field: 'a' }, { field: 'b' }],
                    initialState: {
                        userColumns: [
                            {
                                colId: 'u',
                                type: 'calculated',
                                created: true,
                                parentGroupId: null,
                                properties: [{ property: 'calculatedExpression', value: '[a] + [b]' }],
                            },
                        ],
                    },
                } satisfies Partial<GridOptions>,
                change: { calculatedColumns: true, defaultColDef: { width: 123 } } satisfies Partial<GridOptions>,
                columns: ['a', 'b', 'u'],
                warns: false,
            },
            {
                name: 'a column the user removed',
                gridOptions: {
                    columnDefs: columnDefs('[a]'),
                    initialState: { userColumns: [{ colId: 'bad', type: 'calculated', removed: true }] },
                } satisfies Partial<GridOptions>,
                change: { calculatedColumns: true, defaultColDef: { width: 123 } } satisfies Partial<GridOptions>,
                columns: ['a', 'b', 'calc'],
                warns: true,
            },
            {
                name: 'a column default naming the header',
                gridOptions: { columnDefs: columnDefs('[a]') } satisfies Partial<GridOptions>,
                change: { calculatedColumns: true, defaultColDef: { headerName: 'H' } } satisfies Partial<GridOptions>,
                columns: ['a', 'b', 'calc', 'bad'],
                warns: true,
            },
            {
                name: 'a user-created column the new definitions drop',
                gridOptions: {
                    columnDefs: [{ field: 'a' }, { field: 'b' }],
                    initialState: {
                        userColumns: [
                            {
                                colId: 'u',
                                type: 'calculated',
                                created: true,
                                parentGroupId: null,
                                properties: [{ property: 'calculatedExpression', value: '[a] + [b]' }],
                            },
                        ],
                    },
                } satisfies Partial<GridOptions>,
                change: {
                    calculatedColumns: true,
                    columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
                } satisfies Partial<GridOptions>,
                columns: ['a', 'b', 'c'],
                warns: false,
            },
            {
                name: 'an expression from a column type',
                gridOptions: {
                    columnTypes: { t: { calculatedExpression: '[a]' } },
                    columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', type: 't' }],
                } satisfies Partial<GridOptions>,
                change: { calculatedColumns: true, defaultColDef: { width: 123 } } satisfies Partial<GridOptions>,
                columns: ['a', 'b', 'x'],
                warns: true,
            },
            {
                name: 'a grid created without columns',
                gridOptions: {} satisfies Partial<GridOptions>,
                change: { calculatedColumns: true, columnDefs: columnDefs('[zz]') } satisfies Partial<GridOptions>,
                columns: ['a', 'b', 'calc', 'bad'],
                warns: false,
            },
        ])(
            'turning calculatedColumns on in one call with another column option raises no calculated column event for what the option alone turns on ($name)',
            async ({ name, gridOptions, change, columns, warns }) => {
                enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
                const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
                onTestFinished(() => warn.mockRestore());
                const api = createGrid(`calculated-toggle-option-only-${name}`, {
                    calculatedColumns: false,
                    rowData: [{ id: 'r1', a: 1, b: 2 }],
                    ...gridOptions,
                });
                const { events, loaded } = recordEvents(api);
                await asyncSetTimeout(0);
                events.length = 0;
                const loadedBefore = loaded.count;

                api.updateGridOptions(change);

                await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
                await asyncSetTimeout(0);
                expect(events).toEqual([]);
                expect(api.getColumns()!.map((col) => col.getColId())).toEqual(columns);
                expect(warn.mock.calls.flat().join(' ').includes('warning #319')).toBe(warns);
            }
        );

        test("turning calculatedColumns on with columnDefs compares a column the user changed with the user's expression", async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const api = createGrid('calculated-toggle-user-changed', {
                calculatedColumns: false,
                columnDefs: columnDefs('[a]'),
                rowData: [{ id: 'r1', a: 1, b: 2 }],
                initialState: {
                    userColumns: [
                        {
                            colId: 'calc',
                            type: 'calculated',
                            properties: [{ property: 'calculatedExpression', value: '[a] * 2' }],
                        },
                    ],
                },
            });
            const { events, loaded } = recordEvents(api);
            await asyncSetTimeout(0);
            events.length = 0;
            const loadedBefore = loaded.count;

            api.updateGridOptions({
                calculatedColumns: true,
                columnDefs: [
                    { field: 'a' },
                    { field: 'b' },
                    { colId: 'calc', calculatedExpression: '[b]' },
                    { colId: 'bad', calculatedExpression: '[a]' },
                ],
            });

            await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect(events).toEqual([
                ['calculatedColumnChanged', 'calc'],
                ['calculatedColumnExpressionChanged', 'calc', '[a] * 2', '[b]'],
            ]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('one call replacing calculatedColumns.processColDef with a column default calls it once for a user-created column', async () => {
            const first = vi.fn(() => undefined);
            const api = createGrid('calculated-toggle-process-col-def', {
                calculatedColumns: { processColDef: first },
                columnDefs: [{ field: 'a' }, { field: 'b' }],
                rowData: [{ id: 'r1', a: 1, b: 2 }],
                initialState: {
                    userColumns: [
                        {
                            colId: 'u',
                            type: 'calculated',
                            created: true,
                            parentGroupId: null,
                            properties: [{ property: 'calculatedExpression', value: '[a] + [b]' }],
                        },
                    ],
                },
            });
            const loaded = recordEvents(api).loaded;
            await waitFor(() => expect(api.getColumn('u')).not.toBeNull(), { timeout: 1000 });
            await asyncSetTimeout(0);
            const second = vi.fn(() => undefined);
            first.mockClear();
            const loadedBefore = loaded.count;

            api.updateGridOptions({ calculatedColumns: { processColDef: second }, defaultColDef: { width: 123 } });

            await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect(second).toHaveBeenCalledTimes(1);
            expect(second).toHaveBeenCalledWith(
                expect.objectContaining({ colDef: expect.objectContaining({ colId: 'u' }) })
            );
            expect(first).not.toHaveBeenCalled();
        });

        test.each([
            {
                name: 'fix',
                columnDefs: columnDefs('[a]'),
                expected: [
                    ['calculatedColumnChanged', 'bad'],
                    ['calculatedColumnExpressionChanged', 'bad', '[zz]', '[a]'],
                ],
            },
            {
                name: 'remove',
                columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'calc', calculatedExpression: '[a] + [b]' }],
                expected: [['calculatedColumnRemoved', 'bad']],
            },
        ])(
            'turning calculatedColumns on with columnDefs raises no validation event for an invalid expression those definitions ($name)',
            async ({ name, columnDefs: newColumnDefs, expected }) => {
                enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
                const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
                onTestFinished(() => warn.mockRestore());
                const api = createGrid(`calculated-toggle-invalid-${name}`, {
                    calculatedColumns: false,
                    columnDefs: columnDefs('[zz]'),
                    rowData: [{ id: 'r1', a: 1, b: 2 }],
                });
                const { events, loaded } = recordEvents(api);
                await asyncSetTimeout(0);
                events.length = 0;
                const loadedBefore = loaded.count;

                api.updateGridOptions({ calculatedColumns: true, columnDefs: newColumnDefs });

                await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
                await asyncSetTimeout(0);
                expect(events).toEqual(expected);
                expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
            }
        );

        test('a column option set from a dataTypeMatcher while calculatedColumns is turned on is applied after that update, as a second call would be', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const armed = { value: false };
            const grid: { api?: GridApi } = {};
            const api = createGrid('calculated-toggle-data-type-matcher', {
                calculatedColumns: false,
                columnDefs: [
                    { field: 'a' },
                    { field: 'x', calculatedExpression: '[a]' },
                    { colId: 'bad', calculatedExpression: '[zz]' },
                ],
                rowData: [{ id: 'r1', a: 1 }],
                dataTypeDefinitions: {
                    number: {
                        baseDataType: 'number',
                        extendsDataType: 'number',
                        dataTypeMatcher: (value) => {
                            if (armed.value) {
                                armed.value = false;
                                grid.api?.setGridOption('defaultColDef', { width: 77 });
                            }
                            return typeof value === 'number';
                        },
                    },
                },
            });
            grid.api = api;
            const events = recordEvents(api).events;
            const sources: string[] = [];
            api.addEventListener('newColumnsLoaded', (event) => sources.push(event.source));
            await asyncSetTimeout(0);
            events.length = 0;
            sources.length = 0;
            armed.value = true;

            api.updateGridOptions({ calculatedColumns: true });

            await waitFor(() => expect(sources.length).toBeGreaterThanOrEqual(2), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect({ armed: armed.value, sources, events }).toEqual({
                armed: false,
                sources: ['gridOptionsChanged', 'api'],
                events: [['calculatedColumnValidationStateChanged', 'bad', false]],
            });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('turning calculatedColumns on alone runs a dataTypeMatcher as often as turning it off does', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const calls = { value: 0 };
            const api = createGrid('calculated-toggle-data-type-matcher-calls', {
                calculatedColumns: false,
                columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', calculatedExpression: '[a]' }],
                rowData: [{ id: 'r1', a: 1, b: 2 }],
                dataTypeDefinitions: {
                    number: {
                        baseDataType: 'number',
                        extendsDataType: 'number',
                        dataTypeMatcher: (value) => {
                            ++calls.value;
                            return typeof value === 'number';
                        },
                    },
                },
            });
            const loaded = { value: 0 };
            api.addEventListener('newColumnsLoaded', () => ++loaded.value);
            await asyncSetTimeout(0);

            calls.value = 0;
            loaded.value = 0;
            api.setGridOption('calculatedColumns', true);
            await waitFor(() => expect(loaded.value).toBeGreaterThan(0), { timeout: 1000 });
            await asyncSetTimeout(0);
            const turnedOn = calls.value;

            calls.value = 0;
            loaded.value = 0;
            api.setGridOption('calculatedColumns', false);
            await waitFor(() => expect(loaded.value).toBeGreaterThan(0), { timeout: 1000 });
            await asyncSetTimeout(0);
            const turnedOff = calls.value;

            expect(turnedOff).toBeGreaterThan(0);
            expect({ turnedOn }).toEqual({ turnedOn: turnedOff });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('calculatedColumns turned on from a dataTypeMatcher during a columnDefs update is applied after that update, as a second call would be', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const armed = { value: false };
            const grid: { api?: GridApi } = {};
            const api = createGrid('calculated-turned-on-from-data-type-matcher', {
                calculatedColumns: false,
                columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', calculatedExpression: '[a]' }],
                rowData: [{ id: 'r1', a: 1, b: 2 }],
                dataTypeDefinitions: {
                    number: {
                        baseDataType: 'number',
                        extendsDataType: 'number',
                        dataTypeMatcher: (value) => {
                            if (armed.value) {
                                armed.value = false;
                                grid.api?.setGridOption('calculatedColumns', true);
                            }
                            return typeof value === 'number';
                        },
                    },
                },
            });
            grid.api = api;
            const events = recordEvents(api).events;
            const sources: string[] = [];
            api.addEventListener('newColumnsLoaded', (event) => sources.push(event.source));
            await asyncSetTimeout(0);
            events.length = 0;
            sources.length = 0;
            armed.value = true;

            api.setGridOption('columnDefs', [
                { field: 'a' },
                { field: 'b' },
                { colId: 'x', calculatedExpression: '[a]' },
            ]);

            await waitFor(() => expect(sources.length).toBeGreaterThanOrEqual(2), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect({ armed: armed.value, sources, events }).toEqual({
                armed: false,
                sources: ['api', 'gridOptionsChanged'],
                events: [],
            });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('a column option set from a dataTypeMatcher while calculatedColumns is turned on with a column default is applied after that update, as a second call would be', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const armed = { value: false };
            const grid: { api?: GridApi } = {};
            const api = createGrid('calculated-toggle-default-col-def-data-type-matcher', {
                calculatedColumns: false,
                columnDefs: [
                    { field: 'a' },
                    { colId: 'x', calculatedExpression: '[a]' },
                    { colId: 'bad', calculatedExpression: '[zz]' },
                ],
                rowData: [{ id: 'r1', a: 1 }],
                dataTypeDefinitions: {
                    number: {
                        baseDataType: 'number',
                        extendsDataType: 'number',
                        dataTypeMatcher: (value) => {
                            if (armed.value) {
                                armed.value = false;
                                grid.api?.setGridOption('defaultColDef', { width: 77 });
                            }
                            return typeof value === 'number';
                        },
                    },
                },
            });
            grid.api = api;
            const events = recordEvents(api).events;
            const sources: string[] = [];
            api.addEventListener('newColumnsLoaded', (event) => sources.push(event.source));
            await asyncSetTimeout(0);
            events.length = 0;
            sources.length = 0;
            armed.value = true;

            api.updateGridOptions({ calculatedColumns: true, defaultColDef: { width: 123 } });

            await waitFor(() => expect(sources.length).toBeGreaterThanOrEqual(2), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect({
                armed: armed.value,
                sources,
                events,
                width: api.getColumn('a')?.getActualWidth(),
            }).toEqual({
                armed: false,
                sources: ['api', 'api'],
                events: [['calculatedColumnValidationStateChanged', 'bad', false]],
                width: 77,
            });
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('replacing calculatedColumns.processColDef raises no calculatedColumnChanged for a data type the rows gave a column earlier', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [322] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const api = createGrid('calculated-replace-process-col-def-data-type', {
                calculatedColumns: { processColDef: () => undefined },
                columnDefs: [{ field: 'a' }, { colId: 'x', field: 'x', calculatedExpression: '[a]' }],
            });
            await asyncSetTimeout(0);
            api.setGridOption('rowData', [{ id: 'r1', a: 1, x: 5 }]);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);
            const { events, loaded } = recordEvents(api);
            const loadedBefore = loaded.count;

            api.setGridOption('calculatedColumns', { processColDef: () => undefined });

            await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect(events).toEqual([]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #322');
        });

        test.each([
            {
                name: 'column types taking the expression away',
                warns: true,
                gridOptions: {
                    columnTypes: { t: { calculatedExpression: '[a]' } },
                    columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', type: 't' }],
                } satisfies Partial<GridOptions>,
                change: { calculatedColumns: true, columnTypes: { t: {} } } satisfies Partial<GridOptions>,
            },
            {
                name: 'column types giving the expression',
                warns: false,
                gridOptions: {
                    columnTypes: { t: {} },
                    columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', type: 't' }],
                } satisfies Partial<GridOptions>,
                change: {
                    calculatedColumns: true,
                    columnTypes: { t: { calculatedExpression: '[a]' } },
                } satisfies Partial<GridOptions>,
            },
            {
                name: 'definitions dropping a header the column default gives',
                warns: true,
                gridOptions: {
                    defaultColDef: { headerName: 'H' },
                    columnDefs: [
                        { field: 'a' },
                        { field: 'b' },
                        { colId: 'x', calculatedExpression: '[a]', headerName: 'H' },
                    ],
                } satisfies Partial<GridOptions>,
                change: {
                    calculatedColumns: true,
                    columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', calculatedExpression: '[a]' }],
                } satisfies Partial<GridOptions>,
            },
        ])(
            'turning calculatedColumns on in one call with a column option the definitions also meet raises no calculated column event ($name)',
            async ({ name, warns, gridOptions, change }) => {
                enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
                const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
                onTestFinished(() => warn.mockRestore());
                const api = createGrid(`calculated-toggle-option-also-${name}`, {
                    calculatedColumns: false,
                    rowData: [{ id: 'r1', a: 1, b: 2 }],
                    ...gridOptions,
                });
                const { events, loaded } = recordEvents(api);
                await asyncSetTimeout(0);
                events.length = 0;
                const loadedBefore = loaded.count;

                api.updateGridOptions(change);

                await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
                await asyncSetTimeout(0);
                expect(events).toEqual([]);
                expect(api.getColumns()!.map((col) => col.getColId())).toEqual(['a', 'b', 'x']);
                expect(warn.mock.calls.flat().join(' ').includes('warning #319')).toBe(warns);
            }
        );

        test('turning calculatedColumns on with columnDefs tells a column whose expression a column type gives with that expression and its validation', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const api = createGrid('calculated-toggle-type-expression-changed', {
                calculatedColumns: false,
                columnTypes: { t: { calculatedExpression: '[zz]' } },
                columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', type: 't' }],
                rowData: [{ id: 'r1', a: 1, b: 2 }],
            });
            const loaded = recordEvents(api).loaded;
            const changed: unknown[] = [];
            api.addEventListener('calculatedColumnChanged', (event) =>
                changed.push({
                    colId: event.column.getColId(),
                    expression: event.expression,
                    expressionValidation: event.expressionValidation,
                    changes: event.changes,
                })
            );
            await asyncSetTimeout(0);
            changed.length = 0;
            const loadedBefore = loaded.count;

            api.updateGridOptions({
                calculatedColumns: true,
                columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', type: 't', headerName: 'New' }],
            });

            await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect(changed).toEqual([
                {
                    colId: 'x',
                    expression: '[zz]',
                    expressionValidation: { valid: false, reason: 'unknownReference' },
                    changes: { headerName: { oldValue: undefined, newValue: 'New' } },
                },
            ]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test('turning calculatedColumns on with columnDefs dropping a column whose expression a column type gives tells its removal with that expression', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const api = createGrid('calculated-toggle-type-expression-removed', {
                calculatedColumns: false,
                columnTypes: { t: { calculatedExpression: '[a]' } },
                columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', type: 't' }],
                rowData: [{ id: 'r1', a: 1, b: 2 }],
            });
            const loaded = recordEvents(api).loaded;
            const removed: unknown[] = [];
            api.addEventListener('calculatedColumnRemoved', (event) =>
                removed.push({ colId: event.column.getColId(), expression: event.expression })
            );
            await asyncSetTimeout(0);
            removed.length = 0;
            const loadedBefore = loaded.count;

            api.updateGridOptions({ calculatedColumns: true, columnDefs: [{ field: 'a' }, { field: 'b' }] });

            await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect(removed).toEqual([{ colId: 'x', expression: '[a]' }]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });

        test("turning calculatedColumns on with columnDefs giving a header over the column default tells the default's header as the old value", async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => warn.mockRestore());
            const api = createGrid('calculated-toggle-default-header-changed', {
                calculatedColumns: false,
                defaultColDef: { headerName: 'H' },
                columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'x', calculatedExpression: '[a]' }],
                rowData: [{ id: 'r1', a: 1, b: 2 }],
            });
            const loaded = recordEvents(api).loaded;
            const changed: unknown[] = [];
            api.addEventListener('calculatedColumnChanged', (event) =>
                changed.push({ colId: event.column.getColId(), changes: event.changes })
            );
            await asyncSetTimeout(0);
            changed.length = 0;
            const loadedBefore = loaded.count;

            api.updateGridOptions({
                calculatedColumns: true,
                columnDefs: [
                    { field: 'a' },
                    { field: 'b' },
                    { colId: 'x', calculatedExpression: '[a]', headerName: 'X' },
                ],
            });

            await waitFor(() => expect(loaded.count).toBeGreaterThan(loadedBefore), { timeout: 1000 });
            await asyncSetTimeout(0);
            expect(changed).toEqual([{ colId: 'x', changes: { headerName: { oldValue: 'H', newValue: 'X' } } }]);
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #319');
        });
    });

    describe('updateGridOptions changing calculatedColumns together with defaultColDef', () => {
        const abc: ColDef[] = [{ field: 'a' }, { field: 'b' }];
        const rowData = [{ id: 'r1', a: 5, b: 2 }];
        const calculatedTypes = ['calculatedColumnCreated', 'calculatedColumnRemoved', 'calculatedColumnChanged'];

        test.each(['initialState', 'setState'] as const)(
            'enabling calculatedColumns with defaultColDef raises the calculated column events enabling it alone raises, on a user column restored by %s while it was off',
            async (restoredBy) => {
                const userColumns: GridState['userColumns'] = [
                    {
                        colId: 'c',
                        created: true,
                        properties: [{ property: 'calculatedExpression', value: '[a] + [b]' }],
                    },
                ];
                const enableAndRecord = async (extraOptions: Partial<GridOptions>) => {
                    const api = createGrid('calculated-enable-restored', {
                        calculatedColumns: false,
                        columnDefs: abc,
                        rowData,
                        ...(restoredBy === 'initialState' ? { initialState: { userColumns } } : {}),
                    });
                    if (restoredBy === 'setState') {
                        api.setState({ userColumns });
                    }
                    const events: { type: string; colId: string }[] = [];
                    api.addGlobalListener((type: string, event: any) => {
                        if (calculatedTypes.includes(type)) {
                            events.push({ type, colId: event.column.getColId() });
                        }
                    });
                    await asyncSetTimeout(0);
                    events.length = 0;

                    api.updateGridOptions({ calculatedColumns: true, ...extraOptions });
                    await asyncSetTimeout(0);
                    await asyncSetTimeout(0);

                    const displayed = api.getAllDisplayedColumns().map((col) => col.getColId());
                    const value = api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'c' });
                    api.destroy();
                    return { events, displayed, value };
                };

                const alone = await enableAndRecord({});
                const withDefaultColDef = await enableAndRecord({ defaultColDef: { width: 150 } });

                expect(alone.displayed).toEqual(['a', 'b', 'c']);
                expect(alone.value).toBe(7);
                expect(withDefaultColDef.displayed).toEqual(['a', 'b', 'c']);
                expect(withDefaultColDef.value).toBe(7);
                expect(alone.events).toEqual([]);
                expect(withDefaultColDef.events).toEqual(alone.events);
            }
        );

        /** Creates a grid, runs `change` on it, and returns the calculated column events it raised and its displayed columns. */
        const runChange = async (
            gridOptions: Partial<GridOptions>,
            change: Partial<GridOptions>
        ): Promise<{ events: { type: string; colId: string }[]; displayed: string[] }> => {
            const api = createGrid('calculated-change-restored', { columnDefs: abc, rowData, ...gridOptions });
            const events: { type: string; colId: string }[] = [];
            api.addGlobalListener((type: string, event: any) => {
                if (calculatedTypes.includes(type)) {
                    events.push({ type, colId: event.column.getColId() });
                }
            });
            await asyncSetTimeout(0);
            events.length = 0;

            api.updateGridOptions(change);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            const displayed = api.getAllDisplayedColumns().map((col) => col.getColId());
            api.destroy();
            return { events, displayed };
        };
        const restoredC: GridState['userColumns'] = [
            { colId: 'c', created: true, properties: [{ property: 'calculatedExpression', value: '[a] + [b]' }] },
        ];

        test('disabling calculatedColumns with defaultColDef raises the events disabling it alone raises, none, and drops the restored user column from display', async () => {
            const gridOptions: Partial<GridOptions> = {
                calculatedColumns: true,
                initialState: { userColumns: restoredC },
            };
            const before = await runChange(gridOptions, {});
            expect(before.displayed).toEqual(['a', 'b', 'c']);

            const alone = await runChange(gridOptions, { calculatedColumns: false });
            const withDefaultColDef = await runChange(gridOptions, {
                calculatedColumns: false,
                defaultColDef: { width: 150 },
            });

            expect(alone).toEqual({ events: [], displayed: ['a', 'b'] });
            expect(withDefaultColDef).toEqual({ events: [], displayed: ['a', 'b'] });
        });
    });
});
