import { bench, suite } from 'vitest';

import type { ColDef, ColGroupDef, ColumnState, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, RowSelectionModule } from 'ag-grid-community';
import { GroupFilterModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const modules = [
    ClientSideRowModelModule,
    ColumnApiModule,
    RowSelectionModule,
    RowGroupingModule,
    PivotModule,
    GroupFilterModule,
];

const tinyRows: { id: string; group: string; value: number; [key: string]: any }[] = [
    { id: '1', group: 'A', value: 10 },
];

const buildFlatCols = (n: number): ColDef[] => {
    const cols: ColDef[] = [
        { colId: 'group', field: 'group' },
        { colId: 'value', field: 'value' },
    ];
    for (let i = 0; i < n; ++i) {
        cols.push({ colId: `c${i}`, field: `c${i}` });
    }
    return cols;
};

const buildGroupedCols = (leavesPerGroup: number, groupCount: number): (ColDef | ColGroupDef)[] => {
    const out: (ColDef | ColGroupDef)[] = [
        { colId: 'group', field: 'group' },
        { colId: 'value', field: 'value' },
    ];
    for (let g = 0; g < groupCount; ++g) {
        const children: ColDef[] = [];
        for (let i = 0; i < leavesPerGroup; ++i) {
            children.push({ colId: `g${g}_c${i}`, field: `g${g}_c${i}` });
        }
        out.push({ groupId: `g${g}`, headerName: `G${g}`, children });
    }
    return out;
};

const colIdsOf = (defs: (ColDef | ColGroupDef)[]): string[] => {
    const ids: string[] = [];
    const walk = (list: (ColDef | ColGroupDef)[]) => {
        for (let i = 0, len = list.length; i < len; ++i) {
            const children = (list[i] as ColGroupDef).children;
            if (children) {
                walk(children);
            } else {
                ids.push((list[i] as ColDef).colId!);
            }
        }
    };
    walk(defs);
    return ids;
};

suite('column update — applyColumnState / getColumnState paths (tiny rowData)', () => {
    let gridId = 0;
    // Cell re-layout after a column change waits on a frame never flushed here: these measure the model.
    const gridsManager = new BenchGridsManager({ modules });
    // Every call makes a change and undoes it, so calls are alike and each one does real work.
    const benchUpdate = (
        name: string,
        initial: GridOptions,
        roundTrip: (api: GridApi) => void,
        init?: (api: GridApi) => void
    ) => {
        const id = `CU${++gridId}`;
        let api!: GridApi;
        bench(
            name,
            () => {
                roundTrip(api);
            },
            {
                ...benchDefaults(),
                setup: async () => {
                    await gridsManager.reset();
                    api = gridsManager.createGrid(id, { ...initial, rowData: tinyRows });
                    init?.(api);
                },
            }
        );
    };

    const cols50 = buildFlatCols(50);
    const ids50 = colIdsOf(cols50);

    // Reset and restore both have work to do only from a state away from the colDefs'.
    const sorted = ['c40', 'c44'];
    const custom50: ColumnState[] = ids50
        .slice()
        .reverse()
        .map((colId, i): ColumnState => {
            const sortIndex = sorted.indexOf(colId);
            return {
                colId,
                width: i % 3 === 0 ? 150 : undefined,
                pinned: i < 3 ? 'left' : null,
                sort: sortIndex < 0 ? null : 'asc',
                sortIndex: sortIndex < 0 ? null : sortIndex,
                hide: i % 5 === 4,
            };
        });
    benchUpdate(
        'save, reset and restore column state 50 cols (order, width, pinned, sort, hidden)',
        { columnDefs: cols50 },
        (api) => {
            const saved = api.getColumnState();
            api.resetColumnState();
            api.applyColumnState({ state: saved, applyOrder: true });
        },
        (api) => api.applyColumnState({ state: custom50, applyOrder: true })
    );

    const mixed = [...buildFlatCols(18), ...buildGroupedCols(5, 6).slice(2)]; // 20 flat + 6 groups × 5
    const mixedIds = colIdsOf(mixed);
    const mixedForward: ColumnState[] = mixedIds.map((colId) => ({ colId }));
    const mixedReversed: ColumnState[] = mixedIds
        .slice()
        .reverse()
        .map((colId) => ({ colId }));
    benchUpdate(
        'applyColumnState reverse and restore order, 20 flat + 6 groups × 5 cols',
        { columnDefs: mixed },
        (api) => {
            api.applyColumnState({ state: mixedReversed, applyOrder: true });
            api.applyColumnState({ state: mixedForward, applyOrder: true });
        }
    );

    const hideHalf50: ColumnState[] = ids50.map((colId, i) => ({ colId, hide: (i & 1) === 0 }));
    benchUpdate(
        'hide 50 cols, show half, show all (with selection col)',
        { columnDefs: cols50, rowSelection: { mode: 'multiRow' } },
        (api) => {
            api.setColumnsVisible(ids50, false);
            api.applyColumnState({ state: hideHalf50 });
            api.applyColumnState({ defaultState: { hide: false } });
        }
    );

    const pinLeft50: ColumnState[] = ids50.map((colId, i) => ({ colId, pinned: i < 5 ? ('left' as const) : null }));
    const unpinned50: ColumnState[] = ids50.map((colId) => ({ colId, pinned: null }));
    benchUpdate('applyColumnState pin and unpin 5 of 50 cols', { columnDefs: cols50 }, (api) => {
        api.applyColumnState({ state: pinLeft50 });
        api.applyColumnState({ state: unpinned50 });
    });

    const sortAsc6: ColumnState[] = ids50
        .slice(0, 6)
        .map((colId, i) => ({ colId, sort: 'asc' as const, sortIndex: i }));
    const sortDesc6: ColumnState[] = ids50
        .slice(0, 6)
        .map((colId, i) => ({ colId, sort: 'desc' as const, sortIndex: i }));
    benchUpdate('applyColumnState multi-sort 6 of 50 cols, asc then desc', { columnDefs: cols50 }, (api) => {
        api.applyColumnState({ state: sortAsc6 });
        api.applyColumnState({ state: sortDesc6 });
    });

    const flex50: ColumnState[] = ids50.map((colId) => ({ colId, flex: 1 }));
    const width50: ColumnState[] = ids50.map((colId) => ({ colId, width: 120, flex: null }));
    benchUpdate('applyColumnState flex then fixed width 50 cols', { columnDefs: cols50 }, (api) => {
        api.applyColumnState({ state: flex50 });
        api.applyColumnState({ state: width50 });
    });

    const cols20 = buildFlatCols(20);
    const addGroupAndAgg: ColumnState[] = [
        { colId: 'group', rowGroup: true, rowGroupIndex: 0 },
        { colId: 'value', aggFunc: 'sum' },
    ];
    const clearGroupAndAgg: ColumnState[] = [
        { colId: 'group', rowGroup: false, rowGroupIndex: null },
        { colId: 'value', aggFunc: null },
    ];
    benchUpdate(
        'applyColumnState rowGroup + aggFunc on and off (auto col churn) 20 cols',
        { columnDefs: cols20 },
        (api) => {
            api.applyColumnState({ state: addGroupAndAgg });
            api.applyColumnState({ state: clearGroupAndAgg });
        }
    );

    const addPivot: ColumnState[] = [{ colId: 'group', pivot: true, pivotIndex: 0 }];
    const clearPivot: ColumnState[] = [{ colId: 'group', pivot: false, pivotIndex: null }];
    benchUpdate(
        'applyColumnState pivot on and off (pivotMode) 20 cols',
        { columnDefs: cols20, pivotMode: true },
        (api) => {
            api.applyColumnState({ state: addPivot });
            api.applyColumnState({ state: clearPivot });
        }
    );
});
