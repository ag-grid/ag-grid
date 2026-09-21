import type { GridApi, GridOptions, GridState, NewFiltersToolPanelState, SideBarState } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    GridStateModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, NewFiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    NumberFilterModule,
    DateFilterModule,
    ClientSideRowModelModule,
    NewFiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SetFilterModule,
    TextFilterModule,
    GridStateModule,
]);

let gridApi: GridApi<IOlympicData>;

const initialSideBarState: SideBarState = {
    visible: true,
    position: 'right',
    openToolPanel: 'filters-new',
    toolPanels: {
        'filters-new': {
            filters: [
                {
                    colId: 'country',
                    expanded: true,
                },
                {
                    colId: 'age',
                },
            ],
        } as NewFiltersToolPanelState,
    },
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country' },
        { field: 'date', minWidth: 180 },
        { field: 'total' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: 'agSelectableColumnFilter',
    },
    sideBar: 'filters-new',
    enableFilterHandlers: true,
    suppressSetFilterByDefault: true,
    initialState: {
        sideBar: initialSideBarState,
    },
};

let savedState: GridState | undefined;

function clearFilterValues() {
    gridApi.setFilterModel(null);
}

function clearToolPanel() {
    gridApi.setState({
        sideBar: {
            visible: true,
            position: 'right',
            openToolPanel: 'filters-new',
            toolPanels: {
                'filters-new': {
                    filters: [],
                } as NewFiltersToolPanelState,
            },
        },
    });
}

function restoreInitialState() {
    gridApi.setState({ sideBar: initialSideBarState });
}

function saveState() {
    savedState = gridApi.getState();
    console.log('Saved state', savedState);
}

function restoreSavedState() {
    if (savedState) {
        gridApi.setState({ filter: savedState.filter, sideBar: savedState.sideBar });
        console.log('Restored state', savedState);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((rowData) => {
                    const dateParts = rowData.date.split('/');
                    const [year, month, day] = dateParts.reverse().map((e) => parseInt(e, 10));
                    const paddedDateTimeStrings = [month, day].map((e) => e.toString().padStart(2, '0'));
                    const date = `${year}-${paddedDateTimeStrings[0]}-${paddedDateTimeStrings[1]}`;
                    return {
                        ...rowData,
                        date,
                    };
                })
            )
        );
});
