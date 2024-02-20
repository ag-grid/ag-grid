var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean } from "../context/context.mjs";
import { warnOnce } from "../utils/function.mjs";
/** @deprecated Use methods via the grid api instead. */
let ColumnApi = class ColumnApi {
    constructor(gridAp) {
        this.viaApi = (funcName, ...args) => {
            warnOnce(`Since v31, 'columnApi.${funcName}' is deprecated and moved to 'api.${funcName}'.`);
            return this.api[funcName](...args);
        };
        this.api = gridAp;
    }
    /** @deprecated v31 use `api.sizeColumnsToFit()` instead.   */
    sizeColumnsToFit(gridWidth) { this.viaApi('sizeColumnsToFit', gridWidth); }
    /** @deprecated v31 use `api.setColumnGroupOpened() instead. */
    setColumnGroupOpened(group, newValue) { this.viaApi('setColumnGroupOpened', group, newValue); }
    /** @deprecated v31 use `api.getColumnGroup() instead. */
    getColumnGroup(name, instanceId) { return this.viaApi('getColumnGroup', name, instanceId); }
    /** @deprecated v31 use `api.getProvidedColumnGroup() instead. */
    getProvidedColumnGroup(name) { return this.viaApi('getProvidedColumnGroup', name); }
    /** @deprecated v31 use `api.getDisplayNameForColumn() instead. */
    getDisplayNameForColumn(column, location) { return this.viaApi('getDisplayNameForColumn', column, location); }
    /** @deprecated v31 use `api.getDisplayNameForColumnGroup() instead. */
    getDisplayNameForColumnGroup(columnGroup, location) { return this.viaApi('getDisplayNameForColumnGroup', columnGroup, location); }
    /** @deprecated v31 use `api.getColumn() instead. */
    getColumn(key) { return this.viaApi('getColumn', key); }
    /** @deprecated v31 use `api.getColumns() instead. */
    getColumns() { return this.viaApi('getColumns'); }
    /** @deprecated v31 use `api.applyColumnState() instead. */
    applyColumnState(params) { return this.viaApi('applyColumnState', params); }
    /** @deprecated v31 use `api.getColumnState() instead. */
    getColumnState() { return this.viaApi('getColumnState'); }
    /** @deprecated v31 use `api.resetColumnState() instead. */
    resetColumnState() { this.viaApi('resetColumnState'); }
    /** @deprecated v31 use `api.getColumnGroupState() instead. */
    getColumnGroupState() { return this.viaApi('getColumnGroupState'); }
    /** @deprecated v31 use `api.setColumnGroupState() instead. */
    setColumnGroupState(stateItems) { this.viaApi('setColumnGroupState', stateItems); }
    /** @deprecated v31 use `api.resetColumnGroupState() instead. */
    resetColumnGroupState() { this.viaApi('resetColumnGroupState'); }
    /** @deprecated v31 use `api.isPinning() instead. */
    isPinning() { return this.viaApi('isPinning'); }
    /** @deprecated v31 use `api.isPinningLeft() instead. */
    isPinningLeft() { return this.viaApi('isPinningLeft'); }
    /** @deprecated v31 use `api.isPinningRight() instead. */
    isPinningRight() { return this.viaApi('isPinningRight'); }
    /** @deprecated v31 use `api.getDisplayedColAfter() instead. */
    getDisplayedColAfter(col) { return this.viaApi('getDisplayedColAfter', col); }
    /** @deprecated v31 use `api.getDisplayedColBefore() instead. */
    getDisplayedColBefore(col) { return this.viaApi('getDisplayedColBefore', col); }
    /** @deprecated v31 use `api.setColumnVisible() instead. */
    setColumnVisible(key, visible) { this.viaApi('setColumnVisible', key, visible); }
    /** @deprecated v31 use `api.setColumnsVisible() instead. */
    setColumnsVisible(keys, visible) { this.viaApi('setColumnsVisible', keys, visible); }
    /** @deprecated v31 use `api.setColumnPinned() instead. */
    setColumnPinned(key, pinned) { this.viaApi('setColumnPinned', key, pinned); }
    /** @deprecated v31 use `api.setColumnsPinned() instead. */
    setColumnsPinned(keys, pinned) { this.viaApi('setColumnsPinned', keys, pinned); }
    /** @deprecated v31 use `api.getAllGridColumns() instead. */
    getAllGridColumns() { return this.viaApi('getAllGridColumns'); }
    /** @deprecated v31 use `api.getDisplayedLeftColumns() instead. */
    getDisplayedLeftColumns() { return this.viaApi('getDisplayedLeftColumns'); }
    /** @deprecated v31 use `api.getDisplayedCenterColumns() instead. */
    getDisplayedCenterColumns() { return this.viaApi('getDisplayedCenterColumns'); }
    /** @deprecated v31 use `api.getDisplayedRightColumns() instead. */
    getDisplayedRightColumns() { return this.viaApi('getDisplayedRightColumns'); }
    /** @deprecated v31 use `api.getAllDisplayedColumns() instead. */
    getAllDisplayedColumns() { return this.viaApi('getAllDisplayedColumns'); }
    /** @deprecated v31 use `api.getAllDisplayedVirtualColumns() instead. */
    getAllDisplayedVirtualColumns() { return this.viaApi('getAllDisplayedVirtualColumns'); }
    /** @deprecated v31 use `api.moveColumn() instead. */
    moveColumn(key, toIndex) { this.viaApi('moveColumn', key, toIndex); }
    /** @deprecated v31 use `api.moveColumnByIndex() instead. */
    moveColumnByIndex(fromIndex, toIndex) { this.viaApi('moveColumnByIndex', fromIndex, toIndex); }
    /** @deprecated v31 use `api.moveColumns() instead. */
    moveColumns(columnsToMoveKeys, toIndex) { this.viaApi('moveColumns', columnsToMoveKeys, toIndex); }
    /** @deprecated v31 use `api.moveRowGroupColumn() instead. */
    moveRowGroupColumn(fromIndex, toIndex) { this.viaApi('moveRowGroupColumn', fromIndex, toIndex); }
    /** @deprecated v31 use `api.setColumnAggFunc() instead. */
    setColumnAggFunc(key, aggFunc) { this.viaApi('setColumnAggFunc', key, aggFunc); }
    /** @deprecated v31 use `api.setColumnWidth() instead. */
    setColumnWidth(key, newWidth, finished = true, source) {
        this.viaApi('setColumnWidth', key, newWidth, finished, source);
    }
    /** @deprecated v31 use `api.setColumnWidths() instead. */
    setColumnWidths(columnWidths, finished = true, source) {
        this.viaApi('setColumnWidths', columnWidths, finished, source);
    }
    /** @deprecated v31 use `api.setPivotMode() instead. */
    setPivotMode(pivotMode) { this.viaApi('setPivotMode', pivotMode); }
    /** @deprecated v31 use `api.isPivotMode() instead. */
    isPivotMode() { return this.viaApi('isPivotMode'); }
    /** @deprecated v31 use `api.getPivotResultColumn() instead. */
    getPivotResultColumn(pivotKeys, valueColKey) { return this.viaApi('getPivotResultColumn', pivotKeys, valueColKey); }
    /** @deprecated v31 use `api.setValueColumns() instead. */
    setValueColumns(colKeys) { this.viaApi('setValueColumns', colKeys); }
    /** @deprecated v31 use `api.getValueColumns() instead. */
    getValueColumns() { return this.viaApi('getValueColumns'); }
    /** @deprecated v31 use `api.removeValueColumn() instead. */
    removeValueColumn(colKey) { this.viaApi('removeValueColumn', colKey); }
    /** @deprecated v31 use `api.removeValueColumns() instead. */
    removeValueColumns(colKeys) { this.viaApi('removeValueColumns', colKeys); }
    /** @deprecated v31 use `api.addValueColumn() instead. */
    addValueColumn(colKey) { this.viaApi('addValueColumn', colKey); }
    /** @deprecated v31 use `api.addValueColumns() instead. */
    addValueColumns(colKeys) { this.viaApi('addValueColumns', colKeys); }
    /** @deprecated v31 use `api.setRowGroupColumns() instead. */
    setRowGroupColumns(colKeys) { this.viaApi('setRowGroupColumns', colKeys); }
    /** @deprecated v31 use `api.removeRowGroupColumn() instead. */
    removeRowGroupColumn(colKey) { this.viaApi('removeRowGroupColumn', colKey); }
    /** @deprecated v31 use `api.removeRowGroupColumns() instead. */
    removeRowGroupColumns(colKeys) { this.viaApi('removeRowGroupColumns', colKeys); }
    /** @deprecated v31 use `api.addRowGroupColumn() instead. */
    addRowGroupColumn(colKey) { this.viaApi('addRowGroupColumn', colKey); }
    /** @deprecated v31 use `api.addRowGroupColumns() instead. */
    addRowGroupColumns(colKeys) { this.viaApi('addRowGroupColumns', colKeys); }
    /** @deprecated v31 use `api.getRowGroupColumns() instead. */
    getRowGroupColumns() { return this.viaApi('getRowGroupColumns'); }
    /** @deprecated v31 use `api.setPivotColumns() instead. */
    setPivotColumns(colKeys) { this.viaApi('setPivotColumns', colKeys); }
    /** @deprecated v31 use `api.removePivotColumn() instead. */
    removePivotColumn(colKey) { this.viaApi('removePivotColumn', colKey); }
    /** @deprecated v31 use `api.removePivotColumns() instead. */
    removePivotColumns(colKeys) { this.viaApi('removePivotColumns', colKeys); }
    /** @deprecated v31 use `api.addPivotColumn() instead. */
    addPivotColumn(colKey) { this.viaApi('addPivotColumn', colKey); }
    /** @deprecated v31 use `api.addPivotColumns() instead. */
    addPivotColumns(colKeys) { this.viaApi('addPivotColumns', colKeys); }
    /** @deprecated v31 use `api.getPivotColumns() instead. */
    getPivotColumns() { return this.viaApi('getPivotColumns'); }
    /** @deprecated v31 use `api.getLeftDisplayedColumnGroups() instead. */
    getLeftDisplayedColumnGroups() { return this.viaApi('getLeftDisplayedColumnGroups'); }
    /** @deprecated v31 use `api.getCenterDisplayedColumnGroups() instead. */
    getCenterDisplayedColumnGroups() { return this.viaApi('getCenterDisplayedColumnGroups'); }
    /** @deprecated v31 use `api.getRightDisplayedColumnGroups() instead. */
    getRightDisplayedColumnGroups() { return this.viaApi('getRightDisplayedColumnGroups'); }
    /** @deprecated v31 use `api.getAllDisplayedColumnGroups() instead. */
    getAllDisplayedColumnGroups() { return this.viaApi('getAllDisplayedColumnGroups'); }
    /** @deprecated v31 use `api.autoSizeColumn() instead. */
    autoSizeColumn(key, skipHeader) { return this.viaApi('autoSizeColumn', key, skipHeader); }
    /** @deprecated v31 use `api.autoSizeColumns() instead. */
    autoSizeColumns(keys, skipHeader) {
        this.viaApi('autoSizeColumns', keys, skipHeader);
    }
    /** @deprecated v31 use `api.autoSizeAllColumns() instead. */
    autoSizeAllColumns(skipHeader) { this.viaApi('autoSizeAllColumns', skipHeader); }
    /** @deprecated v31 use `api.setPivotResultColumns() instead. */
    setPivotResultColumns(colDefs) { this.viaApi('setPivotResultColumns', colDefs); }
    /** @deprecated v31 use `api.getPivotResultColumns() instead. */
    getPivotResultColumns() { return this.viaApi('getPivotResultColumns'); }
};
__decorate([
    Autowired('gridApi')
], ColumnApi.prototype, "api", void 0);
ColumnApi = __decorate([
    Bean('columnApi')
], ColumnApi);
export { ColumnApi };
