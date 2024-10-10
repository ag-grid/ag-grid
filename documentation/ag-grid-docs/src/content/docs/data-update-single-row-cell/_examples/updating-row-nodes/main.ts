import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const rowData = [
    { id: 'aa', make: 'Toyota', model: 'Celica', price: 35000 },
    { id: 'bb', make: 'Ford', model: 'Mondeo', price: 32000 },
    { id: 'cc', make: 'Porsche', model: 'Boxster', price: 72000 },
    { id: 'dd', make: 'BMW', model: '5 Series', price: 59000 },
    { id: 'ee', make: 'Dodge', model: 'Challanger', price: 35000 },
    { id: 'ff', make: 'Mazda', model: 'MX5', price: 28000 },
    { id: 'gg', make: 'Horse', model: 'Outside', price: 99000 },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price', filter: 'agNumberColumnFilter' }],
    defaultColDef: {
        flex: 1,
        editable: true,
        filter: true,
        enableCellChangeFlash: true,
    },
    getRowId: (params: GetRowIdParams) => {
        return params.data.id;
    },
    rowData: rowData,
};

function updateSort() {
    gridApi!.refreshClientSideRowModel('sort');
}

function updateFilter() {
    gridApi!.refreshClientSideRowModel('filter');
}

const pRandom = (() => {
    // From https://stackoverflow.com/a/3062783
    let seed = 123_456_789;
    const m = 2 ** 32;
    const a = 1_103_515_245;
    const c = 12_345;

    return () => {
        seed = (a * seed + c) % m;
        return seed / m;
    };
})();

function setPriceOnToyota() {
    const rowNode = gridApi!.getRowNode('aa')!;
    const newPrice = Math.floor(pRandom() * 100000);
    rowNode.setDataValue('price', newPrice);
}

function generateNewFordData() {
    const newPrice = Math.floor(pRandom() * 100000);
    const newModel = 'T-' + Math.floor(pRandom() * 1000);
    return {
        id: 'bb',
        make: 'Ford',
        model: newModel,
        price: newPrice,
    };
}

function setDataOnFord() {
    const rowNode = gridApi!.getRowNode('bb')!;
    const newData = generateNewFordData();
    rowNode.setData(newData);
}

function updateDataOnFord() {
    const rowNode = gridApi!.getRowNode('bb')!;
    const newData = generateNewFordData();
    rowNode.updateData(newData);
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
