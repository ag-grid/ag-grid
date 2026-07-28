import type { ColumnState, ColumnStateParams } from 'ag-grid-community';
import { convertColumnState } from 'ag-grid-community';

type ConvertedState = ReturnType<typeof convertColumnState>;

/** One column per feature, each with every field of that feature set to a non-default value. */
const COLUMN_STATE: ColumnState[] = [
    { colId: 'hidden', hide: true },
    { colId: 'sized', width: 321, flex: 2 },
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
    width: [(state) => state.columnSizing?.columnSizingModel[0].width, 321],
    flex: [(state) => state.columnSizing?.columnSizingModel[0].flex, 2],
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
    pivotSort: [(state) => state.pivot?.pivotSortModel, [{ colId: 'pivotedFirst', sort: 'desc' }]],
    pinned: [(state) => state.columnPinning?.rightColIds, ['pinnedRight']],
    headerName: [(state) => state.columnHeaderName?.columnHeaderNames, [{ colId: 'renamed', headerName: 'Renamed' }]],
} satisfies Record<keyof ColumnStateParams, [read: (state: ConvertedState) => unknown, expected: unknown] | null>;

describe('grid state carries every column state field', () => {
    const converted = convertColumnState(COLUMN_STATE, true);
    const fields = Object.entries(GRID_STATE_LOCATION).filter(([, location]) => location !== null);

    test.each(fields)('%s', (_field, [read, expected]) => {
        expect(read(converted)).toEqual(expected);
    });
});
