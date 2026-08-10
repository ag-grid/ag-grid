import type { ColDef, ColGroupDef, GridApi, GridOptions, GridState } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    GridStateModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnHeaderEditModule, ColumnMenuModule, ColumnsToolPanelModule } from 'ag-grid-enterprise';

declare let window: any;

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnApiModule,
    GridStateModule,
    ColumnHeaderEditModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
]);

const columnDefs: (ColDef | ColGroupDef)[] = [
    {
        groupId: 'athleteDetails',
        headerName: 'Athlete Details',
        headerNameEditable: true,
        children: [
            { field: 'athlete', headerNameEditable: true },
            { field: 'age', headerNameEditable: true },
            { field: 'country', headerNameEditable: true },
        ],
    },
    { field: 'sport' },
    {
        groupId: 'medals',
        headerName: 'Medals',
        headerNameEditable: true,
        children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }],
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 170,
    },
    sideBar: 'columns',
    columnHeaderEdit: {
        applyMode: 'live',
    },
};

function onModeChange() {
    const deferred = document.querySelector<HTMLInputElement>('#deferredMode')?.checked;
    gridApi!.setGridOption('columnHeaderEdit', { applyMode: deferred ? 'deferred' : 'live' });
}

function saveState() {
    window.gridState = gridApi!.getState();
    console.log('grid state saved');
}

function restoreState() {
    if (!window.gridState) {
        console.log('no grid state to restore, you must save state first');
        return;
    }
    gridApi!.setState(window.gridState as GridState);
    console.log('grid state restored');
}

function resetState() {
    gridApi!.resetColumnState();
    console.log('column state reset');
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
