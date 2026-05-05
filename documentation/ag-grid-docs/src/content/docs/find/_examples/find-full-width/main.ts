import type {
    FindFullWidthCellRendererParams,
    GetFindMatchesParams,
    GridOptions,
    IsFullWidthRowParams,
    RowHeightParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { FindModule, ToolbarModule } from 'ag-grid-enterprise';

import { getData, getLatinText } from './data';
import { FullWidthCellRenderer } from './fullWidthCellRenderer';

ModuleRegistry.registerModules([
    FindModule,
    ToolbarModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

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
    toolbar: {
        items: ['agFindToolbarItem'],
    },
};

function isFullWidth(data: any) {
    // return true when country is Peru, France or Italy
    return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
}

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
