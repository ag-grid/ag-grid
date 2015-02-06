define(["./constants"], function(constants) {

    var DEFAULT_ROW_HEIGHT = 30;

    function GridOptionsWrapper(gridOptions) {
        this.gridOptions = gridOptions;
        this.setupDefaults();
    }

    GridOptionsWrapper.prototype.getRowClass = function() { return this.gridOptions.rowClass; };
    GridOptionsWrapper.prototype.getGridOptions = function() { return this.gridOptions; };
    GridOptionsWrapper.prototype.getHeaderCellRenderer = function() { return this.gridOptions.headerCellRenderer; };
    GridOptionsWrapper.prototype.isEnableSorting = function() { return this.gridOptions.enableSorting; };
    GridOptionsWrapper.prototype.isEnableColResize = function() { return this.gridOptions.enableColResize; };
    GridOptionsWrapper.prototype.isEnableFilter = function() { return this.gridOptions.enableFilter; };
    GridOptionsWrapper.prototype.isGroupDefaultExpanded = function() { return this.gridOptions.groupDefaultExpanded === true; };
    GridOptionsWrapper.prototype.getGroupKeys = function() { return this.gridOptions.groupKeys; };
    GridOptionsWrapper.prototype.getAggFunction = function() { return this.gridOptions.aggFunction; };
    GridOptionsWrapper.prototype.getAllRows = function() { return this.gridOptions.rowData; };
    GridOptionsWrapper.prototype.isGroupUseEntireRow = function() { return this.gridOptions.groupUseEntireRow===true; };
    GridOptionsWrapper.prototype.isAngularCompile = function() { return this.gridOptions.angularCompile===true; };
    GridOptionsWrapper.prototype.getColumnDefs = function() { return this.gridOptions.columnDefs; };
    GridOptionsWrapper.prototype.getRowHeight = function() { return this.gridOptions.rowHeight; };
    GridOptionsWrapper.prototype.getCellClicked = function() { return this.gridOptions.cellClicked; };
    GridOptionsWrapper.prototype.getVirtualRowRemoved = function() { return this.gridOptions.virtualRowRemoved; };

    GridOptionsWrapper.prototype.isColumDefsPresent = function() {
        return this.gridOptions.columnDefs && this.gridOptions.columnDefs.length!=0;
    };

    GridOptionsWrapper.prototype.setupDefaults = function() {
        if (!this.gridOptions.rowHeight) {
            this.gridOptions.rowHeight = DEFAULT_ROW_HEIGHT;
        }
    };

    GridOptionsWrapper.prototype.clearSelection = function () {
        this.gridOptions.selectedRows.length = 0;
    };

    GridOptionsWrapper.prototype.ensureEachColHasSize = function () {
        if (!this.isColumDefsPresent()) { return; }

        this.gridOptions.columnDefs.forEach(function (colDef) {
            if (!colDef.width) {
                colDef.actualWidth = 200;
            } else if (colDef.width < 10) {
                colDef.actualWidth = constants.MIN_COL_WIDTH;
            } else {
                colDef.actualWidth = colDef.width;
            }
        });
    };

    GridOptionsWrapper.prototype.getTotalUnpinnedColWidth = function() {
        var widthSoFar = 0;
        var pinnedColCount = this.getPinnedColCount();

        this.gridOptions.columnDefs.forEach(function(colDef, index) {
            if (index>=pinnedColCount) {
                widthSoFar += colDef.actualWidth;
            }
        });

        return widthSoFar;
    };

    GridOptionsWrapper.prototype.getPinnedColCount = function() {
        if (this.gridOptions.pinnedColumnCount) {
            //in case user puts in a string, cast to number
            return Number(this.gridOptions.pinnedColumnCount);
        } else {
            return 0;
        }
    };

    return GridOptionsWrapper;

});