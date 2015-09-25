
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope) {

    var columnDefs = [
        {headerName: "Owner", field: "owner"},
        {headerName: "Make", field: "make", cellRenderer: timestampCellRenderer},
        {headerName: "Model", field: "model", cellRenderer: timestampCellRenderer},
        {headerName: "Price", field: "price"}
    ];

    var owners = ['Niall','Brian','Eamon','Kevin','Jillian'];
    var cars = [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
    ];
    var rowData = [];

    // a cell renderer that also prints the time, so we know when the cell was rendered
    function timestampCellRenderer(params) {
        return params.value + ' <span style="font-size: 10px; color: grey;">' + new Date().getTime() + '</span>';
    }

    owners.forEach( function(ownerName) {
        cars.forEach( function(car) {
            rowData.push({
                owner: ownerName,
                make: car.make,
                model: car.model,
                price: car.price
            });
        });
    });

    var gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData
    };
    $scope.gridOptions = gridOptions;

    $scope.onRefreshAll = function() {
        gridOptions.api.refreshView();
    };

    $scope.onDoubleNiall = function() {
        // at the end of the update below, this array will
        // have all of the items that we updated
        var updatedNodes = [];
        // look for all the 'Jillian' nodes
        gridOptions.api.forEachNode( function(node) {
            var data = node.data;
            if (data.owner == 'Niall') {
                // we found a Jilly node!!!
                data.price *= 2;
                updatedNodes.push(node);
            }
        });
        // now tell the grid it needs refresh all these rows
        gridOptions.api.refreshCells(updatedNodes, ['price']);
    };

    $scope.onDoubleJillian = function() {
        // at the end of the update below, this array will
        // have all of the items that we updated
        var updatedNodes = [];
        // look for all the 'Jillian' nodes
        gridOptions.api.forEachNode( function(node) {
            var data = node.data;
            if (data.owner == 'Jillian') {
                // we found a Jilly node!!!
                data.price *= 2;
                updatedNodes.push(node);
            }
        });
        // now tell the grid it needs refresh all these rows
        gridOptions.api.refreshRows(updatedNodes);
    };

});