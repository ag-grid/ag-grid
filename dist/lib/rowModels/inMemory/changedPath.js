/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChangedPath = (function () {
    function ChangedPath(keepingColumns) {
        this.nodeIdsToBoolean = {};
        this.nodeIdsToColumns = {};
        this.keepingColumns = keepingColumns;
    }
    ChangedPath.prototype.addParentNode = function (rowNode, columns) {
        var _this = this;
        var pointer = rowNode;
        while (pointer) {
            // add this item to the path, all the way to parent
            this.nodeIdsToBoolean[pointer.id] = true;
            // if columns, add the columns in all the way to parent, merging
            // in any other columns that might be there already
            if (this.keepingColumns && columns) {
                if (!this.nodeIdsToColumns[pointer.id]) {
                    this.nodeIdsToColumns[pointer.id] = {};
                }
                columns.forEach(function (col) { return _this.nodeIdsToColumns[pointer.id][col.getId()] = true; });
            }
            pointer = pointer.parent;
        }
    };
    ChangedPath.prototype.isInPath = function (rowNode) {
        return this.nodeIdsToBoolean[rowNode.id];
    };
    ChangedPath.prototype.getValueColumnsForNode = function (rowNode, valueColumns) {
        if (!this.keepingColumns) {
            return valueColumns;
        }
        var colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        var result = valueColumns.filter(function (col) { return colsForThisNode[col.getId()]; });
        return result;
    };
    ChangedPath.prototype.getNotValueColumnsForNode = function (rowNode, valueColumns) {
        if (!this.keepingColumns) {
            return null;
        }
        var colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        var result = valueColumns.filter(function (col) { return !colsForThisNode[col.getId()]; });
        return result;
    };
    return ChangedPath;
}());
exports.ChangedPath = ChangedPath;
