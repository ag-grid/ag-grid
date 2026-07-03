import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

import { BenchGridsManager, SimplePRNG, benchDefaults } from './bench-utils';

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

const ROW_COUNT = 50_000;

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

// Pre-generate all data so the measured loop does zero allocation or PRNG work.
const PREBUILT_COUNT = 500;
const txnPrng = new SimplePRNG(0xde17a50);
const baseRowData = buildRowData(ROW_COUNT, txnPrng);
const prebuiltTransactions: { update: IData[] }[] = [];
for (let i = 0; i < PREBUILT_COUNT; i++) {
    prebuiltTransactions.push({
        update: [
            {
                id: txnPrng.nextInt(0, ROW_COUNT - 1),
                sort: txnPrng.nextInt(2000, 2002),
                sort1: txnPrng.nextInt(2000, 2002),
                sort2: txnPrng.nextInt(2000, 102000),
            },
        ],
    });
}

suite(`delta sort transactions (${ROW_COUNT / 1000}k rows, multi-column sort)`, () => {
    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, ColumnApiModule],
    });

    let deltaSortApi!: GridApi<IData>;
    let fullSortApi!: GridApi<IData>;
    let idx = 0;

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

    // noiseFactor 2 → time 2000ms; each iteration is a single tiny transaction, so it needs many
    // iterations and warmupIterations:25 to settle before measuring.
    const benchOptions = benchDefaults({
        noiseFactor: 2,
        warmupIterations: 25,
        setup: () => {
            idx = 0;
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
        teardown: async () => {
            deltaSortApi = undefined!;
            fullSortApi = undefined!;
            await gridsManager.reset();
        },
    });

    bench(
        'applyTransaction (deltaSort: true) - 1 update',
        () => {
            deltaSortApi.applyTransaction(prebuiltTransactions[idx++ % PREBUILT_COUNT]);
        },
        benchOptions
    );

    bench(
        'applyTransaction (deltaSort: false) - 1 update',
        () => {
            fullSortApi.applyTransaction(prebuiltTransactions[idx++ % PREBUILT_COUNT]);
        },
        benchOptions
    );
});
