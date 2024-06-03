import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, ICellRendererParams, ValueParserParams, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getData } from './data';

ModuleRegistry.registerModules([CommunityFeaturesModule, ClientSideRowModelModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'city', type: 'dimension', cellRenderer: cityCellRenderer },
        {
            field: 'country',
            type: 'dimension',
            cellRenderer: countryCellRenderer,
            minWidth: 200,
        },
        {
            field: 'state',
            type: 'dimension',
            cellRenderer: stateCellRenderer,
            rowGroup: true,
        },
        { field: 'val1', type: 'numberValue' },
        { field: 'val2', type: 'numberValue' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        field: 'city',
        minWidth: 200,
    },
    columnTypes: {
        numberValue: {
            enableValue: true,
            aggFunc: 'sum',
            editable: true,
            valueParser: numberParser,
        },
        dimension: {
            enableRowGroup: true,
            enablePivot: true,
        },
    },
    rowData: getData(),
    groupDefaultExpanded: -1,
    rowGroupPanelShow: 'always',
    groupAllowUnbalanced: true,
};

const COUNTRY_CODES: Record<string, string> = {
    Ireland: 'ie',
    'United Kingdom': 'gb',
    USA: 'us',
};

function numberParser(params: ValueParserParams) {
    return parseInt(params.newValue);
}

function countryCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag =
            '<img border="0" width="15" height="10" src="https://flagcdn.com/h20/' +
            COUNTRY_CODES[params.value] +
            '.png">';
        return flag + ' ' + params.value;
    }
}

function stateCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag =
            '<img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/gold-star.png">';
        return flag + ' ' + params.value;
    }
}

function cityCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
        return '';
    } else {
        const flag =
            '<img border="0" width="15" height="10" src="https://www.ag-grid.com/example-assets/weather/sun.png">';
        return flag + ' ' + params.value;
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
