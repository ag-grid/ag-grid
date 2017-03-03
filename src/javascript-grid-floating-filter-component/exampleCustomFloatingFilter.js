
var columnDefs = [
    {headerName: "Athlete", field: "athlete", width: 150, filter: 'text'},
    {headerName: "Age", field: "age", width: 90, filter: 'number'},
    {headerName: "Country", field: "country", width: 120},
    {headerName: "Year", field: "year", width: 90},
    {headerName: "Date", field: "date", width: 130, filter:'date', filterParams:{
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
    }, floatingFilterComponentParams:{
        suppressFilterButton:true
    }},
    {headerName: "Sport", field: "sport", width: 110},
    {headerName: "Gold", field: "gold", width: 100, filter: 'number', floatingFilterComponent: NumberFloatingFilter,
        floatingFilterComponentParams:{
            maxValue:7,
            suppressFilterButton:true
        }},
    {headerName: "Silver", field: "silver", width: 100, filter: 'number', floatingFilterComponent: NumberFloatingFilter,
        floatingFilterComponentParams:{
            maxValue:3,
            suppressFilterButton:true
        }},
    {headerName: "Bronze", field: "bronze", width: 100, filter: 'number', floatingFilterComponent: NumberFloatingFilter,
        floatingFilterComponentParams:{
            maxValue:2,
            suppressFilterButton:true
        }},
    {headerName: "Total", field: "total", width: 100, filter: 'number', floatingFilterComponent: NumberFloatingFilter,
        floatingFilterComponentParams:{
            maxValue:5,
            suppressFilterButton:true
        }}
];

var gridOptions = {
    floatingFilter:true,
    columnDefs: columnDefs,
    rowData: null,
    enableFilter: true
};

function NumberFloatingFilter() {
}

NumberFloatingFilter.prototype.init = function (params) {
    this.onFloatingFilterChanged = params.onFloatingFilterChanged;
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<div style="width:75%; margin-left:10px" class="slider"></div>'
    this.eSlider = $(this.eGui.querySelector('div'));
    this.currentValue = 0;
    var that = this;
    this.eSlider.slider({
        min:0,
        max:params.maxValue,
        change: function(e, ui) {
            if (!e.originalEvent) {
               return;
            }
            that.currentValue = ui.value;
            that.onFloatingFilterChanged(that.buildModel())
        }
    });


};

NumberFloatingFilter.prototype.onParentModelChanged = function (parentModel) {

    // When the filter is empty we will receive a null message her
    if (!parentModel) {
        //If there is no filtering set to the minimun
        this.eSlider.slider( "option", "value", 0 );
    } else {
        if (parentModel.filter !== this.currentValue){
            this.eSlider.slider( "option", "value", parentModel.filter );
        }
    }
};

NumberFloatingFilter.prototype.getGui = function () {
    return this.eGui;
};

NumberFloatingFilter.prototype.buildModel = function () {
    return {
        type:'greaterThan',
        filter:Number(this.currentValue)
    }
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

