define([], function() {

    // pipeline is: group -> filter -> sort -> map
    function RowModel() {
        this.allRows = null;
        this.rowsAfterGroup = null;
        this.rowsAfterFilter = null;
        this.rowsAfterSort = null;
        this.rowsAfterMap = null;
    }

    RowModel.prototype.getAllRows = function() { return this.allRows; };
    RowModel.prototype.setAllRows = function(allRows) { this.allRows = allRows; };

    RowModel.prototype.getRowsAfterGroup = function() { return this.rowsAfterGroup; };
    RowModel.prototype.setRowsAfterGroup = function(rowsAfterGroup) { this.rowsAfterGroup = rowsAfterGroup; };

    RowModel.prototype.getRowsAfterFilter = function() { return this.rowsAfterFilter; };
    RowModel.prototype.setRowsAfterFilter = function(rowsAfterFilter) { this.rowsAfterFilter = rowsAfterFilter; };

    RowModel.prototype.getRowsAfterSort = function() { return this.rowsAfterSort; };
    RowModel.prototype.setRowsAfterSort = function(rowsAfterSort) { this.rowsAfterSort = rowsAfterSort; };

    RowModel.prototype.getRowsAfterMap = function() { return this.rowsAfterMap; };
    RowModel.prototype.setRowsAfterMap = function(rowsAfterMap) { this.rowsAfterMap = rowsAfterMap; };

    // returns the virtual row index, or -1 if the row is not currently displayed (due to mapping,
    // ie the group it belongs to isn't visible)
    RowModel.prototype.getVirtualIndex = function(row) {
        return this.rowsAfterMap.indexOf(row);
    };

    RowModel.prototype.getVirtualRow = function(index) {
        return this.rowsAfterMap[index];
    };

    return RowModel;

});