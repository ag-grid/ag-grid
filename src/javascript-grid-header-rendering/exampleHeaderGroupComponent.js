var columnDefs = [{
        headerName: "Athlete Details",
        headerGroupComponent: MyHeaderComponent,
        children: [
            {headerName: "Athlete", field: "athlete", width: 150},
            {headerName: "Age", field: "age", width: 90,  columnGroupShow: 'open'},
            {headerName: "Country", field: "country", width: 120,  columnGroupShow: 'open'}
    ]},
    {
        headerName: "Medal details",
        headerGroupComponent: MyHeaderComponent,
        children: [
            {headerName: "Year", field: "year", width: 90},
            {headerName: "Date", field: "date", width: 110},
            {headerName: "Sport", field: "sport", width: 110, columnGroupShow: 'open'},
            {headerName: "Gold", field: "gold", width: 100, columnGroupShow: 'open'},
            {headerName: "Silver", field: "silver", width: 100,  columnGroupShow: 'open'},
            {headerName: "Bronze", field: "bronze", width: 100, columnGroupShow: 'open'},
            {headerName: "Total", field: "total", width: 100,  columnGroupShow: 'open'}
        ]}
];

var gridOptions = {
    columnDefs: columnDefs,
    rowData: null,
    defaultColDef: {
    }
};


function MyHeaderComponent() {
}

MyHeaderComponent.prototype.init = function (params){
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = ''+
        '<div class="customHeaderLabel"> --' + this.params.displayName + '-- </div>' +
        '<div class="customExpandButton"><i class="fa fa-arrow-right"></i></div>';

    this.onExpandButtonClickedListener = this.expandOrCollapse.bind(this);
    this.eExpandButton = this.eGui.querySelector(".customExpandButton");
    this.eExpandButton.addEventListener('click', this.onExpandButtonClickedListener);

    this.onExpandChangedListener = this.syncExpandButtons.bind(this);
    this.params.columnGroup.getOriginalColumnGroup().addEventListener('expandedChanged', this.onExpandChangedListener);

    this.syncExpandButtons();
};

MyHeaderComponent.prototype.getGui = function (){
    return this.eGui;
};

MyHeaderComponent.prototype.expandOrCollapse = function (){
   var currentState = this.params.columnGroup.getOriginalColumnGroup().isExpanded();
   this.params.setExpanded(!currentState);
};

MyHeaderComponent.prototype.syncExpandButtons = function (){
    function collapsed (toDeactivate){
        toDeactivate.className = toDeactivate.className.split(' ')[0] + ' collapsed';
    }

    function expanded (toActivate){
        toActivate.className = toActivate.className.split(' ')[0] + ' expanded';
    }

    if (this.params.columnGroup.getOriginalColumnGroup().isExpanded()){
        expanded(this.eExpandButton);
    }else{
        collapsed(this.eExpandButton);
    }
};

MyHeaderComponent.prototype.destroy = function () {
    this.eExpandButton.removeEventListener('click', this.onExpandButtonClickedListener);
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
