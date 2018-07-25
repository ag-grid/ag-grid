/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ChangedPath = (function () {
    function ChangedPath(keepingColumns) {
        this.active = true;
        this.nodeIdsToBoolean = {};
        this.nodeIdsToColumns = {};
        this.keepingColumns = keepingColumns;
    }
    ChangedPath.prototype.setInactive = function () {
        this.active = false;
    };
    ChangedPath.prototype.isActive = function () {
        return this.active;
    };
    ChangedPath.prototype.addParentNode = function (rowNode, columns) {
        var _this = this;
        this.validateActive();
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
        this.validateActive();
        return this.nodeIdsToBoolean[rowNode.id];
    };
    ChangedPath.prototype.getValueColumnsForNode = function (rowNode, valueColumns) {
        this.validateActive();
        if (!this.keepingColumns) {
            return valueColumns;
        }
        var colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        var result = valueColumns.filter(function (col) { return colsForThisNode[col.getId()]; });
        return result;
    };
    ChangedPath.prototype.getNotValueColumnsForNode = function (rowNode, valueColumns) {
        this.validateActive();
        if (!this.keepingColumns) {
            return null;
        }
        var colsForThisNode = this.nodeIdsToColumns[rowNode.id];
        var result = valueColumns.filter(function (col) { return !colsForThisNode[col.getId()]; });
        return result;
    };
    // this is to check for a bug in our code. each part that uses ChangePath should check
    // if it is valid first, and not use it if it is not valid
    ChangedPath.prototype.validateActive = function () {
        if (!this.active) {
            throw "ag-Grid: tried to work on an invalid changed path";
        }
    };
    return ChangedPath;
}());
exports.ChangedPath = ChangedPath;
