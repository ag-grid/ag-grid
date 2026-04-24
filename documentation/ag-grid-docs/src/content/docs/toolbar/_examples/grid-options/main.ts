import type { GridApi, GridOptions, Toolbar, ToolbarItemDef } from 'ag-grid-community';
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

const findItem: ToolbarItemDef = { toolbarItem: 'agFindToolbarItem', alignment: 'right' };
const quickFilterItem: ToolbarItemDef = { toolbarItem: 'agQuickFilterToolbarItem', alignment: 'right' };

const state = { find: true, quickFilter: true };

function buildToolbar(): Toolbar {
    const items: (ToolbarItemDef | string)[] = ['agRowGroupPanelToolbarItem', 'agPivotPanelToolbarItem'];
    if (state.find) {
        items.push(findItem);
    }
    if (state.quickFilter) {
        items.push(quickFilterItem);
    }
    return { items };
}

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
    toolbar: buildToolbar(),
};

function setFullToolbar() {
    state.find = true;
    state.quickFilter = true;
    gridApi.setGridOption('toolbar', buildToolbar());
}

function toggleFind() {
    state.find = !state.find;
    gridApi.setGridOption('toolbar', buildToolbar());
}

function toggleQuickFilter() {
    state.quickFilter = !state.quickFilter;
    gridApi.setGridOption('toolbar', buildToolbar());
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));
});
