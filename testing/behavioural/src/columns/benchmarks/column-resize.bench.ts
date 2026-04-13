import { bench, describe } from 'vitest';

import type { ColDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule } from 'ag-grid-community';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

interface IData {
    [key: string]: string;
}

function buildColumnDefs(count: number): ColDef<IData>[] {
    const cols: ColDef<IData>[] = [];
    for (let i = 0; i < count; i++) {
        cols.push({ field: `col${i}`, width: 100 });
    }
    return cols;
}

function buildRowData(rowCount: number, colCount: number): IData[] {
    const prng = new SimplePRNG(0x12345678);
    const result = new Array<IData>(rowCount);
    for (let r = 0; r < rowCount; r++) {
        const row: IData = {};
        for (let c = 0; c < colCount; c++) {
            row[`col${c}`] = prng.nextString(8);
        }
        result[r] = row;
    }
    return result;
}

describe('column resize performance', () => {
    const colCount = 200;
    const rowCount = 500;

    const gridsManager = new TestGridsManager({
        benchmark: true,
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
    });

    const columnDefs = buildColumnDefs(colCount);
    const rowData = buildRowData(rowCount, colCount);

    let api: GridApi<IData>;

    const benchOptions = {
        throws: true,
        setup: () => {
            api ??= gridsManager.createGrid('G', {
                columnDefs,
                rowData,
            });
        },
        teardown: () => {
            gridsManager.reset();
            api = undefined!;
        },
    };

    let toggle = false;
    bench(
        `resize single column (${rowCount} rows, ${colCount} cols)`,
        () => {
            toggle = !toggle;
            api.setColumnWidths([{ key: 'col0', newWidth: toggle ? 150 : 100 }]);
        },
        benchOptions
    );

    bench(
        `resize all ${colCount} columns (${rowCount} rows)`,
        () => {
            toggle = !toggle;
            const newWidth = toggle ? 120 : 100;
            const widths = columnDefs.map((_, i) => ({ key: `col${i}`, newWidth }));
            api.setColumnWidths(widths);
        },
        benchOptions
    );

    bench(
        `move column (${rowCount} rows, ${colCount} cols)`,
        () => {
            toggle = !toggle;
            api.moveColumns(['col0'], toggle ? colCount - 1 : 0);
        },
        benchOptions
    );

    bench(
        `autosize all ${colCount} columns (${rowCount} rows)`,
        () => {
            api.autoSizeAllColumns();
        },
        benchOptions
    );
});
