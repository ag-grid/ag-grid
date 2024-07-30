import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions, SelectionOptions } from '@ag-grid-community/core';
import { createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const selectionOptions: SelectionOptions = {
    mode: 'singleRow',
    suppressDeselection: false,
    suppressClickSelection: false,
    checkboxSelection: false,
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 150 },
        { field: 'age', maxWidth: 90 },
        { field: 'country', minWidth: 150 },
        { field: 'year', maxWidth: 90 },
        { field: 'date', minWidth: 150 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    selectionOptions,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data));

    document.querySelector('#input-selection-mode')?.addEventListener('change', (e) => {
        //@ts-ignore
        selectionOptions.mode = e.target!.value;
        gridApi.setGridOption('selectionOptions', selectionOptions);
    });

    document.querySelector('#input-suppress-deselection')?.addEventListener('change', (e) => {
        //@ts-ignore
        selectionOptions.suppressDeselection = e.target!.checked;
        gridApi.setGridOption('selectionOptions', selectionOptions);
    });

    document.querySelector('#input-suppress-click-selection')?.addEventListener('change', (e) => {
        //@ts-ignore
        selectionOptions.suppressClickSelection = e.target!.checked;
        gridApi.setGridOption('selectionOptions', selectionOptions);
    });

    document.querySelector('#input-enable-multi-select-with-click')?.addEventListener('change', (e) => {
        //@ts-ignore
        if (selectionOptions.mode === 'multiRow') {
            //@ts-ignore
            selectionOptions.enableMultiSelectWithClick = e.target!.checked;
        }
        gridApi.setGridOption('selectionOptions', selectionOptions);
    });

    document.querySelector('#input-checkbox-selection')?.addEventListener('change', (e) => {
        //@ts-ignore
        selectionOptions.checkboxSelection = e.target!.checked;
        gridApi.setGridOption('selectionOptions', selectionOptions);
    });
});
