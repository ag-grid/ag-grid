import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CheckboxEditorModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    RowDragModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    CheckboxEditorModule,
    RowDragModule,
    ClientSideRowModelModule,
]);

interface ILockableOlympicData extends IOlympicData {
    locked: boolean;
}

let gridApi: GridApi<ILockableOlympicData>;

const gridOptions: GridOptions<ILockableOlympicData> = {
    columnDefs: [
        { field: 'athlete', rowDrag: true },
        { field: 'locked', cellDataType: 'boolean', editable: true, width: 100 },
        { field: 'country' },
        { field: 'year', width: 100 },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        width: 170,
        filter: true,
    },
    rowDragManaged: true,
    isRowDraggable: (params) => !params.data?.locked,
};

function onBtEntireRow() {
    gridApi!.setGridOption('rowDragEntireRow', true);
}

function onBtHandle() {
    gridApi!.setGridOption('rowDragEntireRow', false);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((rowData, index) => ({ ...rowData, locked: index % 3 === 1 }))
            )
        );
});
