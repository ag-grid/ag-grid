import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    RowSelectionModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([RowSelectionModule, ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [{ field: 'country', rowGroup: true }, { field: 'athlete' }, { field: 'year' }, { field: 'sport' }],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    groupDisplayType: 'groupRows',
    rowSelection: {
        mode: 'multiRow',
        groupSelects: 'descendants',
        selectAll: 'all',
        checkboxLocation: 'autoGroupColumn',
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
