import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
    themeQuartz,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, NewFiltersToolPanelModule, PivotModule, SideBarModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    NewFiltersToolPanelModule,
    TextFilterModule,
    NumberFilterModule,
    SideBarModule,
    PivotModule,
]);

const myTheme = themeQuartz.withParams({
    sideBarPanelAnimationDuration: 0.3,
});

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }, { field: 'year' }];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    theme: myTheme,
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        filter: true,
        sortable: true,
        resizable: true,
    },
    enableFilterHandlers: true,
    sideBar: ['columns', 'filters-new'],
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
