import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, IRichCellEditorParams, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RichSelectModule } from '@ag-grid-enterprise/rich-select';

import { colors } from './colors';
import { ColourCellRenderer } from './colourCellRenderer_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule, RichSelectModule]);

const columnDefs: ColDef[] = [
    {
        headerName: 'Color',
        field: 'color',
        cellRenderer: ColourCellRenderer,
        keyCreator: (params) => params.value.name,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
            values: colors,
            searchType: 'matchAny',
            formatValue: (value) => value.name,
            allowTyping: true,
            filterList: true,
            valueListMaxHeight: 220,
        } as IRichCellEditorParams,
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        width: 200,
        editable: true,
    },
    columnDefs: columnDefs,
    rowData: [{ color: colors[0] }, { color: colors[1] }, { color: colors[2] }, { color: colors[3] }],
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
