/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var renderedCell_1 = require("./renderedCell");
var rowNode_1 = require("../entities/rowNode");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var column_1 = require("../entities/column");
var events_1 = require("../events");
var eventService_1 = require("../eventService");
var context_1 = require("../context/context");
var focusedCellController_1 = require("../focusedCellController");
var constants_1 = require("../constants");
var cellRendererService_1 = require("./cellRendererService");
var cellRendererFactory_1 = require("./cellRendererFactory");
var gridPanel_1 = require("../gridPanel/gridPanel");
var beanStub_1 = require("../context/beanStub");
var columnAnimationService_1 = require("./columnAnimationService");
var paginationProxy_1 = require("../rowModels/paginationProxy");
var RenderedRow = (function (_super) {
    __extends(RenderedRow, _super);
    function RenderedRow(parentScope, rowRenderer, bodyContainerComp, fullWidthContainerComp, pinnedLeftContainerComp, pinnedRightContainerComp, node, animateIn) {
        var _this = _super.call(this) || this;
        _this.eAllRowContainers = [];
        _this.renderedCells = {};
        // for animations, there are bits we want done in the next VM turn, to all DOM to update first.
        // instead of each row doing a setTimeout(func,0), we put the functions here and the rowRenderer
        // executes them all in one timeout
        _this.nextVmTurnFunctions = [];
        // for animations, these functions get called 400ms after the row is cleared, called by the rowRenderer
        // so each row isn't setting up it's own timeout
        _this.delayedDestroyFunctions = [];
        // these get called before the row is destroyed - they set up the DOM for the remove animation (ie they
        // set the DOM up for the animation), then the delayedDestroyFunctions get called when the animation is
        // complete (ie removes from the dom).
        _this.startRemoveAnimationFunctions = [];
        _this.editingRow = false;
        _this.initialised = false;
        _this.parentScope = parentScope;
        _this.rowRenderer = rowRenderer;
        _this.bodyContainerComp = bodyContainerComp;
        _this.fullWidthContainerComp = fullWidthContainerComp;
        _this.pinnedLeftContainerComp = pinnedLeftContainerComp;
        _this.pinnedRightContainerComp = pinnedRightContainerComp;
        _this.rowNode = node;
        _this.animateIn = animateIn;
        return _this;
    }
    RenderedRow.prototype.setupRowContainers = function (animateInRowTop) {
        var isFullWidthCellFunc = this.gridOptionsWrapper.getIsFullWidthCellFunc();
        var isFullWidthCell = isFullWidthCellFunc ? isFullWidthCellFunc(this.rowNode) : false;
        var isGroupSpanningRow = this.rowNode.group && this.gridOptionsWrapper.isGroupUseEntireRow();
        if (isFullWidthCell) {
            this.setupFullWidthContainers(animateInRowTop);
        }
        else if (isGroupSpanningRow) {
            this.setupFullWidthGroupContainers(animateInRowTop);
        }
        else {
            this.setupNormalContainers(animateInRowTop);
        }
    };
    // we clear so that the functions are never executed twice
    RenderedRow.prototype.getAndClearDelayedDestroyFunctions = function () {
        var result = this.delayedDestroyFunctions;
        this.delayedDestroyFunctions = [];
        return result;
    };
    // we clear so that the functions are never executed twice
    RenderedRow.prototype.getAndClearNextVMTurnFunctions = function () {
        var result = this.nextVmTurnFunctions;
        this.nextVmTurnFunctions = [];
        return result;
    };
    RenderedRow.prototype.addDomData = function (eRowContainer) {
        var domDataKey = this.gridOptionsWrapper.getDomDataKey();
        var gridCellNoType = eRowContainer;
        gridCellNoType[domDataKey] = {
            renderedRow: this
        };
        this.addDestroyFunc(function () { gridCellNoType[domDataKey] = null; });
    };
    RenderedRow.prototype.setupFullWidthContainers = function (animateInRowTop) {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getFullWidthCellRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getFullWidthCellRendererParams();
        if (utils_1.Utils.missing(this.fullWidthCellRenderer)) {
            console.warn("ag-Grid: you need to provide a fullWidthCellRenderer if using isFullWidthCell()");
        }
        this.createFullWidthRow(animateInRowTop);
    };
    RenderedRow.prototype.addMouseWheelListenerToFullWidthRow = function () {
        var mouseWheelListener = this.gridPanel.genericMouseWheelListener.bind(this.gridPanel);
        // IE9, Chrome, Safari, Opera
        this.addDestroyableEventListener(this.eFullWidthRow, 'mousewheel', mouseWheelListener);
        // Firefox
        this.addDestroyableEventListener(this.eFullWidthRow, 'DOMMouseScroll', mouseWheelListener);
    };
    RenderedRow.prototype.setupFullWidthGroupContainers = function (animateInRowTop) {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getGroupRowRendererParams();
        if (!this.fullWidthCellRenderer) {
            this.fullWidthCellRenderer = cellRendererFactory_1.CellRendererFactory.GROUP;
            this.fullWidthCellRendererParams = {
                innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
            };
        }
        this.createFullWidthRow(animateInRowTop);
    };
    RenderedRow.prototype.createFullWidthRow = function (animateInRowTop) {
        var embedFullWidthRows = this.gridOptionsWrapper.isEmbedFullWidthRows();
        if (embedFullWidthRows) {
            // if embedding the full width, it gets added to the body, left and right
            this.eFullWidthRowBody = this.createRowContainer(this.bodyContainerComp, animateInRowTop);
            this.eFullWidthRowLeft = this.createRowContainer(this.pinnedLeftContainerComp, animateInRowTop);
            this.eFullWidthRowRight = this.createRowContainer(this.pinnedRightContainerComp, animateInRowTop);
            utils_1.Utils.addCssClass(this.eFullWidthRowLeft, 'ag-cell-last-left-pinned');
            utils_1.Utils.addCssClass(this.eFullWidthRowRight, 'ag-cell-first-right-pinned');
        }
        else {
            // otherwise we add to the fullWidth container as normal
            this.eFullWidthRow = this.createRowContainer(this.fullWidthContainerComp, animateInRowTop);
            // and fake the mouse wheel for the fullWidth container
            if (!this.gridOptionsWrapper.isForPrint()) {
                this.addMouseWheelListenerToFullWidthRow();
            }
        }
    };
    RenderedRow.prototype.setupNormalContainers = function (animateInRowTop) {
        this.fullWidthRow = false;
        this.eBodyRow = this.createRowContainer(this.bodyContainerComp, animateInRowTop);
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.ePinnedLeftRow = this.createRowContainer(this.pinnedLeftContainerComp, animateInRowTop);
            this.ePinnedRightRow = this.createRowContainer(this.pinnedRightContainerComp, animateInRowTop);
        }
    };
    RenderedRow.prototype.init = function () {
        var animateInRowTop = this.animateIn && utils_1.Utils.exists(this.rowNode.oldRowTop);
        this.setupRowContainers(animateInRowTop);
        this.scope = this.createChildScopeOrNull(this.rowNode.data);
        if (this.fullWidthRow) {
            this.refreshFullWidthComponent();
        }
        else {
            this.refreshCellsIntoRow();
        }
        this.addGridClasses();
        this.addExpandedAndContractedClasses();
        this.addStyleFromRowStyle();
        this.addStyleFromRowStyleFunc();
        this.addClassesFromRowClass();
        this.addClassesFromRowClassFunc();
        this.addRowIndexes();
        this.addRowIds();
        this.setupTop(animateInRowTop);
        this.setHeight();
        this.addRowSelectedListener();
        this.addCellFocusedListener();
        this.addNodeDataChangedListener();
        this.addColumnListener();
        this.addHoverFunctionality();
        this.gridOptionsWrapper.executeProcessRowPostCreateFunc({
            eRow: this.eBodyRow,
            ePinnedLeftRow: this.ePinnedLeftRow,
            ePinnedRightRow: this.ePinnedRightRow,
            node: this.rowNode,
            api: this.gridOptionsWrapper.getApi(),
            rowIndex: this.rowNode.rowIndex,
            addRenderedRowListener: this.addEventListener.bind(this),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        });
        this.addDataChangedListener();
        this.initialised = true;
    };
    RenderedRow.prototype.stopRowEditing = function (cancel) {
        this.stopEditing(cancel);
    };
    RenderedRow.prototype.isEditing = function () {
        if (this.gridOptionsWrapper.isFullRowEdit()) {
            // if doing row editing, then the local variable is the one that is used
            return this.editingRow;
        }
        else {
            // if not doing row editing, then the renderedRow has no edit state, so
            // we have to look at the individual cells
            var editingCell = utils_1.Utils.find(this.renderedCells, function (renderedCell) { return renderedCell && renderedCell.isEditing(); });
            return utils_1.Utils.exists(editingCell);
        }
    };
    RenderedRow.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.forEachRenderedCell(function (renderedCell) {
            renderedCell.stopEditing(cancel);
        });
        if (this.editingRow) {
            if (!cancel) {
                var event = {
                    node: this.rowNode,
                    data: this.rowNode.data,
                    api: this.gridOptionsWrapper.getApi(),
                    context: this.gridOptionsWrapper.getContext()
                };
                this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_VALUE_CHANGED, event);
            }
            this.setEditingRow(false);
        }
    };
    RenderedRow.prototype.startRowEditing = function (keyPress, charPress, sourceRenderedCell) {
        if (keyPress === void 0) { keyPress = null; }
        if (charPress === void 0) { charPress = null; }
        if (sourceRenderedCell === void 0) { sourceRenderedCell = null; }
        // don't do it if already editing
        if (this.editingRow) {
            return;
        }
        this.forEachRenderedCell(function (renderedCell) {
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
    RenderedRow.prototype.setEditingRow = function (value) {
        this.editingRow = value;
        this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-editing', value); });
        var event = value ? events_1.Events.EVENT_ROW_EDITING_STARTED : events_1.Events.EVENT_ROW_EDITING_STOPPED;
        this.mainEventService.dispatchEvent(event, { node: this.rowNode });
    };
    // because data can change, especially in virtual pagination and viewport row models, need to allow setting
    // styles and classes after the data has changed
    RenderedRow.prototype.addDataChangedListener = function () {
        var _this = this;
        var dataChangedListener = function () {
            _this.addStyleFromRowStyleFunc();
            _this.addClassesFromRowClass();
        };
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, dataChangedListener);
    };
    RenderedRow.prototype.angular1Compile = function (element) {
        if (this.scope) {
            this.$compile(element)(this.scope);
        }
    };
    RenderedRow.prototype.addColumnListener = function () {
        var columnListener = this.onDisplayedColumnsChanged.bind(this);
        var virtualListener = this.onVirtualColumnsChanged.bind(this);
        var gridColumnsChangedListener = this.onGridColumnsChanged.bind(this);
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, virtualListener);
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_COLUMN_RESIZED, columnListener);
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, gridColumnsChangedListener);
    };
    RenderedRow.prototype.onDisplayedColumnsChanged = function () {
        // if row is a group row that spans, then it's not impacted by column changes, with exception of pinning
        if (this.fullWidthRow) {
            if (this.gridOptionsWrapper.isEmbedFullWidthRows()) {
                var leftMismatch = this.fullWidthPinnedLeftLastTime !== this.columnController.isPinningLeft();
                var rightMismatch = this.fullWidthPinnedRightLastTime !== this.columnController.isPinningRight();
                // if either of the pinned panels has shown / hidden, then need to redraw the fullWidth bits when
                // embedded, as what appears in each section depends on whether we are pinned or not
                if (leftMismatch || rightMismatch) {
                    this.refreshFullWidthComponent();
                }
            }
            else {
                // otherwise nothing, the floating fullWidth containers are not impacted by column changes
            }
        }
        else {
            this.refreshCellsIntoRow();
        }
    };
    RenderedRow.prototype.onVirtualColumnsChanged = function (event) {
        // if row is a group row that spans, then it's not impacted by column changes, with exception of pinning
        if (!this.fullWidthRow) {
            this.refreshCellsIntoRow();
        }
    };
    // when grid columns change, then all cells should be cleaned out,
    // as the new columns could have same id as the previous columns and may conflict
    RenderedRow.prototype.onGridColumnsChanged = function () {
        var allRenderedCellIds = Object.keys(this.renderedCells);
        this.removeRenderedCells(allRenderedCellIds);
    };
    RenderedRow.prototype.isCellInWrongRow = function (renderedCell) {
        var column = renderedCell.getColumn();
        var rowWeWant = this.getRowForColumn(column);
        // if in wrong container, remove it
        var oldRow = renderedCell.getParentRow();
        return oldRow !== rowWeWant;
    };
    // method makes sure the right cells are present, and are in the right container. so when this gets called for
    // the first time, it sets up all the cells. but then over time the cells might appear / dissappear or move
    // container (ie into pinned)
    RenderedRow.prototype.refreshCellsIntoRow = function () {
        var _this = this;
        var displayedVirtualColumns = this.columnController.getAllDisplayedVirtualColumns();
        var displayedColumns = this.columnController.getAllDisplayedColumns();
        var cellsToRemove = Object.keys(this.renderedCells);
        displayedVirtualColumns.forEach(function (column) {
            var renderedCell = _this.getOrCreateCell(column);
            _this.ensureCellInCorrectRow(renderedCell);
            utils_1.Utils.removeFromArray(cellsToRemove, column.getColId());
        });
        // we never remove rendered ones, as this would cause the cells to loose their values while editing
        // as the grid is scrolling horizontally
        cellsToRemove = utils_1.Utils.filter(cellsToRemove, function (indexStr) {
            var REMOVE_CELL = true;
            var KEEP_CELL = false;
            var renderedCell = _this.renderedCells[indexStr];
            if (!renderedCell) {
                return REMOVE_CELL;
            }
            // always remove the cell if it's in the wrong pinned location
            if (_this.isCellInWrongRow(renderedCell)) {
                return REMOVE_CELL;
            }
            // we want to try and keep editing and focused cells
            var editing = renderedCell.isEditing();
            var focused = _this.focusedCellController.isCellFocused(renderedCell.getGridCell());
            var mightWantToKeepCell = editing || focused;
            if (mightWantToKeepCell) {
                var column = renderedCell.getColumn();
                var cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
                return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
            }
            else {
                return REMOVE_CELL;
            }
        });
        // remove old cells from gui, but we don't destroy them, we might use them again
        this.removeRenderedCells(cellsToRemove);
    };
    RenderedRow.prototype.removeRenderedCells = function (colIds) {
        var _this = this;
        colIds.forEach(function (key) {
            var renderedCell = _this.renderedCells[key];
            // could be old reference, ie removed cell
            if (utils_1.Utils.missing(renderedCell)) {
                return;
            }
            renderedCell.destroy();
            _this.renderedCells[key] = null;
        });
    };
    RenderedRow.prototype.getRowForColumn = function (column) {
        switch (column.getPinned()) {
            case column_1.Column.PINNED_LEFT: return this.ePinnedLeftRow;
            case column_1.Column.PINNED_RIGHT: return this.ePinnedRightRow;
            default: return this.eBodyRow;
        }
    };
    RenderedRow.prototype.ensureCellInCorrectRow = function (renderedCell) {
        var eRowGui = renderedCell.getGui();
        var column = renderedCell.getColumn();
        var rowWeWant = this.getRowForColumn(column);
        // if in wrong container, remove it
        var oldRow = renderedCell.getParentRow();
        var inWrongRow = oldRow !== rowWeWant;
        if (inWrongRow) {
            // take out from old row
            if (oldRow) {
                oldRow.removeChild(eRowGui);
            }
            rowWeWant.appendChild(eRowGui);
            renderedCell.setParentRow(rowWeWant);
        }
    };
    RenderedRow.prototype.getOrCreateCell = function (column) {
        var colId = column.getColId();
        if (this.renderedCells[colId]) {
            return this.renderedCells[colId];
        }
        else {
            var renderedCell = new renderedCell_1.RenderedCell(column, this.rowNode, this.scope, this);
            this.context.wireBean(renderedCell);
            this.renderedCells[colId] = renderedCell;
            this.angular1Compile(renderedCell.getGui());
            // if we are editing the row, then the cell needs to turn
            // into edit mode
            if (this.editingRow) {
                renderedCell.startEditingIfEnabled();
            }
            return renderedCell;
        }
    };
    RenderedRow.prototype.onRowSelected = function () {
        var selected = this.rowNode.isSelected();
        this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-selected', selected); });
    };
    RenderedRow.prototype.addRowSelectedListener = function () {
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
    };
    RenderedRow.prototype.onMouseEvent = function (eventName, mouseEvent) {
        switch (eventName) {
            case 'dblclick':
                this.onRowDblClick(mouseEvent);
                break;
            case 'click':
                this.onRowClick(mouseEvent);
                break;
        }
    };
    RenderedRow.prototype.addHoverFunctionality = function () {
        var _this = this;
        // because we are adding listeners to the row, we give the user the choice to not add
        // the hover class, as it slows things down, especially in IE, when you add listeners
        // to each row. we cannot do the trick of adding one listener to the GridPanel (like we
        // do for other mouse events) as these events don't propogate
        if (this.gridOptionsWrapper.isSuppressRowHoverClass()) {
            return;
        }
        var onGuiMouseEnter = this.rowNode.onMouseEnter.bind(this.rowNode);
        var onGuiMouseLeave = this.rowNode.onMouseLeave.bind(this.rowNode);
        this.eAllRowContainers.forEach(function (eRow) {
            _this.addDestroyableEventListener(eRow, 'mouseenter', onGuiMouseEnter);
            _this.addDestroyableEventListener(eRow, 'mouseleave', onGuiMouseLeave);
        });
        var onNodeMouseEnter = this.addHoverClass.bind(this, true);
        var onNodeMouseLeave = this.addHoverClass.bind(this, false);
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_MOUSE_ENTER, onNodeMouseEnter);
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_MOUSE_LEAVE, onNodeMouseLeave);
    };
    RenderedRow.prototype.addHoverClass = function (hover) {
        this.eAllRowContainers.forEach(function (eRow) { return utils_1.Utils.addOrRemoveCssClass(eRow, 'ag-row-hover', hover); });
    };
    RenderedRow.prototype.setRowFocusClasses = function () {
        var rowFocused = this.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.floating);
        if (rowFocused !== this.rowFocusedLastTime) {
            this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused); });
            this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused); });
            this.rowFocusedLastTime = rowFocused;
        }
        if (!rowFocused && this.editingRow) {
            this.stopEditing(false);
        }
    };
    RenderedRow.prototype.addCellFocusedListener = function () {
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_CELL_FOCUSED, this.setRowFocusClasses.bind(this));
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, this.setRowFocusClasses.bind(this));
        this.setRowFocusClasses();
    };
    RenderedRow.prototype.onPaginationChanged = function () {
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        this.onTopChanged();
    };
    RenderedRow.prototype.forEachRenderedCell = function (callback) {
        utils_1.Utils.iterateObject(this.renderedCells, function (key, renderedCell) {
            if (renderedCell) {
                callback(renderedCell);
            }
        });
    };
    RenderedRow.prototype.addNodeDataChangedListener = function () {
        var _this = this;
        var nodeDataChangedListener = function () {
            var animate = false;
            var newData = true;
            _this.forEachRenderedCell(function (renderedCell) { return renderedCell.refreshCell(animate, newData); });
            // check for selected also, as this could be after lazy loading of the row data, in which csae
            // the id might of just gotten set inside the row and the row selected state may of changed
            // as a result. this is what happens when selected rows are loaded in virtual pagination.
            _this.onRowSelected();
        };
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, nodeDataChangedListener);
    };
    RenderedRow.prototype.onTopChanged = function () {
        // top is not used in forPrint, as the rows are just laid out naturally
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        // console.log(`top changed for ${this.rowNode.id} = ${this.rowNode.rowTop}`);
        this.setRowTop(this.rowNode.rowTop);
    };
    RenderedRow.prototype.setRowTop = function (pixels) {
        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (utils_1.Utils.exists(pixels)) {
            var pixelsWithOffset = void 0;
            if (this.rowNode.isFloating()) {
                pixelsWithOffset = pixels;
            }
            else {
                pixelsWithOffset = pixels - this.paginationProxy.getPixelOffset();
            }
            var topPx = pixelsWithOffset + "px";
            this.eAllRowContainers.forEach(function (row) { return row.style.top = topPx; });
        }
    };
    RenderedRow.prototype.setupTop = function (animateInRowTop) {
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        var topChangedListener = this.onTopChanged.bind(this);
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_TOP_CHANGED, topChangedListener);
        if (!animateInRowTop) {
            this.onTopChanged();
        }
    };
    RenderedRow.prototype.setHeight = function () {
        var _this = this;
        var setHeightListener = function () {
            // check for exists first - if the user is resetting the row height, then
            // it will be null (or undefined) momentarily until the next time the flatten
            // stage is called where the row will then update again with a new height
            if (utils_1.Utils.exists(_this.rowNode.rowHeight)) {
                var heightPx = _this.rowNode.rowHeight + 'px';
                _this.eAllRowContainers.forEach(function (row) { return row.style.height = heightPx; });
            }
        };
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_HEIGHT_CHANGED, setHeightListener);
        setHeightListener();
    };
    RenderedRow.prototype.addRowIndexes = function () {
        var _this = this;
        var rowIndexListener = function () {
            var rowStr = _this.rowNode.rowIndex.toString();
            if (_this.rowNode.floating === constants_1.Constants.FLOATING_BOTTOM) {
                rowStr = 'fb-' + rowStr;
            }
            else if (_this.rowNode.floating === constants_1.Constants.FLOATING_TOP) {
                rowStr = 'ft-' + rowStr;
            }
            _this.eAllRowContainers.forEach(function (eRow) {
                eRow.setAttribute('row', rowStr);
                var rowIsEven = _this.rowNode.rowIndex % 2 === 0;
                utils_1.Utils.addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
                utils_1.Utils.addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
            });
        };
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, rowIndexListener);
        rowIndexListener();
    };
    // adds in row and row-id attributes to the row
    RenderedRow.prototype.addRowIds = function () {
        if (typeof this.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
            var businessKey = this.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.rowNode);
            if (typeof businessKey === 'string' || typeof businessKey === 'number') {
                this.eAllRowContainers.forEach(function (row) { return row.setAttribute('row-id', businessKey); });
            }
        }
    };
    RenderedRow.prototype.addEventListener = function (eventType, listener) {
        if (!this.renderedRowEventService) {
            this.renderedRowEventService = new eventService_1.EventService();
        }
        this.renderedRowEventService.addEventListener(eventType, listener);
    };
    RenderedRow.prototype.removeEventListener = function (eventType, listener) {
        this.renderedRowEventService.removeEventListener(eventType, listener);
    };
    RenderedRow.prototype.getRenderedCellForColumn = function (column) {
        return this.renderedCells[column.getColId()];
    };
    RenderedRow.prototype.getCellForCol = function (column) {
        var renderedCell = this.renderedCells[column.getColId()];
        if (renderedCell) {
            return renderedCell.getGui();
        }
        else {
            return null;
        }
    };
    RenderedRow.prototype.destroy = function (animate) {
        if (animate === void 0) { animate = false; }
        _super.prototype.destroy.call(this);
        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?
        this.destroyScope();
        this.destroyFullWidthComponent();
        this.forEachRenderedCell(function (renderedCell) { return renderedCell.destroy(); });
        if (animate) {
            this.startRemoveAnimationFunctions.forEach(function (func) { return func(); });
        }
        else {
            // we are not animating, so execute the second stage of removal now.
            // we call getAndClear, so that they are only called once
            var delayedDestroyFunctions = this.getAndClearDelayedDestroyFunctions();
            delayedDestroyFunctions.forEach(function (func) { return func(); });
        }
        if (this.renderedRowEventService) {
            this.renderedRowEventService.dispatchEvent(RenderedRow.EVENT_RENDERED_ROW_REMOVED, { node: this.rowNode });
        }
        var event = { node: this.rowNode, rowIndex: this.rowNode.rowIndex };
        this.mainEventService.dispatchEvent(events_1.Events.EVENT_VIRTUAL_ROW_REMOVED, event);
    };
    RenderedRow.prototype.destroyScope = function () {
        if (this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }
    };
    RenderedRow.prototype.isGroup = function () {
        return this.rowNode.group === true;
    };
    RenderedRow.prototype.refreshFullWidthComponent = function () {
        this.destroyFullWidthComponent();
        this.createFullWidthComponent();
    };
    RenderedRow.prototype.createFullWidthComponent = function () {
        this.fullWidthPinnedLeftLastTime = this.columnController.isPinningLeft();
        this.fullWidthPinnedRightLastTime = this.columnController.isPinningRight();
        if (this.eFullWidthRow) {
            var params = this.createFullWidthParams(this.eFullWidthRow, null);
            this.fullWidthRowComponent = this.cellRendererService.useCellRenderer(this.fullWidthCellRenderer, this.eFullWidthRow, params);
            this.angular1Compile(this.eFullWidthRow);
        }
        if (this.eFullWidthRowBody) {
            var params = this.createFullWidthParams(this.eFullWidthRowBody, null);
            this.fullWidthRowComponentBody = this.cellRendererService.useCellRenderer(this.fullWidthCellRenderer, this.eFullWidthRowBody, params);
            this.angular1Compile(this.eFullWidthRowBody);
        }
        if (this.eFullWidthRowLeft) {
            var params = this.createFullWidthParams(this.eFullWidthRowLeft, column_1.Column.PINNED_LEFT);
            this.fullWidthRowComponentLeft = this.cellRendererService.useCellRenderer(this.fullWidthCellRenderer, this.eFullWidthRowLeft, params);
            this.angular1Compile(this.eFullWidthRowLeft);
        }
        if (this.eFullWidthRowRight) {
            var params = this.createFullWidthParams(this.eFullWidthRowRight, column_1.Column.PINNED_RIGHT);
            this.fullWidthRowComponentRight = this.cellRendererService.useCellRenderer(this.fullWidthCellRenderer, this.eFullWidthRowRight, params);
            this.angular1Compile(this.eFullWidthRowRight);
        }
    };
    RenderedRow.prototype.destroyFullWidthComponent = function () {
        if (this.fullWidthRowComponent) {
            if (this.fullWidthRowComponent.destroy) {
                this.fullWidthRowComponent.destroy();
            }
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentBody) {
            if (this.fullWidthRowComponentBody.destroy) {
                this.fullWidthRowComponentBody.destroy();
            }
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentLeft) {
            if (this.fullWidthRowComponentLeft.destroy) {
                this.fullWidthRowComponentLeft.destroy();
            }
            this.fullWidthRowComponentLeft = null;
        }
        if (this.fullWidthRowComponentRight) {
            if (this.fullWidthRowComponentRight.destroy) {
                this.fullWidthRowComponentRight.destroy();
            }
            this.fullWidthRowComponent = null;
        }
        if (this.eFullWidthRow) {
            utils_1.Utils.removeAllChildren(this.eFullWidthRow);
        }
        if (this.eFullWidthRowBody) {
            utils_1.Utils.removeAllChildren(this.eFullWidthRowBody);
        }
        if (this.eFullWidthRowLeft) {
            utils_1.Utils.removeAllChildren(this.eFullWidthRowLeft);
        }
        if (this.eFullWidthRowRight) {
            utils_1.Utils.removeAllChildren(this.eFullWidthRowRight);
        }
    };
    RenderedRow.prototype.createFullWidthParams = function (eRow, pinned) {
        var params = {
            data: this.rowNode.data,
            node: this.rowNode,
            $scope: this.scope,
            rowIndex: this.rowNode.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            eGridCell: eRow,
            eParentOfValue: eRow,
            pinned: pinned,
            addRenderedRowListener: this.addEventListener.bind(this),
            colDef: {
                cellRenderer: this.fullWidthCellRenderer,
                cellRendererParams: this.fullWidthCellRendererParams
            }
        };
        if (this.fullWidthCellRendererParams) {
            utils_1.Utils.assign(params, this.fullWidthCellRendererParams);
        }
        return params;
    };
    RenderedRow.prototype.createChildScopeOrNull = function (data) {
        if (this.gridOptionsWrapper.isAngularCompileRows()) {
            var newChildScope = this.parentScope.$new();
            newChildScope.data = data;
            newChildScope.rowNode = this.rowNode;
            newChildScope.context = this.gridOptionsWrapper.getContext();
            return newChildScope;
        }
        else {
            return null;
        }
    };
    RenderedRow.prototype.addStyleFromRowStyle = function () {
        var rowStyle = this.gridOptionsWrapper.getRowStyle();
        if (rowStyle) {
            if (typeof rowStyle === 'function') {
                console.log('ag-Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            }
            else {
                this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addStylesToElement(row, rowStyle); });
            }
        }
    };
    RenderedRow.prototype.addStyleFromRowStyleFunc = function () {
        var rowStyleFunc = this.gridOptionsWrapper.getRowStyleFunc();
        if (rowStyleFunc) {
            var params = {
                data: this.rowNode.data,
                node: this.rowNode,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext(),
                $scope: this.scope
            };
            var cssToUseFromFunc = rowStyleFunc(params);
            this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addStylesToElement(row, cssToUseFromFunc); });
        }
    };
    RenderedRow.prototype.createParams = function () {
        var params = {
            node: this.rowNode,
            data: this.rowNode.data,
            rowIndex: this.rowNode.rowIndex,
            $scope: this.scope,
            context: this.gridOptionsWrapper.getContext(),
            api: this.gridOptionsWrapper.getApi()
        };
        return params;
    };
    RenderedRow.prototype.createEvent = function (event, eventSource) {
        var agEvent = this.createParams();
        agEvent.event = event;
        agEvent.eventSource = eventSource;
        return agEvent;
    };
    RenderedRow.prototype.createRowContainer = function (rowContainerComp, slideRowIn) {
        var _this = this;
        var eRow = document.createElement('div');
        this.addDomData(eRow);
        rowContainerComp.appendRowElement(eRow);
        this.eAllRowContainers.push(eRow);
        this.delayedDestroyFunctions.push(function () {
            rowContainerComp.removeRowElement(eRow);
        });
        this.startRemoveAnimationFunctions.push(function () {
            utils_1.Utils.addCssClass(eRow, 'ag-opacity-zero');
            if (utils_1.Utils.exists(_this.rowNode.rowTop)) {
                var rowTop = _this.roundRowTopToBounds(_this.rowNode.rowTop);
                _this.setRowTop(rowTop);
            }
            // _.prepend(eParent, eRow);
        });
        if (this.animateIn) {
            this.animateRowIn(eRow, slideRowIn);
        }
        return eRow;
    };
    // puts animation into the row by setting start state and then final state in another VM turn
    // (another VM turn so the rendering engine will kick off once with start state, and then transition
    // into the end state)
    RenderedRow.prototype.animateRowIn = function (eRow, slideRowIn) {
        if (slideRowIn) {
            // for sliding the row in, we position the row in it's old position first
            var rowTop = this.roundRowTopToBounds(this.rowNode.oldRowTop);
            this.setRowTop(rowTop);
            // and then update the position to it's new position
            this.nextVmTurnFunctions.push(this.onTopChanged.bind(this));
        }
        else {
            // for fading in, we first set it invisible
            utils_1.Utils.addCssClass(eRow, 'ag-opacity-zero');
            // and then transition to visible
            this.nextVmTurnFunctions.push(function () { return utils_1.Utils.removeCssClass(eRow, 'ag-opacity-zero'); });
        }
    };
    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    RenderedRow.prototype.roundRowTopToBounds = function (rowTop) {
        var range = this.gridPanel.getVerticalPixelRange();
        var minPixel = range.top - 100;
        var maxPixel = range.bottom + 100;
        if (rowTop < minPixel) {
            return minPixel;
        }
        else if (rowTop > maxPixel) {
            return maxPixel;
        }
        else {
            return rowTop;
        }
    };
    RenderedRow.prototype.onRowDblClick = function (event) {
        var agEvent = this.createEvent(event, this);
        this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
    };
    RenderedRow.prototype.onRowClick = function (event) {
        var agEvent = this.createEvent(event, this);
        this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_CLICKED, agEvent);
        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = event.ctrlKey || event.metaKey;
        var shiftKeyPressed = event.shiftKey;
        // we do not allow selecting groups by clicking (as the click here expands the group)
        // so return if it's a group row
        if (this.rowNode.group) {
            return;
        }
        // we also don't allow selection of floating rows
        if (this.rowNode.floating) {
            return;
        }
        // if no selection method enabled, do nothing
        if (!this.gridOptionsWrapper.isRowSelection()) {
            return;
        }
        // if click selection suppressed, do nothing
        if (this.gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }
        if (this.rowNode.isSelected()) {
            if (multiSelectKeyPressed) {
                if (this.gridOptionsWrapper.isRowDeselection()) {
                    this.rowNode.setSelectedParams({ newValue: false });
                }
            }
            else {
                // selected with no multi key, must make sure anything else is unselected
                this.rowNode.setSelectedParams({ newValue: true, clearSelection: true });
            }
        }
        else {
            this.rowNode.setSelectedParams({ newValue: true, clearSelection: !multiSelectKeyPressed, rangeSelect: shiftKeyPressed });
        }
    };
    RenderedRow.prototype.getRowNode = function () {
        return this.rowNode;
    };
    RenderedRow.prototype.refreshCells = function (cols, animate) {
        if (!cols) {
            return;
        }
        var columnsToRefresh = this.columnController.getGridColumns(cols);
        this.forEachRenderedCell(function (renderedCell) {
            var colForCel = renderedCell.getColumn();
            if (columnsToRefresh.indexOf(colForCel) >= 0) {
                renderedCell.refreshCell(animate);
            }
        });
    };
    RenderedRow.prototype.addClassesFromRowClassFunc = function () {
        var _this = this;
        var classes = [];
        var gridOptionsRowClassFunc = this.gridOptionsWrapper.getRowClassFunc();
        if (gridOptionsRowClassFunc) {
            var params = {
                node: this.rowNode,
                data: this.rowNode.data,
                rowIndex: this.rowNode.rowIndex,
                context: this.gridOptionsWrapper.getContext(),
                api: this.gridOptionsWrapper.getApi()
            };
            var classToUseFromFunc = gridOptionsRowClassFunc(params);
            if (classToUseFromFunc) {
                if (typeof classToUseFromFunc === 'string') {
                    classes.push(classToUseFromFunc);
                }
                else if (Array.isArray(classToUseFromFunc)) {
                    classToUseFromFunc.forEach(function (classItem) {
                        classes.push(classItem);
                    });
                }
            }
        }
        classes.forEach(function (classStr) {
            _this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addCssClass(row, classStr); });
        });
    };
    RenderedRow.prototype.addGridClasses = function () {
        var _this = this;
        var classes = [];
        classes.push('ag-row');
        classes.push('ag-row-no-focus');
        if (this.gridOptionsWrapper.isAnimateRows()) {
            classes.push('ag-row-animation');
        }
        else {
            classes.push('ag-row-no-animation');
        }
        if (this.rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }
        if (this.rowNode.group) {
            classes.push('ag-row-group');
            // if a group, put the level of the group in
            classes.push('ag-row-level-' + this.rowNode.level);
            if (this.rowNode.footer) {
                classes.push('ag-row-footer');
            }
        }
        else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            if (this.rowNode.parent) {
                classes.push('ag-row-level-' + (this.rowNode.parent.level + 1));
            }
            else {
                classes.push('ag-row-level-0');
            }
        }
        if (this.fullWidthRow) {
            classes.push('ag-full-width-row');
        }
        classes.forEach(function (classStr) {
            _this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addCssClass(row, classStr); });
        });
    };
    RenderedRow.prototype.addExpandedAndContractedClasses = function () {
        var _this = this;
        var isGroupNode = this.rowNode.group && !this.rowNode.footer;
        if (!isGroupNode) {
            return;
        }
        var listener = function () {
            var expanded = _this.rowNode.expanded;
            _this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-group-expanded', expanded); });
            _this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-group-contracted', !expanded); });
        };
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_EXPANDED_CHANGED, listener);
    };
    RenderedRow.prototype.addClassesFromRowClass = function () {
        var _this = this;
        var classes = [];
        // add in extra classes provided by the config
        var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();
        if (gridOptionsRowClass) {
            if (typeof gridOptionsRowClass === 'function') {
                console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
            }
            else {
                if (typeof gridOptionsRowClass === 'string') {
                    classes.push(gridOptionsRowClass);
                }
                else if (Array.isArray(gridOptionsRowClass)) {
                    gridOptionsRowClass.forEach(function (classItem) {
                        classes.push(classItem);
                    });
                }
            }
        }
        classes.forEach(function (classStr) {
            _this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addCssClass(row, classStr); });
        });
    };
    return RenderedRow;
}(beanStub_1.BeanStub));
RenderedRow.EVENT_RENDERED_ROW_REMOVED = 'renderedRowRemoved';
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], RenderedRow.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], RenderedRow.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('columnAnimationService'),
    __metadata("design:type", columnAnimationService_1.ColumnAnimationService)
], RenderedRow.prototype, "columnAnimationService", void 0);
__decorate([
    context_1.Autowired('$compile'),
    __metadata("design:type", Object)
], RenderedRow.prototype, "$compile", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], RenderedRow.prototype, "mainEventService", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], RenderedRow.prototype, "context", void 0);
__decorate([
    context_1.Autowired('focusedCellController'),
    __metadata("design:type", focusedCellController_1.FocusedCellController)
], RenderedRow.prototype, "focusedCellController", void 0);
__decorate([
    context_1.Autowired('cellRendererService'),
    __metadata("design:type", cellRendererService_1.CellRendererService)
], RenderedRow.prototype, "cellRendererService", void 0);
__decorate([
    context_1.Autowired('gridPanel'),
    __metadata("design:type", gridPanel_1.GridPanel)
], RenderedRow.prototype, "gridPanel", void 0);
__decorate([
    context_1.Autowired('paginationProxy'),
    __metadata("design:type", paginationProxy_1.PaginationProxy)
], RenderedRow.prototype, "paginationProxy", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RenderedRow.prototype, "init", null);
exports.RenderedRow = RenderedRow;
