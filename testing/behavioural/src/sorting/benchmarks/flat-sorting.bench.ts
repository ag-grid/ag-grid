import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { ApplyColumnStateParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

interface IData {
    name: string;
    id: string;
}

suite('treeData with getDataPath', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: false,
        mockGridLayout: false,
        modules: [ClientSideRowModelModule, ColumnApiModule],
    });

    let api!: GridApi<IData>;

    const rowData = buildRandomData(20000);

    const benchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs: [{ field: 'name' }],
                rowData,
                getRowId: ({ data }) => data.id,
                ensureDomOrder: false,
                suppressRowVirtualisation: false,
                suppressColumnVirtualisation: false,
            });
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    const columnStateSortNameAsc: ApplyColumnStateParams = { state: [{ colId: 'name', sort: 'asc' }] };
    const columnStateSortNameDesc: ApplyColumnStateParams = { state: [{ colId: 'name', sort: 'desc' }] };
    const columnStateNoSort: ApplyColumnStateParams = { state: [{ colId: 'name', sort: null }] };

    let ascending = true;
    bench(
        'sort ' + rowData.length + ' rows',
        () => {
            api.applyColumnState(ascending ? columnStateSortNameAsc : columnStateSortNameDesc);
            api.applyColumnState(columnStateNoSort);
            ascending = !ascending;
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
