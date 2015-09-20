
var module = angular.module("example", ["agGrid"]);

module.controller("exampleCtrl", function($scope) {

    var columnDefs = [
        {headerName: "Person", field: 'name', width: 400,
            cellStyle:  {'background-color': 'rgba(255, 255, 180, 0.5)'} // light yellow background
        },
        {headerName: "Monday", headerGroup: 'Weekly Editable Values',  field: "mon", newValueHandler: numberNewValueHandler, editable: true},
        {headerName: "Tuesday", headerGroup: 'Weekly Editable Values', field: "tue", newValueHandler: numberNewValueHandler, editable: true},
        {headerName: "Wednesday", headerGroup: 'Weekly Editable Values', field: "wed", newValueHandler: numberNewValueHandler, editable: true},
        {headerName: "Thursday", headerGroup: 'Weekly Editable Values', field: "thur", newValueHandler: numberNewValueHandler, editable: true},
        {headerName: "Friday", headerGroup: 'Weekly Editable Values', field: "fri", newValueHandler: numberNewValueHandler, editable: true},
        {headerName: "Total", headerGroup: 'Volatile Summary',
            valueGetter: "data.mon + data.tue + data.wed + data.thur + data.fri",
            volatile: true,
            cellStyle:  {'background-color': 'rgba(180, 255, 255, 0.5)'}, // light blue background
            cellClassRules: {
                'bold-and-red': 'x>20'
            }
        },
        {headerName: "Avg",  headerGroup: 'Volatile Summary',
            valueGetter: "(data.mon + data.tue + data.wed + data.thur + data.fri) / 5",
            volatile: true,
            cellStyle:  {'background-color': 'rgba(180, 255, 255, 0.5)'} // light blue background
        },
        {headerName: "Total", headerGroup: 'Hard Summary',
            valueGetter: "data.mon + data.tue + data.wed + data.thur + data.fri",
            cellStyle:  {'background-color': 'rgba(255, 180, 255, 0.5)'}, // light red background
            cellClassRules: {
                'bold-and-red': 'x>20'
            }
        },
        {headerName: "Avg",  headerGroup: 'Hard Summary',
            valueGetter: "(data.mon + data.tue + data.wed + data.thur + data.fri) / 5",
            cellStyle:  {'background-color': 'rgba(255, 180, 255, 0.5)'} // light red background
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

    function numberNewValueHandler(params) {
        var valueAsNumber = parseInt(params.newValue);
        if (isNaN(valueAsNumber)) {
            window.alert("Invalid value " + params.newValue + ", must be a number");
        } else {
            params.data[params.colDef.field] = valueAsNumber;
        }
    }

    function cellValueChangedFunction() {
        // after a value changes, get the volatile cells to update
        $scope.gridOptions.api.softRefreshView();
    }

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: data,
        groupHeaders: true,
        rowSelection: 'single',
        enableSorting: true,
        onCellValueChanged: cellValueChangedFunction,
        onReady: function(event) {
            event.api.sizeColumnsToFit();
        }
    };

    $scope.onHardRefresh = function() {
        $scope.gridOptions.api.refreshView();
    };

});
