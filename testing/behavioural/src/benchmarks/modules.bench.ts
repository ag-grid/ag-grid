import { bench, suite } from 'vitest';

import type { ColDef, GridOptions, Module, Params } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, NumberFilterModule, TextEditorModule } from 'ag-grid-community';
import { AllEnterpriseModule, RowGroupingModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

suite('render cells with different module sets', () => {
    const rowData = buildRandomData(100);
    const columnDefs: ColDef[] = buildColDefs(15);
    let params: Params | undefined;

    const gridsManager = new BenchGridsManager();

    const makeBenchOptions = (modules: Module[] = []) =>
        benchDefaults({
            setup: () => {
                params = { modules };
            },
            teardown: async () => {
                await gridsManager.reset();
            },
        });

    const gridOptions: GridOptions = { columnDefs, rowData };

    for (const modules of [
        [AllCommunityModule],
        [AllEnterpriseModule],
        [ClientSideRowModelModule, RowGroupingModule],
        [ClientSideRowModelModule, NumberFilterModule],
        [ClientSideRowModelModule, TextEditorModule],
    ]) {
        bench(
            'Run with ' + modules.map((m) => m.moduleName).join(),
            () => {
                gridsManager.createGrid('M', gridOptions, params);
                gridsManager.destroyAll();
            },
            makeBenchOptions(modules)
        );
    }
});

interface IRowData {
    id: string;
    value: number;
    flag: boolean;
}

function buildRandomData(numberOfRows: number): IRowData[] {
    const rows: IRowData[] = [];
    let keyCounter = 0;

    const addRow = () => {
        const row: IRowData = {
            id: `id-${keyCounter++}`,
            value: rows.length * 133,
            flag: rows.length % 2 === 0,
        };
        rows.push(row);
    };

    for (let i = 0; i < numberOfRows; i++) {
        addRow();
    }

    return rows;
}

function buildColDefs(numberOfCols: number): ColDef[] {
    const cols: ColDef[] = [];
    for (let i = 0; i < numberOfCols; i++) {
        cols.push({ field: `col-${i}`, width: 150 });
    }
    return cols;
}
