import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';

import type { CellSelectionCellState, GridApi, GridOptions, GridState, GridStateKey } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
    a: string;
    b: string;
    n: number;
}

const rowData: Row[] = Array.from({ length: 10 }, (_, i) => ({ id: String(i), a: `a${i % 3}`, b: `b${i}`, n: i }));

const colState = (api: GridApi<Row>, colId: string) => api.getColumnState().find((col) => col.colId === colId);
const colIds = (api: GridApi<Row>) => api.getColumnState().map((col) => col.colId);

async function setStateSettled(api: GridApi<Row>, state: GridState, propertiesToIgnore?: GridStateKey[]) {
    const settled = waitForEvent('stateUpdated', api);
    api.setState(state, propertiesToIgnore);
    await settled;
}

describe('setState with sections omitted', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('columnOrder', () => {
        test('an omitted columnOrder leaves the columns in their current order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                    { colId: 'n', field: 'n' },
                ],
                rowData,
            });
            await asyncSetTimeout(0);
            api.moveColumns(['n'], 0);
            expect(colIds(api)).toEqual(['n', 'a', 'b']);

            await setStateSettled(api, { sort: { sortModel: [{ colId: 'b', sort: 'asc' }] } });
            expect(colIds(api)).toEqual(['n', 'a', 'b']);

            await setStateSettled(api, {});
            expect(colIds(api)).toEqual(['n', 'a', 'b']);
        });
    });

    describe('pivot mode', () => {
        const pivotOptions: GridOptions<Row> = {
            columnDefs: [
                { colId: 'a', field: 'a', enablePivot: true },
                { colId: 'n', field: 'n', enableValue: true },
            ],
            rowData,
        };

        test('restoring the same snapshot with pivot in propertiesToIgnore keeps pivot mode on', async () => {
            const api = gridsManager.createGrid('myGrid', pivotOptions);
            await asyncSetTimeout(0);
            const snapshot = api.getState();

            api.setGridOption('pivotMode', true);
            await waitFor(() => expect(api.isPivotMode()).toBe(true));

            await setStateSettled(api, snapshot, ['pivot']);

            expect(api.isPivotMode()).toBe(true);
        });

        test('a state without a pivot section leaves pivot mode off and raises no more pinnedRowsChanged than ignoring pivot when pivotMode was never set', async () => {
            const state: GridState = { sort: { sortModel: [{ colId: 'n', sort: 'asc' }] } };

            async function applyAndCount(propertiesToIgnore: GridStateKey[]) {
                const api = gridsManager.createGrid('myGrid', {
                    ...pivotOptions,
                    enableRowPinning: true,
                    getRowId: (params) => params.data.id,
                    initialState: { rowPinning: { top: ['1'], bottom: [] } },
                });
                await asyncSetTimeout(0);
                expect(api.isPivotMode()).toBe(false);
                const pinnedRowsChanged = vi.fn();
                api.addEventListener('pinnedRowsChanged', pinnedRowsChanged);

                await setStateSettled(api, state, propertiesToIgnore);
                await asyncSetTimeout(0);

                const result = { pivotMode: api.isPivotMode(), pinnedRowsChanged: pinnedRowsChanged.mock.calls.length };
                gridsManager.reset();
                return result;
            }

            const pivotOmitted = await applyAndCount(['rowPinning']);
            const pivotIgnored = await applyAndCount(['rowPinning', 'pivot']);

            expect(pivotOmitted).toEqual(pivotIgnored);
            expect(pivotOmitted.pivotMode).toBe(false);
        });
    });

    describe('pivotSort', () => {
        const pivotState: GridState = { pivot: { pivotMode: true, pivotColIds: ['a'] } };

        function createPivotGrid(colDefExtras: { pivotSort?: 'asc' | 'desc'; initialPivotSort?: 'asc' | 'desc' }) {
            return gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', field: 'a', enablePivot: true, ...colDefExtras },
                    { colId: 'n', field: 'n', enableValue: true },
                ],
                rowData,
            });
        }

        async function applyUserPivotSort(api: GridApi<Row>, pivotSort: 'asc' | 'desc') {
            await setStateSettled(api, pivotState);
            api.applyColumnState({ state: [{ colId: 'a', pivotSort }] });
            expect(colState(api, 'a')?.pivotSort).toBe(pivotSort);
        }

        test('pivot in propertiesToIgnore keeps the pivotSort the user applied', async () => {
            const api = createPivotGrid({ pivotSort: 'desc' });
            await asyncSetTimeout(0);
            await applyUserPivotSort(api, 'asc');

            await setStateSettled(api, {}, ['pivot']);

            expect(colState(api, 'a')?.pivotSort).toBe('asc');
        });
    });

    describe('version-less cellSelection', () => {
        const range: CellSelectionCellState = {
            startRow: { rowIndex: 0, rowPinned: null },
            endRow: { rowIndex: 1, rowPinned: null },
            colIds: ['b'],
            startColId: 'b',
        };
        const options: GridOptions<Row> = {
            columnDefs: [
                { colId: 'a', field: 'a' },
                { colId: 'b', field: 'b' },
            ],
            rowData,
            cellSelection: true,
        };

        test.each<[string, GridState]>([
            ['the deprecated rangeSelection', { rangeSelection: { cellRanges: [range] } }],
        ])('setState applies a state without a version holding only %s', async (_name, state) => {
            const api = gridsManager.createGrid('myGrid', options);
            await asyncSetTimeout(0);
            expect(state.version).toBeUndefined();

            api.setState(state);

            await waitFor(() => expect(api.getCellRanges()).toHaveLength(1));
            expect(api.getCellRanges()![0].columns.map((col) => col.getColId())).toEqual(['b']);
        });

        test.each<[string, GridState]>([
            ['the deprecated rangeSelection', { rangeSelection: { cellRanges: [range] } }],
        ])('initialState without a version holding only %s selects the range', async (_name, state) => {
            const api = gridsManager.createGrid('myGrid', { ...options, initialState: state });

            await waitFor(() => expect(api.getCellRanges()).toHaveLength(1));
            expect(api.getCellRanges()![0].columns.map((col) => col.getColId())).toEqual(['b']);
        });
    });

    describe('group expansion', () => {
        const groupOptions: GridOptions<Row> = {
            columnDefs: [
                { colId: 'a', field: 'a', rowGroup: true, hide: true },
                { colId: 'b', field: 'b' },
            ],
            rowData,
            groupDefaultExpanded: 0,
            getRowId: (params) => params.data.id,
        };
        const sameGrouping: GridState = { rowGroup: { groupColIds: ['a'] } };

        const expandedGroupIds = (api: GridApi<Row>) => {
            const ids: string[] = [];
            api.forEachNode((node) => {
                if (node.group && node.expanded) {
                    ids.push(node.id!);
                }
            });
            return ids;
        };

        async function createWithA0Expanded() {
            const api = gridsManager.createGrid('myGrid', groupOptions);
            await asyncSetTimeout(0);
            api.getRowNode('row-group-a-a0')!.setExpanded(true);
            await waitFor(() => expect(expandedGroupIds(api)).toEqual(['row-group-a-a0']));
            return api;
        }

        test('an omitted rowGroupExpansion collapses the expanded groups', async () => {
            const api = await createWithA0Expanded();

            await setStateSettled(api, sameGrouping);

            expect(expandedGroupIds(api)).toEqual([]);
        });

        test('a grid with groupDefaultExpanded -1 and an initialState without rowGroupExpansion shows its groups expanded, as without initialState', async () => {
            const options: GridOptions<Row> = { ...groupOptions, groupDefaultExpanded: -1 };

            const plain = gridsManager.createGrid('myGrid', options);
            await asyncSetTimeout(0);
            const expectedIds = expandedGroupIds(plain).sort();
            expect(expectedIds).toEqual(['row-group-a-a0', 'row-group-a-a1', 'row-group-a-a2']);
            gridsManager.reset();

            const api = gridsManager.createGrid('myGrid', {
                ...options,
                initialState: {
                    rowGroup: { groupColIds: ['a'] },
                    sort: { sortModel: [{ colId: 'b', sort: 'desc' }] },
                },
            });
            await waitFor(() => expect(colState(api, 'b')?.sort).toBe('desc'));

            expect(expandedGroupIds(api).sort()).toEqual(expectedIds);
        });
    });
});
