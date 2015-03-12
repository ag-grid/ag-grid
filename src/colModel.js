define(['./constants'], function(constants) {

    function ColModel() {
    }

    ColModel.prototype.setColumnDefs = function (columnDefs, pinnedColCount) {
        this.pinnedColumnCount = pinnedColCount;
        var colDefWrappers = [];
        if (columnDefs) {
            columnDefs.forEach(function (colDef, index) {
                var newColDefWrapper = new ColDefWrapper(colDef, index);
                colDefWrappers.push(newColDefWrapper);
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
        this.colDefWrappers.forEach(function (colDefWrapper) {
            var colDef = colDefWrapper.colDef;
            if (colDefWrapper.actualWidth) {
                // if actual width already set, do nothing
                return;
            } else if (!colDef.width) {
                // if no width defined in colDef, default to 200
                colDefWrapper.actualWidth = 200;
            } else if (colDef.width < constants.MIN_COL_WIDTH) {
                // if width in col def to small, set to min width
                colDefWrapper.actualWidth = constants.MIN_COL_WIDTH;
            } else {
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