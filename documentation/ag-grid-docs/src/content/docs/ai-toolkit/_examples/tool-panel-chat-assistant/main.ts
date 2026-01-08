import type { GridApi } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { type ITransaction, generateTransactions } from './generateTransactions';
import { gridOptions } from './gridOptions';

ModuleRegistry.registerModules([AllEnterpriseModule]);

let gridApi: GridApi<ITransaction>;

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    // Generate synthetic transaction data
    const data = generateTransactions({ count: 10000, seed: 42 });
    gridApi.setGridOption('rowData', data);
});
