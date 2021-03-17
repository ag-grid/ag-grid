var columnDefs = [
    { field: 'first_name', headerName: 'First Name' },
    { field: 'last_name', headerName: 'Last Name' },
    { 
        headerName: 'Full Name',
        valueGetter: 'data.first_name + " " + data.last_name',
        cellClass: 'fullName'
    },
    { field: 'age' },
    { field: 'company' } 
];

var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
        flex: 1
    },

    excelStyles: [
        {
            id: 'fullName',
            dataType: 'Formula'
        }
    ],

    popupParent: document.body,
    columnDefs: columnDefs,

    rowData: [
        { 'first_name': 'Mair', 'last_name': 'Inworth', 'age': 23, 'company': 'Rhyzio' },
        { 'first_name': 'Clair', 'last_name': 'Cockland', 'age': 38, 'company': 'Vitz' },
        { 'first_name': 'Sonni', 'last_name': 'Jellings', 'age': 24, 'company': 'Kimia' },
        { 'first_name': 'Kit', 'last_name': 'Clarage', 'age': 27, 'company': 'Skynoodle' },
        { 'first_name': 'Tod', 'last_name': 'de Mendoza', 'age': 29, 'company': 'Teklist' },
        { 'first_name': 'Herold', 'last_name': 'Pelman', 'age': 23, 'company': 'Divavu' },
        { 'first_name': 'Paula', 'last_name': 'Gleave', 'age': 37, 'company': 'Demimbu' },
        { 'first_name': 'Kendrick', 'last_name': 'Clayill', 'age': 26, 'company': 'Brainlounge' },
        { 'first_name': 'Korrie', 'last_name': 'Blowing', 'age': 32, 'company': 'Twitternation' },
        { 'first_name': 'Ferrell', 'last_name': 'Towhey', 'age': 40, 'company': 'Nlounge' },
        { 'first_name': 'Anders', 'last_name': 'Negri', 'age': 30, 'company': 'Flipstorm' },
        { 'first_name': 'Douglas', 'last_name': 'Dalmon', 'age': 25, 'company': 'Feedbug' },
        { 'first_name': 'Roxanna', 'last_name': 'Schukraft', 'age': 26, 'company': 'Skinte' },
        { 'first_name': 'Seumas', 'last_name': 'Pouck', 'age': 34, 'company': 'Aimbu' },
        { 'first_name': 'Launce', 'last_name': 'Welldrake', 'age': 25, 'company': 'Twinte' },
        { 'first_name': 'Siegfried', 'last_name': 'Grady', 'age': 34, 'company': 'Vimbo' },
        { 'first_name': 'Vinson', 'last_name': 'Hyams', 'age': 20, 'company': 'Tanoodle' },
        { 'first_name': 'Cayla', 'last_name': 'Duckerin', 'age': 21, 'company': 'Livepath' },
        { 'first_name': 'Luigi', 'last_name': 'Rive', 'age': 25, 'company': 'Quatz' },
        { 'first_name': 'Carolyn', 'last_name': 'Blouet', 'age': 29, 'company': 'Eamia' }
    ]
};

function onBtExport() {
    gridOptions.api.exportDataAsExcel({
        processCellCallback: function(params) {
            if (params.column.getColDef().valueGetter) {
                return '=CONCATENATE(A' + params.accumulatedRowIndex + ', " ", B' + params.accumulatedRowIndex + ')';
            }
            return params.value;
        }
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});
