import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, RowHeightParams, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { getData } from './data';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    MenuModule,
    RowGroupingModule,
]);

var swimmingHeight: number;
var groupHeight: number;
var usaHeight: number;

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'country', rowGroup: true },
        { field: 'athlete' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
    ],
    rowData: getData(),
    groupDefaultExpanded: 1,
    getRowHeight: getRowHeight,
};

function getRowHeight(params: RowHeightParams<IOlympicData>): number | undefined | null {
    if (params.node.group && groupHeight != null) {
        return groupHeight;
    } else if (params.data && params.data.country === 'United States' && usaHeight != null) {
        return usaHeight;
    } else if (params.data && params.data.sport === 'Swimming' && swimmingHeight != null) {
        return swimmingHeight;
    }
}

function setSwimmingHeight(height: number) {
    swimmingHeight = height;
    gridApi!.resetRowHeights();
}

function setGroupHeight(height: number) {
    groupHeight = height;
    gridApi!.resetRowHeights();
}

function setUsaHeight(height: number) {
    // this is used next time resetRowHeights is called
    usaHeight = height;

    gridApi!.forEachNode(function (rowNode) {
        if (rowNode.data && rowNode.data.country === 'United States') {
            rowNode.setRowHeight(height);
        }
    });
    gridApi!.onRowHeightChanged();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
