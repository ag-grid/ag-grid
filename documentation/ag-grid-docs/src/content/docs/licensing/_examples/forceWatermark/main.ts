import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { LicenseManager } from '@ag-grid-enterprise/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, RowGroupingModule]);

// enter your license key here to suppress license message in the console and watermark
LicenseManager.setLicenseKey('');

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    // define grid columns
    columnDefs: [
        // using default ColDef
        { headerName: 'Athlete', field: 'athlete' },
        { headerName: 'Sport', field: 'sport' },

        // using number column type
        { headerName: 'Age', field: 'age', type: 'numberColumn' },
        { headerName: 'Year', field: 'year', type: 'numberColumn' },

        // using date and non-editable column types
        { headerName: 'Date', field: 'date', width: 200 },
    ],

    defaultColDef: {
        flex: 1,
    },

    // default ColGroupDef, get applied to every column group
    defaultColGroupDef: {
        marryChildren: true,
    },

    columnTypes: {
        numberColumn: { width: 83 },
    },

    rowData: null,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
