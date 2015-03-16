define(["./constants"], function(constants) {

    var DEFAULT_ROW_HEIGHT = 30;

    function GridOptionsWrapper(gridOptions) {
        this.gridOptions = gridOptions;
        this.setupDefaults();
    }

    function isTrue(value) {
        return value === true || value === 'true';
    }

    GridOptionsWrapper.prototype.isGroupHeaders = function() { return isTrue(this.gridOptions.groupHeaders); };
    GridOptionsWrapper.prototype.isDontUseScrolls = function() { return isTrue(this.gridOptions.dontUseScrolls); };
    GridOptionsWrapper.prototype.getRowStyle = function() { return this.gridOptions.rowStyle; };
    GridOptionsWrapper.prototype.getRowClass = function() { return this.gridOptions.rowClass; };
    GridOptionsWrapper.prototype.getGridOptions = function() { return this.gridOptions; };
    GridOptionsWrapper.prototype.getHeaderCellRenderer = function() { return this.gridOptions.headerCellRenderer; };
    GridOptionsWrapper.prototype.isEnableSorting = function() { return this.gridOptions.enableSorting; };
    GridOptionsWrapper.prototype.isEnableColResize = function() { return this.gridOptions.enableColResize; };
    GridOptionsWrapper.prototype.isEnableFilter = function() { return this.gridOptions.enableFilter; };
    GridOptionsWrapper.prototype.isGroupDefaultExpanded = function() { return isTrue(this.gridOptions.groupDefaultExpanded); };
    GridOptionsWrapper.prototype.getGroupKeys = function() { return this.gridOptions.groupKeys; };
    GridOptionsWrapper.prototype.getGroupIconRenderer = function() { return this.gridOptions.groupIconRenderer; };
    GridOptionsWrapper.prototype.getGroupAggFunction = function() { return this.gridOptions.groupAggFunction; };
    GridOptionsWrapper.prototype.getAllRows = function() { return this.gridOptions.rowData; };
    GridOptionsWrapper.prototype.isGroupUseEntireRow = function() { return isTrue(this.gridOptions.groupUseEntireRow); };
    GridOptionsWrapper.prototype.isAngularCompileRows = function() { return isTrue(this.gridOptions.angularCompileRows); };
    GridOptionsWrapper.prototype.isAngularCompileFilters = function() { return isTrue(this.gridOptions.angularCompileFilters); };
    GridOptionsWrapper.prototype.isAngularCompileHeaders = function() { return isTrue(this.gridOptions.angularCompileHeaders); };
    GridOptionsWrapper.prototype.getColumnDefs = function() { return this.gridOptions.columnDefs; };
    GridOptionsWrapper.prototype.getRowHeight = function() { return this.gridOptions.rowHeight; };
    GridOptionsWrapper.prototype.getCellClicked = function() { return this.gridOptions.cellClicked; };
    GridOptionsWrapper.prototype.getVirtualRowRemoved = function() { return this.gridOptions.virtualRowRemoved; };

    GridOptionsWrapper.prototype.getHeaderHeight = function() {
        if (this.gridOptions.headerHeight) {
            // if header height provided, used it
            return this.gridOptions.headerHeight;
        } else {
            // otherwise return 25 if no grouping, 50 if grouping
            if (this.isGroupHeaders()) {
                return 50;
            } else {
                return 25;
            }
        }
    };

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

    GridOptionsWrapper.prototype.getPinnedColCount = function() {
        // if not using scrolls, then pinned columns doesn't make
        // sense, so always return 0
        if (this.isDontUseScrolls()) {
            return 0;
        }
        if (this.gridOptions.pinnedColumnCount) {
            //in case user puts in a string, cast to number
            return Number(this.gridOptions.pinnedColumnCount);
        } else {
            return 0;
        }
    };

    return GridOptionsWrapper;

});