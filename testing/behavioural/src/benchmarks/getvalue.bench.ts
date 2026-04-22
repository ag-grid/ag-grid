import { bench, describe } from 'vitest';

import type { AgColumn, ColDef, IRowNode } from 'ag-grid-community';
import { CellApiModule, ClientSideRowModelModule, ColumnApiModule, RowApiModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../test-utils';

describe('getValue profiling', () => {
    const rowCount = 2000;
    const colCount = 100;

    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, RowApiModule, CellApiModule, ColumnApiModule],
    });

    const columnDefs: ColDef[] = [];
    for (let i = 0; i < colCount; i++) {
        columnDefs.push({ colId: `col_${i}`, field: `col_${i}` });
    }

    const prng = new SimplePRNG(0x12345678);
    const rowData: Record<string, string>[] = [];
    for (let r = 0; r < rowCount; r++) {
        const row: Record<string, string> = { id: r.toString() };
        for (let c = 0; c < colCount; c++) {
            row[`col_${c}`] = prng.nextString(6);
        }
        rowData.push(row);
    }

    const api = gridsManager.createGrid('G', {
        columnDefs,
        rowData,
        getRowId: ({ data }) => data.id,
    });

    const rowNodes: IRowNode[] = [];
    api.forEachNode((n) => rowNodes.push(n));

    const firstField = 'col_0';
    const lastField = `col_${colCount - 1}`;
    const firstCol = api.getColumn(firstField)! as AgColumn;
    const lastCol = api.getColumn(lastField)! as AgColumn;

    bench(`getDataValue by string (first col)`, () => {
        for (let i = 0; i < rowCount; ++i) {
            rowNodes[i].getDataValue(firstField);
        }
    });

    bench(`getDataValue by string (last of ${colCount} cols)`, () => {
        for (let i = 0; i < rowCount; ++i) {
            rowNodes[i].getDataValue(lastField);
        }
    });

    bench(`getDataValue by Column object (first col)`, () => {
        for (let i = 0; i < rowCount; ++i) {
            rowNodes[i].getDataValue(firstCol);
        }
    });

    bench(`getDataValue by Column object (last of ${colCount} cols)`, () => {
        for (let i = 0; i < rowCount; ++i) {
            rowNodes[i].getDataValue(lastCol);
        }
    });

    bench(`getCellValue by string (last of ${colCount} cols)`, () => {
        for (let i = 0; i < rowCount; ++i) {
            api.getCellValue({ rowNode: rowNodes[i], colKey: lastField, useFormatter: false });
        }
    });

    bench(`direct data access`, () => {
        let sum = 0;
        for (let i = 0; i < rowCount; ++i) {
            const val = (rowNodes[i] as any).data[lastField];
            if (val) {
                sum++;
            }
        }
        return sum as any;
    });
});
