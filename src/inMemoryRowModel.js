define([], function() {

    // pipeline is: group -> filter -> sort -> map
    function InMemoryRowModel() {
        this.allRows = null;
        this.rowsAfterGroup = null;
        this.rowsAfterFilter = null;
        this.rowsAfterSort = null;
        this.rowsAfterMap = null;
    }

    InMemoryRowModel.prototype.setAllRows = function(allRows) { this.allRows = allRows; };

    // only used by row controller:
    InMemoryRowModel.prototype.getAllRows = function() { return this.allRows; };
    InMemoryRowModel.prototype.getRowsAfterGroup = function() { return this.rowsAfterGroup; };
    InMemoryRowModel.prototype.setRowsAfterGroup = function(rowsAfterGroup) { this.rowsAfterGroup = rowsAfterGroup; };
    InMemoryRowModel.prototype.getRowsAfterFilter = function() { return this.rowsAfterFilter; };
    InMemoryRowModel.prototype.setRowsAfterFilter = function(rowsAfterFilter) { this.rowsAfterFilter = rowsAfterFilter; };
    InMemoryRowModel.prototype.getRowsAfterSort = function() { return this.rowsAfterSort; };
    InMemoryRowModel.prototype.setRowsAfterSort = function(rowsAfterSort) { this.rowsAfterSort = rowsAfterSort; };
    InMemoryRowModel.prototype.setRowsAfterMap = function(rowsAfterMap) { this.rowsAfterMap = rowsAfterMap; };

    // used by angularGrid (when row clicked)
    // used by rowRenderer
    // used by selectionController
    InMemoryRowModel.prototype.getVirtualRow = function(index) {
        return this.rowsAfterMap[index];
    };

    // used by angularGrid (to check if any rows, before setting the body size)
    // used by rowRenderer
    InMemoryRowModel.prototype.getVirtualRowCount = function() {
        if (this.rowsAfterMap) {
            return this.rowsAfterMap.length;
        } else {
            return 0;
        }
    };

    return InMemoryRowModel;

});