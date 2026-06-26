import { bench, suite } from 'vitest';

import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, RowSelectionModule } from 'ag-grid-community';
import { GroupFilterModule, PivotModule, RowGroupingModule, RowNumbersModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const modules = [
    ClientSideRowModelModule,
    ColumnApiModule,
    RowSelectionModule,
    RowGroupingModule,
    PivotModule,
    GroupFilterModule,
    RowNumbersModule,
];

const tinyRows: { id: string; group: string; value: number; [key: string]: any }[] = [
    { id: '1', group: 'A', value: 10 },
];

const buildFlatCols = (n: number, variant: 'A' | 'B'): ColDef[] => {
    const cols: ColDef[] = [
        { colId: 'group', field: 'group', headerName: `group-${variant}` },
        { colId: 'value', field: 'value', headerName: `value-${variant}` },
    ];
    for (let i = 0; i < n; ++i) {
        cols.push({
            colId: `c${i}`,
            field: `c${i}`,
            headerName: `c${i}-${variant}`,
            sortable: variant === 'A',
        });
    }
    return cols;
};

const buildGroupedCols = (leavesPerGroup: number, groupCount: number, variant: 'A' | 'B'): (ColDef | ColGroupDef)[] => {
    const out: (ColDef | ColGroupDef)[] = [
        { colId: 'group', field: 'group', headerName: `group-${variant}` },
        { colId: 'value', field: 'value', headerName: `value-${variant}` },
    ];
    for (let g = 0; g < groupCount; ++g) {
        const children: ColDef[] = [];
        for (let i = 0; i < leavesPerGroup; ++i) {
            children.push({
                colId: `g${g}_c${i}`,
                field: `g${g}_c${i}`,
                headerName: `g${g}_c${i}-${variant}`,
                sortable: variant === 'A',
            });
        }
        out.push({ groupId: `g${g}`, headerName: `G${g}-${variant}`, children });
    }
    return out;
};

suite('column refresh — pure col-model rebuild paths (tiny rowData)', () => {
    let gridId = 0;
    // 1.5: with the GC-stability flags these col-rebuilds sit ~1.5–2% in isolation; higher factors mostly
    // buy CPU-contention noise on a long run, and keep the suite within the per-run time budget.
    const benchRefresh = (
        name: string,
        initial: GridOptions,
        apply: (api: GridApi, iter: number) => void,
        noiseFactor = 1.5
    ) => {
        const id = `CR${++gridId}`;
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

    // Flat colDef rebuilds — alternate A/B so each call is a real structural change.
    const cols10A = buildFlatCols(10, 'A');
    const cols10B = buildFlatCols(10, 'B');
    benchRefresh('setColumnDefs 10 flat cols (alternating defs)', { columnDefs: cols10A }, (api, i) => {
        api.setGridOption('columnDefs', i & 1 ? cols10A : cols10B);
    });
    const cols50A = buildFlatCols(50, 'A');
    const cols50B = buildFlatCols(50, 'B');
    benchRefresh('setColumnDefs 50 flat cols (alternating defs)', { columnDefs: cols50A }, (api, i) => {
        api.setGridOption('columnDefs', i & 1 ? cols50A : cols50B);
    });

    // Grouped colDef rebuilds.
    const groupedShallowA = buildGroupedCols(5, 4, 'A'); // 4 groups × 5 leaves
    const groupedShallowB = buildGroupedCols(5, 4, 'B');
    benchRefresh('setColumnDefs 4 groups × 5 cols (alternating defs)', { columnDefs: groupedShallowA }, (api, i) => {
        api.setGridOption('columnDefs', i & 1 ? groupedShallowA : groupedShallowB);
    });
    const groupedDeepA = buildGroupedCols(5, 10, 'A'); // 10 groups × 5 leaves
    const groupedDeepB = buildGroupedCols(5, 10, 'B');
    benchRefresh('setColumnDefs 10 groups × 5 cols (alternating defs)', { columnDefs: groupedDeepA }, (api, i) => {
        api.setGridOption('columnDefs', i & 1 ? groupedDeepA : groupedDeepB);
    });

    const cols20A = buildFlatCols(20, 'A');
    benchRefresh('setColumnDefs 20 flat cols (no-op fast path, same ref)', { columnDefs: cols20A }, (api) => {
        api.setGridOption('columnDefs', cols20A);
    });

    benchRefresh(
        'setColumnDefs 20 flat cols (no-op fast path, equal-shape new ref)',
        { columnDefs: cols20A },
        (api) => {
            api.setGridOption('columnDefs', buildFlatCols(20, 'A'));
        }
    );

    // Service-col toggles — `refreshCols`'s service-col wrap path. Already exercises change (on/off).
    benchRefresh('toggle rowSelection on/off (20 cols)', { columnDefs: cols20A }, (api) => {
        api.setGridOption('rowSelection', { mode: 'multiRow' });
        api.setGridOption('rowSelection', undefined);
    });
    benchRefresh('toggle rowNumbers on/off (20 cols)', { columnDefs: cols20A, rowNumbers: false }, (api) => {
        api.setGridOption('rowNumbers', true);
        api.setGridOption('rowNumbers', false);
    });

    // rowGroup toggle — auto-group col created/destroyed each iteration.
    benchRefresh('addRowGroupColumns / removeRowGroupColumns (20 cols)', { columnDefs: cols20A }, (api) => {
        api.addRowGroupColumns(['group']);
        api.removeRowGroupColumns(['group']);
    });

    benchRefresh(
        'setColumnDefs unchanged with maintainColumnOrder (fast path)',
        { columnDefs: cols20A, maintainColumnOrder: true },
        (api) => {
            api.setGridOption('columnDefs', cols20A);
        }
    );

    // Pivot mode toggle — full refresh + pivotResultColsService apply/clear.
    benchRefresh('pivot mode on/off (20 cols)', { columnDefs: cols20A, pivotMode: false }, (api) => {
        api.setGridOption('pivotMode', true);
        api.setGridOption('pivotMode', false);
    });

    const buildLocked = (variant: 'A' | 'B') =>
        buildFlatCols(20, variant).map((c, i, arr) => {
            if (i === 0) {
                return { ...c, lockPosition: 'left' as const };
            }
            if (i === arr.length - 1) {
                return { ...c, lockPosition: 'right' as const };
            }
            return c;
        });
    const cols20LockedA = buildLocked('A');
    const cols20LockedB = buildLocked('B');
    benchRefresh(
        'setColumnDefs with lockPosition cols (20 cols, alternating defs)',
        { columnDefs: cols20LockedA },
        (api, i) => {
            api.setGridOption('columnDefs', i & 1 ? cols20LockedA : cols20LockedB);
        }
    );

    // maintainColumnOrder + grouped layout where one leaf per group has a variant-specific colId,
    // so alternating A/B removes 10 cols and adds 10 NEW cols every refresh. This is the scenario
    // that drives applyPrevOrder's slow path: partitionBySiblings + findPreviousSibling +
    // groupHighestLeaf (the colPositionMap / groupHighestLeaf maps). The fast path (lengths + order
    // match) does NOT trigger here because membership changes each iteration.
    const buildGroupedColChurn = (
        leavesPerGroup: number,
        groupCount: number,
        variant: 'A' | 'B'
    ): (ColDef | ColGroupDef)[] => {
        const out: (ColDef | ColGroupDef)[] = [
            { colId: 'group', field: 'group' },
            { colId: 'value', field: 'value' },
        ];
        for (let g = 0; g < groupCount; ++g) {
            const children: ColDef[] = [];
            for (let i = 0; i < leavesPerGroup; ++i) {
                children.push({ colId: `g${g}_c${i}`, field: `g${g}_c${i}` });
            }
            children.push({ colId: `g${g}_x${variant}`, field: `g${g}_x${variant}` });
            out.push({ groupId: `g${g}`, headerName: `G${g}`, children });
        }
        return out;
    };
    const churnA = buildGroupedColChurn(5, 10, 'A');
    const churnB = buildGroupedColChurn(5, 10, 'B');
    benchRefresh(
        'maintainColumnOrder grouped churn (10 groups, 10 new cols/refresh)',
        { columnDefs: churnA, maintainColumnOrder: true },
        (api, i) => {
            api.setGridOption('columnDefs', i & 1 ? churnA : churnB);
        }
    );

    const cols20FlexA: ColDef[] = buildFlatCols(20, 'A').map((c) => ({ ...c, flex: 1 }));
    const cols20FlexB: ColDef[] = buildFlatCols(20, 'B').map((c) => ({ ...c, flex: 1 }));
    benchRefresh('setColumnDefs 20 flex cols (alternating defs)', { columnDefs: cols20FlexA }, (api, i) => {
        api.setGridOption('columnDefs', i & 1 ? cols20FlexA : cols20FlexB);
    });

    // 100-col scenarios — setColumnDefs is the full rebuild path (refreshCols + visibleCols.refresh).
    const cols100A = buildFlatCols(100, 'A');
    const cols100B = buildFlatCols(100, 'B');
    benchRefresh('setColumnDefs 100 flat cols (alternating defs)', { columnDefs: cols100A }, (api, i) => {
        api.setGridOption('columnDefs', i & 1 ? cols100A : cols100B);
    });
    const grouped100A = buildGroupedCols(10, 10, 'A'); // 10 groups × 10 leaves = 100
    const grouped100B = buildGroupedCols(10, 10, 'B');
    benchRefresh('setColumnDefs 10 groups × 10 cols (alternating defs)', { columnDefs: grouped100A }, (api, i) => {
        api.setGridOption('columnDefs', i & 1 ? grouped100A : grouped100B);
    });

    // Column move — near-pure `visibleCols.refresh` (no colDef rebuild): _moveInArray + refresh.
    // Alternating target indices guarantee a real move (and a real refresh) every iteration.
    benchRefresh('move column in 100 flat cols (pure visibleCols.refresh)', { columnDefs: cols100A }, (api, i) => {
        api.moveColumns(['c10'], i & 1 ? 90 : 10);
    });
    benchRefresh(
        'move column in 100 grouped cols (pure visibleCols.refresh)',
        { columnDefs: grouped100A },
        (api, i) => {
            api.moveColumns(['g0_c0'], i & 1 ? 90 : 2);
        }
    );
});
