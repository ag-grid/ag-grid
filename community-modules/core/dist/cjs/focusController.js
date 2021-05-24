/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("./context/context");
var beanStub_1 = require("./context/beanStub");
var events_1 = require("./events");
var cellComp_1 = require("./rendering/cellComp");
var managedFocusComponent_1 = require("./widgets/managedFocusComponent");
var browser_1 = require("./utils/browser");
var array_1 = require("./utils/array");
var generic_1 = require("./utils/generic");
var constants_1 = require("./constants/constants");
var FocusController = /** @class */ (function (_super) {
    __extends(FocusController, _super);
    function FocusController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FocusController_1 = FocusController;
    /**
     * Adds a gridCore to the list of the gridCores monitoring Keyboard Mode
     * in a specific HTMLDocument.
     *
     * @param doc {Document} - The Document containing the gridCore.
     * @param gridCore {GridComp} - The GridCore to be monitored.
     */
    FocusController.addKeyboardModeEvents = function (doc, controller) {
        var docControllers = FocusController_1.instancesMonitored.get(doc);
        if (docControllers && docControllers.length > 0) {
            if (docControllers.indexOf(controller) === -1) {
                docControllers.push(controller);
            }
        }
        else {
            FocusController_1.instancesMonitored.set(doc, [controller]);
            doc.addEventListener('keydown', FocusController_1.toggleKeyboardMode);
            doc.addEventListener('mousedown', FocusController_1.toggleKeyboardMode);
        }
    };
    /**
     * Removes a gridCore from the list of the gridCores monitoring Keyboard Mode
     * in a specific HTMLDocument.
     *
     * @param doc {Document} - The Document containing the gridCore.
     * @param gridCore {GridComp} - The GridCore to be removed.
     */
    FocusController.removeKeyboardModeEvents = function (doc, controller) {
        var docControllers = FocusController_1.instancesMonitored.get(doc);
        var newControllers = [];
        if (docControllers && docControllers.length) {
            newControllers = __spreadArrays(docControllers).filter(function (currentGridCore) { return currentGridCore !== controller; });
            FocusController_1.instancesMonitored.set(doc, newControllers);
        }
        if (newControllers.length === 0) {
            doc.removeEventListener('keydown', FocusController_1.toggleKeyboardMode);
            doc.removeEventListener('mousedown', FocusController_1.toggleKeyboardMode);
        }
    };
    /**
     * This method will be called by `keydown` and `mousedown` events on all Documents monitoring
     * KeyboardMode. It will then fire a KEYBOARD_FOCUS, MOUSE_FOCUS on each gridCore present in
     * the Document allowing each gridCore to maintain a state for KeyboardMode.
     *
     * @param event {KeyboardEvent | MouseEvent | TouchEvent} - The event triggered.
     */
    FocusController.toggleKeyboardMode = function (event) {
        var isKeyboardActive = FocusController_1.keyboardModeActive;
        var isKeyboardEvent = event.type === 'keydown';
        if (isKeyboardEvent) {
            // the following keys should not toggle keyboard mode.
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
        }
        if (isKeyboardActive && isKeyboardEvent || !isKeyboardActive && !isKeyboardEvent) {
            return;
        }
        FocusController_1.keyboardModeActive = isKeyboardEvent;
        var doc = event.target.ownerDocument;
        if (!doc) {
            return;
        }
        var controllersForDoc = FocusController_1.instancesMonitored.get(doc);
        if (controllersForDoc) {
            controllersForDoc.forEach(function (controller) {
                controller.dispatchEvent({ type: isKeyboardEvent ? events_1.Events.EVENT_KEYBOARD_FOCUS : events_1.Events.EVENT_MOUSE_FOCUS });
            });
        }
    };
    FocusController.prototype.init = function () {
        var clearFocusedCellListener = this.clearFocusedCell.bind(this);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverythingChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_GROUP_OPENED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, clearFocusedCellListener);
    };
    FocusController.prototype.registerGridCompController = function (gridCompController) {
        var _this = this;
        this.gridCompController = gridCompController;
        var doc = this.gridOptionsWrapper.getDocument();
        FocusController_1.addKeyboardModeEvents(doc, gridCompController);
        this.addDestroyFunc(function () { return _this.unregisterGridCompController(gridCompController); });
    };
    FocusController.prototype.unregisterGridCompController = function (gridCompController) {
        var doc = this.gridOptionsWrapper.getDocument();
        FocusController_1.removeKeyboardModeEvents(doc, gridCompController);
    };
    FocusController.prototype.onColumnEverythingChanged = function () {
        // if the columns change, check and see if this column still exists. if it does, then
        // we can keep the focused cell. if it doesn't, then we need to drop the focused cell.
        if (!this.focusedCellPosition) {
            return;
        }
        var col = this.focusedCellPosition.column;
        var colFromColumnController = this.columnController.getGridColumn(col.getId());
        if (col !== colFromColumnController) {
            this.clearFocusedCell();
        }
    };
    FocusController.prototype.isKeyboardMode = function () {
        return FocusController_1.keyboardModeActive;
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
        if (!this.getGridCellForDomElement(document.activeElement)) {
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
        var gridColumn = this.columnController.getGridColumn(colKey);
        // if column doesn't exist, then blank the focused cell and return. this can happen when user sets new columns,
        // and the focused cell is in a column that no longer exists. after columns change, the grid refreshes and tries
        // to re-focus the focused cell.
        if (!gridColumn) {
            this.focusedCellPosition = null;
            return;
        }
        this.focusedCellPosition = gridColumn ? { rowIndex: rowIndex, rowPinned: generic_1.makeNull(floating), column: gridColumn } : null;
        this.onCellFocused(forceBrowserFocus);
    };
    FocusController.prototype.isCellFocused = function (cellPosition) {
        if (this.focusedCellPosition == null) {
            return false;
        }
        return this.focusedCellPosition.column === cellPosition.column &&
            this.isRowFocused(cellPosition.rowIndex, cellPosition.rowPinned);
    };
    FocusController.prototype.isRowNodeFocused = function (rowNode) {
        return this.isRowFocused(rowNode.rowIndex, rowNode.rowPinned);
    };
    FocusController.prototype.isHeaderWrapperFocused = function (headerWrapper) {
        if (this.focusedHeaderPosition == null) {
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
    FocusController.prototype.focusHeaderPosition = function (headerPosition, direction, fromTab, allowUserOverride, event) {
        if (direction === void 0) { direction = null; }
        if (fromTab === void 0) { fromTab = false; }
        if (allowUserOverride === void 0) { allowUserOverride = false; }
        if (allowUserOverride) {
            var gridOptionsWrapper = this.gridOptionsWrapper;
            var currentPosition = this.getFocusedHeader();
            var headerRowCount = this.headerNavigationService.getHeaderRowCount();
            if (fromTab) {
                var userFunc = gridOptionsWrapper.getTabToNextHeaderFunc();
                if (userFunc) {
                    var params = {
                        backwards: direction === 'Before',
                        previousHeaderPosition: currentPosition,
                        nextHeaderPosition: headerPosition,
                        headerRowCount: headerRowCount
                    };
                    headerPosition = userFunc(params);
                }
            }
            else {
                var userFunc = gridOptionsWrapper.getNavigateToNextHeaderFunc();
                if (userFunc && event) {
                    var params = {
                        key: event.key,
                        previousHeaderPosition: currentPosition,
                        nextHeaderPosition: headerPosition,
                        headerRowCount: headerRowCount,
                        event: event
                    };
                    headerPosition = userFunc(params);
                }
            }
        }
        if (!headerPosition) {
            return false;
        }
        if (headerPosition.headerRowIndex === -1) {
            return this.focusGridView(headerPosition.column);
        }
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
        if (this.focusedCellPosition == null) {
            return false;
        }
        return this.focusedCellPosition.rowIndex === rowIndex && this.focusedCellPosition.rowPinned === generic_1.makeNull(floating);
    };
    FocusController.prototype.findFocusableElements = function (rootNode, exclude, onlyUnmanaged) {
        if (onlyUnmanaged === void 0) { onlyUnmanaged = false; }
        var focusableString = constants_1.Constants.FOCUSABLE_SELECTOR;
        var excludeString = constants_1.Constants.FOCUSABLE_EXCLUDE;
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
    FocusController.prototype.focusInto = function (rootNode, up, onlyUnmanaged) {
        if (up === void 0) { up = false; }
        if (onlyUnmanaged === void 0) { onlyUnmanaged = false; }
        var focusableElements = this.findFocusableElements(rootNode, null, onlyUnmanaged);
        var toFocus = up ? array_1.last(focusableElements) : focusableElements[0];
        if (toFocus) {
            toFocus.focus();
            return true;
        }
        return false;
    };
    FocusController.prototype.findNextFocusableElement = function (rootNode, onlyManaged, backwards) {
        var focusable = this.findFocusableElements(rootNode, onlyManaged ? ':not([tabindex="-1"])' : null);
        var currentIndex;
        if (onlyManaged) {
            currentIndex = array_1.findIndex(focusable, function (el) { return el.contains(document.activeElement); });
        }
        else {
            currentIndex = focusable.indexOf(document.activeElement);
        }
        var nextIndex = currentIndex + (backwards ? -1 : 1);
        if (nextIndex < 0 || nextIndex >= focusable.length) {
            return null;
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
        while (node && browser_1.getTabIndex(node) === null && ++counter <= limit) {
            node = node.parentElement;
        }
        if (browser_1.getTabIndex(node) === null) {
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
            rowPinned: null,
            isFullWidthCell: false
        };
        if (this.focusedCellPosition) {
            var rowIndex = event.rowIndex = this.focusedCellPosition.rowIndex;
            var rowPinned = event.rowPinned = this.focusedCellPosition.rowPinned;
            event.column = this.focusedCellPosition.column;
            var rowCon = this.rowRenderer.getRowConByPosition({ rowIndex: rowIndex, rowPinned: rowPinned });
            if (rowCon) {
                event.isFullWidthCell = rowCon.isFullWidth();
            }
        }
        this.eventService.dispatchEvent(event);
    };
    FocusController.prototype.focusGridView = function (column, backwards) {
        var nextRow = backwards
            ? this.rowPositionUtils.getLastRow()
            : this.rowPositionUtils.getFirstRow();
        if (!nextRow) {
            return false;
        }
        var rowIndex = nextRow.rowIndex, rowPinned = nextRow.rowPinned;
        var focusedHeader = this.getFocusedHeader();
        if (!column && focusedHeader) {
            column = focusedHeader.column;
        }
        if (rowIndex == null || !column) {
            return false;
        }
        this.rowRenderer.ensureCellVisible({ rowIndex: rowIndex, column: column, rowPinned: rowPinned });
        this.setFocusedCell(rowIndex, column, generic_1.makeNull(rowPinned), true);
        if (this.rangeController) {
            var cellPosition = { rowIndex: rowIndex, rowPinned: rowPinned, column: column };
            this.rangeController.setRangeToCell(cellPosition);
        }
        return true;
    };
    FocusController.prototype.focusNextGridCoreContainer = function (backwards) {
        if (this.gridCompController.focusNextInnerContainer(backwards)) {
            return true;
        }
        if (!backwards) {
            this.gridCompController.forceFocusOutOfContainer();
        }
        return false;
    };
    var FocusController_1;
    FocusController.AG_KEYBOARD_FOCUS = 'ag-keyboard-focus';
    FocusController.keyboardModeActive = false;
    FocusController.instancesMonitored = new Map();
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
