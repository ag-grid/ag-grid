/**
 * Tree data filtering benchmark — measures filter stage performance with tree data (parentId mode).
 *
 * Exercises the filterNodesTreeData depth-first path where parent match propagates
 * to all descendants (excludeChildrenWhenTreeDataFiltering=false, the default).
 */
import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

interface TreeRow {
    id: string;
    parentId?: string;
    name: string;
    value: number;
}

const ROW_COUNT = 10_000;
const MAX_DEPTH = 8;

function buildTreeData(count: number, prng = new SimplePRNG(0x7a8b9c0d)): TreeRow[] {
    const rows: TreeRow[] = [];
    const pathStack: { id: string; depth: number }[] = [];
    let idCounter = 0;

    for (let i = 0; i < count; ++i) {
        // Randomly pop some levels to create varied depth
        for (let pop = 0; pop < 3; ++pop) {
            if (pathStack.length === 0 || prng.nextFloat(0, 1) < 0.55) {
                break;
            }
            pathStack.pop();
        }

        let parent = pathStack[pathStack.length - 1];
        if (parent && parent.depth >= MAX_DEPTH - 1 && prng.nextFloat(0, 1) < 0.5) {
            parent = undefined!;
        }

        const id = 'T' + (idCounter++).toString(36);
        const row: TreeRow = {
            id,
            parentId: parent?.id,
            name: prng.nextString(10),
            value: prng.nextFloat(0, 1000),
        };
        rows.push(row);

        const depth = parent ? parent.depth + 1 : 0;
        if (depth < MAX_DEPTH - 1 && prng.nextFloat(0, 1) < 0.65) {
            pathStack.push({ id, depth });
        }
    }
    return rows;
}

function buildUpdatedData(base: TreeRow[], prng = new SimplePRNG(0x0d9c8b7a)): TreeRow[] {
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

const dataA = buildTreeData(ROW_COUNT);
const dataB = buildUpdatedData(dataA);

const modules = [ClientSideRowModelModule, NumberFilterModule, TextFilterModule, TreeDataModule];

// ~50% pass
const filterHalf = { value: { type: 'greaterThan', filter: 500 } };
// ~10% pass
const filterSelective = { value: { type: 'greaterThan', filter: 900 } };
// ~90% pass
const filterPermissive = { value: { type: 'greaterThan', filter: 100 } };

suite(`tree data filtering — ${ROW_COUNT} rows, depth ${MAX_DEPTH}`, () => {
    let gridId = 0;

    const benchFilter = (
        name: string,
        fn: (api: GridApi) => void,
        initialData: TreeRow[],
        initialFilter?: Record<string, any>
    ) => {
        const id = `TF${++gridId}`;
        const gridsManager = new TestGridsManager({ benchmark: true, modules });
        let api!: GridApi;

        const benchOptions: BenchOptions = {
            throws: true,
            setup: () => {
                gridsManager.reset();
                api = gridsManager.createGrid(id, {
                    columnDefs: [{ field: 'name' }, { field: 'value', filter: 'agNumberColumnFilter' }],
                    autoGroupColumnDef: { headerName: 'Tree' },
                    treeData: true,
                    treeDataParentIdField: 'parentId',
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
