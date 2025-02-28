import type {
    FindChangedEvent,
    FindFullWidthCellRendererParams,
    GetFindMatchesParams,
    GridApi,
    GridOptions,
    IsFullWidthRowParams,
    RowHeightParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { FindModule } from 'ag-grid-enterprise';

import { getData, getLatinText } from './data';
import { FullWidthCellRenderer } from './fullWidthCellRenderer';

ModuleRegistry.registerModules([FindModule, ClientSideRowModelModule, ValidationModule /* Development Only */]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'name' }, { field: 'continent' }, { field: 'language' }],
    defaultColDef: {
        flex: 1,
    },
    rowData: getData(),
    getRowHeight: (params: RowHeightParams) => {
        // return 100px height for full width rows
        if (isFullWidth(params.data)) {
            return 100;
        }
    },
    isFullWidthRow: (params: IsFullWidthRowParams) => {
        return isFullWidth(params.rowNode.data);
    },
    fullWidthCellRenderer: FullWidthCellRenderer,
    fullWidthCellRendererParams: {
        getFindMatches: (params: GetFindMatchesParams) => {
            const getMatchesForValue = params.getMatchesForValue;
            // this example only implements searching across part of the renderer
            let numMatches = getMatchesForValue('Sample Text in a Paragraph');
            getLatinText().forEach((paragraph) => {
                numMatches += getMatchesForValue(paragraph);
            });
            return numMatches;
        },
    } as FindFullWidthCellRendererParams,
    onFindChanged: (event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        (document.getElementById('activeMatchNum') as HTMLElement).textContent = findSearchValue?.length
            ? `${activeMatch?.numOverall ?? 0}/${totalMatches}`
            : '';
    },
};

function isFullWidth(data: any) {
    // return true when country is Peru, France or Italy
    return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
}

function next() {
    gridApi!.findNext();
}

function previous() {
    gridApi!.findPrevious();
}

function goToFind() {
    const num = Number((document.getElementById('find-goto') as HTMLInputElement).value);
    if (isNaN(num) || num < 0) {
        return;
    }
    gridApi!.findGoTo(num);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    const findInput = document.getElementById('find-text-box') as HTMLInputElement;
    findInput.addEventListener('input', (event) => {
        gridApi.setGridOption('findSearchValue', (event.target as HTMLInputElement).value);
    });
    findInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const backwards = event.shiftKey;
            if (backwards) {
                previous();
            } else {
                next();
            }
        }
    });
});
