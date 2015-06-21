
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 180,
            // use font awesome for first col, with numbers for sort
            icons: {
                sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
            },
            cellRenderer: {
                renderer: 'group'
            }
        },
        {headerName: "Age", field: "age", width: 90,
            icons: {
                // not very useful, but demonstrates you can just have strings
                sortAscending: 'U',
                sortDescending: 'D'
            }
        },
        {headerName: "Country", field: "country", width: 120,
            icons: {
                sortAscending: '<i class="fa fa-sort-alpha-asc"/>',
                sortDescending: '<i class="fa fa-sort-alpha-desc"/>'
            }
        },
        {headerName: "Year", field: "year", width: 90,
            // mix it up a bit, use a function to return back the icon
            icons: {
                sortAscending: function () { return 'ASC'; },
                sortDescending: function () { return 'DESC'; }
            }
        },
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        groupKeys: ['country','athlete'],
        rowData: null,
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        groupSuppressAutoColumn: true,
        // override all the defaults with font awsome
        icons: {
            // use font awesome for menu icons
            menu: '<i class="fa fa-bars"/>',
            filter: '<i class="fa fa-filter"/>',
            sortAscending: '<i class="fa fa-long-arrow-down"/>',
            sortDescending: '<i class="fa fa-long-arrow-up"/>',
            // use some strings from group
            groupExpanded: '<img src="minus.png" style="width: 15px;"/>',
            groupContracted: '<img src="plus.png" style="width: 15px;"/>'
        }
    };

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
