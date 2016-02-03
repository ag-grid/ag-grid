/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.0-alpha.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var constants_1 = require('../constants');
var columnGroup_1 = require("../entities/columnGroup");
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
        else if (colDef.width < constants_1.default.MIN_COL_WIDTH) {
            // if width in col def to small, set to min width
            return constants_1.default.MIN_COL_WIDTH;
        }
        else {
            // otherwise use the provided width
            return colDef.width;
        }
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
