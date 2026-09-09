import type { GridApi, GridOptions, GridPreDestroyedEvent, GridState, StateUpdatedEvent } from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    gridId: 'setState',
    columnDefs: [
        {
            field: 'athlete',
            minWidth: 150,
        },
        { field: 'age' },
        { field: 'country', minWidth: 150 },
        {
            headerName: 'Competition',
            groupId: 'competition',
            children: [{ field: 'year' }, { field: 'date', minWidth: 150 }, { field: 'sport', minWidth: 150 }],
        },
        {
            headerName: 'Medals',
            groupId: 'medals',
            children: [
                { field: 'gold' },
                { field: 'silver', columnGroupShow: 'open' },
                { field: 'bronze', columnGroupShow: 'open' },
                { field: 'total', columnGroupShow: 'closed' },
            ],
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        headerNameEditable: true,
    },
    defaultColGroupDef: {
        headerNameEditable: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    sideBar: true,
    toolbar: {
        items: ['agQuickFilterToolbarItem'],
    },
    pagination: true,
    rowSelection: { mode: 'multiRow' },
    cellSelection: true,
    calculatedColumns: true,
    enableRowPinning: true,
    suppressColumnMoveAnimation: true,
    onGridPreDestroyed: onGridPreDestroyed,
    onStateUpdated: onStateUpdated,
};

function onGridPreDestroyed(event: GridPreDestroyedEvent<IOlympicData>): void {
    console.log('Grid state on destroy (can be persisted)', event.state);
}

function onStateUpdated(event: StateUpdatedEvent<IOlympicData>): void {
    console.log('State updated', event.state);
}

function reloadGrid() {
    gridApi.destroy();

    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;

    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => gridApi.setGridOption('rowData', data));
}

function printState() {
    console.log('Grid state', gridApi.getState());
}

let savedState: GridState | undefined;

function saveState() {
    savedState = gridApi.getState();
    console.log('Saved state', savedState);
}

function setState() {
    if (savedState) {
        gridApi.setState(savedState);
        console.log('Set state', savedState);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
