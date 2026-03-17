import { bench, describe } from 'vitest';

import type { GridApi, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, RowApiModule } from 'ag-grid-community';

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
        modules: [ClientSideRowModelModule, RowApiModule],
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
