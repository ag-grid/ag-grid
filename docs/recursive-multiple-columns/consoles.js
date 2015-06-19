var consolesModule = angular.module('consoles', ['angularGrid']);

consolesModule.controller('consolesController', function($scope, $http) {  
$http.defaults.cache=false;
    var rowData = null;

	
    $scope.gridOptions = {
        columnDefs: [],
        enableSorting: true,
        enableColResize: true,
        groupHeaders: true, 
        icons: {
            groupExpanded: '<i class="fa fa-minus-square-o"/>',
            groupContracted: '<i class="fa fa-plus-square-o"/>'
        },
        rowsAlreadyGrouped: false,
        rowClicked: rowClicked,
        rowData: rowData,
        rowHeight: 20,
        rowSelection: 'single',
		groupAggFunction: groupAggFunction,
		angularCompileRows: true,"groupKeys":["grupo1","grupo2"],
		pinnedColumnCount: 1

		

    };

    $scope.selectedFile = 'Select a game below...';

    function rowClicked(params) {
        var node = params.node;
        
		var out=(!node.key)?params.data.name:node.key;
		var path=(!out)?node.field:out;
		
		
        while (node.parent) {
            node = node.parent;
			out=(!node.key)?params.data.name:node.key;
            path = ((!out)?node.field:out) + '\\' + path;
        }
        $scope.selectedFile = path;
    }

    function sizeCellStyle() {
        return {'text-align': 'center'};
    }

    function groupInnerCellRenderer(params,index) {
        var image = params.node.level === 0 ? 'disk' : 'folder';
        if(params.data.icon)
            image=params.data.icon;

        if(!params.node.children&&!params.data.icon)
            image="cd";

        var imageFullUrl =  image + '.png';
		
		var out=params.value;
		if(!out)
		out=params.node.key;
		if(!out)
		out=params.node.field;
		
		
        return '<img src="' + imageFullUrl + '" style="padding-left: 4px;  height: 15px;" />  ' +out;
    }

    function editableCellRenderer(params) {      
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
	
	function groupAggFunction(nodes) {
		var colsToSum = $scope.colsToSum;		
		var sums = {};
		colsToSum.forEach(function(key) { sums[key] = 0; });

		nodes.forEach(function(node) {
			colsToSum.forEach(function(key) {
				sums[key] += parseInt(node.data[key]);
			});
		});

		return sums;
	}

    $scope.createRowData = function() {
	
        foreach=function(row) {
            $scope.gridOptions.columnDefs.forEach(function(column) { 					
                if(!row[column.field]){
                    row[column.field] = parseInt(Math.random()*100,10);
                }
            });
        };        
		$scope.colsToSum=[];
		$http.get("columns.json").
			then(function(res) {
			console.log(res);
				res.data.forEach(function(column){
					if(column.cellRenderer&&column.cellRenderer.innerRenderer){
						column.cellRenderer.innerRenderer=groupInnerCellRenderer;			
					}else
					if(column.editable){
						$scope.colsToSum.push(column.field);
						column.cellValueChanged = function() {
							$scope.gridOptions.api.recomputeAggregates();
						}						
					}
					
				});
				$scope.gridOptions.columnDefs = res.data;
				
				$scope.gridOptions.api.onNewCols();
				$http.get("consoles.json").
					then(function(resp) {
						resp.data.forEach(foreach);
						$scope.gridOptions.rowData = resp.data;						
						$scope.gridOptions.api.onNewRows();
						
					});
			});
    }

    $scope.exportar = function() {
        alert("view javascript console")
        console.log($scope.gridOptions.rowData);
    }

    $scope.resize = function() {
        $scope.gridOptions.api.sizeColumnsToFit();
    };
	
    $scope.createRowData();

});

