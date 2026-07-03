import type {
    CellPosition,
    ColDef,
    GridApi,
    GridOptions,
    TabToNextGridContainer,
    TabToNextGridContainerParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([PaginationModule, TextFilterModule, ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    { headerName: '#', colId: 'rowNum', valueGetter: 'node.id', maxWidth: 90 },
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
let lastFocusedCell: CellPosition | null = null;

const tabToNextGridContainer: TabToNextGridContainer<IOlympicData> = (
    params: TabToNextGridContainerParams<IOlympicData>
) => {
    const { backwards, previousContainer, nextContainer, defaultTarget } = params;

    // route tabbing out of the last grid cell into pagination controls first.
    if (!backwards && previousContainer === 'gridBody' && nextContainer === 'external') {
        return 'pagination';
    }

    // restore last focused cell when shift-tabbing from pagination back into the grid.
    if (backwards && previousContainer === 'pagination' && nextContainer === 'gridBody') {
        const target = lastFocusedCell ?? defaultTarget;
        return target == null ? undefined : target;
    }

    // from pagination forwards, allow browser default focus flow to leave the grid.
    if (!backwards && previousContainer === 'pagination' && nextContainer === 'external') {
        return false;
    }

    // For everything else, keep grid defaults.
    return undefined;
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    pagination: true,
    tabToNextGridContainer,
    onCellFocused: (params) => {
        const { rowIndex, rowPinned, column } = params;
        if (rowIndex == null || !column || typeof column === 'string') {
            return;
        }

        lastFocusedCell = {
            rowIndex,
            rowPinned: rowPinned ?? null,
            column,
        };
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
