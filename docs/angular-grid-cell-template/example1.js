
var module = angular.module('example', ['angularGrid']);

module.controller('exampleCtrl', function($scope, $http) {

    var columnDefs = [
        {headerName: 'Useless', width: 100, template: '<span style="font-weight: bold;">BLAH</span>'},
        {headerName: 'Athlete', width: 150, template: '<span style="font-weight: bold;" ng-bind="data.athlete"></span>'},
        {headerName: 'Age', width: 90, templateUrl: './ageTemplate.html'},
        {headerName: 'Country', field: 'country', width: 120},
        {headerName: 'Year', field: 'year', width: 90},
        {headerName: 'Date', field: 'date', width: 110},
        {headerName: 'Sport', field: 'sport', width: 110},
        {headerName: 'Gold', field: 'gold', width: 100},
        {headerName: 'Silver', field: 'silver', width: 100},
        {headerName: 'Bronze', field: 'bronze', width: 100},
        {headerName: 'Total', field: 'total', width: 100}
    ];

    $scope.gridOptions = {
        // we are using angular in the templates
        angularCompileRows: true,
        columnDefs: columnDefs,
        rowData: null
    };

    $http.get('../olympicWinners.json')
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
