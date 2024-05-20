import {
    ColDef,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    SetFilterValuesFuncParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';

import { FakeServer } from './fakeServer';

ModuleRegistry.registerModules([ColumnsToolPanelModule, MenuModule, RowGroupingModule, ServerSideRowModelModule]);

var colDefCountry: ColDef = { field: 'country', rowGroup: true };
var colDefYear: ColDef = { field: 'year', rowGroup: true };
var colDefAthlete: ColDef = {
    field: 'athlete',
    filter: 'agSetColumnFilter',
    filterParams: {
        values: getAthletesAsync,
    },
    menuTabs: ['filterMenuTab'],
};
var colDefAge: ColDef = { field: 'age' };
var colDefSport: ColDef = { field: 'sport' };
var colDefGold: ColDef = { field: 'gold', aggFunc: 'sum' };
var colDefSilver: ColDef = { field: 'silver', aggFunc: 'sum' };
var colDefBronze: ColDef = { field: 'bronze', aggFunc: 'sum' };

const columnDefs: ColDef[] = [
    colDefAthlete,
    colDefAge,
    colDefCountry,
    colDefYear,
    colDefSport,
    colDefGold,
    colDefSilver,
    colDefBronze,
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        initialFlex: 1,
        minWidth: 120,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    maintainColumnOrder: true,
    // use the server-side row model
    rowModelType: 'serverSide',

    onGridReady: (params) => {
        (document.getElementById('athlete') as HTMLInputElement).checked = true;
        (document.getElementById('age') as HTMLInputElement).checked = true;
        (document.getElementById('country') as HTMLInputElement).checked = true;
        (document.getElementById('year') as HTMLInputElement).checked = true;
        (document.getElementById('sport') as HTMLInputElement).checked = true;
        (document.getElementById('gold') as HTMLInputElement).checked = true;
        (document.getElementById('silver') as HTMLInputElement).checked = true;
        (document.getElementById('bronze') as HTMLInputElement).checked = true;
    },

    suppressAggFuncInHeader: true,
    // debug: true,
};

function getAthletesAsync(params: SetFilterValuesFuncParams) {
    var countries = fakeServer.getAthletes();

    // simulating real server call with a 500ms delay
    setTimeout(() => {
        params.success(countries);
    }, 500);
}

function onBtApply() {
    var cols = [];
    if (getBooleanValue('#athlete')) {
        cols.push(colDefAthlete);
    }
    if (getBooleanValue('#age')) {
        cols.push(colDefAge);
    }
    if (getBooleanValue('#country')) {
        cols.push(colDefCountry);
    }
    if (getBooleanValue('#year')) {
        cols.push(colDefYear);
    }
    if (getBooleanValue('#sport')) {
        cols.push(colDefSport);
    }

    if (getBooleanValue('#gold')) {
        cols.push(colDefGold);
    }
    if (getBooleanValue('#silver')) {
        cols.push(colDefSilver);
    }
    if (getBooleanValue('#bronze')) {
        cols.push(colDefBronze);
    }

    gridApi!.setGridOption('columnDefs', cols);
}

function getBooleanValue(cssSelector: string) {
    return (document.querySelector(cssSelector) as HTMLInputElement).checked === true;
}

function getServerSideDatasource(server: any): IServerSideDatasource {
    return {
        getRows: (params: IServerSideGetRowsParams) => {
            console.log('[Datasource] - rows requested by grid: ', params.request);

            var response = server.getData(params.request);

            // adding delay to simulate real server call
            setTimeout(() => {
                if (response.success) {
                    // call the success callback
                    params.success({ rowData: response.rows, rowCount: response.lastRow });
                } else {
                    // inform the grid request failed
                    params.fail();
                }
            }, 200);
        },
    };
}

var fakeServer: any = undefined;

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            // setup the fake server with entire dataset
            fakeServer = new FakeServer(data);

            // create datasource with a reference to the fake server
            var datasource: IServerSideDatasource = getServerSideDatasource(fakeServer);

            // register the datasource with the grid
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
