import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

/**
 * Benchmarks the delta-sorting example scenario:
 * 100k rows, multi-column sort, applyTransaction with 1 add + 1 update.
 *
 * Mirrors: documentation/ag-grid-docs/src/content/docs/data-update-transactions/_examples/delta-sorting/
 */

interface IData {
    id: number;
    sort: number;
    sort1: number;
    sort2: number;
}

const ROW_COUNT = 100_000;

function buildRowData(count: number, prng: SimplePRNG): IData[] {
    const result = new Array<IData>(count);
    for (let i = 0; i < count; i++) {
        result[i] = {
            id: i,
            sort: prng.nextInt(2000, 2002),
            sort1: prng.nextInt(2000, 2002),
            sort2: prng.nextInt(2000, 102000),
        };
    }
    return result;
}

suite('delta sort transactions (100k rows, multi-column sort)', () => {
    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, ColumnApiModule],
    });

    const prng = new SimplePRNG(0xde17a50);
    const baseRowData = buildRowData(ROW_COUNT, prng);

    let deltaSortApi!: GridApi<IData>;
    let fullSortApi!: GridApi<IData>;
    let nextId = ROW_COUNT;

    const gridOptions = {
        columnDefs: [
            { field: 'id' as const },
            { field: 'sort' as const, sortIndex: 0, sort: 'desc' as const },
            { field: 'sort1' as const, sortIndex: 1, sort: 'desc' as const },
            { field: 'sort2' as const, sortIndex: 2, sort: 'desc' as const },
        ],
        defaultColDef: { flex: 1 },
        getRowId: ({ data }: { data: IData }) => String(data.id),
    };

    const benchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            nextId = ROW_COUNT;
            deltaSortApi ??= gridsManager.createGrid('delta', {
                ...gridOptions,
                deltaSort: true,
                rowData: baseRowData.slice(),
            });
            fullSortApi ??= gridsManager.createGrid('full', {
                ...gridOptions,
                deltaSort: false,
                rowData: baseRowData.slice(),
            });
        },
        teardown: () => {
            gridsManager.reset();
            deltaSortApi = undefined!;
            fullSortApi = undefined!;
        },
    };

    bench(
        'applyTransaction (deltaSort: true) - 1 add + 1 update',
        () => {
            const id = nextId++;
            deltaSortApi.applyTransaction({
                add: [
                    {
                        id,
                        sort: prng.nextInt(2000, 2002),
                        sort1: prng.nextInt(2000, 2002),
                        sort2: prng.nextInt(2000, 102000),
                    },
                ],
                update: [
                    {
                        id: 1,
                        sort: prng.nextInt(2000, 2002),
                        sort1: prng.nextInt(2000, 2002),
                        sort2: prng.nextInt(2000, 102000),
                    },
                ],
            });
        },
        benchOptions
    );

    bench(
        'applyTransaction (deltaSort: false) - 1 add + 1 update',
        () => {
            const id = nextId++;
            fullSortApi.applyTransaction({
                add: [
                    {
                        id,
                        sort: prng.nextInt(2000, 2002),
                        sort1: prng.nextInt(2000, 2002),
                        sort2: prng.nextInt(2000, 102000),
                    },
                ],
                update: [
                    {
                        id: 1,
                        sort: prng.nextInt(2000, 2002),
                        sort1: prng.nextInt(2000, 2002),
                        sort2: prng.nextInt(2000, 102000),
                    },
                ],
            });
        },
        benchOptions
    );
});
