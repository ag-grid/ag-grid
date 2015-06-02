var consolesModule = angular.module('consoles', ['angularGrid']);

consolesModule.controller('consolesController', function($scope, $http) {  

    var columnDefs = [
        {
            width: 250,
            cellRenderer: {
                renderer: 'group',
                innerRenderer: groupInnerCellRenderer
            }, 
            displayName: "Name",
            field: "name", 
            group:" "
        },      
        {            
            group: {
                name: "Male", 
                parent: {
                    name: "15 or younger"               
                }
            },
            displayName: "Like", field: "1", editable: true, cellStyle: sizeCellStyle, newValueHandler: numberNewValueHandler,cellRenderer: editableCellRenderer
        },
        {
            group: {
                name: "Male", 
                parent: {
                    name:  "15 or younger"               
                }
            },
            displayName: "Not Like", field: "2", editable: true, cellStyle: sizeCellStyle, newValueHandler: numberNewValueHandler,cellRenderer: editableCellRenderer
        },
         {
            group: {
                name: "Female", 
                parent: {
                    name:  "15 or younger"               
                }
            },
            displayName: "Like", field: "3", editable: true, cellStyle: sizeCellStyle, newValueHandler: numberNewValueHandler,cellRenderer: editableCellRenderer
        },
        {
            group: {
                name: "Female", 
                parent: {
                    name:  "15 or younger"               
                }
            },
            displayName: "Not Like", field: "4", editable: true, cellStyle: sizeCellStyle, newValueHandler: numberNewValueHandler,cellRenderer: editableCellRenderer
        },
        {            
            group: {
                name: "Male", 
                parent: {
                    name:  "over 15 years"               
                }
            },
            displayName: "Like", field: "5", editable: true, cellStyle: sizeCellStyle, newValueHandler: numberNewValueHandler,cellRenderer: editableCellRenderer
        },
        {
            group: {
                name: "Male", 
                parent: {
                    name:  "over 15 years"               
                }
            },
            displayName: "Not Like", field: "6", editable: true, cellStyle: sizeCellStyle, newValueHandler: numberNewValueHandler,cellRenderer: editableCellRenderer
        },
         {
            group: { 
                name:"Female",
                parent: {
                    name:  "over 15 years"               
                }
            },
            displayName: "Like", field: "7", editable: true, cellStyle: sizeCellStyle, newValueHandler: numberNewValueHandler,cellRenderer: editableCellRenderer
        },
        {
            group: {
                name: "Female", 
                parent: {
                    name:  "over 15 years"               
                }
            },
            displayName: "Not Like", field: "8", editable: true, cellStyle: sizeCellStyle, newValueHandler: numberNewValueHandler,cellRenderer: editableCellRenderer
        }
    ];

    var rowData = null;

    $scope.gridOptions = {
        columnDefs: columnDefs,
        colWidth: 100,
        enableSorting: true,
        enableColResize: true,
        groupHeaders: true, 
        icons: {
            filter: ' ',
            groupExpanded: '<i class="fa fa-minus-square-o"/>',
            groupContracted: '<i class="fa fa-plus-square-o"/>'
        },
        rowsAlreadyGrouped: false,
        rowClicked: rowClicked,
        rowData: rowData,
        rowHeight: 20,
        rowSelection: 'multiple'
    };

    $scope.selectedFile = 'Select a game below...';

    function rowClicked(params) {
        var node = params.node;
        var path = node.data.name;
        while (node.parent) {
            node = node.parent;
            path = node.data.name + '\\' + path;
        }
        $scope.selectedFile = path;
    }

    function sizeCellStyle() {
        return {'text-align': 'center'};
    }

    function groupInnerCellRenderer(params) {
        var image = params.node.level === 0 ? 'disk' : 'folder';
        if(params.data.icon)
            image=params.data.icon;

        if(!params.node.children&&!params.data.icon)
            image="cd";

        var imageFullUrl =  image + '.png';
        return '<img src="' + imageFullUrl + '" style="padding-left: 4px;  height: 15px;" /> ' + params.data.name;
    }

    function editableCellRenderer(params) {
        if (params.node.group)
            return '<span>*</span>';
        if(params.value==undefined)
           return "<span></span>";
        return '<span >' + params.value + '</span>';
    }

    function numberNewValueHandler(params) {
        var valueAsNumber = parseInt(params.newValue);
        if (isNaN(valueAsNumber)) {
            params.data[params.colDef.field] = 0;
        } else {
            params.data[params.colDef.field] = valueAsNumber;
        }
    }

    $scope.createRowData = function() {

        foreach=function(row) {
            columnDefs.forEach(function(column) {
             
                if(row.children)
                    row.children.forEach(foreach);
                else  if (row.data[column.field] == undefined)
                {
                    row.data[column.field] = parseInt(Math.random()*100,10);
                }

            });
        };
        $http.get("consoles.json").
                then(function(res) {
                    res.data.forEach(foreach);
                    $scope.gridOptions.rowData = res.data;
                    $scope.gridOptions.rowsAlreadyGrouped = true;
                    $scope.gridOptions.api.onNewRows();
                    $scope.resize();
                });
    }

    $scope.exportar = function() {
        alert("view javascript console")
        console.log($scope.gridOptions.rowData);
    }

    $scope.resize = function() {
        $scope.gridOptions.api.sizeColumnsToFit();
    };


    $(window).resize(function() {
        $scope.resize();
    });
    $scope.createRowData();

});
