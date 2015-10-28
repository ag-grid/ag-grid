

(function() {

    document.addEventListener('DOMContentLoaded', function() {

        var gridDiv = document.querySelector('#myGrid');

        var gridOptions = {
            columnDefs: [
                {headerName: 'Name', field: 'name'},
                {headerName: 'Role', field: 'role'}
            ],
            rowData: [
                {name: 'Niall', role: 'Developer'},
                {name: 'Eamon', role: 'Manager'},
                {name: 'Brian', role: 'Musician'},
                {name: 'Kevin', role: 'Manager'}
            ]
        };

        new ag.grid.Grid(gridDiv, gridOptions);
    });

})();