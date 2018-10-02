var columnDefs = [
    {field: 'athlete', colId: 'athlete'},
    {field: 'age', colId: 'age'},
    {field: 'country', colId: 'country'},
    {field: 'year', colId: 'year'},
    {field: 'date', colId: 'date'},
    {field: 'total', colId: 'total'},
    {field: 'gold', colId: 'gold'},
    {field: 'silver', colId: 'silver'},
    {field: 'bronze', colId: 'bronze'}
];

var gridOptions = {
    defaultColDef: {
        width: 100
    },
    columnDefs: columnDefs,
    enableColResize: true,
    enableSorting: true,
    enableFilter: true
};

function onBtNoGroups() {
    var columnDefs = [
        {field: 'athlete', colId: 'athlete'},
        {field: 'age', colId: 'age'},
        {field: 'country', colId: 'country'},
        {field: 'year', colId: 'year'},
        {field: 'date', colId: 'date'},
        {field: 'total', colId: 'total'},
        {field: 'gold', colId: 'gold'},
        {field: 'silver', colId: 'silver'},
        {field: 'bronze', colId: 'bronze'}
    ];
    gridOptions.api.setColumnDefs(columnDefs);
}

function onMedalsInGroupOnly() {
    var columnDefs = [
        {field: 'athlete', colId: 'athlete'},
        {field: 'age', colId: 'age'},
        {field: 'country', colId: 'country'},
        {field: 'year', colId: 'year'},
        {field: 'date', colId: 'date'},
        {headerName: 'Medals',
            headerClass: 'medals-group',
            children: [
                {field: 'total', colId: 'total'},
                {field: 'gold', colId: 'gold'},
                {field: 'silver', colId: 'silver'},
                {field: 'bronze', colId: 'bronze'}
            ]
        }
    ];
    gridOptions.api.setColumnDefs(columnDefs);
}

function onParticipantInGroupOnly() {
    var columnDefs = [
        {
            headerName: "Participant",
            headerClass: 'participant-group',
            children: [
                {field: 'athlete', colId: 'athlete'},
                {field: 'age', colId: 'age'},
                {field: 'country', colId: 'country'},
                {field: 'year', colId: 'year'},
                {field: 'date', colId: 'date'}
            ]
        },
        {field: 'total', colId: 'total'},
        {field: 'gold', colId: 'gold'},
        {field: 'silver', colId: 'silver'},
        {field: 'bronze', colId: 'bronze'}
    ];
    gridOptions.api.setColumnDefs(columnDefs);
}

function onParticipantAndMedalsInGroups() {
    var columnDefs = [
        {
            headerName: "Participant",
            headerClass: 'participant-group',
            children: [
                {field: 'athlete', colId: 'athlete'},
                {field: 'age', colId: 'age'},
                {field: 'country', colId: 'country'},
                {field: 'year', colId: 'year'},
                {field: 'date', colId: 'date'}
            ]
        },
        {headerName: 'Medals',
            headerClass: 'medals-group',
            children: [
                {field: 'total', colId: 'total'},
                {field: 'gold', colId: 'gold'},
                {field: 'silver', colId: 'silver'},
                {field: 'bronze', colId: 'bronze'}
            ]
        }
    ];
    gridOptions.api.setColumnDefs(columnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'}).then(function(data) {
        gridOptions.api.setRowData(data);
    });
});
