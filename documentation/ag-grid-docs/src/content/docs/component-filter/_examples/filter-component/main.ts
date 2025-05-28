import type { ColDef, DoesFilterPassParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { getData } from './data';
import { PartialMatchFilter } from './partialMatchFilter_typescript';

ModuleRegistry.registerModules([
    TextFilterModule,
    TextEditorModule,
    CustomFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function doesFilterPass({ model, node, handlerParams }: DoesFilterPassParams<any, any, string>): boolean {
    const value = handlerParams.getValue(node).toString().toLowerCase();
    return model
        .toLowerCase()
        .split(' ')
        .every((filterWord) => value.indexOf(filterWord) >= 0);
}

const columnDefs: ColDef[] = [
    { field: 'row' },
    {
        field: 'name',
        filter: { component: PartialMatchFilter, doesFilterPass },
    },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
    },
    columnDefs: columnDefs,
    rowData: getData(),
    enableFilterHandlers: true,
};

function onClicked() {
    gridApi!.getColumnFilterInstance<PartialMatchFilter>('name').then((instance) => {
        instance!.componentMethod('Hello World!');
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
