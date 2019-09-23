var rowData = [
    {
        "athlete":"Michael Phelps",
        "age":23,
        "country":"United States",
        "year":2008,
        "date":"24/08/2008",
        "sport":"Swimming",
        "gold":8,
        "silver":0,
        "bronze":0,
        "total":8
    },
    {
        "athlete":"Michael Phelps",
        "age":19,
        "country":"United States",
        "year":2004,
        "date":"29/08/2004",
        "sport":"Swimming",
        "gold":6,
        "silver":0,
        "bronze":2,
        "total":8
    },
    {
        "athlete":"Michael Phelps",
        "age":27,
        "country":"United States",
        "year":2012,
        "date":"12/08/2012",
        "sport":"Swimming",
        "gold":4,
        "silver":2,
        "bronze":0,
        "total":6
    },
    {
        "athlete":"Natalie Coughlin",
        "age":25,
        "country":"United States",
        "year":2008,
        "date":"24/08/2008",
        "sport":"Swimming",
        "gold":1,
        "silver":2,
        "bronze":3,
        "total":6
    },
    {
        "athlete":"Aleksey Nemov",
        "age":24,
        "country":"Russia",
        "year":2000,
        "date":"01/10/2000",
        "sport":"Gymnastics",
        "gold":2,
        "silver":1,
        "bronze":3,
        "total":6
    },
    {
        "athlete":"Alicia Coutts",
        "age":24,
        "country":"Australia",
        "year":2012,
        "date":"12/08/2012",
        "sport":"Swimming",
        "gold":1,
        "silver":3,
        "bronze":1,
        "total":5
    },
    {
        "athlete":"Missy Franklin",
        "age":17,
        "country":"United States",
        "year":2012,
        "date":"12/08/2012",
        "sport":"Swimming",
        "gold":4,
        "silver":0,
        "bronze":1,
        "total":5
    },
    {
        "athlete":"Ryan Lochte",
        "age":27,
        "country":"United States",
        "year":2012,
        "date":"12/08/2012",
        "sport":"Swimming",
        "gold":2,
        "silver":2,
        "bronze":1,
        "total":5
    },
    {
        "athlete":"Allison Schmitt",
        "age":22,
        "country":"United States",
        "year":2012,
        "date":"12/08/2012",
        "sport":"Swimming",
        "gold":3,
        "silver":1,
        "bronze":1,
        "total":5
    },
    {
        "athlete":"Natalie Coughlin",
        "age":21,
        "country":"United States",
        "year":2004,
        "date":"29/08/2004",
        "sport":"Swimming",
        "gold":2,
        "silver":2,
        "bronze":1,
        "total":5
    },
    {
        "athlete":"Ian Thorpe",
        "age":17,
        "country":"Australia",
        "year":2000,
        "date":"01/10/2000",
        "sport":"Swimming",
        "gold":3,
        "silver":2,
        "bronze":0,
        "total":5
    },
    {
        "athlete":"Dara Torres",
        "age":33,
        "country":"United States",
        "year":2000,
        "date":"01/10/2000",
        "sport":"Swimming",
        "gold":2,
        "silver":0,
        "bronze":3,
        "total":5
    },
    {
        "athlete":"Cindy Klassen",
        "age":26,
        "country":"Canada",
        "year":2006,
        "date":"26/02/2006",
        "sport":"Speed Skating",
        "gold":1,
        "silver":2,
        "bronze":2,
        "total":5
    },
    {
        "athlete":"Nastia Liukin",
        "age":18,
        "country":"United States",
        "year":2008,
        "date":"24/08/2008",
        "sport":"Gymnastics",
        "gold":1,
        "silver":3,
        "bronze":1,
        "total":5
    },
    {
        "athlete":"Marit Bjørgen",
        "age":29,
        "country":"Norway",
        "year":2010,
        "date":"28/02/2010",
        "sport":"Cross Country Skiing",
        "gold":3,
        "silver":1,
        "bronze":1,
        "total":5
    },
    {
        "athlete":"Sun Yang",
        "age":20,
        "country":"China",
        "year":2012,
        "date":"12/08/2012",
        "sport":"Swimming",
        "gold":2,
        "silver":1,
        "bronze":1,
        "total":4
    },
    {
        "athlete":"Kirsty Coventry",
        "age":24,
        "country":"Zimbabwe",
        "year":2008,
        "date":"24/08/2008",
        "sport":"Swimming",
        "gold":1,
        "silver":3,
        "bronze":0,
        "total":4
    },
    {
        "athlete":"Libby Lenton-Trickett",
        "age":23,
        "country":"Australia",
        "year":2008,
        "date":"24/08/2008",
        "sport":"Swimming",
        "gold":2,
        "silver":1,
        "bronze":1,
        "total":4
    }
];

var columnDefs = [
    {
        headerName: 'Athlete',
        children: [
            { field: "athlete", width: 150, filter: 'agTextColumnFilter'},
            { field: "age", width: 90},
            {
                headerName: 'Competition',
                children: [
                    { field: "year", width: 90 },
                    { field: "date", width: 110 },
                ]
            },
            { field: "country", width: 120}
        ]
    },
    { colId: 'sport', field: "sport", width: 110 },
    {
        headerName: 'Medals',
        children: [
            { field: "gold", width: 100 },
            { field: "silver", width: 100 },
            { field: "bronze", width: 100 },
            { field: "total", width: 100 }
        ]
    }
];

var customToolPanelColumnDefs = [
    {
        headerName: 'Dummy Group 1',
        children: [
            { field: "age" },
            { field: "athlete" },
            {
                headerName: 'Dummy Group 2',
                children: [
                    { colId: "sport" },
                    { field: "country" },
                ]
            }
        ]
    },
    {
        headerName: 'Medals',
        children: [
            { field: "total", width: 100 },
            { field: "bronze", width: 100 },
            { field: "silver", width: 100 },
            { field: "gold", width: 100 }
        ]
    }
];


var gridOptions = {
    defaultColDef: {
        // allow every column to be aggregated
        enableValue: true,
        // allow every column to be grouped
        enableRowGroup: true,
        // allow every column to be pivoted
        enablePivot: true,
        sortable: true,
        filter: true
    },
    columnDefs: columnDefs,
    sideBar: 'columns',
    rowData: rowData
};

function setCustomColumnLayout() {
    var columnToolPanel = gridOptions.api.getToolPanelInstance('columns');
    columnToolPanel.setColumnLayout(customToolPanelColumnDefs);
}

function resetLayout() {
    var columnToolPanel = gridOptions.api.getToolPanelInstance('columns');
    columnToolPanel.setColumnLayout(columnDefs);
}




// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    // var httpRequest = new XMLHttpRequest();
    // httpRequest.open('GET', 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinners.json');
    // httpRequest.send();
    // httpRequest.onreadystatechange = function () {
    //     if (httpRequest.readyState == 4 && httpRequest.status == 200) {
    //         var httpResult = JSON.parse(httpRequest.responseText);
    //         gridOptions.api.setRowData(httpResult);
    //     }
    // };
});
