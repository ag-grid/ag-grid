/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var columnGroup_1 = require("../entities/columnGroup");
var originalColumnGroup_1 = require("../entities/originalColumnGroup");
// takes in a list of columns, as specified by the column definitions, and returns column groups
var ColumnUtils = (function () {
    function ColumnUtils() {
    }
    ColumnUtils.prototype.init = function (gridOptionsWrapper) {
        this.gridOptionsWrapper = gridOptionsWrapper;
    };
    ColumnUtils.prototype.calculateColInitialWidth = function (colDef) {
        if (!colDef.width) {
            // if no width defined in colDef, use default
            return this.gridOptionsWrapper.getColWidth();
        }
        else if (colDef.width < this.gridOptionsWrapper.getMinColWidth()) {
            // if width in col def to small, set to min width
            return this.gridOptionsWrapper.getMinColWidth();
        }
        else {
            // otherwise use the provided width
            return colDef.width;
        }
    };
    ColumnUtils.prototype.getPathForColumn = function (column, allDisplayedColumnGroups) {
        var result = [];
        var found = false;
        recursePath(allDisplayedColumnGroups, 0);
        // we should always find the path, but in case there is a bug somewhere, returning null
        // will make it fail rather than provide a 'hard to track down' bug
        if (found) {
            return result;
        }
        else {
            return null;
        }
        function recursePath(balancedColumnTree, dept) {
            for (var i = 0; i < balancedColumnTree.length; i++) {
                if (found) {
                    // quit the search, so 'result' is kept with the found result
                    return;
                }
                var node = balancedColumnTree[i];
                if (node instanceof columnGroup_1.default) {
                    var nextNode = node;
                    recursePath(nextNode.getChildren(), dept + 1);
                    result[dept] = node;
                }
                else {
                    if (node === column) {
                        found = true;
                    }
                }
            }
        }
    };
    ColumnUtils.prototype.deptFirstOriginalTreeSearch = function (tree, callback) {
        var _this = this;
        if (!tree) {
            return;
        }
        tree.forEach(function (child) {
            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
                _this.deptFirstOriginalTreeSearch(child.getChildren(), callback);
            }
            callback(child);
        });
    };
    ColumnUtils.prototype.deptFirstAllColumnTreeSearch = function (tree, callback) {
        var _this = this;
        if (!tree) {
            return;
        }
        tree.forEach(function (child) {
            if (child instanceof columnGroup_1.default) {
                _this.deptFirstAllColumnTreeSearch(child.getChildren(), callback);
            }
            callback(child);
        });
    };
    ColumnUtils.prototype.deptFirstDisplayedColumnTreeSearch = function (tree, callback) {
        var _this = this;
        if (!tree) {
            return;
        }
        tree.forEach(function (child) {
            if (child instanceof columnGroup_1.default) {
                _this.deptFirstDisplayedColumnTreeSearch(child.getDisplayedChildren(), callback);
            }
            callback(child);
        });
    };
    return ColumnUtils;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ColumnUtils;
