import { getByRole, waitFor } from '@testing-library/dom';
import { asyncSetTimeout, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type { CalculatedColumnChangedEvent, ColDef } from 'ag-grid-community';
import { _processOnChange } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    getCalculatedColumnDialog,
    openEditDialogViaMenu,
    selectDataType,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

const profit: ColDef = {
    colId: 'profit',
    headerName: 'Profit',
    cellDataType: 'number',
    calculatedExpression: '[revenue] - [cost]',
};
const columnDefs: ColDef[] = [{ field: 'revenue' }, { field: 'cost' }, profit];
const rowData = [{ id: 'r1', revenue: 10, cost: 3 }];

function setTitle(value: string): void {
    const input = getByRole(getCalculatedColumnDialog(), 'textbox', { name: 'Title' }) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function closeDialog(): void {
    document.querySelector<HTMLButtonElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
}

describe('calculatedColumnChanged', () => {
    setupCalculatedColumnsSuite();

    test.each(['api', 'gridOptionsChanged'] as const)('reports declarative changes with source %s', async (source) => {
        const changed = vi.fn<(event: CalculatedColumnChangedEvent) => void>();
        const original = { ...profit };
        const definitions = [{ field: 'revenue' }, { field: 'cost' }, original];
        const api = createGrid(`changed-${source}`, {
            columnDefs: definitions,
            rowData,
            onCalculatedColumnChanged: changed,
        });
        await asyncSetTimeout(0);
        expect(changed).not.toHaveBeenCalled();

        // mutating the application object must not mutate the saved previous values.
        Object.assign(original, {
            headerName: 'Net Profit',
            cellDataType: 'text',
            calculatedExpression: '[revenue] * 2',
            columnGroupShow: 'open',
        });
        const update = () => {
            if (source === 'api') {
                api.setGridOption('columnDefs', [...definitions]);
            } else {
                _processOnChange({ columnDefs: [...definitions] }, api);
            }
        };
        update();
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        const event = changed.mock.calls[0][0];
        const changes = {
            headerName: { oldValue: 'Profit', newValue: 'Net Profit' },
            cellDataType: { oldValue: 'number', newValue: 'text' },
            calculatedExpression: { oldValue: '[revenue] - [cost]', newValue: '[revenue] * 2' },
            columnGroupShow: { oldValue: undefined, newValue: 'open' },
        };
        expect(event).toMatchObject({ column: api.getColumn('profit'), source, expression: '[revenue] * 2' });
        expect(event.changes).toEqual(changes);

        original.width = 240;
        original.filter = true;
        update();
        await asyncSetTimeout(0);
        expect(changed).toHaveBeenCalledTimes(1);

        original.headerName = 'Final Profit';
        update();
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
        expect(changed.mock.calls[1][0].changes).toEqual({
            headerName: { oldValue: 'Net Profit', newValue: 'Final Profit' },
        });
        expect(event.changes).toEqual(changes);
    });

    test('deferred Apply combines changes and preserves the deprecated expression event', async () => {
        const changed = vi.fn<(event: CalculatedColumnChangedEvent) => void>();
        const expressionChanged = vi.fn();
        const api = createGrid('changed-deferred', {
            columnDefs,
            rowData,
            calculatedColumns: { applyMode: 'deferred' },
            onCalculatedColumnChanged: changed,
        });
        api.addEventListener('calculatedColumnExpressionChanged', expressionChanged);
        await openEditDialogViaMenu(api, 'profit');
        setTitle('Net Profit');
        await selectDataType('Text');
        setExpression('[Revenue] * 2');
        expect(changed).not.toHaveBeenCalled();
        clickDialogButton('Apply');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        await asyncSetTimeout(0);
        expect(changed).toHaveBeenCalledTimes(1);
        expect(changed.mock.calls[0][0].changes).toEqual({
            headerName: { oldValue: 'Profit', newValue: 'Net Profit' },
            cellDataType: { oldValue: 'number', newValue: 'text' },
            calculatedExpression: { oldValue: '[revenue] - [cost]', newValue: '[revenue] * 2' },
        });
        expect(changed.mock.calls[0][0].source).toBe('calculatedColumn');
        expect(expressionChanged).toHaveBeenCalledTimes(1);
        expect(expressionChanged).toHaveBeenCalledWith(
            expect.objectContaining({
                expression: '[revenue] * 2',
                oldExpression: '[revenue] - [cost]',
                source: 'calculatedColumn',
            })
        );

        changed.mockClear();
        expressionChanged.mockClear();
        await openEditDialogViaMenu(api, 'profit');
        clickDialogButton('Apply');
        await openEditDialogViaMenu(api, 'profit');
        setTitle('Discarded');
        clickDialogButton('Cancel');
        await asyncSetTimeout(0);
        expect(changed).not.toHaveBeenCalled();
        expect(expressionChanged).not.toHaveBeenCalled();
    });

    test.each([undefined, false, true])('a title-only edit preserves cellDataType %s', async (cellDataType) => {
        const changed = vi.fn<(event: CalculatedColumnChangedEvent) => void>();
        const api = createGrid('changed-title', {
            columnDefs: [...columnDefs.slice(0, 2), { ...profit, cellDataType }],
            rowData,
            calculatedColumns: { applyMode: 'deferred' },
            onCalculatedColumnChanged: changed,
        });
        const originalType = api.getColumn('profit')!.getColDef().cellDataType;
        await openEditDialogViaMenu(api, 'profit');
        setTitle('Net Profit');
        clickDialogButton('Apply');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        expect(changed.mock.calls[0][0].changes).toEqual({
            headerName: { oldValue: 'Profit', newValue: 'Net Profit' },
        });
        expect(api.getColumn('profit')!.getColDef().cellDataType).toBe(originalType);
    });

    test.each(['live', 'deferred'] as const)(
        'a type-only %s edit does not persist a generated title',
        async (applyMode) => {
            const changed = vi.fn<(event: CalculatedColumnChangedEvent) => void>();
            const api = createGrid('changed-type', {
                columnDefs: [...columnDefs.slice(0, 2), { ...profit, headerName: undefined }],
                rowData,
                calculatedColumns: { applyMode },
                onCalculatedColumnChanged: changed,
            });
            await openEditDialogViaMenu(api, 'profit');
            await selectDataType('Text');
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
            }
            await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
            expect(changed.mock.calls[0][0].changes).toEqual({
                cellDataType: { oldValue: 'number', newValue: 'text' },
            });
            expect(api.getColumn('profit')!.getColDef().headerName).toBeUndefined();
        }
    );

    test('live changes are batched and report intermediate expressions on the legacy cadence', async () => {
        const changed = vi.fn<(event: CalculatedColumnChangedEvent) => void>();
        const expressionChanged = vi.fn();
        const api = createGrid('changed-live', { columnDefs, rowData, onCalculatedColumnChanged: changed });
        api.addEventListener('calculatedColumnExpressionChanged', expressionChanged);
        await openEditDialogViaMenu(api, 'profit');
        setTitle('Net Profit');
        setExpression('[Revenue] +');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        expect(changed.mock.calls[0][0].changes).toEqual({
            headerName: { oldValue: 'Profit', newValue: 'Net Profit' },
            calculatedExpression: { oldValue: '[revenue] - [cost]', newValue: '[revenue] +' },
        });
        setExpression('[Revenue] + 1');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
        expect(changed.mock.calls[1][0].changes).toEqual({
            calculatedExpression: { oldValue: '[revenue] +', newValue: '[revenue] + 1' },
        });
        expect(expressionChanged).toHaveBeenCalledTimes(2);
        setTitle('Profit');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(3));
        expect(changed.mock.calls[2][0].changes).toEqual({
            headerName: { oldValue: 'Net Profit', newValue: 'Profit' },
        });
        expect(expressionChanged).toHaveBeenCalledTimes(2);
    });

    test.each(['live', 'deferred'] as const)(
        'creation and removal in %s mode have no Changed event',
        async (applyMode) => {
            const changed = vi.fn<(event: CalculatedColumnChangedEvent) => void>();
            const created = vi.fn();
            const removed = vi.fn();
            const api = createGrid('changed-create-remove', {
                columnDefs: columnDefs.slice(0, 2),
                rowData,
                calculatedColumns: { applyMode },
                onCalculatedColumnChanged: changed,
                onCalculatedColumnCreated: created,
                onCalculatedColumnRemoved: removed,
            });
            showColumnMenu(api, 'revenue');
            await clickMenuOption('Add Calculated Column');
            if (applyMode === 'deferred') {
                setExpression('[Revenue]');
                clickDialogButton('Apply');
            }
            await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
            expect(changed).not.toHaveBeenCalled();
            const column = created.mock.calls[0][0].column;
            if (applyMode === 'live') {
                setExpression('[Revenue]');
                await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
                closeDialog();
                changed.mockClear();
            }
            showColumnMenu(api, column.getColId());
            await clickMenuOption('Remove Calculated Column');
            await waitFor(() => expect(removed).toHaveBeenCalledTimes(1));
            expect(changed).not.toHaveBeenCalled();
        }
    );

    test('state restoration stays silent and resets the baseline for the next edit', async () => {
        const changed = vi.fn<(event: CalculatedColumnChangedEvent) => void>();
        const created = vi.fn();
        const removed = vi.fn();
        const api = createGrid('changed-state', {
            columnDefs: columnDefs.slice(0, 2),
            rowData,
            onCalculatedColumnChanged: changed,
            onCalculatedColumnCreated: created,
            onCalculatedColumnRemoved: removed,
        });
        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
        const colId = created.mock.calls[0][0].column.getColId();
        setTitle('Saved');
        setExpression('[Revenue]');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        closeDialog();
        const state = api.getState();
        const columnState = api.getColumnState();

        await openEditDialogViaMenu(api, colId);
        setTitle('Edited');
        setExpression('[Revenue] * 2');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
        closeDialog();
        changed.mockClear();
        created.mockClear();

        api.resetColumnState();
        expect(api.getColumn(colId)).toBeNull();
        api.applyColumnState({ state: columnState, applyOrder: true });
        expect(api.getColumn(colId)).not.toBeNull();
        api.setState(state);
        expect(api.getColumn(colId)!.getColDef().headerName).toBe('Saved');
        await asyncSetTimeout(0);
        expect(changed).not.toHaveBeenCalled();
        expect(created).not.toHaveBeenCalled();
        expect(removed).not.toHaveBeenCalled();

        await openEditDialogViaMenu(api, colId);
        setTitle('Final');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        expect(changed.mock.calls[0][0].changes).toEqual({ headerName: { oldValue: 'Saved', newValue: 'Final' } });
    });

    test('an ordinary rebuild keeps user overrides without reporting changes', async () => {
        const changed = vi.fn<(event: CalculatedColumnChangedEvent) => void>();
        const api = createGrid('changed-rebuild', { columnDefs, rowData, onCalculatedColumnChanged: changed });
        await openEditDialogViaMenu(api, 'profit');
        setTitle('User Profit');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        closeDialog();
        changed.mockClear();
        api.setGridOption('defaultColDef', { headerName: 'Default', cellDataType: 'text', width: 240 });
        await asyncSetTimeout(0);
        expect(api.getColumn('profit')!.getColDef().headerName).toBe('User Profit');
        expect(changed).not.toHaveBeenCalled();
    });
});
