var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150},
    {headerName: "Age", field: "age", width: 90, filter: 'number'},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 110, filter:'date', filterParams:{
        comparator:function (filterLocalDateAtMidnight, cellValue){
            var dateAsString = cellValue;
            var dateParts  = dateAsString.split("/");
            var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

            if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                return 0
            }

            if (cellDate < filterLocalDateAtMidnight) {
                return -1;
            }

            if (cellDate > filterLocalDateAtMidnight) {
                return 1;
            }
        }
    }},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, filter: 'number'},
    {headerName: "Silver", field: "silver", width: 100, filter: 'number'},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'},
    {headerName: "Total", field: "total", width: 100, filter: 'number', suppressFilter: true}
];

var gridOptions = {
    floatingFilter:true,
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true,
    // Here is where we specify the component to be used as the date picker widget
    components:{
        dateComponent: MyDateEditor
    }
};

function MyDateEditor () {
}

MyDateEditor.prototype.init = function(params) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<input class="myDateWidget" type="text" />';
    this.eInput = this.eGui.querySelectorAll('input')[0];

    this.listener = params.onDateChanged;
    this.eInput.addEventListener('input', this.listener);

    var that = this;
    $(this.eInput).datepicker({
        dateFormat: 'dd-mm-yy',
        altField: '#thealtdate',
        altFormat: 'yy-mm-dd',
        onSelect: function() {
            that.listener();
        }
    });
};

MyDateEditor.prototype.getGui = function (){
    return this.eGui;
};

MyDateEditor.prototype.getDate = function (){
    return $(this.eInput).datepicker( "getDate" );
};

MyDateEditor.prototype.setDate = function (date){
    $(this.eInput).datepicker( "setDate", date );
};

MyDateEditor.prototype.destroy = function () {
    this.eInput.removeEventListener('input', this.listener)
};

MyDateEditor.prototype.afterGuiAttached = function () {
    $('#ui-datepicker-div').click(function(e){
        e.stopPropagation();
    });
};

function onFilterChanged(value) {
    gridOptions.api.setQuickFilter(value);
}

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
