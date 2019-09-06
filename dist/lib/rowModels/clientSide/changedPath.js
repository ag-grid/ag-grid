/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// when doing transactions, or change detection, and grouping is present
// in the data, there is no need for the ClientSideRowModel to update each
// group after an update, ony parts that were impacted by the change.
// this class keeps track of all groups that were impacted by a transaction.
// the the different CSRM operations (filter, sort etc) use the forEach method
// to visit each group that was changed.
var ChangedPath = /** @class */ (function () {
    function ChangedPath(keepingColumns, rootNode) {
        // whether changed path is active of not. it is active when a) doing
        // a transaction update or b) doing change detection. if we are doing
        // a CSRM refresh for other reasons (after sort or filter, or user calling
        // setRowData() without delta mode) then we are not active. we are also
        // marked as not active if secondary columns change in pivot (as this impacts
        // aggregations)
        this.active = true;
        // for each node in the change path, we also store which columns need
        // to be re-aggregated.
        this.nodeIdsToColumns = {};
        // for quick lookup, all items in the change path are mapped by nodeId
        this.mapToItems = {};
        this.keepingColumns = keepingColumns;
        this.pathRoot = {
            rowNode: rootNode,
            children: null
        };
        this.mapToItems[rootNode.id] = this.pathRoot;
    }
    // can be set inactive by:
    // a) ClientSideRowModel, if no transactions or
    // b) PivotService, if secondary columns changed
    ChangedPath.prototype.setInactive = function () {
        this.active = false;
    };
    ChangedPath.prototype.isActive = function () {
        return this.active;
    };
    ChangedPath.prototype.depthFirstSearchChangedPath = function (pathItem, callback) {
        if (pathItem.children) {
            for (var i = 0; i < pathItem.children.length; i++) {
                this.depthFirstSearchChangedPath(pathItem.children[i], callback);
            }
        }
        callback(pathItem.rowNode);
    };
    ChangedPath.prototype.depthFirstSearchEverything = function (rowNode, callback, traverseEverything) {
        if (rowNode.childrenAfterGroup) {
            for (var i = 0; i < rowNode.childrenAfterGroup.length; i++) {
                var childNode = rowNode.childrenAfterGroup[i];
                if (childNode.childrenAfterGroup) {
                    this.depthFirstSearchEverything(rowNode.childrenAfterGroup[i], callback, traverseEverything);
                }
                else if (traverseEverything) {
                    callback(childNode);
                }
            }
        }
        callback(rowNode);
    };
    // traverseLeafNodes -> used when NOT doing changed path, ie traversing everything. the callback
    // will be called for child nodes in addition to parent nodes.
    ChangedPath.prototype.forEachChangedNodeDepthFirst = function (callback, traverseLeafNodes) {
        if (traverseLeafNodes === void 0) { traverseLeafNodes = false; }
        if (this.active) {
            // if we are active, then use the change path to callback
            // only for updated groups
            this.depthFirstSearchChangedPath(this.pathRoot, callback);
        }
        else {
            // we are not active, so callback for everything, walk the entire path
            this.depthFirstSearchEverything(this.pathRoot.rowNode, callback, traverseLeafNodes);
        }
    };
    ChangedPath.prototype.executeFromRootNode = function (callback) {
        callback(this.pathRoot.rowNode);
    };
    ChangedPath.prototype.createPathItems = function (rowNode) {
        var pointer = rowNode;
        var newEntryCount = 0;
        while (!this.mapToItems[pointer.id]) {
            var newEntry = {
                rowNode: pointer,
                children: null
            };
            this.mapToItems[pointer.id] = newEntry;
            newEntryCount++;
            pointer = pointer.parent;
        }
        return newEntryCount;
    };
    ChangedPath.prototype.populateColumnsMap = function (rowNode, columns) {
        var _this = this;
        if (!this.keepingColumns || !columns) {
            return;
        }
        var pointer = rowNode;
        while (pointer) {
            // if columns, add the columns in all the way to parent, merging
            // in any other columns that might be there already
            if (!this.nodeIdsToColumns[pointer.id]) {
                this.nodeIdsToColumns[pointer.id] = {};
            }
            columns.forEach(function (col) { return _this.nodeIdsToColumns[pointer.id][col.getId()] = true; });
            pointer = pointer.parent;
        }
    };
    ChangedPath.prototype.linkPathItems = function (rowNode, newEntryCount) {
        var pointer = rowNode;
        for (var i = 0; i < newEntryCount; i++) {
            var thisItem = this.mapToItems[pointer.id];
            var parentItem = this.mapToItems[pointer.parent.id];
            if (!parentItem.children) {
                parentItem.children = [];
            }
            parentItem.children.push(thisItem);
            pointer = pointer.parent;
        }
    };
    // called by
    // 1) change detection (provides cols) and
    // 2) groupStage if doing transaction update (doesn't provide cols)
    ChangedPath.prototype.addParentNode = function (rowNode, columns) {
        // we cannot do  both steps below in the same loop as
        // the second loop has a dependency on the first loop.
        // ie the hierarchy cannot be stitched up yet because
        // we don't have it built yet
        // create the new PathItem objects.
        var newEntryCount = this.createPathItems(rowNode);
        // link in the node items
        this.linkPathItems(rowNode, newEntryCount);
        // update columns
        this.populateColumnsMap(rowNode, columns);
    };
    ChangedPath.prototype.canSkip = function (rowNode) {
        return this.active && !this.mapToItems[rowNode.id];
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
