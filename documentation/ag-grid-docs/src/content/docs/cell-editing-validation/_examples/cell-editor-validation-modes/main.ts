import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    NumberEditorModule,
    TextEditorModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'athlete',
            headerName: 'Athlete (maxLength 10)',
            cellEditor: 'agTextCellEditor',
            cellEditorParams: {
                maxLength: 10,
            },
        },
        {
            field: 'age',
            headerName: 'Age (> 0 and <100)',
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0,
                max: 100,
            },
        },
    ],
    defaultColDef: {
        editable: true,
    },

    // cellEditingInvalidCommitType: 'revert',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

function onValidationModeSelect() {
    const value: 'revert' | 'block' = document.querySelector<HTMLSelectElement>('#select-validation-mode')?.value;

    gridApi.setGridOption('cellEditingInvalidCommitType', value);
}
