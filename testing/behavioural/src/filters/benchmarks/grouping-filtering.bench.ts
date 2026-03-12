/**
 * Grouped grid filtering benchmark — measures filter stage performance with row grouping.
 *
 * Uses 3-level grouping (5 x 6 x 4 = 120 groups) to exercise the hierarchical
 * depth-first filter path including the descendant short-circuit.
 */
import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

interface GroupRow {
    id: string;
    group1: string;
    group2: string;
    group3: string;
    value: number;
    name: string;
}

const ROW_COUNT = 10_000;

const G1 = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'];
const G2 = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
const G3 = ['Region W', 'Region X', 'Region Y', 'Region Z'];

function buildGroupData(count: number, prng = new SimplePRNG(0xf1e2d3c4)): GroupRow[] {
    const rows: GroupRow[] = [];
    for (let i = 0; i < count; ++i) {
        rows.push({
            id: i.toString(),
            group1: prng.pick(G1)!,
            group2: prng.pick(G2)!,
            group3: prng.pick(G3)!,
            value: prng.nextFloat(0, 1000),
            name: prng.nextString(10),
        });
    }
    return rows;
}

function buildUpdatedData(base: GroupRow[], prng = new SimplePRNG(0xc4d3e2f1)): GroupRow[] {
    const updated = base.slice();
    const changeCount = Math.floor(base.length * 0.05);
    const indices = new Set<number>();
    while (indices.size < changeCount) {
        indices.add(prng.nextInt(0, updated.length - 1));
    }
    for (const idx of indices) {
        updated[idx] = { ...updated[idx], value: prng.nextFloat(0, 1000) };
    }
    return updated;
}

const dataA = buildGroupData(ROW_COUNT);
const dataB = buildUpdatedData(dataA);

const columnDefs: ColDef[] = [
    { field: 'group1', rowGroup: true, hide: true },
    { field: 'group2', rowGroup: true, hide: true },
    { field: 'group3', rowGroup: true, hide: true },
    { field: 'value', filter: 'agNumberColumnFilter' },
    { field: 'name' },
];

const modules = [ClientSideRowModelModule, NumberFilterModule, TextFilterModule, RowGroupingModule];

// ~50% pass
const filterHalf = { value: { type: 'greaterThan', filter: 500 } };
// ~10% pass — many groups will be fully excluded, testing descendant short-circuit
const filterSelective = { value: { type: 'greaterThan', filter: 900 } };
// ~90% pass — most groups kept, tests zero-allocation path
const filterPermissive = { value: { type: 'greaterThan', filter: 100 } };

suite(`grouped filtering — ${ROW_COUNT} rows, 3-level grouping`, () => {
    let gridId = 0;

    const benchFilter = (
        name: string,
        fn: (api: GridApi) => void,
        initialData: GroupRow[],
        initialFilter?: Record<string, any>
    ) => {
        const id = `GF${++gridId}`;
        const gridsManager = new TestGridsManager({ benchmark: true, modules });
        let api!: GridApi;

        const benchOptions: BenchOptions = {
            throws: true,
            setup: () => {
                gridsManager.reset();
                api = gridsManager.createGrid(id, {
                    columnDefs,
                    autoGroupColumnDef: { headerName: 'Group' },
                    groupDefaultExpanded: -1,
                    rowData: initialData,
                    getRowId: ({ data }) => data.id,
                });
                if (initialFilter) {
                    api.setFilterModel(initialFilter);
                }
            },
        };

        bench(name, () => fn(api), benchOptions);
    };

    benchFilter(
        'apply + clear filter (50% pass)',
        (api) => {
            api.setFilterModel(filterHalf);
            api.setFilterModel(null);
        },
        dataA
    );

    benchFilter(
        'apply + clear filter (10% pass)',
        (api) => {
            api.setFilterModel(filterSelective);
            api.setFilterModel(null);
        },
        dataA
    );

    benchFilter(
        'apply + clear filter (90% pass)',
        (api) => {
            api.setFilterModel(filterPermissive);
            api.setFilterModel(null);
        },
        dataA
    );

    benchFilter(
        're-filter after data update (50% pass)',
        (api) => {
            api.setGridOption('rowData', dataB);
            api.setGridOption('rowData', dataA);
        },
        dataA,
        filterHalf
    );

    benchFilter(
        'repeated filter (no change, prev reuse)',
        (api) => {
            api.setFilterModel(filterHalf);
        },
        dataA,
        filterHalf
    );
});
