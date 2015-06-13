
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 150},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        headerCellRenderer: headerCellRendererFunc
    };

    function headerCellRendererFunc(params) {
        var eHeader = document.createElement('span');

        var eTitle = document.createTextNode('> ' + params.colDef.headerName + ' <');
        eHeader.appendChild(eTitle);

        eHeader.addEventListener('click', function() {
            if (eHeader.style.color === 'red') {
                eHeader.style.color = '';
            } else {
                eHeader.style.color = 'red';
            }
        });

        return eHeader;
    }

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
