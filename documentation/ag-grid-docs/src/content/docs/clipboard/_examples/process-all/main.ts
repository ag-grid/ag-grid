import { ClientSideRowModelModule } from 'ag-grid-community';
import { ColDef, GridApi, GridOptions, ProcessDataFromClipboardParams, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RangeSelectionModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, ClipboardModule, MenuModule, RangeSelectionModule]);

const columnDefs: ColDef[] = [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }, { field: 'e' }];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    rowData: getData(),
    columnDefs: columnDefs,
    selection: { mode: 'cell' },

    defaultColDef: {
        editable: true,
        minWidth: 120,
        flex: 1,

        cellClassRules: {
            'cell-green': 'value.startsWith("Green")',
            'cell-blue': 'value.startsWith("Blue")',
            'cell-red': 'value.startsWith("Red")',
            'cell-yellow': 'value.startsWith("Yellow")',
        },
    },

    processDataFromClipboard,
};

function processDataFromClipboard(params: ProcessDataFromClipboardParams): string[][] | null {
    var containsRed;
    var containsYellow;
    var data = params.data;

    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        for (var j = 0; j < row.length; j++) {
            var value = row[j];
            if (value) {
                if (value.startsWith('Red')) {
                    containsRed = true;
                } else if (value.startsWith('Yellow')) {
                    containsYellow = true;
                }
            }
        }
    }

    if (containsRed) {
        // replace the paste request with another
        return [
            ['Custom 1', 'Custom 2'],
            ['Custom 3', 'Custom 4'],
        ];
    }

    if (containsYellow) {
        // cancels the paste
        return null;
    }

    return data;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
