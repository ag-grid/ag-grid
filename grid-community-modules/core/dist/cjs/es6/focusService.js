"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FocusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusService = void 0;
const context_1 = require("./context/context");
const beanStub_1 = require("./context/beanStub");
const events_1 = require("./events");
const managedFocusFeature_1 = require("./widgets/managedFocusFeature");
const browser_1 = require("./utils/browser");
const generic_1 = require("./utils/generic");
const rowCtrl_1 = require("./rendering/row/rowCtrl");
const abstractHeaderCellCtrl_1 = require("./headerRendering/cells/abstractCell/abstractHeaderCellCtrl");
const array_1 = require("./utils/array");
const dom_1 = require("./utils/dom");
const tabGuardCtrl_1 = require("./widgets/tabGuardCtrl");
let FocusService = FocusService_1 = class FocusService extends beanStub_1.BeanStub {
    static addKeyboardModeEvents(doc) {
        if (this.instanceCount > 0) {
            return;
        }
        doc.addEventListener('keydown', FocusService_1.toggleKeyboardMode);
        doc.addEventListener('mousedown', FocusService_1.toggleKeyboardMode);
    }
    static removeKeyboardModeEvents(doc) {
        if (this.instanceCount > 0)
            return;
        doc.addEventListener('keydown', FocusService_1.toggleKeyboardMode);
        doc.addEventListener('mousedown', FocusService_1.toggleKeyboardMode);
    }
    static toggleKeyboardMode(event) {
        const isKeyboardActive = FocusService_1.keyboardModeActive;
        const isKeyboardEvent = event.type === 'keydown';
        if (isKeyboardEvent) {
            // the following keys should not toggle keyboard mode.
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
        }
        if (isKeyboardActive === isKeyboardEvent) {
            return;
        }
        FocusService_1.keyboardModeActive = isKeyboardEvent;
    }
    static unregisterGridCompController(doc) {
        FocusService_1.removeKeyboardModeEvents(doc);
    }
    init() {
        const clearFocusedCellListener = this.clearFocusedCell.bind(this);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverythingChanged.bind(this));
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_GROUP_OPENED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, clearFocusedCellListener);
        this.registerKeyboardFocusEvents();
        this.ctrlsService.whenReady(p => {
            this.gridCtrl = p.gridCtrl;
        });
    }
    registerKeyboardFocusEvents() {
        const eDocument = this.gridOptionsService.getDocument();
        FocusService_1.addKeyboardModeEvents(eDocument);
        FocusService_1.instanceCount++;
        this.addDestroyFunc(() => {
            FocusService_1.instanceCount--;
            FocusService_1.unregisterGridCompController(eDocument);
        });
    }
    onColumnEverythingChanged() {
        // if the columns change, check and see if this column still exists. if it does, then
        // we can keep the focused cell. if it doesn't, then we need to drop the focused cell.
        if (!this.focusedCellPosition) {
            return;
        }
        const col = this.focusedCellPosition.column;
        const colFromColumnModel = this.columnModel.getGridColumn(col.getId());
        if (col !== colFromColumnModel) {
            this.clearFocusedCell();
        }
    }
    isKeyboardMode() {
        return FocusService_1.keyboardModeActive;
    }
    // we check if the browser is focusing something, and if it is, and
    // it's the cell we think is focused, then return the cell. so this
    // methods returns the cell if a) we think it has focus and b) the
    // browser thinks it has focus. this then returns nothing if we
    // first focus a cell, then second click outside the grid, as then the
    // grid cell will still be focused as far as the grid is concerned,
    // however the browser focus will have moved somewhere else.
    getFocusCellToUseAfterRefresh() {
        const eDocument = this.gridOptionsService.getDocument();
        if (this.gridOptionsService.get('suppressFocusAfterRefresh') || !this.focusedCellPosition) {
            return null;
        }
        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about. we check for ROW data, as this covers both focused Rows (for Full Width Rows)
        // and Cells (covers cells as cells live in rows)
        if (this.isDomDataMissingInHierarchy(eDocument.activeElement, rowCtrl_1.RowCtrl.DOM_DATA_KEY_ROW_CTRL)) {
            return null;
        }
        return this.focusedCellPosition;
    }
    getFocusHeaderToUseAfterRefresh() {
        const eDocument = this.gridOptionsService.getDocument();
        if (this.gridOptionsService.get('suppressFocusAfterRefresh') || !this.focusedHeaderPosition) {
            return null;
        }
        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about
        if (this.isDomDataMissingInHierarchy(eDocument.activeElement, abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL)) {
            return null;
        }
        return this.focusedHeaderPosition;
    }
    isDomDataMissingInHierarchy(eBrowserCell, key) {
        let ePointer = eBrowserCell;
        while (ePointer) {
            const data = this.gridOptionsService.getDomData(ePointer, key);
            if (data) {
                return false;
            }
            ePointer = ePointer.parentNode;
        }
        return true;
    }
    getFocusedCell() {
        return this.focusedCellPosition;
    }
    shouldRestoreFocus(cell) {
        if (this.isCellRestoreFocused(cell)) {
            setTimeout(() => {
                // Clear the restore focused cell position after the timeout to avoid
                // the cell being focused again and stealing focus from another part of the app.
                this.restoredFocusedCellPosition = null;
            }, 0);
            return true;
        }
        return false;
    }
    isCellRestoreFocused(cellPosition) {
        if (this.restoredFocusedCellPosition == null) {
            return false;
        }
        return this.cellPositionUtils.equals(cellPosition, this.restoredFocusedCellPosition);
    }
    setRestoreFocusedCell(cellPosition) {
        if (this.getFrameworkOverrides().renderingEngine === 'react') {
            // The restoredFocusedCellPosition is used in the React Rendering engine as we have to be able
            // to support restoring focus after an async rendering.
            this.restoredFocusedCellPosition = cellPosition;
        }
    }
    getFocusEventParams() {
        const { rowIndex, rowPinned, column } = this.focusedCellPosition;
        const params = {
            rowIndex: rowIndex,
            rowPinned: rowPinned,
            column: column,
            isFullWidthCell: false
        };
        const rowCtrl = this.rowRenderer.getRowByPosition({ rowIndex, rowPinned });
        if (rowCtrl) {
            params.isFullWidthCell = rowCtrl.isFullWidth();
        }
        return params;
    }
    clearFocusedCell() {
        this.restoredFocusedCellPosition = null;
        if (this.focusedCellPosition == null) {
            return;
        }
        const event = Object.assign({ type: events_1.Events.EVENT_CELL_FOCUS_CLEARED }, this.getFocusEventParams());
        this.focusedCellPosition = null;
        this.eventService.dispatchEvent(event);
    }
    setFocusedCell(params) {
        const { column, rowIndex, rowPinned, forceBrowserFocus = false, preventScrollOnBrowserFocus = false } = params;
        const gridColumn = this.columnModel.getGridColumn(column);
        // if column doesn't exist, then blank the focused cell and return. this can happen when user sets new columns,
        // and the focused cell is in a column that no longer exists. after columns change, the grid refreshes and tries
        // to re-focus the focused cell.
        if (!gridColumn) {
            this.focusedCellPosition = null;
            return;
        }
        this.focusedCellPosition = gridColumn ? {
            rowIndex: rowIndex,
            rowPinned: (0, generic_1.makeNull)(rowPinned),
            column: gridColumn
        } : null;
        const event = Object.assign(Object.assign({ type: events_1.Events.EVENT_CELL_FOCUSED }, this.getFocusEventParams()), { forceBrowserFocus,
            preventScrollOnBrowserFocus, floating: null });
        this.eventService.dispatchEvent(event);
    }
    isCellFocused(cellPosition) {
        if (this.focusedCellPosition == null) {
            return false;
        }
        return this.cellPositionUtils.equals(cellPosition, this.focusedCellPosition);
    }
    isRowNodeFocused(rowNode) {
        return this.isRowFocused(rowNode.rowIndex, rowNode.rowPinned);
    }
    isHeaderWrapperFocused(headerCtrl) {
        if (this.focusedHeaderPosition == null) {
            return false;
        }
        const column = headerCtrl.getColumnGroupChild();
        const headerRowIndex = headerCtrl.getRowIndex();
        const pinned = headerCtrl.getPinned();
        const { column: focusedColumn, headerRowIndex: focusedHeaderRowIndex } = this.focusedHeaderPosition;
        return column === focusedColumn &&
            headerRowIndex === focusedHeaderRowIndex &&
            pinned == focusedColumn.getPinned();
    }
    clearFocusedHeader() {
        this.focusedHeaderPosition = null;
    }
    getFocusedHeader() {
        return this.focusedHeaderPosition;
    }
    setFocusedHeader(headerRowIndex, column) {
        this.focusedHeaderPosition = { headerRowIndex, column };
    }
    focusHeaderPosition(params) {
        const { direction, fromTab, allowUserOverride, event, fromCell } = params;
        let { headerPosition } = params;
        if (fromCell && this.filterManager.isAdvancedFilterHeaderActive()) {
            return this.focusAdvancedFilter(headerPosition);
        }
        if (allowUserOverride) {
            const currentPosition = this.getFocusedHeader();
            const headerRowCount = this.headerNavigationService.getHeaderRowCount();
            if (fromTab) {
                const userFunc = this.gridOptionsService.getCallback('tabToNextHeader');
                if (userFunc) {
                    const params = {
                        backwards: direction === 'Before',
                        previousHeaderPosition: currentPosition,
                        nextHeaderPosition: headerPosition,
                        headerRowCount,
                    };
                    headerPosition = userFunc(params);
                }
            }
            else {
                const userFunc = this.gridOptionsService.getCallback('navigateToNextHeader');
                if (userFunc && event) {
                    const params = {
                        key: event.key,
                        previousHeaderPosition: currentPosition,
                        nextHeaderPosition: headerPosition,
                        headerRowCount,
                        event,
                    };
                    headerPosition = userFunc(params);
                }
            }
        }
        if (!headerPosition) {
            return false;
        }
        if (headerPosition.headerRowIndex === -1) {
            if (this.filterManager.isAdvancedFilterHeaderActive()) {
                return this.focusAdvancedFilter(headerPosition);
            }
            else {
                return this.focusGridView(headerPosition.column);
            }
        }
        this.headerNavigationService.scrollToColumn(headerPosition.column, direction);
        const headerRowContainerCtrl = this.ctrlsService.getHeaderRowContainerCtrl(headerPosition.column.getPinned());
        // this will automatically call the setFocusedHeader method above
        const focusSuccess = headerRowContainerCtrl.focusHeader(headerPosition.headerRowIndex, headerPosition.column, event);
        return focusSuccess;
    }
    focusFirstHeader() {
        let firstColumn = this.columnModel.getAllDisplayedColumns()[0];
        if (!firstColumn) {
            return false;
        }
        if (firstColumn.getParent()) {
            firstColumn = this.columnModel.getColumnGroupAtLevel(firstColumn, 0);
        }
        return this.focusHeaderPosition({
            headerPosition: { headerRowIndex: 0, column: firstColumn }
        });
    }
    focusLastHeader(event) {
        const headerRowIndex = this.headerNavigationService.getHeaderRowCount() - 1;
        const column = (0, array_1.last)(this.columnModel.getAllDisplayedColumns());
        return this.focusHeaderPosition({
            headerPosition: { headerRowIndex, column },
            event
        });
    }
    focusPreviousFromFirstCell(event) {
        if (this.filterManager.isAdvancedFilterHeaderActive()) {
            return this.focusAdvancedFilter(null);
        }
        return this.focusLastHeader(event);
    }
    isAnyCellFocused() {
        return !!this.focusedCellPosition;
    }
    isRowFocused(rowIndex, floating) {
        if (this.focusedCellPosition == null) {
            return false;
        }
        return this.focusedCellPosition.rowIndex === rowIndex && this.focusedCellPosition.rowPinned === (0, generic_1.makeNull)(floating);
    }
    findFocusableElements(rootNode, exclude, onlyUnmanaged = false) {
        const focusableString = dom_1.FOCUSABLE_SELECTOR;
        let excludeString = dom_1.FOCUSABLE_EXCLUDE;
        if (exclude) {
            excludeString += ', ' + exclude;
        }
        if (onlyUnmanaged) {
            excludeString += ', [tabindex="-1"]';
        }
        const nodes = Array.prototype.slice.apply(rootNode.querySelectorAll(focusableString)).filter((node) => {
            return (0, dom_1.isVisible)(node);
        });
        const excludeNodes = Array.prototype.slice.apply(rootNode.querySelectorAll(excludeString));
        if (!excludeNodes.length) {
            return nodes;
        }
        const diff = (a, b) => a.filter(element => b.indexOf(element) === -1);
        return diff(nodes, excludeNodes);
    }
    focusInto(rootNode, up = false, onlyUnmanaged = false) {
        const focusableElements = this.findFocusableElements(rootNode, null, onlyUnmanaged);
        const toFocus = up ? (0, array_1.last)(focusableElements) : focusableElements[0];
        if (toFocus) {
            toFocus.focus({ preventScroll: true });
            return true;
        }
        return false;
    }
    findFocusableElementBeforeTabGuard(rootNode, referenceElement) {
        if (!referenceElement) {
            return null;
        }
        const focusableElements = this.findFocusableElements(rootNode);
        const referenceIndex = focusableElements.indexOf(referenceElement);
        if (referenceIndex === -1) {
            return null;
        }
        let lastTabGuardIndex = -1;
        for (let i = referenceIndex - 1; i >= 0; i--) {
            if (focusableElements[i].classList.contains(tabGuardCtrl_1.TabGuardClassNames.TAB_GUARD_TOP)) {
                lastTabGuardIndex = i;
                break;
            }
        }
        if (lastTabGuardIndex <= 0) {
            return null;
        }
        return focusableElements[lastTabGuardIndex - 1];
    }
    findNextFocusableElement(rootNode = this.eGridDiv, onlyManaged, backwards) {
        const focusable = this.findFocusableElements(rootNode, onlyManaged ? ':not([tabindex="-1"])' : null);
        const eDocument = this.gridOptionsService.getDocument();
        const activeEl = eDocument.activeElement;
        let currentIndex;
        if (onlyManaged) {
            currentIndex = focusable.findIndex(el => el.contains(activeEl));
        }
        else {
            currentIndex = focusable.indexOf(activeEl);
        }
        const nextIndex = currentIndex + (backwards ? -1 : 1);
        if (nextIndex < 0 || nextIndex >= focusable.length) {
            return null;
        }
        return focusable[nextIndex];
    }
    isTargetUnderManagedComponent(rootNode, target) {
        if (!target) {
            return false;
        }
        const managedContainers = rootNode.querySelectorAll(`.${managedFocusFeature_1.ManagedFocusFeature.FOCUS_MANAGED_CLASS}`);
        if (!managedContainers.length) {
            return false;
        }
        for (let i = 0; i < managedContainers.length; i++) {
            if (managedContainers[i].contains(target)) {
                return true;
            }
        }
        return false;
    }
    findTabbableParent(node, limit = 5) {
        let counter = 0;
        while (node && (0, browser_1.getTabIndex)(node) === null && ++counter <= limit) {
            node = node.parentElement;
        }
        if ((0, browser_1.getTabIndex)(node) === null) {
            return null;
        }
        return node;
    }
    focusGridView(column, backwards) {
        // if suppressCellFocus is `true`, it means the user does not want to
        // navigate between the cells using tab. Instead, we put focus on either
        // the header or after the grid, depending on whether tab or shift-tab was pressed.
        if (this.gridOptionsService.get('suppressCellFocus')) {
            if (backwards) {
                return this.focusLastHeader();
            }
            return this.focusNextGridCoreContainer(false);
        }
        const nextRow = backwards
            ? this.rowPositionUtils.getLastRow()
            : this.rowPositionUtils.getFirstRow();
        if (!nextRow) {
            return false;
        }
        const { rowIndex, rowPinned } = nextRow;
        const focusedHeader = this.getFocusedHeader();
        if (!column && focusedHeader) {
            column = focusedHeader.column;
        }
        if (rowIndex == null || !column) {
            return false;
        }
        this.navigationService.ensureCellVisible({ rowIndex, column, rowPinned });
        this.setFocusedCell({
            rowIndex,
            column,
            rowPinned: (0, generic_1.makeNull)(rowPinned),
            forceBrowserFocus: true
        });
        if (this.rangeService) {
            const cellPosition = { rowIndex, rowPinned, column };
            this.rangeService.setRangeToCell(cellPosition);
        }
        return true;
    }
    focusNextGridCoreContainer(backwards, forceOut = false) {
        if (!forceOut && this.gridCtrl.focusNextInnerContainer(backwards)) {
            return true;
        }
        if (forceOut || (!backwards && !this.gridCtrl.isDetailGrid())) {
            this.gridCtrl.forceFocusOutOfContainer(backwards);
        }
        return false;
    }
    focusAdvancedFilter(position) {
        this.advancedFilterFocusColumn = position === null || position === void 0 ? void 0 : position.column;
        return this.advancedFilterService.getCtrl().focusHeaderComp();
    }
    focusNextFromAdvancedFilter(backwards, forceFirstColumn) {
        var _a, _b;
        const column = (_a = (forceFirstColumn ? undefined : this.advancedFilterFocusColumn)) !== null && _a !== void 0 ? _a : (_b = this.columnModel.getAllDisplayedColumns()) === null || _b === void 0 ? void 0 : _b[0];
        if (backwards) {
            return this.focusHeaderPosition({
                headerPosition: {
                    column: column,
                    headerRowIndex: this.headerNavigationService.getHeaderRowCount() - 1
                }
            });
        }
        else {
            return this.focusGridView(column);
        }
    }
    clearAdvancedFilterColumn() {
        this.advancedFilterFocusColumn = undefined;
    }
};
FocusService.keyboardModeActive = false;
FocusService.instanceCount = 0;
__decorate([
    (0, context_1.Autowired)('eGridDiv')
], FocusService.prototype, "eGridDiv", void 0);
__decorate([
    (0, context_1.Autowired)('columnModel')
], FocusService.prototype, "columnModel", void 0);
__decorate([
    (0, context_1.Autowired)('headerNavigationService')
], FocusService.prototype, "headerNavigationService", void 0);
__decorate([
    (0, context_1.Autowired)('rowRenderer')
], FocusService.prototype, "rowRenderer", void 0);
__decorate([
    (0, context_1.Autowired)('rowPositionUtils')
], FocusService.prototype, "rowPositionUtils", void 0);
__decorate([
    (0, context_1.Autowired)('cellPositionUtils')
], FocusService.prototype, "cellPositionUtils", void 0);
__decorate([
    (0, context_1.Optional)('rangeService')
], FocusService.prototype, "rangeService", void 0);
__decorate([
    (0, context_1.Autowired)('navigationService')
], FocusService.prototype, "navigationService", void 0);
__decorate([
    (0, context_1.Autowired)('ctrlsService')
], FocusService.prototype, "ctrlsService", void 0);
__decorate([
    (0, context_1.Autowired)('filterManager')
], FocusService.prototype, "filterManager", void 0);
__decorate([
    (0, context_1.Optional)('advancedFilterService')
], FocusService.prototype, "advancedFilterService", void 0);
__decorate([
    context_1.PostConstruct
], FocusService.prototype, "init", null);
FocusService = FocusService_1 = __decorate([
    (0, context_1.Bean)('focusService')
], FocusService);
exports.FocusService = FocusService;
