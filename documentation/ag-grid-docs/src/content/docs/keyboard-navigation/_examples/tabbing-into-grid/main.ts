import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, FirstDataRenderedEvent, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { headerName: '#', colId: 'rowNum', valueGetter: 'node.id' },
    { field: 'athlete', minWidth: 170 },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    rowData: null,
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    onFirstDataRendered: onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    // obtain reference to input element
    var myInput = document.getElementById('my-input')!;

    // intercept key strokes within input element
    myInput.addEventListener(
        'keydown',
        function (event) {
            // ignore non Tab key strokes
            if (event.key !== 'Tab') return;

            // prevents tabbing into the url section
            event.preventDefault();

            // scrolls to the first row
            params.api.ensureIndexVisible(0);

            // scrolls to the first column
            var firstCol = params.api.getAllDisplayedColumns()[0];
            params.api.ensureColumnVisible(firstCol);

            // sets focus into the first grid cell
            params.api.setFocusedCell(0, firstCol);
        },
        true
    );
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
