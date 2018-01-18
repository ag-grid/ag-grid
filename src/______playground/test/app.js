(function () {
    "use strict";

    agGrid.initialiseAgGridWithAngular1(angular);

    var app = angular.module('test.addError', ['agGrid', 'test.gridService']);
    bootstrapApplication();
    function bootstrapApplication() {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ["test.addError"]);
        });
    }

    app.controller('main', function ($scope, gridService, $window) {
        var $ctrl = this;

        var columnDefs = [
            { headerName: "Name", field: "name", enableRowGroup: true, rowGroupIndex: 0 },
            { headerName: "Protein", field: "protein" },
            { headerName: "Price", field: "price" },
            { headerName: "Restaurant", field: "restaurant" },
            { headerName: "Tortilla", field: "tortilla" },
            { headerName: "Gauc", field: "guac" },
            { headerName: "Queso", field: "queso" },
            { headerName: "Sauce", field: "sauce" },
            { headerName: "Quantity", field: "quantity" }
        ];

        var rowData = [

        ];

        $ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            rowGroupPanelShow: 'always',
            rowSelection: 'single',
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            //angularCompileRows: true,
            //singleClickEdit: true,
        };


        gridService.setGridOptions($ctrl.gridOptions, "main");


        var tacoData = [{
            name: "Brush Fire",
            protein: "chicken",
            price: "$3.49",
            restaurant: "Torchy's",
            tortilla: "flour",
            guac: false,
            queso: false,
            sauce: "diablo",
            quanity: 5
        },
        {
            name: "baja shrimp",
            protein: "shrimp",
            price: "$4.49",
            restaurant: "Torchy's",
            tortilla: "cprm",
            guac: false,
            queso: false,
            sauce: "chipotle",
            quanity: 3
        }];
        var tacoObject = {
            name: "doritos locos",
            protein: "ground beef?",
            price: "$1.49",
            restaurant: "taco bell",
            tortilla: "corn",
            guac: false,
            queso: false,
            sauce: "fire",
            quanity: 2
        };

        $ctrl.setData = function () {
            gridService.setGridData("main", tacoData);
        };
        $ctrl.addData= function()
        {
            //$ctrl.gridOptions.api.updateRowData({ add: [tacoObject] });
            gridService.addGridData("main", tacoObject);
        }

        $ctrl.openNewWindow=function()
        {
            $window.$gridService = gridService;
            var newPlatformWindow = $window.open('external.html', '_blank', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=no,width=850,height=750');

        }
       // $ctrl.tacoGridOptions.api.setRowData([tacoObject]);




        
       
    });


})();



//this service although pointless for this example is used in our actual application for sibling controllers to affect the same grid. 
(function () {
    "use strict";

    var app = angular.module('test.gridService', []);

    app.factory('gridService', function () {
    
        var gridOptions = {};
        return {
            setGridOptions: function (options, gridName) {
                gridOptions[gridName] = options;
            },
            setGridData: function (gridName, data) {
                gridOptions[gridName].api.setRowData(data);
            },
            addGridData: function (gridName, data) {
                gridOptions[gridName].api.updateRowData({ add: [data] });
            }
        }
    });


})();