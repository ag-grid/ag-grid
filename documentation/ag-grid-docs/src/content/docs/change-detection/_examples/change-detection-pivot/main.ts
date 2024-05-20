import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
    GetRowIdParams,
    GridApi,
    GridOptions,
    GridReadyEvent,
    IRowNode,
    ValueGetterParams,
    createGrid,
} from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule]);

interface Student {
    student: number;
    yearGroup: string;
    age: number;
    course: string;
    points: number;
}

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { headerName: 'Student ID', field: 'student' },
        { headerName: 'Year Group', field: 'yearGroup', rowGroup: true },
        { headerName: 'Age', field: 'age' },
        { headerName: 'Course', field: 'course', pivot: true },
        {
            headerName: 'Age Range',
            valueGetter: ageRangeValueGetter,
            pivot: true,
        },
        { headerName: 'Points', field: 'points', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
    rowData: getRowData(),
    pivotMode: true,
    groupDefaultExpanded: 1,
    getRowId: (params: GetRowIdParams) => {
        return params.data.student;
    },
    onGridReady: (params: GridReadyEvent) => {
        (document.getElementById('pivot-mode') as HTMLInputElement).checked = true;
    },
};

function ageRangeValueGetter(params: ValueGetterParams) {
    var age = params.getValue('age');
    if (age === undefined) {
        return null;
    }
    if (age < 20) {
        return '< 20';
    } else if (age > 30) {
        return '> 30';
    } else {
        return '20 to 30';
    }
}

// pretty basic, but deterministic (so same numbers each time we run), random number generator
var seed: number;
function random() {
    seed = ((seed || 1) * 16807) % 2147483647;
    return seed;
}

function getRowData() {
    var rowData = [];
    for (var i = 1; i <= 100; i++) {
        var row = createRow();
        rowData.push(row);
    }
    return rowData;
}

var studentId: number;
function createRow() {
    studentId = studentId ? studentId : 10023;
    var randomNumber = random();
    return {
        student: studentId++,
        points: (randomNumber % 60) + 40,
        course: ['Science', 'History'][randomNumber % 3 === 0 ? 0 : 1],
        yearGroup: 'Year ' + ((randomNumber % 4) + 1), // 'Year 1' to 'Year 4'
        age: (randomNumber % 25) + 15, // 15 to 40
    };
}

function pivotMode() {
    var pivotModeOn = (document.getElementById('pivot-mode') as HTMLInputElement).checked;

    gridApi!.setGridOption('pivotMode', pivotModeOn);

    gridApi!.applyColumnState({
        state: [
            { colId: 'yearGroup', rowGroup: pivotModeOn },
            { colId: 'course', pivot: pivotModeOn, pivotIndex: 1 },
            { colId: 'ageRange', pivot: pivotModeOn, pivotIndex: 0 },
        ],
    });
}

function updateOneRecord() {
    var rowNodeToUpdate = pickExistingRowNodeAtRandom(gridApi!);
    if (!rowNodeToUpdate) return;

    var randomValue = createNewRandomScore(rowNodeToUpdate.data);
    console.log('updating points to ' + randomValue + ' on ', rowNodeToUpdate.data);
    rowNodeToUpdate.setDataValue('points', randomValue);
}

function createNewRandomScore(data: Student) {
    var randomValue = createRandomNumber();
    // make sure random number is not actually the same number again
    while (randomValue === data.points) {
        randomValue = createRandomNumber();
    }
    return randomValue;
}

function createRandomNumber() {
    return Math.floor(Math.random() * 100);
}

function pickExistingRowNodeAtRandom(api: GridApi) {
    var allItems: IRowNode[] = [];
    api.forEachLeafNode(function (rowNode) {
        allItems.push(rowNode);
    });

    if (allItems.length === 0) {
        return;
    }
    var result = allItems[Math.floor(Math.random() * allItems.length)];

    return result;
}

function pickExistingRowItemAtRandom(api: GridApi): Student | null {
    var rowNode = pickExistingRowNodeAtRandom(api);
    return rowNode ? rowNode.data : null;
}

function updateUsingTransaction() {
    var itemToUpdate = pickExistingRowItemAtRandom(gridApi!);
    if (!itemToUpdate) {
        return;
    }

    console.log('updating - before', itemToUpdate);
    itemToUpdate.points = createNewRandomScore(itemToUpdate);
    var transaction = {
        update: [itemToUpdate],
    };
    console.log('updating - after', itemToUpdate);
    gridApi!.applyTransaction(transaction);
}

function addNewGroupUsingTransaction() {
    var item1 = createRow();
    var item2 = createRow();
    item1.yearGroup = 'Year 5';
    item2.yearGroup = 'Year 5';
    var transaction = {
        add: [item1, item2],
    };
    console.log('add - ', item1);
    console.log('add - ', item2);
    gridApi!.applyTransaction(transaction);
}

function addNewCourse() {
    var item1 = createRow();
    item1.course = 'Physics';
    var transaction = {
        add: [item1],
    };
    console.log('add - ', item1);
    gridApi!.applyTransaction(transaction);
}

function removePhysics() {
    var allPhysics: any = [];
    gridApi!.forEachLeafNode(function (rowNode) {
        if (rowNode.data.course === 'Physics') {
            allPhysics.push(rowNode.data);
        }
    });
    var transaction = {
        remove: allPhysics,
    };
    console.log('removing ' + allPhysics.length + ' physics items.');
    gridApi!.applyTransaction(transaction);
}

function moveCourse() {
    var item = pickExistingRowItemAtRandom(gridApi!);
    if (!item) {
        return;
    }
    item.course = item.course === 'History' ? 'Science' : 'History';
    var transaction = {
        update: [item],
    };
    console.log('moving ' + item);
    gridApi!.applyTransaction(transaction);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
