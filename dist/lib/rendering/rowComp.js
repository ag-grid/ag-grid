/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var cellComp_1 = require("./cellComp");
var rowNode_1 = require("../entities/rowNode");
var column_1 = require("../entities/column");
var events_1 = require("../events");
var component_1 = require("../widgets/component");
var utils_1 = require("../utils");
var RowComp = /** @class */ (function (_super) {
    __extends(RowComp, _super);
    function RowComp(parentScope, bodyContainerComp, pinnedLeftContainerComp, pinnedRightContainerComp, fullWidthContainerComp, rowNode, beans, animateIn, useAnimationFrameForCreate, printLayout, embedFullWidth) {
        var _this = _super.call(this) || this;
        _this.eAllRowContainers = [];
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
        this.rowFocused = this.beans.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);
        this.scope = this.createChildScopeOrNull(this.rowNode.data);
        this.setupRowContainers();
        this.addListeners();
        if (this.slideRowIn) {
            this.createSecondPassFuncs.push(function () {
                _this.onTopChanged();
            });
        }
        if (this.fadeRowIn) {
            this.createSecondPassFuncs.push(function () {
                _this.eAllRowContainers.forEach(function (eRow) { return utils_1._.removeCssClass(eRow, 'ag-opacity-zero'); });
            });
        }
    };
    RowComp.prototype.createTemplate = function (contents, extraCssClass) {
        if (extraCssClass === void 0) { extraCssClass = null; }
        var templateParts = [];
        var rowHeight = this.rowNode.rowHeight;
        var rowClasses = this.getInitialRowClasses(extraCssClass).join(' ');
        var rowIdSanitised = utils_1._.escape(this.rowNode.id);
        var userRowStyles = this.preProcessStylesFromGridOptions();
        var businessKey = this.getRowBusinessKey();
        var businessKeySanitised = utils_1._.escape(businessKey);
        var rowTopStyle = this.getInitialRowTopStyle();
        var rowIdx = this.rowNode.getRowIndexString();
        var headerRowCount = this.beans.gridPanel.headerRootComp.getHeaderRowCount();
        templateParts.push("<div");
        templateParts.push(" role=\"row\"");
        templateParts.push(" row-index=\"" + rowIdx + "\" aria-rowindex=\"" + (headerRowCount + this.rowNode.rowIndex + 1) + "\"");
        templateParts.push(rowIdSanitised ? " row-id=\"" + rowIdSanitised + "\"" : "");
        templateParts.push(businessKey ? " row-business-key=\"" + businessKeySanitised + "\"" : "");
        templateParts.push(" comp-id=\"" + this.getCompId() + "\"");
        templateParts.push(" class=\"" + rowClasses + "\"");
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
        var afterScalingPixels = this.beans.maxDivHeightScaler.getRealPixelPosition(afterPaginationPixels);
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
            _this.afterRowAttached(rowContainerComp, eRow);
            callback(eRow);
            if (useAnimationsFrameForCreate) {
                _this.beans.taskQueue.addP1Task(_this.lazyCreateCells.bind(_this, cols, eRow), _this.rowNode.rowIndex);
            }
            else {
                _this.callAfterRowAttachedOnCells(cellTemplatesAndComps.cellComps, eRow);
                _this.rowContainerReadyCount = 3;
            }
        });
    };
    RowComp.prototype.createChildScopeOrNull = function (data) {
        var isAngularCompileRows = this.beans.gridOptionsWrapper.isAngularCompileRows();
        if (!isAngularCompileRows) {
            return null;
        }
        var newChildScope = this.parentScope.$new();
        newChildScope.data = __assign({}, data);
        newChildScope.rowNode = this.rowNode;
        newChildScope.context = this.beans.gridOptionsWrapper.getContext();
        this.addDestroyFunc(function () {
            newChildScope.$destroy();
            newChildScope.data = null;
            newChildScope.rowNode = null;
            newChildScope.context = null;
        });
        return newChildScope;
    };
    RowComp.prototype.setupRowContainers = function () {
        var isFullWidthCellFunc = this.beans.gridOptionsWrapper.getIsFullWidthCellFunc();
        var isFullWidthCell = isFullWidthCellFunc ? isFullWidthCellFunc(this.rowNode) : false;
        var isDetailCell = this.beans.doingMasterDetail && this.rowNode.detail;
        var pivotMode = this.beans.columnController.isPivotMode();
        // we only use full width for groups, not footers. it wouldn't make sense to include footers if not looking
        // for totals. if users complain about this, then we should introduce a new property 'footerUseEntireRow'
        // so each can be set independently (as a customer complained about footers getting full width, hence
        // introducing this logic)
        var isGroupRow = this.rowNode.group && !this.rowNode.footer;
        var isFullWidthGroup = isGroupRow && this.beans.gridOptionsWrapper.isGroupUseEntireRow(pivotMode);
        if (this.rowNode.stub) {
            this.createFullWidthRows(RowComp.LOADING_CELL_RENDERER, RowComp.LOADING_CELL_RENDERER_COMP_NAME);
        }
        else if (isDetailCell) {
            this.createFullWidthRows(RowComp.DETAIL_CELL_RENDERER, RowComp.DETAIL_CELL_RENDERER_COMP_NAME);
        }
        else if (isFullWidthCell) {
            this.createFullWidthRows(RowComp.FULL_WIDTH_CELL_RENDERER, null);
        }
        else if (isFullWidthGroup) {
            this.createFullWidthRows(RowComp.GROUP_ROW_RENDERER, RowComp.GROUP_ROW_RENDERER_COMP_NAME);
        }
        else {
            this.setupNormalRowContainers();
        }
    };
    RowComp.prototype.setupNormalRowContainers = function () {
        var _this = this;
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
        this.createRowContainer(this.bodyContainerComp, centerCols, function (eRow) { return _this.eBodyRow = eRow; });
        this.createRowContainer(this.pinnedRightContainerComp, rightCols, function (eRow) { return _this.ePinnedRightRow = eRow; });
        this.createRowContainer(this.pinnedLeftContainerComp, leftCols, function (eRow) { return _this.ePinnedLeftRow = eRow; });
    };
    RowComp.prototype.createFullWidthRows = function (type, name) {
        var _this = this;
        this.fullWidthRow = true;
        if (this.embedFullWidth) {
            this.createFullWidthRowContainer(this.bodyContainerComp, null, null, type, name, function (eRow) {
                _this.eFullWidthRowBody = eRow;
            }, function (cellRenderer) {
                _this.fullWidthRowComponentBody = cellRenderer;
            });
            // printLayout doesn't put components into the pinned sections
            if (!this.printLayout) {
                this.createFullWidthRowContainer(this.pinnedLeftContainerComp, column_1.Column.PINNED_LEFT, 'ag-cell-last-left-pinned', type, name, function (eRow) {
                    _this.eFullWidthRowLeft = eRow;
                }, function (cellRenderer) {
                    _this.fullWidthRowComponentLeft = cellRenderer;
                });
                this.createFullWidthRowContainer(this.pinnedRightContainerComp, column_1.Column.PINNED_RIGHT, 'ag-cell-first-right-pinned', type, name, function (eRow) {
                    _this.eFullWidthRowRight = eRow;
                }, function (cellRenderer) {
                    _this.fullWidthRowComponentRight = cellRenderer;
                });
            }
        }
        else {
            // otherwise we add to the fullWidth container as normal
            // let previousFullWidth = ensureDomOrder ? this.lastPlacedElements.eFullWidth : null;
            this.createFullWidthRowContainer(this.fullWidthContainerComp, null, null, type, name, function (eRow) {
                _this.eFullWidthRow = eRow;
            }, function (cellRenderer) {
                _this.fullWidthRowComponent = cellRenderer;
            });
        }
    };
    RowComp.prototype.setAnimateFlags = function (animateIn) {
        if (animateIn) {
            var oldRowTopExists = utils_1._.exists(this.rowNode.oldRowTop);
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
        var tryRefresh = function (eRow, eCellComp, pinned) {
            if (!eRow || !eCellComp) {
                // no refresh needed
                return true;
            }
            if (!eCellComp.refresh) {
                // no refresh method present, so can't refresh, hard refresh needed
                return false;
            }
            var params = _this.createFullWidthParams(eRow, pinned);
            var refreshSucceeded = eCellComp.refresh(params);
            return refreshSucceeded;
        };
        var normalSuccess = tryRefresh(this.eFullWidthRow, this.fullWidthRowComponent, null);
        var bodySuccess = tryRefresh(this.eFullWidthRowBody, this.fullWidthRowComponentBody, null);
        var leftSuccess = tryRefresh(this.eFullWidthRowLeft, this.fullWidthRowComponentLeft, column_1.Column.PINNED_LEFT);
        var rightSuccess = tryRefresh(this.eFullWidthRowRight, this.fullWidthRowComponentRight, column_1.Column.PINNED_RIGHT);
        var allFullWidthRowsRefreshed = normalSuccess && bodySuccess && leftSuccess && rightSuccess;
        return allFullWidthRowsRefreshed;
    };
    RowComp.prototype.addListeners = function () {
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_TOP_CHANGED, this.onTopChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_EXPANDED_CHANGED, this.onExpandedChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.onRowNodeDataChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, this.onRowNodeCellChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_DRAGGING_CHANGED, this.onRowNodeDraggingChanged.bind(this));
        var eventService = this.beans.eventService;
        this.addDestroyableEventListener(eventService, events_1.Events.EVENT_HEIGHT_SCALE_CHANGED, this.onTopChanged.bind(this));
        this.addDestroyableEventListener(eventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(eventService, events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addDestroyableEventListener(eventService, events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addDestroyableEventListener(eventService, events_1.Events.EVENT_CELL_FOCUSED, this.onCellFocusChanged.bind(this));
        this.addDestroyableEventListener(eventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addDestroyableEventListener(eventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
        this.addDestroyableEventListener(eventService, events_1.Events.EVENT_MODEL_UPDATED, this.onModelUpdated.bind(this));
        this.addListenersForCellComps();
    };
    RowComp.prototype.addListenersForCellComps = function () {
        var _this = this;
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, function () {
            _this.forEachCellComp(function (cellComp) { return cellComp.onRowIndexChanged(); });
        });
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_CELL_CHANGED, function (event) {
            _this.forEachCellComp(function (cellComp) { return cellComp.onCellChanged(event); });
        });
    };
    // when grid columns change, then all cells should be cleaned out,
    // as the new columns could have same id as the previous columns and may conflict
    RowComp.prototype.onGridColumnsChanged = function () {
        this.removeRenderedCells(Object.keys(this.cellComps));
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
    RowComp.prototype.onRowNodeCellChanged = function (event) {
        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    };
    RowComp.prototype.postProcessCss = function () {
        this.postProcessStylesFromGridOptions();
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
        this.postProcessRowDragging();
    };
    RowComp.prototype.onRowNodeDraggingChanged = function () {
        this.postProcessRowDragging();
    };
    RowComp.prototype.postProcessRowDragging = function () {
        var dragging = this.rowNode.dragging;
        this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-dragging', dragging); });
    };
    RowComp.prototype.onExpandedChanged = function () {
        var rowNode = this.rowNode;
        this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-group-expanded', rowNode.expanded); });
        this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-group-contracted', !rowNode.expanded); });
    };
    RowComp.prototype.onDisplayedColumnsChanged = function () {
        if (this.fullWidthRow) {
            return;
        }
        this.refreshCells();
    };
    RowComp.prototype.destroyFullWidthComponents = function () {
        if (this.fullWidthRowComponent) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, null, this.fullWidthRowComponent);
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentBody) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, null, this.fullWidthRowComponentBody);
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentLeft) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, column_1.Column.PINNED_LEFT, this.fullWidthRowComponentLeft);
            this.fullWidthRowComponentLeft = null;
        }
        if (this.fullWidthRowComponentRight) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, column_1.Column.PINNED_RIGHT, this.fullWidthRowComponentRight);
            this.fullWidthRowComponent = null;
        }
    };
    RowComp.prototype.getContainerForCell = function (pinnedType) {
        switch (pinnedType) {
            case column_1.Column.PINNED_LEFT: return this.ePinnedLeftRow;
            case column_1.Column.PINNED_RIGHT: return this.ePinnedRightRow;
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
            this.beans.taskQueue.addP1Task(this.refreshCellsInAnimationFrame.bind(this), this.rowNode.rowIndex);
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
        var colIdsToRemove = Object.keys(this.cellComps);
        centerCols.forEach(function (col) { return utils_1._.removeFromArray(colIdsToRemove, col.getId()); });
        leftCols.forEach(function (col) { return utils_1._.removeFromArray(colIdsToRemove, col.getId()); });
        rightCols.forEach(function (col) { return utils_1._.removeFromArray(colIdsToRemove, col.getId()); });
        // we never remove editing cells, as this would cause the cells to loose their values while editing
        // as the grid is scrolling horizontally.
        var eligibleToBeRemoved = utils_1._.filter(colIdsToRemove, this.isCellEligibleToBeRemoved.bind(this));
        // remove old cells from gui, but we don't destroy them, we might use them again
        this.removeRenderedCells(eligibleToBeRemoved);
    };
    RowComp.prototype.removeRenderedCells = function (colIds) {
        var _this = this;
        colIds.forEach(function (key) {
            var cellComp = _this.cellComps[key];
            // could be old reference, ie removed cell
            if (utils_1._.missing(cellComp)) {
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
        if (!renderedCell) {
            return REMOVE_CELL;
        }
        // always remove the cell if it's in the wrong pinned location
        if (this.isCellInWrongRow(renderedCell)) {
            return REMOVE_CELL;
        }
        // we want to try and keep editing and focused cells
        var editing = renderedCell.isEditing();
        var focused = this.beans.focusedCellController.isCellFocused(renderedCell.getCellPosition());
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
        }
    };
    RowComp.prototype.isCellInWrongRow = function (cellComp) {
        var column = cellComp.getColumn();
        var rowWeWant = this.getContainerForCell(column.getPinned());
        // if in wrong container, remove it
        var oldRow = cellComp.getParentRow();
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
            if (existingCell) {
                _this.ensureCellInCorrectContainer(existingCell);
            }
            else {
                _this.createNewCell(col, eRow, cellTemplates, newCellComps);
            }
        });
        if (cellTemplates.length > 0) {
            utils_1._.appendHtml(eRow, cellTemplates.join(''));
            this.callAfterRowAttachedOnCells(newCellComps, eRow);
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
    };
    RowComp.prototype.onMouseEvent = function (eventName, mouseEvent) {
        switch (eventName) {
            case 'dblclick':
                this.onRowDblClick(mouseEvent);
                break;
            case 'click':
                this.onRowClick(mouseEvent);
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
        if (utils_1._.isStopPropagationForAgGrid(mouseEvent)) {
            return;
        }
        var agEvent = this.createRowEventWithSource(events_1.Events.EVENT_ROW_DOUBLE_CLICKED, mouseEvent);
        this.beans.eventService.dispatchEvent(agEvent);
    };
    RowComp.prototype.onRowClick = function (mouseEvent) {
        var stop = utils_1._.isStopPropagationForAgGrid(mouseEvent);
        if (stop) {
            return;
        }
        var agEvent = this.createRowEventWithSource(events_1.Events.EVENT_ROW_CLICKED, mouseEvent);
        this.beans.eventService.dispatchEvent(agEvent);
        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;
        var shiftKeyPressed = mouseEvent.shiftKey;
        if (
        // we do not allow selecting groups by clicking (as the click here expands the group), or if it's a detail row,
        // so return if it's a group row
        this.rowNode.group ||
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
        var rowDeselectionWithCtrl = this.beans.gridOptionsWrapper.isRowDeselection();
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
    RowComp.prototype.createFullWidthRowContainer = function (rowContainerComp, pinned, extraCssClass, cellRendererType, cellRendererName, eRowCallback, cellRendererCallback) {
        var _this = this;
        var rowTemplate = this.createTemplate('', extraCssClass);
        rowContainerComp.appendRowTemplate(rowTemplate, function () {
            var eRow = rowContainerComp.getRowElement(_this.getCompId());
            var params = _this.createFullWidthParams(eRow, pinned);
            var callback = function (cellRenderer) {
                if (_this.isAlive()) {
                    var gui = cellRenderer.getGui();
                    eRow.appendChild(gui);
                    cellRendererCallback(cellRenderer);
                }
                else {
                    if (cellRenderer.destroy) {
                        cellRenderer.destroy();
                    }
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
                    console.error('ag-Grid: fullWidthCellRenderer not defined');
                    return;
                }
                res.then(callback);
            }
            _this.afterRowAttached(rowContainerComp, eRow);
            eRowCallback(eRow);
            _this.angular1Compile(eRow);
        });
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
        var classes = [];
        var isTreeData = this.beans.gridOptionsWrapper.isTreeData();
        var rowNode = this.rowNode;
        if (utils_1._.exists(extraCssClass)) {
            classes.push(extraCssClass);
        }
        classes.push('ag-row');
        classes.push(this.rowFocused ? 'ag-row-focus' : 'ag-row-no-focus');
        if (this.fadeRowIn) {
            classes.push('ag-opacity-zero');
        }
        classes.push(this.rowIsEven ? 'ag-row-even' : 'ag-row-odd');
        if (rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }
        if (rowNode.group) {
            classes.push('ag-row-group');
            // if a group, put the level of the group in
            classes.push('ag-row-level-' + rowNode.level);
            if (rowNode.footer) {
                classes.push('ag-row-footer');
            }
        }
        else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            classes.push('ag-row-level-' + (rowNode.parent ? (rowNode.parent.level + 1) : '0'));
        }
        if (rowNode.stub) {
            classes.push('ag-row-stub');
        }
        if (this.fullWidthRow) {
            classes.push('ag-full-width-row');
        }
        var addExpandedClass = isTreeData ?
            // if doing tree data, we add the expanded classes if any children, as any node can be a parent
            rowNode.allChildrenCount :
            // if normal row grouping, we add expanded classes to groups only
            rowNode.group && !rowNode.footer;
        if (addExpandedClass) {
            classes.push(rowNode.expanded ? 'ag-row-group-expanded' : 'ag-row-group-contracted');
        }
        if (rowNode.dragging) {
            classes.push('ag-row-dragging');
        }
        utils_1._.pushAll(classes, this.processClassesFromGridOptions());
        utils_1._.pushAll(classes, this.preProcessRowClassRules());
        // we use absolute position unless we are doing print layout
        classes.push(this.printLayout ? 'ag-row-position-relative' : 'ag-row-position-absolute');
        this.firstRowOnPage = this.isFirstRowOnPage();
        this.lastRowOnPage = this.isLastRowOnPage();
        if (this.firstRowOnPage) {
            classes.push('ag-row-first');
        }
        if (this.lastRowOnPage) {
            classes.push('ag-row-last');
        }
        return classes;
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
            this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-first', newFirst); });
        }
        if (this.lastRowOnPage !== newLast) {
            this.lastRowOnPage = newLast;
            this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-last', newLast); });
        }
    };
    RowComp.prototype.preProcessRowClassRules = function () {
        var res = [];
        this.processRowClassRules(function (className) {
            res.push(className);
        }, function (className) {
            // not catered for, if creating, no need
            // to remove class as it was never there
        });
        return res;
    };
    RowComp.prototype.processRowClassRules = function (onApplicableClass, onNotApplicableClass) {
        this.beans.stylingService.processClassRules(this.beans.gridOptionsWrapper.rowClassRules(), {
            value: undefined,
            colDef: undefined,
            data: this.rowNode.data,
            node: this.rowNode,
            rowIndex: this.rowNode.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            $scope: this.scope,
            context: this.beans.gridOptionsWrapper.getContext()
        }, onApplicableClass, onNotApplicableClass);
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
            var event_1 = this.createRowEvent(events_1.Events.EVENT_ROW_VALUE_CHANGED);
            this.beans.eventService.dispatchEvent(event_1);
        }
        this.setEditingRow(false);
    };
    RowComp.prototype.setEditingRow = function (value) {
        this.editingRow = value;
        this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-editing', value); });
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
        utils_1._.iterateObject(this.cellComps, function (key, cellComp) {
            if (!cellComp) {
                return;
            }
            callback(cellComp);
        });
    };
    RowComp.prototype.postProcessClassesFromGridOptions = function () {
        var _this = this;
        var cssClasses = this.processClassesFromGridOptions();
        if (!cssClasses || !cssClasses.length) {
            return;
        }
        cssClasses.forEach(function (classStr) {
            _this.eAllRowContainers.forEach(function (row) { return utils_1._.addCssClass(row, classStr); });
        });
    };
    RowComp.prototype.postProcessRowClassRules = function () {
        var _this = this;
        this.processRowClassRules(function (className) {
            _this.eAllRowContainers.forEach(function (row) { return utils_1._.addCssClass(row, className); });
        }, function (className) {
            _this.eAllRowContainers.forEach(function (row) { return utils_1._.removeCssClass(row, className); });
        });
    };
    RowComp.prototype.processClassesFromGridOptions = function () {
        var res = [];
        var process = function (rowCls) {
            if (typeof rowCls === 'string') {
                res.push(rowCls);
            }
            else if (Array.isArray(rowCls)) {
                rowCls.forEach(function (e) { return res.push(e); });
            }
        };
        // part 1 - rowClass
        var rowClass = this.beans.gridOptionsWrapper.getRowClass();
        if (rowClass) {
            if (typeof rowClass === 'function') {
                console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
                return;
            }
            process(rowClass);
        }
        // part 2 - rowClassFunc
        var rowClassFunc = this.beans.gridOptionsWrapper.getRowClassFunc();
        if (rowClassFunc) {
            var params = {
                node: this.rowNode,
                data: this.rowNode.data,
                rowIndex: this.rowNode.rowIndex,
                context: this.beans.gridOptionsWrapper.getContext(),
                api: this.beans.gridOptionsWrapper.getApi()
            };
            var rowClassFuncResult = rowClassFunc(params);
            process(rowClassFuncResult);
        }
        return res;
    };
    RowComp.prototype.preProcessStylesFromGridOptions = function () {
        var rowStyles = this.processStylesFromGridOptions();
        return utils_1._.cssStyleObjectToMarkup(rowStyles);
    };
    RowComp.prototype.postProcessStylesFromGridOptions = function () {
        var rowStyles = this.processStylesFromGridOptions();
        this.eAllRowContainers.forEach(function (row) { return utils_1._.addStylesToElement(row, rowStyles); });
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
        return utils_1._.assign({}, rowStyle, rowStyleFuncResult);
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
        var selected = this.rowNode.isSelected();
        this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-selected', selected); });
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
            if (utils_1._.exists(_this.rowNode.rowTop)) {
                // the row top is updated anyway, however we set it here again
                // to something more reasonable for the animation - ie if the
                // row top is 10000px away, the row will flash out, so this
                // gives it a rounded value, so row animates out more slowly
                var rowTop = _this.roundRowTopToBounds(_this.rowNode.rowTop);
                _this.setRowTop(rowTop);
            }
            else {
                utils_1._.addCssClass(eRow, 'ag-opacity-zero');
            }
        });
        this.eAllRowContainers.push(eRow);
        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.useAnimationFrameForCreate) {
            this.beans.taskQueue.addP2Task(this.addHoverFunctionality.bind(this, eRow));
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
        this.addDestroyableEventListener(eRow, 'mouseenter', function () { return _this.rowNode.onMouseEnter(); });
        this.addDestroyableEventListener(eRow, 'mouseleave', function () { return _this.rowNode.onMouseLeave(); });
        // step 2 - listen for changes on row node (which any eRow can trigger)
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_MOUSE_ENTER, function () {
            // if hover turned off, we don't add the class. we do this here so that if the application
            // toggles this property mid way, we remove the hover form the last row, but we stop
            // adding hovers from that point onwards.
            if (!_this.beans.gridOptionsWrapper.isSuppressRowHoverHighlight()) {
                utils_1._.addCssClass(eRow, 'ag-row-hover');
            }
        });
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_MOUSE_LEAVE, function () {
            utils_1._.removeCssClass(eRow, 'ag-row-hover');
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
        if (utils_1._.exists(this.rowNode.rowHeight)) {
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
    RowComp.prototype.destroy = function (animate) {
        if (animate === void 0) { animate = false; }
        _super.prototype.destroy.call(this);
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
    };
    RowComp.prototype.destroyContainingCells = function () {
        this.forEachCellComp(function (renderedCell) { return renderedCell.destroy(); });
        this.destroyFullWidthComponents();
    };
    // we clear so that the functions are never executed twice
    RowComp.prototype.getAndClearDelayedDestroyFunctions = function () {
        var result = this.removeSecondPassFuncs;
        this.removeSecondPassFuncs = [];
        return result;
    };
    RowComp.prototype.onCellFocusChanged = function () {
        var rowFocused = this.beans.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);
        if (rowFocused !== this.rowFocused) {
            this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused); });
            this.eAllRowContainers.forEach(function (row) { return utils_1._.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused); });
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
        if (utils_1._.exists(pixels)) {
            var afterPaginationPixels = this.applyPaginationOffset(pixels);
            var afterScalingPixels = this.beans.maxDivHeightScaler.getRealPixelPosition(afterPaginationPixels);
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
        this.onCellFocusChanged();
        this.updateRowIndexes();
    };
    RowComp.prototype.updateRowIndexes = function () {
        var _this = this;
        var rowIndexStr = this.rowNode.getRowIndexString();
        var rowIsEven = this.rowNode.rowIndex % 2 === 0;
        var rowIsEvenChanged = this.rowIsEven !== rowIsEven;
        var headerRowCount = this.beans.gridPanel.headerRootComp.getHeaderRowCount();
        if (rowIsEvenChanged) {
            this.rowIsEven = rowIsEven;
        }
        this.eAllRowContainers.forEach(function (eRow) {
            eRow.setAttribute('row-index', rowIndexStr);
            eRow.setAttribute('aria-rowindex', (headerRowCount + _this.rowNode.rowIndex + 1).toString());
            if (!rowIsEvenChanged) {
                return;
            }
            utils_1._.addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
            utils_1._.addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
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
