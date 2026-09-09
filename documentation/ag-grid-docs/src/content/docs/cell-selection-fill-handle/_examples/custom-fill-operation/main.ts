import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([NumberEditorModule, ClientSideRowModelModule, CellSelectionModule]);

interface ValueRow {
    value: number | null;
}

const gridOptions: GridOptions<ValueRow> = {
    rowData: [{ value: 10 }, { value: 20 }, { value: null }, { value: null }, { value: null }],
    columnDefs: [{ field: 'value' }],
    defaultColDef: {
        editable: true,
        flex: 1,
    },
    cellSelection: {
        handle: {
            mode: 'fill',
            setFillValue(params) {
                const lastValue = params.values[params.values.length - 1];
                return params.useValue(lastValue + 10);
            },
        },
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
