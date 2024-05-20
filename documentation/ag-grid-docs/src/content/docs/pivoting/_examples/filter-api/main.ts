import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColDef, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

let gridApi: GridApi<IOlympicData>;

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FiltersToolPanelModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true, enableRowGroup: true },
        { field: 'year', pivot: true, enablePivot: true },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        floatingFilter: true,
    },
    processPivotResultColDef: (colDef: ColDef) => {
        colDef.filter = 'agNumberColumnFilter';
        colDef.floatingFilter = true;
    },
    pivotMode: true,
    sideBar: 'filters',
};

function clearFilter() {
    gridApi!.setFilterModel(null);
}

function filterUsRussiaAustralia() {
    gridApi!.setFilterModel({
        ...gridApi!.getFilterModel(),
        country: {
            type: 'set',
            values: ['United States', 'Russia', 'Australia'],
        },
    });
}

function filterCanadaNorwayChinaZimbabweNetherlands() {
    gridApi!.setFilterModel({
        ...gridApi!.getFilterModel(),
        country: {
            type: 'set',
            values: ['Canada', 'Norway', 'China', 'Zimbabwe', 'Netherlands'],
        },
    });
}

function filter20042006() {
    gridApi!.setFilterModel({
        ...gridApi!.getFilterModel(),
        year: {
            type: 'set',
            values: ['2004', '2006'],
        },
    });
}

function filter200820102012() {
    gridApi!.setFilterModel({
        ...gridApi!.getFilterModel(),
        year: {
            type: 'set',
            values: ['2008', '2010', '2012'],
        },
    });
}

function filterClearYears() {
    gridApi!.setFilterModel({
        ...gridApi!.getFilterModel(),
        year: undefined,
    });
}

function filterSwimmingHockey() {
    gridApi!.setFilterModel({
        ...gridApi!.getFilterModel(),
        sport: {
            type: 'set',
            values: ['Swimming', 'Hockey'],
        },
    });
}

function filterHockeyIceHockey() {
    gridApi!.setFilterModel({
        ...gridApi!.getFilterModel(),
        sport: {
            type: 'set',
            values: ['Hockey', 'Ice Hockey'],
        },
    });
}

function filterEveryYearGold() {
    const goldPivotCols = gridApi!
        .getPivotResultColumns()!
        .filter((col) => col.getColDef().pivotValueColumn!.getColId() === 'gold');
    if (goldPivotCols) {
        const newOpts = goldPivotCols.reduce((acc, col) => {
            acc[col.getId()] = {
                filter: 0,
                filterType: 'number',
                type: 'greaterThan',
            };
            return acc;
        }, gridApi!.getFilterModel() || {});
        gridApi!.setFilterModel(newOpts);
    }
}

function filter2000Silver() {
    const targetCol = gridApi!.getPivotResultColumn(['2000'], 'silver');
    if (targetCol) {
        gridApi!.setFilterModel({
            ...gridApi!.getFilterModel(),
            [targetCol.getId()]: {
                filterType: 'number',
                type: 'notBlank',
            },
        });
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
