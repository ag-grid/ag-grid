var gridOptions = {
    columnDefs: [
        {
            headerName: 'Default',
            field: 'animal',
            filter: 'agSetColumnFilter',
        },
        {
            headerName: 'Excel (Windows)',
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: {
                excelMode: 'windows',
            },
        },
        {
            headerName: 'Excel (Mac)',
            field: 'animal',
            filter: 'agSetColumnFilter',
            filterParams: {
                excelMode: 'mac',
            },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
        resizable: true,
    },
    sideBar: ['filters'],
    rowData: this.getRowData(),
    localeText: {
        applyFilter: 'OK',
        cancelFilter: 'Cancel',
        resetFilter: 'Clear Filter',
    }
};

// inScope[getRowData]
function getRowData() {
    var animals = ['Monkey', 'Lion', 'Elephant', 'Tiger', 'Giraffe', 'Antelope', 'Otter', 'Penguin', null];
    var rows = [];

    for (var i = 0; i < 2000; i++) {
        var index = Math.floor(Math.random() * animals.length);
        rows.push({ animal: animals[index] });
    }

    return rows;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
