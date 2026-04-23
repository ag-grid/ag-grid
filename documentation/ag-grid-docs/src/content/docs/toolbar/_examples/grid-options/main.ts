import type { GridApi, GridOptions, Toolbar } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    QuickFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FindModule, PivotModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    TextFilterModule,
    ClientSideRowModelModule,
    QuickFilterModule,
    FindModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const fullToolbar: Toolbar = {
    items: [
        'agRowGroupPanelToolbarItem',
        'agPivotPanelToolbarItem',
        { toolbarItem: 'agFindToolbarItem', alignment: 'right' },
        { toolbarItem: 'agQuickFilterToolbarItem', alignment: 'right' },
    ],
};

const findOnlyToolbar: Toolbar = {
    items: [{ toolbarItem: 'agFindToolbarItem', alignment: 'right' }],
};

const quickFilterOnlyToolbar: Toolbar = {
    items: [{ toolbarItem: 'agQuickFilterToolbarItem', alignment: 'right' }],
};

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 200 },
        { field: 'sport', minWidth: 200 },
        { field: 'year' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        enableRowGroup: true,
        enablePivot: true,
    },
    toolbar: fullToolbar,
};

function setFullToolbar() {
    gridApi.setGridOption('toolbar', fullToolbar);
}

function setFindOnlyToolbar() {
    gridApi.setGridOption('toolbar', findOnlyToolbar);
}

function setQuickFilterOnlyToolbar() {
    gridApi.setGridOption('toolbar', quickFilterOnlyToolbar);
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
});
