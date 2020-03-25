/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
var FocusController = /** @class */ (function () {
    function FocusController() {
        this.keyboardFocusActive = false;
    }
    FocusController.prototype.init = function () {
        var _this = this;
        var eDocument = this.gridOptionsWrapper.getDocument();
        this.eventService.addEventListener(Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.clearFocusedCell.bind(this));
        this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.clearFocusedCell.bind(this));
        eDocument.addEventListener('keydown', function () {
            _this.keyboardFocusActive = true;
            _this.eventService.dispatchEvent({ type: Events.EVENT_KEYBOARD_FOCUS });
        });
        eDocument.addEventListener('mousedown', function () {
            _this.keyboardFocusActive = false;
            _this.eventService.dispatchEvent({ type: Events.EVENT_MOUSE_FOCUS });
        });
        // we used to remove focus when moving column, am not sure why. so taking this out and see who complains.
        // we can delete these three lines of code soon.
        // this.eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.clearFocusedCell.bind(this));
        // this.eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.clearFocusedCell.bind(this));
        // this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearFocusedCell.bind(this));
    };
    FocusController.prototype.isKeyboardFocus = function () {
        return this.keyboardFocusActive;
    };
    FocusController.prototype.clearFocusedCell = function () {
        this.focusedCellPosition = null;
        this.onCellFocused(false);
    };
    FocusController.prototype.getFocusedCell = function () {
        return this.focusedCellPosition;
    };
    // we check if the browser is focusing something, and if it is, and
    // it's the cell we think is focused, then return the cell. so this
    // methods returns the cell if a) we think it has focus and b) the
    // browser thinks it has focus. this then returns nothing if we
    // first focus a cell, then second click outside the grid, as then the
    // grid cell will still be focused as far as the grid is concerned,
    // however the browser focus will have moved somewhere else.
    FocusController.prototype.getFocusCellToUseAfterRefresh = function () {
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
    FocusController.prototype.getGridCellForDomElement = function (eBrowserCell) {
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
    FocusController.prototype.setFocusedCell = function (rowIndex, colKey, floating, forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        var column = _.makeNull(this.columnController.getGridColumn(colKey));
        this.focusedCellPosition = { rowIndex: rowIndex, rowPinned: _.makeNull(floating), column: column };
        this.onCellFocused(forceBrowserFocus);
    };
    FocusController.prototype.isCellFocused = function (cellPosition) {
        if (_.missing(this.focusedCellPosition)) {
            return false;
        }
        return this.focusedCellPosition.column === cellPosition.column && this.isRowFocused(cellPosition.rowIndex, cellPosition.rowPinned);
    };
    FocusController.prototype.isRowNodeFocused = function (rowNode) {
        return this.isRowFocused(rowNode.rowIndex, rowNode.rowPinned);
    };
    FocusController.prototype.isAnyCellFocused = function () {
        return !!this.focusedCellPosition;
    };
    FocusController.prototype.isRowFocused = function (rowIndex, floating) {
        if (_.missing(this.focusedCellPosition)) {
            return false;
        }
        var floatingOrNull = _.makeNull(floating);
        return this.focusedCellPosition.rowIndex === rowIndex && this.focusedCellPosition.rowPinned === floatingOrNull;
    };
    FocusController.prototype.findFocusableElements = function (rootNode, exclude) {
        var focusableString = '[tabindex], input, select, button, textarea';
        var excludeString = '.ag-hidden, .ag-hidden *, .ag-disabled, .ag-disabled *';
        if (exclude) {
            excludeString += ', ' + exclude;
        }
        var nodes = Array.from(rootNode.querySelectorAll(focusableString));
        var excludeNodes = Array.from(rootNode.querySelectorAll(excludeString));
        if (!excludeNodes.length) {
            return nodes;
        }
        var diff = function (a, b) { return a.filter(function (element) { return b.indexOf(element) === -1; }); };
        return diff(nodes, excludeNodes);
    };
    FocusController.prototype.onCellFocused = function (forceBrowserFocus) {
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
    ], FocusController.prototype, "eventService", void 0);
    __decorate([
        Autowired('gridOptionsWrapper')
    ], FocusController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], FocusController.prototype, "columnController", void 0);
    __decorate([
        Autowired('columnApi')
    ], FocusController.prototype, "columnApi", void 0);
    __decorate([
        Autowired('gridApi')
    ], FocusController.prototype, "gridApi", void 0);
    __decorate([
        PostConstruct
    ], FocusController.prototype, "init", null);
    FocusController = __decorate([
        Bean('focusController')
    ], FocusController);
    return FocusController;
}());
export { FocusController };
