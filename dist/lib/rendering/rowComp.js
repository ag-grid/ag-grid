/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v12.0.2
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
var cellComp_1 = require("./cellComp");
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
var component_1 = require("../widgets/component");
var svgFactory_1 = require("../svgFactory");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var TempStubCell = (function (_super) {
    __extends(TempStubCell, _super);
    function TempStubCell() {
        return _super.call(this, TempStubCell.TEMPLATE) || this;
    }
    TempStubCell.prototype.init = function (params) {
        var eLoadingIcon = utils_1.Utils.createIconNoSpan('groupLoading', this.gridOptionsWrapper, null, svgFactory.createGroupLoadingIcon);
        this.eLoadingIcon.appendChild(eLoadingIcon);
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
    };
    TempStubCell.prototype.refresh = function (params) {
        return false;
    };
    TempStubCell.TEMPLATE = "<div class=\"ag-stub-cell\">\n            <span class=\"ag-loading-icon\" ref=\"eLoadingIcon\"></span>\n            <span class=\"ag-loading-text\" ref=\"eLoadingText\"></span>\n        </div>";
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], TempStubCell.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLoadingIcon'),
        __metadata("design:type", HTMLElement)
    ], TempStubCell.prototype, "eLoadingIcon", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eLoadingText'),
        __metadata("design:type", HTMLElement)
    ], TempStubCell.prototype, "eLoadingText", void 0);
    return TempStubCell;
}(component_1.Component));
var RowComp = (function (_super) {
    __extends(RowComp, _super);
    function RowComp(parentScope, rowRenderer, bodyContainerComp, fullWidthContainerComp, pinnedLeftContainerComp, pinnedRightContainerComp, node, animateIn, lastPlacedElements) {
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
        _this.lastPlacedElements = lastPlacedElements;
        return _this;
    }
    RowComp.prototype.setupRowStub = function (animateInRowTop) {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = TempStubCell;
        if (utils_1.Utils.missing(this.fullWidthCellRenderer)) {
            console.warn("ag-Grid: you need to provide a fullWidthCellRenderer if using isFullWidthCell()");
        }
        this.createFullWidthRow(animateInRowTop);
    };
    RowComp.prototype.setupRowContainers = function (animateInRowTop) {
        // fixme: hack - to get loading working for Enterprise Model
        if (this.rowNode.stub) {
            this.setupRowStub(animateInRowTop);
            return;
        }
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
    RowComp.prototype.getAndClearDelayedDestroyFunctions = function () {
        var result = this.delayedDestroyFunctions;
        this.delayedDestroyFunctions = [];
        return result;
    };
    // we clear so that the functions are never executed twice
    RowComp.prototype.getAndClearNextVMTurnFunctions = function () {
        var result = this.nextVmTurnFunctions;
        this.nextVmTurnFunctions = [];
        return result;
    };
    RowComp.prototype.addDomData = function (eRowContainer) {
        var _this = this;
        this.gridOptionsWrapper.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, this);
        this.addDestroyFunc(function () {
            _this.gridOptionsWrapper.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, null);
        });
    };
    RowComp.prototype.ensureInDomAfter = function (previousElement) {
        if (utils_1.Utils.missing(previousElement)) {
            return;
        }
        var body = this.getBodyRowElement();
        if (body) {
            this.bodyContainerComp.ensureDomOrder(body, previousElement.eBody);
        }
        var left = this.getPinnedLeftRowElement();
        if (left) {
            this.pinnedLeftContainerComp.ensureDomOrder(left, previousElement.eLeft);
        }
        var right = this.getPinnedRightRowElement();
        if (right) {
            this.pinnedRightContainerComp.ensureDomOrder(right, previousElement.eRight);
        }
        var fullWidth = this.getFullWidthRowElement();
        if (fullWidth) {
            this.fullWidthContainerComp.ensureDomOrder(fullWidth, previousElement.eFullWidth);
        }
    };
    RowComp.prototype.setupFullWidthContainers = function (animateInRowTop) {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getFullWidthCellRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getFullWidthCellRendererParams();
        if (utils_1.Utils.missing(this.fullWidthCellRenderer)) {
            console.warn("ag-Grid: you need to provide a fullWidthCellRenderer if using isFullWidthCell()");
        }
        this.createFullWidthRow(animateInRowTop);
    };
    RowComp.prototype.addMouseWheelListenerToFullWidthRow = function () {
        var mouseWheelListener = this.gridPanel.genericMouseWheelListener.bind(this.gridPanel);
        // IE9, Chrome, Safari, Opera
        this.addDestroyableEventListener(this.eFullWidthRow, 'mousewheel', mouseWheelListener);
        // Firefox
        this.addDestroyableEventListener(this.eFullWidthRow, 'DOMMouseScroll', mouseWheelListener);
    };
    RowComp.prototype.setupFullWidthGroupContainers = function (animateInRowTop) {
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
    RowComp.prototype.createFullWidthRow = function (animateInRowTop) {
        var embedFullWidthRows = this.gridOptionsWrapper.isEmbedFullWidthRows();
        var ensureDomOrder = utils_1.Utils.exists(this.lastPlacedElements);
        if (embedFullWidthRows) {
            // if embedding the full width, it gets added to the body, left and right
            var previousBody = ensureDomOrder ? this.lastPlacedElements.eBody : null;
            var previousLeft = ensureDomOrder ? this.lastPlacedElements.eLeft : null;
            var previousRight = ensureDomOrder ? this.lastPlacedElements.eRight : null;
            this.eFullWidthRowBody = this.createRowContainer(this.bodyContainerComp, animateInRowTop, previousBody, ensureDomOrder);
            this.eFullWidthRowLeft = this.createRowContainer(this.pinnedLeftContainerComp, animateInRowTop, previousLeft, ensureDomOrder);
            this.eFullWidthRowRight = this.createRowContainer(this.pinnedRightContainerComp, animateInRowTop, previousRight, ensureDomOrder);
            utils_1.Utils.addCssClass(this.eFullWidthRowLeft, 'ag-cell-last-left-pinned');
            utils_1.Utils.addCssClass(this.eFullWidthRowRight, 'ag-cell-first-right-pinned');
        }
        else {
            // otherwise we add to the fullWidth container as normal
            var previousFullWidth = ensureDomOrder ? this.lastPlacedElements.eFullWidth : null;
            this.eFullWidthRow = this.createRowContainer(this.fullWidthContainerComp, animateInRowTop, previousFullWidth, ensureDomOrder);
            // and fake the mouse wheel for the fullWidth container
            if (!this.gridOptionsWrapper.isForPrint()) {
                this.addMouseWheelListenerToFullWidthRow();
            }
        }
    };
    RowComp.prototype.setupNormalContainers = function (animateInRowTop) {
        this.fullWidthRow = false;
        var ensureDomOrder = utils_1.Utils.exists(this.lastPlacedElements);
        var previousBody = ensureDomOrder ? this.lastPlacedElements.eBody : null;
        var previousLeft = ensureDomOrder ? this.lastPlacedElements.eLeft : null;
        var previousRight = ensureDomOrder ? this.lastPlacedElements.eRight : null;
        this.eBodyRow = this.createRowContainer(this.bodyContainerComp, animateInRowTop, previousBody, ensureDomOrder);
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.ePinnedLeftRow = this.createRowContainer(this.pinnedLeftContainerComp, animateInRowTop, previousLeft, ensureDomOrder);
            this.ePinnedRightRow = this.createRowContainer(this.pinnedRightContainerComp, animateInRowTop, previousRight, ensureDomOrder);
        }
    };
    RowComp.prototype.init = function () {
        this.forPrint = this.gridOptionsWrapper.isForPrint();
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
        this.initialised = true;
    };
    RowComp.prototype.stopRowEditing = function (cancel) {
        this.stopEditing(cancel);
    };
    RowComp.prototype.isEditing = function () {
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
    RowComp.prototype.stopEditing = function (cancel) {
        if (cancel === void 0) { cancel = false; }
        this.forEachCellComp(function (renderedCell) {
            renderedCell.stopEditing(cancel);
        });
        if (this.editingRow) {
            if (!cancel) {
                var event_1 = {
                    node: this.rowNode,
                    data: this.rowNode.data,
                    api: this.gridOptionsWrapper.getApi(),
                    context: this.gridOptionsWrapper.getContext()
                };
                this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_VALUE_CHANGED, event_1);
            }
            this.setEditingRow(false);
        }
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
    RowComp.prototype.setEditingRow = function (value) {
        this.editingRow = value;
        this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-editing', value); });
        var event = value ? events_1.Events.EVENT_ROW_EDITING_STARTED : events_1.Events.EVENT_ROW_EDITING_STOPPED;
        this.mainEventService.dispatchEvent(event, { node: this.rowNode });
    };
    RowComp.prototype.angular1Compile = function (element) {
        if (this.scope) {
            this.$compile(element)(this.scope);
        }
    };
    RowComp.prototype.addColumnListener = function () {
        var columnListener = this.onDisplayedColumnsChanged.bind(this);
        var virtualListener = this.onVirtualColumnsChanged.bind(this);
        var gridColumnsChangedListener = this.onGridColumnsChanged.bind(this);
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, virtualListener);
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_COLUMN_RESIZED, columnListener);
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_GRID_COLUMNS_CHANGED, gridColumnsChangedListener);
    };
    RowComp.prototype.onDisplayedColumnsChanged = function () {
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
    RowComp.prototype.onVirtualColumnsChanged = function (event) {
        // if row is a group row that spans, then it's not impacted by column changes, with exception of pinning
        if (!this.fullWidthRow) {
            this.refreshCellsIntoRow();
        }
    };
    // when grid columns change, then all cells should be cleaned out,
    // as the new columns could have same id as the previous columns and may conflict
    RowComp.prototype.onGridColumnsChanged = function () {
        var allRenderedCellIds = Object.keys(this.renderedCells);
        this.removeRenderedCells(allRenderedCellIds);
    };
    RowComp.prototype.isCellInWrongRow = function (renderedCell) {
        var column = renderedCell.getColumn();
        var rowWeWant = this.getContainerForCell(column.getPinned());
        // if in wrong container, remove it
        var oldRow = renderedCell.getParentRow();
        return oldRow !== rowWeWant;
    };
    // method makes sure the right cells are present, and are in the right container. so when this gets called for
    // the first time, it sets up all the cells. but then over time the cells might appear / dissappear or move
    // container (ie into pinned)
    RowComp.prototype.refreshCellsIntoRow = function () {
        var _this = this;
        var centerCols = this.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
        var leftColumns = this.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
        var rightCols = this.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        var cellsToRemove = Object.keys(this.renderedCells);
        var ensureDomOrder = this.gridOptionsWrapper.isEnsureDomOrder() && !this.forPrint;
        var lastPlacedCells = ensureDomOrder ? { eLeft: null, eRight: null, eBody: null, eFullWidth: null } : null;
        var addColFunc = function (column) {
            var renderedCell = _this.getOrCreateCell(column);
            _this.ensureCellInCorrectContainer(renderedCell, lastPlacedCells);
            utils_1.Utils.removeFromArray(cellsToRemove, column.getColId());
        };
        centerCols.forEach(addColFunc);
        leftColumns.forEach(addColFunc);
        rightCols.forEach(addColFunc);
        // we never remove editing cells, as this would cause the cells to loose their values while editing
        // as the grid is scrolling horizontally.
        cellsToRemove = utils_1.Utils.filter(cellsToRemove, this.isCellEligibleToBeRemoved.bind(this));
        // remove old cells from gui, but we don't destroy them, we might use them again
        this.removeRenderedCells(cellsToRemove);
    };
    RowComp.prototype.isCellEligibleToBeRemoved = function (indexStr) {
        var displayedColumns = this.columnController.getAllDisplayedColumns();
        var REMOVE_CELL = true;
        var KEEP_CELL = false;
        var renderedCell = this.renderedCells[indexStr];
        if (!renderedCell) {
            return REMOVE_CELL;
        }
        // always remove the cell if it's in the wrong pinned location
        if (this.isCellInWrongRow(renderedCell)) {
            return REMOVE_CELL;
        }
        // we want to try and keep editing and focused cells
        var editing = renderedCell.isEditing();
        var focused = this.focusedCellController.isCellFocused(renderedCell.getGridCell());
        var mightWantToKeepCell = editing || focused;
        if (mightWantToKeepCell) {
            var column = renderedCell.getColumn();
            var cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        }
        else {
            return REMOVE_CELL;
        }
    };
    RowComp.prototype.removeRenderedCells = function (colIds) {
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
    RowComp.prototype.getContainerForCell = function (pinnedType) {
        switch (pinnedType) {
            case column_1.Column.PINNED_LEFT: return this.ePinnedLeftRow;
            case column_1.Column.PINNED_RIGHT: return this.ePinnedRightRow;
            default: return this.eBodyRow;
        }
    };
    RowComp.prototype.ensureCellInCorrectContainer = function (cellComp, lastPlacedCells) {
        var eCell = cellComp.getGui();
        var column = cellComp.getColumn();
        var pinnedType = column.getPinned();
        var eContainer = this.getContainerForCell(pinnedType);
        var eCellBefore = this.getLastPlacedCell(lastPlacedCells, pinnedType);
        var forcingOrder = utils_1.Utils.exists(lastPlacedCells);
        // if in wrong container, remove it
        var eOldContainer = cellComp.getParentRow();
        var inWrongRow = eOldContainer !== eContainer;
        if (inWrongRow) {
            // take out from old row
            if (eOldContainer) {
                eOldContainer.removeChild(eCell);
            }
            cellComp.setParentRow(eContainer);
            eContainer.appendChild(eCell);
            if (forcingOrder) {
                utils_1.Utils.insertWithDomOrder(eContainer, eCell, eCellBefore);
            }
            else {
                eContainer.appendChild(eCell);
            }
        }
        else {
            // ensure it is in the right order
            if (forcingOrder) {
                utils_1.Utils.ensureDomOrder(eContainer, eCell, eCellBefore);
            }
        }
        this.addToLastPlacedCells(eCell, lastPlacedCells, pinnedType);
    };
    RowComp.prototype.getLastPlacedCell = function (lastPlacedCells, pinned) {
        if (!lastPlacedCells) {
            return null;
        }
        switch (pinned) {
            case column_1.Column.PINNED_LEFT: return lastPlacedCells.eLeft;
            case column_1.Column.PINNED_RIGHT: return lastPlacedCells.eRight;
            default: return lastPlacedCells.eBody;
        }
    };
    RowComp.prototype.addToLastPlacedCells = function (eCell, lastPlacedCells, pinned) {
        if (!lastPlacedCells) {
            return;
        }
        switch (pinned) {
            case column_1.Column.PINNED_LEFT:
                lastPlacedCells.eLeft = eCell;
                break;
            case column_1.Column.PINNED_RIGHT:
                lastPlacedCells.eRight = eCell;
                break;
            default:
                lastPlacedCells.eBody = eCell;
                break;
        }
    };
    RowComp.prototype.getOrCreateCell = function (column) {
        var colId = column.getColId();
        if (this.renderedCells[colId]) {
            return this.renderedCells[colId];
        }
        else {
            var renderedCell = new cellComp_1.CellComp(column, this.rowNode, this.scope, this);
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
    RowComp.prototype.onRowSelected = function () {
        var selected = this.rowNode.isSelected();
        this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-selected', selected); });
    };
    RowComp.prototype.addRowSelectedListener = function () {
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
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
    RowComp.prototype.addHoverFunctionality = function () {
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
    RowComp.prototype.addHoverClass = function (hover) {
        this.eAllRowContainers.forEach(function (eRow) { return utils_1.Utils.addOrRemoveCssClass(eRow, 'ag-row-hover', hover); });
    };
    RowComp.prototype.setRowFocusClasses = function () {
        var rowFocused = this.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);
        if (rowFocused !== this.rowFocusedLastTime) {
            this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused); });
            this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused); });
            this.rowFocusedLastTime = rowFocused;
        }
        if (!rowFocused && this.editingRow) {
            this.stopEditing(false);
        }
    };
    RowComp.prototype.addCellFocusedListener = function () {
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_CELL_FOCUSED, this.setRowFocusClasses.bind(this));
        this.addDestroyableEventListener(this.mainEventService, events_1.Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_ROW_INDEX_CHANGED, this.setRowFocusClasses.bind(this));
        this.setRowFocusClasses();
    };
    RowComp.prototype.onPaginationChanged = function () {
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        this.onTopChanged();
    };
    RowComp.prototype.forEachCellComp = function (callback) {
        utils_1.Utils.iterateObject(this.renderedCells, function (key, renderedCell) {
            if (renderedCell) {
                callback(renderedCell);
            }
        });
    };
    RowComp.prototype.onNodeDataChanged = function (event) {
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
        this.addStyleFromRowStyleFunc();
        this.addClassesFromRowClass();
    };
    RowComp.prototype.addNodeDataChangedListener = function () {
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_DATA_CHANGED, this.onNodeDataChanged.bind(this));
    };
    RowComp.prototype.onTopChanged = function () {
        // top is not used in forPrint, as the rows are just laid out naturally
        var doNotSetRowTop = this.gridOptionsWrapper.isForPrint() || this.gridOptionsWrapper.isAutoHeight();
        if (doNotSetRowTop) {
            return;
        }
        // console.log(`top changed for ${this.rowNode.id} = ${this.rowNode.rowTop}`);
        this.setRowTop(this.rowNode.rowTop);
    };
    RowComp.prototype.setRowTop = function (pixels) {
        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (utils_1.Utils.exists(pixels)) {
            var pixelsWithOffset = void 0;
            if (this.rowNode.isRowPinned()) {
                pixelsWithOffset = pixels;
            }
            else {
                pixelsWithOffset = pixels - this.paginationProxy.getPixelOffset();
            }
            var topPx_1 = pixelsWithOffset + "px";
            this.eAllRowContainers.forEach(function (row) { return row.style.top = topPx_1; });
        }
    };
    RowComp.prototype.setupTop = function (animateInRowTop) {
        if (this.gridOptionsWrapper.isForPrint()) {
            return;
        }
        var topChangedListener = this.onTopChanged.bind(this);
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_TOP_CHANGED, topChangedListener);
        if (!animateInRowTop) {
            this.onTopChanged();
        }
    };
    RowComp.prototype.setHeight = function () {
        var _this = this;
        var setHeightListener = function () {
            // check for exists first - if the user is resetting the row height, then
            // it will be null (or undefined) momentarily until the next time the flatten
            // stage is called where the row will then update again with a new height
            if (utils_1.Utils.exists(_this.rowNode.rowHeight)) {
                var heightPx_1 = _this.rowNode.rowHeight + 'px';
                _this.eAllRowContainers.forEach(function (row) { return row.style.height = heightPx_1; });
            }
        };
        this.addDestroyableEventListener(this.rowNode, rowNode_1.RowNode.EVENT_HEIGHT_CHANGED, setHeightListener);
        setHeightListener();
    };
    RowComp.prototype.addRowIndexes = function () {
        var _this = this;
        var rowIndexListener = function () {
            var rowStr = _this.rowNode.rowIndex.toString();
            if (_this.rowNode.rowPinned === constants_1.Constants.PINNED_BOTTOM) {
                rowStr = 'fb-' + rowStr;
            }
            else if (_this.rowNode.rowPinned === constants_1.Constants.PINNED_TOP) {
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
    RowComp.prototype.addRowIds = function () {
        if (typeof this.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
            var businessKey_1 = this.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.rowNode);
            if (typeof businessKey_1 === 'string' || typeof businessKey_1 === 'number') {
                this.eAllRowContainers.forEach(function (row) { return row.setAttribute('row-id', businessKey_1); });
            }
        }
    };
    RowComp.prototype.addEventListener = function (eventType, listener) {
        if (eventType === 'renderedRowRemoved') {
            eventType = RowComp.EVENT_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved is now called ' + RowComp.EVENT_ROW_REMOVED);
        }
        if (!this.renderedRowEventService) {
            this.renderedRowEventService = new eventService_1.EventService();
        }
        this.renderedRowEventService.addEventListener(eventType, listener);
    };
    RowComp.prototype.removeEventListener = function (eventType, listener) {
        if (eventType === 'renderedRowRemoved') {
            eventType = RowComp.EVENT_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved is now called ' + RowComp.EVENT_ROW_REMOVED);
        }
        this.renderedRowEventService.removeEventListener(eventType, listener);
    };
    RowComp.prototype.getRenderedCellForColumn = function (column) {
        return this.renderedCells[column.getColId()];
    };
    RowComp.prototype.getCellForCol = function (column) {
        var renderedCell = this.renderedCells[column.getColId()];
        if (renderedCell) {
            return renderedCell.getGui();
        }
        else {
            return null;
        }
    };
    RowComp.prototype.destroy = function (animate) {
        var _this = this;
        if (animate === void 0) { animate = false; }
        _super.prototype.destroy.call(this);
        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?
        this.destroyScope();
        this.destroyFullWidthComponent();
        if (animate) {
            this.startRemoveAnimationFunctions.forEach(function (func) { return func(); });
            this.delayedDestroyFunctions.push(function () {
                _this.forEachCellComp(function (renderedCell) { return renderedCell.destroy(); });
            });
        }
        else {
            this.forEachCellComp(function (renderedCell) { return renderedCell.destroy(); });
            // we are not animating, so execute the second stage of removal now.
            // we call getAndClear, so that they are only called once
            var delayedDestroyFunctions = this.getAndClearDelayedDestroyFunctions();
            delayedDestroyFunctions.forEach(function (func) { return func(); });
        }
        if (this.renderedRowEventService) {
            this.renderedRowEventService.dispatchEvent(RowComp.EVENT_ROW_REMOVED, { node: this.rowNode });
        }
        var event = { node: this.rowNode, rowIndex: this.rowNode.rowIndex };
        this.mainEventService.dispatchEvent(events_1.Events.EVENT_VIRTUAL_ROW_REMOVED, event);
    };
    RowComp.prototype.destroyScope = function () {
        if (this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }
    };
    RowComp.prototype.isGroup = function () {
        return this.rowNode.group === true;
    };
    RowComp.prototype.refreshFullWidthComponent = function () {
        this.destroyFullWidthComponent();
        this.createFullWidthComponent();
    };
    RowComp.prototype.createFullWidthComponent = function () {
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
    RowComp.prototype.destroyFullWidthComponent = function () {
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
    RowComp.prototype.createFullWidthParams = function (eRow, pinned) {
        var params = {
            data: this.rowNode.data,
            node: this.rowNode,
            value: this.rowNode.key,
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
    RowComp.prototype.createChildScopeOrNull = function (data) {
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
    RowComp.prototype.addStyleFromRowStyle = function () {
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
    RowComp.prototype.addStyleFromRowStyleFunc = function () {
        var rowStyleFunc = this.gridOptionsWrapper.getRowStyleFunc();
        if (rowStyleFunc) {
            var params = {
                data: this.rowNode.data,
                node: this.rowNode,
                api: this.gridOptionsWrapper.getApi(),
                context: this.gridOptionsWrapper.getContext(),
                $scope: this.scope
            };
            var cssToUseFromFunc_1 = rowStyleFunc(params);
            this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addStylesToElement(row, cssToUseFromFunc_1); });
        }
    };
    RowComp.prototype.createParams = function () {
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
    RowComp.prototype.createEvent = function (event, eventSource) {
        var agEvent = this.createParams();
        agEvent.event = event;
        agEvent.eventSource = eventSource;
        return agEvent;
    };
    RowComp.prototype.createRowContainer = function (rowContainerComp, slideRowIn, eElementBefore, ensureDomOrder) {
        var _this = this;
        var eRow = document.createElement('div');
        eRow.setAttribute('role', 'row');
        this.addDomData(eRow);
        rowContainerComp.appendRowElement(eRow, eElementBefore, ensureDomOrder);
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
        });
        if (this.animateIn) {
            this.animateRowIn(eRow, slideRowIn);
        }
        return eRow;
    };
    // puts animation into the row by setting start state and then final state in another VM turn
    // (another VM turn so the rendering engine will kick off once with start state, and then transition
    // into the end state)
    RowComp.prototype.animateRowIn = function (eRow, slideRowIn) {
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
    RowComp.prototype.roundRowTopToBounds = function (rowTop) {
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
    RowComp.prototype.onRowDblClick = function (event) {
        var agEvent = this.createEvent(event, this);
        this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
    };
    RowComp.prototype.onRowClick = function (event) {
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
        // we also don't allow selection of pinned rows
        if (this.rowNode.rowPinned) {
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
    RowComp.prototype.getRowNode = function () {
        return this.rowNode;
    };
    RowComp.prototype.addClassesFromRowClassFunc = function () {
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
    RowComp.prototype.addGridClasses = function () {
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
        if (this.rowNode.stub) {
            classes.push('ag-row-stub');
        }
        if (this.fullWidthRow) {
            classes.push('ag-full-width-row');
        }
        classes.forEach(function (classStr) {
            _this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addCssClass(row, classStr); });
        });
    };
    RowComp.prototype.addExpandedAndContractedClasses = function () {
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
    RowComp.prototype.addClassesFromRowClass = function () {
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
    RowComp.EVENT_ROW_REMOVED = 'rowRemoved';
    RowComp.DOM_DATA_KEY_RENDERED_ROW = 'renderedRow';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], RowComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], RowComp.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('columnAnimationService'),
        __metadata("design:type", columnAnimationService_1.ColumnAnimationService)
    ], RowComp.prototype, "columnAnimationService", void 0);
    __decorate([
        context_1.Autowired('$compile'),
        __metadata("design:type", Object)
    ], RowComp.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('eventService'),
        __metadata("design:type", eventService_1.EventService)
    ], RowComp.prototype, "mainEventService", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], RowComp.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'),
        __metadata("design:type", focusedCellController_1.FocusedCellController)
    ], RowComp.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Autowired('cellRendererService'),
        __metadata("design:type", cellRendererService_1.CellRendererService)
    ], RowComp.prototype, "cellRendererService", void 0);
    __decorate([
        context_1.Autowired('gridPanel'),
        __metadata("design:type", gridPanel_1.GridPanel)
    ], RowComp.prototype, "gridPanel", void 0);
    __decorate([
        context_1.Autowired('paginationProxy'),
        __metadata("design:type", paginationProxy_1.PaginationProxy)
    ], RowComp.prototype, "paginationProxy", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], RowComp.prototype, "init", null);
    return RowComp;
}(beanStub_1.BeanStub));
exports.RowComp = RowComp;
