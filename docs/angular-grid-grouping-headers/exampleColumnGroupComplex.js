
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {
            headerName: "Group A",
            groupId: "GroupA",
            children: [
                {headerName: "Athlete 1", field: "athlete", width: 150, filter: 'text'},
                {
                    headerName: "Group B",
                    groupId: "GroupB",
                    children: [
                        {headerName: "Age 2", field: "age", width: 90, filter: 'number'},
                        {
                            headerName: "Group C",
                            groupId: "GroupC",
                            children: [
                                {headerName: "Country 1", field: "country", width: 120},
                                {
                                    headerName: "Group D",
                                    groupId: "GroupD",
                                    children: [
                                        {headerName: "Sport 1", field: "sport", width: 110},
                                        {
                                            headerName: "Group E",
                                            groupId: "GroupE",
                                            children: [
                                                {headerName: "Total 1", field: "total", width: 100, filter: 'number'},
                                                {
                                                    headerName: "Group F",
                                                    groupId: "GroupF",
                                                    children: [
                                                        {headerName: "Gold 1", field: "gold", width: 100, filter: 'number'},
                                                        {
                                                            headerName: "Group G",
                                                            groupId: "GroupG",
                                                            children: [
                                                                {headerName: "Silver 1", field: "silver", width: 100, filter: 'number'},
                                                                {
                                                                    headerName: "Group H",
                                                                    groupId: "GroupH",
                                                                    children: [
                                                                        {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'}
                                                                    ]
                                                                },
                                                                {headerName: "Silver 2", columnGroupShow: 'open', field: "silver", width: 100, filter: 'number'}
                                                            ]
                                                        },
                                                        {headerName: "Gold 2", columnGroupShow: 'open', field: "gold", width: 100, filter: 'number'}
                                                    ]
                                                },
                                                {headerName: "Total 2", columnGroupShow: 'open', field: "total", width: 100, filter: 'number'}
                                            ]
                                        },
                                        {headerName: "Sport 2", columnGroupShow: 'open', field: "sport", width: 110}
                                    ]
                                },
                                {headerName: "Country 2", columnGroupShow: 'open', field: "country", width: 120}
                            ]
                        },
                        {headerName: "Age 2", columnGroupShow: 'open', field: "age", width: 90, filter: 'number'}
                    ]
                },
                {headerName: "Athlete 2", columnGroupShow: 'open', field: "athlete", width: 150, filter: 'text'}
            ]
        }
    ];

    $scope.gridOptions = {
        debug: true,
        columnDefs: columnDefs,
        rowData: null,
        groupHeaders: true,
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        icons: {
            columnGroupOpened: '<i class="fa fa-minus-square-o"/>',
            columnGroupClosed: '<i class="fa fa-plus-square-o"/>'
        }
    };

    $scope.expandAll = function(expand) {
        var columnApi = $scope.gridOptions.columnApi;
        var groupNames = ['GroupA','GroupB','GroupC','GroupD','GroupE','GroupF','GroupG'];

        groupNames.forEach( function(groupId) {
            columnApi.setColumnGroupOpened(groupId, expand);
        });
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
        });
});
