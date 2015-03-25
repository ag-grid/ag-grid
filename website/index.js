
indexModule = angular.module("index", ["angularGrid", "fileBrowser", 'basic']);

indexModule.controller('indexController', function($scope) {

    $scope.angularGrid = {
        columnDefs: [
            {displayName: "#", field: "#", width: 40},
            {displayName: "Country", field: "country", width: 150},
            {displayName: "2000 Population", field: "pop2000", width: 200},
            {displayName: "2010 Population", field: "pop2010", width: 200}
        ],
        rowData: [
            {'#': "1", country: "China", pop2000: "1,268,853,362", pop2010: "1,330,141,295"},
            {'#': "2", country: "India", pop2000: "1,004,124,224", pop2010: "1,173,108,018"},
            {'#': "3", country: "United States", pop2000: "282,338,631", pop2010: "310,232,863"},
            {'#': "4", country: "Indonesia", pop2000: "213,829,469", pop2010: "242,968,342"},
            {'#': "5", country: "Brazil", pop2000: "176,319,621", pop2010: "201,103,330"}        ],
        enableColResize: true, //one of [true, false]
        enableSorting: true, //one of [true, false]
        rowSelection: "single", // one of ['single','multiple']
        dontUseScrolls: true
    };

});