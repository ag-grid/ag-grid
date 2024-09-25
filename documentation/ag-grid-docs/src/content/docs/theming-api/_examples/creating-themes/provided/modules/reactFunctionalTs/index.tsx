'use strict';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';
import { createTheme, iconSetMaterial } from '@ag-grid-community/theming';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const myCustomTheme = createTheme().withPart(iconSetMaterial).withParams({
    accentColor: 'red',
    foregroundColor: '#660000',
    iconSize: 18,
});

const GridExample = () => {
    return (
        <AgGridReact
            theme={myCustomTheme}
            rowSelection={{ mode: 'multiRow', checkboxes: true }}
            columnDefs={columnDefs}
            rowData={rowData}
            defaultColDef={defaultColDef}
        />
    );
};

const rowData: any[] = (() => {
    const rowData: any[] = [];
    for (let i = 0; i < 10; i++) {
        rowData.push({ make: 'Toyota', model: 'Celica', price: 35000 + i * 1000 });
        rowData.push({ make: 'Ford', model: 'Mondeo', price: 32000 + i * 1000 });
        rowData.push({ make: 'Porsche', model: 'Boxster', price: 72000 + i * 1000 });
    }
    return rowData;
})();

const columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

const defaultColDef = {
    editable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
};

const root = createRoot(document.getElementById('root')!);
root.render(
    <StrictMode>
        <GridExample />
    </StrictMode>
);
