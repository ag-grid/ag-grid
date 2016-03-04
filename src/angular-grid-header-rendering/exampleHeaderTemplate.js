var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90,
        headerCellTemplate: function() {
            var eCell = document.createElement('span');
            eCell.innerHTML =
                '<div style="text-align: left;">' +
                '  <div id="agResizeBar" style="width: 4px; height: 100%; float: right; cursor: col-resize;"></div>' +
                '  <div style="padding: 4px; overflow: hidden; text-overflow: ellipsis;">' +
                '    <span id="agMenu"><i class="fa fa-bars"></i></span>' +
                    // everything inside agHeaderCellLabel gets actioned when the user clicks
                '    <span id="agHeaderCellLabel">' +
                '      <span id="agText"></span>' +
                '      <span id="agSortAsc"><i class="fa fa-long-arrow-down"></i></span>' +
                '      <span id="agSortDesc"><i class="fa fa-long-arrow-up"></i></span>' +
                '      <span id="agNoSort"></span>' +
                '      <span id="agFilter"><i class="fa fa-filter"></i></span>' +
                '    </span>' +
                '    <span id="myCalendarIcon"><i class="fa fa-calendar"></i></span>' +
                '  </div>' +
                '</div>';
            var eCalendar = eCell.querySelector('#myCalendarIcon');
            eCalendar.addEventListener('click', function() {
                alert('Calendar was Clicked');
            });
            return eCell;
        }},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100},
    {headerName: "Silver", field: "silver", width: 100},
    {headerName: "Bronze", field: "bronze", width: 100},
    {headerName: "Total", field: "total", width: 100}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    enableSorting: true,
    enableColResize: true,
    suppressMenuHide: true,
    headerCellTemplate:
        '<div style="text-align: left;">' +
        '  <div id="agResizeBar" style="width: 4px; height: 100%; float: right; cursor: col-resize;"></div>' +
        '  <div id="agHeaderCellLabel" style="padding: 4px; overflow: hidden; text-overflow: ellipsis;">' +
        '    <span id="agMenu"><i class="fa fa-bars"></i></span>' +
        '    <span id="agText"></span>' +
        '    <span id="agSortAsc"><i class="fa fa-long-arrow-down"></i></span>' +
        '    <span id="agSortDesc"><i class="fa fa-long-arrow-up"></i></span>' +
        '    <span id="agNoSort"></span>' +
        '    <span id="agFilter"><i class="fa fa-filter"></i></span>' +
        '  </div>' +
        '</div>'
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };
});
