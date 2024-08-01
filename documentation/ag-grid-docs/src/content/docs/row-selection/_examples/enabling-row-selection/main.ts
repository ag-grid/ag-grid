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

    document.querySelector('#input-selection-mode')?.addEventListener('change', refreshSelectionOptions);
    document.querySelector('#input-suppress-deselection')?.addEventListener('change', refreshSelectionOptions);
    document.querySelector('#input-suppress-click-selection')?.addEventListener('change', refreshSelectionOptions);
    document.querySelector('#input-multi-select-with-click')?.addEventListener('change', refreshSelectionOptions);
    document.querySelector('#input-checkbox-selection')?.addEventListener('change', refreshSelectionOptions);
});

function getCheckboxValue(id: string): boolean {
    return document.querySelector<HTMLInputElement>(id)?.checked ?? false;
}

function getSelectValue(id: string): SelectionOptions['mode'] {
    return (document.querySelector<HTMLSelectElement>(id)?.value as SelectionOptions['mode']) ?? 'singleRow';
}

function refreshSelectionOptions() {
    const mode = getSelectValue('#input-selection-mode');
    const selectionOptions: SelectionOptions = {
        mode,
        suppressDeselection: getCheckboxValue('#input-suppress-deselection'),
        suppressClickSelection: getCheckboxValue('#input-suppress-click-selection'),
        checkboxSelection: getCheckboxValue('#input-checkbox-selection'),
        enableMultiSelectWithClick:
            mode === 'multiRow' ? getCheckboxValue('#input-enable-multi-select-with-click') : undefined,
    };

    gridApi.setGridOption('selectionOptions', selectionOptions);
}
