define([], function() {

    // pipeline is: group -> filter -> sort -> map
    function RowModel() {
        this.allRows = null;
        this.rowsAfterGroup = null;
        this.rowsAfterFilter = null;
        this.rowsAfterSort = null;
        this.rowsAfterMap = null;
    }

    RowModel.prototype.setAllRows = function(allRows) { this.allRows = allRows; };

    // only used by row controller:
    RowModel.prototype.getAllRows = function() { return this.allRows; };
    RowModel.prototype.getRowsAfterGroup = function() { return this.rowsAfterGroup; };
    RowModel.prototype.setRowsAfterGroup = function(rowsAfterGroup) { this.rowsAfterGroup = rowsAfterGroup; };
    RowModel.prototype.getRowsAfterFilter = function() { return this.rowsAfterFilter; };
    RowModel.prototype.setRowsAfterFilter = function(rowsAfterFilter) { this.rowsAfterFilter = rowsAfterFilter; };
    RowModel.prototype.getRowsAfterSort = function() { return this.rowsAfterSort; };
    RowModel.prototype.setRowsAfterSort = function(rowsAfterSort) { this.rowsAfterSort = rowsAfterSort; };
    RowModel.prototype.setRowsAfterMap = function(rowsAfterMap) { this.rowsAfterMap = rowsAfterMap; };

    // used by angularGrid (when row clicked)
    // used by rowRenderer
    // used by selectionController
    RowModel.prototype.getVirtualRow = function(index) {
        return this.rowsAfterMap[index];
    };

    // used by angularGrid (to check if any rows, before setting the body size)
    // used by rowRenderer
    RowModel.prototype.getVirtualRowCount = function() {
        if (this.rowsAfterMap) {
            return this.rowsAfterMap.length;
        } else {
            return 0;
        }
    };

    return RowModel;

});