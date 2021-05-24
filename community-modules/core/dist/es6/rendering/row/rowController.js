/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
import { RowNode } from "../../entities/rowNode";
import { Events } from "../../events";
import { Constants } from "../../constants/constants";
import { setAriaExpanded, setAriaLabel, setAriaRowIndex, setAriaSelected } from "../../utils/aria";
import { addCssClass, addOrRemoveCssClass, addStylesToElement, isElementChildOfClass, removeCssClass } from "../../utils/dom";
import { exists, find } from "../../utils/generic";
import { isStopPropagationForAgGrid } from "../../utils/event";
import { assign } from "../../utils/object";
import { cssStyleObjectToMarkup } from "../../utils/general";
import { AngularRowUtils } from "./angularRowUtils";
import { executeNextVMTurn } from "../../utils/function";
import { BeanStub } from "../../context/beanStub";
import { convertToMap } from "../../utils/map";
import { RowDragComp } from "./rowDragComp";
export var RowType;
(function (RowType) {
    RowType["Normal"] = "Normal";
    RowType["FullWidth"] = "FullWidth";
    RowType["FullWidthLoading"] = "FullWidthLoading";
    RowType["FullWidthGroup"] = "FullWidthGroup";
    RowType["FullWidthDetail"] = "FullWidthDetail";
})(RowType || (RowType = {}));
export var FullWidthRenderers = convertToMap([
    [RowType.FullWidthLoading, 'agLoadingCellRenderer'],
    [RowType.FullWidthGroup, 'agGroupRowRenderer'],
    [RowType.FullWidthDetail, 'agDetailCellRenderer']
]);
export var FullWidthKeys = convertToMap([
    [RowType.FullWidth, 'fullWidthCellRenderer'],
    [RowType.FullWidthLoading, 'loadingCellRenderer'],
    [RowType.FullWidthGroup, 'groupRowRenderer'],
    [RowType.FullWidthDetail, 'detailCellRenderer']
]);
var instanceIdSequence = 0;
var RowController = /** @class */ (function (_super) {
    __extends(RowController, _super);
    function RowController(parentScope, rowNode, beans, animateIn, useAnimationFrameForCreate, printLayout) {
        var _this = _super.call(this) || this;
        _this.instanceId = instanceIdSequence++;
        _this.allRowComps = [];
        _this.active = true;
        _this.centerCols = [];
        _this.leftCols = [];
        _this.rightCols = [];
        _this.lastMouseDownOnDragger = false;
        _this.updateColumnListsPending = false;
        _this.parentScope = parentScope;
        _this.beans = beans;
        _this.rowNode = rowNode;
        _this.rowIsEven = _this.rowNode.rowIndex % 2 === 0;
        _this.paginationPage = _this.beans.paginationProxy.getCurrentPage();
        _this.useAnimationFrameForCreate = useAnimationFrameForCreate;
        _this.printLayout = printLayout;
        _this.setAnimateFlags(animateIn);
        _this.rowFocused = _this.beans.focusController.isRowFocused(_this.rowNode.rowIndex, _this.rowNode.rowPinned);
        _this.setupAngular1Scope();
        _this.rowLevel = _this.beans.rowCssClassCalculator.calculateRowLevel(_this.rowNode);
        _this.setRowType();
        _this.updateColumnLists(!_this.useAnimationFrameForCreate);
        _this.addListeners();
        if (_this.slideRowIn) {
            executeNextVMTurn(_this.onTopChanged.bind(_this));
        }
        if (_this.fadeRowIn) {
            executeNextVMTurn(function () {
                _this.allRowComps.forEach(function (rowComp) { return removeCssClass(rowComp.getGui(), 'ag-opacity-zero'); });
            });
        }
        return _this;
    }
    RowController.prototype.getInstanceId = function () {
        return this.instanceId;
    };
    RowController.prototype.setLeftRowComp = function (rowComp) {
        if (this.leftRowComp) {
            console.error('AG Grid - should not set leftRowComp twice');
        }
        this.leftRowComp = rowComp;
        this.allRowComps.push(rowComp);
    };
    RowController.prototype.setRightRowComp = function (rowComp) {
        if (this.rightRowComp) {
            console.error('AG Grid - should not set rightRowComp twice');
        }
        this.rightRowComp = rowComp;
        this.allRowComps.push(rowComp);
    };
    RowController.prototype.setCenterRowComp = function (rowComp) {
        if (this.centerRowComp) {
            console.error('AG Grid - should not set centerRowComp twice');
        }
        this.centerRowComp = rowComp;
        this.allRowComps.push(rowComp);
    };
    RowController.prototype.setFullWidthRowComp = function (rowComp) {
        if (this.fullWidthRowComp) {
            console.error('AG Grid - should not set fullWidthRowComp twice');
        }
        this.fullWidthRowComp = rowComp;
        this.allRowComps.push(rowComp);
    };
    RowController.prototype.getColsForRowComp = function (pinned) {
        switch (pinned) {
            case Constants.PINNED_RIGHT: return this.rightCols;
            case Constants.PINNED_LEFT: return this.leftCols;
            default: return this.centerCols;
        }
    };
    RowController.prototype.getScope = function () {
        return this.scope;
    };
    RowController.prototype.isPrintLayout = function () {
        return this.printLayout;
    };
    RowController.prototype.setupAngular1Scope = function () {
        var scopeResult = AngularRowUtils.createChildScopeOrNull(this.rowNode, this.parentScope, this.beans.gridOptionsWrapper);
        if (scopeResult) {
            this.scope = scopeResult.scope;
            this.addDestroyFunc(scopeResult.scopeDestroyFunc);
        }
    };
    RowController.prototype.getCellForCol = function (column) {
        var cellComp = this.getRenderedCellForColumn(column);
        return cellComp ? cellComp.getGui() : null;
    };
    RowController.prototype.executeProcessRowPostCreateFunc = function () {
        var func = this.beans.gridOptionsWrapper.getProcessRowPostCreateFunc();
        if (!func) {
            return;
        }
        var params = {
            eRow: this.centerRowComp ? this.centerRowComp.getGui() : undefined,
            ePinnedLeftRow: this.leftRowComp ? this.leftRowComp.getGui() : undefined,
            ePinnedRightRow: this.rightRowComp ? this.rightRowComp.getGui() : undefined,
            node: this.rowNode,
            api: this.beans.gridOptionsWrapper.getApi(),
            rowIndex: this.rowNode.rowIndex,
            addRenderedRowListener: this.addEventListener.bind(this),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        };
        func(params);
    };
    RowController.prototype.setRowType = function () {
        var isStub = this.rowNode.stub;
        var isFullWidthCell = this.rowNode.isFullWidthCell();
        var isDetailCell = this.beans.doingMasterDetail && this.rowNode.detail;
        var pivotMode = this.beans.columnController.isPivotMode();
        // we only use full width for groups, not footers. it wouldn't make sense to include footers if not looking
        // for totals. if users complain about this, then we should introduce a new property 'footerUseEntireRow'
        // so each can be set independently (as a customer complained about footers getting full width, hence
        // introducing this logic)
        var isGroupRow = !!this.rowNode.group && !this.rowNode.footer;
        var isFullWidthGroup = isGroupRow && this.beans.gridOptionsWrapper.isGroupUseEntireRow(pivotMode);
        if (isStub) {
            this.rowType = RowType.FullWidthLoading;
        }
        else if (isDetailCell) {
            this.rowType = RowType.FullWidthDetail;
        }
        else if (isFullWidthCell) {
            this.rowType = RowType.FullWidth;
        }
        else if (isFullWidthGroup) {
            this.rowType = RowType.FullWidthGroup;
        }
        else {
            this.rowType = RowType.Normal;
        }
    };
    RowController.prototype.updateColumnLists = function (suppressAnimationFrame) {
        var _this = this;
        if (suppressAnimationFrame === void 0) { suppressAnimationFrame = false; }
        if (this.isFullWidth()) {
            return;
        }
        var noAnimation = suppressAnimationFrame
            || this.beans.gridOptionsWrapper.isSuppressAnimationFrame()
            || this.printLayout;
        if (noAnimation) {
            this.updateColumnListsImpl();
            return;
        }
        if (this.updateColumnListsPending) {
            return;
        }
        this.beans.taskQueue.createTask(function () {
            if (!_this.active) {
                return;
            }
            _this.updateColumnListsImpl();
        }, this.rowNode.rowIndex, 'createTasksP1');
        this.updateColumnListsPending = true;
    };
    RowController.prototype.updateColumnListsImpl = function () {
        this.updateColumnListsPending = false;
        if (this.printLayout) {
            this.centerCols = this.beans.columnController.getAllDisplayedColumns();
            this.leftCols = [];
            this.rightCols = [];
        }
        else {
            this.centerCols = this.beans.columnController.getViewportCenterColumnsForRow(this.rowNode);
            this.leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
            this.rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        }
        this.allRowComps.forEach(function (rc) { return rc.onColumnChanged(); });
    };
    RowController.prototype.setAnimateFlags = function (animateIn) {
        if (animateIn) {
            var oldRowTopExists = exists(this.rowNode.oldRowTop);
            // if the row had a previous position, we slide it in (animate row top)
            this.slideRowIn = oldRowTopExists;
            // if the row had no previous position, we fade it in (animate
            this.fadeRowIn = !oldRowTopExists;
        }
        else {
            this.slideRowIn = false;
            this.fadeRowIn = false;
        }
    };
    RowController.prototype.isEditing = function () {
        return this.editingRow;
    };
    RowController.prototype.stopRowEditing = function (cancel) {
        this.stopEditing(cancel);
    };
    RowController.prototype.isFullWidth = function () {
        return this.rowType !== RowType.Normal;
    };
    RowController.prototype.getRowType = function () {
        return this.rowType;
    };
    RowController.prototype.refreshFullWidth = function () {
        var _this = this;
        // returns 'true' if refresh succeeded
        var tryRefresh = function (rowComp, pinned) {
            if (!rowComp) {
                return true;
            } // no refresh needed
            var cellComp = rowComp.getFullWidthRowComp();
            if (!cellComp) {
                return true;
            } // no refresh needed
            // no refresh method present, so can't refresh, hard refresh needed
            if (!cellComp.refresh) {
                return false;
            }
            var params = _this.createFullWidthParams(rowComp.getGui(), pinned);
            var refreshSucceeded = cellComp.refresh(params);
            return refreshSucceeded;
        };
        var normalSuccess = tryRefresh(this.fullWidthRowComp, null);
        var bodySuccess = tryRefresh(this.centerRowComp, null);
        var leftSuccess = tryRefresh(this.leftRowComp, Constants.PINNED_LEFT);
        var rightSuccess = tryRefresh(this.rightRowComp, Constants.PINNED_RIGHT);
        var allFullWidthRowsRefreshed = normalSuccess && bodySuccess && leftSuccess && rightSuccess;
        return allFullWidthRowsRefreshed;
    };
    RowController.prototype.addListeners = function () {
        this.addManagedListener(this.rowNode, RowNode.EVENT_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_TOP_CHANGED, this.onTopChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_EXPANDED_CHANGED, this.updateExpandedCss.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_HAS_CHILDREN_CHANGED, this.updateExpandedCss.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onRowNodeDataChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.onRowNodeCellChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_HIGHLIGHT_CHANGED, this.onRowNodeHighlightChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_DRAGGING_CHANGED, this.onRowNodeDraggingChanged.bind(this));
        this.addManagedListener(this.rowNode, RowNode.EVENT_UI_LEVEL_CHANGED, this.onUiLevelChanged.bind(this));
        var eventService = this.beans.eventService;
        this.addManagedListener(eventService, Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED, this.onPaginationPixelOffsetChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, this.onTopChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_CELL_FOCUSED, this.onCellFocusChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addManagedListener(eventService, Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addManagedListener(eventService, Events.EVENT_COLUMN_MOVED, this.onColumnMoved.bind(this));
        this.addListenersForCellComps();
    };
    RowController.prototype.onColumnMoved = function () {
        this.updateColumnLists();
    };
    RowController.prototype.addListenersForCellComps = function () {
        var _this = this;
        this.addManagedListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, function () {
            _this.forEachCellComp(function (cellComp) { return cellComp.onRowIndexChanged(); });
        });
        this.addManagedListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, function (event) {
            _this.forEachCellComp(function (cellComp) { return cellComp.onCellChanged(event); });
        });
    };
    RowController.prototype.onRowNodeDataChanged = function (event) {
        // if this is an update, we want to refresh, as this will allow the user to put in a transition
        // into the cellRenderer refresh method. otherwise this might be completely new data, in which case
        // we will want to completely replace the cells
        this.forEachCellComp(function (cellComp) {
            return cellComp.refreshCell({
                suppressFlash: !event.update,
                newData: !event.update
            });
        });
        // check for selected also, as this could be after lazy loading of the row data, in which case
        // the id might of just gotten set inside the row and the row selected state may of changed
        // as a result. this is what happens when selected rows are loaded in virtual pagination.
        // - niall note - since moving to the stub component, this may no longer be true, as replacing
        // the stub component now replaces the entire row
        this.onRowSelected();
        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    };
    RowController.prototype.onRowNodeCellChanged = function () {
        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    };
    RowController.prototype.postProcessCss = function () {
        this.postProcessStylesFromGridOptions();
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
        this.postProcessRowDragging();
    };
    RowController.prototype.onRowNodeHighlightChanged = function () {
        var highlighted = this.rowNode.highlighted;
        this.allRowComps.forEach(function (rowComp) {
            var eGui = rowComp.getGui();
            removeCssClass(eGui, 'ag-row-highlight-above');
            removeCssClass(eGui, 'ag-row-highlight-below');
            if (highlighted) {
                addCssClass(eGui, 'ag-row-highlight-' + highlighted);
            }
        });
    };
    RowController.prototype.onRowNodeDraggingChanged = function () {
        this.postProcessRowDragging();
    };
    RowController.prototype.postProcessRowDragging = function () {
        var dragging = this.rowNode.dragging;
        this.allRowComps.forEach(function (rowComp) { return addOrRemoveCssClass(rowComp.getGui(), 'ag-row-dragging', dragging); });
    };
    RowController.prototype.updateExpandedCss = function () {
        var expandable = this.rowNode.isExpandable();
        var expanded = this.rowNode.expanded == true;
        this.allRowComps.forEach(function (rowComp) {
            var eRow = rowComp.getGui();
            addOrRemoveCssClass(eRow, 'ag-row-group', expandable);
            addOrRemoveCssClass(eRow, 'ag-row-group-expanded', expandable && expanded);
            addOrRemoveCssClass(eRow, 'ag-row-group-contracted', expandable && !expanded);
            setAriaExpanded(eRow, expandable && expanded);
        });
    };
    RowController.prototype.onDisplayedColumnsChanged = function () {
        // we skip animations for onDisplayedColumnChanged, as otherwise the client could remove columns and
        // then set data, and any old valueGetter's (ie from cols that were removed) would still get called.
        this.updateColumnLists(true);
    };
    RowController.prototype.onVirtualColumnsChanged = function () {
        this.updateColumnLists();
    };
    RowController.prototype.getRowPosition = function () {
        return {
            rowPinned: this.rowNode.rowPinned,
            rowIndex: this.rowNode.rowIndex
        };
    };
    RowController.prototype.onKeyboardNavigate = function (keyboardEvent) {
        var currentFullWidthComp = find(this.allRowComps, function (rowComp) { return rowComp.getGui().contains(keyboardEvent.target); });
        var currentFullWidthContainer = currentFullWidthComp ? currentFullWidthComp.getGui() : null;
        var isFullWidthContainerFocused = currentFullWidthContainer === keyboardEvent.target;
        if (!isFullWidthContainerFocused) {
            return;
        }
        var node = this.rowNode;
        var lastFocusedCell = this.beans.focusController.getFocusedCell();
        var cellPosition = {
            rowIndex: node.rowIndex,
            rowPinned: node.rowPinned,
            column: (lastFocusedCell && lastFocusedCell.column)
        };
        this.beans.rowRenderer.navigateToNextCell(keyboardEvent, keyboardEvent.keyCode, cellPosition, true);
        keyboardEvent.preventDefault();
    };
    RowController.prototype.onTabKeyDown = function (keyboardEvent) {
        if (keyboardEvent.defaultPrevented || isStopPropagationForAgGrid(keyboardEvent)) {
            return;
        }
        var currentFullWidthComp = find(this.allRowComps, function (rowComp) { return rowComp.getGui().contains(keyboardEvent.target); });
        var currentFullWidthContainer = currentFullWidthComp ? currentFullWidthComp.getGui() : null;
        var isFullWidthContainerFocused = currentFullWidthContainer === keyboardEvent.target;
        var nextEl = null;
        if (!isFullWidthContainerFocused) {
            nextEl = this.beans.focusController.findNextFocusableElement(currentFullWidthContainer, false, keyboardEvent.shiftKey);
        }
        if ((this.isFullWidth() && isFullWidthContainerFocused) || !nextEl) {
            this.beans.rowRenderer.onTabKeyDown(this, keyboardEvent);
        }
    };
    RowController.prototype.onFullWidthRowFocused = function (event) {
        var node = this.rowNode;
        var isFocused = this.isFullWidth() && event.rowIndex === node.rowIndex && event.rowPinned == node.rowPinned;
        var element = this.fullWidthRowComp ? this.fullWidthRowComp.getGui() : this.centerRowComp.getGui();
        addOrRemoveCssClass(element, 'ag-full-width-focus', isFocused);
        if (isFocused) {
            // we don't scroll normal rows into view when we focus them, so we don't want
            // to scroll Full Width rows either.
            element.focus({ preventScroll: true });
        }
    };
    RowController.prototype.refreshCell = function (cellComp) {
        this.allRowComps.forEach(function (rc) { return rc.destroyCells([cellComp]); });
        this.updateColumnLists();
    };
    RowController.prototype.onMouseEvent = function (eventName, mouseEvent) {
        switch (eventName) {
            case 'dblclick':
                this.onRowDblClick(mouseEvent);
                break;
            case 'click':
                this.onRowClick(mouseEvent);
                break;
            case 'mousedown':
                this.onRowMouseDown(mouseEvent);
                break;
        }
    };
    RowController.prototype.createRowEvent = function (type, domEvent) {
        return {
            type: type,
            node: this.rowNode,
            data: this.rowNode.data,
            rowIndex: this.rowNode.rowIndex,
            rowPinned: this.rowNode.rowPinned,
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            event: domEvent
        };
    };
    RowController.prototype.createRowEventWithSource = function (type, domEvent) {
        var event = this.createRowEvent(type, domEvent);
        // when first developing this, we included the rowComp in the event.
        // this seems very weird. so when introducing the event types, i left the 'source'
        // out of the type, and just include the source in the two places where this event
        // was fired (rowClicked and rowDoubleClicked). it doesn't make sense for any
        // users to be using this, as the rowComp isn't an object we expose, so would be
        // very surprising if a user was using it.
        event.source = this;
        return event;
    };
    RowController.prototype.onRowDblClick = function (mouseEvent) {
        if (isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        var agEvent = this.createRowEventWithSource(Events.EVENT_ROW_DOUBLE_CLICKED, mouseEvent);
        this.beans.eventService.dispatchEvent(agEvent);
    };
    RowController.prototype.onRowMouseDown = function (mouseEvent) {
        this.lastMouseDownOnDragger = isElementChildOfClass(mouseEvent.target, 'ag-row-drag', 3);
        if (!this.isFullWidth()) {
            return;
        }
        var node = this.rowNode;
        var columnController = this.beans.columnController;
        this.beans.focusController.setFocusedCell(node.rowIndex, columnController.getAllDisplayedColumns()[0], node.rowPinned, true);
    };
    RowController.prototype.onRowClick = function (mouseEvent) {
        var stop = isStopPropagationForAgGrid(mouseEvent) || this.lastMouseDownOnDragger;
        if (stop) {
            return;
        }
        var agEvent = this.createRowEventWithSource(Events.EVENT_ROW_CLICKED, mouseEvent);
        this.beans.eventService.dispatchEvent(agEvent);
        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        var shiftKeyPressed = mouseEvent.shiftKey;
        // we do not allow selecting the group by clicking, when groupSelectChildren, as the logic to
        // handle this is broken. to observe, change the logic below and allow groups to be selected.
        // you will see the group gets selected, then all children get selected, then the grid unselects
        // the children (as the default behaviour when clicking is to unselect other rows) which results
        // in the group getting unselected (as all children are unselected). the correct thing would be
        // to change this, so that children of the selected group are not then subsequenly un-selected.
        var groupSelectsChildren = this.beans.gridOptionsWrapper.isGroupSelectsChildren();
        if (
        // we do not allow selecting groups by clicking (as the click here expands the group), or if it's a detail row,
        // so return if it's a group row
        (groupSelectsChildren && this.rowNode.group) ||
            // this is needed so we don't unselect other rows when we click this row, eg if this row is not selectable,
            // and we click it, the selection should not change (ie any currently selected row should stay selected)
            !this.rowNode.selectable ||
            // we also don't allow selection of pinned rows
            this.rowNode.rowPinned ||
            // if no selection method enabled, do nothing
            !this.beans.gridOptionsWrapper.isRowSelection() ||
            // if click selection suppressed, do nothing
            this.beans.gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }
        var multiSelectOnClick = this.beans.gridOptionsWrapper.isRowMultiSelectWithClick();
        var rowDeselectionWithCtrl = !this.beans.gridOptionsWrapper.isSuppressRowDeselection();
        if (this.rowNode.isSelected()) {
            if (multiSelectOnClick) {
                this.rowNode.setSelectedParams({ newValue: false });
            }
            else if (multiSelectKeyPressed) {
                if (rowDeselectionWithCtrl) {
                    this.rowNode.setSelectedParams({ newValue: false });
                }
            }
            else {
                // selected with no multi key, must make sure anything else is unselected
                this.rowNode.setSelectedParams({ newValue: !shiftKeyPressed, clearSelection: !shiftKeyPressed, rangeSelect: shiftKeyPressed });
            }
        }
        else {
            var clearSelection = multiSelectOnClick ? false : !multiSelectKeyPressed;
            this.rowNode.setSelectedParams({ newValue: true, clearSelection: clearSelection, rangeSelect: shiftKeyPressed });
        }
    };
    RowController.prototype.setupDetailRowAutoHeight = function (eDetailGui) {
        var _this = this;
        if (!this.beans.gridOptionsWrapper.isDetailRowAutoHeight()) {
            return;
        }
        var checkRowSizeFunc = function () {
            var clientHeight = eDetailGui.clientHeight;
            // if the UI is not ready, the height can be 0, which we ignore, as otherwise a flicker will occur
            // as UI goes from the default height, to 0, then to the real height as UI becomes ready. this means
            // it's not possible for have 0 as auto-height, however this is an improbable use case, as even an
            // empty detail grid would still have some styling around it giving at least a few pixels.
            if (clientHeight != null && clientHeight > 0) {
                // we do the update in a timeout, to make sure we are not calling from inside the grid
                // doing another update
                var updateRowHeightFunc = function () {
                    _this.rowNode.setRowHeight(clientHeight);
                    if (_this.beans.clientSideRowModel) {
                        _this.beans.clientSideRowModel.onRowHeightChanged();
                    }
                    else if (_this.beans.serverSideRowModel) {
                        _this.beans.serverSideRowModel.onRowHeightChanged();
                    }
                };
                _this.beans.frameworkOverrides.setTimeout(updateRowHeightFunc, 0);
            }
        };
        var resizeObserverDestroyFunc = this.beans.resizeObserverService.observeResize(eDetailGui, checkRowSizeFunc);
        this.addDestroyFunc(resizeObserverDestroyFunc);
        checkRowSizeFunc();
    };
    RowController.prototype.createFullWidthParams = function (eRow, pinned) {
        var _this = this;
        var params = {
            fullWidth: true,
            data: this.rowNode.data,
            node: this.rowNode,
            value: this.rowNode.key,
            valueFormatted: this.rowNode.key,
            $scope: this.scope ? this.scope : this.parentScope,
            $compile: this.beans.$compile,
            rowIndex: this.rowNode.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            // these need to be taken out, as part of 'afterAttached' now
            eGridCell: eRow,
            eParentOfValue: eRow,
            pinned: pinned,
            addRenderedRowListener: this.addEventListener.bind(this),
            registerRowDragger: function (rowDraggerElement, dragStartPixels, value) { return _this.addFullWidthRowDragging(rowDraggerElement, dragStartPixels, value); }
        };
        return params;
    };
    RowController.prototype.addFullWidthRowDragging = function (rowDraggerElement, dragStartPixels, value) {
        if (value === void 0) { value = ''; }
        if (!this.isFullWidth()) {
            return;
        }
        var rowDragComp = new RowDragComp(function () { return value; }, this.rowNode, undefined, rowDraggerElement, dragStartPixels);
        this.createManagedBean(rowDragComp, this.beans.context);
    };
    RowController.prototype.onUiLevelChanged = function () {
        var newLevel = this.beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);
        if (this.rowLevel != newLevel) {
            var classToAdd_1 = 'ag-row-level-' + newLevel;
            var classToRemove_1 = 'ag-row-level-' + this.rowLevel;
            this.allRowComps.forEach(function (rowComp) {
                var eGui = rowComp.getGui();
                addCssClass(eGui, classToAdd_1);
                removeCssClass(eGui, classToRemove_1);
            });
        }
        this.rowLevel = newLevel;
    };
    RowController.prototype.isFirstRowOnPage = function () {
        return this.rowNode.rowIndex === this.beans.paginationProxy.getPageFirstRow();
    };
    RowController.prototype.isLastRowOnPage = function () {
        return this.rowNode.rowIndex === this.beans.paginationProxy.getPageLastRow();
    };
    RowController.prototype.onModelUpdated = function () {
        var newFirst = this.isFirstRowOnPage();
        var newLast = this.isLastRowOnPage();
        if (this.firstRowOnPage !== newFirst) {
            this.firstRowOnPage = newFirst;
            this.allRowComps.forEach(function (rowComp) { return addOrRemoveCssClass(rowComp.getGui(), 'ag-row-first', newFirst); });
        }
        if (this.lastRowOnPage !== newLast) {
            this.lastRowOnPage = newLast;
            this.allRowComps.forEach(function (rowComp) { return addOrRemoveCssClass(rowComp.getGui(), 'ag-row-last', newLast); });
        }
    };
    RowController.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.forEachCellComp(function (renderedCell) {
            renderedCell.stopEditing(cancel);
        });
        if (!this.editingRow) {
            return;
        }
        if (!cancel) {
            var event_1 = this.createRowEvent(Events.EVENT_ROW_VALUE_CHANGED);
            this.beans.eventService.dispatchEvent(event_1);
        }
        this.setEditingRow(false);
    };
    RowController.prototype.setEditingRow = function (value) {
        this.editingRow = value;
        this.allRowComps.forEach(function (rowComp) { return addOrRemoveCssClass(rowComp.getGui(), 'ag-row-editing', value); });
        var event = value ?
            this.createRowEvent(Events.EVENT_ROW_EDITING_STARTED)
            : this.createRowEvent(Events.EVENT_ROW_EDITING_STOPPED);
        this.beans.eventService.dispatchEvent(event);
    };
    RowController.prototype.startRowEditing = function (keyPress, charPress, sourceRenderedCell) {
        if (keyPress === void 0) { keyPress = null; }
        if (charPress === void 0) { charPress = null; }
        if (sourceRenderedCell === void 0) { sourceRenderedCell = null; }
        // don't do it if already editing
        if (this.editingRow) {
            return;
        }
        this.forEachCellComp(function (renderedCell) {
            var cellStartedEdit = renderedCell === sourceRenderedCell;
            if (cellStartedEdit) {
                renderedCell.startEditingIfEnabled(keyPress, charPress, cellStartedEdit);
            }
            else {
                renderedCell.startEditingIfEnabled(null, null, cellStartedEdit);
            }
        });
        this.setEditingRow(true);
    };
    RowController.prototype.forEachCellComp = function (callback) {
        this.allRowComps.forEach(function (rc) { return rc.forEachCellComp(callback); });
    };
    RowController.prototype.postProcessClassesFromGridOptions = function () {
        var _this = this;
        var cssClasses = this.beans.rowCssClassCalculator.processClassesFromGridOptions(this.rowNode, this.scope);
        if (!cssClasses || !cssClasses.length) {
            return;
        }
        cssClasses.forEach(function (classStr) {
            _this.allRowComps.forEach(function (rowComp) { return addCssClass(rowComp.getGui(), classStr); });
        });
    };
    RowController.prototype.postProcessRowClassRules = function () {
        var _this = this;
        this.beans.rowCssClassCalculator.processRowClassRules(this.rowNode, this.scope, function (className) {
            _this.allRowComps.forEach(function (rowComp) { return addCssClass(rowComp.getGui(), className); });
        }, function (className) {
            _this.allRowComps.forEach(function (rowComp) { return removeCssClass(rowComp.getGui(), className); });
        });
    };
    RowController.prototype.postProcessStylesFromGridOptions = function () {
        var rowStyles = this.processStylesFromGridOptions();
        this.allRowComps.forEach(function (rowComp) { return addStylesToElement(rowComp.getGui(), rowStyles); });
    };
    RowController.prototype.getInitialRowTopStyle = function () {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) {
            return '';
        }
        // if sliding in, we take the old row top. otherwise we just set the current row top.
        var pixels = this.slideRowIn ? this.roundRowTopToBounds(this.rowNode.oldRowTop) : this.rowNode.rowTop;
        var afterPaginationPixels = this.applyPaginationOffset(pixels);
        // we don't apply scaling if row is pinned
        var afterScalingPixels = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.rowContainerHeightService.getRealPixelPosition(afterPaginationPixels);
        var isSuppressRowTransform = this.beans.gridOptionsWrapper.isSuppressRowTransform();
        return isSuppressRowTransform ? "top: " + afterScalingPixels + "px; " : "transform: translateY(" + afterScalingPixels + "px);";
    };
    RowController.prototype.getRowBusinessKey = function () {
        var businessKeyForNodeFunc = this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc();
        if (typeof businessKeyForNodeFunc !== 'function') {
            return;
        }
        return businessKeyForNodeFunc(this.rowNode);
    };
    RowController.prototype.getInitialRowClasses = function (pinned) {
        var params = {
            rowNode: this.rowNode,
            rowFocused: this.rowFocused,
            fadeRowIn: this.fadeRowIn,
            rowIsEven: this.rowIsEven,
            rowLevel: this.rowLevel,
            fullWidthRow: this.isFullWidth(),
            firstRowOnPage: this.isFirstRowOnPage(),
            lastRowOnPage: this.isLastRowOnPage(),
            printLayout: this.printLayout,
            expandable: this.rowNode.isExpandable(),
            scope: this.scope,
            pinned: pinned
        };
        return this.beans.rowCssClassCalculator.getInitialRowClasses(params);
    };
    RowController.prototype.preProcessStylesFromGridOptions = function () {
        var rowStyles = this.processStylesFromGridOptions();
        return cssStyleObjectToMarkup(rowStyles);
    };
    RowController.prototype.processStylesFromGridOptions = function () {
        // part 1 - rowStyle
        var rowStyle = this.beans.gridOptionsWrapper.getRowStyle();
        if (rowStyle && typeof rowStyle === 'function') {
            console.warn('AG Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            return;
        }
        // part 1 - rowStyleFunc
        var rowStyleFunc = this.beans.gridOptionsWrapper.getRowStyleFunc();
        var rowStyleFuncResult;
        if (rowStyleFunc) {
            var params = {
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex,
                $scope: this.scope,
                api: this.beans.gridOptionsWrapper.getApi(),
                columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
                context: this.beans.gridOptionsWrapper.getContext()
            };
            rowStyleFuncResult = rowStyleFunc(params);
        }
        return assign({}, rowStyle, rowStyleFuncResult);
    };
    RowController.prototype.onRowSelected = function () {
        var _this = this;
        var selected = this.rowNode.isSelected();
        this.allRowComps.forEach(function (rowComp) {
            var eGui = rowComp.getGui();
            setAriaSelected(eGui, selected);
            addOrRemoveCssClass(eGui, 'ag-row-selected', selected);
            _this.refreshAriaLabel(eGui, selected);
        });
    };
    RowController.prototype.refreshAriaLabel = function (node, selected) {
        if (selected && this.beans.gridOptionsWrapper.isSuppressRowDeselection()) {
            node.removeAttribute('aria-label');
            return;
        }
        var translate = this.beans.gridOptionsWrapper.getLocaleTextFunc();
        var label = translate(selected ? 'ariaRowDeselect' : 'ariaRowSelect', "Press SPACE to " + (selected ? 'deselect' : 'select') + " this row.");
        setAriaLabel(node, label);
    };
    RowController.prototype.isUseAnimationFrameForCreate = function () {
        return this.useAnimationFrameForCreate;
    };
    RowController.prototype.addHoverFunctionality = function (eRow) {
        var _this = this;
        // because we use animation frames to do this, it's possible the row no longer exists
        // by the time we get to add it
        if (!this.active) {
            return;
        }
        // because mouseenter and mouseleave do not propagate, we cannot listen on the gridPanel
        // like we do for all the other mouse events.
        // because of the pinning, we cannot simply add / remove the class based on the eRow. we
        // have to check all eRow's (body & pinned). so the trick is if any of the rows gets a
        // mouse hover, it sets such in the rowNode, and then all three reflect the change as
        // all are listening for event on the row node.
        // step 1 - add listener, to set flag on row node
        this.addManagedListener(eRow, 'mouseenter', function () { return _this.rowNode.onMouseEnter(); });
        this.addManagedListener(eRow, 'mouseleave', function () { return _this.rowNode.onMouseLeave(); });
        // step 2 - listen for changes on row node (which any eRow can trigger)
        this.addManagedListener(this.rowNode, RowNode.EVENT_MOUSE_ENTER, function () {
            // if hover turned off, we don't add the class. we do this here so that if the application
            // toggles this property mid way, we remove the hover form the last row, but we stop
            // adding hovers from that point onwards.
            if (!_this.beans.gridOptionsWrapper.isSuppressRowHoverHighlight()) {
                addCssClass(eRow, 'ag-row-hover');
            }
        });
        this.addManagedListener(this.rowNode, RowNode.EVENT_MOUSE_LEAVE, function () {
            removeCssClass(eRow, 'ag-row-hover');
        });
    };
    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    RowController.prototype.roundRowTopToBounds = function (rowTop) {
        var gridBodyCon = this.beans.controllersService.getGridBodyController();
        var range = gridBodyCon.getScrollFeature().getVScrollPosition();
        var minPixel = this.applyPaginationOffset(range.top, true) - 100;
        var maxPixel = this.applyPaginationOffset(range.bottom, true) + 100;
        return Math.min(Math.max(minPixel, rowTop), maxPixel);
    };
    RowController.prototype.getFrameworkOverrides = function () {
        return this.beans.frameworkOverrides;
    };
    RowController.prototype.onRowHeightChanged = function () {
        // check for exists first - if the user is resetting the row height, then
        // it will be null (or undefined) momentarily until the next time the flatten
        // stage is called where the row will then update again with a new height
        if (exists(this.rowNode.rowHeight)) {
            var heightPx_1 = this.rowNode.rowHeight + "px";
            this.allRowComps.forEach(function (rowComp) { return rowComp.getGui().style.height = heightPx_1; });
        }
    };
    RowController.prototype.addEventListener = function (eventType, listener) {
        if (eventType === 'renderedRowRemoved' || eventType === 'rowRemoved') {
            eventType = Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('AG Grid: Since version 11, event renderedRowRemoved is now called ' + Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        _super.prototype.addEventListener.call(this, eventType, listener);
    };
    RowController.prototype.removeEventListener = function (eventType, listener) {
        if (eventType === 'renderedRowRemoved' || eventType === 'rowRemoved') {
            eventType = Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('AG Grid: Since version 11, event renderedRowRemoved and rowRemoved is now called ' + Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        _super.prototype.removeEventListener.call(this, eventType, listener);
    };
    // note - this is NOT called by context, as we don't wire / unwire the CellComp for performance reasons.
    RowController.prototype.destroyFirstPass = function () {
        this.active = false;
        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?
        this.setupRemoveAnimation();
        var event = this.createRowEvent(Events.EVENT_VIRTUAL_ROW_REMOVED);
        this.dispatchEvent(event);
        this.beans.eventService.dispatchEvent(event);
        _super.prototype.destroy.call(this);
    };
    RowController.prototype.setupRemoveAnimation = function () {
        var rowStillVisibleJustNotInViewport = this.rowNode.rowTop != null;
        if (rowStillVisibleJustNotInViewport) {
            // if the row is not rendered, but in viewport, it means it has moved,
            // so we animate the row out. if the new location is very far away,
            // the animation will be so fast the row will look like it's just disappeared,
            // so instead we animate to a position just outside the viewport.
            var rowTop = this.roundRowTopToBounds(this.rowNode.rowTop);
            this.setRowTop(rowTop);
        }
        else {
            this.allRowComps.forEach(function (rowComp) {
                addCssClass(rowComp.getGui(), 'ag-opacity-zero');
            });
        }
    };
    RowController.prototype.destroySecondPass = function () {
        this.allRowComps.forEach(function (c) { return c.destroy(); });
        this.allRowComps.length = 0;
    };
    RowController.prototype.onCellFocusChanged = function () {
        var rowFocused = this.beans.focusController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);
        if (rowFocused !== this.rowFocused) {
            this.allRowComps.forEach(function (rowComp) {
                var eRow = rowComp.getGui();
                addOrRemoveCssClass(eRow, 'ag-row-focus', rowFocused);
                addOrRemoveCssClass(eRow, 'ag-row-no-focus', !rowFocused);
            });
            this.rowFocused = rowFocused;
        }
        // if we are editing, then moving the focus out of a row will stop editing
        if (!rowFocused && this.editingRow) {
            this.stopEditing(false);
        }
    };
    RowController.prototype.onPaginationChanged = function () {
        var currentPage = this.beans.paginationProxy.getCurrentPage();
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        if (this.paginationPage !== currentPage) {
            this.paginationPage = currentPage;
            this.onTopChanged();
        }
    };
    RowController.prototype.onTopChanged = function () {
        this.setRowTop(this.rowNode.rowTop);
    };
    RowController.prototype.onPaginationPixelOffsetChanged = function () {
        // the pixel offset is used when calculating rowTop to set on the row DIV
        this.onTopChanged();
    };
    // applies pagination offset, eg if on second page, and page height is 500px, then removes
    // 500px from the top position, so a row with rowTop 600px is displayed at location 100px.
    // reverse will take the offset away rather than add.
    RowController.prototype.applyPaginationOffset = function (topPx, reverse) {
        if (reverse === void 0) { reverse = false; }
        if (this.rowNode.isRowPinned()) {
            return topPx;
        }
        var pixelOffset = this.beans.paginationProxy.getPixelOffset();
        var multiplier = reverse ? 1 : -1;
        return topPx + (pixelOffset * multiplier);
    };
    RowController.prototype.setRowTop = function (pixels) {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) {
            return;
        }
        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (exists(pixels)) {
            var afterPaginationPixels = this.applyPaginationOffset(pixels);
            var afterScalingPixels = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.rowContainerHeightService.getRealPixelPosition(afterPaginationPixels);
            var topPx_1 = afterScalingPixels + "px";
            var suppressRowTransform_1 = this.beans.gridOptionsWrapper.isSuppressRowTransform();
            this.allRowComps.forEach(function (rowComp) {
                var eGui = rowComp.getGui();
                if (suppressRowTransform_1) {
                    eGui.style.top = topPx_1;
                }
                else {
                    eGui.style.transform = "translateY(" + topPx_1 + ")";
                }
            });
        }
    };
    RowController.prototype.getRowNode = function () {
        return this.rowNode;
    };
    RowController.prototype.getRenderedCellForColumn = function (column) {
        var cellComps = this.allRowComps.map(function (rc) { return rc.getCellComp(column.getColId()); });
        var cellComp = find(cellComps, function (c) { return !!c; });
        if (cellComp) {
            return cellComp;
        }
        var spannedCellComps = this.allRowComps.map(function (rc) { return rc.getCellCompSpanned(column); });
        cellComp = find(spannedCellComps, function (c) { return !!c; });
        return cellComp || null;
    };
    RowController.prototype.onRowIndexChanged = function () {
        // we only bother updating if the rowIndex is present. if it is not present, it means this row
        // is child of a group node, and the group node was closed, it's the only way to have no row index.
        // when this happens, row is about to be de-rendered, so we don't care, rowComp is about to die!
        if (this.rowNode.rowIndex != null) {
            this.onCellFocusChanged();
            this.updateRowIndexes();
        }
    };
    RowController.prototype.updateRowIndexes = function () {
        var _this = this;
        var rowIndexStr = this.rowNode.getRowIndexString();
        var rowIsEven = this.rowNode.rowIndex % 2 === 0;
        var rowIsEvenChanged = this.rowIsEven !== rowIsEven;
        var headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();
        if (rowIsEvenChanged) {
            this.rowIsEven = rowIsEven;
        }
        this.allRowComps.forEach(function (rowComp) {
            var eRow = rowComp.getGui();
            eRow.setAttribute('row-index', rowIndexStr);
            setAriaRowIndex(eRow, headerRowCount + _this.rowNode.rowIndex + 1);
            if (!rowIsEvenChanged) {
                return;
            }
            addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
            addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
        });
    };
    // returns the pinned left container, either the normal one, or the embedded full with one if exists
    RowController.prototype.getPinnedLeftRowElement = function () {
        return this.leftRowComp ? this.leftRowComp.getGui() : undefined;
    };
    // returns the pinned right container, either the normal one, or the embedded full with one if exists
    RowController.prototype.getPinnedRightRowElement = function () {
        return this.rightRowComp ? this.rightRowComp.getGui() : undefined;
    };
    // returns the body container, either the normal one, or the embedded full with one if exists
    RowController.prototype.getBodyRowElement = function () {
        return this.centerRowComp ? this.centerRowComp.getGui() : undefined;
    };
    // returns the full width container
    RowController.prototype.getFullWidthRowElement = function () {
        return this.fullWidthRowComp ? this.fullWidthRowComp.getGui() : undefined;
    };
    RowController.DOM_DATA_KEY_RENDERED_ROW = 'renderedRow';
    return RowController;
}(BeanStub));
export { RowController };
