import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([NumberEditorModule, TextEditorModule, ClientSideRowModelModule, CellSelectionModule]);

const daysList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'athlete', minWidth: 150 },
        { headerName: 'Day of the Week', field: 'dayOfTheWeek', minWidth: 180 },
        { field: 'age', maxWidth: 90 },
        { field: 'country', minWidth: 150 },
        { field: 'year', maxWidth: 90 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        editable: true,
        cellDataType: false,
    },
    cellSelection: {
        handle: {
            mode: 'fill',
            setFillValue(params) {
                if (params.column.getColId() !== 'dayOfTheWeek') {
                    // every other column keeps the default Fill Handle behaviour
                    return params.useDefault();
                }

                const lastValue = params.values[params.values.length - 1];
                const idxOfLast = daysList.indexOf(lastValue);
                return params.useValue(daysList[(idxOfLast + 1) % daysList.length]);
            },
        },
    },
};

// days deliberately out of order, so filling the column visibly reorders them
const initialDays = ['Sunday', 'Monday', 'Friday', 'Thursday', 'Tuesday', 'Saturday', 'Wednesday'];

function addDayOfTheWeek(rowData: any[]) {
    return rowData.map((row, index) => ({ ...row, dayOfTheWeek: initialDays[index % initialDays.length] }));
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data) => gridApi.setGridOption('rowData', addDayOfTheWeek(data)));
});
