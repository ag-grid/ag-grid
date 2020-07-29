var columnDefs = [
    {field: "athlete", suppressMenu: true, minWidth: 120},
    {
        field: "age",
        sortable: false,
        headerComponentParams: {menuIcon: 'fa-external-link-alt'}
    },
    {field: "country", suppressMenu: true, minWidth: 120},
    {field: "year", sortable: false},
    {field: "date", suppressMenu: true},
    {field: "sport", sortable: false},
    {field: "gold", headerComponentParams: {menuIcon: 'fa-cog'}, minWidth: 120},
    {field: "silver", sortable: false},
    {field: "bronze", suppressMenu: true, minWidth: 120},
    {field: "total", sortable: false}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    suppressMenuHide: true,
    components: {
        agColumnHeader: CustomHeader
    },
    defaultColDef: {
        editable: true,
        sortable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        resizable: true,
        headerComponentParams: {
            menuIcon: 'fa-bars'
        }
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/olympicWinnersSmall.json'})
        .then(function (data) {
            gridOptions.api.setRowData(data);
        });
});
