
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $http) {

    var FLAG_CODES = {
        'Ireland': 'ie',
        'United States': 'us',
        'Russia': 'ru',
        'Australia': 'au',
        'Canada': 'ca',
        'Norway': 'no',
        'China': 'cn',
        'Zimbabwe': 'zw',
        'Netherlands': 'nl',
        'South Korea': 'kr',
        'Croatia': 'hr',
        'France': 'fr'
    };

    var columnDefs = [
        {headerName: "Athlete", field: "athlete", width: 200},
        {headerName: "Age", field: "age", width: 90},
        {headerName: "Gold", field: "gold", width: 100},
        {headerName: "Silver", field: "silver", width: 100},
        {headerName: "Bronze", field: "bronze", width: 100},
        {headerName: "Total", field: "total", width: 100},
        {headerName: "Country", field: "country", width: 120},
        {headerName: "Year", field: "year", width: 90},
        {headerName: "Date", field: "date", width: 110},
        {headerName: "Sport", field: "sport", width: 110}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: null,
        groupUseEntireRow: true,
        groupKeys: ['country'],
        groupAggFunction: groupAggFunction,
        groupRowInnerRenderer: groupRowInnerRendererFunc
    };

    function groupRowInnerRendererFunc(params) {
        var flagCode = FLAG_CODES[params.node.key];

        var html = '';
        if (flagCode) {
            html += '<img class="flag" border="0" width="20" height="15" src="http://flags.fmcdn.net/data/flags/mini/'+flagCode+'.png">'
        }

        html += '<span class="groupTitle"> COUNTRY_NAME</span>'.replace('COUNTRY_NAME', params.node.key);
        html += '<span class="medal gold"> Gold: GOLD_COUNT</span>'.replace('GOLD_COUNT', params.data.gold);
        html += '<span class="medal silver"> Silver: SILVER_COUNT</span>'.replace('SILVER_COUNT', params.data.silver);
        html += '<span class="medal bronze"> Bronze: BRONZE_COUNT</span>'.replace('BRONZE_COUNT', params.data.bronze);

        return html;
    }

    function groupAggFunction(nodes) {

        var sums = {
            gold: 0,
            silver: 0,
            bronze: 0,
            total: 0,
            minAge: 100,
            maxAge: 0
        };

        nodes.forEach(function(node) {

            var data = node.data;

            if (node.group) {

                if (sums.minAge > data.minAge) {
                    sums.minAge = data.minAge;
                }
                if (sums.maxAge < data.maxAge) {
                    sums.maxAge = data.maxAge;
                }

            } else {

                if (sums.minAge > data.age) {
                    sums.minAge = data.age;
                }
                if (sums.maxAge < data.age) {
                    sums.maxAge = data.age;
                }

            }

            sums.gold += data.gold;
            sums.silver += data.silver;
            sums.bronze += data.bronze;
            sums.total += data.total;

        });

        return sums;
    }

    $http.get("../olympicWinners.json")
        .then(function(res){
            $scope.gridOptions.rowData = res.data;
            $scope.gridOptions.api.onNewRows();
        });
});
