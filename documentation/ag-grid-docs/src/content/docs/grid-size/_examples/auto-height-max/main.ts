import type { GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
    themeQuartz,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let rowCount = 5;
let minBodyHeight = 100;
let maxBodyHeight: number | 'none' = 250;

function buildTheme() {
    return themeQuartz.withParams({
        autoHeightMinBodyHeight: minBodyHeight,
        autoHeightMaxBodyHeight: maxBodyHeight,
    });
}

const makes = ['Toyota', 'Ford', 'BMW', 'Porsche', 'Audi'];

function getData(count: number) {
    const rowData = [];
    for (let i = 0; i < count; i++) {
        rowData.push({
            id: 'D' + (1000 + i),
            make: makes[i % makes.length],
            model: 'Model ' + (i + 1),
            price: 20000 + i * 750,
        });
    }
    return rowData;
}

const gridOptions: GridOptions = {
    theme: buildTheme(),
    domLayout: 'autoHeight',
    columnDefs: [{ field: 'id' }, { field: 'make' }, { field: 'model' }, { field: 'price' }],
    defaultColDef: {
        flex: 1,
    },
    rowData: getData(rowCount),
};

const gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

function onRowCountChanged() {
    rowCount = Number((document.getElementById('row-count') as HTMLInputElement).value);
    gridApi.setGridOption('rowData', getData(rowCount));
}

function onMinBodyHeightChanged() {
    minBodyHeight = Number((document.getElementById('min-body-height') as HTMLInputElement).value);
    gridApi.setGridOption('theme', buildTheme());
}

function onMaxBodyHeightChanged() {
    const value = (document.getElementById('max-body-height') as HTMLInputElement).value;
    // an empty control means no maximum, the default for auto height
    maxBodyHeight = value === '' ? 'none' : Number(value);
    gridApi.setGridOption('theme', buildTheme());
}
