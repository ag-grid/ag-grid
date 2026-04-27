import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { ApplyColumnStateParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, TextFilterModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../test-utils';

interface IData {
    id: string;
    name: string;
    value: number;
}

suite('flat grid full pipeline (filter + sort + map)', () => {
    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, ColumnApiModule, TextFilterModule],
    });

    let api!: GridApi<IData>;

    const rowCount = 30000;
    const rowData = buildRandomData(rowCount);
    const updatedRowData = buildUpdatedRowData(rowData);

    const benchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }, { field: 'value' }],
                rowData,
                getRowId: ({ data }) => data.id,
            });
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    const sortAsc: ApplyColumnStateParams = { state: [{ colId: 'name', sort: 'asc' }] };
    const noSort: ApplyColumnStateParams = { state: [{ colId: 'name', sort: null }] };
    const filterAA = { name: { filterType: 'text', type: 'contains', filter: 'aa' } };

    bench(
        `filter + sort ${rowCount} rows`,
        () => {
            // Remove then apply — every iteration does the same work
            api.setFilterModel(null);
            api.applyColumnState(noSort);
            api.setFilterModel(filterAA);
            api.applyColumnState(sortAsc);
        },
        benchOptions
    );

    bench(
        `immutable update with filter + sort active ${rowCount} rows`,
        () => {
            // Ensure filter+sort active, then swap data
            api.setFilterModel(filterAA);
            api.applyColumnState(sortAsc);
            api.setGridOption('rowData', updatedRowData);
            api.setGridOption('rowData', rowData);
        },
        benchOptions
    );
});

function buildRandomData(numberOfRows: number): IData[] {
    const prng = new SimplePRNG(0x12345678);
    const result = new Array<IData>(numberOfRows);
    for (let i = 0; i < numberOfRows; i++) {
        result[i] = { id: i.toString(), name: prng.nextString(10), value: prng.nextFloat(0, 1000) };
    }
    return result;
}

function buildUpdatedRowData(baseRowData: IData[]): IData[] {
    const prng = new SimplePRNG(0x9abcdef0);
    const total = baseRowData.length;
    const updates = Math.floor(total * 0.3);
    const result = baseRowData.slice();
    for (let i = 0; i < updates; i++) {
        const base = result[i];
        result[i] = { id: base.id, name: prng.nextString(10), value: prng.nextFloat(0, 1000) };
    }
    return result;
}
