'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import type { ColDef, GridOptions } from '@ag-grid-community/core';
import { createGrid } from '@ag-grid-community/core';
import { createTheme, iconSetMaterial } from '@ag-grid-community/theming';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const myCustomTheme = createTheme().with(iconSetMaterial).withParams({
    accentColor: 'red',
    foregroundColor: '#660000',
    iconSize: 18,
});

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
    loadThemeGoogleFonts: true,
    columnDefs,
    rowData,
    defaultColDef,
    selection: { mode: 'multiRow', checkboxes: true },
};

createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
