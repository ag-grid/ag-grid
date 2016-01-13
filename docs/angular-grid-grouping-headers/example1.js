
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs1 = [
        {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
        {headerName: "Age", field: "age", width: 90, filter: 'number'},
        {headerName: "Country", field: "country", width: 120}
    ];

    var columnDefs2 = [
        {
            headerName: "Group 1",
            children: [
                {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'}
            ]
        }
    ];

    var columnDefs3 = [
        {
            headerName: "Group 1",
            children: [
                {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
                {headerName: "Age", field: "age", width: 90, filter: 'number'},
                {headerName: "Country", field: "country", width: 120}
            ]
        },
        {
            headerName: "Group 2",
            children: [
                {headerName: "Sport", field: "sport", width: 110},
                {headerName: "Total", columnGroupShow: 'closed', field: "total", width: 100, filter: 'number'},
                {headerName: "Gold", columnGroupShow: 'open', field: "gold", width: 100, filter: 'number'},
                {headerName: "Silver", columnGroupShow: 'open', field: "silver", width: 100, filter: 'number'}
            ]
        }
    ];

    var columnDefs4 = [
        {
            headerName: "Group 1",
            children: [
                {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
                {headerName: "Age", field: "age", width: 90, filter: 'number'},
                {headerName: "Country", field: "country", width: 120}
            ]
        },
        {
            headerName: "Group 2",
            children: [
                {headerName: "Sport", field: "sport", width: 110},
                {headerName: "Total", columnGroupShow: 'closed', field: "total", width: 100, filter: 'number'},
                {headerName: "Gold", columnGroupShow: 'open', field: "gold", width: 100, filter: 'number'},
                {headerName: "Silver", columnGroupShow: 'open', field: "silver", width: 100, filter: 'number'}
            ]
        },
        {headerName: "Bronze", columnGroupShow: 'open', field: "bronze", width: 100, filter: 'number'},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110}
    ];

    var columnDefs = [
        {
            headerName: "Group 1",
            children: [
                {headerName: "Athlete", pinned: true, field: "athlete", width: 150, filter: 'text'},
                {headerName: "Age", pinned: true, field: "age", width: 90, filter: 'number'},
                {headerName: "Country", field: "country", width: 120}
            ]
        },
        {
            headerName: "Group 2",
            children: [
                {
                    headerName: "Group 2 A",
                    children: [
                        {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
                        {headerName: "Age", columnGroupShow: 'open', field: "age", width: 90, filter: 'number'},
                        {headerName: "Country", columnGroupShow: 'open', field: "country", width: 120}
                    ]
                },
                {
                    headerName: "Group 2 B",
                    columnGroupShow: 'open',
                    children: [
                        {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
                        {headerName: "Age", columnGroupShow: 'open', field: "age", width: 90, filter: 'number'},
                        {headerName: "Country", columnGroupShow: 'open', field: "country", width: 120}
                    ]
                },
                {headerName: "Country", field: "country", width: 120}
            ]
        },
        {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
        {headerName: "Age", field: "age", width: 90, filter: 'number'},
        {headerName: "Country", pinned: true, field: "country", width: 120},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Total", columnGroupShow: 'closed', field: "total", width: 100, filter: 'number'},
        {headerName: "Gold", columnGroupShow: 'open', field: "gold", width: 100, filter: 'number'},
        {headerName: "Silver", columnGroupShow: 'open', field: "silver", width: 100, filter: 'number'},
        {headerName: "Bronze", columnGroupShow: 'open', field: "bronze", width: 100, filter: 'number'},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110}
    ];

/*    var columnDefs = [
        {headerName: "Athlete", field: "athlete", headerGroup: 'Participant', width: 150, filter: 'text'},
        {headerName: "Age", field: "age", headerGroup: 'Participant', width: 90, filter: 'number'},
        {headerName: "Country", field: "country", headerGroup: 'Participant', width: 120},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Total", columnGroupShow: 'closed', field: "total", width: 100, filter: 'number'},
        {headerName: "Gold", columnGroupShow: 'open', field: "gold", width: 100, filter: 'number'},
        {headerName: "Silver", columnGroupShow: 'open', field: "silver", width: 100, filter: 'number'},
        {headerName: "Bronze", columnGroupShow: 'open', field: "bronze", width: 100, filter: 'number'},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110}
    ];*/

    $scope.gridOptions = {
        debug: true,
        columnDefs: columnDefs,
        rowData: null,
        groupHeaders: true,
        enableSorting: true,
        enableFilter: true,
        enableColResize: true
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.api.setRowData(res.data);
            //$scope.gridOptions.api.sizeColumnsToFit();
        });
});
