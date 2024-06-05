import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { MenuModule } from '@ag-grid-enterprise/menu';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, CsvExportModule, MenuModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        editable: true,
        minWidth: 100,
        flex: 1,
    },

    suppressExcelExport: true,
    popupParent: document.body,

    columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],

    rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 },
    ],
};

function getBoolean(inputSelector: string) {
    return !!(document.querySelector(inputSelector) as HTMLInputElement).checked;
}

function getParams() {
    return {
        suppressQuotes: getBoolean('#suppressQuotes'),
    };
}

function onBtnExport() {
    const params = getParams();
    if (params.suppressQuotes) {
        alert('NOTE: you are downloading a file with non-standard quotes - it may not render correctly in Excel.');
    }
    gridApi!.exportDataAsCsv(params);
}

function onBtnUpdate() {
    (document.querySelector('#csvResult') as any).value = gridApi!.getDataAsCsv(getParams());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
