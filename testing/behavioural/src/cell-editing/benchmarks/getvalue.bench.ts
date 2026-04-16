import { bench, describe } from 'vitest';

import type { AgColumn, ColDef, GridApi, IRowNode } from 'ag-grid-community';
import { CellApiModule, ClientSideRowModelModule, ColumnApiModule, RowApiModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

interface IData {
    name: string;
    id: string;
}

function buildRandomData(numberOfRows: number): IData[] {
    const prng = new SimplePRNG(0x12345678);
    const result = new Array<IData>(numberOfRows);
    for (let i = 0; i < numberOfRows; i++) {
        result[i] = { name: prng.nextString(10), id: i.toString() };
    }
    return result;
}

describe('getValue profiling', () => {
    const rowCount = 2000;

    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, RowApiModule, CellApiModule],
    });

    const baseRowData = buildRandomData(rowCount);
    const api: GridApi<IData> = gridsManager.createGrid('G', {
        columnDefs: [{ field: 'name' }],
        rowData: baseRowData,
        getRowId: ({ data }) => data.id,
    });

    const rowNodes: IRowNode<IData>[] = [];
    api.forEachNode((n) => rowNodes.push(n));

    bench(`getDataValue`, () => {
        for (let i = 0; i < rowCount; ++i) {
            rowNodes[i].getDataValue('name');
        }
    });

    bench(`getCellValue`, () => {
        for (let i = 0; i < rowCount; ++i) {
            api.getCellValue({ rowNode: rowNodes[i], colKey: 'name', useFormatter: false });
        }
    });

    bench(`direct data.name `, () => {
        let sum = 0;
        for (let i = 0; i < rowCount; ++i) {
            const val = (rowNodes[i] as any).data.name;
            if (val) {
                sum++;
            }
        }
        return sum as any;
    });
});

describe('getDataValue: string key vs Column object (many columns)', () => {
    const rowCount = 2000;
    const colCount = 100;

    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, RowApiModule, CellApiModule, ColumnApiModule],
    });

    // Build columnDefs: col_0 .. col_99, target is the last column
    const columnDefs: ColDef[] = [];
    for (let i = 0; i < colCount; i++) {
        columnDefs.push({ colId: `col_${i}`, field: `col_${i}` });
    }

    const targetField = `col_${colCount - 1}`;

    // Build row data with values for every column
    const prng = new SimplePRNG(0x87654321);
    const rowData: Record<string, string>[] = [];
    for (let r = 0; r < rowCount; r++) {
        const row: Record<string, string> = { id: r.toString() };
        for (let c = 0; c < colCount; c++) {
            row[`col_${c}`] = prng.nextString(6);
        }
        rowData.push(row);
    }

    const api = gridsManager.createGrid('G2', {
        columnDefs,
        rowData,
        getRowId: ({ data }) => data.id,
    });

    const rowNodes: IRowNode[] = [];
    api.forEachNode((n) => rowNodes.push(n));

    // Resolve the Column object for the last column
    const targetCol = api.getColumn(targetField)! as AgColumn;

    bench(`getDataValue by string (last of ${colCount} cols)`, () => {
        for (let i = 0; i < rowCount; ++i) {
            rowNodes[i].getDataValue(targetField);
        }
    });

    bench(`getDataValue by Column object (last of ${colCount} cols)`, () => {
        for (let i = 0; i < rowCount; ++i) {
            rowNodes[i].getDataValue(targetCol);
        }
    });
});
