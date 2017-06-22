var classRules =  {
    // rule shouldn't apply to header or footer, so ignore when node.group = true
    'bold-and-red': '!node.group && x>=5'
};

var columnDefs = [
    {field: 'nationality', rowGroup: true, hide: true},
    {
        headerName: 'Weekly Editable Values',
        children: [
            {headerName: "Monday",  field: "mon", cellRenderer: valueCellRenderer, cellClassRules: classRules, aggFunc: 'sum'},
            {headerName: "Tuesday", field: "tue", cellRenderer: valueCellRenderer, cellClassRules: classRules, aggFunc: 'sum'},
            {headerName: "Wednesday", field: "wed", cellRenderer: valueCellRenderer, cellClassRules: classRules, aggFunc: 'sum'},
            {headerName: "Thursday", field: "thur", cellRenderer: valueCellRenderer, cellClassRules: classRules, aggFunc: 'sum'},
            {headerName: "Friday", field: "fri", cellRenderer: valueCellRenderer, cellClassRules: classRules, aggFunc: 'sum'}
        ]
    }
];

var data = [
    {name: 'Saoirse Ronan', nationality: 'Irish', mon: 1, tue: 1, wed: 1, thur: 1, fri: 1},
    {name: 'Colin Farrell', nationality: 'Irish',mon: 5, tue: 5, wed: 5, thur: 5, fri: 5},
    {name: 'Cillian Murphy', nationality: 'Irish',mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
    {name: 'Pierce Brosnan', nationality: 'Irish',mon: 1, tue: 1, wed: 1, thur: 1, fri: 1},
    {name: 'Liam Neeson', nationality: 'Irish',mon: 5, tue: 5, wed: 5, thur: 5, fri: 5},
    {name: 'Gabriel Byrne', nationality: 'Irish',mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
    {name: 'Stephen Rea', nationality: 'Irish',mon: 1, tue: 1, wed: 1, thur: 1, fri: 1},
    {name: 'Michael Fassbender', nationality: 'Irish',mon: 5, tue: 5, wed: 5, thur: 5, fri: 5},
    {name: 'Richard Harris', nationality: 'Irish',mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
    {name: 'Brendan Gleeson', nationality: 'Irish',mon: 1, tue: 1, wed: 1, thur: 1, fri: 1},
    {name: 'Colm Meaney', nationality: 'Irish',mon: 5, tue: 5, wed: 5, thur: 5, fri: 5},
    {name: 'Niall Crosby', nationality: 'Irish',mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
    {name: 'Brad Pitt', nationality: 'American',mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
    {name: 'Edward Norton', nationality: 'American',mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
    {name: 'Laurence Fishburne', nationality: 'American',mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
    {name: 'Bruce Willis', nationality: 'American' ,mon: 1, tue: 2, wed: 3, thur: 4, fri: 5}
];

var TEMPLATE = '<span id="text"></span> <button id="btUp">+</button> <button id="btDown">-</button>';

function valueCellRenderer(params) {
    if (params.node.group) {
        return cellRendererHeaderCell(params);
    } else {
        return cellRendererNormalCell(params);
    }
}

function cellRendererNormalCell(params) {
    var eSpan = document.createElement('span');

    eSpan.innerHTML = TEMPLATE;

    eSpan.querySelector('#text').innerHTML = params.value;
    eSpan.querySelector('#btUp').addEventListener('click', function() {
        params.data[params.colDef.field]++;
        params.refreshCell();
        params.api.recomputeAggregates();
    });
    eSpan.querySelector('#btDown').addEventListener('click', function() {
        params.data[params.colDef.field]--;
        params.refreshCell();
        params.api.recomputeAggregates();
    });

    return eSpan;
}

function cellRendererHeaderCell(params) {
    if (params.value) {
        // print a value if it is there
        return params.value;
    } else {
        // otherwise print nothing (we are the header of an expanded group)
        return '';
    }
}

var gridOptions = {
    suppressAggFuncInHeader: true,
    groupIncludeFooter: true,
    groupDefaultExpanded: 1,
    columnDefs: columnDefs,
    rowData: data,
    rowSelection: 'single',
    enableSorting: true,
    groupColumnDef: {
        field: 'name',
        width: 400,
        headerName: 'Person'
    },
    onGridReady: function(params) {
        params.api.sizeColumnsToFit();
    }
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});