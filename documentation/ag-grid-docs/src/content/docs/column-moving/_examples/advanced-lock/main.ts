import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, ColumnPinnedEvent, ColumnState, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

import { ControlsCellRenderer } from './controlsCellRenderer_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    {
        lockPosition: 'left',
        valueGetter: 'node.rowIndex',
        cellClass: 'locked-col',
        width: 60,
        suppressNavigable: true,
    },
    {
        lockPosition: 'left',
        cellRenderer: ControlsCellRenderer,
        cellClass: 'locked-col',
        width: 120,
        suppressNavigable: true,
    },
    { field: 'athlete' },
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
    columnDefs: columnDefs,
    defaultColDef: {
        width: 150,
    },
    onColumnPinned: onColumnPinned,
    suppressDragLeaveHidesColumns: true,
};

function onColumnPinned(event: ColumnPinnedEvent) {
    const allCols = event.api.getAllGridColumns();

    const allFixedCols = allCols.filter((col) => col.getColDef().lockPosition);
    const allNonFixedCols = allCols.filter((col) => !col.getColDef().lockPosition);

    const pinnedCount = allNonFixedCols.filter((col) => col.getPinned() === 'left').length;

    const pinFixed = pinnedCount > 0;

    const columnStates: ColumnState[] = [];
    allFixedCols.forEach((col) => {
        if (pinFixed !== col.isPinned()) {
            columnStates.push({
                colId: col.getId(),
                pinned: pinFixed ? 'left' : null,
            });
        }
    });

    if (columnStates.length > 0) {
        event.api.applyColumnState({ state: columnStates });
    }
}

function onPinAthlete() {
    gridApi!.applyColumnState({
        state: [{ colId: 'athlete', pinned: 'left' }],
    });
}

function onUnpinAthlete() {
    gridApi!.applyColumnState({
        state: [{ colId: 'athlete', pinned: null }],
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
