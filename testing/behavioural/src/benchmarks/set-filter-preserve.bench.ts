import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, RowApiModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchCooldown, benchDefaults } from './bench-utils';

const ROW_COUNT = 50_000;
const CHURN = 1_000;

interface Row {
    id: string;
    code: string;
}

/**
 * A transaction re-keying 1 000 of 50 000 rows with values never seen before, under an active model:
 * the worst churn `preservePreviousValues` has to merge, cap and sort, against the same grid without it.
 */
suite('set filter preservePreviousValues under churn', () => {
    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowApiModule, SetFilterModule],
    });

    const createSetUp = (preservePreviousValues: boolean) => {
        let api: GridApi<Row> | undefined;
        let generation = 0;
        const churn = () => {
            ++generation;
            const update: Row[] = [];
            for (let i = 0; i < CHURN; ++i) {
                update.push({ id: String(i), code: `code-${generation}-${i}` });
            }
            api!.applyTransaction({ update });
        };
        const setUp = async () => {
            await benchCooldown();
            if (api) {
                return;
            }
            const rowData: Row[] = [];
            for (let i = 0; i < ROW_COUNT; ++i) {
                rowData.push({ id: String(i), code: `code-${i}` });
            }
            api = gridsManager.createGrid<Row>(`preserve-${preservePreviousValues}`, {
                columnDefs: [{ field: 'code', filter: 'agSetColumnFilter', filterParams: { preservePreviousValues } }],
                getRowId: ({ data }) => data.id,
                rowData,
            });
            await api.setColumnFilterModel('code', { filterType: 'set', values: ['code-49999'] });
            api.onFilterChanged();
            churn();
            // Guards against measuring a no-op: the transaction must land and the filter must still apply.
            if (api.getRowNode('0')?.data?.code !== `code-${generation}-0` || api.getDisplayedRowCount() !== 1) {
                throw new Error('set filter preserve bench: transaction or filter did not apply');
            }
        };
        return { churn, setUp };
    };

    const off = createSetUp(false);
    const on = createSetUp(true);

    bench(`transaction re-keying ${CHURN} of ${ROW_COUNT} rows: option off`, off.churn, {
        ...benchDefaults(),
        setup: off.setUp,
    });

    bench(`transaction re-keying ${CHURN} of ${ROW_COUNT} rows: option on`, on.churn, {
        ...benchDefaults(),
        setup: on.setUp,
    });
});

const WIDE_COLUMNS = 100;
const WIDE_ROWS = 20_000;
const WIDE_FIELDS = Array.from({ length: WIDE_COLUMNS }, (_, c) => `c${c}`);
let wideRowData: Record<string, string>[] | undefined;
const getWideRowData = () => {
    if (!wideRowData) {
        wideRowData = [];
        for (let r = 0; r < WIDE_ROWS; ++r) {
            const row: Record<string, string> = { id: String(r) };
            for (let c = 0; c < WIDE_COLUMNS; ++c) {
                row[WIDE_FIELDS[c]] = `v${(r * 7 + c) % 1000}`;
            }
            wideRowData.push(row);
        }
    }
    return wideRowData;
};
const wideColumnDefs = (preservePreviousValues: boolean) =>
    WIDE_FIELDS.map((field) => ({ field, filter: 'agSetColumnFilter', filterParams: { preservePreviousValues } }));

/** Grid start with every column opted in, so each filter is created and reads its values up front. */
suite('set filter preservePreviousValues at grid start', () => {
    const gridsManager = new BenchGridsManager({ modules: [ClientSideRowModelModule, RowApiModule, SetFilterModule] });
    const start = (preservePreviousValues: boolean) => () => {
        gridsManager.destroyAll();
        const api = gridsManager.createGrid('wide', {
            columnDefs: wideColumnDefs(preservePreviousValues),
            rowData: getWideRowData(),
        });
        if (api.getDisplayedRowCount() !== WIDE_ROWS) {
            throw new Error('set filter preserve bench: rows did not load');
        }
    };

    bench(`${WIDE_COLUMNS} columns × ${WIDE_ROWS} rows: option off`, start(false), {
        ...benchDefaults(),
        setup: () => gridsManager.reset(),
    });

    bench(`${WIDE_COLUMNS} columns × ${WIDE_ROWS} rows: option on`, start(true), {
        ...benchDefaults(),
        setup: () => gridsManager.reset(),
    });
});

/** One row changing with every column opted in: each filter that exists re-reads every row, and up front that is all of them. */
suite('set filter preservePreviousValues, one-row transaction on a wide grid', () => {
    const gridsManager = new BenchGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowApiModule, SetFilterModule],
    });

    const createSetUp = (preservePreviousValues: boolean) => {
        let api: GridApi | undefined;
        let generation = 0;
        const update = () => {
            ++generation;
            api!.applyTransaction({ update: [{ ...getWideRowData()[0], c0: `u${generation}` }] });
        };
        const setUp = async () => {
            await benchCooldown();
            if (api) {
                return;
            }
            api = gridsManager.createGrid(`wide-update-${preservePreviousValues}`, {
                columnDefs: wideColumnDefs(preservePreviousValues),
                getRowId: ({ data }) => data.id,
                rowData: getWideRowData(),
            });
            update();
            if (api.getRowNode('0')?.data?.c0 !== `u${generation}`) {
                throw new Error('set filter preserve bench: transaction did not apply');
            }
        };
        return { update, setUp };
    };

    const off = createSetUp(false);
    const on = createSetUp(true);

    bench(`${WIDE_COLUMNS} columns × ${WIDE_ROWS} rows, one row updated: option off`, off.update, {
        ...benchDefaults(),
        setup: off.setUp,
    });

    bench(`${WIDE_COLUMNS} columns × ${WIDE_ROWS} rows, one row updated: option on`, on.update, {
        ...benchDefaults(),
        setup: on.setUp,
    });
});
