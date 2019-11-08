/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean, Autowired, PostConstruct } from "./context/context";
import { Events } from "./events";
import { CellComp } from "./rendering/cellComp";
import { _ } from "./utils";
var FocusedCellController = /** @class */ (function () {
    function FocusedCellController() {
    }
    FocusedCellController.prototype.init = function () {
        this.eventService.addEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearFocusedCell.bind(this));
        // we used to remove focus when moving column, am not sure why. so taking this out and see who complains.
        // we can delete these three lines of code soon.
        // this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.clearFocusedCell.bind(this));
        // this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.clearFocusedCell.bind(this));
        // this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearFocusedCell.bind(this));
    };
    FocusedCellController.prototype.clearFocusedCell = function () {
        this.focusedCellPosition = null;
        this.onCellFocused(false);
    };
    FocusedCellController.prototype.getFocusedCell = function () {
        return this.focusedCellPosition;
    };
    // we check if the browser is focusing something, and if it is, and
    // it's the cell we think is focused, then return the cell. so this
    // methods returns the cell if a) we think it has focus and b) the
    // browser thinks it has focus. this then returns nothing if we
    // first focus a cell, then second click outside the grid, as then the
    // grid cell will still be focused as far as the grid is concerned,
    // however the browser focus will have moved somewhere else.
    FocusedCellController.prototype.getFocusCellToUseAfterRefresh = function () {
        if (this.gridOptionsWrapper.isSuppressFocusAfterRefresh()) {
            return null;
        }
        if (!this.focusedCellPosition) {
            return null;
        }
        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about
        var browserFocusedCell = this.getGridCellForDomElement(document.activeElement);
        if (!browserFocusedCell) {
            return null;
        }
        return this.focusedCellPosition;
    };
    FocusedCellController.prototype.getGridCellForDomElement = function (eBrowserCell) {
        var ePointer = eBrowserCell;
        while (ePointer) {
            var cellComp = this.gridOptionsWrapper.getDomData(ePointer, CellComp.DOM_DATA_KEY_CELL_COMP);
            if (cellComp) {
                return cellComp.getCellPosition();
            }
            ePointer = ePointer.parentNode;
        }
        return null;
    };
    FocusedCellController.prototype.setFocusedCell = function (rowIndex, colKey, floating, forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        var column = _.makeNull(this.columnController.getGridColumn(colKey));
        this.focusedCellPosition = { rowIndex: rowIndex, rowPinned: _.makeNull(floating), column: column };
        this.onCellFocused(forceBrowserFocus);
    };
    FocusedCellController.prototype.isCellFocused = function (cellPosition) {
        if (_.missing(this.focusedCellPosition)) {
            return false;
        }
        return this.focusedCellPosition.column === cellPosition.column && this.isRowFocused(cellPosition.rowIndex, cellPosition.rowPinned);
    };
    FocusedCellController.prototype.isRowNodeFocused = function (rowNode) {
        return this.isRowFocused(rowNode.rowIndex, rowNode.rowPinned);
    };
    FocusedCellController.prototype.isAnyCellFocused = function () {
        return !!this.focusedCellPosition;
    };
    FocusedCellController.prototype.isRowFocused = function (rowIndex, floating) {
        if (_.missing(this.focusedCellPosition)) {
            return false;
        }
        var floatingOrNull = _.makeNull(floating);
        return this.focusedCellPosition.rowIndex === rowIndex && this.focusedCellPosition.rowPinned === floatingOrNull;
    };
    FocusedCellController.prototype.onCellFocused = function (forceBrowserFocus) {
        var event = {
            type: Events.EVENT_CELL_FOCUSED,
            forceBrowserFocus: forceBrowserFocus,
            rowIndex: null,
            column: null,
            floating: null,
            api: this.gridApi,
            columnApi: this.columnApi,
            rowPinned: null
        };
        if (this.focusedCellPosition) {
            event.rowIndex = this.focusedCellPosition.rowIndex;
            event.column = this.focusedCellPosition.column;
            event.rowPinned = this.focusedCellPosition.rowPinned;
        }
        this.eventService.dispatchEvent(event);
    };
    __decorate([
        Autowired('eventService')
    ], FocusedCellController.prototype, "eventService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], FocusedCellController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], FocusedCellController.prototype, "columnController", void 0);
    __decorate([
        Autowired('columnApi')
    ], FocusedCellController.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], FocusedCellController.prototype, "gridApi", void 0);
    __decorate([
        PostConstruct
    ], FocusedCellController.prototype, "init", null);
    FocusedCellController = __decorate([
        Bean('focusedCellController')
    ], FocusedCellController);
    return FocusedCellController;
}());
export { FocusedCellController };
