define(['constants'], function(constants) {

    function ColModel(columnDefs) {
    }

    ColModel.prototype.setColumnDefs = function (columnDefs) {
        var colDefWrappers = [];
        if (columnDefs) {
            columnDefs.forEach( function (colDef, index) {
                var newColDefWrapper = new ColDefWrapper(colDef);
                colDefWrappers.push(newColDefWrapper, index);
            });
        }
        this.colDefWrappers = colDefWrappers;
        this.ensureEachColHasSize();
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

    function ColDefWrapper(colDef, index) {
        this.colDef = colDef;
        this.index = index;
    }

    return ColModel;

});