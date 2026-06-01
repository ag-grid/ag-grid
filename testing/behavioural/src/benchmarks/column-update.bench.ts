import { bench, suite } from 'vitest';

import type { ColDef, ColGroupDef, ColumnState, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, RowSelectionModule } from 'ag-grid-community';
import { GroupFilterModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

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
    // `apply` runs once per iteration against a single long-lived grid (created in `setup`).
    // Scenarios that need a "real change" each call alternate on `iter & 1`.
    const benchUpdate = (name: string, initial: GridOptions, apply: (api: GridApi, iter: number) => void) => {
        const id = `CU${++gridId}`;
        const gridsManager = new TestGridsManager({ benchmark: true, modules });
        let api!: GridApi;
        let iter = 0;
        bench(
            name,
            () => {
                apply(api, iter++);
            },
            {
                throws: true,
                setup: () => {
                    gridsManager.reset();
                    iter = 0;
                    api = gridsManager.createGrid(id, { ...initial, rowData: tinyRows });
                },
            }
        );
    };

    const cols50 = buildFlatCols(50);
    const ids50 = colIdsOf(cols50);

    // Pure snapshot read — allocates one ColumnState object per column.
    benchUpdate('getColumnState 50 flat cols', { columnDefs: cols50 }, (api) => {
        api.getColumnState();
    });

    // Restore a saved snapshot (captured once) — idempotent state but a full refresh every call.
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

    // Reverse vs forward order each call (applyOrder true) — exercises orderLiveColsLikeState + locked placement.
    const forward50: ColumnState[] = ids50.map((colId) => ({ colId }));
    const reversed50: ColumnState[] = ids50
        .slice()
        .reverse()
        .map((colId) => ({ colId }));
    benchUpdate('applyColumnState reverse/forward order 50 cols (applyOrder)', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? forward50 : reversed50, applyOrder: true });
    });

    // Toggle visibility on half the cols each call.
    const hideHalf50: ColumnState[] = ids50.map((colId, i) => ({ colId, hide: (i & 1) === 0 }));
    const showAll50: ColumnState[] = ids50.map((colId) => ({ colId, hide: false }));
    benchUpdate('applyColumnState toggle visibility half of 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? showAll50 : hideHalf50 });
    });

    // Toggle pinning on the first 5 cols each call.
    const pinLeft50: ColumnState[] = ids50.map((colId, i) => ({ colId, pinned: i < 5 ? ('left' as const) : null }));
    const unpinned50: ColumnState[] = ids50.map((colId) => ({ colId, pinned: null }));
    benchUpdate('applyColumnState toggle pinned 5 of 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? unpinned50 : pinLeft50 });
    });

    // setColumnsVisible API — narrower entry point than applyColumnState.
    benchUpdate('setColumnsVisible toggle 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.setColumnsVisible(ids50, (i & 1) === 1);
    });

    // resetColumnState — applies state then re-applies an order pass (two internal applies).
    benchUpdate('resetColumnState 50 cols', { columnDefs: cols50 }, (api) => {
        api.resetColumnState();
    });

    // Toggle rowGroup on the `group` col — creates/destroys the auto-group col each call.
    const cols20 = buildFlatCols(20);
    const addRowGroup: ColumnState[] = [{ colId: 'group', rowGroup: true, rowGroupIndex: 0 }];
    const clearRowGroup: ColumnState[] = [{ colId: 'group', rowGroup: false, rowGroupIndex: null }];
    benchUpdate('applyColumnState toggle rowGroup (auto col churn) 20 cols', { columnDefs: cols20 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? clearRowGroup : addRowGroup });
    });

    // Grouped layout: reverse vs forward leaf order with column groups present.
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

    // Multi-column sort — sort + sortIndex on the first 6 cols, flipping asc/desc each call.
    const sortAsc6: ColumnState[] = ids50
        .slice(0, 6)
        .map((colId, i) => ({ colId, sort: 'asc' as const, sortIndex: i }));
    const sortDesc6: ColumnState[] = ids50
        .slice(0, 6)
        .map((colId, i) => ({ colId, sort: 'desc' as const, sortIndex: i }));
    benchUpdate('applyColumnState multi-sort 6 of 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? sortAsc6 : sortDesc6 });
    });

    // Width — set an explicit width on every col, alternating two values each call.
    const widthA50: ColumnState[] = ids50.map((colId) => ({ colId, width: 120 }));
    const widthB50: ColumnState[] = ids50.map((colId) => ({ colId, width: 180 }));
    benchUpdate('applyColumnState set width 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? widthA50 : widthB50 });
    });

    // Flex — set flex on every col, alternating two values each call (triggers flex layout pass).
    const flexA50: ColumnState[] = ids50.map((colId) => ({ colId, flex: 1 }));
    const flexB50: ColumnState[] = ids50.map((colId) => ({ colId, flex: 2 }));
    benchUpdate('applyColumnState set flex 50 cols', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? flexA50 : flexB50 });
    });

    // aggFunc — toggle the value column's aggregation on/off (exercises valueColsSvc.syncColumnWithState).
    const addAgg: ColumnState[] = [{ colId: 'value', aggFunc: 'sum' }];
    const clearAgg: ColumnState[] = [{ colId: 'value', aggFunc: null }];
    benchUpdate('applyColumnState toggle aggFunc on value col 20 cols', { columnDefs: cols20 }, (api, i) => {
        api.applyColumnState({ state: i & 1 ? clearAgg : addAgg });
    });

    // Pivot — toggle pivot + pivotIndex on the `group` col while pivot mode is active.
    const addPivot: ColumnState[] = [{ colId: 'group', pivot: true, pivotIndex: 0 }];
    const clearPivot: ColumnState[] = [{ colId: 'group', pivot: false, pivotIndex: null }];
    benchUpdate(
        'applyColumnState toggle pivot (pivotMode) 20 cols',
        { columnDefs: cols20, pivotMode: true },
        (api, i) => {
            api.applyColumnState({ state: i & 1 ? clearPivot : addPivot });
        }
    );

    // defaultState — a partial state for one col, with defaultState applied to the other 49 cols.
    const partialState: ColumnState[] = [{ colId: 'c0', hide: true }];
    benchUpdate('applyColumnState with defaultState (49 cols defaulted)', { columnDefs: cols50 }, (api, i) => {
        api.applyColumnState({ state: partialState, defaultState: { hide: (i & 1) === 0 } });
    });
});
