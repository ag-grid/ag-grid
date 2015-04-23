
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope) {

    var classRules =  {
        'bold-and-red': 'x>=5'
    };

    var columnDefs = [
        {displayName: "Person", field: 'name', width: 400,
            cellStyle:  {'background-color': 'rgba(255, 255, 180, 0.5)'} // light yellow background
        },
        {displayName: "Monday", group: 'Weekly Editable Values',  field: "mon", cellRenderer: valueCellRenderer, cellClassRules: classRules},
        {displayName: "Tuesday", group: 'Weekly Editable Values', field: "tue", cellRenderer: valueCellRenderer, cellClassRules: classRules},
        {displayName: "Wednesday", group: 'Weekly Editable Values', field: "wed", cellRenderer: valueCellRenderer, cellClassRules: classRules},
        {displayName: "Thursday", group: 'Weekly Editable Values', field: "thur", cellRenderer: valueCellRenderer, cellClassRules: classRules},
        {displayName: "Friday", group: 'Weekly Editable Values', field: "fri", cellRenderer: valueCellRenderer, cellClassRules: classRules}
    ];

    var data = [
        {name: 'Saoirse Ronan', mon: 1, tue: 1, wed: 1, thur: 1, fri: 1},
        {name: 'Colin Farrell', mon: 5, tue: 5, wed: 5, thur: 5, fri: 5},
        {name: 'Cillian Murphy', mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
        {name: 'Pierce Brosnan', mon: 1, tue: 1, wed: 1, thur: 1, fri: 1},
        {name: 'Liam Neeson', mon: 5, tue: 5, wed: 5, thur: 5, fri: 5},
        {name: 'Gabriel Byrne', mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
        {name: 'Stephen Rea', mon: 1, tue: 1, wed: 1, thur: 1, fri: 1},
        {name: 'Michael Fassbender', mon: 5, tue: 5, wed: 5, thur: 5, fri: 5},
        {name: 'Richard Harris', mon: 1, tue: 2, wed: 3, thur: 4, fri: 5},
        {name: 'Brendan Gleeson', mon: 1, tue: 1, wed: 1, thur: 1, fri: 1},
        {name: 'Colm Meaney', mon: 5, tue: 5, wed: 5, thur: 5, fri: 5},
        {name: 'Niall Crosby', mon: 1, tue: 2, wed: 3, thur: 4, fri: 5}
    ];

    var TEMPLATE = '<span id="text"></span> <button id="btUp">+</button> <button id="btDown">-</button>';

    function valueCellRenderer(params) {

        var eSpan = document.createElement('span');

        eSpan.innerHTML = TEMPLATE;

        eSpan.querySelector('#text').innerHTML = params.value;
        eSpan.querySelector('#btUp').addEventListener('click', function() {
            params.data[params.colDef.field]++;
            params.refreshCell();
        });
        eSpan.querySelector('#btDown').addEventListener('click', function() {
            params.data[params.colDef.field]--;
            params.refreshCell();
        });

        return eSpan;
    }

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: data,
        rowSelection: 'single',
        enableSorting: true,
        ready: function(api) {
            api.sizeColumnsToFit();
        }
    };

});
