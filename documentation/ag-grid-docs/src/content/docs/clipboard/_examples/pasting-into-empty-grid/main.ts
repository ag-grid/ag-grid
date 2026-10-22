import type { ColDef, GridApi, GridOptions, ProcessDataFromClipboardParams } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    RowApiModule,
    RowSelectionModule,
    TextEditorModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ClipboardModule, ContextMenuModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    RowApiModule,
    RowSelectionModule,
    TextEditorModule,
    ClipboardModule,
    ContextMenuModule,
]);

const columnDefs: ColDef[] = [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        editable: true,
        flex: 1,
    },
    columnDefs,
    rowData: [
        { athlete: 'Michael Phelps', country: 'United States', sport: 'Swimming' },
        { athlete: 'Natalie Coughlin', country: 'United States', sport: 'Swimming' },
        { athlete: 'Aleksey Nemov', country: 'Russia', sport: 'Gymnastics' },
        { athlete: 'Alicia Coutts', country: 'Australia', sport: 'Swimming' },
    ],
    rowSelection: {
        mode: 'multiRow',
        checkboxes: false,
        headerCheckbox: false,
        enableClickSelection: true,
        copySelectedRows: true,
    },
    processDataFromClipboard,
};

function processDataFromClipboard(params: ProcessDataFromClipboardParams): string[][] | null {
    if (params.api.getDisplayedRowCount() > 0) {
        return params.data;
    }

    // The grid has no cells to paste into, so add each pasted line as a new row
    const columns = params.api.getAllDisplayedColumns();
    const rowsToAdd = params.data
        .filter((cells) => cells.some((cell) => cell !== ''))
        .map((cells) => {
            const row: Record<string, string> = {};
            columns.forEach((column, index) => {
                row[column.getColId()] = cells[index] ?? '';
            });
            return row;
        });
    params.api.applyTransaction({ add: rowsToAdd });

    return null;
}

function onRemoveAllRows() {
    gridApi.setGridOption('rowData', []);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
