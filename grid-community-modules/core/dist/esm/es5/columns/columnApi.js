var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Autowired, Bean } from "../context/context";
import { warnOnce } from "../utils/function";
/** @deprecated Use methods via the grid api instead. */
var ColumnApi = /** @class */ (function () {
    function ColumnApi(gridAp) {
        var _this = this;
        this.viaApi = function (funcName) {
            var _a;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            warnOnce("Since v31, 'columnApi.".concat(funcName, "' is deprecated and moved to 'api.").concat(funcName, "'."));
            return (_a = _this.api)[funcName].apply(_a, __spreadArray([], __read(args), false));
        };
        this.api = gridAp;
    }
    /** @deprecated v31 use `api.sizeColumnsToFit()` instead.   */
    ColumnApi.prototype.sizeColumnsToFit = function (gridWidth) { this.viaApi('sizeColumnsToFit', gridWidth); };
    /** @deprecated v31 use `api.setColumnGroupOpened() instead. */
    ColumnApi.prototype.setColumnGroupOpened = function (group, newValue) { this.viaApi('setColumnGroupOpened', group, newValue); };
    /** @deprecated v31 use `api.getColumnGroup() instead. */
    ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this.viaApi('getColumnGroup', name, instanceId); };
    /** @deprecated v31 use `api.getProvidedColumnGroup() instead. */
    ColumnApi.prototype.getProvidedColumnGroup = function (name) { return this.viaApi('getProvidedColumnGroup', name); };
    /** @deprecated v31 use `api.getDisplayNameForColumn() instead. */
    ColumnApi.prototype.getDisplayNameForColumn = function (column, location) { return this.viaApi('getDisplayNameForColumn', column, location); };
    /** @deprecated v31 use `api.getDisplayNameForColumnGroup() instead. */
    ColumnApi.prototype.getDisplayNameForColumnGroup = function (columnGroup, location) { return this.viaApi('getDisplayNameForColumnGroup', columnGroup, location); };
    /** @deprecated v31 use `api.getColumn() instead. */
    ColumnApi.prototype.getColumn = function (key) { return this.viaApi('getColumn', key); };
    /** @deprecated v31 use `api.getColumns() instead. */
    ColumnApi.prototype.getColumns = function () { return this.viaApi('getColumns'); };
    /** @deprecated v31 use `api.applyColumnState() instead. */
    ColumnApi.prototype.applyColumnState = function (params) { return this.viaApi('applyColumnState', params); };
    /** @deprecated v31 use `api.getColumnState() instead. */
    ColumnApi.prototype.getColumnState = function () { return this.viaApi('getColumnState'); };
    /** @deprecated v31 use `api.resetColumnState() instead. */
    ColumnApi.prototype.resetColumnState = function () { this.viaApi('resetColumnState'); };
    /** @deprecated v31 use `api.getColumnGroupState() instead. */
    ColumnApi.prototype.getColumnGroupState = function () { return this.viaApi('getColumnGroupState'); };
    /** @deprecated v31 use `api.setColumnGroupState() instead. */
    ColumnApi.prototype.setColumnGroupState = function (stateItems) { this.viaApi('setColumnGroupState', stateItems); };
    /** @deprecated v31 use `api.resetColumnGroupState() instead. */
    ColumnApi.prototype.resetColumnGroupState = function () { this.viaApi('resetColumnGroupState'); };
    /** @deprecated v31 use `api.isPinning() instead. */
    ColumnApi.prototype.isPinning = function () { return this.viaApi('isPinning'); };
    /** @deprecated v31 use `api.isPinningLeft() instead. */
    ColumnApi.prototype.isPinningLeft = function () { return this.viaApi('isPinningLeft'); };
    /** @deprecated v31 use `api.isPinningRight() instead. */
    ColumnApi.prototype.isPinningRight = function () { return this.viaApi('isPinningRight'); };
    /** @deprecated v31 use `api.getDisplayedColAfter() instead. */
    ColumnApi.prototype.getDisplayedColAfter = function (col) { return this.viaApi('getDisplayedColAfter', col); };
    /** @deprecated v31 use `api.getDisplayedColBefore() instead. */
    ColumnApi.prototype.getDisplayedColBefore = function (col) { return this.viaApi('getDisplayedColBefore', col); };
    /** @deprecated v31 use `api.setColumnVisible() instead. */
    ColumnApi.prototype.setColumnVisible = function (key, visible) { this.viaApi('setColumnVisible', key, visible); };
    /** @deprecated v31 use `api.setColumnsVisible() instead. */
    ColumnApi.prototype.setColumnsVisible = function (keys, visible) { this.viaApi('setColumnsVisible', keys, visible); };
    /** @deprecated v31 use `api.setColumnPinned() instead. */
    ColumnApi.prototype.setColumnPinned = function (key, pinned) { this.viaApi('setColumnPinned', key, pinned); };
    /** @deprecated v31 use `api.setColumnsPinned() instead. */
    ColumnApi.prototype.setColumnsPinned = function (keys, pinned) { this.viaApi('setColumnsPinned', keys, pinned); };
    /** @deprecated v31 use `api.getAllGridColumns() instead. */
    ColumnApi.prototype.getAllGridColumns = function () { return this.viaApi('getAllGridColumns'); };
    /** @deprecated v31 use `api.getDisplayedLeftColumns() instead. */
    ColumnApi.prototype.getDisplayedLeftColumns = function () { return this.viaApi('getDisplayedLeftColumns'); };
    /** @deprecated v31 use `api.getDisplayedCenterColumns() instead. */
    ColumnApi.prototype.getDisplayedCenterColumns = function () { return this.viaApi('getDisplayedCenterColumns'); };
    /** @deprecated v31 use `api.getDisplayedRightColumns() instead. */
    ColumnApi.prototype.getDisplayedRightColumns = function () { return this.viaApi('getDisplayedRightColumns'); };
    /** @deprecated v31 use `api.getAllDisplayedColumns() instead. */
    ColumnApi.prototype.getAllDisplayedColumns = function () { return this.viaApi('getAllDisplayedColumns'); };
    /** @deprecated v31 use `api.getAllDisplayedVirtualColumns() instead. */
    ColumnApi.prototype.getAllDisplayedVirtualColumns = function () { return this.viaApi('getAllDisplayedVirtualColumns'); };
    /** @deprecated v31 use `api.moveColumn() instead. */
    ColumnApi.prototype.moveColumn = function (key, toIndex) { this.viaApi('moveColumn', key, toIndex); };
    /** @deprecated v31 use `api.moveColumnByIndex() instead. */
    ColumnApi.prototype.moveColumnByIndex = function (fromIndex, toIndex) { this.viaApi('moveColumnByIndex', fromIndex, toIndex); };
    /** @deprecated v31 use `api.moveColumns() instead. */
    ColumnApi.prototype.moveColumns = function (columnsToMoveKeys, toIndex) { this.viaApi('moveColumns', columnsToMoveKeys, toIndex); };
    /** @deprecated v31 use `api.moveRowGroupColumn() instead. */
    ColumnApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this.viaApi('moveRowGroupColumn', fromIndex, toIndex); };
    /** @deprecated v31 use `api.setColumnAggFunc() instead. */
    ColumnApi.prototype.setColumnAggFunc = function (key, aggFunc) { this.viaApi('setColumnAggFunc', key, aggFunc); };
    /** @deprecated v31 use `api.setColumnWidth() instead. */
    ColumnApi.prototype.setColumnWidth = function (key, newWidth, finished, source) {
        if (finished === void 0) { finished = true; }
        this.viaApi('setColumnWidth', key, newWidth, finished, source);
    };
    /** @deprecated v31 use `api.setColumnWidths() instead. */
    ColumnApi.prototype.setColumnWidths = function (columnWidths, finished, source) {
        if (finished === void 0) { finished = true; }
        this.viaApi('setColumnWidths', columnWidths, finished, source);
    };
    /** @deprecated v31 use `api.setPivotMode() instead. */
    ColumnApi.prototype.setPivotMode = function (pivotMode) { this.viaApi('setPivotMode', pivotMode); };
    /** @deprecated v31 use `api.isPivotMode() instead. */
    ColumnApi.prototype.isPivotMode = function () { return this.viaApi('isPivotMode'); };
    /** @deprecated v31 use `api.getPivotResultColumn() instead. */
    ColumnApi.prototype.getPivotResultColumn = function (pivotKeys, valueColKey) { return this.viaApi('getPivotResultColumn', pivotKeys, valueColKey); };
    /** @deprecated v31 use `api.setValueColumns() instead. */
    ColumnApi.prototype.setValueColumns = function (colKeys) { this.viaApi('setValueColumns', colKeys); };
    /** @deprecated v31 use `api.getValueColumns() instead. */
    ColumnApi.prototype.getValueColumns = function () { return this.viaApi('getValueColumns'); };
    /** @deprecated v31 use `api.removeValueColumn() instead. */
    ColumnApi.prototype.removeValueColumn = function (colKey) { this.viaApi('removeValueColumn', colKey); };
    /** @deprecated v31 use `api.removeValueColumns() instead. */
    ColumnApi.prototype.removeValueColumns = function (colKeys) { this.viaApi('removeValueColumns', colKeys); };
    /** @deprecated v31 use `api.addValueColumn() instead. */
    ColumnApi.prototype.addValueColumn = function (colKey) { this.viaApi('addValueColumn', colKey); };
    /** @deprecated v31 use `api.addValueColumns() instead. */
    ColumnApi.prototype.addValueColumns = function (colKeys) { this.viaApi('addValueColumns', colKeys); };
    /** @deprecated v31 use `api.setRowGroupColumns() instead. */
    ColumnApi.prototype.setRowGroupColumns = function (colKeys) { this.viaApi('setRowGroupColumns', colKeys); };
    /** @deprecated v31 use `api.removeRowGroupColumn() instead. */
    ColumnApi.prototype.removeRowGroupColumn = function (colKey) { this.viaApi('removeRowGroupColumn', colKey); };
    /** @deprecated v31 use `api.removeRowGroupColumns() instead. */
    ColumnApi.prototype.removeRowGroupColumns = function (colKeys) { this.viaApi('removeRowGroupColumns', colKeys); };
    /** @deprecated v31 use `api.addRowGroupColumn() instead. */
    ColumnApi.prototype.addRowGroupColumn = function (colKey) { this.viaApi('addRowGroupColumn', colKey); };
    /** @deprecated v31 use `api.addRowGroupColumns() instead. */
    ColumnApi.prototype.addRowGroupColumns = function (colKeys) { this.viaApi('addRowGroupColumns', colKeys); };
    /** @deprecated v31 use `api.getRowGroupColumns() instead. */
    ColumnApi.prototype.getRowGroupColumns = function () { return this.viaApi('getRowGroupColumns'); };
    /** @deprecated v31 use `api.setPivotColumns() instead. */
    ColumnApi.prototype.setPivotColumns = function (colKeys) { this.viaApi('setPivotColumns', colKeys); };
    /** @deprecated v31 use `api.removePivotColumn() instead. */
    ColumnApi.prototype.removePivotColumn = function (colKey) { this.viaApi('removePivotColumn', colKey); };
    /** @deprecated v31 use `api.removePivotColumns() instead. */
    ColumnApi.prototype.removePivotColumns = function (colKeys) { this.viaApi('removePivotColumns', colKeys); };
    /** @deprecated v31 use `api.addPivotColumn() instead. */
    ColumnApi.prototype.addPivotColumn = function (colKey) { this.viaApi('addPivotColumn', colKey); };
    /** @deprecated v31 use `api.addPivotColumns() instead. */
    ColumnApi.prototype.addPivotColumns = function (colKeys) { this.viaApi('addPivotColumns', colKeys); };
    /** @deprecated v31 use `api.getPivotColumns() instead. */
    ColumnApi.prototype.getPivotColumns = function () { return this.viaApi('getPivotColumns'); };
    /** @deprecated v31 use `api.getLeftDisplayedColumnGroups() instead. */
    ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this.viaApi('getLeftDisplayedColumnGroups'); };
    /** @deprecated v31 use `api.getCenterDisplayedColumnGroups() instead. */
    ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this.viaApi('getCenterDisplayedColumnGroups'); };
    /** @deprecated v31 use `api.getRightDisplayedColumnGroups() instead. */
    ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this.viaApi('getRightDisplayedColumnGroups'); };
    /** @deprecated v31 use `api.getAllDisplayedColumnGroups() instead. */
    ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this.viaApi('getAllDisplayedColumnGroups'); };
    /** @deprecated v31 use `api.autoSizeColumn() instead. */
    ColumnApi.prototype.autoSizeColumn = function (key, skipHeader) { return this.viaApi('autoSizeColumn', key, skipHeader); };
    /** @deprecated v31 use `api.autoSizeColumns() instead. */
    ColumnApi.prototype.autoSizeColumns = function (keys, skipHeader) {
        this.viaApi('autoSizeColumns', keys, skipHeader);
    };
    /** @deprecated v31 use `api.autoSizeAllColumns() instead. */
    ColumnApi.prototype.autoSizeAllColumns = function (skipHeader) { this.viaApi('autoSizeAllColumns', skipHeader); };
    /** @deprecated v31 use `api.setPivotResultColumns() instead. */
    ColumnApi.prototype.setPivotResultColumns = function (colDefs) { this.viaApi('setPivotResultColumns', colDefs); };
    /** @deprecated v31 use `api.getPivotResultColumns() instead. */
    ColumnApi.prototype.getPivotResultColumns = function () { return this.viaApi('getPivotResultColumns'); };
    __decorate([
        Autowired('gridApi')
    ], ColumnApi.prototype, "api", void 0);
    ColumnApi = __decorate([
        Bean('columnApi')
    ], ColumnApi);
    return ColumnApi;
}());
export { ColumnApi };
