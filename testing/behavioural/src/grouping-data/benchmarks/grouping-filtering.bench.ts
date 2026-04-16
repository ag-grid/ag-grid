import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

interface IData {
    id: string;
    group1: string;
    group2: string;
    group3: string;
    name: string;
    value: number;
}

suite('hierarchical grid filtering (3-level grouping)', () => {
    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule, TextFilterModule],
    });

    let api!: GridApi<IData>;

    const rowCount = 20000;
    const rowData = buildRandomData(rowCount);
    const updatedRowData = buildUpdatedRowData(rowData);

    const benchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs: [
                    { field: 'group1', rowGroup: true, hide: true },
                    { field: 'group2', rowGroup: true, hide: true },
                    { field: 'group3', rowGroup: true, hide: true },
                    { field: 'name', filter: 'agTextColumnFilter' },
                    { field: 'value', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData,
                groupDefaultExpanded: -1,
                suppressAggFuncInHeader: true,
                getRowId: ({ data }) => data.id,
            });
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    let filterOn = false;
    bench(
        `toggle text filter on/off ${rowCount} rows (3-level grouping)`,
        () => {
            filterOn = !filterOn;
            api.setFilterModel(filterOn ? { name: { filterType: 'text', type: 'contains', filter: 'aaa' } } : null);
        },
        benchOptions
    );

    let useUpdated = false;
    bench(
        `immutable data update with active filter ${rowCount} rows (3-level grouping)`,
        () => {
            api.setFilterModel({ name: { filterType: 'text', type: 'contains', filter: 'bb' } });
            useUpdated = !useUpdated;
            api.setGridOption('rowData', useUpdated ? updatedRowData : rowData);
        },
        benchOptions
    );
});

function buildRandomData(numberOfRows: number): IData[] {
    const prng = new SimplePRNG(0x13d24a75);
    const group1Options = ['Department A', 'Department B', 'Department C', 'Department D', 'Department E'];
    const group2Options = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
    const group3Options = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta'];

    const result = new Array<IData>(numberOfRows);
    for (let i = 0; i < numberOfRows; i++) {
        result[i] = {
            id: i.toString(),
            group1: prng.pick(group1Options)!,
            group2: prng.pick(group2Options)!,
            group3: prng.pick(group3Options)!,
            name: prng.nextString(10),
            value: prng.nextFloat(1, 1000),
        };
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
        result[i] = { ...base, name: prng.nextString(10), value: prng.nextFloat(1, 1000) };
    }
    return result;
}
