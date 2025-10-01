import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    CustomEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    RenderApiModule,
    SelectEditorModule,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    SelectEditorModule,
    TextEditorModule,
    NumberEditorModule,
    CustomEditorModule,
    ColumnApiModule,
    RenderApiModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

function getColumnDefs() {
    const columnDefs = [
        {
            field: 'make',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['Porsche', 'Toyota', 'Ford', 'AAA', 'BBB', 'CCC'],
            },
        },
        { field: 'model' },
        { field: 'field4', headerName: 'Read Only', editable: false },
        { field: 'price', cellEditor: 'agNumberCellEditor' },
        {
            headerName: 'Suppress Navigable',
            field: 'field5',
            suppressNavigable: true,
            minWidth: 200,
        },
        { headerName: 'Read Only', field: 'field6', editable: false },
    ];

    const bigColDefs = [...Array(2)]
        .map(() => columnDefs.map((c, i) => ({ ...c, colId: `${c.field}-${i}` })))
        .reduce((a, c) => [...a, ...c])
        .map((c, i) => ({ ...c, colId: `${c.colId}-${i}` }));

    return bigColDefs;
}

function getRowData() {
    const rowData = [];
    for (let i = 0; i < 1000; i++) {
        rowData.push({
            make: 'Toyota',
            model: 'Celica',
            price: 35000 + i * 1000,
            field4: 'Sample XX',
            field5: 'Sample 22',
            field6: 'Sample 23',
        });
        rowData.push({
            make: 'Ford',
            model: 'Mondeo',
            price: 32000 + i * 1000,
            field4: 'Sample YY',
            field5: 'Sample 24',
            field6: 'Sample 25',
        });
        rowData.push({
            make: 'Porsche',
            model: 'Boxster',
            price: 72000 + i * 1000,
            field4: 'Sample ZZ',
            field5: 'Sample 26',
            field6: 'Sample 27',
        });
    }
    return rowData;
}

function onBtStopEditing() {
    gridApi!.stopEditing();
}

function onBtStartEditing() {
    gridApi!.setFocusedCell(1, 'model-1-1');
    gridApi!.startEditingCell({
        rowIndex: 1,
        colKey: 'model-1-1',
    });
}

const gridOptions: GridOptions = {
    columnDefs: getColumnDefs(),
    defaultColDef: {
        flex: 1,
        editable: true,
        cellDataType: false,
        minWidth: 100,
    },
    // editType: 'fullRow',
    rowData: getRowData(),
};

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
