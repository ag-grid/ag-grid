/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.0-alpha.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var constants_1 = require('../constants');
// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
// This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
// appear as a child of either the original tree or the displayed tree. However the relevant group classes
// for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
// can only appear in OriginalColumn tree).
var Column = (function () {
    function Column(colDef, actualWidth, colId) {
        this.colDef = colDef;
        this.actualWidth = actualWidth;
        this.visible = !colDef.hide;
        this.sort = colDef.sort;
        this.sortedAt = colDef.sortedAt;
        this.colId = colId;
        if (colDef.pinned === true || colDef.pinned === 'left') {
            this.pinned = 'left';
        }
        else if (colDef.pinned === 'right') {
            this.pinned = 'right';
        }
    }
    Column.prototype.getSort = function () {
        return this.sort;
    };
    Column.prototype.setSort = function (sort) {
        this.sort = sort;
    };
    Column.prototype.getSortedAt = function () {
        return this.sortedAt;
    };
    Column.prototype.setSortedAt = function (sortedAt) {
        this.sortedAt = sortedAt;
    };
    Column.prototype.setAggFunc = function (aggFunc) {
        this.aggFunc = aggFunc;
    };
    Column.prototype.getAggFunc = function () {
        return this.aggFunc;
    };
    Column.prototype.getIndex = function () {
        return this.index;
    };
    Column.prototype.setIndex = function (index) {
        this.index = index;
    };
    Column.prototype.setPinned = function (pinned) {
        if (pinned === true || pinned === Column.PINNED_LEFT) {
            this.pinned = Column.PINNED_LEFT;
        }
        else if (pinned === Column.PINNED_RIGHT) {
            this.pinned = Column.PINNED_RIGHT;
        }
        else {
            this.pinned = null;
        }
    };
    Column.prototype.isPinned = function () {
        return this.pinned === Column.PINNED_LEFT || this.pinned === Column.PINNED_RIGHT;
    };
    Column.prototype.getPinned = function () {
        return this.pinned;
    };
    Column.prototype.setVisible = function (visible) {
        this.visible = visible === true;
    };
    Column.prototype.isVisible = function () {
        return this.visible;
    };
    Column.prototype.getColDef = function () {
        return this.colDef;
    };
    Column.prototype.getColumnGroupShow = function () {
        return this.colDef.columnGroupShow;
    };
    Column.prototype.getColId = function () {
        return this.colId;
    };
    Column.prototype.getDefinition = function () {
        return this.colDef;
    };
    Column.prototype.getActualWidth = function () {
        return this.actualWidth;
    };
    Column.prototype.setActualWidth = function (actualWidth) {
        this.actualWidth = actualWidth;
    };
    Column.prototype.isGreaterThanMax = function (width) {
        if (this.colDef.maxWidth >= constants_1.default.MIN_COL_WIDTH) {
            return width > this.colDef.maxWidth;
        }
        else {
            return false;
        }
    };
    Column.prototype.getMinimumWidth = function () {
        return Math.max(this.colDef.minWidth, constants_1.default.MIN_COL_WIDTH);
    };
    Column.prototype.setMinimum = function () {
        this.actualWidth = this.getMinimumWidth();
    };
    Column.PINNED_RIGHT = 'right';
    Column.PINNED_LEFT = 'left';
    Column.AGG_SUM = 'sum';
    Column.AGG_MIN = 'min';
    Column.AGG_MAX = 'max';
    Column.SORT_ASC = 'asc';
    Column.SORT_DESC = 'desc';
    return Column;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Column;
