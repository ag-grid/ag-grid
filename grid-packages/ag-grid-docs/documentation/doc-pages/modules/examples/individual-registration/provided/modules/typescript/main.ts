import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-alpine.css";

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { GridChartsModule } from '@ag-grid-enterprise/charts';

import { ColDef, GridOptions, ModuleRegistry, Grid } from '@ag-grid-community/core';

// Register shared Modules globally
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    MenuModule,
    GridChartsModule,
]);

var columnDefs: ColDef[] = [
    { field: "id" },
    { field: "color" },
    { field: "value1" }
];
var defaultColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    floatingFilter: true,
    resizable: true
};

var rowIdSequence = 100;
function createRowBlock() {
    return ['Red', 'Green', 'Blue'].map((color) =>
    ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
    })
    )
}

var leftGridOptions: GridOptions = {
    defaultColDef: defaultColDef,
    rowData: createRowBlock(),
    columnDefs: [...columnDefs]
};

var rightGridOptions: GridOptions = {
    defaultColDef: defaultColDef,
    rowData: createRowBlock(),
    columnDefs: [...columnDefs]
};


function loadGrid(side: string) {
    var grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!;
    let modules = side === 'Left' ? [SetFilterModule, ClipboardModule] : [ExcelExportModule];
    new Grid(grid, side === 'Left' ? leftGridOptions : rightGridOptions, { modules: modules });
}

loadGrid('Left');
loadGrid('Right');
