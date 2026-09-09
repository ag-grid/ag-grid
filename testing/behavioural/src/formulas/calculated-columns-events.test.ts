import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, asyncSetTimeout, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import {
    addCalculatedColumnDef,
    clickDialogButton,
    createGrid,
    getExpressionInput,
    removeColumnDef,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
    updateCalculatedColumnDef,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    test('dispatches calculated column columnDefs lifecycle events', async () => {
        const created = vi.fn();
        const changed = vi.fn();
        const removed = vi.fn();
        const api = createGrid('calculated-api-events', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            onCalculatedColumnCreated: created,
            onCalculatedColumnExpressionChanged: changed,
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
        await waitFor(() => expect(api.getColumn('profit')!.getColDef().headerName).toBe('Profit'));
        expect(changed).not.toHaveBeenCalled();

        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[revenue] * [cost]' });
        await waitFor(() =>
            expect(changed).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('profit'),
                    oldExpression: '[revenue] - [cost]',
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
            onCalculatedColumnExpressionChanged: changed,
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
                    oldExpression: '[revenue] - [cost]',
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
            onCalculatedColumnExpressionChanged: changed,
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
                    oldExpression: '[revenue] - [cost]',
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
});
