define(['./constants'], function(constants) {

    function ColModel() {
    }

    ColModel.prototype.init = function (angularGrid, selectionRendererFactory) {
        this.angularGrid = angularGrid;
        this.selectionRendererFactory = selectionRendererFactory;
    };

    ColModel.prototype.setColumnDefs = function (columnDefs, pinnedColCount, gridDivWidth) {
        this.pinnedColumnCount = pinnedColCount;
        this.gridDivWidth = gridDivWidth;
        var colDefWrappers = [];

        var that = this;
        if (columnDefs) {
            columnDefs.forEach(function (colDef, index) {
                if (colDef === 'checkboxSelection') {
                    colDef = that.selectionRendererFactory.createCheckboxColDef();
                }
                var colDefWrapper = new ColDefWrapper(colDef, index);
                colDefWrappers.push(colDefWrapper);
            });
        }
        this.colDefWrappers = colDefWrappers;
        this.ensureEachColHasSize();
    };

    ColModel.prototype.getColDefWrappers = function () {
        return this.colDefWrappers;
    };

    // set the actual widths for each col
    ColModel.prototype.ensureEachColHasSize = function () {
        var numberOfColumns = this.colDefWrappers.length;
        var gridDivWidth = this.gridDivWidth;
        this.colDefWrappers.forEach(function (colDefWrapper) {
            var colDef = colDefWrapper.colDef;
            if (colDefWrapper.actualWidth) {
                // if actual width already set, do nothing
                return;
            } else if (!colDef.width) {
                //set width based on the size of the grid             
                if (gridDivWidth) {
                    colDefWrapper.actualWidth = gridDivWidth / numberOfColumns;
                } else {
                    // if no width defined in colDef, default to 200
                    colDefWrapper.actualWidth = constants.DEFAULT_COL_WIDTH;
                }
            } else if (colDef.width < constants.MIN_COL_WIDTH) {
                // if width in col def to small, set to min width
                colDefWrapper.actualWidth = constants.MIN_COL_WIDTH;
            } else if (colDef.width) {
                // otherwise use the provided width
                colDefWrapper.actualWidth = colDef.width;
            }
        });
    };

    ColModel.prototype.getTotalUnpinnedColWidth = function() {
        return this.getTotalColWidth(false);
    };

    ColModel.prototype.getTotalPinnedColWidth = function() {
        return this.getTotalColWidth(true);
    };

    ColModel.prototype.getDisplayedColCount = function(includePinned) {
        return this.colDefWrappers.length;
    };

    ColModel.prototype.getTotalColWidth = function(includePinned) {
        var widthSoFar = 0;
        var pinnedColCount = this.pinnedColumnCount;

        this.colDefWrappers.forEach(function(colDefWrapper, index) {
            var columnIsPined = index<pinnedColCount;
            var includeThisCol = columnIsPined === includePinned;
            if (includeThisCol) {
                widthSoFar += colDefWrapper.actualWidth;
            }
        });

        return widthSoFar;
    };

    function ColDefWrapper(colDef, colKey) {
        this.colDef = colDef;
        this.colKey = colKey;
    }

    return ColModel;

});