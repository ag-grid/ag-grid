/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var events_1 = require("./events");
var cellComp_1 = require("./rendering/cellComp");
var managedFocusComponent_1 = require("./widgets/managedFocusComponent");
var utils_1 = require("./utils");
var FocusController = /** @class */ (function (_super) {
    __extends(FocusController, _super);
    function FocusController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.keyboardFocusActive = false;
        return _this;
    }
    FocusController_1 = FocusController;
    FocusController.prototype.init = function () {
        var eDocument = this.gridOptionsWrapper.getDocument();
        var clearFocusedCellListener = this.clearFocusedCell.bind(this);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnEverythingChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_GROUP_OPENED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, clearFocusedCellListener);
        this.addManagedListener(eDocument, 'keydown', this.activateKeyboardMode.bind(this));
        this.addManagedListener(eDocument, 'mousedown', this.activateMouseMode.bind(this));
    };
    FocusController.prototype.registerGridCore = function (gridCore) {
        this.gridCore = gridCore;
    };
    FocusController.prototype.onColumnEverythingChanged = function () {
        // if the columns change, check and see if this column still exists. if it does,
        // then we can keep the focused cell. if it doesn't, then we need to drop the focused
        // cell.
        if (this.focusedCellPosition) {
            var col = this.focusedCellPosition.column;
            var colFromColumnController = this.columnController.getGridColumn(col.getId());
            if (col !== colFromColumnController) {
                this.clearFocusedCell();
            }
        }
    };
    FocusController.prototype.isKeyboardFocus = function () {
        return this.keyboardFocusActive;
    };
    FocusController.prototype.activateMouseMode = function () {
        this.keyboardFocusActive = false;
        this.eventService.dispatchEvent({ type: events_1.Events.EVENT_MOUSE_FOCUS });
    };
    FocusController.prototype.activateKeyboardMode = function () {
        this.keyboardFocusActive = true;
        this.eventService.dispatchEvent({ type: events_1.Events.EVENT_KEYBOARD_FOCUS });
    };
    // we check if the browser is focusing something, and if it is, and
    // it's the cell we think is focused, then return the cell. so this
    // methods returns the cell if a) we think it has focus and b) the
    // browser thinks it has focus. this then returns nothing if we
    // first focus a cell, then second click outside the grid, as then the
    // grid cell will still be focused as far as the grid is concerned,
    // however the browser focus will have moved somewhere else.
    FocusController.prototype.getFocusCellToUseAfterRefresh = function () {
        if (this.gridOptionsWrapper.isSuppressFocusAfterRefresh() || !this.focusedCellPosition) {
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
            var cellComp = this.gridOptionsWrapper.getDomData(ePointer, cellComp_1.CellComp.DOM_DATA_KEY_CELL_COMP);
            if (cellComp) {
                return cellComp.getCellPosition();
            }
            ePointer = ePointer.parentNode;
        }
        return null;
    };
    FocusController.prototype.clearFocusedCell = function () {
        this.focusedCellPosition = null;
        this.onCellFocused(false);
    };
    FocusController.prototype.getFocusedCell = function () {
        return this.focusedCellPosition;
    };
    FocusController.prototype.setFocusedCell = function (rowIndex, colKey, floating, forceBrowserFocus) {
        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
        var column = utils_1._.makeNull(this.columnController.getGridColumn(colKey));
        this.focusedCellPosition = { rowIndex: rowIndex, rowPinned: utils_1._.makeNull(floating), column: column };
        this.onCellFocused(forceBrowserFocus);
    };
    FocusController.prototype.isCellFocused = function (cellPosition) {
        if (utils_1._.missing(this.focusedCellPosition)) {
            return false;
        }
        return this.focusedCellPosition.column === cellPosition.column && this.isRowFocused(cellPosition.rowIndex, cellPosition.rowPinned);
    };
    FocusController.prototype.isRowNodeFocused = function (rowNode) {
        return this.isRowFocused(rowNode.rowIndex, rowNode.rowPinned);
    };
    FocusController.prototype.isHeaderWrapperFocused = function (headerWrapper) {
        if (utils_1._.missing(this.focusedHeaderPosition)) {
            return false;
        }
        var column = headerWrapper.getColumn();
        var headerRowIndex = headerWrapper.getParentComponent().getRowIndex();
        var pinned = headerWrapper.getPinned();
        var _a = this.focusedHeaderPosition, focusedColumn = _a.column, focusedHeaderRowIndex = _a.headerRowIndex;
        return column === focusedColumn &&
            headerRowIndex === focusedHeaderRowIndex &&
            pinned == focusedColumn.getPinned();
    };
    FocusController.prototype.clearFocusedHeader = function () {
        this.focusedHeaderPosition = null;
    };
    FocusController.prototype.getFocusedHeader = function () {
        return this.focusedHeaderPosition;
    };
    FocusController.prototype.setFocusedHeader = function (headerRowIndex, column) {
        this.focusedHeaderPosition = { headerRowIndex: headerRowIndex, column: column };
    };
    FocusController.prototype.focusHeaderPosition = function (headerPosition, direction) {
        this.headerNavigationService.scrollToColumn(headerPosition.column, direction);
        var childContainer = this.headerNavigationService.getHeaderContainer(headerPosition.column.getPinned());
        var rowComps = childContainer.getRowComps();
        var nextRowComp = rowComps[headerPosition.headerRowIndex];
        var headerComps = nextRowComp.getHeaderComps();
        var nextHeader = headerComps[headerPosition.column.getUniqueId()];
        if (nextHeader) {
            // this will automatically call the setFocusedHeader method above
            nextHeader.getFocusableElement().focus();
            return true;
        }
        return false;
    };
    FocusController.prototype.isAnyCellFocused = function () {
        return !!this.focusedCellPosition;
    };
    FocusController.prototype.isRowFocused = function (rowIndex, floating) {
        if (utils_1._.missing(this.focusedCellPosition)) {
            return false;
        }
        var floatingOrNull = utils_1._.makeNull(floating);
        return this.focusedCellPosition.rowIndex === rowIndex && this.focusedCellPosition.rowPinned === floatingOrNull;
    };
    FocusController.prototype.findFocusableElements = function (rootNode, exclude, onlyUnmanaged) {
        var focusableString = FocusController_1.FOCUSABLE_SELECTOR;
        var excludeString = FocusController_1.FOCUSABLE_EXCLUDE;
        if (exclude) {
            excludeString += ', ' + exclude;
        }
        if (onlyUnmanaged) {
            excludeString += ', [tabindex="-1"]';
        }
        var nodes = Array.prototype.slice.apply(rootNode.querySelectorAll(focusableString));
        var excludeNodes = Array.prototype.slice.apply(rootNode.querySelectorAll(excludeString));
        if (!excludeNodes.length) {
            return nodes;
        }
        var diff = function (a, b) { return a.filter(function (element) { return b.indexOf(element) === -1; }); };
        return diff(nodes, excludeNodes);
    };
    FocusController.prototype.focusFirstFocusableElement = function (rootNode, onlyUnmanaged) {
        var focusable = this.findFocusableElements(rootNode, null, onlyUnmanaged)[0];
        if (focusable) {
            focusable.focus();
            return true;
        }
        return false;
    };
    FocusController.prototype.focusLastFocusableElement = function (rootNode, onlyUnmanaged) {
        var focusable = utils_1._.last(this.findFocusableElements(rootNode, null, onlyUnmanaged));
        if (focusable) {
            focusable.focus();
            return true;
        }
        return false;
    };
    FocusController.prototype.findNextFocusableElement = function (rootNode, onlyManaged, backwards) {
        var focusable = this.findFocusableElements(rootNode, onlyManaged ? ':not([tabindex="-1"])' : null);
        var currentIndex;
        if (onlyManaged) {
            currentIndex = utils_1._.findIndex(focusable, function (el) { return el.contains(document.activeElement); });
        }
        else {
            currentIndex = focusable.indexOf(document.activeElement);
        }
        var nextIndex = currentIndex + (backwards ? -1 : 1);
        if (nextIndex < 0 || nextIndex > focusable.length) {
            return;
        }
        return focusable[nextIndex];
    };
    FocusController.prototype.isFocusUnderManagedComponent = function (rootNode) {
        var managedContainers = rootNode.querySelectorAll("." + managedFocusComponent_1.ManagedFocusComponent.FOCUS_MANAGED_CLASS);
        if (!managedContainers.length) {
            return false;
        }
        for (var i = 0; i < managedContainers.length; i++) {
            if (managedContainers[i].contains(document.activeElement)) {
                return true;
            }
        }
        return false;
    };
    FocusController.prototype.findTabbableParent = function (node, limit) {
        if (limit === void 0) { limit = 5; }
        var counter = 0;
        while (node && utils_1._.getTabIndex(node) === null && ++counter <= limit) {
            node = node.parentElement;
        }
        if (utils_1._.getTabIndex(node) === null) {
            return null;
        }
        return node;
    };
    FocusController.prototype.onCellFocused = function (forceBrowserFocus) {
        var event = {
            type: events_1.Events.EVENT_CELL_FOCUSED,
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
    FocusController.prototype.focusGridView = function (column) {
        var firstRow = this.rowPositionUtils.getFirstRow();
        if (!firstRow) {
            return false;
        }
        var rowIndex = firstRow.rowIndex, rowPinned = firstRow.rowPinned;
        var focusedHeader = this.getFocusedHeader();
        if (!column) {
            column = focusedHeader.column;
        }
        if (!utils_1._.exists(rowIndex)) {
            return false;
        }
        this.rowRenderer.ensureCellVisible({ rowIndex: rowIndex, column: column, rowPinned: rowPinned });
        this.setFocusedCell(rowIndex, column, utils_1._.makeNull(rowPinned), true);
        if (this.rangeController) {
            var cellPosition = { rowIndex: rowIndex, rowPinned: rowPinned, column: column };
            this.rangeController.setRangeToCell(cellPosition);
        }
        return true;
    };
    FocusController.prototype.focusNextGridCoreContainer = function (backwards) {
        if (this.gridCore.focusNextInnerContainer(backwards)) {
            return true;
        }
        if (!backwards) {
            this.gridCore.forceFocusOutOfContainer();
        }
    };
    var FocusController_1;
    FocusController.FOCUSABLE_SELECTOR = '[tabindex], input, select, button, textarea';
    FocusController.FOCUSABLE_EXCLUDE = '.ag-hidden, .ag-hidden *, .ag-disabled, .ag-disabled *';
    __decorate([
        context_1.Autowired('gridOptionsWrapper')
    ], FocusController.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController')
    ], FocusController.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('headerNavigationService')
    ], FocusController.prototype, "headerNavigationService", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], FocusController.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], FocusController.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('rowRenderer')
    ], FocusController.prototype, "rowRenderer", void 0);
    __decorate([
        context_1.Autowired('rowPositionUtils')
    ], FocusController.prototype, "rowPositionUtils", void 0);
    __decorate([
        context_1.Optional('rangeController')
    ], FocusController.prototype, "rangeController", void 0);
    __decorate([
        context_1.PostConstruct
    ], FocusController.prototype, "init", null);
    FocusController = FocusController_1 = __decorate([
        context_1.Bean('focusController')
    ], FocusController);
    return FocusController;
}(beanStub_1.BeanStub));
exports.FocusController = FocusController;

//# sourceMappingURL=focusController.js.map
