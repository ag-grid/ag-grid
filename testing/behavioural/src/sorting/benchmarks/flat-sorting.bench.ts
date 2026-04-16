import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { ApplyColumnStateParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

interface IData {
    name: string;
    id: string;
}

suite('flat grid sorting', () => {
    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, ColumnApiModule],
    });

    let api!: GridApi<IData>;
    let apiNoDelta!: GridApi<IData>;

    const rowCount = 30000;
    const updateRatio = 0.3;
    const untouchedShuffleRatio = 0.05;
    const updatesPerBatch = Math.floor(rowCount * updateRatio);
    const baseRowData = buildRandomData(rowCount);
    const updatedRowData = buildUpdatedRowData(baseRowData, updateRatio, untouchedShuffleRatio);

    const benchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs: [{ field: 'name' }],
                deltaSort: true,
                rowData: baseRowData,
                getRowId: ({ data }) => data.id,
            });

            apiNoDelta ??= gridsManager.createGrid('G-no-delta', {
                columnDefs: [{ field: 'name' }],
                deltaSort: false,
                rowData: baseRowData,
                getRowId: ({ data }) => data.id,
            });
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
            apiNoDelta = undefined!;
        },
    };

    const columnStateSortNameAsc: ApplyColumnStateParams = { state: [{ colId: 'name', sort: 'asc' }] };
    const columnStateSortNameDesc: ApplyColumnStateParams = { state: [{ colId: 'name', sort: 'desc' }] };
    const columnStateNoSort: ApplyColumnStateParams = { state: [{ colId: 'name', sort: null }] };

    let ascending = true;
    bench(
        'sort ' + rowCount + ' rows',
        () => {
            api.applyColumnState(ascending ? columnStateSortNameAsc : columnStateSortNameDesc);
            api.applyColumnState(columnStateNoSort);
            ascending = !ascending;
        },
        benchOptions
    );

    let useUpdatedData = false;
    bench(
        `delta sort with ${Math.round(updateRatio * 100)}% updates (${updatesPerBatch}/${rowCount})`,
        () => {
            useUpdatedData = !useUpdatedData;
            api.setGridOption('rowData', useUpdatedData ? updatedRowData : baseRowData);
        },
        benchOptions
    );

    let useUpdatedDataNoDelta = false;
    bench(
        `full sort with ${Math.round(updateRatio * 100)}% updates (${updatesPerBatch}/${rowCount})`,
        () => {
            useUpdatedDataNoDelta = !useUpdatedDataNoDelta;
            apiNoDelta.setGridOption('rowData', useUpdatedDataNoDelta ? updatedRowData : baseRowData);
        },
        benchOptions
    );
});

function buildRandomData(numberOfRows: number): IData[] {
    const prng = new SimplePRNG(0x12345678);
    const result = new Array<IData>(numberOfRows);
    for (let i = 0; i < numberOfRows; i++) {
        result[i] = { name: prng.nextString(10), id: i.toString() };
    }
    return result;
}

function buildUpdatedRowData(baseRowData: IData[], updateRatio: number, untouchedShuffleRatio: number): IData[] {
    const prng = new SimplePRNG(0x9abcdef0);
    const total = baseRowData.length;
    const updates = Math.floor(total * updateRatio);
    const updatedRows = new Array<IData>(total);

    for (let i = 0; i < updates; i++) {
        const baseRow = baseRowData[i];
        updatedRows[i] = { id: baseRow.id, name: prng.nextString(10) };
    }

    const untouchedRows = baseRowData.slice(updates);
    randomizeUntouchedRows(untouchedRows, untouchedShuffleRatio, prng);

    for (let i = 0; i < untouchedRows.length; i++) {
        updatedRows[updates + i] = untouchedRows[i];
    }

    return updatedRows;
}

function randomizeUntouchedRows<T>(rows: T[], ratio: number, prng: SimplePRNG): void {
    const moveCount = Math.floor(rows.length * ratio);
    if (moveCount <= 0 || rows.length < 2) {
        return;
    }
    for (let i = 0; i < moveCount; i++) {
        const from = prng.nextInt(0, rows.length - 1);
        const [row] = rows.splice(from, 1);
        const to = prng.nextInt(0, rows.length);
        rows.splice(to, 0, row);
    }
}
