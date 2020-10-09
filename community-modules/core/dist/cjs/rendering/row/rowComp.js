/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v24.1.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var cellComp_1 = require("../cellComp");
var rowNode_1 = require("../../entities/rowNode");
var events_1 = require("../../events");
var component_1 = require("../../widgets/component");
var constants_1 = require("../../constants/constants");
var moduleNames_1 = require("../../modules/moduleNames");
var moduleRegistry_1 = require("../../modules/moduleRegistry");
var aria_1 = require("../../utils/aria");
var string_1 = require("../../utils/string");
var dom_1 = require("../../utils/dom");
var array_1 = require("../../utils/array");
var generic_1 = require("../../utils/generic");
var event_1 = require("../../utils/event");
var object_1 = require("../../utils/object");
var general_1 = require("../../utils/general");
var angularRowUtils_1 = require("./angularRowUtils");
var RowComp = /** @class */ (function (_super) {
    __extends(RowComp, _super);
    function RowComp(parentScope, bodyContainerComp, pinnedLeftContainerComp, pinnedRightContainerComp, fullWidthContainerComp, rowNode, beans, animateIn, useAnimationFrameForCreate, printLayout, embedFullWidth) {
        var _this = _super.call(this) || this;
        _this.eAllRowContainers = [];
        _this.fullWidthRowDestroyFuncs = [];
        _this.active = true;
        _this.rowContainerReadyCount = 0;
        _this.refreshNeeded = false;
        _this.columnRefreshPending = false;
        _this.cellComps = {};
        // for animations, there are bits we want done in the next VM turn, to all DOM to update first.
        // instead of each row doing a setTimeout(func,0), we put the functions here and the rowRenderer
        // executes them all in one timeout
        _this.createSecondPassFuncs = [];
        // these get called before the row is destroyed - they set up the DOM for the remove animation (ie they
        // set the DOM up for the animation), then the delayedDestroyFunctions get called when the animation is
        // complete (ie removes from the dom).
        _this.removeFirstPassFuncs = [];
        // for animations, these functions get called 400ms after the row is cleared, called by the rowRenderer
        // so each row isn't setting up it's own timeout
        _this.removeSecondPassFuncs = [];
        _this.initialised = false;
        _this.elementOrderChanged = false;
        _this.lastMouseDownOnDragger = false;
        _this.parentScope = parentScope;
        _this.beans = beans;
        _this.bodyContainerComp = bodyContainerComp;
        _this.pinnedLeftContainerComp = pinnedLeftContainerComp;
        _this.pinnedRightContainerComp = pinnedRightContainerComp;
        _this.fullWidthContainerComp = fullWidthContainerComp;
        _this.rowNode = rowNode;
        _this.rowIsEven = _this.rowNode.rowIndex % 2 === 0;
        _this.paginationPage = _this.beans.paginationProxy.getCurrentPage();
        _this.useAnimationFrameForCreate = useAnimationFrameForCreate;
        _this.printLayout = printLayout;
        _this.embedFullWidth = embedFullWidth;
        _this.setAnimateFlags(animateIn);
        return _this;
    }
    RowComp.prototype.init = function () {
        var _this = this;
        this.rowFocused = this.beans.focusController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);
        this.setupAngular1Scope();
        this.rowLevel = this.beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);
        this.setupRowContainers();
        this.addListeners();
        if (this.slideRowIn) {
            this.createSecondPassFuncs.push(function () {
                _this.onTopChanged();
            });
        }
        if (this.fadeRowIn) {
            this.createSecondPassFuncs.push(function () {
                _this.eAllRowContainers.forEach(function (eRow) { return dom_1.removeCssClass(eRow, 'ag-opacity-zero'); });
            });
        }
    };
    RowComp.prototype.setupAngular1Scope = function () {
        var scopeResult = angularRowUtils_1.AngularRowUtils.createChildScopeOrNull(this.rowNode, this.parentScope, this.beans.gridOptionsWrapper);
        if (scopeResult) {
            this.scope = scopeResult.scope;
            this.addDestroyFunc(scopeResult.scopeDestroyFunc);
        }
    };
    RowComp.prototype.createTemplate = function (contents, extraCssClass) {
        if (extraCssClass === void 0) { extraCssClass = null; }
        var templateParts = [];
        var rowHeight = this.rowNode.rowHeight;
        var rowClasses = this.getInitialRowClasses(extraCssClass).join(' ');
        var rowIdSanitised = string_1.escapeString(this.rowNode.id);
        var userRowStyles = this.preProcessStylesFromGridOptions();
        var businessKey = this.getRowBusinessKey();
        var businessKeySanitised = string_1.escapeString(businessKey);
        var rowTopStyle = this.getInitialRowTopStyle();
        var rowIdx = this.rowNode.getRowIndexString();
        var headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();
        templateParts.push("<div");
        templateParts.push(" role=\"row\"");
        templateParts.push(" row-index=\"" + rowIdx + "\" aria-rowindex=\"" + (headerRowCount + this.rowNode.rowIndex + 1) + "\"");
        templateParts.push(rowIdSanitised ? " row-id=\"" + rowIdSanitised + "\"" : "");
        templateParts.push(businessKey ? " row-business-key=\"" + businessKeySanitised + "\"" : "");
        templateParts.push(" comp-id=\"" + this.getCompId() + "\"");
        templateParts.push(" class=\"" + rowClasses + "\"");
        if (this.beans.gridOptionsWrapper.isRowSelection()) {
            templateParts.push(" aria-selected=\"" + (this.rowNode.isSelected() ? 'true' : 'false') + "\"");
        }
        if (this.rowNode.group) {
            templateParts.push(" aria-expanded=" + (this.rowNode.expanded ? 'true' : 'false'));
        }
        templateParts.push(" style=\"height: " + rowHeight + "px; " + rowTopStyle + " " + userRowStyles + "\">");
        // add in the template for the cells
        templateParts.push(contents);
        templateParts.push("</div>");
        return templateParts.join('');
    };
    RowComp.prototype.getCellForCol = function (column) {
        var cellComp = this.cellComps[column.getColId()];
        return cellComp ? cellComp.getGui() : null;
    };
    RowComp.prototype.afterFlush = function () {
        if (this.initialised) {
            return;
        }
        this.initialised = true;
        this.executeProcessRowPostCreateFunc();
    };
    RowComp.prototype.executeProcessRowPostCreateFunc = function () {
        var func = this.beans.gridOptionsWrapper.getProcessRowPostCreateFunc();
        if (!func) {
            return;
        }
        var params = {
            eRow: this.eBodyRow,
            ePinnedLeftRow: this.ePinnedLeftRow,
            ePinnedRightRow: this.ePinnedRightRow,
            node: this.rowNode,
            api: this.beans.gridOptionsWrapper.getApi(),
            rowIndex: this.rowNode.rowIndex,
            addRenderedRowListener: this.addEventListener.bind(this),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext()
        };
        func(params);
    };
    RowComp.prototype.getInitialRowTopStyle = function () {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) {
            return '';
        }
        // if sliding in, we take the old row top. otherwise we just set the current row top.
        var pixels = this.slideRowIn ? this.roundRowTopToBounds(this.rowNode.oldRowTop) : this.rowNode.rowTop;
        var afterPaginationPixels = this.applyPaginationOffset(pixels);
        // we don't apply scaling if row is pinned
        var afterScalingPixels = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.maxDivHeightScaler.getRealPixelPosition(afterPaginationPixels);
        var isSuppressRowTransform = this.beans.gridOptionsWrapper.isSuppressRowTransform();
        return isSuppressRowTransform ? "top: " + afterScalingPixels + "px; " : "transform: translateY(" + afterScalingPixels + "px);";
    };
    RowComp.prototype.getRowBusinessKey = function () {
        var businessKeyForNodeFunc = this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc();
        if (typeof businessKeyForNodeFunc !== 'function') {
            return;
        }
        return businessKeyForNodeFunc(this.rowNode);
    };
    RowComp.prototype.areAllContainersReady = function () {
        return this.rowContainerReadyCount === 3;
    };
    RowComp.prototype.lazyCreateCells = function (cols, eRow) {
        if (!this.active) {
            return;
        }
        var cellTemplatesAndComps = this.createCells(cols);
        eRow.innerHTML = cellTemplatesAndComps.template;
        this.callAfterRowAttachedOnCells(cellTemplatesAndComps.cellComps, eRow);
        this.rowContainerReadyCount++;
        if (this.areAllContainersReady() && this.refreshNeeded) {
            this.refreshCells();
        }
    };
    RowComp.prototype.createRowContainer = function (rowContainerComp, cols, callback) {
        var _this = this;
        var useAnimationsFrameForCreate = this.useAnimationFrameForCreate;
        var cellTemplatesAndComps = useAnimationsFrameForCreate ? { cellComps: [], template: '' } : this.createCells(cols);
        var rowTemplate = this.createTemplate(cellTemplatesAndComps.template);
        // the RowRenderer is probably inserting many rows. rather than inserting each template one
        // at a time, the grid inserts all rows together - so the callback here is called by the
        // rowRenderer when all RowComps are created, then all the HTML is inserted in one go,
        // and then all the callbacks are called. this is NOT done in an animation frame.
        rowContainerComp.appendRowTemplate(rowTemplate, function () {
            var eRow = rowContainerComp.getRowElement(_this.getCompId());
            _this.refreshAriaLabel(eRow, _this.rowNode.isSelected());
            _this.afterRowAttached(rowContainerComp, eRow);
            callback(eRow);
            if (useAnimationsFrameForCreate) {
                _this.beans.taskQueue.createTask(_this.lazyCreateCells.bind(_this, cols, eRow), _this.rowNode.rowIndex, 'createTasksP1');
            }
            else {
                _this.callAfterRowAttachedOnCells(cellTemplatesAndComps.cellComps, eRow);
                _this.rowContainerReadyCount = 3;
            }
        });
    };
    RowComp.prototype.setupRowContainers = function () {
        var isFullWidthCell = this.rowNode.isFullWidthCell();
        var isDetailCell = this.beans.doingMasterDetail && this.rowNode.detail;
        var pivotMode = this.beans.columnController.isPivotMode();
        // we only use full width for groups, not footers. it wouldn't make sense to include footers if not looking
        // for totals. if users complain about this, then we should introduce a new property 'footerUseEntireRow'
        // so each can be set independently (as a customer complained about footers getting full width, hence
        // introducing this logic)
        var isGroupRow = this.rowNode.group && !this.rowNode.footer;
        var isFullWidthGroup = isGroupRow && this.beans.gridOptionsWrapper.isGroupUseEntireRow(pivotMode);
        if (this.rowNode.stub) {
            this.createFullWidthRows(RowComp.LOADING_CELL_RENDERER, RowComp.LOADING_CELL_RENDERER_COMP_NAME, false);
        }
        else if (isDetailCell) {
            this.createFullWidthRows(RowComp.DETAIL_CELL_RENDERER, RowComp.DETAIL_CELL_RENDERER_COMP_NAME, true);
        }
        else if (isFullWidthCell) {
            this.createFullWidthRows(RowComp.FULL_WIDTH_CELL_RENDERER, null, false);
        }
        else if (isFullWidthGroup) {
            this.createFullWidthRows(RowComp.GROUP_ROW_RENDERER, RowComp.GROUP_ROW_RENDERER_COMP_NAME, false);
        }
        else {
            this.setupNormalRowContainers();
        }
    };
    RowComp.prototype.setupNormalRowContainers = function () {
        var _this = this;
        var centerCols;
        var leftCols = [];
        var rightCols = [];
        if (this.printLayout) {
            centerCols = this.beans.columnController.getAllDisplayedColumns();
        }
        else {
            centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
            leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
            rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        }
        this.createRowContainer(this.bodyContainerComp, centerCols, function (eRow) { return _this.eBodyRow = eRow; });
        this.createRowContainer(this.pinnedRightContainerComp, rightCols, function (eRow) { return _this.ePinnedRightRow = eRow; });
        this.createRowContainer(this.pinnedLeftContainerComp, leftCols, function (eRow) { return _this.ePinnedLeftRow = eRow; });
    };
    RowComp.prototype.createFullWidthRows = function (type, name, detailRow) {
        var _this = this;
        this.fullWidthRow = true;
        if (this.embedFullWidth) {
            this.createFullWidthRowContainer(this.bodyContainerComp, null, null, type, name, function (eRow) {
                _this.eFullWidthRowBody = eRow;
            }, function (cellRenderer) {
                _this.fullWidthRowComponentBody = cellRenderer;
            }, detailRow);
            // printLayout doesn't put components into the pinned sections
            if (this.printLayout) {
                return;
            }
            this.createFullWidthRowContainer(this.pinnedLeftContainerComp, constants_1.Constants.PINNED_LEFT, 'ag-cell-last-left-pinned', type, name, function (eRow) {
                _this.eFullWidthRowLeft = eRow;
            }, function (cellRenderer) {
                _this.fullWidthRowComponentLeft = cellRenderer;
            }, detailRow);
            this.createFullWidthRowContainer(this.pinnedRightContainerComp, constants_1.Constants.PINNED_RIGHT, 'ag-cell-first-right-pinned', type, name, function (eRow) {
                _this.eFullWidthRowRight = eRow;
            }, function (cellRenderer) {
                _this.fullWidthRowComponentRight = cellRenderer;
            }, detailRow);
        }
        else {
            // otherwise we add to the fullWidth container as normal
            // let previousFullWidth = ensureDomOrder ? this.lastPlacedElements.eFullWidth : null;
            this.createFullWidthRowContainer(this.fullWidthContainerComp, null, null, type, name, function (eRow) {
                _this.eFullWidthRow = eRow;
            }, function (cellRenderer) {
                _this.fullWidthRowComponent = cellRenderer;
            }, detailRow);
        }
    };
    RowComp.prototype.setAnimateFlags = function (animateIn) {
        if (animateIn) {
            var oldRowTopExists = generic_1.exists(this.rowNode.oldRowTop);
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
    RowComp.prototype.isEditing = function () {
        return this.editingRow;
    };
    RowComp.prototype.stopRowEditing = function (cancel) {
        this.stopEditing(cancel);
    };
    RowComp.prototype.isFullWidth = function () {
        return this.fullWidthRow;
    };
    RowComp.prototype.refreshFullWidth = function () {
        var _this = this;
        // returns 'true' if refresh succeeded
        var tryRefresh = function (eRow, cellComp, pinned) {
            if (!eRow || !cellComp) {
                return true;
            } // no refresh needed
            // no refresh method present, so can't refresh, hard refresh needed
            if (!cellComp.refresh) {
                return false;
            }
            var params = _this.createFullWidthParams(eRow, pinned);
            var refreshSucceeded = cellComp.refresh(params);
            return refreshSucceeded;
        };
        var normalSuccess = tryRefresh(this.eFullWidthRow, this.fullWidthRowComponent, null);
        var bodySuccess = tryRefresh(this.eFullWidthRowBody, this.fullWidthRowComponentBody, null);
        var leftSuccess = tryRefresh(this.eFullWidthRowLeft, this.fullWidthRowComponentLeft, constants_1.Constants.PINNED_LEFT);
        var rightSuccess = tryRefresh(this.eFullWidthRowRight, this.fullWidthRowComponentRight, constants_1.Constants.PINNED_RIGHT);
        var allFullWidthRowsRefreshed = normalSuccess && bodySuccess && leftSuccess && rightSuccess;
        return allFullWidthRowsRefreshed;
    };
    RowComp.prototype.addListeners = function () {
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_TOP_CHANGED, this.onTopChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_EXPANDED_CHANGED, this.updateExpandedCss.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_HAS_CHILDREN_CHANGED, this.updateExpandedCss.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.onRowNodeDataChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.onRowNodeCellChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_HIGHLIGHT_CHANGED, this.onRowNodeHighlightChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_DRAGGING_CHANGED, this.onRowNodeDraggingChanged.bind(this));
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_UI_LEVEL_CHANGED, this.onUiLevelChanged.bind(this));
        var eventService = this.beans.eventService;
        this.addManagedListener(eventService, events_1.Events.EVENT_PAGINATION_PIXEL_OFFSET_CHANGED, this.onPaginationPixelOffsetChanged.bind(this));
        this.addManagedListener(eventService, events_1.Events.EVENT_HEIGHT_SCALE_CHANGED, this.onTopChanged.bind(this));
        this.addManagedListener(eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addManagedListener(eventService, events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addManagedListener(eventService, events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addManagedListener(eventService, events_1.Events.EVENT_CELL_FOCUSED, this.onCellFocusChanged.bind(this));
        this.addManagedListener(eventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addManagedListener(eventService, events_1.Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addManagedListener(eventService, events_1.Events.EVENT_COLUMN_MOVED, this.onColumnMoved.bind(this));
        this.addListenersForCellComps();
    };
    RowComp.prototype.addListenersForCellComps = function () {
        var _this = this;
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, function () {
            _this.forEachCellComp(function (cellComp) { return cellComp.onRowIndexChanged(); });
        });
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, function (event) {
            _this.forEachCellComp(function (cellComp) { return cellComp.onCellChanged(event); });
        });
    };
    RowComp.prototype.onRowNodeDataChanged = function (event) {
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
    RowComp.prototype.onRowNodeCellChanged = function () {
        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    };
    RowComp.prototype.postProcessCss = function () {
        this.postProcessStylesFromGridOptions();
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
        this.postProcessRowDragging();
    };
    RowComp.prototype.onRowNodeHighlightChanged = function () {
        var highlighted = this.rowNode.highlighted;
        this.eAllRowContainers.forEach(function (row) {
            dom_1.removeCssClass(row, 'ag-row-highlight-above');
            dom_1.removeCssClass(row, 'ag-row-highlight-below');
            if (highlighted) {
                dom_1.addCssClass(row, 'ag-row-highlight-' + highlighted);
            }
        });
    };
    RowComp.prototype.onRowNodeDraggingChanged = function () {
        this.postProcessRowDragging();
    };
    RowComp.prototype.postProcessRowDragging = function () {
        var dragging = this.rowNode.dragging;
        this.eAllRowContainers.forEach(function (row) { return dom_1.addOrRemoveCssClass(row, 'ag-row-dragging', dragging); });
    };
    RowComp.prototype.updateExpandedCss = function () {
        var expandable = this.rowNode.isExpandable();
        var expanded = this.rowNode.expanded == true;
        this.eAllRowContainers.forEach(function (eRow) {
            dom_1.addOrRemoveCssClass(eRow, 'ag-row-group', expandable);
            dom_1.addOrRemoveCssClass(eRow, 'ag-row-group-expanded', expandable && expanded);
            dom_1.addOrRemoveCssClass(eRow, 'ag-row-group-contracted', expandable && !expanded);
            aria_1.setAriaExpanded(eRow, expandable && expanded);
        });
    };
    RowComp.prototype.onDisplayedColumnsChanged = function () {
        if (this.fullWidthRow) {
            return;
        }
        this.refreshCells();
    };
    RowComp.prototype.destroyFullWidthComponents = function () {
        this.fullWidthRowDestroyFuncs.forEach(function (f) { return f(); });
        this.fullWidthRowDestroyFuncs = [];
        if (this.fullWidthRowComponent) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, null, this.fullWidthRowComponent);
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentBody) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, null, this.fullWidthRowComponentBody);
            this.fullWidthRowComponentBody = null;
        }
        if (this.fullWidthRowComponentLeft) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, constants_1.Constants.PINNED_LEFT, this.fullWidthRowComponentLeft);
            this.fullWidthRowComponentLeft = null;
        }
        if (this.fullWidthRowComponentRight) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, constants_1.Constants.PINNED_RIGHT, this.fullWidthRowComponentRight);
            this.fullWidthRowComponentRight = null;
        }
    };
    RowComp.prototype.getContainerForCell = function (pinnedType) {
        switch (pinnedType) {
            case constants_1.Constants.PINNED_LEFT: return this.ePinnedLeftRow;
            case constants_1.Constants.PINNED_RIGHT: return this.ePinnedRightRow;
            default: return this.eBodyRow;
        }
    };
    RowComp.prototype.onVirtualColumnsChanged = function () {
        if (this.fullWidthRow) {
            return;
        }
        this.refreshCells();
    };
    RowComp.prototype.onColumnResized = function () {
        if (this.fullWidthRow) {
            return;
        }
        this.refreshCells();
    };
    RowComp.prototype.refreshCells = function () {
        if (!this.areAllContainersReady()) {
            this.refreshNeeded = true;
            return;
        }
        var suppressAnimationFrame = this.beans.gridOptionsWrapper.isSuppressAnimationFrame();
        var skipAnimationFrame = suppressAnimationFrame || this.printLayout;
        if (skipAnimationFrame) {
            this.refreshCellsInAnimationFrame();
        }
        else {
            if (this.columnRefreshPending) {
                return;
            }
            this.beans.taskQueue.createTask(this.refreshCellsInAnimationFrame.bind(this), this.rowNode.rowIndex, 'createTasksP1');
        }
    };
    RowComp.prototype.refreshCellsInAnimationFrame = function () {
        if (!this.active) {
            return;
        }
        this.columnRefreshPending = false;
        var centerCols;
        var leftCols;
        var rightCols;
        if (this.printLayout) {
            centerCols = this.beans.columnController.getAllDisplayedColumns();
            leftCols = [];
            rightCols = [];
        }
        else {
            centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
            leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
            rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        }
        this.insertCellsIntoContainer(this.eBodyRow, centerCols);
        this.insertCellsIntoContainer(this.ePinnedLeftRow, leftCols);
        this.insertCellsIntoContainer(this.ePinnedRightRow, rightCols);
        this.elementOrderChanged = false;
        var colIdsToRemove = Object.keys(this.cellComps);
        centerCols.forEach(function (col) { return array_1.removeFromArray(colIdsToRemove, col.getId()); });
        leftCols.forEach(function (col) { return array_1.removeFromArray(colIdsToRemove, col.getId()); });
        rightCols.forEach(function (col) { return array_1.removeFromArray(colIdsToRemove, col.getId()); });
        // we never remove editing cells, as this would cause the cells to loose their values while editing
        // as the grid is scrolling horizontally.
        var eligibleToBeRemoved = colIdsToRemove.filter(this.isCellEligibleToBeRemoved.bind(this));
        // remove old cells from gui, but we don't destroy them, we might use them again
        this.destroyCells(eligibleToBeRemoved);
    };
    RowComp.prototype.onColumnMoved = function () {
        this.elementOrderChanged = true;
    };
    RowComp.prototype.destroyCells = function (colIds) {
        var _this = this;
        colIds.forEach(function (key) {
            var cellComp = _this.cellComps[key];
            // could be old reference, ie removed cell
            if (generic_1.missing(cellComp)) {
                return;
            }
            cellComp.detach();
            cellComp.destroy();
            _this.cellComps[key] = null;
        });
    };
    RowComp.prototype.isCellEligibleToBeRemoved = function (indexStr) {
        var displayedColumns = this.beans.columnController.getAllDisplayedColumns();
        var REMOVE_CELL = true;
        var KEEP_CELL = false;
        var renderedCell = this.cellComps[indexStr];
        // always remove the cell if it's not rendered or if it's in the wrong pinned location
        if (!renderedCell || this.isCellInWrongRow(renderedCell)) {
            return REMOVE_CELL;
        }
        // we want to try and keep editing and focused cells
        var editing = renderedCell.isEditing();
        var focused = this.beans.focusController.isCellFocused(renderedCell.getCellPosition());
        var mightWantToKeepCell = editing || focused;
        if (mightWantToKeepCell) {
            var column = renderedCell.getColumn();
            var cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        }
        return REMOVE_CELL;
    };
    RowComp.prototype.ensureCellInCorrectContainer = function (cellComp) {
        // for print layout, we always put cells into centre, otherwise we put in correct pinned section
        if (this.printLayout) {
            return;
        }
        var element = cellComp.getGui();
        var column = cellComp.getColumn();
        var pinnedType = column.getPinned();
        var eContainer = this.getContainerForCell(pinnedType);
        // if in wrong container, remove it
        var eOldContainer = cellComp.getParentRow();
        var inWrongRow = eOldContainer !== eContainer;
        if (inWrongRow) {
            // take out from old row
            if (eOldContainer) {
                eOldContainer.removeChild(element);
            }
            eContainer.appendChild(element);
            cellComp.setParentRow(eContainer);
            this.elementOrderChanged = true;
        }
    };
    RowComp.prototype.isCellInWrongRow = function (cellComp) {
        var column = cellComp.getColumn();
        var rowWeWant = this.getContainerForCell(column.getPinned());
        var oldRow = cellComp.getParentRow(); // if in wrong container, remove it
        return oldRow !== rowWeWant;
    };
    RowComp.prototype.insertCellsIntoContainer = function (eRow, cols) {
        var _this = this;
        if (!eRow) {
            return;
        }
        var cellTemplates = [];
        var newCellComps = [];
        cols.forEach(function (col) {
            var colId = col.getId();
            var existingCell = _this.cellComps[colId];
            // need to check the column is the same one, not a new column with the same ID
            if (existingCell && existingCell.getColumn() == col) {
                _this.ensureCellInCorrectContainer(existingCell);
            }
            else {
                if (existingCell) {
                    // here there is a col with the same id, so need to destroy the old cell first,
                    // as the old column no longer exists. this happens often with pivoting, where
                    // id's are pivot_1, pivot_2 etc, so common for new cols with same ID's
                    _this.destroyCells([colId]);
                }
                _this.createNewCell(col, eRow, cellTemplates, newCellComps);
            }
        });
        if (cellTemplates.length > 0) {
            dom_1.appendHtml(eRow, cellTemplates.join(''));
            this.callAfterRowAttachedOnCells(newCellComps, eRow);
        }
        if (this.elementOrderChanged && this.beans.gridOptionsWrapper.isEnsureDomOrder()) {
            var correctChildOrder = cols.map(function (col) { return _this.getCellForCol(col); });
            dom_1.setDomChildOrder(eRow, correctChildOrder);
        }
    };
    RowComp.prototype.addDomData = function (eRowContainer) {
        var gow = this.beans.gridOptionsWrapper;
        gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, this);
        this.addDestroyFunc(function () {
            gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, null);
        });
    };
    RowComp.prototype.createNewCell = function (col, eContainer, cellTemplates, newCellComps) {
        var newCellComp = new cellComp_1.CellComp(this.scope, this.beans, col, this.rowNode, this, false, this.printLayout);
        var cellTemplate = newCellComp.getCreateTemplate();
        cellTemplates.push(cellTemplate);
        newCellComps.push(newCellComp);
        this.cellComps[col.getId()] = newCellComp;
        newCellComp.setParentRow(eContainer);
        this.elementOrderChanged = true;
    };
    RowComp.prototype.onMouseEvent = function (eventName, mouseEvent) {
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
    RowComp.prototype.createRowEvent = function (type, domEvent) {
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
    RowComp.prototype.createRowEventWithSource = function (type, domEvent) {
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
    RowComp.prototype.onRowDblClick = function (mouseEvent) {
        if (event_1.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        var agEvent = this.createRowEventWithSource(events_1.Events.EVENT_ROW_DOUBLE_CLICKED, mouseEvent);
        this.beans.eventService.dispatchEvent(agEvent);
    };
    RowComp.prototype.onRowMouseDown = function (mouseEvent) {
        this.lastMouseDownOnDragger = dom_1.isElementChildOfClass(mouseEvent.target, 'ag-row-drag', 3);
    };
    RowComp.prototype.onRowClick = function (mouseEvent) {
        var stop = event_1.isStopPropagationForAgGrid(mouseEvent) || this.lastMouseDownOnDragger;
        if (stop) {
            return;
        }
        var agEvent = this.createRowEventWithSource(events_1.Events.EVENT_ROW_CLICKED, mouseEvent);
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
                this.rowNode.setSelectedParams({ newValue: true, clearSelection: true });
            }
        }
        else {
            var clearSelection = multiSelectOnClick ? false : !multiSelectKeyPressed;
            this.rowNode.setSelectedParams({ newValue: true, clearSelection: clearSelection, rangeSelect: shiftKeyPressed });
        }
    };
    RowComp.prototype.createFullWidthRowContainer = function (rowContainerComp, pinned, extraCssClass, cellRendererType, cellRendererName, eRowCallback, cellRendererCallback, detailRow) {
        var _this = this;
        var rowTemplate = this.createTemplate('', extraCssClass);
        rowContainerComp.appendRowTemplate(rowTemplate, function () {
            var eRow = rowContainerComp.getRowElement(_this.getCompId());
            var params = _this.createFullWidthParams(eRow, pinned);
            var callback = function (cellRenderer) {
                if (_this.isAlive()) {
                    var eGui = cellRenderer.getGui();
                    eRow.appendChild(eGui);
                    if (detailRow) {
                        _this.setupDetailRowAutoHeight(eGui);
                    }
                    cellRendererCallback(cellRenderer);
                }
                else {
                    _this.beans.context.destroyBean(cellRenderer);
                }
            };
            // if doing master detail, it's possible we have a cached row comp from last time detail was displayed
            var cachedRowComp = _this.beans.detailRowCompCache.get(_this.rowNode, pinned);
            if (cachedRowComp) {
                callback(cachedRowComp);
            }
            else {
                var res = _this.beans.userComponentFactory.newFullWidthCellRenderer(params, cellRendererType, cellRendererName);
                if (!res) {
                    var masterDetailModuleLoaded = moduleRegistry_1.ModuleRegistry.isRegistered(moduleNames_1.ModuleNames.MasterDetailModule);
                    if (cellRendererName === 'agDetailCellRenderer' && !masterDetailModuleLoaded) {
                        console.warn("ag-Grid: cell renderer agDetailCellRenderer (for master detail) not found. Did you forget to include the master detail module?");
                    }
                    else {
                        console.error("ag-Grid: fullWidthCellRenderer " + cellRendererName + " not found");
                    }
                    return;
                }
                res.then(callback);
            }
            _this.afterRowAttached(rowContainerComp, eRow);
            eRowCallback(eRow);
            _this.angular1Compile(eRow);
        });
    };
    RowComp.prototype.setupDetailRowAutoHeight = function (eDetailGui) {
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
        this.fullWidthRowDestroyFuncs.push(resizeObserverDestroyFunc);
        checkRowSizeFunc();
    };
    RowComp.prototype.angular1Compile = function (element) {
        if (!this.scope) {
            return;
        }
        this.beans.$compile(element)(this.scope);
    };
    RowComp.prototype.createFullWidthParams = function (eRow, pinned) {
        var params = {
            fullWidth: true,
            data: this.rowNode.data,
            node: this.rowNode,
            value: this.rowNode.key,
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
            addRenderedRowListener: this.addEventListener.bind(this)
        };
        return params;
    };
    RowComp.prototype.getInitialRowClasses = function (extraCssClass) {
        var params = {
            rowNode: this.rowNode,
            extraCssClass: extraCssClass,
            rowFocused: this.rowFocused,
            fadeRowIn: this.fadeRowIn,
            rowIsEven: this.rowIsEven,
            rowLevel: this.rowLevel,
            fullWidthRow: this.fullWidthRow,
            firstRowOnPage: this.isFirstRowOnPage(),
            lastRowOnPage: this.isLastRowOnPage(),
            printLayout: this.printLayout,
            expandable: this.rowNode.isExpandable(),
            scope: this.scope
        };
        return this.beans.rowCssClassCalculator.getInitialRowClasses(params);
    };
    RowComp.prototype.onUiLevelChanged = function () {
        var newLevel = this.beans.rowCssClassCalculator.calculateRowLevel(this.rowNode);
        if (this.rowLevel != newLevel) {
            var classToAdd_1 = 'ag-row-level-' + newLevel;
            var classToRemove_1 = 'ag-row-level-' + this.rowLevel;
            this.eAllRowContainers.forEach(function (row) {
                dom_1.addCssClass(row, classToAdd_1);
                dom_1.removeCssClass(row, classToRemove_1);
            });
        }
        this.rowLevel = newLevel;
    };
    RowComp.prototype.isFirstRowOnPage = function () {
        return this.rowNode.rowIndex === this.beans.paginationProxy.getPageFirstRow();
    };
    RowComp.prototype.isLastRowOnPage = function () {
        return this.rowNode.rowIndex === this.beans.paginationProxy.getPageLastRow();
    };
    RowComp.prototype.onModelUpdated = function () {
        var newFirst = this.isFirstRowOnPage();
        var newLast = this.isLastRowOnPage();
        if (this.firstRowOnPage !== newFirst) {
            this.firstRowOnPage = newFirst;
            this.eAllRowContainers.forEach(function (row) { return dom_1.addOrRemoveCssClass(row, 'ag-row-first', newFirst); });
        }
        if (this.lastRowOnPage !== newLast) {
            this.lastRowOnPage = newLast;
            this.eAllRowContainers.forEach(function (row) { return dom_1.addOrRemoveCssClass(row, 'ag-row-last', newLast); });
        }
    };
    RowComp.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.forEachCellComp(function (renderedCell) {
            renderedCell.stopEditing(cancel);
        });
        if (!this.editingRow) {
            return;
        }
        if (!cancel) {
            var event_2 = this.createRowEvent(events_1.Events.EVENT_ROW_VALUE_CHANGED);
            this.beans.eventService.dispatchEvent(event_2);
        }
        this.setEditingRow(false);
    };
    RowComp.prototype.setEditingRow = function (value) {
        this.editingRow = value;
        this.eAllRowContainers.forEach(function (row) { return dom_1.addOrRemoveCssClass(row, 'ag-row-editing', value); });
        var event = value ?
            this.createRowEvent(events_1.Events.EVENT_ROW_EDITING_STARTED)
            : this.createRowEvent(events_1.Events.EVENT_ROW_EDITING_STOPPED);
        this.beans.eventService.dispatchEvent(event);
    };
    RowComp.prototype.startRowEditing = function (keyPress, charPress, sourceRenderedCell) {
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
    RowComp.prototype.forEachCellComp = function (callback) {
        object_1.iterateObject(this.cellComps, function (key, cellComp) {
            if (!cellComp) {
                return;
            }
            callback(cellComp);
        });
    };
    RowComp.prototype.postProcessClassesFromGridOptions = function () {
        var _this = this;
        var cssClasses = this.beans.rowCssClassCalculator.processClassesFromGridOptions(this.rowNode);
        if (!cssClasses || !cssClasses.length) {
            return;
        }
        cssClasses.forEach(function (classStr) {
            _this.eAllRowContainers.forEach(function (row) { return dom_1.addCssClass(row, classStr); });
        });
    };
    RowComp.prototype.postProcessRowClassRules = function () {
        var _this = this;
        this.beans.rowCssClassCalculator.processRowClassRules(this.rowNode, this.scope, function (className) {
            _this.eAllRowContainers.forEach(function (row) { return dom_1.addCssClass(row, className); });
        }, function (className) {
            _this.eAllRowContainers.forEach(function (row) { return dom_1.removeCssClass(row, className); });
        });
    };
    RowComp.prototype.preProcessStylesFromGridOptions = function () {
        var rowStyles = this.processStylesFromGridOptions();
        return general_1.cssStyleObjectToMarkup(rowStyles);
    };
    RowComp.prototype.postProcessStylesFromGridOptions = function () {
        var rowStyles = this.processStylesFromGridOptions();
        this.eAllRowContainers.forEach(function (row) { return dom_1.addStylesToElement(row, rowStyles); });
    };
    RowComp.prototype.processStylesFromGridOptions = function () {
        // part 1 - rowStyle
        var rowStyle = this.beans.gridOptionsWrapper.getRowStyle();
        if (rowStyle && typeof rowStyle === 'function') {
            console.warn('ag-Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            return;
        }
        // part 1 - rowStyleFunc
        var rowStyleFunc = this.beans.gridOptionsWrapper.getRowStyleFunc();
        var rowStyleFuncResult;
        if (rowStyleFunc) {
            var params = {
                data: this.rowNode.data,
                node: this.rowNode,
                api: this.beans.gridOptionsWrapper.getApi(),
                context: this.beans.gridOptionsWrapper.getContext(),
                $scope: this.scope
            };
            rowStyleFuncResult = rowStyleFunc(params);
        }
        return object_1.assign({}, rowStyle, rowStyleFuncResult);
    };
    RowComp.prototype.createCells = function (cols) {
        var _this = this;
        var templateParts = [];
        var newCellComps = [];
        cols.forEach(function (col) {
            var newCellComp = new cellComp_1.CellComp(_this.scope, _this.beans, col, _this.rowNode, _this, false, _this.printLayout);
            var cellTemplate = newCellComp.getCreateTemplate();
            templateParts.push(cellTemplate);
            newCellComps.push(newCellComp);
            _this.cellComps[col.getId()] = newCellComp;
        });
        var templateAndComps = {
            template: templateParts.join(''),
            cellComps: newCellComps
        };
        return templateAndComps;
    };
    RowComp.prototype.onRowSelected = function () {
        var _this = this;
        var selected = this.rowNode.isSelected();
        this.eAllRowContainers.forEach(function (row) {
            aria_1.setAriaSelected(row, selected);
            dom_1.addOrRemoveCssClass(row, 'ag-row-selected', selected);
            _this.refreshAriaLabel(row, selected);
        });
    };
    RowComp.prototype.refreshAriaLabel = function (node, selected) {
        if (selected && this.beans.gridOptionsWrapper.isSuppressRowDeselection()) {
            node.removeAttribute('aria-label');
            return;
        }
        aria_1.setAriaLabel(node, "Press SPACE to " + (selected ? 'deselect' : 'select') + " this row.");
    };
    // called:
    // + after row created for first time
    // + after horizontal scroll, so new cells due to column virtualisation
    RowComp.prototype.callAfterRowAttachedOnCells = function (newCellComps, eRow) {
        var _this = this;
        newCellComps.forEach(function (cellComp) {
            cellComp.setParentRow(eRow);
            cellComp.afterAttached();
            // if we are editing the row, then the cell needs to turn
            // into edit mode
            if (_this.editingRow) {
                cellComp.startEditingIfEnabled();
            }
        });
    };
    RowComp.prototype.afterRowAttached = function (rowContainerComp, eRow) {
        var _this = this;
        this.addDomData(eRow);
        this.removeSecondPassFuncs.push(function () {
            rowContainerComp.removeRowElement(eRow);
        });
        this.removeFirstPassFuncs.push(function () {
            if (generic_1.exists(_this.rowNode.rowTop)) {
                // the row top is updated anyway, however we set it here again
                // to something more reasonable for the animation - ie if the
                // row top is 10000px away, the row will flash out, so this
                // gives it a rounded value, so row animates out more slowly
                var rowTop = _this.roundRowTopToBounds(_this.rowNode.rowTop);
                _this.setRowTop(rowTop);
            }
            else {
                dom_1.addCssClass(eRow, 'ag-opacity-zero');
            }
        });
        this.eAllRowContainers.push(eRow);
        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.useAnimationFrameForCreate) {
            this.beans.taskQueue.createTask(this.addHoverFunctionality.bind(this, eRow), this.rowNode.rowIndex, 'createTasksP2');
        }
        else {
            this.addHoverFunctionality(eRow);
        }
    };
    RowComp.prototype.addHoverFunctionality = function (eRow) {
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
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_MOUSE_ENTER, function () {
            // if hover turned off, we don't add the class. we do this here so that if the application
            // toggles this property mid way, we remove the hover form the last row, but we stop
            // adding hovers from that point onwards.
            if (!_this.beans.gridOptionsWrapper.isSuppressRowHoverHighlight()) {
                dom_1.addCssClass(eRow, 'ag-row-hover');
            }
        });
        this.addManagedListener(this.rowNode, rowNode_1.RowNode.EVENT_MOUSE_LEAVE, function () {
            dom_1.removeCssClass(eRow, 'ag-row-hover');
        });
    };
    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    RowComp.prototype.roundRowTopToBounds = function (rowTop) {
        var range = this.beans.gridPanel.getVScrollPosition();
        var minPixel = this.applyPaginationOffset(range.top, true) - 100;
        var maxPixel = this.applyPaginationOffset(range.bottom, true) + 100;
        return Math.min(Math.max(minPixel, rowTop), maxPixel);
    };
    RowComp.prototype.getFrameworkOverrides = function () {
        return this.beans.frameworkOverrides;
    };
    RowComp.prototype.onRowHeightChanged = function () {
        // check for exists first - if the user is resetting the row height, then
        // it will be null (or undefined) momentarily until the next time the flatten
        // stage is called where the row will then update again with a new height
        if (generic_1.exists(this.rowNode.rowHeight)) {
            var heightPx_1 = this.rowNode.rowHeight + "px";
            this.eAllRowContainers.forEach(function (row) { return row.style.height = heightPx_1; });
        }
    };
    RowComp.prototype.addEventListener = function (eventType, listener) {
        if (eventType === 'renderedRowRemoved' || eventType === 'rowRemoved') {
            eventType = events_1.Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved is now called ' + events_1.Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        _super.prototype.addEventListener.call(this, eventType, listener);
    };
    RowComp.prototype.removeEventListener = function (eventType, listener) {
        if (eventType === 'renderedRowRemoved' || eventType === 'rowRemoved') {
            eventType = events_1.Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved and rowRemoved is now called ' + events_1.Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        _super.prototype.removeEventListener.call(this, eventType, listener);
    };
    // note - this is NOT called by context, as we don't wire / unwire the CellComp for performance reasons.
    RowComp.prototype.destroy = function (animate) {
        if (animate === void 0) { animate = false; }
        this.active = false;
        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?
        this.destroyFullWidthComponents();
        if (animate) {
            this.removeFirstPassFuncs.forEach(function (func) { return func(); });
            this.removeSecondPassFuncs.push(this.destroyContainingCells.bind(this));
        }
        else {
            this.destroyContainingCells();
            // we are not animating, so execute the second stage of removal now.
            // we call getAndClear, so that they are only called once
            var delayedDestroyFunctions = this.getAndClearDelayedDestroyFunctions();
            delayedDestroyFunctions.forEach(function (func) { return func(); });
        }
        var event = this.createRowEvent(events_1.Events.EVENT_VIRTUAL_ROW_REMOVED);
        this.dispatchEvent(event);
        this.beans.eventService.dispatchEvent(event);
        _super.prototype.destroy.call(this);
    };
    RowComp.prototype.destroyContainingCells = function () {
        var cellsToDestroy = Object.keys(this.cellComps);
        this.destroyCells(cellsToDestroy);
    };
    // we clear so that the functions are never executed twice
    RowComp.prototype.getAndClearDelayedDestroyFunctions = function () {
        var result = this.removeSecondPassFuncs;
        this.removeSecondPassFuncs = [];
        return result;
    };
    RowComp.prototype.onCellFocusChanged = function () {
        var rowFocused = this.beans.focusController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);
        if (rowFocused !== this.rowFocused) {
            this.eAllRowContainers.forEach(function (row) { return dom_1.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused); });
            this.eAllRowContainers.forEach(function (row) { return dom_1.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused); });
            this.rowFocused = rowFocused;
        }
        // if we are editing, then moving the focus out of a row will stop editing
        if (!rowFocused && this.editingRow) {
            this.stopEditing(false);
        }
    };
    RowComp.prototype.onPaginationChanged = function () {
        var currentPage = this.beans.paginationProxy.getCurrentPage();
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        if (this.paginationPage !== currentPage) {
            this.paginationPage = currentPage;
            this.onTopChanged();
        }
    };
    RowComp.prototype.onTopChanged = function () {
        this.setRowTop(this.rowNode.rowTop);
    };
    RowComp.prototype.onPaginationPixelOffsetChanged = function () {
        // the pixel offset is used when calculating rowTop to set on the row DIV
        this.onTopChanged();
    };
    // applies pagination offset, eg if on second page, and page height is 500px, then removes
    // 500px from the top position, so a row with rowTop 600px is displayed at location 100px.
    // reverse will take the offset away rather than add.
    RowComp.prototype.applyPaginationOffset = function (topPx, reverse) {
        if (reverse === void 0) { reverse = false; }
        if (this.rowNode.isRowPinned()) {
            return topPx;
        }
        var pixelOffset = this.beans.paginationProxy.getPixelOffset();
        var multiplier = reverse ? 1 : -1;
        return topPx + (pixelOffset * multiplier);
    };
    RowComp.prototype.setRowTop = function (pixels) {
        // print layout uses normal flow layout for row positioning
        if (this.printLayout) {
            return;
        }
        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (generic_1.exists(pixels)) {
            var afterPaginationPixels = this.applyPaginationOffset(pixels);
            var afterScalingPixels = this.rowNode.isRowPinned() ? afterPaginationPixels : this.beans.maxDivHeightScaler.getRealPixelPosition(afterPaginationPixels);
            var topPx_1 = afterScalingPixels + "px";
            if (this.beans.gridOptionsWrapper.isSuppressRowTransform()) {
                this.eAllRowContainers.forEach(function (row) { return row.style.top = topPx_1; });
            }
            else {
                this.eAllRowContainers.forEach(function (row) { return row.style.transform = "translateY(" + topPx_1 + ")"; });
            }
        }
    };
    // we clear so that the functions are never executed twice
    RowComp.prototype.getAndClearNextVMTurnFunctions = function () {
        var result = this.createSecondPassFuncs;
        this.createSecondPassFuncs = [];
        return result;
    };
    RowComp.prototype.getRowNode = function () {
        return this.rowNode;
    };
    RowComp.prototype.getRenderedCellForColumn = function (column) {
        var _this = this;
        var cellComp = this.cellComps[column.getColId()];
        if (cellComp) {
            return cellComp;
        }
        var spanList = Object.keys(this.cellComps)
            .map(function (name) { return _this.cellComps[name]; })
            .filter(function (cmp) { return cmp && cmp.getColSpanningList().indexOf(column) !== -1; });
        return spanList.length ? spanList[0] : undefined;
    };
    RowComp.prototype.onRowIndexChanged = function () {
        // we only bother updating if the rowIndex is present. if it is not present, it means this row
        // is child of a group node, and the group node was closed, it's the only way to have no row index.
        // when this happens, row is about to be de-rendered, so we don't care, rowComp is about to die!
        if (this.rowNode.rowIndex != null) {
            this.onCellFocusChanged();
            this.updateRowIndexes();
        }
    };
    RowComp.prototype.updateRowIndexes = function () {
        var _this = this;
        var rowIndexStr = this.rowNode.getRowIndexString();
        var rowIsEven = this.rowNode.rowIndex % 2 === 0;
        var rowIsEvenChanged = this.rowIsEven !== rowIsEven;
        var headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();
        if (rowIsEvenChanged) {
            this.rowIsEven = rowIsEven;
        }
        this.eAllRowContainers.forEach(function (eRow) {
            eRow.setAttribute('row-index', rowIndexStr);
            aria_1.setAriaRowIndex(eRow, headerRowCount + _this.rowNode.rowIndex + 1);
            if (!rowIsEvenChanged) {
                return;
            }
            dom_1.addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
            dom_1.addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
        });
    };
    RowComp.prototype.ensureDomOrder = function () {
        var sides = [
            {
                el: this.getBodyRowElement(),
                ct: this.bodyContainerComp
            },
            {
                el: this.getPinnedLeftRowElement(),
                ct: this.pinnedLeftContainerComp
            }, {
                el: this.getPinnedRightRowElement(),
                ct: this.pinnedRightContainerComp
            }, {
                el: this.getFullWidthRowElement(),
                ct: this.fullWidthContainerComp
            }
        ];
        sides.forEach(function (side) {
            if (!side.el) {
                return;
            }
            side.ct.ensureDomOrder(side.el);
        });
    };
    // returns the pinned left container, either the normal one, or the embedded full with one if exists
    RowComp.prototype.getPinnedLeftRowElement = function () {
        return this.ePinnedLeftRow ? this.ePinnedLeftRow : this.eFullWidthRowLeft;
    };
    // returns the pinned right container, either the normal one, or the embedded full with one if exists
    RowComp.prototype.getPinnedRightRowElement = function () {
        return this.ePinnedRightRow ? this.ePinnedRightRow : this.eFullWidthRowRight;
    };
    // returns the body container, either the normal one, or the embedded full with one if exists
    RowComp.prototype.getBodyRowElement = function () {
        return this.eBodyRow ? this.eBodyRow : this.eFullWidthRowBody;
    };
    // returns the full width container
    RowComp.prototype.getFullWidthRowElement = function () {
        return this.eFullWidthRow;
    };
    RowComp.DOM_DATA_KEY_RENDERED_ROW = 'renderedRow';
    RowComp.FULL_WIDTH_CELL_RENDERER = 'fullWidthCellRenderer';
    RowComp.GROUP_ROW_RENDERER = 'groupRowRenderer';
    RowComp.GROUP_ROW_RENDERER_COMP_NAME = 'agGroupRowRenderer';
    RowComp.LOADING_CELL_RENDERER = 'loadingCellRenderer';
    RowComp.LOADING_CELL_RENDERER_COMP_NAME = 'agLoadingCellRenderer';
    RowComp.DETAIL_CELL_RENDERER = 'detailCellRenderer';
    RowComp.DETAIL_CELL_RENDERER_COMP_NAME = 'agDetailCellRenderer';
    return RowComp;
}(component_1.Component));
exports.RowComp = RowComp;

//# sourceMappingURL=rowComp.js.map
