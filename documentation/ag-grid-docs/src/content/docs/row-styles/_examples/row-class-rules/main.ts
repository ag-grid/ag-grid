import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    rowData: getData(),
    columnDefs: [
        { headerName: 'Employee', field: 'employee' },
        { headerName: 'Number Sick Days', field: 'sickDays', editable: true },
    ],
    rowClassRules: {
        // row style function
        'sick-days-warning': (params) => {
            const numSickDays = params.data.sickDays;
            return numSickDays > 5 && numSickDays <= 7;
        },
        // row style expression
        'sick-days-breach': 'data.sickDays >= 8',
    },
};

function setData() {
    gridApi!.forEachNode(function (rowNode) {
        const newData = {
            employee: rowNode.data.employee,
            sickDays: randomInt(),
        };
        rowNode.setData(newData);
    });
}

function randomInt() {
    return Math.floor(Math.random() * 10);
}

// wait for the document to be loaded, otherwise
// AG Grid will not find the div in the document.
document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
