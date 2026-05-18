import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../test-utils';

interface IData {
    id: string;
    name: string;
    value: number;
}

suite('flat grid filtering', () => {
    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, TextFilterModule],
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

    const filterAAA = { name: { filterType: 'text', type: 'contains', filter: 'aaa' } };

    let filterOn = false;
    bench(
        `toggle text filter on/off ${rowCount} rows`,
        () => {
            filterOn = !filterOn;
            api.setFilterModel(filterOn ? filterAAA : null);
        },
        benchOptions
    );

    const filterBB = { name: { filterType: 'text', type: 'contains', filter: 'bb' } };

    let useUpdated = false;
    bench(
        `immutable data update with active filter ${rowCount} rows`,
        () => {
            if (!useUpdated) {
                api.setFilterModel(filterBB);
            }
            useUpdated = !useUpdated;
            api.setGridOption('rowData', useUpdated ? updatedRowData : rowData);
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
