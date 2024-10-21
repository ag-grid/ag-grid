import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, createPart, themeQuartz } from 'ag-grid-community';

import './style.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const noCheckboxStyle = createPart('checkboxStyle');

const myCustomTheme = themeQuartz.withPart(noCheckboxStyle);

const columnDefs: ColDef[] = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

const rowData: any[] = (() => {
    const rowData: any[] = [];
    for (let i = 0; i < 10; i++) {
        rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
        rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
        rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
    }
    return rowData;
})();

const defaultColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
};

const gridOptions: GridOptions<IOlympicData> = {
    theme: myCustomTheme,
    columnDefs,
    rowData,
    defaultColDef,
    initialState: {
        rowSelection: ['1', '2', '3'],
    },
    rowSelection: { mode: 'multiRow', checkboxes: true },
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
