import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { type GridApi, type GridOptions, type SelectionOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi<IOlympicData>;

const selection: SelectionOptions = {
    mode: 'multiRow',
    suppressClickSelection: true,
    hideDisabledCheckboxes: true,
    isRowSelectable: (node) => (node.data ? node.data.year <= 2004 : false),
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [{ field: 'athlete' }, { field: 'sport' }, { field: 'year', maxWidth: 120 }],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    selection,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));

    document.querySelector('#toggle-hide-checkbox')?.addEventListener('change', () => {
        gridApi.setGridOption('selection', {
            ...selection,
            hideDisabledCheckboxes: getCheckboxValue('#toggle-hide-checkbox'),
        });
    });
});

function getCheckboxValue(id: string): boolean {
    return document.querySelector<HTMLInputElement>(id)?.checked ?? false;
}
