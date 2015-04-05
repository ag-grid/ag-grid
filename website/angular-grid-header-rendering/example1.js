
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {displayName: "Athlete", field: "athlete", width: 150},
        {displayName: "Age", field: "age", width: 90},
        {displayName: "Country", field: "country", width: 120},
        {displayName: "Year", field: "year", width: 90},
        {displayName: "Date", field: "date", width: 110},
        {displayName: "Sport", field: "sport", width: 110},
        {displayName: "Gold", field: "gold", width: 100},
        {displayName: "Silver", field: "silver", width: 100},
        {displayName: "Bronze", field: "bronze", width: 100},
        {displayName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        headerCellRenderer: headerCellRendererFunc
    };

    function headerCellRendererFunc(params) {
        var eHeader = document.createElement('span');

        var eTitle = document.createTextNode('> ' + params.colDef.displayName + ' <');
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
