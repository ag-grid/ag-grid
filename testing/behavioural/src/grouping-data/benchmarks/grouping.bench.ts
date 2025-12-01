import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

suite('row grouping', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: false,
        mockGridLayout: false,
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule],
    });

    let api!: GridApi<GroupingData>;

    const rowData = buildRandomGroupingData(20000);
    const rowData1 = buildUpdatedRowData(rowData);

    const benchOptions: BenchOptions = {
        throws: true,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs: [
                    { field: 'group1', rowGroup: true, hide: true },
                    { field: 'group2', rowGroup: true, hide: true },
                    { field: 'group3', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum' },
                    { field: 'count', aggFunc: 'count' },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [],
                groupDefaultExpanded: -1,
                suppressAggFuncInHeader: true,
                ensureDomOrder: false,
                suppressRowVirtualisation: false,
                suppressColumnVirtualisation: false,
                getRowId: ({ data }: { data: { id: string } }) => data.id,
            });
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    bench(
        'grouping from scratch ' + rowData.length + ' rows',
        () => {
            api.setGridOption('rowData', []);
            api.setGridOption('rowData', rowData);
        },
        benchOptions
    );

    bench(
        'update grouping rowData ' + rowData1.length + ' rows',
        () => {
            api.setGridOption('rowData', rowData);
            api.setGridOption('rowData', rowData1);
        },
        benchOptions
    );
});

interface GroupingData {
    id: string;
    group1: string;
    group2: string;
    group3: string;
    value: number;
    count: number;
}

/** Generate random ag-grid grouping data */
function buildRandomGroupingData(numberOfRows: number, prng = new SimplePRNG(0x13d24a75)): GroupingData[] {
    const rows: GroupingData[] = [];

    const group1Options = ['Department A', 'Department B', 'Department C', 'Department D', 'Department E'];
    const group2Options = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
    const group3Options = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Epsilon'];

    for (let i = 0; i < numberOfRows; i++) {
        const row: GroupingData = {
            id: i.toString(),
            group1: prng.pick(group1Options)!,
            group2: prng.pick(group2Options)!,
            group3: prng.pick(group3Options)!,
            value: prng.nextFloat(1, 1000),
            count: prng.nextInt(1, 100),
        };
        rows.push(row);
    }

    return rows;
}

/** This adds some delete, add, update operations that affect the grouping structure */
function buildUpdatedRowData(rows: GroupingData[], prng = new SimplePRNG(0x3d24a75)) {
    rows = rows.slice();
    prng.shuffle(rows);

    let rowCount = rows.length;
    const maxDeletes = Math.floor(rowCount * 0.1);
    for (let i = 0; i < maxDeletes; i++) {
        rows.splice(prng.nextInt(0, rowCount - 1), 1);
    }
    rowCount = rows.length;

    const group1Options = ['Department A', 'Department B', 'Department C', 'Department D', 'Department E'];
    const group2Options = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
    const group3Options = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Epsilon'];

    const maxMove = Math.floor(rowCount * 0.18);
    for (let i = 0; i < maxMove; i++) {
        const indexToMove = prng.nextInt(0, rowCount - 1);
        const rowToMove = rows[indexToMove];

        // Change grouping for existing row
        rows[indexToMove] = {
            ...rowToMove,
            group1: prng.pick(group1Options)!,
            group2: prng.pick(group2Options)!,
            group3: prng.pick(group3Options)!,
            value: rowToMove.value * prng.nextFloat(0.8, 1.2), // Slight value variation
        };
    }

    const maxAdds = Math.floor(rowCount * 0.13);
    for (let i = 0; i < maxAdds; i++) {
        const newRow: GroupingData = {
            id: (rows.length + i).toString(),
            group1: prng.pick(group1Options)!,
            group2: prng.pick(group2Options)!,
            group3: prng.pick(group3Options)!,
            value: prng.nextFloat(1, 1000),
            count: prng.nextInt(1, 100),
        };
        rows.push(newRow);
    }

    return rows;
}
