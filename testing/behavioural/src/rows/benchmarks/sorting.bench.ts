import type { BenchOptions } from 'vitest';
import { bench, suite } from 'vitest';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

const DATA_SIZES = [20000];
const COLUMN_COUNTS = [5];

suite('sorting', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule],
    });

    let api!: GridApi<RowData>;

    let rowData: RowData[];
    let rowData1: RowData[];

    const benchOptions = (rowCount: number, sortCount: number): BenchOptions => ({
        throws: true,
        setup: () => {
            rowData = buildRandomRowData(rowCount);
            rowData1 = buildUpdatedRowData(rowData);

            api ??= gridsManager.createGrid('G', {
                columnDefs: [
                    { field: 'group1', sort: 'asc' },
                    { field: 'group2', sort: 'asc' },
                    { field: 'group3', sort: 'asc' },
                    { field: 'group4', sort: 'asc' },
                    { field: 'group5', sort: 'asc' },
                    { field: 'value', aggFunc: 'sum' },
                    { field: 'count', aggFunc: 'count' },
                ].map((colDef, index) => ({ ...colDef, sort: index < sortCount && index < 5 ? 'asc' : undefined })),
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [],
                groupDefaultExpanded: -1,
                suppressAggFuncInHeader: true,
                getRowId: ({ data }: { data: { id: string } }) => data.id,
            });
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    });

    DATA_SIZES.forEach((dataSize) => {
        COLUMN_COUNTS.forEach((columnCount) => {
            bench(
                `sorting from scratch ${dataSize} rows (${columnCount} sorts)`,
                () => {
                    api.setGridOption('rowData', []);
                    api.setGridOption('rowData', rowData);
                },
                benchOptions(dataSize, columnCount)
            );
        });
    });

    DATA_SIZES.forEach((dataSize) => {
        COLUMN_COUNTS.forEach((columnCount) => {
            bench(
                `update sorting rowData ${dataSize} rows (${columnCount} sorts)`,
                () => {
                    api.setGridOption('rowData', rowData);
                    api.setGridOption('rowData', rowData1);
                },
                benchOptions(dataSize, columnCount)
            );
        });
    });
});

interface RowData {
    id: string;
    group1: string;
    group2: string;
    group3: string;
    group4: string;
    group5: string;
    value: number;
    count: number;
}

/** Generate random ag-grid grouping data */
function buildRandomRowData(numberOfRows: number, prng = new SimplePRNG(0x13d24a75)): RowData[] {
    const rows: RowData[] = [];

    const group1Options = ['Department A', 'Department B', 'Department C', 'Department D', 'Department E'];
    const group2Options = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
    const group3Options = ['Project Alpha', 'Project Beta', 'Project Gamma', 'Project Delta', 'Project Epsilon'];
    const group4Options = ['North', 'South', 'East', 'West', 'Central'];
    const group5Options = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'];

    for (let i = 0; i < numberOfRows; i++) {
        const row: RowData = {
            id: i.toString(),
            group1: prng.pick(group1Options)!,
            group2: prng.pick(group2Options)!,
            group3: prng.pick(group3Options)!,
            group4: prng.pick(group4Options)!,
            group5: prng.pick(group5Options)!,
            value: prng.nextFloat(1, 1000),
            count: prng.nextInt(1, 100),
        };
        rows.push(row);
    }

    return rows;
}

/** This adds some delete, add, update operations that affect the grouping structure */
function buildUpdatedRowData(rows: RowData[], prng = new SimplePRNG(0x3d24a75)) {
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
    const group4Options = ['North', 'South', 'East', 'West', 'Central'];
    const group5Options = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'];

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
            group4: prng.pick(group4Options)!,
            group5: prng.pick(group5Options)!,
            value: rowToMove.value * prng.nextFloat(0.8, 1.2), // Slight value variation
        };
    }

    const maxAdds = Math.floor(rowCount * 0.13);
    for (let i = 0; i < maxAdds; i++) {
        const newRow: RowData = {
            id: (rows.length + i).toString(),
            group1: prng.pick(group1Options)!,
            group2: prng.pick(group2Options)!,
            group3: prng.pick(group3Options)!,
            group4: prng.pick(group4Options)!,
            group5: prng.pick(group5Options)!,
            value: prng.nextFloat(1, 1000),
            count: prng.nextInt(1, 100),
        };
        rows.push(newRow);
    }

    return rows;
}
