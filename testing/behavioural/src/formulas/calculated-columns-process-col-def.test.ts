import { waitFor, within } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clickMenuOption,
} from 'ag-test-utils';
import { vi } from 'vitest';

import type {
    CalculatedColumnProcessColDefParams,
    CalculatedColumnsOptions,
    ColDef,
    ColGroupDef,
    GridApi,
    GridOptions,
    GridState,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    Module,
    UserColumnProperty,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    GridStateModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    enableDevValidations,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    PivotModule,
    RowGroupingModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import {
    addViaDialog,
    cellValue,
    clickDialogButton,
    createGrid,
    getCalculatedColumnDialog,
    propertiesOf,
    selectDataType,
    setExpression,
    setTitle,
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

    test.each<[string, string, CalculatedColumnProcessColDefParams['expressionValidation']]>([
        ['a valid expression', '[a] + [b]', { valid: true }],
        ['an empty expression', '', { valid: true }],
        ['a reference to a missing column', '[missing] * 2', { valid: false, reason: 'unknownReference' }],
        ['an expression that fails to parse', '[a] +', { valid: false, reason: 'invalidExpression' }],
    ])('expressionValidation is correct for a restored column with %s', async (name, expression, expected) => {
        const processColDef = vi.fn<ProcessColDef>((params) => params.colDef);
        const api = gridWithUserColumn(`pcd-valid-${name}`, 'calc', expression, processColDef);
        await waitForColumn(api, 'calc');

        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.expressionValidation).toEqual(expected);
        }
    });

    test('expressionValidation follows the expression while typing in the dialog', async () => {
        const processColDef = vi.fn<ProcessColDef>((params) => params.colDef);
        const api = createGrid('pcd-valid-dialog', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: { processColDef },
        });
        api.showColumnMenu('a');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());
        const lastState = () => processColDef.mock.calls.at(-1)![0].expressionValidation;

        setExpression('[a] +');
        await waitFor(() => expect(lastState()).toEqual({ valid: false, reason: 'invalidExpression' }));
        setExpression('[a] + [b]');
        await waitFor(() => expect(lastState()).toEqual({ valid: true }));
    });

    test.each(['customValidation', 'restrictedReference'] as const)(
        'expressionValidation includes %s rejections and restores them without rerunning dialog callbacks',
        async (reason) => {
            const processColDef = vi.fn<ProcessColDef>((params) => params.colDef);
            const changed = vi.fn();
            const getValidationErrors = vi.fn<NonNullable<CalculatedColumnsOptions['getValidationErrors']>>(
                ({ referencedColumns }) =>
                    reason === 'customValidation' && referencedColumns.some((col) => col.getColId() === 'b')
                        ? { calculatedExpression: ['Not allowed'] }
                        : null
            );
            const isColumnReferenceable = vi.fn<NonNullable<CalculatedColumnsOptions['isColumnReferenceable']>>(
                ({ column }) => reason !== 'restrictedReference' || column.getColId() !== 'b'
            );
            const calculatedColumns = { processColDef, getValidationErrors, isColumnReferenceable };
            const api = createGrid(`pcd-rejection-${reason}`, {
                rowData: ROW_DATA,
                columnDefs: columnDefs(),
                calculatedColumns,
                onCalculatedColumnChanged: changed,
            });
            const calcId = await addViaDialog(api, 'a', '[b] * 2');
            const expected = { valid: false, reason };

            await waitFor(() =>
                expect(changed).toHaveBeenCalledWith(expect.objectContaining({ expressionValidation: expected }))
            );
            expect(processColDef.mock.calls.at(-1)![0].expressionValidation).toEqual(expected);
            expect(cellValue(api, calcId)).toBe(reason === 'customValidation' ? '#ERROR!' : '#REF!');

            const state = api.getState();
            getValidationErrors.mockClear();
            isColumnReferenceable.mockClear();
            processColDef.mockClear();
            const restored = createGrid(`pcd-rejection-restored-${reason}`, {
                rowData: ROW_DATA,
                columnDefs: columnDefs(),
                calculatedColumns,
                initialState: state,
            });
            await waitForColumn(restored, calcId);
            expect(processColDef.mock.calls.at(-1)![0].expressionValidation).toEqual(expected);
            expect(getValidationErrors).not.toHaveBeenCalled();
            expect(isColumnReferenceable).not.toHaveBeenCalled();

            api.showColumnMenu(calcId);
            await clickMenuOption('Edit Calculated Column');
            await waitFor(() => getCalculatedColumnDialog());
            setExpression('[a] * 2');
            await waitFor(() => expect(cellValue(api, calcId)).toBe(20));
            expect(processColDef.mock.calls.at(-1)![0].expressionValidation).toEqual({ valid: true });
            await waitFor(() => expect(changed.mock.calls.at(-1)![0].expressionValidation).toEqual({ valid: true }));
        }
    );

    test('returning params.colDef is the same as having no callback', async () => {
        const plain = gridWithUserColumn('pcd-b2-plain', 'calc', '[a] * 2', undefined);
        const passthrough = gridWithUserColumn('pcd-b2-pass', 'calc', '[a] * 2', (params) => params.colDef);
        await waitForColumn(plain, 'calc');
        await waitForColumn(passthrough, 'calc');

        expect(passthrough.getColumn('calc')!.getColDef()).toEqual(plain.getColumn('calc')!.getColDef());
        expect(layoutOf(passthrough, 'b2')).toEqual(layoutOf(plain, 'b2'));
        expect(passthrough.getState().userColumns).toEqual(plain.getState().userColumns);
        expect(warningsWith(warnSpy, 336)).toHaveLength(0);
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
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [336] });
        const colId = `calc_${property}`;
        const api = gridWithUserColumn(`pcd-b6-${property}`, colId, '[a] * 2', (params) => ({
            ...params.colDef,
            ...override,
        }));
        await waitForColumn(api, colId);

        expect((api.getColumn(colId)!.getColDef() as Record<string, unknown>)[property]).toBe(forced);
        expect(cellValue(api, colId)).toBe(20);
        const warnings = warningsWith(warnSpy, 336);
        expect(warnings.length).toBeGreaterThan(0);
        expect(warnings[0].join(' ')).toContain(`\`${property}\``);
        expect(warnings[0].join(' ')).toContain(colId);
    });

    test('a callback changing colId has no effect and warns', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [336] });
        const api = gridWithUserColumn('pcd-colid', 'calc', '[a] * 2', (params) => ({
            ...params.colDef,
            colId: 'renamed',
        }));
        await waitForColumn(api, 'calc');

        expect(api.getColumn('renamed')).toBeNull();
        expect(cellValue(api, 'calc')).toBe(20);
        const warnings = warningsWith(warnSpy, 336);
        expect(warnings.length).toBeGreaterThan(0);
        expect(warnings[0].join(' ')).toContain('`colId`');
    });

    test('a callback returning the same colId does not warn', async () => {
        const api = gridWithUserColumn('pcd-colid-same', 'calc', '[a] * 2', (params) => ({
            ...params.colDef,
            colId: 'calc',
        }));
        await waitForColumn(api, 'calc');

        expect(warningsWith(warnSpy, 336)).toHaveLength(0);
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
        await waitFor(() => getCalculatedColumnDialog());
        // The dialog shows references by header name.
        expect(getCalculatedColumnDialog().querySelector('textarea')!.value).toBe('[A] * 2');
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

    test.each<[string, ColDef['columnGroupShow'], string]>([
        ['an open', 'open', 'open'],
        ['a closed', 'closed', 'closed'],
    ])('the callback receives the columnGroupShow of %s anchor column', async (_, anchorShow, expected) => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid(`pcd-group-show-${expected}`, {
            rowData: ROW_DATA,
            columnDefs: [
                {
                    groupId: 'money',
                    openByDefault: anchorShow === 'open',
                    children: [{ field: 'a', columnGroupShow: anchorShow }, { field: 'b' }],
                } as ColGroupDef,
            ],
            calculatedColumns: { processColDef },
        });

        await addViaDialog(api, 'a', '[a] * 2');

        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.colDef.columnGroupShow).toBe(expected);
        }
    });

    test('the callback receives no columnGroupShow when the anchor column has none', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-group-show-none', {
            rowData: ROW_DATA,
            columnDefs: [
                {
                    groupId: 'money',
                    children: [{ field: 'a' }, { field: 'b', columnGroupShow: 'open' }],
                } as ColGroupDef,
            ],
            calculatedColumns: { processColDef },
        });

        await addViaDialog(api, 'a', '[a] * 2');

        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.colDef.columnGroupShow).toBeUndefined();
        }
    });

    test('the callback receives the column the calculated column was added from as sourceColumn', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-column', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: { processColDef },
        });

        await addViaDialog(api, 'b', '[a] * 2');

        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn).toBe(api.getColumn('b'));
        }
    });

    test('sourceColumn is null for a restored column that is not in a group', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = gridWithUserColumn('pcd-source-column-restored', 'calc', '[a] * 2', processColDef);
        await waitForColumn(api, 'calc');

        expect(processColDef).toHaveBeenCalled();
        expect(processColDef.mock.calls.at(-1)![0].sourceColumn).toBeNull();
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
            await waitFor(() => getCalculatedColumnDialog());
            expect(getCalculatedColumnDialog().querySelector<HTMLInputElement>('input')!.value).toBe('Profit');
            setExpression(`[a] * ${multiplier}`);
            clickDialogButton('Apply');
            await waitFor(() => expect(cellValue(api, 'calc')).toBe(10 * multiplier));
        }

        expect(headerOf(api, 'calc')).toBe('Profit (custom)');
        expect(propertiesOf(api.getState(), 'calc')?.headerName).toBe('Profit');
    });

    test('a dialog data-type edit is saved when the callback overrides cellDataType', async () => {
        const api = createGrid('pcd-b8-type', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: { processColDef: (params) => ({ ...params.colDef, cellDataType: 'text' }) },
            initialState: {
                userColumns: userColumnsState('calc', '[a] * 2', [{ property: 'cellDataType', value: 'number' }]),
            },
        });
        await waitForColumn(api, 'calc');
        const openEditDialog = async () => {
            api.showColumnMenu('calc');
            await clickMenuOption('Edit Calculated Column');
            await waitFor(() => getCalculatedColumnDialog());
        };
        const shownDataType = () =>
            getCalculatedColumnDialog().querySelector('.ag-select .ag-picker-field-display')!.textContent;

        await openEditDialog();
        expect(shownDataType()).toBe('Number');
        await selectDataType('Text');
        clickDialogButton('Apply');
        await waitFor(() => expect(propertiesOf(api.getState(), 'calc')?.cellDataType).toBe('text'));

        await openEditDialog();
        expect(shownDataType()).toBe('Text');
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

    test.each([true, false])('equivalent options do not rebuild columns (callback: %s)', async (withCallback) => {
        const processColDef = vi.fn<ProcessColDef>((params) => params.colDef);
        const columnsLoaded = vi.fn();
        const callback = withCallback ? processColDef : undefined;
        const api = gridWithUserColumn('pcd-equivalent-options', 'calc', '[a] * 2', callback, {
            onNewColumnsLoaded: columnsLoaded,
        });
        await asyncSetTimeout(0);
        processColDef.mockClear();
        columnsLoaded.mockClear();

        api.setGridOption('calculatedColumns', { processColDef: callback });
        api.setGridOption('calculatedColumns', { processColDef: callback });
        await asyncSetTimeout(0);

        expect(processColDef).not.toHaveBeenCalled();
        expect(columnsLoaded).not.toHaveBeenCalled();
        expect(cellValue(api, 'calc')).toBe(20);
    });

    test('dialog settings update without rebuilding columns or re-running the callback', async () => {
        const processColDef = vi.fn<ProcessColDef>((params) => params.colDef);
        const columnsLoaded = vi.fn();
        const api = gridWithUserColumn('pcd-dialog-options', 'calc', '[a] * 2', processColDef, {
            onNewColumnsLoaded: columnsLoaded,
        });
        await asyncSetTimeout(0);
        processColDef.mockClear();
        columnsLoaded.mockClear();

        api.setGridOption('calculatedColumns', {
            processColDef,
            applyMode: 'deferred',
            expressionPickers: [],
        });
        await asyncSetTimeout(0);
        expect(processColDef).not.toHaveBeenCalled();
        expect(columnsLoaded).not.toHaveBeenCalled();

        api.showColumnMenu('calc');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());
        const dialog = within(getCalculatedColumnDialog());
        expect(dialog.getByRole<HTMLButtonElement>('button', { name: 'Apply' }).disabled).toBe(false);
        expect(dialog.queryByRole('button', { name: /^(Columns|Functions|Operators)$/ })).toBeNull();
    });

    test.each([true, {}] as const)('removing the callback restores authored settings (%j)', async (options) => {
        const processColDef = vi.fn<ProcessColDef>((params) => ({ ...params.colDef, headerClass: 'processed' }));
        const api = gridWithUserColumn('pcd-remove-callback', 'calc', '[a] * 2', processColDef);
        await waitForColumn(api, 'calc');
        expect(api.getColumn('calc')!.getColDef().headerClass).toBe('processed');
        processColDef.mockClear();

        api.setGridOption('calculatedColumns', options);

        expect(api.getColumn('calc')!.getColDef().headerClass).toBeUndefined();
        expect(processColDef).not.toHaveBeenCalled();
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
            onCalculatedColumnChanged: changed,
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
        await waitFor(() => getCalculatedColumnDialog());
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
            onCalculatedColumnChanged: changed,
        });

        const calcId = await addViaDialog(api, 'a', '[a] * 2');
        await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
        changed.mockClear();

        api.showColumnMenu(calcId);
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());
        setExpression('[a] * 3');
        clickDialogButton('Apply');
        await waitFor(() =>
            expect(changed).toHaveBeenCalledWith(
                expect.objectContaining({
                    changes: { calculatedExpression: { oldValue: '[a] * 2', newValue: '[a] * 3' } },
                })
            )
        );
        expect(cellValue(api, calcId)).toBe(30);
        expect(created).toHaveBeenCalledTimes(1);
    });

    test('a user title edit raises calculatedColumnChanged when the callback fixes headerName', async () => {
        const changed = vi.fn();
        const api = createGrid('pcd-e-header', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: {
                applyMode: 'deferred',
                processColDef: (params) => ({ ...params.colDef, headerName: 'Report' }),
            },
            initialState: {
                userColumns: userColumnsState('calc', '[a] * 2', [{ property: 'headerName', value: 'Profit' }]),
            },
            onCalculatedColumnChanged: changed,
        });
        await waitForColumn(api, 'calc');

        api.showColumnMenu('calc');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());
        setTitle('Margin');
        clickDialogButton('Apply');

        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        expect(changed.mock.calls[0][0].changes).toEqual({ headerName: { oldValue: 'Profit', newValue: 'Margin' } });
        expect(propertiesOf(api.getState(), 'calc')?.headerName).toBe('Margin');
        expect(headerOf(api, 'calc')).toBe('Report');
    });

    test('an empty expression returned by the callback gives blank values', async () => {
        const api = gridWithUserColumn('pcd-empty-expression', 'calc', '[a] * 2', (params) => ({
            ...params.colDef,
            calculatedExpression: '',
        }));
        await waitForColumn(api, 'calc');

        expect(api.getColumn('calc')!.getColDef().calculatedExpression).toBe('');
        expect(cellValue(api, 'calc')).toBe('');
    });

    test('a saved validation error still blocks a column whose expression the callback rewrites', async () => {
        const api = createGrid('pcd-saved-error', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: {
                processColDef: (params) => ({
                    ...params.colDef,
                    calculatedExpression: `(${params.colDef.calculatedExpression})`,
                }),
            },
            initialState: {
                userColumns: [
                    {
                        ...userColumnsState('calc', '[a] * 2')![0],
                        calculatedExpressionError: {
                            expression: '[a] * 2',
                            reason: 'customValidation',
                            messages: ['Not allowed'],
                        },
                    },
                ],
            },
        });
        await waitForColumn(api, 'calc');

        expect(api.getColumn('calc')!.getColDef().calculatedExpression).toBe('([a] * 2)');
        expect(cellValue(api, 'calc')).toBe('#ERROR!');
    });

    test('the validation state event follows the expression the callback rewrites', async () => {
        const validity = vi.fn();
        const api = createGrid('pcd-validation-effective', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: {
                processColDef: (params) =>
                    params.colDef.colId === 'calc'
                        ? { ...params.colDef, calculatedExpression: '[ref] + 1' }
                        : params.colDef,
            },
            initialState: {
                userColumns: [...userColumnsState('ref', '[a]')!, ...userColumnsState('calc', '[a] * 2')!],
            },
            onCalculatedColumnValidationStateChanged: validity,
        });
        await waitFor(() => expect(cellValue(api, 'calc')).toBe(11));
        expect(validity).not.toHaveBeenCalled();

        api.showColumnMenu('ref');
        await clickMenuOption('Remove Calculated Column');

        await waitFor(() =>
            expect(validity).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('calc'),
                    expression: '[ref] + 1',
                    valid: false,
                    reason: 'unknownReference',
                })
            )
        );
    });

    test('the validation state event follows a callback replaced through setGridOption', async () => {
        const validity = vi.fn();
        const passthrough: ProcessColDef = (params) => params.colDef;
        const api = gridWithUserColumn('pcd-validation-option-change', 'calc', '[a] * 2', passthrough, {
            onCalculatedColumnValidationStateChanged: validity,
        });
        await waitFor(() => expect(cellValue(api, 'calc')).toBe(20));

        api.setGridOption('calculatedColumns', {
            processColDef: (params) => ({ ...params.colDef, calculatedExpression: '[missing]' }),
        });
        await waitFor(() =>
            expect(validity).toHaveBeenCalledWith(
                expect.objectContaining({ expression: '[missing]', valid: false, reason: 'unknownReference' })
            )
        );

        validity.mockClear();
        api.setGridOption('calculatedColumns', { processColDef: passthrough });
        await waitFor(() =>
            expect(validity).toHaveBeenCalledWith(expect.objectContaining({ expression: '[a] * 2', valid: true }))
        );
    });

    test('replacing the callback from inside the callback ends on the last callback, with one validation event', async () => {
        const passthrough: ProcessColDef = (params) => params.colDef;
        const api = gridWithUserColumn('pcd-nested-option-change', 'u', '[a] * 2', passthrough);
        await waitFor(() => expect(cellValue(api, 'u')).toBe(20));
        const events: { colId: string; valid: boolean; reason?: string }[] = [];
        api.addEventListener('calculatedColumnValidationStateChanged', (event) =>
            events.push({ colId: event.column.getColId(), valid: event.valid, reason: event.reason })
        );

        const breaking: ProcessColDef = (params) => ({ ...params.colDef, calculatedExpression: '[missing] * 2' });
        let calls = 0;
        let innerCallMade = false;
        const outer: ProcessColDef = (params) => {
            if (++calls === 1) {
                api.setGridOption('calculatedColumns', { processColDef: breaking });
                innerCallMade = true;
            }
            return params.colDef;
        };
        api.setGridOption('calculatedColumns', { processColDef: outer });

        await waitFor(() => expect(events).toHaveLength(1), { timeout: 1000 });
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);

        expect({ calls: calls > 0, innerCallMade }).toEqual({ calls: true, innerCallMade: true });
        expect(api.getColumn('u')!.getColDef().calculatedExpression).toBe('[missing] * 2');
        expect(cellValue(api, 'u')).toBe('#PARSE!');
        expect(events).toEqual([{ colId: 'u', valid: false, reason: 'unknownReference' }]);
    });

    test('an unchanged restricted expression can still be applied when the callback rewrites it', async () => {
        const changed = vi.fn();
        const api = createGrid('pcd-restricted-unchanged', {
            rowData: ROW_DATA,
            columnDefs: columnDefs(),
            calculatedColumns: {
                applyMode: 'deferred',
                isColumnReferenceable: ({ colDef }) => colDef.field !== 'b',
                processColDef: (params) => ({
                    ...params.colDef,
                    calculatedExpression: `(${params.colDef.calculatedExpression})`,
                }),
            },
            initialState: { userColumns: userColumnsState('calc', '[b] * 2') },
            onCalculatedColumnChanged: changed,
        });
        await waitForColumn(api, 'calc');

        api.showColumnMenu('calc');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());
        setTitle('Doubled');
        clickDialogButton('Apply');

        await waitFor(() => expect(propertiesOf(api.getState(), 'calc')?.headerName).toBe('Doubled'));
        expect(propertiesOf(api.getState(), 'calc')?.calculatedExpression).toBe('[b] * 2');
        expect(cellValue(api, 'calc')).toBe(6);
    });

    test('sourceColumn is the auto group column when the column is added from it', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
            calculatedColumns: { processColDef },
        });
        await waitFor(() => expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull());

        await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');

        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn).toBe(api.getColumn('ag-Grid-AutoColumn'));
        }
    });

    test('sourceColumn is the auto group column for a column added from it when state restores it before the column whose callback groups', async () => {
        const groupingExpression = '[a] * 2';
        const processColDef = vi.fn<ProcessColDef>((params) =>
            params.colDef.calculatedExpression === groupingExpression ? { ...params.colDef, rowGroup: true } : undefined
        );
        const api = createGrid('pcd-source-auto-group-state-order', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            calculatedColumns: { processColDef },
        });
        const groupingId = await addViaDialog(api, 'a', groupingExpression);
        api.applyColumnState({ state: [{ colId: groupingId, rowGroup: true }] });
        await waitForColumn(api, 'ag-Grid-AutoColumn');
        const fromGroupId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[b] * 3');
        expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual([groupingId]);
        const restoredState = [{ colId: fromGroupId }, { colId: groupingId }];
        api.resetColumnState();
        await waitFor(() => expect([api.getColumn(groupingId), api.getColumn(fromGroupId)]).toEqual([null, null]));
        processColDef.mockClear();

        api.applyColumnState({ state: restoredState, applyOrder: true });
        await waitForColumn(api, groupingId);
        await waitForColumn(api, fromGroupId);
        await asyncSetTimeout(0);

        const pairs = processColDef.mock.calls
            .map(([params]) => [params.colDef.colId, params.sourceColumn?.getColId()])
            .sort(([first], [second]) => String(first).localeCompare(String(second)));
        expect(pairs).toEqual(
            [
                [fromGroupId, 'ag-Grid-AutoColumn'],
                [groupingId, 'a'],
            ].sort(([first], [second]) => first.localeCompare(second))
        );
        expect(processColDef.mock.calls.find(([params]) => params.colDef.colId === fromGroupId)![0].sourceColumn).toBe(
            api.getColumn('ag-Grid-AutoColumn')
        );
    });

    describe('with a level the user grouped alone under a hierarchy source that is not grouped', () => {
        const year = 'ag-Grid-HierarchyColumn-date-year';
        const hierarchyGrid = (id: string, opts: Partial<GridOptions> = {}) => {
            const api = createGrid(id, {
                rowData: ROW_DATA.map((row) => ({ ...row, date: new Date(2020, 5, 15) })),
                columnDefs: [
                    { field: 'date', rowGroup: false, enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'a' },
                    { field: 'b' },
                ],
                ...opts,
            });
            api.setRowGroupColumns([year]);
            return api;
        };

        test('adding a calculated column from the column menu keeps the level grouped', async () => {
            const api = hierarchyGrid('pcd-hierarchy-level-kept');
            const before = api.getRowGroupColumns().map((col) => col.getColId());

            await addViaDialog(api, 'a', '[a] * 2');
            await asyncSetTimeout(0);

            expect({ before, after: api.getRowGroupColumns().map((col) => col.getColId()) }).toEqual({
                before: [year],
                after: [year],
            });
        });

        test('sourceColumn stays the auto group column for a calculated column added from it when another is added', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = hierarchyGrid('pcd-hierarchy-source-kept', { calculatedColumns: { processColDef } });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const firstId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            processColDef.mockClear();

            await addViaDialog(api, 'a', '[b] * 2');

            const autoColumn = api.getColumn('ag-Grid-AutoColumn');
            const firstCalls = processColDef.mock.calls.filter(([params]) => params.colDef.colId === firstId);
            expect({ autoColumn: autoColumn?.getColId(), calls: firstCalls.length > 0 }).toEqual({
                autoColumn: 'ag-Grid-AutoColumn',
                calls: true,
            });
            for (const [params] of firstCalls) {
                expect(params.sourceColumn).toBe(autoColumn);
            }
        });
    });

    test('adding a calculated column keeps the grouping the user set by a column whose processColDef says rowGroup false, and sourceColumn stays the auto group column for the columns added from it', async () => {
        const holder: { firstId?: string } = {};
        const processColDef = vi.fn<ProcessColDef>((params) =>
            params.colDef.colId === holder.firstId ? { ...params.colDef, rowGroup: false } : undefined
        );
        const api = createGrid('pcd-user-grouping-kept-over-process-col-def', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn');
        const firstId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
        holder.firstId = firstId;
        const secondId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[b] * 2');
        api.setRowGroupColumns([firstId]);
        const autoColumn = api.getColumn('ag-Grid-AutoColumn');
        expect(autoColumn).not.toBeNull();
        processColDef.mockClear();

        await addViaDialog(api, 'a', '[a] + [b]');

        const firstCalls = processColDef.mock.calls.filter(([params]) => params.colDef.colId === firstId);
        const secondCalls = processColDef.mock.calls.filter(([params]) => params.colDef.colId === secondId);
        expect({
            grouped: api.getRowGroupColumns().map((col) => col.getColId()),
            autoColumnKept: api.getColumn('ag-Grid-AutoColumn') === autoColumn,
            firstCalled: firstCalls.length > 0,
            secondCalled: secondCalls.length > 0,
        }).toEqual({ grouped: [firstId], autoColumnKept: true, firstCalled: true, secondCalled: true });
        for (const [params] of [...firstCalls, ...secondCalls]) {
            expect(params.sourceColumn).toBe(autoColumn);
        }
    });

    test('sourceColumn is null once a column rebuild removes the grouping behind the auto group column', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-removed', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', type: 'grouped', hide: true }, { field: 'a' }, { field: 'b' }],
            columnTypes: { grouped: { rowGroup: true } },
            calculatedColumns: { processColDef },
        });
        await waitFor(() => expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull());
        const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { grouped: { rowGroup: false } });

        expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
        expect(api.getColumn(calcId)).not.toBeNull();
        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn).toBeNull();
        }
    });

    test('sourceColumn is the auto group column again, in one processColDef call, once columnTypes restart the grouping that was cleared', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-restarted', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', type: 'grouped', hide: true }, { field: 'a' }, { field: 'b' }],
            columnTypes: { grouped: { rowGroup: true } },
            calculatedColumns: { processColDef },
        });
        await waitFor(() => expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull());
        const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
        api.setGridOption('columnTypes', { grouped: { rowGroup: false } });
        expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
        processColDef.mockClear();

        api.setGridOption('columnTypes', { grouped: { rowGroup: true } });

        const groupColumn = api.getColumn('ag-Grid-AutoColumn');
        expect(groupColumn).not.toBeNull();
        expect(
            processColDef.mock.calls.map(([params]) => [params.colDef.colId, params.sourceColumn?.getColId()])
        ).toEqual([[calcId, 'ag-Grid-AutoColumn']]);
        expect(processColDef.mock.calls[0][0].sourceColumn).toBe(groupColumn);
    });

    test('sourceColumn is still the auto group column of b when a column rebuild ungroups only a', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-other-ungrouped', {
            rowData: ROW_DATA,
            columnDefs: [
                { field: 'a', type: 'groupedA', hide: true },
                { field: 'b', rowGroup: true, hide: true },
                { field: 'g' },
            ],
            columnTypes: { groupedA: { rowGroup: true } },
            groupDisplayType: 'multipleColumns',
            autoGroupColumnDef: { showRowGroup: 'a' },
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn-b');
        await addViaDialog(api, 'ag-Grid-AutoColumn-b', '[g] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { groupedA: { rowGroup: false } });

        expect(api.getColumn('ag-Grid-AutoColumn-a')).toBeNull();
        expect(api.getColumn('ag-Grid-AutoColumn-b')).not.toBeNull();
        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn?.getColId()).toBe('ag-Grid-AutoColumn-b');
        }
    });

    test('sourceColumn is null when a column rebuild ungroups only a and the column was added from the auto group column of a', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-auto-group-a-ungrouped', {
            rowData: ROW_DATA,
            columnDefs: [
                { field: 'a', type: 'ta', hide: true },
                { field: 'b', type: 'tb', hide: true },
                { field: 'g' },
            ],
            columnTypes: { ta: { rowGroup: true }, tb: { rowGroup: true } },
            groupDisplayType: 'multipleColumns',
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn-a');
        const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn-a', '[g] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { ta: { rowGroup: false }, tb: { rowGroup: true } });

        expect(api.getColumn('ag-Grid-AutoColumn-a')).toBeNull();
        expect(api.getColumn('ag-Grid-AutoColumn-b')).not.toBeNull();
        expect(api.getColumn(calcId)).not.toBeNull();
        expect(processColDef).toHaveBeenCalled();
        for (const [params] of processColDef.mock.calls) {
            expect(params.sourceColumn).toBeNull();
        }
    });

    test.each([
        { keys: 'columnTypes first', first: 'columnTypes' as const },
        { keys: 'groupDisplayType first', first: 'groupDisplayType' as const },
    ])(
        'sourceColumn is null when one option update switches to multipleColumns and changes columnTypes ($keys)',
        async (row) => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = createGrid(`pcd-source-auto-single-to-multiple-${row.first}`, {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
                columnTypes: { t: {} },
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            processColDef.mockClear();
            const types = { columnTypes: { t: { width: 99 } } };
            const display = { groupDisplayType: 'multipleColumns' as const };

            api.updateGridOptions(row.first === 'columnTypes' ? { ...types, ...display } : { ...display, ...types });

            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(api.getColumn('ag-Grid-AutoColumn-g')).not.toBeNull();
            expect(api.getColumn(calcId)).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        }
    );

    test.each([
        { keys: 'columnTypes first', first: 'columnTypes' as const },
        { keys: 'groupDisplayType first', first: 'groupDisplayType' as const },
    ])(
        'sourceColumn is null when one option update switches to singleColumn and changes columnTypes ($keys)',
        async (row) => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = createGrid(`pcd-source-auto-multiple-to-single-${row.first}`, {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b', type: 't' }],
                columnTypes: { t: {} },
                groupDisplayType: 'multipleColumns',
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn-g');
            const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn-g', '[a] * 2');
            processColDef.mockClear();
            const types = { columnTypes: { t: { width: 99 } } };
            const display = { groupDisplayType: 'singleColumn' as const };

            api.updateGridOptions(row.first === 'columnTypes' ? { ...types, ...display } : { ...display, ...types });

            expect(api.getColumn('ag-Grid-AutoColumn-g')).toBeNull();
            expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
            expect(api.getColumn(calcId)).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        }
    );

    describe('with pivot mode and the auto group column suppressed in it', () => {
        const pivotGrids = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                GridStateModule,
                CalculatedColumnsModule,
                FormulaModule,
                ColumnMenuModule,
                ContextMenuModule,
                RowGroupingModule,
                PivotModule,
                TextEditorModule,
                NumberEditorModule,
                TextFilterModule,
                NumberFilterModule,
                ValidationModule,
            ] as Module[],
        });
        afterEach(() => {
            pivotGrids.reset();
        });

        const keyOrders = [
            { keys: 'columnTypes first', first: 'columnTypes' as const },
            { keys: 'pivotMode first', first: 'pivotMode' as const },
        ];

        const createPivotGrid = (id: string, processColDef: ProcessColDef) =>
            pivotGrids.createGrid(id, {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a', type: 't' }, { field: 'b' }],
                columnTypes: { t: {} },
                pivotSuppressAutoColumn: true,
                calculatedColumns: { processColDef },
            });

        test.each(keyOrders)(
            'sourceColumn is null in every call when one option update switches pivot mode on and changes columnTypes ($keys)',
            async (row) => {
                const processColDef = vi.fn<ProcessColDef>();
                const api = createPivotGrid(`pcd-source-auto-pivot-on-${row.first}`, processColDef);
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                await asyncSetTimeout(0);
                processColDef.mockClear();
                const types = { columnTypes: { t: { width: 90 } } };
                const mode = { pivotMode: true };

                api.updateGridOptions(row.first === 'columnTypes' ? { ...types, ...mode } : { ...mode, ...types });
                await asyncSetTimeout(0);

                expect(api.isPivotMode()).toBe(true);
                expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
                expect(api.getColumn('a')!.getActualWidth()).toBe(90);
                expect(api.getColumn(calcId)).not.toBeNull();
                expect(processColDef).toHaveBeenCalled();
                for (const [params] of processColDef.mock.calls) {
                    expect(params.sourceColumn).toBeNull();
                }
            }
        );

        test.each(keyOrders)(
            'sourceColumn is the auto group column in every call when one option update switches pivot mode off and changes columnTypes ($keys)',
            async (row) => {
                const processColDef = vi.fn<ProcessColDef>();
                const api = createPivotGrid(`pcd-source-auto-pivot-off-${row.first}`, processColDef);
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                api.setGridOption('pivotMode', true);
                await asyncSetTimeout(0);
                processColDef.mockClear();
                const types = { columnTypes: { t: { width: 90 } } };
                const mode = { pivotMode: false };

                api.updateGridOptions(row.first === 'columnTypes' ? { ...types, ...mode } : { ...mode, ...types });
                await asyncSetTimeout(0);

                const autoColumn = api.getColumn('ag-Grid-AutoColumn');
                expect(api.isPivotMode()).toBe(false);
                expect(autoColumn).not.toBeNull();
                expect(api.getColumn('a')!.getActualWidth()).toBe(90);
                expect(api.getColumn(calcId)).not.toBeNull();
                expect(processColDef).toHaveBeenCalled();
                for (const [params] of processColDef.mock.calls) {
                    expect(params.sourceColumn).toBe(autoColumn);
                }
            }
        );
    });

    describe('without the row grouping module', () => {
        const noGroupingGrids = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                GridStateModule,
                CalculatedColumnsModule,
                FormulaModule,
                ColumnMenuModule,
                ContextMenuModule,
                TextEditorModule,
                NumberEditorModule,
                TextFilterModule,
                NumberFilterModule,
                ValidationModule,
            ] as Module[],
        });
        afterEach(() => {
            noGroupingGrids.reset();
        });

        test('a column rebuild reports a reference to a missing column on every call and raises no error', async () => {
            const processColDef = vi.fn<ProcessColDef>((params) => params.colDef);
            const api = noGroupingGrids.createGrid('pcd-no-grouping-missing-ref', {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'a', type: 't' }, { field: 'b' }],
                columnTypes: { t: {} },
                getRowId: (params) => params.data?.id,
                calculatedColumns: { processColDef },
                initialState: { userColumns: userColumnsState('calc', '[missing] * 2') },
            });
            await waitForColumn(api, 'calc');
            expect(processColDef).toHaveBeenCalled();
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { headerName: 'A' } });

            expect(api.getColumn('calc')).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.expressionValidation).toEqual({ valid: false, reason: 'unknownReference' });
            }
        });
    });

    describe('with tree data and without the row grouping module', () => {
        const treeDataGrids = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                GridStateModule,
                CalculatedColumnsModule,
                FormulaModule,
                ColumnMenuModule,
                ContextMenuModule,
                TreeDataModule,
                TextEditorModule,
                NumberEditorModule,
                TextFilterModule,
                NumberFilterModule,
                ValidationModule,
            ] as Module[],
        });
        afterEach(() => {
            treeDataGrids.reset();
        });

        test('sourceColumn follows the tree auto column through a column rebuild and once treeData is switched off', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = treeDataGrids.createGrid('pcd-tree-data-source', {
                rowData: [
                    { id: 'r1', path: ['x'], a: 10, b: 3 },
                    { id: 'r2', path: ['x', 'y'], a: 5, b: 2 },
                ],
                columnDefs: [{ field: 'a', type: 't' }, { field: 'b' }],
                columnTypes: { t: {} },
                treeData: true,
                getDataPath: (data) => data.path,
                getRowId: (params) => params.data?.id,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            const treeAutoColumn = api.getColumn('ag-Grid-AutoColumn');
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBe(treeAutoColumn);
            }

            processColDef.mockClear();
            api.setGridOption('columnTypes', { t: { headerName: 'A' } });

            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(treeAutoColumn);
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBe(treeAutoColumn);
            }

            processColDef.mockClear();
            api.setGridOption('treeData', false);
            api.setGridOption('columnTypes', { t: { headerName: 'A2' } });

            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(api.getColumn(calcId)).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        });

        test.each([
            { keys: 'columnTypes first', first: 'columnTypes' as const },
            { keys: 'treeDataDisplayType first', first: 'treeDataDisplayType' as const },
        ])(
            'sourceColumn is null when one option update switches tree data to a custom display and changes columnTypes ($keys)',
            async (row) => {
                const processColDef = vi.fn<ProcessColDef>();
                const api = treeDataGrids.createGrid(`pcd-tree-data-source-custom-${row.first}`, {
                    rowData: [
                        { id: 'r1', path: ['x'], a: 10, b: 3 },
                        { id: 'r2', path: ['x', 'y'], a: 5, b: 2 },
                    ],
                    columnDefs: [{ field: 'a', type: 't' }, { field: 'b' }],
                    columnTypes: { t: {} },
                    treeData: true,
                    getDataPath: (data) => data.path,
                    getRowId: (params) => params.data?.id,
                    calculatedColumns: { processColDef },
                });
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                processColDef.mockClear();
                const types = { columnTypes: { t: { headerName: 'A' } } };
                const display = { treeDataDisplayType: 'custom' as const };

                api.updateGridOptions(
                    row.first === 'columnTypes' ? { ...types, ...display } : { ...display, ...types }
                );

                expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
                expect(api.getColumn(calcId)).not.toBeNull();
                expect(processColDef).toHaveBeenCalled();
                for (const [params] of processColDef.mock.calls) {
                    expect(params.sourceColumn).toBeNull();
                }
            }
        );
    });

    describe('sourceColumn of a column added from a group hierarchy column or the auto column of one', () => {
        const HIERARCHY_YEAR = 'ag-Grid-HierarchyColumn-date-year';

        function hierarchyGrid(id: string, processColDef: ProcessColDef, opts: Partial<GridOptions> = {}): GridApi {
            return createGrid(id, {
                rowData: [{ id: 'r1', g: 'x', date: new Date(2020, 0, 1) }],
                columnDefs: [
                    { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                    { field: 'g', type: 't' },
                ],
                columnTypes: { t: {} },
                calculatedColumns: { processColDef },
                ...opts,
            });
        }

        type ProcessColDefSpy = ReturnType<typeof vi.fn<ProcessColDef>>;

        function expectEveryCallGot(processColDef: ProcessColDefSpy, api: GridApi, sourceId: string) {
            const source = api.getColumn(sourceId);
            expect(source).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBe(source);
            }
        }

        async function addThenRebuild(api: GridApi, processColDef: ProcessColDefSpy, sourceId: string) {
            await addViaDialog(api, sourceId, '[g]');
            expectEveryCallGot(processColDef, api, sourceId);

            processColDef.mockClear();
            api.setGridOption('columnTypes', { t: { headerName: 'G' } });
            expectEveryCallGot(processColDef, api, sourceId);
        }

        function autoColumnIds(api: GridApi): string[] {
            return api
                .getAllGridColumns()
                .map((col) => col.getColId())
                .filter((colId) => colId.startsWith('ag-Grid-AutoColumn'));
        }

        test('is the hierarchy column on add and on every column rebuild', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = hierarchyGrid('pcd-source-hierarchy', processColDef);
            await waitForColumn(api, HIERARCHY_YEAR);
            api.setColumnsVisible([HIERARCHY_YEAR], true);
            await waitFor(() => expect(api.getColumn(HIERARCHY_YEAR)!.isVisible()).toBe(true));

            await addThenRebuild(api, processColDef, HIERARCHY_YEAR);
        });

        test('is the auto group column of a grouped hierarchy part (multipleColumns) on add and on every column rebuild', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = hierarchyGrid('pcd-source-hierarchy-auto-multiple', processColDef, {
                groupDisplayType: 'multipleColumns',
            });
            await waitForColumn(api, HIERARCHY_YEAR);
            api.setRowGroupColumns([HIERARCHY_YEAR]);
            await waitFor(() => expect(autoColumnIds(api)).toHaveLength(1));

            await addThenRebuild(api, processColDef, autoColumnIds(api)[0]);
        });

        test('is the auto group column of a grouped hierarchy part (singleColumn) on add and on every column rebuild', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = hierarchyGrid('pcd-source-hierarchy-auto-single', processColDef, {
                groupDisplayType: 'singleColumn',
            });
            await waitForColumn(api, HIERARCHY_YEAR);
            api.setRowGroupColumns([HIERARCHY_YEAR]);
            await waitForColumn(api, 'ag-Grid-AutoColumn');

            await addThenRebuild(api, processColDef, 'ag-Grid-AutoColumn');
        });

        test('is null after a column rebuild removes the hierarchy level behind the auto group column (multipleColumns)', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = hierarchyGrid('pcd-source-hierarchy-level-removed', processColDef, {
                groupDisplayType: 'multipleColumns',
                columnDefs: [{ field: 'date', enableRowGroup: true, type: 't' }, { field: 'g' }],
                columnTypes: { t: { groupHierarchy: ['year', 'month'] } },
            });
            await waitForColumn(api, HIERARCHY_YEAR);
            api.setRowGroupColumns([HIERARCHY_YEAR]);
            const autoYear = `ag-Grid-AutoColumn-${HIERARCHY_YEAR}`;
            await waitFor(() => expect(autoColumnIds(api)).toEqual([autoYear]));
            const calcId = await addViaDialog(api, autoYear, '[g]');
            await asyncSetTimeout(0);
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { groupHierarchy: ['month'] } });
            await asyncSetTimeout(0);

            expect(autoColumnIds(api)).toEqual([]);
            expect(api.getColumn(calcId)).not.toBeNull();
            expect(processColDef).toHaveBeenCalled();
            for (const [params] of processColDef.mock.calls) {
                expect(params.sourceColumn).toBeNull();
            }
        });
    });

    test.each([
        { groupDisplayType: 'singleColumn' as const, columnDefs: columnDefs(), autoColId: 'ag-Grid-AutoColumn' },
        {
            groupDisplayType: 'multipleColumns' as const,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
            autoColId: 'ag-Grid-AutoColumn-calc',
        },
    ])(
        'sourceColumn is the auto group column of a grouped calculated column ($groupDisplayType)',
        async ({ groupDisplayType, columnDefs, autoColId }) => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = gridWithUserColumn('pcd-source-calc-auto-group', 'calc', '[a] * 2', processColDef, {
                columnDefs,
                groupDisplayType,
            });
            await waitForColumn(api, 'calc');
            api.applyColumnState({ state: [{ colId: 'calc', rowGroup: true }] });
            await waitForColumn(api, autoColId);
            processColDef.mockClear();

            const calcId = await addViaDialog(api, autoColId, '[b] * 2');

            const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === calcId);
            expect(callsForAdded.length).toBeGreaterThan(0);
            for (const [params] of callsForAdded) {
                expect(params.sourceColumn).toBe(api.getColumn(autoColId));
            }
        }
    );

    test('sourceColumn is the auto group column of a grouped calculated column (multipleColumns) on every column rebuild', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const autoColId = 'ag-Grid-AutoColumn-calc';
        const api = gridWithUserColumn('pcd-source-calc-auto-group-rebuild', 'calc', '[a] * 2', processColDef, {
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b', type: 't' }],
            columnTypes: { t: {} },
            groupDisplayType: 'multipleColumns',
        });
        await waitForColumn(api, 'calc');
        api.applyColumnState({ state: [{ colId: 'calc', rowGroup: true }] });
        await waitForColumn(api, autoColId);
        const calcId = await addViaDialog(api, autoColId, '[b] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { t: { headerName: 'B' } });

        const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === calcId);
        expect(api.getColumn(autoColId)).not.toBeNull();
        expect(callsForAdded.length).toBeGreaterThan(0);
        for (const [params] of callsForAdded) {
            expect(params.sourceColumn).toBe(api.getColumn(autoColId));
        }
    });

    test('sourceColumn is the auto group column of a calculated column grouped in the same rebuild as a column added from it (multipleColumns)', async () => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid('pcd-source-calc-auto-group-added-from-auto', {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b', type: 't' }],
            columnTypes: { t: {} },
            groupDisplayType: 'multipleColumns',
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn-g');
        const groupedCalcId = await addViaDialog(api, 'ag-Grid-AutoColumn-g', '[a] * 2');
        api.applyColumnState({ state: [{ colId: groupedCalcId, rowGroup: true }] });
        const autoColId = `ag-Grid-AutoColumn-${groupedCalcId}`;
        await waitForColumn(api, autoColId);
        const addedId = await addViaDialog(api, autoColId, '[b] * 2');
        processColDef.mockClear();

        api.setGridOption('columnTypes', { t: { headerName: 'B' } });

        const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === addedId);
        expect(api.getColumn(autoColId)).not.toBeNull();
        expect(callsForAdded.length).toBeGreaterThan(0);
        for (const [params] of callsForAdded) {
            expect(params.sourceColumn).toBe(api.getColumn(autoColId));
        }
    });

    test.each([
        { order: 'the column added from the auto group column last', autoSourceFirst: false },
        { order: 'the column added from the auto group column first', autoSourceFirst: true },
    ])('processColDef runs once per calculated column in a rebuild, which keeps both columns ($order)', async (row) => {
        const processColDef = vi.fn<ProcessColDef>();
        const api = createGrid(`pcd-once-per-rebuild-auto-source-${row.autoSourceFirst}`, {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', type: 't', hide: true }, { field: 'a' }, { field: 'b' }],
            columnTypes: { t: { rowGroup: true } },
            calculatedColumns: { processColDef },
        });
        await waitForColumn(api, 'ag-Grid-AutoColumn');
        let xId: string;
        let yId: string;
        if (row.autoSourceFirst) {
            yId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            xId = await addViaDialog(api, 'a', '[b] * 2');
        } else {
            xId = await addViaDialog(api, 'a', '[b] * 2');
            yId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
        }
        processColDef.mockClear();

        api.setGridOption('columnTypes', { t: { rowGroup: true, width: 90 } });

        const calledIds = processColDef.mock.calls.map(([params]) => params.colDef.colId);
        expect([...calledIds].sort()).toEqual([xId, yId].sort());
        expect(api.getColumn(xId)).not.toBeNull();
        expect(api.getColumn(yId)).not.toBeNull();
    });

    describe('sourceColumn and expressionValidation when processColDef groups a calculated column in a rebuild that ungroups a column', () => {
        const GROUPED_BY_TYPE: Partial<GridOptions> = {
            rowData: ROW_DATA,
            columnDefs: [{ field: 'g', type: 't', hide: true }, { field: 'a' }, { field: 'b' }],
            columnTypes: { t: { rowGroup: true } },
        };

        /** A callback grouping the column `groupedId.value` once `enabled.value` is set. */
        function groupingCallback() {
            const groupedId = { value: '' };
            const enabled = { value: false };
            const processColDef = vi.fn<ProcessColDef>((params) =>
                enabled.value && params.colDef.colId === groupedId.value
                    ? { ...params.colDef, rowGroup: true }
                    : undefined
            );
            return { processColDef, groupedId, enabled };
        }

        test.each([
            { order: 'the grouped column first', groupedFirst: true },
            { order: 'the column added from the auto column first', groupedFirst: false },
        ])(
            'sourceColumn stays the same auto group column when a rebuild ungroups g and the callback groups another column ($order)',
            async (row) => {
                const groupedFirst = row.groupedFirst;
                const { processColDef, groupedId, enabled } = groupingCallback();
                const api = createGrid(`pcd-source-auto-kept-${groupedFirst}`, {
                    ...GROUPED_BY_TYPE,
                    calculatedColumns: { processColDef },
                });
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                let addedId: string;
                if (groupedFirst) {
                    groupedId.value = await addViaDialog(api, 'a', '[b] * 2');
                    addedId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                } else {
                    addedId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                    groupedId.value = await addViaDialog(api, 'a', '[b] * 2');
                }
                const autoColumnBefore = api.getColumn('ag-Grid-AutoColumn');
                expect(autoColumnBefore).not.toBeNull();
                enabled.value = true;
                processColDef.mockClear();

                api.setGridOption('columnTypes', { t: { rowGroup: false } });

                const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === addedId);
                expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
                expect(callsForAdded.length).toBeGreaterThan(0);
                for (const [params] of callsForAdded) {
                    expect(params.sourceColumn).toBe(autoColumnBefore);
                }
            }
        );

        test('sourceColumn is null when a rebuild ungroups g and the callback groups nothing', async () => {
            const processColDef = vi.fn<ProcessColDef>();
            const api = createGrid('pcd-source-auto-nothing-grouped', {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const addedId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            await asyncSetTimeout(0);
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });
            await asyncSetTimeout(0);

            const callsForAdded = processColDef.mock.calls.filter(([params]) => params.colDef.colId === addedId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(callsForAdded.length).toBeGreaterThan(0);
            for (const [params] of callsForAdded) {
                expect(params.sourceColumn).toBeNull();
            }
        });

        test('sourceColumn of a second column added from the auto group column is that column when the callback groups the first one', async () => {
            const { processColDef, groupedId, enabled } = groupingCallback();
            const api = createGrid('pcd-source-auto-second-kept', {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const firstId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            const secondId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[b] * 2');
            groupedId.value = firstId;
            const autoColumnBefore = api.getColumn('ag-Grid-AutoColumn');
            expect(autoColumnBefore).not.toBeNull();
            enabled.value = true;
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });

            const callsForSecond = processColDef.mock.calls.filter(([params]) => params.colDef.colId === secondId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
            expect(callsForSecond.length).toBeGreaterThan(0);
            for (const [params] of callsForSecond) {
                expect(params.sourceColumn).toBe(autoColumnBefore);
            }
        });

        test('sourceColumn of a second column added from the auto group column is null when the first one is ungrouped in the step that ungroups g', async () => {
            const grouping = { value: true };
            const groupedId = { value: '' };
            const processColDef = vi.fn<ProcessColDef>((params) =>
                grouping.value && params.colDef.colId === groupedId.value
                    ? { ...params.colDef, rowGroup: true }
                    : undefined
            );
            const api = createGrid('pcd-source-auto-second-gone', {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const firstId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            groupedId.value = firstId;
            api.setGridOption('columnTypes', { t: { rowGroup: true, width: 90 } });
            expect(api.getColumn(firstId)!.isRowGroupActive()).toBe(true);
            const secondId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[b] * 2');
            grouping.value = false;
            api.applyColumnState({ state: [{ colId: firstId, rowGroup: false }] });
            expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });

            const callsForSecond = processColDef.mock.calls.filter(([params]) => params.colDef.colId === secondId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
            expect(callsForSecond.length).toBeGreaterThan(0);
            for (const [params] of callsForSecond) {
                expect(params.sourceColumn).toBeNull();
            }
        });

        test('sourceColumn of a column added from the auto group column stays that column when a column added from it comes before the column the callback groups', async () => {
            const { processColDef, groupedId, enabled } = groupingCallback();
            const api = createGrid('pcd-source-auto-chain-before-grouped', {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const rId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
            const xId = await addViaDialog(api, rId, '[b] * 2');
            groupedId.value = await addViaDialog(api, 'a', '[b] * 3');
            const autoColumnBefore = api.getColumn('ag-Grid-AutoColumn');
            expect(autoColumnBefore).not.toBeNull();
            enabled.value = true;
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });

            const callsForR = processColDef.mock.calls.filter(([params]) => params.colDef.colId === rId);
            const callsForX = processColDef.mock.calls.filter(([params]) => params.colDef.colId === xId);
            expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
            expect(callsForR.length).toBeGreaterThan(0);
            for (const [params] of callsForR) {
                expect(params.sourceColumn).toBe(autoColumnBefore);
            }
            expect(callsForX.length).toBeGreaterThan(0);
            for (const [params] of callsForX) {
                expect(params.sourceColumn).toBe(api.getColumn(rId));
            }
        });

        test.each([
            { order: 'calculatedColumns first', keys: ['calculatedColumns', 'columnTypes'] },
            { order: 'columnTypes first', keys: ['columnTypes', 'calculatedColumns'] },
        ])(
            'sourceColumn of a second column added from the auto group column is that column when turning calculated columns back on groups the first one by initialRowGroup in the update that ungroups g ($order)',
            async (row) => {
                const r1Id = { value: '' };
                const processColDef = vi.fn<ProcessColDef>((params) =>
                    params.colDef.colId === r1Id.value ? { ...params.colDef, initialRowGroup: true } : undefined
                );
                const api = createGrid(`pcd-source-auto-second-on-${row.keys[0]}`, {
                    ...GROUPED_BY_TYPE,
                    calculatedColumns: { processColDef },
                });
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                const r1 = await addViaDialog(api, 'ag-Grid-AutoColumn', '[a] * 2');
                const r2 = await addViaDialog(api, 'ag-Grid-AutoColumn', '[b] * 2');
                r1Id.value = r1;
                api.setGridOption('calculatedColumns', false);
                const autoColumnBefore = api.getColumn('ag-Grid-AutoColumn');
                expect(autoColumnBefore).not.toBeNull();
                processColDef.mockClear();

                const update: Partial<GridOptions> = {};
                for (const key of row.keys) {
                    if (key === 'calculatedColumns') {
                        update.calculatedColumns = { processColDef };
                    } else {
                        update.columnTypes = { t: { rowGroup: false } };
                    }
                }
                api.updateGridOptions(update);

                const callsForR2 = processColDef.mock.calls.filter(([params]) => params.colDef.colId === r2);
                expect(api.getColumn(r1)).not.toBeNull();
                expect(api.getColumn(r2)).not.toBeNull();
                expect(api.getColumn(r1)!.isRowGroupActive()).toBe(true);
                expect(api.getColumn('ag-Grid-AutoColumn')).toBe(autoColumnBefore);
                expect(callsForR2.length).toBeGreaterThan(0);
                for (const [params] of callsForR2) {
                    expect(params.sourceColumn).toBe(autoColumnBefore);
                }
            }
        );

        test.each([
            {
                outcome: 'valid while the callback keeps the auto group column',
                enabled: true,
                autoColumnStays: true,
                expected: { valid: true },
            },
            {
                outcome: 'an unknown reference once the auto group column is gone',
                enabled: false,
                autoColumnStays: false,
                expected: { valid: false, reason: 'unknownReference' },
            },
        ])('expressionValidation of a reference to the auto group column is $outcome', async (row) => {
            const enabledValue = row.enabled;
            const { processColDef, groupedId, enabled } = groupingCallback();
            const api = createGrid(`pcd-valid-auto-ref-${enabledValue}`, {
                ...GROUPED_BY_TYPE,
                calculatedColumns: { processColDef },
                initialState: { userColumns: userColumnsState('z', '[ag-Grid-AutoColumn] + 1') },
            });
            await waitForColumn(api, 'z');
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            await asyncSetTimeout(0);
            const restoreCallsForZ = processColDef.mock.calls.filter(([params]) => params.colDef.colId === 'z');
            expect(restoreCallsForZ.length).toBeGreaterThan(0);
            for (const [params] of restoreCallsForZ) {
                expect(params.expressionValidation).toEqual({ valid: true });
            }
            groupedId.value = await addViaDialog(api, 'a', '[b] * 2');
            enabled.value = enabledValue;
            await asyncSetTimeout(0);
            processColDef.mockClear();

            api.setGridOption('columnTypes', { t: { rowGroup: false } });
            await asyncSetTimeout(0);

            const callsForZ = processColDef.mock.calls.filter(([params]) => params.colDef.colId === 'z');
            expect(api.getColumn('ag-Grid-AutoColumn') !== null).toBe(row.autoColumnStays);
            expect(callsForZ.length).toBeGreaterThan(0);
            for (const [params] of callsForZ) {
                expect(params.expressionValidation).toEqual(row.expected);
            }
        });

        test('sourceColumn is the auto group column again when a columnTypes change groups again after grouping was cleared', async () => {
            const ungroupers: { path: string; ungroup: (api: GridApi) => void }[] = [
                {
                    path: 'columnTypes',
                    ungroup: (api) => api.setGridOption('columnTypes', { t: { rowGroup: false } }),
                },
                { path: 'setRowGroupColumns', ungroup: (api) => api.setRowGroupColumns([]) },
            ];
            const lastCalls: { path: string; sourceColumnId: string | undefined; expressionValidation: unknown }[] = [];
            for (const { path, ungroup } of ungroupers) {
                let last: CalculatedColumnProcessColDefParams | undefined;
                const calcId = { value: '' };
                const processColDef = vi.fn<ProcessColDef>((params) => {
                    if (params.colDef.colId === calcId.value) {
                        last = params;
                    }
                    return undefined;
                });
                const api = createGrid(`pcd-source-auto-regrouped-${path}`, {
                    ...GROUPED_BY_TYPE,
                    calculatedColumns: { processColDef },
                });
                await waitForColumn(api, 'ag-Grid-AutoColumn');
                calcId.value = await addViaDialog(api, 'ag-Grid-AutoColumn', '[ag-Grid-AutoColumn] + 1');

                ungroup(api);
                expect(api.getColumn('ag-Grid-AutoColumn')).toBeNull();
                api.setGridOption('columnTypes', { t: { rowGroup: true } });

                expect(api.getColumn('ag-Grid-AutoColumn')).not.toBeNull();
                lastCalls.push({
                    path,
                    sourceColumnId: last?.sourceColumn?.getColId(),
                    expressionValidation: last?.expressionValidation,
                });
            }

            expect(lastCalls).toEqual([
                { path: 'columnTypes', sourceColumnId: 'ag-Grid-AutoColumn', expressionValidation: { valid: true } },
                {
                    path: 'setRowGroupColumns',
                    sourceColumnId: 'ag-Grid-AutoColumn',
                    expressionValidation: { valid: true },
                },
            ]);
        });

        test("sourceColumn is the group column that groups again, when another column's group column stays gone", async () => {
            let lastForY: CalculatedColumnProcessColDefParams | undefined;
            const yId = { value: '' };
            const processColDef = vi.fn<ProcessColDef>((params) => {
                if (params.colDef.colId === yId.value) {
                    lastForY = params;
                }
                return undefined;
            });
            const api = createGrid('pcd-source-group-col-regrouped-other-gone', {
                rowData: ROW_DATA,
                groupDisplayType: 'multipleColumns',
                columnDefs: [
                    { field: 'a', type: 'ta', hide: true },
                    { field: 'b', type: 'tb', hide: true },
                    { field: 'g' },
                ],
                columnTypes: { ta: { rowGroup: true }, tb: { rowGroup: true } },
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn-a');
            await waitForColumn(api, 'ag-Grid-AutoColumn-b');
            await addViaDialog(api, 'ag-Grid-AutoColumn-a', '[ag-Grid-AutoColumn-a] + 1');
            yId.value = await addViaDialog(api, 'ag-Grid-AutoColumn-b', '[ag-Grid-AutoColumn-b] + 1');

            api.setRowGroupColumns([]);
            expect(api.getColumn('ag-Grid-AutoColumn-b')).toBeNull();
            api.setGridOption('columnTypes', { ta: { rowGroup: false }, tb: { rowGroup: true } });

            expect(api.getColumn('ag-Grid-AutoColumn-a')).toBeNull();
            expect(api.getColumn('ag-Grid-AutoColumn-b')).not.toBeNull();
            expect({
                sourceColumnId: lastForY?.sourceColumn?.getColId(),
                expressionValidation: lastForY?.expressionValidation,
            }).toEqual({ sourceColumnId: 'ag-Grid-AutoColumn-b', expressionValidation: { valid: true } });
        });
    });

    describe('sourceColumn of a column added from a calculated column', () => {
        const REBUILDS: {
            rebuild: string;
            run: (api: GridApi, ids: { r: string; x: string }, cb: ProcessColDef) => void;
        }[] = [
            {
                rebuild: 'reset then apply R, X',
                run: (api, ids) => {
                    api.resetColumnState();
                    api.applyColumnState({ state: [{ colId: ids.r }, { colId: ids.x }] });
                },
            },
            {
                rebuild: 'reset then apply X, R',
                run: (api, ids) => {
                    api.resetColumnState();
                    api.applyColumnState({ state: [{ colId: ids.x }, { colId: ids.r }] });
                },
            },
            {
                rebuild: 'calculatedColumns off and on',
                run: (api, _ids, processColDef) => {
                    api.setGridOption('calculatedColumns', false);
                    api.setGridOption('calculatedColumns', { processColDef });
                },
            },
        ];

        test.each(
            REBUILDS.flatMap((row) => [
                { ...row, source: 'ag-Grid-AutoColumn' },
                { ...row, source: 'a' },
            ])
        )('is the source calculated column after $rebuild (from $source)', async (row) => {
            const processColDef = vi.fn<ProcessColDef>(() => undefined);
            const api = createGrid(`pcd-source-of-calc-${row.rebuild}-${row.source}`, {
                rowData: ROW_DATA,
                columnDefs: [{ field: 'g', rowGroup: true, hide: true }, { field: 'a' }, { field: 'b' }],
                calculatedColumns: { processColDef },
            });
            await waitForColumn(api, 'ag-Grid-AutoColumn');
            const r = await addViaDialog(api, row.source, '[a] * 2');
            const x = await addViaDialog(api, r, '[b] * 2');
            processColDef.mockClear();

            row.run(api, { r, x }, processColDef);

            const callsForX = processColDef.mock.calls.filter(([params]) => params.colDef.colId === x);
            expect(api.getColumn(r)).not.toBeNull();
            expect(api.getColumn(x)).not.toBeNull();
            expect(callsForX.length).toBeGreaterThan(0);
            for (const [params] of callsForX) {
                expect(params.sourceColumn).toBe(api.getColumn(r));
            }
        });
    });

    test('expressionValidation is valid on restore and on every column rebuild for a reference to a calculated column declared after it', async () => {
        const processColDef = vi.fn<ProcessColDef>((params) => params.colDef);
        const api = createGrid('pcd-valid-forward-ref', {
            rowData: ROW_DATA,
            calculatedColumns: { processColDef },
            columnDefs: [{ field: 'a', type: 't' }, { field: 'b' }],
            columnTypes: { t: {} },
            initialState: {
                userColumns: [...userColumnsState('first', '[second] + 1')!, ...userColumnsState('second', '[a] * 2')!],
            },
        });
        await waitForColumn(api, 'first');
        await waitForColumn(api, 'second');
        const restoreCallsForFirst = processColDef.mock.calls.filter(([params]) => params.colDef.colId === 'first');
        expect(restoreCallsForFirst.length).toBeGreaterThan(0);
        for (const [params] of restoreCallsForFirst) {
            expect(params.expressionValidation).toEqual({ valid: true });
        }
        processColDef.mockClear();

        api.setGridOption('columnTypes', { t: { headerName: 'A' } });

        const callsForFirst = processColDef.mock.calls.filter(([params]) => params.colDef.colId === 'first');
        expect(callsForFirst.length).toBeGreaterThan(0);
        for (const [params] of callsForFirst) {
            expect(params.expressionValidation).toEqual({ valid: true });
        }
    });

    test('without a callback the dialog title of a restored column inherits defaultColDef.headerName', async () => {
        const api = gridWithUserColumn('pcd-default-header', 'calc', '[a] * 2', undefined, {
            defaultColDef: { headerName: 'Inherited' },
        });
        await waitForColumn(api, 'calc');

        api.showColumnMenu('calc');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());

        expect(getCalculatedColumnDialog().querySelector<HTMLInputElement>('input')!.value).toBe('Inherited');
    });

    test('a columnDefs update made from inside the callback refreshes the filter with the new filterParams and re-filters the rows', async () => {
        ModuleRegistry.registerModules([CustomFilterModule]);
        type MinParams = IFilterParams & { min: number };
        const refreshedWith: number[] = [];
        class MinFilter implements IFilterComp {
            private min = -1;
            public init(params: MinParams) {
                this.min = params.min;
            }
            public getGui() {
                return document.createElement('div');
            }
            public isFilterActive() {
                return true;
            }
            public doesFilterPass(params: IDoesFilterPassParams) {
                return params.data.a >= this.min;
            }
            public getModel() {
                return null;
            }
            public setModel() {}
            public refresh(newParams: MinParams) {
                refreshedWith.push(newParams.min);
                this.min = newParams.min;
                return true;
            }
        }
        const defs = (min: number): GridOptions['columnDefs'] => [
            { field: 'a', filter: MinFilter, filterParams: { min } },
            { field: 'b' },
        ];
        const displayedIds = (api: GridApi) => {
            const ids: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => ids.push(node.id!));
            return ids;
        };
        const api = gridWithUserColumn('pcd-filter-params', 'calc', '[a] * 2', undefined, { columnDefs: defs(0) });
        await waitForColumn(api, 'calc');
        expect(await api.getColumnFilterInstance('a')).toBeInstanceOf(MinFilter);
        api.onFilterChanged(); // the filter's own params are its model: it is active once the grid is told
        await waitFor(() => expect(displayedIds(api)).toEqual(['r1', 'r2']));
        let innerCalls = 0;
        const processColDef: ProcessColDef = (params) => {
            if (++innerCalls === 1) {
                api.setGridOption('columnDefs', defs(8));
            }
            return params.colDef;
        };

        api.setGridOption('calculatedColumns', { processColDef });

        expect({ innerCalls: innerCalls > 0, refreshedWith }).toEqual({ innerCalls: true, refreshedWith: [8] });
        await waitFor(() => expect(displayedIds(api)).toEqual(['r1']), { timeout: 1000 });
    });
});
