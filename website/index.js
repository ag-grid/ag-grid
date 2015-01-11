
indexModule = angular.module("index", ["angularGrid"]);

indexModule.controller('indexController', function($scope) {

    //cellRenderer: undefined, filterCellRenderer: undefined, filterCellHeight: undefined,
    //    comparator: undefined, cellCss: undefined, cellCssFunc: undefined

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
            {'#': "5", country: "Brazil", pop2000: "176,319,621", pop2010: "201,103,330"},
            {'#': "6", country: "Pakistan", pop2000: "146,404,914", pop2010: "184,404,791"},
            {'#': "7", country: "Nigeria", pop2000: "123,178,818", pop2010: "152,217,341"},
            {'#': "8", country: "Bangladesh", pop2000: "130,406,594", pop2010: "156,118,464"},
            {'#': "9", country: "Russia", pop2000: "146,709,971", pop2010: "139,390,205"},
            {'#': "10", country: "Japan", pop2000: "126,729,223", pop2010: "126,804,433"}
        ],
        enableColResize: true, //one of [true, false]
        enableSorting: true, //one of [true, false]
        rowSelection: "single" // one of ['single','multiple']
    };

});