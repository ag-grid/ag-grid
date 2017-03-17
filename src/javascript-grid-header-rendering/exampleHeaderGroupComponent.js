var columnDefs = [{
        headerName: "Athlete Details",
        headerGroupComponent: MyHeaderGroupComponent,
        children: [
            {headerName: "Athlete", field: "athlete", width: 150},
            {headerName: "Age", field: "age", width: 90,  columnGroupShow: 'open'},
            {headerName: "Country", field: "country", width: 120,  columnGroupShow: 'open'}
    ]},
    {
        headerName: "Medal details",
        headerGroupComponent: MyHeaderGroupComponent,
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
    enableColResize: true,
    defaultColDef: {
        width: 100,
        headerComponent : MyHeaderComponent,
        headerComponentParams : {
            menuIcon: 'fa-bars'
        }
    },
    floatingFilter:true,
    enableSorting:true,
    enableFiltering:true
};


function MyHeaderComponent() {
}

MyHeaderComponent.prototype.init = function (agParams){
    this.agParams = agParams;
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = ''+
        '<div class="customHeaderMenuButton"><i class="fa ' + this.agParams.menuIcon + '"></i></div>' +
        '<div class="customHeaderLabel">' + this.agParams.displayName + '</div>' +
        '<div class="customSortDownLabel inactive"><i class="fa fa-long-arrow-down"></i></div>' +
        '<div class="customSortUpLabel inactive"><i class="fa fa-long-arrow-up"></i></div>' +
        '<div class="customSortRemoveLabel inactive"><i class="fa fa-times"></i></div>';

    this.eMenuButton = this.eGui.querySelector(".customHeaderMenuButton");
    this.eSortDownButton = this.eGui.querySelector(".customSortDownLabel");
    this.eSortUpButton = this.eGui.querySelector(".customSortUpLabel");
    this.eSortRemoveButton = this.eGui.querySelector(".customSortRemoveLabel");


    if (this.agParams.enableMenu){
        this.onMenuClickListener = this.onMenuClick.bind(this);
        this.eMenuButton.addEventListener('click', this.onMenuClickListener);
    }else{
        this.eGui.removeChild(this.eMenuButton);
    }

    if (this.agParams.enableSorting){
        this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
        this.eSortDownButton.addEventListener('click', this.onSortAscRequestedListener);
        this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
        this.eSortUpButton.addEventListener('click', this.onSortDescRequestedListener);
        this.onRemoveSortListener = this.onSortRequested.bind(this, '');
        this.eSortRemoveButton.addEventListener('click', this.onRemoveSortListener);


        this.onSortChangedListener = this.onSortChanged.bind(this);
        this.agParams.column.addEventListener('sortChanged', this.onSortChangedListener);
        this.onSortChanged();
    } else {
        this.eGui.removeChild(this.eSortDownButton);
        this.eGui.removeChild(this.eSortUpButton);
        this.eGui.removeChild(this.eSortRemoveButton);
    }
};

MyHeaderComponent.prototype.onSortChanged = function (){
    function deactivate (toDeactivateItems){
        toDeactivateItems.forEach(function (toDeactivate){toDeactivate.className = toDeactivate.className.split(' ')[0]});
    }

    function activate (toActivate){
        toActivate.className = toActivate.className + " active";
    }

    if (this.agParams.column.isSortAscending()){
        deactivate([this.eSortUpButton, this.eSortRemoveButton]);
        activate (this.eSortDownButton)
    } else if (this.agParams.column.isSortDescending()){
        deactivate([this.eSortDownButton, this.eSortRemoveButton]);
        activate (this.eSortUpButton)
    } else {
        deactivate([this.eSortUpButton, this.eSortDownButton]);
        activate (this.eSortRemoveButton)
    }
};

MyHeaderComponent.prototype.getGui = function (){
    return this.eGui;
};

MyHeaderComponent.prototype.onMenuClick = function () {
    this.agParams.showColumnMenu (this.eMenuButton);
};

MyHeaderComponent.prototype.onSortRequested = function (order, event) {
    this.agParams.setSort (order, event.shiftKey);
};

MyHeaderComponent.prototype.destroy = function () {
    if (this.onMenuClickListener){
        this.eMenuButton.removeEventListener('click', this.onMenuClickListener)
    }
    this.eSortDownButton.removeEventListener('click', this.onSortRequestedListener);
    this.eSortUpButton.removeEventListener('click', this.onSortRequestedListener);
    this.eSortRemoveButton.removeEventListener('click', this.onSortRequestedListener);
    this.agParams.column.removeEventListener('sortChanged', this.onSortChangedListener);
};


function MyHeaderGroupComponent() {
}

MyHeaderGroupComponent.prototype.init = function (params){
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-header-group-cell-label';
    this.eGui.innerHTML = ''+
        '<div class="customHeaderLabel">' + this.params.displayName + '</div>' +
        '<div class="customExpandButton"><i class="fa fa-arrow-right"></i></div>';

    this.onExpandButtonClickedListener = this.expandOrCollapse.bind(this);
    this.eExpandButton = this.eGui.querySelector(".customExpandButton");
    this.eExpandButton.addEventListener('click', this.onExpandButtonClickedListener);

    this.onExpandChangedListener = this.syncExpandButtons.bind(this);
    this.params.columnGroup.getOriginalColumnGroup().addEventListener('expandedChanged', this.onExpandChangedListener);

    this.syncExpandButtons();
};

MyHeaderGroupComponent.prototype.getGui = function (){
    return this.eGui;
};

MyHeaderGroupComponent.prototype.expandOrCollapse = function (){
   var currentState = this.params.columnGroup.getOriginalColumnGroup().isExpanded();
   this.params.setExpanded(!currentState);
};

MyHeaderGroupComponent.prototype.syncExpandButtons = function (){
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

MyHeaderGroupComponent.prototype.destroy = function () {
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
