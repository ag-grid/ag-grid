/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FocusService_1;
import { Autowired, Bean, Optional, PostConstruct } from "./context/context";
import { BeanStub } from "./context/beanStub";
import { Events } from "./events";
import { ManagedFocusFeature } from "./widgets/managedFocusFeature";
import { getTabIndex } from './utils/browser';
import { makeNull } from './utils/generic';
import { Constants } from "./constants/constants";
import { RowCtrl } from "./rendering/row/rowCtrl";
import { AbstractHeaderCellCtrl } from "./headerRendering/cells/abstractCell/abstractHeaderCellCtrl";
import { last } from "./utils/array";
let FocusService = FocusService_1 = class FocusService extends BeanStub {
    /**
     * Adds a gridCore to the list of the gridCores monitoring Keyboard Mode
     * in a specific HTMLDocument.
     *
     * @param doc {Document} - The Document containing the gridCore.
     * @param gridCore {GridComp} - The GridCore to be monitored.
     */
    static addKeyboardModeEvents(doc, controller) {
        const docControllers = FocusService_1.instancesMonitored.get(doc);
        if (docControllers && docControllers.length > 0) {
            if (docControllers.indexOf(controller) === -1) {
                docControllers.push(controller);
            }
        }
        else {
            FocusService_1.instancesMonitored.set(doc, [controller]);
            doc.addEventListener('keydown', FocusService_1.toggleKeyboardMode);
            doc.addEventListener('mousedown', FocusService_1.toggleKeyboardMode);
        }
    }
    /**
     * Removes a gridCore from the list of the gridCores monitoring Keyboard Mode
     * in a specific HTMLDocument.
     *
     * @param doc {Document} - The Document containing the gridCore.
     * @param gridCore {GridComp} - The GridCore to be removed.
     */
    static removeKeyboardModeEvents(doc, controller) {
        const docControllers = FocusService_1.instancesMonitored.get(doc);
        let newControllers = [];
        if (docControllers && docControllers.length) {
            newControllers = [...docControllers].filter(currentGridCore => currentGridCore !== controller);
            FocusService_1.instancesMonitored.set(doc, newControllers);
        }
        if (newControllers.length === 0) {
            doc.removeEventListener('keydown', FocusService_1.toggleKeyboardMode);
            doc.removeEventListener('mousedown', FocusService_1.toggleKeyboardMode);
        }
    }
    /**
     * This method will be called by `keydown` and `mousedown` events on all Documents monitoring
     * KeyboardMode. It will then fire a KEYBOARD_FOCUS, MOUSE_FOCUS on each gridCore present in
     * the Document allowing each gridCore to maintain a state for KeyboardMode.
     *
     * @param event {KeyboardEvent | MouseEvent | TouchEvent} - The event triggered.
     */
    static toggleKeyboardMode(event) {
        const isKeyboardActive = FocusService_1.keyboardModeActive;
        const isKeyboardEvent = event.type === 'keydown';
        if (isKeyboardEvent) {
            // the following keys should not toggle keyboard mode.
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
        }
        if (isKeyboardActive && isKeyboardEvent || !isKeyboardActive && !isKeyboardEvent) {
            return;
        }
        FocusService_1.keyboardModeActive = isKeyboardEvent;
        const doc = event.target.ownerDocument;
        if (!doc) {
            return;
        }
        const controllersForDoc = FocusService_1.instancesMonitored.get(doc);
        if (controllersForDoc) {
            controllersForDoc.forEach(controller => {
                controller.dispatchEvent({ type: isKeyboardEvent ? Events.EVENT_KEYBOARD_FOCUS : Events.EVENT_MOUSE_FOCUS });
            });
        }
    }
    init() {
        const clearFocusedCellListener = this.clearFocusedCell.bind(this);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnEverythingChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_GROUP_OPENED, clearFocusedCellListener);
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, clearFocusedCellListener);
        this.ctrlsService.whenReady(p => {
            this.gridCtrl = p.gridCtrl;
            const doc = this.gridOptionsWrapper.getDocument();
            FocusService_1.addKeyboardModeEvents(doc, this.gridCtrl);
            this.addDestroyFunc(() => this.unregisterGridCompController(this.gridCtrl));
        });
    }
    unregisterGridCompController(gridCompController) {
        const doc = this.gridOptionsWrapper.getDocument();
        FocusService_1.removeKeyboardModeEvents(doc, gridCompController);
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
        const eDocument = this.gridOptionsWrapper.getDocument();
        if (this.gridOptionsWrapper.isSuppressFocusAfterRefresh() || !this.focusedCellPosition) {
            return null;
        }
        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about. we check for ROW data, as this covers both focused Rows (for Full Width Rows)
        // and Cells (covers cells as cells live in rows)
        if (this.isDomDataMissingInHierarchy(eDocument.activeElement, RowCtrl.DOM_DATA_KEY_ROW_CTRL)) {
            return null;
        }
        return this.focusedCellPosition;
    }
    getFocusHeaderToUseAfterRefresh() {
        const eDocument = this.gridOptionsWrapper.getDocument();
        if (this.gridOptionsWrapper.isSuppressFocusAfterRefresh() || !this.focusedHeaderPosition) {
            return null;
        }
        // we check that the browser is actually focusing on the grid, if it is not, then
        // we have nothing to worry about
        if (this.isDomDataMissingInHierarchy(eDocument.activeElement, AbstractHeaderCellCtrl.DOM_DATA_KEY_HEADER_CTRL)) {
            return null;
        }
        return this.focusedHeaderPosition;
    }
    isDomDataMissingInHierarchy(eBrowserCell, key) {
        let ePointer = eBrowserCell;
        while (ePointer) {
            const data = this.gridOptionsWrapper.getDomData(ePointer, key);
            if (data) {
                return false;
            }
            ePointer = ePointer.parentNode;
        }
        return true;
    }
    clearFocusedCell() {
        this.focusedCellPosition = null;
        this.onCellFocused(false, false);
    }
    getFocusedCell() {
        return this.focusedCellPosition;
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
            rowPinned: makeNull(rowPinned),
            column: gridColumn
        } : null;
        this.onCellFocused(forceBrowserFocus, preventScrollOnBrowserFocus);
    }
    isCellFocused(cellPosition) {
        if (this.focusedCellPosition == null) {
            return false;
        }
        return this.focusedCellPosition.column === cellPosition.column &&
            this.isRowFocused(cellPosition.rowIndex, cellPosition.rowPinned);
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
        const { direction, fromTab, allowUserOverride, event } = params;
        let { headerPosition } = params;
        if (allowUserOverride) {
            const { gridOptionsWrapper } = this;
            const currentPosition = this.getFocusedHeader();
            const headerRowCount = this.headerNavigationService.getHeaderRowCount();
            if (fromTab) {
                const userFunc = gridOptionsWrapper.getTabToNextHeaderFunc();
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
                const userFunc = gridOptionsWrapper.getNavigateToNextHeaderFunc();
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
            return this.focusGridView(headerPosition.column);
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
        const column = last(this.columnModel.getAllDisplayedColumns());
        return this.focusHeaderPosition({
            headerPosition: { headerRowIndex, column },
            event
        });
    }
    isAnyCellFocused() {
        return !!this.focusedCellPosition;
    }
    isRowFocused(rowIndex, floating) {
        if (this.focusedCellPosition == null) {
            return false;
        }
        return this.focusedCellPosition.rowIndex === rowIndex && this.focusedCellPosition.rowPinned === makeNull(floating);
    }
    findFocusableElements(rootNode, exclude, onlyUnmanaged = false) {
        const focusableString = Constants.FOCUSABLE_SELECTOR;
        let excludeString = Constants.FOCUSABLE_EXCLUDE;
        if (exclude) {
            excludeString += ', ' + exclude;
        }
        if (onlyUnmanaged) {
            excludeString += ', [tabindex="-1"]';
        }
        const nodes = Array.prototype.slice.apply(rootNode.querySelectorAll(focusableString));
        const excludeNodes = Array.prototype.slice.apply(rootNode.querySelectorAll(excludeString));
        if (!excludeNodes.length) {
            return nodes;
        }
        const diff = (a, b) => a.filter(element => b.indexOf(element) === -1);
        return diff(nodes, excludeNodes);
    }
    focusInto(rootNode, up = false, onlyUnmanaged = false) {
        const focusableElements = this.findFocusableElements(rootNode, null, onlyUnmanaged);
        const toFocus = up ? last(focusableElements) : focusableElements[0];
        if (toFocus) {
            toFocus.focus();
            return true;
        }
        return false;
    }
    findNextFocusableElement(rootNode = this.eGridDiv, onlyManaged, backwards) {
        const focusable = this.findFocusableElements(rootNode, onlyManaged ? ':not([tabindex="-1"])' : null);
        const eDocument = this.gridOptionsWrapper.getDocument();
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
    isFocusUnderManagedComponent(rootNode) {
        const eDocument = this.gridOptionsWrapper.getDocument();
        const managedContainers = rootNode.querySelectorAll(`.${ManagedFocusFeature.FOCUS_MANAGED_CLASS}`);
        if (!managedContainers.length) {
            return false;
        }
        for (let i = 0; i < managedContainers.length; i++) {
            if (managedContainers[i].contains(eDocument.activeElement)) {
                return true;
            }
        }
        return false;
    }
    findTabbableParent(node, limit = 5) {
        let counter = 0;
        while (node && getTabIndex(node) === null && ++counter <= limit) {
            node = node.parentElement;
        }
        if (getTabIndex(node) === null) {
            return null;
        }
        return node;
    }
    onCellFocused(forceBrowserFocus, preventScrollOnBrowserFocus) {
        const event = {
            type: Events.EVENT_CELL_FOCUSED,
            forceBrowserFocus: forceBrowserFocus,
            preventScrollOnBrowserFocus: preventScrollOnBrowserFocus,
            rowIndex: null,
            column: null,
            floating: null,
            rowPinned: null,
            isFullWidthCell: false
        };
        if (this.focusedCellPosition) {
            const rowIndex = event.rowIndex = this.focusedCellPosition.rowIndex;
            const rowPinned = event.rowPinned = this.focusedCellPosition.rowPinned;
            event.column = this.focusedCellPosition.column;
            const rowCtrl = this.rowRenderer.getRowByPosition({ rowIndex, rowPinned });
            if (rowCtrl) {
                event.isFullWidthCell = rowCtrl.isFullWidth();
            }
        }
        this.eventService.dispatchEvent(event);
    }
    focusGridView(column, backwards) {
        // if suppressCellFocus is `true`, it means the user does not want to
        // navigate between the cells using tab. Instead, we put focus on either
        // the header or after the grid, depending on whether tab or shift-tab was pressed.
        if (this.gridOptionsWrapper.isSuppressCellFocus()) {
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
            rowPinned: makeNull(rowPinned),
            forceBrowserFocus: true
        });
        if (this.rangeService) {
            const cellPosition = { rowIndex, rowPinned, column };
            this.rangeService.setRangeToCell(cellPosition);
        }
        return true;
    }
    focusNextGridCoreContainer(backwards) {
        if (this.gridCtrl.focusNextInnerContainer(backwards)) {
            return true;
        }
        if (!backwards && !this.gridCtrl.isDetailGrid()) {
            this.gridCtrl.forceFocusOutOfContainer();
        }
        return false;
    }
};
FocusService.AG_KEYBOARD_FOCUS = 'ag-keyboard-focus';
FocusService.keyboardModeActive = false;
FocusService.instancesMonitored = new Map();
__decorate([
    Autowired('eGridDiv')
], FocusService.prototype, "eGridDiv", void 0);
__decorate([
    Autowired('columnModel')
], FocusService.prototype, "columnModel", void 0);
__decorate([
    Autowired('headerNavigationService')
], FocusService.prototype, "headerNavigationService", void 0);
__decorate([
    Autowired('rowRenderer')
], FocusService.prototype, "rowRenderer", void 0);
__decorate([
    Autowired('rowPositionUtils')
], FocusService.prototype, "rowPositionUtils", void 0);
__decorate([
    Optional('rangeService')
], FocusService.prototype, "rangeService", void 0);
__decorate([
    Autowired('navigationService')
], FocusService.prototype, "navigationService", void 0);
__decorate([
    Autowired('ctrlsService')
], FocusService.prototype, "ctrlsService", void 0);
__decorate([
    PostConstruct
], FocusService.prototype, "init", null);
FocusService = FocusService_1 = __decorate([
    Bean('focusService')
], FocusService);
export { FocusService };
