import { TestGridsManager } from 'ag-test-utils';

import type { ColumnState, ColumnStateParams, GridState } from 'ag-grid-community';
import { convertColumnState } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

type ConvertedState = ReturnType<typeof convertColumnState>;

const sizeOf = (state: ConvertedState, colId: string) =>
    state.columnSizing?.columnSizingModel.find((item) => item.colId === colId);

/** One column per feature, each with every field of that feature set to a non-default value. */
const COLUMN_STATE: ColumnState[] = [
    { colId: 'hidden', hide: true },
    { colId: 'sized', width: 321 },
    { colId: 'flexed', flex: 2 },
    { colId: 'sortedSecond', sort: 'asc', sortIndex: 1 },
    { colId: 'sortedFirst', sort: 'desc', sortType: 'absolute', sortIndex: 0 },
    { colId: 'groupedSecond', rowGroup: true, rowGroupIndex: 1 },
    { colId: 'groupedFirst', rowGroup: true, rowGroupIndex: 0 },
    { colId: 'aggSecond', aggFunc: 'sum', valueIndex: 1 },
    { colId: 'aggFirst', aggFunc: 'max', valueIndex: 0, showValuesAs: 'percentOfGrandTotal' },
    { colId: 'pivotedSecond', pivot: true, pivotIndex: 1 },
    { colId: 'pivotedFirst', pivot: true, pivotIndex: 0, pivotSort: 'desc' },
    { colId: 'pinnedRight', pinned: 'right' },
    { colId: 'renamed', headerName: 'Renamed' },
];

/**
 * Where each `ColumnStateParams` field ends up in grid state, and the value expected there for {@link COLUMN_STATE}.
 * Keyed exhaustively over `ColumnStateParams`, so adding a column state field without deciding whether grid state
 * carries it is a compile error rather than a value silently dropped by `getState`.
 *
 * A field grid state deliberately does not persist is recorded as `null`, with a comment saying why.
 */
const GRID_STATE_LOCATION = {
    hide: [(state) => state.columnVisibility?.hiddenColIds, ['hidden']],
    width: [(state) => sizeOf(state, 'sized')?.width, 321],
    flex: [(state) => sizeOf(state, 'flexed')?.flex, 2],
    sort: [(state) => state.sort?.sortModel.map((item) => item.sort), ['desc', 'asc']],
    sortType: [(state) => state.sort?.sortModel[0].type, 'absolute'],
    // Positional: `sortIndex` is the order of `sortModel`, not a field on it.
    sortIndex: [(state) => state.sort?.sortModel.map((item) => item.colId), ['sortedFirst', 'sortedSecond']],
    // Positional: `rowGroupIndex` is the order of `groupColIds`.
    rowGroupIndex: [(state) => state.rowGroup?.groupColIds, ['groupedFirst', 'groupedSecond']],
    rowGroup: [(state) => state.rowGroup?.groupColIds.includes('groupedFirst'), true],
    aggFunc: [(state) => state.aggregation?.aggregationModel.map((item) => item.aggFunc), ['max', 'sum']],
    // Positional: `valueIndex` is the order of `aggregationModel`.
    valueIndex: [(state) => state.aggregation?.aggregationModel.map((item) => item.colId), ['aggFirst', 'aggSecond']],
    showValuesAs: [
        (state) => state.showValuesAs?.showValuesAsModel,
        [{ colId: 'aggFirst', showValuesAs: 'percentOfGrandTotal' }],
    ],
    pivot: [(state) => state.pivot?.pivotColIds.includes('pivotedFirst'), true],
    // Positional: `pivotIndex` is the order of `pivotColIds`.
    pivotIndex: [(state) => state.pivot?.pivotColIds, ['pivotedFirst', 'pivotedSecond']],
    pivotSort: [(state) => state.pivot?.pivotSortModel?.find((item) => item.colId === 'pivotedFirst')?.sort, 'desc'],
    pinned: [(state) => state.columnPinning?.rightColIds, ['pinnedRight']],
    headerName: [(state) => state.columnHeaderName?.columnHeaderNames, [{ colId: 'renamed', headerName: 'Renamed' }]],
} satisfies Record<keyof ColumnStateParams, [read: (state: ConvertedState) => unknown, expected: unknown] | null>;

describe('grid state carries every column state field', () => {
    const fields = Object.entries(GRID_STATE_LOCATION).filter(([, location]) => location !== null);

    describe('convertColumnState', () => {
        const converted = convertColumnState(COLUMN_STATE, true);

        test.each(fields)('%s', (_field, [read, expected]) => {
            expect(read(converted)).toEqual(expected);
        });
    });

    /** The same map read from a live grid after `setState`, so a field must survive the write side too. */
    describe('setState then getState', () => {
        const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

        afterEach(() => {
            gridsManager.reset();
        });

        test.each(fields)('%s', (_field, [read, expected]) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: COLUMN_STATE.map(({ colId }) => ({ colId, field: colId })),
                rowData: [],
            });
            api.setState(convertColumnState(COLUMN_STATE, true));

            expect(read(api.getState())).toEqual(expected);
        });
    });
});

/**
 * The write side's reset rule: a full state nulls the fields of every column it omits, so colDef defaults give way
 * to the state; a partial state (`partialColumnState`) resets only the sections it carries. `pivotSort` is never
 * reset, as `null` would wipe the colDef default on every pivoted column.
 */
describe('setting state resets the column state fields it does not mention', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const stateOf = (api: ReturnType<typeof gridsManager.createGrid>, colId: string) =>
        api.getColumnState().find((col) => col.colId === colId)!;

    /** colDef defaults for one field per section, none of which the initial state below mentions. */
    const createWithDefaults = (initialState: GridState) =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'sorted', field: 'sorted', sort: 'asc' },
                { colId: 'pinned', field: 'pinned', pinned: 'left' },
                { colId: 'pivoted', field: 'pivoted', pivot: true, pivotSort: 'desc' },
            ],
            rowData: [],
            // the initial state carries the sort section only, with nothing sorted
            initialState: { sort: { sortModel: [] }, ...initialState },
        });

    test('a full state clears the defaults of every section', () => {
        const api = createWithDefaults({});

        expect(stateOf(api, 'sorted').sort).toBeNull();
        expect(stateOf(api, 'pinned').pinned).toBeNull();
        expect(stateOf(api, 'pivoted').pivot).toBe(false);
        // never reset, so the colDef default stands
        expect(stateOf(api, 'pivoted').pivotSort).toBe('desc');
    });

    test('a partial state clears only the sections it carries', () => {
        const api = createWithDefaults({ partialColumnState: true });

        expect(stateOf(api, 'sorted').sort).toBeNull();
        expect(stateOf(api, 'pinned').pinned).toBe('left');
        expect(stateOf(api, 'pivoted').pivot).toBe(true);
        expect(stateOf(api, 'pivoted').pivotSort).toBe('desc');
    });
});
