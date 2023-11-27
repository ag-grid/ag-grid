var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { KeyCode } from '../../../constants/keyCode.mjs';
import { Autowired } from "../../../context/context.mjs";
import { DragAndDropService, DragSourceType } from "../../../dragAndDrop/dragAndDropService.mjs";
import { Column } from "../../../entities/column.mjs";
import { Events } from "../../../eventKeys.mjs";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature.mjs";
import { getAriaSortState } from "../../../utils/aria.mjs";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature.mjs";
import { TooltipFeature } from "../../../widgets/tooltipFeature.mjs";
import { AbstractHeaderCellCtrl } from "../abstractCell/abstractHeaderCellCtrl.mjs";
import { CssClassApplier } from "../cssClassApplier.mjs";
import { HoverFeature } from "../hoverFeature.mjs";
import { ResizeFeature } from "./resizeFeature.mjs";
import { SelectAllFeature } from "./selectAllFeature.mjs";
import { getElementSize, getInnerWidth } from "../../../utils/dom.mjs";
import { ColumnMoveHelper } from "../../columnMoveHelper.mjs";
import { HorizontalDirection } from "../../../constants/direction.mjs";
export class HeaderCellCtrl extends AbstractHeaderCellCtrl {
    constructor(column, parentRowCtrl) {
        super(column, parentRowCtrl);
        this.refreshFunctions = [];
        this.userHeaderClasses = new Set();
        this.ariaDescriptionProperties = new Map();
        this.column = column;
    }
    setComp(comp, eGui, eResize, eHeaderCompWrapper) {
        this.comp = comp;
        this.setGui(eGui);
        this.updateState();
        this.setupWidth();
        this.setupMovingCss();
        this.setupMenuClass();
        this.setupSortableClass();
        this.setupWrapTextClass();
        this.refreshSpanHeaderHeight();
        this.setupAutoHeight(eHeaderCompWrapper);
        this.addColumnHoverListener();
        this.setupFilterClass();
        this.setupClassesFromColDef();
        this.setupTooltip();
        this.addActiveHeaderMouseListeners();
        this.setupSelectAll();
        this.setupUserComp();
        this.refreshAria();
        this.resizeFeature = this.createManagedBean(new ResizeFeature(this.getPinned(), this.column, eResize, comp, this));
        this.createManagedBean(new HoverFeature([this.column], eGui));
        this.createManagedBean(new SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: e => this.shouldStopEventPropagation(e),
            onTabKeyDown: () => null,
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this),
            onFocusOut: this.onFocusOut.bind(this)
        }));
        this.addResizeAndMoveKeyboardListeners();
        this.addManagedPropertyListeners(['suppressMovableColumns', 'suppressMenuHide', 'suppressAggFuncInHeader'], this.refresh.bind(this));
        this.addManagedListener(this.column, Column.EVENT_COL_DEF_CHANGED, this.refresh.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, this.onColumnPivotChanged.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_HEADER_HEIGHT_CHANGED, this.onHeaderHeightChanged.bind(this));
    }
    resizeHeader(direction, shiftKey) {
        var _a, _b;
        if (!this.column.isResizable()) {
            return;
        }
        const pinned = this.column.getPinned();
        const isRtl = this.gridOptionsService.get('enableRtl');
        const actualWidth = this.column.getActualWidth();
        const minWidth = (_a = this.column.getMinWidth()) !== null && _a !== void 0 ? _a : 0;
        const maxWidth = (_b = this.column.getMaxWidth()) !== null && _b !== void 0 ? _b : Number.MAX_SAFE_INTEGER;
        let isLeft = direction === HorizontalDirection.Left;
        if (pinned) {
            if (isRtl !== (pinned === 'right')) {
                isLeft = !isLeft;
            }
        }
        const diff = (isLeft ? -1 : 1) * this.resizeMultiplier;
        const newWidth = Math.min(Math.max(actualWidth + diff, minWidth), maxWidth);
        if (pinned) {
            const leftWidth = this.pinnedWidthService.getPinnedLeftWidth();
            const rightWidth = this.pinnedWidthService.getPinnedRightWidth();
            const bodyWidth = getInnerWidth(this.ctrlsService.getGridBodyCtrl().getBodyViewportElement()) - 50;
            if (leftWidth + rightWidth + diff > bodyWidth) {
                return;
            }
        }
        this.columnModel.setColumnWidths([{ key: this.column, newWidth }], shiftKey, true);
    }
    moveHeader(hDirection) {
        const { eGui, column, columnModel, gridOptionsService, ctrlsService } = this;
        const pinned = this.getPinned();
        const left = eGui.getBoundingClientRect().left;
        const width = column.getActualWidth();
        const isRtl = gridOptionsService.get('enableRtl');
        const isLeft = hDirection === HorizontalDirection.Left !== isRtl;
        const xPosition = ColumnMoveHelper.normaliseX(isLeft ? (left - 20) : (left + width + 20), pinned, true, gridOptionsService, ctrlsService);
        ColumnMoveHelper.attemptMoveColumns({
            allMovingColumns: [column],
            isFromHeader: true,
            hDirection,
            xPosition,
            pinned,
            fromEnter: false,
            fakeEvent: false,
            gridOptionsService,
            columnModel
        });
        ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(column, 'auto');
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
        const params = {
            column: this.column,
            displayName: this.displayName,
            enableSorting: this.column.isSortable(),
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
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context,
            eGridHeader: this.getGui()
        };
        return params;
    }
    setupSelectAll() {
        this.selectAllFeature = this.createManagedBean(new SelectAllFeature(this.column));
        this.selectAllFeature.setComp(this);
    }
    getSelectAllGui() {
        return this.selectAllFeature.getCheckboxGui();
    }
    handleKeyDown(e) {
        super.handleKeyDown(e);
        if (e.key === KeyCode.SPACE) {
            this.selectAllFeature.onSpaceKeyDown(e);
        }
        if (e.key === KeyCode.ENTER) {
            this.onEnterKeyDown(e);
        }
    }
    onEnterKeyDown(e) {
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
        const tooltipFeature = this.createManagedBean(new TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.eGui);
        this.refreshFunctions.push(() => tooltipFeature.refreshToolTip());
    }
    setupClassesFromColDef() {
        const refreshHeaderClasses = () => {
            const colDef = this.column.getColDef();
            const classes = CssClassApplier.getHeaderClassesFromColDef(colDef, this.gridOptionsService, this.column, null);
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
        if (!eSource || !this.draggable) {
            return;
        }
        const { column, columnModel, displayName, dragAndDropService, gridOptionsService } = this;
        let hideColumnOnExit = !this.gridOptionsService.get('suppressDragLeaveHidesColumns');
        const dragSource = this.dragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eSource,
            getDefaultIconName: () => hideColumnOnExit ? DragAndDropService.ICON_HIDE : DragAndDropService.ICON_NOT_ALLOWED,
            getDragItem: () => this.createDragItem(column),
            dragItemName: displayName,
            onDragStarted: () => {
                hideColumnOnExit = !gridOptionsService.get('suppressDragLeaveHidesColumns');
                column.setMoving(true, "uiColumnMoved");
            },
            onDragStopped: () => column.setMoving(false, "uiColumnMoved"),
            onGridEnter: (dragItem) => {
                var _a;
                if (hideColumnOnExit) {
                    const unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(col => !col.getColDef().lockVisible)) || [];
                    columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: (dragItem) => {
                var _a;
                if (hideColumnOnExit) {
                    const unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(col => !col.getColDef().lockVisible)) || [];
                    columnModel.setColumnsVisible(unlockedColumns, false, "uiColumnMoved");
                }
            },
        };
        dragAndDropService.addDragSource(dragSource, true);
    }
    createDragItem(column) {
        const visibleState = {};
        visibleState[column.getId()] = column.isVisible();
        return {
            columns: [column],
            visibleState: visibleState
        };
    }
    updateState() {
        const colDef = this.column.getColDef();
        this.menuEnabled = this.menuFactory.isMenuEnabled(this.column) && !colDef.suppressMenu;
        this.sortable = this.column.isSortable();
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
        const isSuppressMovableColumns = this.gridOptionsService.get('suppressMovableColumns');
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
        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, listener);
        listener();
    }
    setupMovingCss() {
        const listener = () => {
            // this is what makes the header go dark when it is been moved (gives impression to
            // user that the column was picked up).
            this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.column.isMoving());
        };
        this.addManagedListener(this.column, Column.EVENT_MOVING_CHANGED, listener);
        listener();
    }
    setupMenuClass() {
        const listener = () => {
            this.comp.addOrRemoveCssClass('ag-column-menu-visible', this.column.isMenuVisible());
        };
        this.addManagedListener(this.column, Column.EVENT_MENU_VISIBLE_CHANGED, listener);
        listener();
    }
    setupSortableClass() {
        const updateSortableCssClass = () => {
            this.comp.addOrRemoveCssClass('ag-header-cell-sortable', !!this.sortable);
        };
        updateSortableCssClass();
        this.addRefreshFunction(updateSortableCssClass);
        this.addManagedListener(this.eventService, Column.EVENT_SORT_CHANGED, this.refreshAriaSort.bind(this));
    }
    setupFilterClass() {
        const listener = () => {
            const isFilterActive = this.column.isFilterActive();
            this.comp.addOrRemoveCssClass('ag-header-cell-filtered', isFilterActive);
            this.refreshAria();
        };
        this.addManagedListener(this.column, Column.EVENT_FILTER_ACTIVE_CHANGED, listener);
        listener();
    }
    setupWrapTextClass() {
        const listener = () => {
            const wrapText = !!this.column.getColDef().wrapHeaderText;
            this.comp.addOrRemoveCssClass('ag-header-cell-wrap-text', wrapText);
        };
        listener();
        this.addRefreshFunction(listener);
    }
    onDisplayedColumnsChanged() {
        super.onDisplayedColumnsChanged();
        if (!this.isAlive()) {
            return;
        }
        this.onHeaderHeightChanged();
    }
    onHeaderHeightChanged() {
        this.refreshSpanHeaderHeight();
    }
    refreshSpanHeaderHeight() {
        const { eGui, column, comp, columnModel, gridOptionsService } = this;
        if (!column.isSpanHeaderHeight()) {
            eGui.style.removeProperty('top');
            eGui.style.removeProperty('height');
            comp.addOrRemoveCssClass('ag-header-span-height', false);
            comp.addOrRemoveCssClass('ag-header-span-total', false);
            return;
        }
        const { numberOfParents, isSpanningTotal } = this.getColumnGroupPaddingInfo();
        comp.addOrRemoveCssClass('ag-header-span-height', numberOfParents > 0);
        const headerHeight = columnModel.getColumnHeaderRowHeight();
        if (numberOfParents === 0) {
            // if spanning has stopped then need to reset these values.
            comp.addOrRemoveCssClass('ag-header-span-total', false);
            eGui.style.setProperty('top', `0px`);
            eGui.style.setProperty('height', `${headerHeight}px`);
            return;
        }
        comp.addOrRemoveCssClass('ag-header-span-total', isSpanningTotal);
        const pivotMode = gridOptionsService.get('pivotMode');
        const groupHeaderHeight = pivotMode
            ? columnModel.getPivotGroupHeaderHeight()
            : columnModel.getGroupHeaderHeight();
        const extraHeight = numberOfParents * groupHeaderHeight;
        eGui.style.setProperty('top', `${-extraHeight}px`);
        eGui.style.setProperty('height', `${headerHeight + extraHeight}px`);
    }
    getColumnGroupPaddingInfo() {
        let parent = this.column.getParent();
        if (!parent || !parent.isPadding()) {
            return { numberOfParents: 0, isSpanningTotal: false };
        }
        const numberOfParents = parent.getPaddingLevel() + 1;
        let isSpanningTotal = true;
        while (parent) {
            if (!parent.isPadding()) {
                isSpanningTotal = false;
                break;
            }
            parent = parent.getParent();
        }
        return { numberOfParents, isSpanningTotal };
    }
    setupAutoHeight(wrapperElement) {
        const measureHeight = (timesCalled) => {
            if (!this.isAlive()) {
                return;
            }
            const { paddingTop, paddingBottom, borderBottomWidth, borderTopWidth } = getElementSize(this.getGui());
            const extraHeight = paddingTop + paddingBottom + borderBottomWidth + borderTopWidth;
            const wrapperHeight = wrapperElement.offsetHeight;
            const autoHeight = wrapperHeight + extraHeight;
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
        this.addManagedListener(this.column, Column.EVENT_WIDTH_CHANGED, () => isMeasuring && measureHeight(0));
        // Displaying the sort icon changes the available area for text, so sort changes can affect height
        this.addManagedListener(this.eventService, Column.EVENT_SORT_CHANGED, () => {
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
            this.comp.setAriaSort(getAriaSortState(sort));
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
    refreshAriaFiltered() {
        const translate = this.localeService.getLocaleTextFunc();
        const isFilterActive = this.column.isFilterActive();
        if (isFilterActive) {
            this.setAriaDescriptionProperty('filter', translate('ariaColumnFiltered', 'Column Filtered'));
        }
        else {
            this.setAriaDescriptionProperty('filter', null);
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
        let ariaDescription = null;
        for (const [key, value] of this.ariaDescriptionProperties) {
            // always announce filtered state first
            if (key === 'filter') {
                ariaDescription = `${value} ${ariaDescription || ''}`;
            }
            else {
                ariaDescription = `${ariaDescription || ''} ${value}`;
            }
        }
        this.comp.setAriaDescription(ariaDescription !== null && ariaDescription !== void 0 ? ariaDescription : undefined);
    }
    refreshAria() {
        this.refreshAriaSort();
        this.refreshAriaMenu();
        this.refreshAriaFiltered();
        this.refreshAriaDescription();
    }
    addColumnHoverListener() {
        const listener = () => {
            if (!this.gridOptionsService.get('columnHoverHighlight')) {
                return;
            }
            const isHovered = this.columnHoverService.isHovered(this.column);
            this.comp.addOrRemoveCssClass('ag-column-hover', isHovered);
        };
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_HOVER_CHANGED, listener);
        listener();
    }
    getColId() {
        return this.column.getColId();
    }
    addActiveHeaderMouseListeners() {
        const listener = (e) => this.setActiveHeader(e.type === 'mouseenter');
        this.addManagedListener(this.getGui(), 'mouseenter', listener);
        this.addManagedListener(this.getGui(), 'mouseleave', listener);
    }
    setActiveHeader(active) {
        this.comp.addOrRemoveCssClass('ag-header-active', active);
    }
    destroy() {
        super.destroy();
        this.refreshFunctions = null;
        this.selectAllFeature = null;
        this.dragSourceElement = null;
        this.userCompDetails = null;
        this.userHeaderClasses = null;
        this.ariaDescriptionProperties = null;
    }
}
__decorate([
    Autowired('columnModel')
], HeaderCellCtrl.prototype, "columnModel", void 0);
__decorate([
    Autowired('pinnedWidthService')
], HeaderCellCtrl.prototype, "pinnedWidthService", void 0);
__decorate([
    Autowired('columnHoverService')
], HeaderCellCtrl.prototype, "columnHoverService", void 0);
__decorate([
    Autowired('sortController')
], HeaderCellCtrl.prototype, "sortController", void 0);
__decorate([
    Autowired('menuFactory')
], HeaderCellCtrl.prototype, "menuFactory", void 0);
__decorate([
    Autowired('resizeObserverService')
], HeaderCellCtrl.prototype, "resizeObserverService", void 0);
__decorate([
    Autowired('gridApi')
], HeaderCellCtrl.prototype, "gridApi", void 0);
