import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, GridColumns, GridRows, asyncSetTimeout, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type {
    CalculatedColumnProcessColDefParams,
    ColDef,
    GridApi,
    GridOptions,
    GridState,
    UserColumnProperty,
} from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';

import {
    addViaDialog,
    cellValue,
    clickDialogButton,
    createGrid,
    getDialog,
    propertiesOf,
    selectDataType,
    setExpression,
    setupCalculatedColumnsStateSuite,
} from './calculatedColumnsStateHarness';

type ProcessColDef = (params: CalculatedColumnProcessColDefParams) => ColDef | undefined;

const ROW_DATA = [
    { id: 'r1', g: 'x', a: 10, b: 3 },
    { id: 'r2', g: 'x', a: 5, b: 2 },
];
const columnDefs = (): GridOptions['columnDefs'] => [{ field: 'a' }, { field: 'b' }];

/** A dialog-created calc col as grid state stores it, so a grid can start with one without driving the dialog. */
function userColumnsState(
    colId: string,
    expression: string,
    properties: UserColumnProperty[] = []
): GridState['userColumns'] {
    return [
        {
            colId,
            created: true,
            parentGroupId: null,
            properties: [{ property: 'calculatedExpression', value: expression }, ...properties],
        },
    ];
}

function gridWithUserColumn(
    id: string,
    colId: string,
    expression: string,
    processColDef: ProcessColDef | undefined,
    opts: Partial<GridOptions> = {}
): GridApi {
    return createGrid(id, {
        rowData: ROW_DATA,
        columnDefs: columnDefs(),
        calculatedColumns: processColDef ? { processColDef } : true,
        initialState: { userColumns: userColumnsState(colId, expression) },
        ...opts,
    });
}

async function waitForColumn(api: GridApi, colId: string): Promise<void> {
    await waitFor(() => expect(api.getColumn(colId)).not.toBeNull());
}

function headerOf(api: GridApi, colId: string): string | null {
    return api.getDisplayNameForColumn(api.getColumn(colId)!, 'header');
}

type WarnSpy = { mock: { calls: unknown[][] }; mockRestore(): void };

function warningsWith(spy: WarnSpy, id: number): unknown[][] {
    return spy.mock.calls.filter((args) => args.some((arg) => String(arg).includes(`warning #${id}`)));
}

function layoutOf(api: GridApi, label: string) {
    return {
        columns: new GridColumns(api, label).makeDiagram(true),
        rows: new GridRows(api, label).makeDiagram(true),
    };
}

describe('calculated columns - calculatedColumns.processColDef', () => {
    setupCalculatedColumnsStateSuite();

    let warnSpy: WarnSpy;
    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    test('the callback receives a dialog-created column and its result applies', async () => {
        const processColDef = vi.fn<ProcessColDef>((params) => ({
            ...params.colDef,
            filter: true,
            headerClass: 'b1-header',
        }));
        const api = createGrid('pcd-b1', {
            rowData: ROW_DATA,
            columnDefs: [
                { field: 'a', filter: false },
                { field: 'b', filter: false },
            ],
            calculatedColumns: { processColDef },
        });

        const calcId = await addViaDialog(api, 'a', '[a] * 2');

        expect(processColDef).toHaveBeenCalled();
        const lastParams = processColDef.mock.calls.at(-1)![0];
        expect(lastParams.colDef.calculatedExpression).toBe('[a] * 2');
        expect(lastParams.api).toBe(api);
        const column = api.getColumn(calcId)!;
        expect(column.getColDef().filter).toBe(true);
        expect(column.getColDef().headerClass).toBe('b1-header');
        expect(column.isFilterAllowed()).toBe(true);
        expect(cellValue(api, calcId)).toBe(20);
    });

    test('returning params.colDef is the same as having no callback', async () => {
        const plain = gridWithUserColumn('pcd-b2-plain', 'calc', '[a] * 2', undefined);
        const passthrough = gridWithUserColumn('pcd-b2-pass', 'calc', '[a] * 2', (params) => params.colDef);
        await waitForColumn(plain, 'calc');
        await waitForColumn(passthrough, 'calc');

        expect(passthrough.getColumn('calc')!.getColDef()).toEqual(plain.getColumn('calc')!.getColDef());
        expect(layoutOf(passthrough, 'b2')).toEqual(layoutOf(plain, 'b2'));
        expect(passthrough.getState().userColumns).toEqual(plain.getState().userColumns);
        expect(warningsWith(warnSpy, 335)).toHaveLength(0);
    });

    test.each([
        ['undefined', () => undefined],
        ['null', () => null as unknown as undefined],
    ])('returning %s is the same as having no callback', async (name, processColDef) => {
        const plain = gridWithUserColumn(`pcd-b3-plain-${name}`, 'calc', '[a] * 2', undefined);
        const other = gridWithUserColumn(`pcd-b3-${name}`, 'calc', '[a] * 2', processColDef);
        await waitForColumn(plain, 'calc');
        await waitForColumn(other, 'calc');

        expect(other.getColumn('calc')!.getColDef()).toEqual(plain.getColumn('calc')!.getColDef());
        expect(layoutOf(other, 'b3')).toEqual(layoutOf(plain, 'b3'));
    });

    test('a returned property beats defaultColDef and a column type for the same property', async () => {
        const api = gridWithUserColumn(
            'pcd-b4',
            'calc',
            '[a] * 2',
            (params) => ({ ...params.colDef, type: 'custom', headerClass: 'from-callback', filter: true }),
            {
                defaultColDef: { headerClass: 'from-default', filter: false },
                columnTypes: { custom: { headerClass: 'from-type', filter: false, width: 123 } },
            }
        );
        await waitForColumn(api, 'calc');

        const column = api.getColumn('calc')!;
        expect(column.getColDef().headerClass).toBe('from-callback');
        expect(column.getColDef().filter).toBe(true);
        // The column type still contributes what the callback leaves alone.
        expect(column.getActualWidth()).toBe(123);
        // A plain column keeps the default.
        expect(api.getColumn('a')!.getColDef().headerClass).toBe('from-default');
    });

    test('editing the column in the dialog re-runs the callback', async () => {
        const processColDef = vi.fn<ProcessColDef>((params) => ({
            ...params.colDef,
            enableValue: params.colDef.cellDataType === 'number',
        }));
        const api = createGrid('pcd-b5', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: { processColDef },
        });
        const calcId = await addViaDialog(api, 'a', '[a] * 2');
        await selectDataType('Number');
        clickDialogButton('Apply');
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().enableValue).toBe(true));

        const callsBefore = processColDef.mock.calls.length;
        await selectDataType('Text');
        clickDialogButton('Apply');
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().cellDataType).toBe('text'));
        expect(api.getColumn(calcId)!.getColDef().enableValue).toBe(false);
        expect(processColDef.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    test.each<[string, ColDef, unknown]>([
        ['editable', { editable: true }, false],
        ['suppressPaste', { suppressPaste: false }, true],
        ['field', { field: 'a' }, undefined],
        ['valueGetter', { valueGetter: () => 999 }, undefined],
        ['valueSetter', { valueSetter: () => true }, undefined],
        ['cellEditor', { cellEditor: 'agTextCellEditor' }, undefined],
        ['cellEditorSelector', { cellEditorSelector: () => undefined }, undefined],
    ])('a callback setting protected %s has no effect and warns', async (property, override, forced) => {
        // Suppress only the diagnostic this test asserts on; any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [335] });
        const colId = `calc_${property}`;
        const api = gridWithUserColumn(`pcd-b6-${property}`, colId, '[a] * 2', (params) => ({
            ...params.colDef,
            ...override,
        }));
        await waitForColumn(api, colId);

        expect((api.getColumn(colId)!.getColDef() as Record<string, unknown>)[property]).toBe(forced);
        expect(cellValue(api, colId)).toBe(20);
        const warnings = warningsWith(warnSpy, 335);
        expect(warnings.length).toBeGreaterThan(0);
        expect(warnings[0].join(' ')).toContain(`\`${property}\``);
        expect(warnings[0].join(' ')).toContain(colId);
    });

    test('a callback that drops calculatedExpression keeps the column calculated', async () => {
        const api = gridWithUserColumn('pcd-guard', 'calc', '[a] * 2', () => ({ filter: true }));
        await waitForColumn(api, 'calc');

        const colDef = api.getColumn('calc')!.getColDef();
        expect(colDef.calculatedExpression).toBe('[a] * 2');
        expect(colDef.filter).toBe(true);
        expect(cellValue(api, 'calc')).toBe(20);

        api.showColumnMenu('calc');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getDialog());
        // The dialog shows references by header name.
        expect(getDialog().querySelector('textarea')!.value).toBe('[A] * 2');
    });

    test('callback changes to headerName, cellDataType, calculatedExpression and columnGroupShow apply', async () => {
        const api = gridWithUserColumn('pcd-b7', 'calc', '[a] * 2', (params) => ({
            ...params.colDef,
            headerName: 'Custom',
            cellDataType: 'text',
            calculatedExpression: '[a] + 1',
            columnGroupShow: 'open',
        }));
        await waitForColumn(api, 'calc');

        const colDef = api.getColumn('calc')!.getColDef();
        expect(headerOf(api, 'calc')).toBe('Custom');
        expect(colDef.cellDataType).toBe('text');
        expect(colDef.columnGroupShow).toBe('open');
        expect(Number(cellValue(api, 'calc'))).toBe(11);
    });

    test('a callback suffixing headerName never compounds through dialog edits', async () => {
        const api = createGrid('pcd-b8', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: {
                processColDef: (params) => ({ ...params.colDef, headerName: `${params.colDef.headerName} (custom)` }),
            },
            initialState: {
                userColumns: userColumnsState('calc', '[a] * 2', [{ property: 'headerName', value: 'Profit' }]),
            },
        });
        await waitForColumn(api, 'calc');
        expect(headerOf(api, 'calc')).toBe('Profit (custom)');

        for (const multiplier of [3, 4, 5]) {
            api.showColumnMenu('calc');
            await clickMenuOption('Edit Calculated Column');
            await waitFor(() => getDialog());
            expect(getDialog().querySelector<HTMLInputElement>('input')!.value).toBe('Profit');
            setExpression(`[a] * ${multiplier}`);
            clickDialogButton('Apply');
            await waitFor(() => expect(cellValue(api, 'calc')).toBe(10 * multiplier));
        }

        expect(headerOf(api, 'calc')).toBe('Profit (custom)');
        expect(propertiesOf(api.getState(), 'calc')?.headerName).toBe('Profit');
    });

    test('mutating params.colDef and returning nothing has no effect', async () => {
        const api = gridWithUserColumn('pcd-b9', 'calc', '[a] * 2', (params) => {
            params.colDef.headerClass = 'mutated';
            params.colDef.filter = true;
            params.colDef.calculatedExpression = '[a] + 1';
            return undefined;
        });
        await waitForColumn(api, 'calc');

        const colDef = api.getColumn('calc')!.getColDef();
        expect(colDef.headerClass).toBeUndefined();
        expect(colDef.filter).not.toBe(true);
        expect(cellValue(api, 'calc')).toBe(20);
        expect(propertiesOf(api.getState(), 'calc')).toEqual({ calculatedExpression: '[a] * 2' });
    });

    test('a columnDefs-declared calculated column is never passed to the callback', async () => {
        const processColDef = vi.fn<ProcessColDef>((params) => ({ ...params.colDef, headerClass: 'processed' }));
        const api = createGrid('pcd-b10', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'a' }, { field: 'b' }, { colId: 'declared', calculatedExpression: '[a] + [b]' }],
            calculatedColumns: { processColDef },
            initialState: { userColumns: userColumnsState('calc', '[a] * 2') },
        });
        await waitForColumn(api, 'calc');
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));

        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.colDef.calculatedExpression).toBe('[a] * 2');
        }
        expect(api.getColumn('declared')!.getColDef().headerClass).toBeUndefined();
        expect(api.getColumn('calc')!.getColDef().headerClass).toBe('processed');
    });

    test('a callback enabling values lets the column aggregate in group rows', async () => {
        const api = createGrid('pcd-b11', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
            calculatedColumns: { processColDef: (params) => ({ ...params.colDef, enableValue: true }) },
            initialState: {
                userColumns: userColumnsState('calc', '[a] * 2', [{ property: 'cellDataType', value: 'number' }]),
            },
        });
        await waitForColumn(api, 'calc');
        expect(api.getColumn('calc')!.getColDef().enableValue).toBe(true);

        api.applyColumnState({ state: [{ colId: 'calc', aggFunc: 'sum' }] });

        await waitFor(() => {
            const groupRow = api.getDisplayedRowAtIndex(0)!;
            expect(groupRow.group).toBe(true);
            expect(api.getCellValue({ rowNode: groupRow, colKey: 'calc' })).toBe(30);
        });
    });

    test('a column restored via initialState or api.setState has the callback applied', async () => {
        const processColDef: ProcessColDef = (params) => ({ ...params.colDef, headerClass: 'restored' });
        const viaInitialState = gridWithUserColumn('pcd-e1-initial', 'calc', '[a] * 2', processColDef);
        await waitForColumn(viaInitialState, 'calc');
        expect(viaInitialState.getColumn('calc')!.getColDef().headerClass).toBe('restored');

        const viaSetState = createGrid('pcd-e1-set-state', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: { processColDef },
        });
        viaSetState.setState({ userColumns: userColumnsState('calc', '[a] * 2') });
        await waitForColumn(viaSetState, 'calc');
        expect(viaSetState.getColumn('calc')!.getColDef().headerClass).toBe('restored');
        expect(cellValue(viaSetState, 'calc')).toBe(20);
    });

    test('grid-state column state wins over initial* properties from the callback', async () => {
        const processColDef: ProcessColDef = (params) => ({
            ...params.colDef,
            initialWidth: 321,
            initialSort: 'desc',
            initialAggFunc: 'sum',
        });
        const gridOptions = (): Partial<GridOptions> => ({
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
        });

        const control = gridWithUserColumn('pcd-e2-control', 'calc', '[a] * 2', processColDef, gridOptions());
        await waitForColumn(control, 'calc');
        const controlColumn = control.getColumn('calc')!;
        expect(controlColumn.getActualWidth()).toBe(321);
        expect(controlColumn.getSort()).toBe('desc');
        expect(controlColumn.getAggFunc()).toBe('sum');

        const withState = gridWithUserColumn('pcd-e2-state', 'calc', '[a] * 2', processColDef, {
            ...gridOptions(),
            initialState: {
                userColumns: userColumnsState('calc', '[a] * 2'),
                columnSizing: { columnSizingModel: [{ colId: 'calc', width: 150 }] },
                sort: { sortModel: [{ colId: 'calc', sort: 'asc' }] },
                aggregation: { aggregationModel: [{ colId: 'calc', aggFunc: 'max' }] },
            },
        });
        await waitForColumn(withState, 'calc');
        const column = withState.getColumn('calc')!;
        expect(column.getActualWidth()).toBe(150);
        expect(column.getSort()).toBe('asc');
        expect(column.getAggFunc()).toBe('max');
    });

    test('resetColumnState then applyColumnState re-adds the column with the callback applied', async () => {
        const api = gridWithUserColumn('pcd-e3', 'calc', '[a] * 2', (params) => ({
            ...params.colDef,
            headerClass: 'e3',
        }));
        await waitForColumn(api, 'calc');
        const columnState = api.getColumnState();

        api.resetColumnState();
        await waitFor(() => expect(api.getColumn('calc')).toBeNull());

        api.applyColumnState({ state: columnState, applyOrder: true });
        await waitForColumn(api, 'calc');
        expect(api.getColumn('calc')!.getColDef().headerClass).toBe('e3');
        expect(cellValue(api, 'calc')).toBe(20);
    });

    test('changing the callback via setGridOption re-applies it to existing columns', async () => {
        const api = gridWithUserColumn('pcd-e4', 'calc', '[a] * 2', (params) => ({
            ...params.colDef,
            headerClass: 'one',
        }));
        await waitForColumn(api, 'calc');
        expect(api.getColumn('calc')!.getColDef().headerClass).toBe('one');

        api.setGridOption('calculatedColumns', {
            processColDef: (params) => ({ ...params.colDef, headerClass: 'two', filter: true }),
        });
        await waitFor(() => expect(api.getColumn('calc')!.getColDef().headerClass).toBe('two'));
        expect(api.getColumn('calc')!.getColDef().filter).toBe(true);

        api.setGridOption('calculatedColumns', {
            processColDef: (params) => ({ ...params.colDef, calculatedExpression: '[a] + 100' }),
        });
        await waitFor(() => expect(cellValue(api, 'calc')).toBe(110));
        // The rendered cell refreshes too, not only the value read through the API.
        await waitFor(() =>
            expect(document.querySelector('.ag-row[row-id="r1"] .ag-cell[col-id="calc"]')?.textContent).toBe('110')
        );
        expect(api.getDisplayedRowAtIndex(0)!.data).toEqual(ROW_DATA[0]);
    });

    test('callback-only properties are absent from getState().userColumns', async () => {
        const api = gridWithUserColumn('pcd-e5', 'calc', '[a] * 2', (params) => ({
            ...params.colDef,
            filter: true,
            headerClass: 'e5',
            enableValue: true,
            valueFormatter: (p) => `#${p.value}`,
        }));
        await waitForColumn(api, 'calc');

        expect(propertiesOf(api.getState(), 'calc')).toEqual({ calculatedExpression: '[a] * 2' });
    });

    test('callback-only properties raise no calculated column events', async () => {
        const created = vi.fn();
        const changed = vi.fn();
        const api = createGrid('pcd-e6', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: {
                applyMode: 'deferred',
                processColDef: (params) => ({
                    ...params.colDef,
                    calculatedExpression: '[a] + 1',
                    valueFormatter: (p) => `#${p.value}`,
                }),
            },
            initialState: { userColumns: userColumnsState('calc', '[a] * 2') },
            onCalculatedColumnCreated: created,
            onCalculatedColumnExpressionChanged: changed,
        });
        await waitFor(() => expect(Number(cellValue(api, 'calc'))).toBe(11));
        created.mockClear();
        changed.mockClear();

        // Re-applying the callback (a fresh inline formatter and the rewritten expression again) rebuilds the column.
        api.setGridOption('calculatedColumns', {
            applyMode: 'deferred',
            processColDef: (params) => ({
                ...params.colDef,
                calculatedExpression: '[a] + 1',
                valueFormatter: (p) => `#${p.value}`,
                headerClass: 'rebuilt',
            }),
        });
        await waitFor(() => expect(api.getColumn('calc')!.getColDef().headerClass).toBe('rebuilt'));
        expect(Number(cellValue(api, 'calc'))).toBe(11);

        // A no-op deferred Apply.
        api.showColumnMenu('calc');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getDialog());
        clickDialogButton('Apply');
        await asyncSetTimeout(0);

        expect(created).not.toHaveBeenCalled();
        expect(changed).not.toHaveBeenCalled();
    });

    test('with callback-only properties, real changes still raise the calculated column events', async () => {
        const created = vi.fn();
        const changed = vi.fn();
        const api = createGrid('pcd-e6-control', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: {
                processColDef: (params) => ({ ...params.colDef, valueFormatter: (p) => `#${p.value}` }),
            },
            onCalculatedColumnCreated: created,
            onCalculatedColumnExpressionChanged: changed,
        });

        const calcId = await addViaDialog(api, 'a', '[a] * 2');
        await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
        changed.mockClear();

        api.showColumnMenu(calcId);
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getDialog());
        setExpression('[a] * 3');
        clickDialogButton('Apply');
        await waitFor(() =>
            expect(changed).toHaveBeenCalledWith(
                expect.objectContaining({ oldExpression: '[a] * 2', expression: '[a] * 3' })
            )
        );
        expect(cellValue(api, calcId)).toBe(30);
        expect(created).toHaveBeenCalledTimes(1);
    });
});
