var gridOptions = {
    columnDefs: [
        {field: "athlete", width: 150},
        {field: "age", width: 90},
        {field: "country", width: 150},
        {field: "year", width: 90},
        {field: "date", width: 150},
        {field: "sport", width: 150},
        {field: "gold", width: 100},
        {field: "silver", width: 100},
        {field: "bronze", width: 100},
        {field: "total", width: 100},
    ],
};

function fillLarge() {
    setWidthAndHeight('100%');
}

function fillMedium() {
    setWidthAndHeight('60%');
}

function fillExact() {
    setWidthAndHeight('400px');
}

function setWidthAndHeight(size) {
    var eGridDiv = document.querySelector('#myGrid');
    eGridDiv.style.setProperty('width', size);
    eGridDiv.style.setProperty('height', size);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(data => gridOptions.api.setRowData(data));
});
