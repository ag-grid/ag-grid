import type { AgModuleName, ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    ExcelExportModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

const sharedModules = [
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
];
const leftModules = [ClipboardModule, CsvExportModule, SetFilterModule];
const rightModules = [CsvExportModule, ExcelExportModule, NumberFilterModule, TextFilterModule];

// Register shared Modules globally
ModuleRegistry.registerModules(sharedModules);

const columnDefs: ColDef[] = [{ field: 'id' }, { field: 'color' }, { field: 'value1' }];
const defaultColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
};

let rowIdSequence = 100;
function createRowBlock() {
    return ['Red', 'Green', 'Blue'].map((color) => ({
        id: rowIdSequence++,
        color: color,
        value1: Math.floor(Math.random() * 100),
    }));
}

const baseGridOptions: GridOptions = {
    defaultColDef: defaultColDef,
    columnDefs: columnDefs,
};

const leftGridOptions: GridOptions = {
    ...baseGridOptions,
    gridId: 'Left',
    rowData: createRowBlock(),
};

const rightGridOptions: GridOptions = {
    ...baseGridOptions,
    gridId: 'Right',
    rowData: createRowBlock(),
};

function loadGrid(side: string) {
    const grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!;
    const gridOptions = side === 'Left' ? leftGridOptions : rightGridOptions;
    const modules = side === 'Left' ? leftModules : rightModules;
    return createGrid(grid, gridOptions, { modules: modules });
}

function logModuleRegisteredStatus(api: GridApi) {
    const moduleNames: AgModuleName[] = [
        'ClipboardModule',
        'ClientSideRowModelModule',
        'ColumnMenuModule',
        'ContextMenuModule',
        'CsvExportModule',
        'ExcelExportModule',
        'NumberFilterModule',
        'SetFilterModule',
        'TextFilterModule',
        'IntegratedChartsModule', // Not registered in this example
    ];
    const registered = moduleNames.filter((name) => api.isModuleRegistered(name));
    console.log(api.getGridId(), 'registered:', registered.join(', '));
}

const leftApi = loadGrid('Left');
const rightApi = loadGrid('Right');

logModuleRegisteredStatus(leftApi);
logModuleRegisteredStatus(rightApi);
