import type { GridApi, GridOptions, IErrorValidationParams } from 'ag-grid-community';
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
            cellEditorParams: {
                getValidationErrors: (params: IErrorValidationParams) => {
                    const { value } = params;
                    if (!value || value.length < 3) {
                        return ['The value has to be at least 3 characters long.'];
                    }

                    return null;
                },
            },
        },
        {
            field: 'age',
            cellEditorParams: {
                getValidationErrors: (params: IErrorValidationParams) => {
                    const { value } = params;

                    if (value != null && value == 18) {
                        return ['Value has to be different than 18'];
                    }

                    return null;
                },
            },
        },
    ],
    defaultColDef: {
        editable: true,
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
