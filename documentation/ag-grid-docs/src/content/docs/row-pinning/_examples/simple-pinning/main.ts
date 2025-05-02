import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PinnedRowModule,
    ValidationModule,
    createGrid,
    themeQuartz,
} from 'ag-grid-community';
import { ContextMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    PinnedRowModule,
    ClientSideRowModelModule,
    ContextMenuModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
    },
    columnDefs: columnDefs,
    rowData: null,
    enableRowPinning: true,
    theme: themeQuartz.withParams({
        pinnedRowBorder: {
            width: 2,
        },
    }),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
