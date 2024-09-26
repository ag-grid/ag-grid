import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    GridApi,
    GridOptions,
    ProcessCellForExportParams,
    ProcessGroupHeaderForExportParams,
    ProcessHeaderForExportParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

ModuleRegistry.registerModules([ClientSideRowModelModule, ClipboardModule, MenuModule, RangeSelectionModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Participants',
            children: [
                { field: 'athlete', headerName: 'Athlete Name', minWidth: 200 },
                { field: 'age' },
                { field: 'country', minWidth: 150 },
            ],
        },
        {
            headerName: 'Olympic Games',
            children: [
                { field: 'year' },
                { field: 'date', minWidth: 150 },
                { field: 'sport', minWidth: 150 },
                { field: 'gold' },
                { field: 'silver', suppressPaste: true },
                { field: 'bronze' },
                { field: 'total' },
            ],
        },
    ],

    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        cellDataType: false,
    },

    cellSelection: true,

    processCellForClipboard: processCellForClipboard,
    processHeaderForClipboard: processHeaderForClipboard,
    processGroupHeaderForClipboard: processGroupHeaderForClipboard,
    processCellFromClipboard: processCellFromClipboard,
};

function processCellForClipboard(params: ProcessCellForExportParams) {
    return 'C-' + params.value;
}

function processHeaderForClipboard(params: ProcessHeaderForExportParams) {
    const colDef = params.column.getColDef();
    let headerName = colDef.headerName || colDef.field || '';

    if (colDef.headerName !== '') {
        headerName = headerName.charAt(0).toUpperCase() + headerName.slice(1);
    }

    return 'H-' + headerName;
}

function processGroupHeaderForClipboard(params: ProcessGroupHeaderForExportParams) {
    const colGroupDef = params.columnGroup.getColGroupDef() || ({} as any);
    const headerName = colGroupDef.headerName || '';

    if (headerName === '') {
        return '';
    }

    return 'GH-' + headerName;
}

function processCellFromClipboard(params: ProcessCellForExportParams) {
    return 'Z-' + params.value;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
