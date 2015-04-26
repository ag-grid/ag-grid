
var module = angular.module('example', ['angularGrid']);

module.controller('exampleCtrl', function($scope, $http) {

    var columnDefs = [
        {displayName: 'Useless', width: 100, template: '<span style="font-weight: bold;">BLAH</span>'},
        {displayName: 'Athlete', width: 150, template: '<span style="font-weight: bold;" ng-bind="data.athlete"></span>'},
        {displayName: 'Age', width: 90, templateUrl: './ageTemplate.html'},
        {displayName: 'Country', field: 'country', width: 120},
        {displayName: 'Year', field: 'year', width: 90},
        {displayName: 'Date', field: 'date', width: 110},
        {displayName: 'Sport', field: 'sport', width: 110},
        {displayName: 'Gold', field: 'gold', width: 100},
        {displayName: 'Silver', field: 'silver', width: 100},
        {displayName: 'Bronze', field: 'bronze', width: 100},
        {displayName: 'Total', field: 'total', width: 100}
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
