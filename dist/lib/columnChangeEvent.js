/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.2.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var ColumnChangeEvent = (function () {
    function ColumnChangeEvent(type) {
        this.type = type;
    }
    ColumnChangeEvent.prototype.toString = function () {
        var result = 'ColumnChangeEvent {type: ' + this.type;
        if (this.column) {
            result += ', column: ' + this.column.getColId();
        }
        if (this.columnGroup) {
            result += ', columnGroup: ' + this.columnGroup.getColGroupDef() ? this.columnGroup.getColGroupDef().headerName : '(not defined]';
        }
        if (this.toIndex) {
            result += ', toIndex: ' + this.toIndex;
        }
        if (this.visible) {
            result += ', visible: ' + this.visible;
        }
        if (this.pinned) {
            result += ', pinned: ' + this.pinned;
        }
        if (typeof this.finished == 'boolean') {
            result += ', finished: ' + this.finished;
        }
        result += '}';
        return result;
    };
    ColumnChangeEvent.prototype.withPinned = function (pinned) {
        this.pinned = pinned;
        return this;
    };
    ColumnChangeEvent.prototype.withVisible = function (visible) {
        this.visible = visible;
        return this;
    };
    ColumnChangeEvent.prototype.isVisible = function () {
        return this.visible;
    };
    ColumnChangeEvent.prototype.getPinned = function () {
        return this.pinned;
    };
    ColumnChangeEvent.prototype.withColumn = function (column) {
        this.column = column;
        return this;
    };
    ColumnChangeEvent.prototype.withColumns = function (columns) {
        this.columns = columns;
        return this;
    };
    ColumnChangeEvent.prototype.withFinished = function (finished) {
        this.finished = finished;
        return this;
    };
    ColumnChangeEvent.prototype.withColumnGroup = function (columnGroup) {
        this.columnGroup = columnGroup;
        return this;
    };
    ColumnChangeEvent.prototype.withToIndex = function (toIndex) {
        this.toIndex = toIndex;
        return this;
    };
    ColumnChangeEvent.prototype.getToIndex = function () {
        return this.toIndex;
    };
    ColumnChangeEvent.prototype.getType = function () {
        return this.type;
    };
    ColumnChangeEvent.prototype.getColumn = function () {
        return this.column;
    };
    ColumnChangeEvent.prototype.getColumns = function () {
        return this.columns;
    };
    ColumnChangeEvent.prototype.getColumnGroup = function () {
        return this.columnGroup;
    };
    ColumnChangeEvent.prototype.isFinished = function () {
        return this.finished;
    };
    return ColumnChangeEvent;
})();
exports.ColumnChangeEvent = ColumnChangeEvent;
