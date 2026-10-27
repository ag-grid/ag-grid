import { getByRole, waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, asyncSetTimeout, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type { CalculatedColumnsOptions, ColDef, GridOptions } from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';

import {
    cellValue,
    clickDialogButton,
    createGrid,
    getDialog,
    setExpression,
    setTitle,
    setupCalculatedColumnsStateSuite,
} from './calculatedColumnsStateHarness';

async function openDialog(
    calculatedColumns: CalculatedColumnsOptions = { applyDebounce: 400 },
    options: Partial<GridOptions> = {}
) {
    const api = createGrid('calculated-debounce', {
        columnDefs: [{ field: 'a' }, { colId: 'calc', headerName: 'Calc', calculatedExpression: '[a]' }],
        rowData: [{ id: 'r1', a: 10 }],
        calculatedColumns,
        ...options,
    });
    api.showColumnMenu('calc');
    await clickMenuOption('Edit Calculated Column');
    await waitFor(() => getDialog());
    await asyncSetTimeout(0);
    vi.useFakeTimers();
    return api;
}

function closeDialog(): void {
    document.querySelector<HTMLButtonElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
}

describe('calculated columns - applyDebounce', () => {
    setupCalculatedColumnsStateSuite();

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('applies one update after the quiet period, restarting it on each edit', async () => {
        const changed = vi.fn();
        const api = await openDialog(undefined, { onCalculatedColumnChanged: changed });
        setExpression('[A] *');
        await vi.advanceTimersByTimeAsync(300);
        setExpression('[A] * 2');
        setTitle('Double');
        await vi.advanceTimersByTimeAsync(399);

        expect(changed).not.toHaveBeenCalled();
        expect(cellValue(api, 'calc')).toBe(10);
        expect(api.getColumn('calc')!.getColDef().headerName).toBe('Calc');

        await vi.advanceTimersByTimeAsync(1);
        expect(cellValue(api, 'calc')).toBe(20);
        // event delivery is queued separately from the synchronous column update
        await vi.advanceTimersByTimeAsync(1);
        expect(changed).toHaveBeenCalledTimes(1);
        expect(changed).toHaveBeenCalledWith(
            expect.objectContaining({
                changes: {
                    headerName: { oldValue: 'Calc', newValue: 'Double' },
                    calculatedExpression: { oldValue: '[a]', newValue: '[a] * 2' },
                },
            })
        );
        expect(cellValue(api, 'calc')).toBe(20);
        expect(document.querySelector('.ag-row[row-id="r1"] .ag-cell[col-id="calc"]')?.textContent).toBe('20');
    });

    test('closing flushes synchronously and cancels the outstanding timer', async () => {
        const changed = vi.fn();
        const api = await openDialog(undefined, { onCalculatedColumnChanged: changed });
        setExpression('[A] * 2');
        closeDialog();

        expect(api.getColumn('calc')!.getColDef().calculatedExpression).toBe('[a] * 2');
        expect(cellValue(api, 'calc')).toBe(20);
        await vi.advanceTimersByTimeAsync(1000);
        expect(changed).toHaveBeenCalledTimes(1);
    });

    test.each(['typing', 'refresh'] as const)(
        'a %s rejection removes the pending title without discarding a valid expression',
        async (action) => {
            let reject = false;
            const api = await openDialog({
                applyDebounce: 400,
                getValidationErrors: ({ colDef }) =>
                    reject || colDef.headerName === 'Forbidden' ? { headerName: ['Title rejected.'] } : null,
            });
            setTitle('Pending');
            setExpression('[A] * 2');
            await vi.advanceTimersByTimeAsync(200);
            if (action === 'refresh') {
                reject = true;
                api.refreshCalculatedColumns();
            } else {
                setTitle('Forbidden');
            }
            await vi.advanceTimersByTimeAsync(action === 'refresh' ? 200 : 400);
            expect(api.getColumn('calc')!.getColDef().headerName).toBe('Calc');
            expect(cellValue(api, 'calc')).toBe(20);
            expect(getDialog().querySelector('input')!.value).toBe(action === 'refresh' ? 'Pending' : 'Forbidden');
            closeDialog();
            expect(api.getColumn('calc')!.getColDef().headerName).toBe('Calc');
        }
    );

    test('removal through the cell context menu cancels the pending edit', async () => {
        const changed = vi.fn();
        const removed = vi.fn();
        const api = await openDialog(
            { applyDebounce: 1000 },
            { onCalculatedColumnChanged: changed, onCalculatedColumnRemoved: removed }
        );
        setExpression('[A] * 2');
        api.showContextMenu({
            column: api.getColumn('calc')!,
            rowNode: api.getRowNode('r1')!,
            value: cellValue(api, 'calc'),
            source: 'api',
        });
        getByRole(document.body, 'menuitem', { name: 'Remove Calculated Column' }).click();

        expect(api.getColumn('calc')).toBeNull();
        expect(document.querySelector('.ag-calculated-column-form')).toBeNull();
        await vi.advanceTimersByTimeAsync(1200);
        expect(changed).not.toHaveBeenCalled();
        expect(removed).toHaveBeenCalledTimes(1);
        expect(api.getColumn('calc')).toBeNull();
    });

    test('deferred mode still requires Apply', async () => {
        const api = await openDialog({ applyDebounce: 400, applyMode: 'deferred' });
        setExpression('[A] * 2');
        await vi.advanceTimersByTimeAsync(1000);
        expect(cellValue(api, 'calc')).toBe(10);

        clickDialogButton('Apply');
        expect(cellValue(api, 'calc')).toBe(20);
    });

    test.each([undefined, 0])('a delay of %s keeps next-animation-frame application', async (applyDebounce) => {
        const changed = vi.fn();
        const api = await openDialog({ applyDebounce }, { onCalculatedColumnChanged: changed });
        setExpression('[A] *');
        setExpression('[A] * 2');
        expect(cellValue(api, 'calc')).toBe(10);

        vi.advanceTimersToNextFrame();
        expect(cellValue(api, 'calc')).toBe(20);
        await vi.advanceTimersByTimeAsync(1);
        expect(changed).toHaveBeenCalledTimes(1);
    });

    test.each([-1, 1.5, NaN, Infinity])('invalid delay %s warns and falls back to a frame', async (applyDebounce) => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [321] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = await openDialog({ applyDebounce });
        expect(warn.mock.calls.some((args) => args.join(' ').includes('calculatedColumns.applyDebounce'))).toBe(true);

        setExpression('[A] * 2');
        expect(cellValue(api, 'calc')).toBe(10);
        vi.advanceTimersToNextFrame();
        expect(cellValue(api, 'calc')).toBe(20);
    });

    test('state reads and stateUpdated do not flush a pending edit', async () => {
        const stateUpdated = vi.fn();
        const api = await openDialog(undefined, { onStateUpdated: stateUpdated });
        const before = api.getState().userColumns;
        stateUpdated.mockClear();
        setExpression('[A] * 2');
        api.setColumnWidths([{ key: 'a', newWidth: 180 }]);
        await vi.advanceTimersByTimeAsync(100);

        expect(api.getState().userColumns).toEqual(before);
        const colDef = api.getColumnDefs()!.find((def): def is ColDef => 'colId' in def && def.colId === 'calc');
        expect(colDef?.calculatedExpression).toBe('[a]');
        expect(stateUpdated).toHaveBeenCalled();
        for (const [event] of stateUpdated.mock.calls) {
            expect(event.state.userColumns).toEqual(before);
        }
        expect(cellValue(api, 'calc')).toBe(10);

        await vi.advanceTimersByTimeAsync(300);
        expect(cellValue(api, 'calc')).toBe(20);
    });

    test('validation feedback remains immediate while the column update is pending', async () => {
        const api = await openDialog({
            applyDebounce: 400,
            getValidationErrors: () => ({ calculatedExpression: ['Not allowed'] }),
        });
        setExpression('[A] +');
        const input = getDialog().querySelector('textarea')!;
        expect(input.validationMessage).toBe('Not allowed');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(cellValue(api, 'calc')).toBe(10);

        await vi.advanceTimersByTimeAsync(400);
        expect(input.validationMessage).toBe('Not allowed');
        expect(cellValue(api, 'calc')).toBe('#ERROR!');
    });

    test('destroying the grid cancels pending edits', async () => {
        const changed = vi.fn();
        const api = await openDialog(undefined, { onCalculatedColumnChanged: changed });
        setExpression('[A] * 2');
        api.destroy();
        await vi.advanceTimersByTimeAsync(1000);
        expect(changed).not.toHaveBeenCalled();
    });
});
