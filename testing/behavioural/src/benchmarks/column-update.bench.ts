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
    // 1.5: with the GC-stability flags these mutations sit ~1.5–2% in isolation; higher factors mostly
    // buy CPU-contention noise on a long run, and keep the suite within the per-run time budget.
    const benchUpdate = (
        name: string,
        initial: GridOptions,
        apply: (api: GridApi, iter: number) => void,
        noiseFactor = 1.5
    ) => {
        const id = `CU${++gridId}`;
        const gridsManager = new BenchGridsManager({ modules });
        let api!: GridApi;
        let iter = 0;
        bench(
            name,
            () => {
                apply(api, iter++);
            },
            {
                ...benchDefaults({ noiseFactor }),
                setup: async () => {
                    await gridsManager.reset();
                    iter = 0;
                    api = gridsManager.createGrid(id, { ...initial, rowData: tinyRows });
                },
            }
        );
    };

    const cols50 = buildFlatCols(50);
    const ids50 = colIdsOf(cols50);

    benchUpdate('getColumnState 50 flat cols', { columnDefs: cols50 }, (api) => {
        api.getColumnState();
    });

    benchUpdate(
        'applyColumnState restore saved state 50 flat cols',
        { columnDefs: cols50 },
        (() => {
            let saved: ColumnState[] | null = null;
            return (api: GridApi) => {
                saved ??= api.getColumnState();
                api.applyColumnState({ state: saved, applyOrder: true });
            };
        })()
    );

    const forward50: ColumnState[] = ids50.map((colId) => ({ colId }));
    const reversed50: ColumnState[] = ids50
        .slice()
        .reverse()
        .map((colId) => ({ colId }));
    benchUpdate('applyColumnState reverse/forward order 50 cols (applyOrder)', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? forward50 : reversed50, applyOrder: true });
    });

    const hideHalf50: ColumnState[] = ids50.map((colId, i) => ({ colId, hide: (i & 1) === 0 }));
    const showAll50: ColumnState[] = ids50.map((colId) => ({ colId, hide: false }));
    benchUpdate('applyColumnState toggle visibility half of 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? showAll50 : hideHalf50 });
    });

    const pinLeft50: ColumnState[] = ids50.map((colId, i) => ({ colId, pinned: i < 5 ? ('left' as const) : null }));
    const unpinned50: ColumnState[] = ids50.map((colId) => ({ colId, pinned: null }));
    benchUpdate('applyColumnState toggle pinned 5 of 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? unpinned50 : pinLeft50 });
    });

    benchUpdate('setColumnsVisible toggle 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.setColumnsVisible(ids50, (i & 1) === 1);
    });

    benchUpdate(
        'setColumnsVisible toggle 50 cols (with selection col)',
        { columnDefs: cols50, rowSelection: { mode: 'multiRow' } },
        (api, i) => {
            api.setColumnsVisible(ids50, (i & 1) === 1);
        }
    );

    benchUpdate('resetColumnState 50 cols', { columnDefs: cols50 }, (api) => {
        api.resetColumnState();
    });

    const cols20 = buildFlatCols(20);
    const addRowGroup: ColumnState[] = [{ colId: 'group', rowGroup: true, rowGroupIndex: 0 }];
    const clearRowGroup: ColumnState[] = [{ colId: 'group', rowGroup: false, rowGroupIndex: null }];
    benchUpdate('applyColumnState toggle rowGroup (auto col churn) 20 cols', { columnDefs: cols20 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? clearRowGroup : addRowGroup });
    });

    const grouped = buildGroupedCols(5, 8); // 8 groups × 5 leaves
    const gIds = colIdsOf(grouped);
    const gForward: ColumnState[] = gIds.map((colId) => ({ colId }));
    const gReversed: ColumnState[] = gIds
        .slice()
        .reverse()
        .map((colId) => ({ colId }));
    benchUpdate(
        'applyColumnState reverse/forward order 8 groups × 5 cols (applyOrder)',
        { columnDefs: grouped },
        (api, i) => {
            api.applyColumnState({ state: i & 1 ? gForward : gReversed, applyOrder: true });
        }
    );

    const sortAsc6: ColumnState[] = ids50
        .slice(0, 6)
        .map((colId, i) => ({ colId, sort: 'asc' as const, sortIndex: i }));
    const sortDesc6: ColumnState[] = ids50
        .slice(0, 6)
        .map((colId, i) => ({ colId, sort: 'desc' as const, sortIndex: i }));
    benchUpdate('applyColumnState multi-sort 6 of 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? sortAsc6 : sortDesc6 });
    });

    const widthA50: ColumnState[] = ids50.map((colId) => ({ colId, width: 120 }));
    const widthB50: ColumnState[] = ids50.map((colId) => ({ colId, width: 180 }));
    benchUpdate('applyColumnState set width 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? widthA50 : widthB50 });
    });

    const flexA50: ColumnState[] = ids50.map((colId) => ({ colId, flex: 1 }));
    const flexB50: ColumnState[] = ids50.map((colId) => ({ colId, flex: 2 }));
    benchUpdate('applyColumnState set flex 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? flexA50 : flexB50 });
    });

    const addAgg: ColumnState[] = [{ colId: 'value', aggFunc: 'sum' }];
    const clearAgg: ColumnState[] = [{ colId: 'value', aggFunc: null }];
    benchUpdate('applyColumnState toggle aggFunc on value col 20 cols', { columnDefs: cols20 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? clearAgg : addAgg });
    });

    const addPivot: ColumnState[] = [{ colId: 'group', pivot: true, pivotIndex: 0 }];
    const clearPivot: ColumnState[] = [{ colId: 'group', pivot: false, pivotIndex: null }];
    benchUpdate(
        'applyColumnState toggle pivot (pivotMode) 20 cols',
        { columnDefs: cols20, pivotMode: true },
        (api, i) => {
            api.applyColumnState({ state: i & 1 ? clearPivot : addPivot });
        }
    );

    const partialState: ColumnState[] = [{ colId: 'c0', hide: true }];
    benchUpdate('applyColumnState with defaultState (49 cols defaulted)', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: partialState, defaultState: { hide: (i & 1) === 0 } });
    });
});
