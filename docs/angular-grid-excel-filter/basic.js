var fileBrowserModule = angular.module('basic', ['angularGrid']);

fileBrowserModule.controller('basicController', function($scope) {

	var COUNTRY_CODES = {
	    Ireland: "ie",
	    Spain: "es",
	    "United Kingdom": "gb",
	    France: "fr",
	    Germany: "de",
	    Sweden: "se",
	    Italy: "it",
	    Greece: "gr",
	    Iceland: "is",
	    Portugal: "pt",
	    Malta: "mt",
	    Norway: "no",
	    Brazil: "br",
	    Argentina: "ar",
	    Colombia: "co",
	    Peru: "pe",
	    Venezuela: "ve",
	    Uruguay: "uy"
	};



    var countries = [
        {country: "Ireland", continent: "Europe", language: "English"},
        {country: "Spain", continent: "Europe", language: "Spanish"},
        {country: "United Kingdom", continent: "Europe", language: "English"},
        {country: "France", continent: "Europe", language: "French"},
        {country: "Germany", continent: "Europe", language: "(other)"},
        {country: "Sweden", continent: "Europe", language: "(other)"},
        {country: "Norway", continent: "Europe", language: "(other)"},
        {country: "Italy", continent: "Europe", language: "(other)"},
        {country: "Greece", continent: "Europe", language: "(other)"},
        {country: "Iceland", continent: "Europe", language: "(other)"},
        {country: "Portugal", continent: "Europe", language: "Portuguese"},
        {country: "Malta", continent: "Europe", language: "(other)"},
        {country: "Brazil", continent: "South America", language: "Portuguese"},
        {country: "Argentina", continent: "South America", language: "Spanish"},
        {country: "Colombia", continent: "South America", language: "Spanish"},
        {country: "Peru", continent: "South America", language: "Spanish"},
        {country: "Venezuela", continent: "South America", language: "Spanish"},
        {country: "Uruguay", continent: "South America", language: "Spanish"}
    ];

    var columnDefs = [
        {headerName: "Country", field: "country", width: 150, cellRenderer: countryCellRenderer,
            filterParams: {cellRenderer: countryCellRenderer, cellHeight: 20}},
        {headerName: "Continent", field: "continent", width: 120},
        {headerName: "Language", field: "language", width: 120}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: /*createRowData()*/countries,
        rowSelection: 'multiple',
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        groupHeaders: true,
        rowHeight: 22,
        pinnedColumnCount: 3,
        suppressRowClickSelection: true,
	enableFilterExcel: true
    };

    function countryCellRenderer(params) {
        var flag = "<img border='0' width='15' height='10' style='margin-bottom: 2px' src='../images/flags/" + COUNTRY_CODES[params.value] + ".png'>";
        return flag + " " + params.value;
    }

});
