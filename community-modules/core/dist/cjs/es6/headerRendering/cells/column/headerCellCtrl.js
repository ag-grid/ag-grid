/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderCellCtrl = void 0;
const keyCode_1 = require("../../../constants/keyCode");
const context_1 = require("../../../context/context");
const dragAndDropService_1 = require("../../../dragAndDrop/dragAndDropService");
const column_1 = require("../../../entities/column");
const eventKeys_1 = require("../../../eventKeys");
const setLeftFeature_1 = require("../../../rendering/features/setLeftFeature");
const aria_1 = require("../../../utils/aria");
const managedFocusFeature_1 = require("../../../widgets/managedFocusFeature");
const tooltipFeature_1 = require("../../../widgets/tooltipFeature");
const abstractHeaderCellCtrl_1 = require("../abstractCell/abstractHeaderCellCtrl");
const cssClassApplier_1 = require("../cssClassApplier");
const hoverFeature_1 = require("../hoverFeature");
const resizeFeature_1 = require("./resizeFeature");
const selectAllFeature_1 = require("./selectAllFeature");
const dom_1 = require("../../../utils/dom");
class HeaderCellCtrl extends abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl {
    constructor(column, parentRowCtrl) {
        super(column, parentRowCtrl);
        this.refreshFunctions = [];
        this.userHeaderClasses = new Set();
        this.ariaDescriptionProperties = new Map();
        this.column = column;
    }
    setComp(comp, eGui, eResize, eHeaderCompWrapper) {
        super.setGui(eGui);
        this.comp = comp;
        this.updateState();
        this.setupWidth();
        this.setupMovingCss();
        this.setupMenuClass();
        this.setupSortableClass();
        this.setupWrapTextClass();
        this.setupAutoHeight(eHeaderCompWrapper);
        this.addColumnHoverListener();
        this.setupFilterCss();
        this.setupColId();
        this.setupClassesFromColDef();
        this.setupTooltip();
        this.addActiveHeaderMouseListeners();
        this.setupSelectAll();
        this.setupUserComp();
        this.refreshAria();
        this.createManagedBean(new resizeFeature_1.ResizeFeature(this.getPinned(), this.column, eResize, comp, this));
        this.createManagedBean(new hoverFeature_1.HoverFeature([this.column], eGui));
        this.createManagedBean(new setLeftFeature_1.SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: e => this.shouldStopEventPropagation(e),
            onTabKeyDown: () => null,
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this),
            onFocusOut: this.onFocusOut.bind(this)
        }));
        this.addManagedListener(this.column, column_1.Column.EVENT_COL_DEF_CHANGED, this.onColDefChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
    }
    setupUserComp() {
        const compDetails = this.lookupUserCompDetails();
        this.setCompDetails(compDetails);
    }
    setCompDetails(compDetails) {
        this.userCompDetails = compDetails;
        this.comp.setUserCompDetails(compDetails);
    }
    lookupUserCompDetails() {
        const params = this.createParams();
        const colDef = this.column.getColDef();
        return this.userComponentFactory.getHeaderCompDetails(colDef, params);
    }
    createParams() {
        const colDef = this.column.getColDef();
        const params = {
            column: this.column,
            displayName: this.displayName,
            enableSorting: colDef.sortable,
            enableMenu: this.menuEnabled,
            showColumnMenu: (source) => {
                this.gridApi.showColumnMenuAfterButtonClick(this.column, source);
            },
            progressSort: (multiSort) => {
                this.sortController.progressSort(this.column, !!multiSort, "uiColumnSorted");
            },
            setSort: (sort, multiSort) => {
                this.sortController.setSortForColumn(this.column, sort, !!multiSort, "uiColumnSorted");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context'),
            eGridHeader: this.getGui()
        };
        return params;
    }
    setupSelectAll() {
        this.selectAllFeature = this.createManagedBean(new selectAllFeature_1.SelectAllFeature(this.column));
        this.selectAllFeature.setComp(this);
    }
    getSelectAllGui() {
        return this.selectAllFeature.getCheckboxGui();
    }
    handleKeyDown(e) {
        super.handleKeyDown(e);
        if (e.key === keyCode_1.KeyCode.SPACE) {
            this.selectAllFeature.onSpaceKeyPressed(e);
        }
        if (e.key === keyCode_1.KeyCode.ENTER) {
            this.onEnterKeyPressed(e);
        }
    }
    onEnterKeyPressed(e) {
        /// THIS IS BAD - we are assuming the header is not a user provided comp
        const headerComp = this.comp.getUserCompInstance();
        if (!headerComp) {
            return;
        }
        if (e.ctrlKey || e.metaKey) {
            if (this.menuEnabled && headerComp.showMenu) {
                e.preventDefault();
                headerComp.showMenu();
            }
        }
        else if (this.sortable) {
            const multiSort = e.shiftKey;
            this.sortController.progressSort(this.column, multiSort, "uiColumnSorted");
        }
    }
    isMenuEnabled() {
        return this.menuEnabled;
    }
    onFocusIn(e) {
        if (!this.getGui().contains(e.relatedTarget)) {
            const rowIndex = this.getRowIndex();
            this.focusService.setFocusedHeader(rowIndex, this.column);
        }
        this.setActiveHeader(true);
    }
    onFocusOut(e) {
        if (this.getGui().contains(e.relatedTarget)) {
            return;
        }
        this.setActiveHeader(false);
    }
    setupTooltip() {
        const tooltipCtrl = {
            getColumn: () => this.column,
            getColDef: () => this.column.getColDef(),
            getGui: () => this.eGui,
            getLocation: () => 'header',
            getTooltipValue: () => {
                const res = this.column.getColDef().headerTooltip;
                return res;
            },
        };
        const tooltipFeature = this.createManagedBean(new tooltipFeature_1.TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.comp);
        this.refreshFunctions.push(() => tooltipFeature.refreshToolTip());
    }
    setupClassesFromColDef() {
        const refreshHeaderClasses = () => {
            const colDef = this.column.getColDef();
            const classes = cssClassApplier_1.CssClassApplier.getHeaderClassesFromColDef(colDef, this.gridOptionsService, this.column, null);
            const oldClasses = this.userHeaderClasses;
            this.userHeaderClasses = new Set(classes);
            classes.forEach(c => {
                if (oldClasses.has(c)) {
                    // class already added, no need to apply it, but remove from old set
                    oldClasses.delete(c);
                }
                else {
                    // class new since last time, so apply it
                    this.comp.addOrRemoveCssClass(c, true);
                }
            });
            // now old set only has classes that were applied last time, but not this time, so remove them
            oldClasses.forEach(c => this.comp.addOrRemoveCssClass(c, false));
        };
        this.refreshFunctions.push(refreshHeaderClasses);
        refreshHeaderClasses();
    }
    setDragSource(eSource) {
        this.dragSourceElement = eSource;
        this.removeDragSource();
        if (!eSource) {
            return;
        }
        if (!this.draggable) {
            return;
        }
        const hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
        this.moveDragSource = {
            type: dragAndDropService_1.DragSourceType.HeaderCell,
            eElement: eSource,
            defaultIconName: hideColumnOnExit ? dragAndDropService_1.DragAndDropService.ICON_HIDE : dragAndDropService_1.DragAndDropService.ICON_NOT_ALLOWED,
            getDragItem: () => this.createDragItem(),
            dragItemName: this.displayName,
            onDragStarted: () => this.column.setMoving(true, "uiColumnMoved"),
            onDragStopped: () => this.column.setMoving(false, "uiColumnMoved"),
            onGridEnter: (dragItem) => {
                var _a;
                if (hideColumnOnExit) {
                    const unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(col => !col.getColDef().lockVisible)) || [];
                    this.columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: (dragItem) => {
                var _a;
                if (hideColumnOnExit) {
                    const unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(col => !col.getColDef().lockVisible)) || [];
                    this.columnModel.setColumnsVisible(unlockedColumns, false, "uiColumnMoved");
                }
            },
        };
        this.dragAndDropService.addDragSource(this.moveDragSource, true);
    }
    createDragItem() {
        const visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    }
    removeDragSource() {
        if (this.moveDragSource) {
            this.dragAndDropService.removeDragSource(this.moveDragSource);
            this.moveDragSource = undefined;
        }
    }
    onColDefChanged() {
        this.refresh();
    }
    updateState() {
        const colDef = this.column.getColDef();
        this.menuEnabled = this.menuFactory.isMenuEnabled(this.column) && !colDef.suppressMenu;
        this.sortable = colDef.sortable;
        this.displayName = this.calculateDisplayName();
        this.draggable = this.workOutDraggable();
    }
    addRefreshFunction(func) {
        this.refreshFunctions.push(func);
    }
    refresh() {
        this.updateState();
        this.refreshHeaderComp();
        this.refreshAria();
        this.refreshFunctions.forEach(f => f());
    }
    refreshHeaderComp() {
        const newCompDetails = this.lookupUserCompDetails();
        const compInstance = this.comp.getUserCompInstance();
        // only try refresh if old comp exists adn it is the correct type
        const attemptRefresh = compInstance != null && this.userCompDetails.componentClass == newCompDetails.componentClass;
        const headerCompRefreshed = attemptRefresh ? this.attemptHeaderCompRefresh(newCompDetails.params) : false;
        if (headerCompRefreshed) {
            // we do this as a refresh happens after colDefs change, and it's possible the column has had it's
            // draggable property toggled. no need to call this if not refreshing, as setDragSource is done
            // as part of appendHeaderComp
            this.setDragSource(this.dragSourceElement);
        }
        else {
            this.setCompDetails(newCompDetails);
        }
    }
    attemptHeaderCompRefresh(params) {
        const headerComp = this.comp.getUserCompInstance();
        if (!headerComp) {
            return false;
        }
        // if no refresh method, then we want to replace the headerComp
        if (!headerComp.refresh) {
            return false;
        }
        const res = headerComp.refresh(params);
        return res;
    }
    calculateDisplayName() {
        return this.columnModel.getDisplayNameForColumn(this.column, 'header', true);
    }
    checkDisplayName() {
        // display name can change if aggFunc different, eg sum(Gold) is now max(Gold)
        if (this.displayName !== this.calculateDisplayName()) {
            this.refresh();
        }
    }
    workOutDraggable() {
        const colDef = this.column.getColDef();
        const isSuppressMovableColumns = this.gridOptionsService.is('suppressMovableColumns');
        const colCanMove = !isSuppressMovableColumns && !colDef.suppressMovable && !colDef.lockPosition;
        // we should still be allowed drag the column, even if it can't be moved, if the column
        // can be dragged to a rowGroup or pivot drop zone
        return !!colCanMove || !!colDef.enableRowGroup || !!colDef.enablePivot;
    }
    onColumnRowGroupChanged() {
        this.checkDisplayName();
    }
    onColumnPivotChanged() {
        this.checkDisplayName();
    }
    onColumnValueChanged() {
        this.checkDisplayName();
    }
    setupWidth() {
        const listener = () => {
            const columnWidth = this.column.getActualWidth();
            this.comp.setWidth(`${columnWidth}px`);
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    }
    setupMovingCss() {
        const listener = () => {
            // this is what makes the header go dark when it is been moved (gives impression to
            // user that the column was picked up).
            this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.column.isMoving());
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_MOVING_CHANGED, listener);
        listener();
    }
    setupMenuClass() {
        const listener = () => {
            this.comp.addOrRemoveCssClass('ag-column-menu-visible', this.column.isMenuVisible());
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_MENU_VISIBLE_CHANGED, listener);
        listener();
    }
    setupSortableClass() {
        const updateSortableCssClass = () => {
            this.comp.addOrRemoveCssClass('ag-header-cell-sortable', !!this.sortable);
        };
        updateSortableCssClass();
        this.addRefreshFunction(updateSortableCssClass);
        this.addManagedListener(this.eventService, column_1.Column.EVENT_SORT_CHANGED, this.refreshAriaSort.bind(this));
    }
    setupWrapTextClass() {
        const listener = () => {
            const wrapText = !!this.column.getColDef().wrapHeaderText;
            this.comp.addOrRemoveCssClass('ag-header-cell-wrap-text', wrapText);
        };
        listener();
        this.addRefreshFunction(listener);
    }
    setupAutoHeight(wrapperElement) {
        const measureHeight = (timesCalled) => {
            if (!this.isAlive()) {
                return;
            }
            const { paddingTop, paddingBottom } = dom_1.getElementSize(this.getGui());
            const wrapperHeight = wrapperElement.offsetHeight;
            const autoHeight = wrapperHeight + paddingTop + paddingBottom;
            if (timesCalled < 5) {
                // if not in doc yet, means framework not yet inserted, so wait for next VM turn,
                // maybe it will be ready next VM turn
                const doc = this.beans.gridOptionsService.getDocument();
                const notYetInDom = !doc || !doc.contains(wrapperElement);
                // this happens in React, where React hasn't put any content in. we say 'possibly'
                // as a) may not be React and b) the cell could be empty anyway
                const possiblyNoContentYet = autoHeight == 0;
                if (notYetInDom || possiblyNoContentYet) {
                    this.beans.frameworkOverrides.setTimeout(() => measureHeight(timesCalled + 1), 0);
                    return;
                }
            }
            this.columnModel.setColumnHeaderHeight(this.column, autoHeight);
        };
        let isMeasuring = false;
        let stopResizeObserver;
        const checkMeasuring = () => {
            const newValue = this.column.isAutoHeaderHeight();
            if (newValue && !isMeasuring) {
                startMeasuring();
            }
            if (!newValue && isMeasuring) {
                stopMeasuring();
            }
        };
        const startMeasuring = () => {
            isMeasuring = true;
            measureHeight(0);
            this.comp.addOrRemoveCssClass('ag-header-cell-auto-height', true);
            stopResizeObserver = this.resizeObserverService.observeResize(wrapperElement, () => measureHeight(0));
        };
        const stopMeasuring = () => {
            isMeasuring = false;
            if (stopResizeObserver) {
                stopResizeObserver();
            }
            this.comp.addOrRemoveCssClass('ag-header-cell-auto-height', false);
            stopResizeObserver = undefined;
        };
        checkMeasuring();
        this.addDestroyFunc(() => stopMeasuring());
        // In theory we could rely on the resize observer for everything - but since it's debounced
        // it can be a little janky for smooth movement. in this case its better to react to our own events
        // And unfortunately we cant _just_ rely on our own events, since custom components can change whenever
        this.addManagedListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, () => isMeasuring && measureHeight(0));
        // Displaying the sort icon changes the available area for text, so sort changes can affect height
        this.addManagedListener(this.eventService, column_1.Column.EVENT_SORT_CHANGED, () => {
            // Rendering changes for sort, happen after the event... not ideal
            if (isMeasuring) {
                this.beans.frameworkOverrides.setTimeout(() => measureHeight(0));
            }
        });
        this.addRefreshFunction(checkMeasuring);
    }
    refreshAriaSort() {
        if (this.sortable) {
            const translate = this.localeService.getLocaleTextFunc();
            const sort = this.sortController.getDisplaySortForColumn(this.column) || null;
            this.comp.setAriaSort(aria_1.getAriaSortState(sort));
            this.setAriaDescriptionProperty('sort', translate('ariaSortableColumn', 'Press ENTER to sort.'));
        }
        else {
            this.comp.setAriaSort();
            this.setAriaDescriptionProperty('sort', null);
        }
    }
    refreshAriaMenu() {
        if (this.menuEnabled) {
            const translate = this.localeService.getLocaleTextFunc();
            this.setAriaDescriptionProperty('menu', translate('ariaMenuColumn', 'Press CTRL ENTER to open column menu.'));
        }
        else {
            this.setAriaDescriptionProperty('menu', null);
        }
    }
    setAriaDescriptionProperty(property, value) {
        if (value != null) {
            this.ariaDescriptionProperties.set(property, value);
        }
        else {
            this.ariaDescriptionProperties.delete(property);
        }
    }
    refreshAriaDescription() {
        const descriptionArray = Array.from(this.ariaDescriptionProperties.values());
        this.comp.setAriaDescription(descriptionArray.length ? descriptionArray.join(' ') : undefined);
    }
    refreshAria() {
        this.refreshAriaSort();
        this.refreshAriaMenu();
        this.refreshAriaDescription();
    }
    addColumnHoverListener() {
        const listener = () => {
            if (!this.gridOptionsService.is('columnHoverHighlight')) {
                return;
            }
            const isHovered = this.columnHoverService.isHovered(this.column);
            this.comp.addOrRemoveCssClass('ag-column-hover', isHovered);
        };
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    }
    setupFilterCss() {
        const listener = () => {
            this.comp.addOrRemoveCssClass('ag-header-cell-filtered', this.column.isFilterActive());
        };
        this.addManagedListener(this.column, column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, listener);
        listener();
    }
    setupColId() {
        this.comp.setColId(this.column.getColId());
    }
    addActiveHeaderMouseListeners() {
        const listener = (e) => this.setActiveHeader(e.type === 'mouseenter');
        this.addManagedListener(this.getGui(), 'mouseenter', listener);
        this.addManagedListener(this.getGui(), 'mouseleave', listener);
    }
    setActiveHeader(active) {
        this.comp.addOrRemoveCssClass('ag-header-active', active);
    }
}
__decorate([
    context_1.Autowired('columnModel')
], HeaderCellCtrl.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('columnHoverService')
], HeaderCellCtrl.prototype, "columnHoverService", void 0);
__decorate([
    context_1.Autowired('sortController')
], HeaderCellCtrl.prototype, "sortController", void 0);
__decorate([
    context_1.Autowired('menuFactory')
], HeaderCellCtrl.prototype, "menuFactory", void 0);
__decorate([
    context_1.Autowired('dragAndDropService')
], HeaderCellCtrl.prototype, "dragAndDropService", void 0);
__decorate([
    context_1.Autowired('resizeObserverService')
], HeaderCellCtrl.prototype, "resizeObserverService", void 0);
__decorate([
    context_1.Autowired('gridApi')
], HeaderCellCtrl.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('columnApi')
], HeaderCellCtrl.prototype, "columnApi", void 0);
__decorate([
    context_1.PreDestroy
], HeaderCellCtrl.prototype, "removeDragSource", null);
exports.HeaderCellCtrl = HeaderCellCtrl;
