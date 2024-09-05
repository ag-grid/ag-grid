import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    GridApi,
    GridOptions,
    IGroupCellRendererParams,
    RowClassParams,
    ValueFormatterParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { createNewRowData, getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

function poundFormatter(params: ValueFormatterParams) {
    return (
        '£' +
        Math.floor(params.value)
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'category', rowGroupIndex: 1, hide: true },
        { field: 'price', aggFunc: 'sum', valueFormatter: poundFormatter },
        { field: 'zombies' },
        { field: 'style' },
        { field: 'clothes' },
    ],
    defaultColDef: {
        flex: 1,
        width: 100,
    },
    autoGroupColumnDef: {
        headerName: 'Group',
        minWidth: 250,
        field: 'model',
        rowGroupIndex: 1,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
            checkbox: true,
        } as IGroupCellRendererParams,
    },
    groupDefaultExpanded: 1,
    rowData: getData(),
    selection: {
        mode: 'multiRow',
        suppressClickSelection: true,
        groupSelects: 'descendants',
        checkboxes: false,
        headerCheckbox: false,
    },
    suppressAggFuncInHeader: true,
    // this allows the different colors per group, by assigning a different
    // css class to each group level based on the key
    getRowClass: (params: RowClassParams) => {
        var rowNode = params.node;
        if (rowNode.group) {
            switch (rowNode.key) {
                case 'In Workshop':
                    return 'category-in-workshop';
                case 'Sold':
                    return 'category-sold';
                case 'For Sale':
                    return 'category-for-sale';
                default:
                    return undefined;
            }
        } else {
            // no extra classes for leaf rows
            return undefined;
        }
    },
};

function getRowData() {
    var rowData: any[] = [];
    gridApi!.forEachNode(function (node) {
        rowData.push(node.data);
    });
    console.log('Row Data:');
    console.log(rowData);
}

function onAddRow(category: string) {
    var rowDataItem = createNewRowData(category);
    gridApi!.applyTransaction({ add: [rowDataItem] });
}

function onMoveToGroup(category: string) {
    var selectedRowData = gridApi!.getSelectedRows();
    selectedRowData.forEach((dataItem) => {
        dataItem.category = category;
    });
    gridApi!.applyTransaction({ update: selectedRowData });
}

function onRemoveSelected() {
    var selectedRowData = gridApi!.getSelectedRows();
    gridApi!.applyTransaction({ remove: selectedRowData });
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
