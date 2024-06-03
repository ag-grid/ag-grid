import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CellKeyDownEvent, ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { KeyboardEvent } from 'react';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    SetFilterModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 170 },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    rowData: null,
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    onCellKeyDown: onCellKeyDown,
};

function onCellKeyDown(e: CellKeyDownEvent) {
    console.log('onCellKeyDown', e);
    if (!e.event) {
        return;
    }

    const keyboardEvent = e.event as unknown as KeyboardEvent;
    const key = keyboardEvent.key;

    if (key.length) {
        console.log('Key Pressed = ' + key);
        if (key === 's') {
            var rowNode = e.node;
            var newSelection = !rowNode.isSelected();
            console.log('setting selection on node ' + rowNode.data.athlete + ' to ' + newSelection);
            rowNode.setSelected(newSelection);
        }
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
