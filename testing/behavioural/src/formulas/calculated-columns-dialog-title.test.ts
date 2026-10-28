import { waitFor } from '@testing-library/dom';
import { clickMenuOption } from 'ag-test-utils';

import type { ColDef, GridApi, GridState, HeaderValueGetterParams } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    getDialog,
    propertiesOf,
    selectDataType,
    setExpression,
    setTitle,
    setupCalculatedColumnsStateSuite,
} from './calculatedColumnsStateHarness';

type ApplyMode = 'live' | 'deferred';
type Kind = 'declared' | 'restored' | 'dialog-created';

const ROW_DATA = [{ id: 'r1', a: 10, b: 3 }];
/** Formats calculated column headers only, so `[a]` / `[b]` stay valid references in the expression. */
function usd({ colDef }: HeaderValueGetterParams): string {
    const { calculatedExpression, field, headerName } = colDef as ColDef;
    return calculatedExpression === undefined ? (field ?? '') : `${headerName} (USD)`;
}

function stateFor(kind: Kind, headerName: string | undefined): GridState['userColumns'] {
    if (kind !== 'restored') {
        return undefined;
    }
    return [
        {
            colId: 'calc',
            created: true,
            parentGroupId: null,
            properties: [
                { property: 'calculatedExpression', value: '[a] - [b]' },
                ...(headerName === undefined ? [] : [{ property: 'headerName' as const, value: headerName }]),
            ],
        },
    ];
}

async function setupGrid(opts: {
    kind: Kind;
    applyMode: ApplyMode;
    callback: boolean;
    headerName?: string;
}): Promise<{ api: GridApi; colId: string }> {
    const { kind, applyMode, callback, headerName } = opts;
    const declared: ColDef[] =
        kind === 'declared' ? [{ colId: 'calc', headerName, calculatedExpression: '[a] - [b]' }] : [];
    const api = createGrid(`title-${kind}-${applyMode}-${callback}`, {
        rowData: ROW_DATA,
        columnDefs: [{ field: 'a' }, { field: 'b' }, ...declared],
        defaultColDef: { headerValueGetter: usd },
        calculatedColumns: {
            applyMode,
            // the callback adds its own suffix, which must never reach the title either
            processColDef: callback
                ? (params) => ({ ...params.colDef, headerName: `${params.colDef.headerName ?? ''}*` })
                : undefined,
        },
        initialState: { userColumns: stateFor(kind, headerName) },
    });
    if (kind === 'dialog-created') {
        const before = new Set(api.getAllGridColumns().map((col) => col.getColId()));
        api.showColumnMenu('a');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getDialog());
        setTitle(headerName ?? '');
        setExpression('[a] - [b]');
        clickDialogButton('Apply');
        closeOpenDialogs();
        const colId = await waitFor(() => {
            const added = api
                .getAllGridColumns()
                .find((col) => !before.has(col.getColId()))
                ?.getColId();
            expect(added && propertiesOf(api.getState(), added)?.calculatedExpression).toBe('[a] - [b]');
            return added!;
        });
        return { api, colId };
    }
    await waitFor(() => expect(api.getColumn('calc')).not.toBeNull());
    return { api, colId: 'calc' };
}

function closeOpenDialogs(): void {
    for (const button of document.querySelectorAll<HTMLButtonElement>('.ag-dialog .ag-panel-title-bar-button')) {
        button.click();
    }
}

async function openEdit(api: GridApi, colId: string): Promise<void> {
    api.showColumnMenu(colId);
    await clickMenuOption('Edit Calculated Column');
    await waitFor(() => getDialog());
}

function dialogTitle(): string {
    return getDialog().querySelector<HTMLInputElement>('input')!.value;
}

function header(api: GridApi, colId: string): string | null {
    return api.getDisplayNameForColumn(api.getColumn(colId)!, 'header');
}

/** The title the user owns: saved in `userColumns` once edited, the declared definition's otherwise. */
function storedTitle(api: GridApi, colId: string): unknown {
    return propertiesOf(api.getState(), colId)?.headerName ?? (api.getColumnDef(colId) as ColDef | null)?.headerName;
}

/** Opens the dialog, records the title it shows, renames and closes it. */
async function rename(api: GridApi, colId: string, applyMode: ApplyMode, title: string): Promise<string> {
    await openEdit(api, colId);
    const shown = dialogTitle();
    setTitle(title);
    if (applyMode === 'deferred') {
        clickDialogButton('Apply');
    }
    closeOpenDialogs();
    await waitFor(() => expect(propertiesOf(api.getState(), colId)?.headerName).toBe(title));
    return shown;
}

describe('calculated columns - the dialog Title edits the authored title', () => {
    setupCalculatedColumnsStateSuite();

    const cases = (['declared', 'restored', 'dialog-created'] as const).flatMap((kind) =>
        (['live', 'deferred'] as const).flatMap((applyMode) =>
            [false, true].map((callback) => ({ kind, applyMode, callback }))
        )
    );

    test.each(cases)(
        'a $kind column ($applyMode, processColDef: $callback) shows and saves the unformatted title',
        async ({ kind, applyMode, callback }) => {
            const { api, colId } = await setupGrid({ kind, applyMode, callback, headerName: 'Profit' });
            const suffix = callback && kind !== 'declared' ? '* (USD)' : ' (USD)';
            expect(header(api, colId)).toBe(`Profit${suffix}`);

            expect(await rename(api, colId, applyMode, 'Profit 2025')).toBe('Profit');
            expect(header(api, colId)).toBe(`Profit 2025${suffix}`);

            // repeated edits never accumulate the format
            expect(await rename(api, colId, applyMode, 'Profit 2026')).toBe('Profit 2025');
            expect(header(api, colId)).toBe(`Profit 2026${suffix}`);

            await openEdit(api, colId);
            expect(dialogTitle()).toBe('Profit 2026');
        }
    );

    test.each(cases)(
        'type and expression edits leave the untouched title of a $kind column unchanged ($applyMode, processColDef: $callback)',
        async ({ kind, applyMode, callback }) => {
            const { api, colId } = await setupGrid({ kind, applyMode, callback, headerName: 'Profit' });

            await openEdit(api, colId);
            await selectDataType('Text');
            setExpression('[a] + [b]');
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
            }
            closeOpenDialogs();
            await waitFor(() => expect(propertiesOf(api.getState(), colId)?.calculatedExpression).toBe('[a] + [b]'));

            expect(storedTitle(api, colId)).toBe('Profit');
            await openEdit(api, colId);
            expect(dialogTitle()).toBe('Profit');
        }
    );

    test.each(['declared', 'restored'] as const)(
        'a %s column without a headerName shows an unformatted fallback that an expression edit does not persist',
        async (kind) => {
            const { api, colId } = await setupGrid({ kind, applyMode: 'live', callback: false });
            await openEdit(api, colId);
            expect(dialogTitle()).toBe('calc');
            setExpression('[a] + [b]');
            closeOpenDialogs();
            await waitFor(() => expect(propertiesOf(api.getState(), colId)?.calculatedExpression).toBe('[a] + [b]'));

            expect(propertiesOf(api.getState(), colId)).not.toHaveProperty('headerName');
            expect(api.getColumn(colId)!.getColDef().headerName).toBeUndefined();
        }
    );

    test.each([false, true])(
        'a user header rename is shown in the dialog without the format (processColDef: %s)',
        async (callback) => {
            const { api, colId } = await setupGrid({
                kind: 'restored',
                applyMode: 'deferred',
                callback,
                headerName: 'Profit',
            });
            api.applyColumnState({ state: [{ colId, headerName: 'Renamed' }] });
            expect(header(api, colId)).toBe('Renamed');

            await openEdit(api, colId);
            expect(dialogTitle()).toBe('Renamed');
            setExpression('[a] + [b]');
            clickDialogButton('Apply');
            await waitFor(() => expect(propertiesOf(api.getState(), colId)?.calculatedExpression).toBe('[a] + [b]'));

            // the rename is the column's own override; an unrelated edit does not copy it into the title
            expect(propertiesOf(api.getState(), colId)?.headerName).toBe('Profit');
        }
    );
});
