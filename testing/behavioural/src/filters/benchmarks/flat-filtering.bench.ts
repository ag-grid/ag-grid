/**
 * Flat grid filtering benchmark — measures filter stage performance with no grouping.
 *
 * Scenarios:
 * - Apply/clear filter (toggles between filtered and unfiltered state)
 * - Re-filter after data update (immutable data swap with active filter)
 * - Filter with varying selectivity (few rows pass vs most rows pass)
 */
import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

interface FlatRow {
    id: string;
    name: string;
    value: number;
    category: string;
}

const ROW_COUNT = 30_000;

const CATEGORIES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];

function buildFlatData(count: number, prng = new SimplePRNG(0xa1b2c3d4)): FlatRow[] {
    const rows: FlatRow[] = [];
    for (let i = 0; i < count; ++i) {
        rows.push({
            id: i.toString(),
            name: prng.nextString(12),
            value: prng.nextFloat(0, 1000),
            category: prng.pick(CATEGORIES)!,
        });
    }
    return rows;
}

function buildUpdatedData(base: FlatRow[], prng = new SimplePRNG(0xd4c3b2a1)): FlatRow[] {
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

const dataA = buildFlatData(ROW_COUNT);
const dataB = buildUpdatedData(dataA);

const modules = [ClientSideRowModelModule, NumberFilterModule, TextFilterModule];

// Filter that passes ~50% of rows
const filterHalf = { value: { type: 'greaterThan', filter: 500 } };
// Filter that passes ~10% of rows (high selectivity)
const filterSelective = { value: { type: 'greaterThan', filter: 900 } };
// Filter that passes ~90% of rows (low selectivity)
const filterPermissive = { value: { type: 'greaterThan', filter: 100 } };

suite(`flat filtering — ${ROW_COUNT} rows`, () => {
    let gridId = 0;

    const benchFilter = (
        name: string,
        fn: (api: GridApi) => void,
        initialData: FlatRow[],
        initialFilter?: Record<string, any>
    ) => {
        const id = `F${++gridId}`;
        const gridsManager = new TestGridsManager({ benchmark: true, modules });
        let api!: GridApi;

        const benchOptions: BenchOptions = {
            throws: true,
            setup: () => {
                gridsManager.reset();
                api = gridsManager.createGrid(id, {
                    columnDefs: [
                        { field: 'name' },
                        { field: 'value', filter: 'agNumberColumnFilter' },
                        { field: 'category' },
                    ],
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

    // Toggle filter on/off
    benchFilter(
        'apply + clear filter (50% pass)',
        (api) => {
            api.setFilterModel(filterHalf);
            api.setFilterModel(null);
        },
        dataA
    );

    // High selectivity: ~10% pass
    benchFilter(
        'apply + clear filter (10% pass)',
        (api) => {
            api.setFilterModel(filterSelective);
            api.setFilterModel(null);
        },
        dataA
    );

    // Low selectivity: ~90% pass (tests zero-allocation fast path)
    benchFilter(
        'apply + clear filter (90% pass)',
        (api) => {
            api.setFilterModel(filterPermissive);
            api.setFilterModel(null);
        },
        dataA
    );

    // Re-filter after immutable data update with active filter.
    // Filter is applied in setup so we only measure the data-swap + re-filter path.
    benchFilter(
        're-filter after data update (50% pass)',
        (api) => {
            api.setGridOption('rowData', dataB);
            api.setGridOption('rowData', dataA);
        },
        dataA,
        filterHalf
    );

    // Re-apply identical filter (tests prev array reuse optimisation).
    // Filter is applied in setup so we only measure the re-application.
    benchFilter(
        'repeated filter (no change, prev reuse)',
        (api) => {
            api.setFilterModel(filterHalf);
        },
        dataA,
        filterHalf
    );
});
