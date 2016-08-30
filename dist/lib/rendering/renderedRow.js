/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
var RenderedRow = (function () {
    function RenderedRow(parentScope, rowRenderer, eBodyContainer, eFullWidthContainer, ePinnedLeftContainer, ePinnedRightContainer, node, rowIndex) {
        this.eAllRowContainers = [];
        this.renderedCells = {};
        this.destroyFunctions = [];
        this.initialised = false;
        this.parentScope = parentScope;
        this.rowRenderer = rowRenderer;
        this.eBodyContainer = eBodyContainer;
        this.eFullWidthContainer = eFullWidthContainer;
        this.ePinnedLeftContainer = ePinnedLeftContainer;
        this.ePinnedRightContainer = ePinnedRightContainer;
        this.rowIndex = rowIndex;
        this.rowNode = node;
    }
    RenderedRow.prototype.setupRowContainers = function () {
        var isFullWidthCellFunc = this.gridOptionsWrapper.getIsFullWidthCellFunc();
        var isFullWidthCell = isFullWidthCellFunc ? isFullWidthCellFunc(this.rowNode) : false;
        var isGroupSpanningRow = this.rowNode.group && this.gridOptionsWrapper.isGroupUseEntireRow();
        if (isFullWidthCell) {
            this.setupFullWidthContainers();
        }
        else if (isGroupSpanningRow) {
            this.setupFullWidthGroupContainers();
        }
        else {
            this.setupNormalContainers();
        }
    };
    RenderedRow.prototype.setupFullWidthContainers = function () {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getFullWidthCellRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getFullWidthCellRendererParams();
        if (utils_1.Utils.missing(this.fullWidthCellRenderer)) {
            console.warn("ag-Grid: you need to provide a fullWidthCellRenderer if using isFullWidthCell()");
        }
        this.eFullWidthRow = this.createRowContainer(this.eFullWidthContainer);
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.addMouseWheelListenerToFullWidthRow();
        }
    };
    RenderedRow.prototype.addMouseWheelListenerToFullWidthRow = function () {
        var _this = this;
        var mouseWheelListener = this.gridPanel.genericMouseWheelListener.bind(this.gridPanel);
        // IE9, Chrome, Safari, Opera
        this.eFullWidthRow.addEventListener('mousewheel', mouseWheelListener);
        // Firefox
        this.eFullWidthRow.addEventListener('DOMMouseScroll', mouseWheelListener);
        this.destroyFunctions.push(function () {
            _this.eFullWidthRow.removeEventListener('mousewheel', mouseWheelListener);
            _this.eFullWidthRow.removeEventListener('DOMMouseScroll', mouseWheelListener);
        });
    };
    RenderedRow.prototype.setupFullWidthGroupContainers = function () {
        this.fullWidthRow = true;
        this.fullWidthCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
        this.fullWidthCellRendererParams = this.gridOptionsWrapper.getGroupRowRendererParams();
        if (!this.fullWidthCellRenderer) {
            this.fullWidthCellRenderer = cellRendererFactory_1.CellRendererFactory.GROUP;
            this.fullWidthCellRendererParams = {
                innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer(),
            };
        }
        this.eFullWidthRow = this.createRowContainer(this.eFullWidthContainer);
    };
    RenderedRow.prototype.setupNormalContainers = function () {
        this.fullWidthRow = false;
        this.eBodyRow = this.createRowContainer(this.eBodyContainer);
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.ePinnedLeftRow = this.createRowContainer(this.ePinnedLeftContainer);
            this.ePinnedRightRow = this.createRowContainer(this.ePinnedRightContainer);
        }
    };
    RenderedRow.prototype.init = function () {
        this.setupRowContainers();
        this.scope = this.createChildScopeOrNull(this.rowNode.data);
        if (this.fullWidthRow) {
            this.refreshFullWidthComponent();
        }
        else {
            this.refreshCellsIntoRow();
        }
        this.addGridClasses();
        this.addStyleFromRowStyle();
        this.addStyleFromRowStyleFunc();
        this.addClassesFromRowClass();
        this.addClassesFromRowClassFunc();
        this.addRowIds();
        this.setTopAndHeightCss();
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
            rowIndex: this.rowIndex,
            addRenderedRowListener: this.addEventListener.bind(this),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        });
        this.addDataChangedListener();
        this.initialised = true;
    };
    // because data can change, especially in virtual pagination and viewport row models, need to allow setting
    // styles and classes after the data has changed
    RenderedRow.prototype.addDataChangedListener = function () {
        var _this = this;
        var dataChangedListener = function () {
            _this.addStyleFromRowStyleFunc();
            _this.addClassesFromRowClass();
        };
        this.rowNode.addEventListener(rowNode_1.RowNode.EVENT_DATA_CHANGED, dataChangedListener);
        this.destroyFunctions.push(function () { return _this.rowNode.removeEventListener(rowNode_1.RowNode.EVENT_DATA_CHANGED, dataChangedListener); });
    };
    RenderedRow.prototype.angular1Compile = function (element) {
        if (this.scope) {
            this.$compile(element)(this.scope);
        }
    };
    RenderedRow.prototype.addColumnListener = function () {
        var _this = this;
        var columnListener = this.onDisplayedColumnsChanged.bind(this);
        var virtualListener = this.onVirtualColumnsChanged.bind(this);
        var gridColumnsChangedListener = this.onGridColumnsChanged.bind(this);
        this.mainEventService.addEventListener(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
        this.mainEventService.addEventListener(events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, virtualListener);
        this.mainEventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, columnListener);
        this.mainEventService.addEventListener(events_1.Events.EVENT_GRID_COLUMNS_CHANGED, gridColumnsChangedListener);
        this.destroyFunctions.push(function () {
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_DISPLAYED_COLUMNS_CHANGED, columnListener);
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_VIRTUAL_COLUMNS_CHANGED, virtualListener);
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_COLUMN_RESIZED, columnListener);
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_GRID_COLUMNS_CHANGED, gridColumnsChangedListener);
        });
    };
    RenderedRow.prototype.onDisplayedColumnsChanged = function (event) {
        // if row is a group row that spans, then it's not impacted by column changes, with exception of pinning
        if (this.fullWidthRow) {
            var columnPinned = event.getType() === events_1.Events.EVENT_COLUMN_PINNED;
            if (columnPinned) {
                this.refreshFullWidthComponent();
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
    // method makes sure the right cells are present, and are in the right container. so when this gets called for
    // the first time, it sets up all the cells. but then over time the cells might appear / dissappear or move
    // container (ie into pinned)
    RenderedRow.prototype.refreshCellsIntoRow = function () {
        var _this = this;
        var columns = this.columnController.getAllDisplayedVirtualColumns();
        var renderedCellKeys = Object.keys(this.renderedCells);
        columns.forEach(function (column) {
            var renderedCell = _this.getOrCreateCell(column);
            _this.ensureCellInCorrectRow(renderedCell);
            utils_1.Utils.removeFromArray(renderedCellKeys, column.getColId());
        });
        // remove old cells from gui, but we don't destroy them, we might use them again
        this.removeRenderedCells(renderedCellKeys);
    };
    RenderedRow.prototype.removeRenderedCells = function (colIds) {
        var _this = this;
        colIds.forEach(function (key) {
            var renderedCell = _this.renderedCells[key];
            // could be old reference, ie removed cell
            if (utils_1.Utils.missing(renderedCell)) {
                return;
            }
            if (renderedCell.getParentRow()) {
                renderedCell.getParentRow().removeChild(renderedCell.getGui());
                renderedCell.setParentRow(null);
            }
            renderedCell.destroy();
            _this.renderedCells[key] = null;
        });
    };
    RenderedRow.prototype.ensureCellInCorrectRow = function (renderedCell) {
        var eRowGui = renderedCell.getGui();
        var column = renderedCell.getColumn();
        var rowWeWant;
        switch (column.getPinned()) {
            case column_1.Column.PINNED_LEFT:
                rowWeWant = this.ePinnedLeftRow;
                break;
            case column_1.Column.PINNED_RIGHT:
                rowWeWant = this.ePinnedRightRow;
                break;
            default:
                rowWeWant = this.eBodyRow;
                break;
        }
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
            var renderedCell = new renderedCell_1.RenderedCell(column, this.rowNode, this.rowIndex, this.scope, this);
            this.context.wireBean(renderedCell);
            this.renderedCells[colId] = renderedCell;
            this.angular1Compile(renderedCell.getGui());
            return renderedCell;
        }
    };
    RenderedRow.prototype.onRowSelected = function () {
        var selected = this.rowNode.isSelected();
        this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-selected', selected); });
    };
    RenderedRow.prototype.addRowSelectedListener = function () {
        var _this = this;
        var rowSelectedListener = this.onRowSelected.bind(this);
        this.rowNode.addEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
        this.destroyFunctions.push(function () {
            _this.rowNode.removeEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
        });
    };
    RenderedRow.prototype.addHoverFunctionality = function () {
        var _this = this;
        var onGuiMouseEnter = this.rowNode.onMouseEnter.bind(this.rowNode);
        var onGuiMouseLeave = this.rowNode.onMouseLeave.bind(this.rowNode);
        this.eAllRowContainers.forEach(function (eRow) {
            eRow.addEventListener('mouseenter', onGuiMouseEnter);
            eRow.addEventListener('mouseleave', onGuiMouseLeave);
        });
        var onNodeMouseEnter = this.addHoverClass.bind(this, true);
        var onNodeMouseLeave = this.addHoverClass.bind(this, false);
        this.rowNode.addEventListener(rowNode_1.RowNode.EVENT_MOUSE_ENTER, onNodeMouseEnter);
        this.rowNode.addEventListener(rowNode_1.RowNode.EVENT_MOUSE_LEAVE, onNodeMouseLeave);
        this.destroyFunctions.push(function () {
            _this.eAllRowContainers.forEach(function (eRow) {
                eRow.removeEventListener('mouseenter', onGuiMouseEnter);
                eRow.removeEventListener('mouseleave', onGuiMouseLeave);
            });
            _this.rowNode.removeEventListener(rowNode_1.RowNode.EVENT_MOUSE_ENTER, onNodeMouseEnter);
            _this.rowNode.removeEventListener(rowNode_1.RowNode.EVENT_MOUSE_LEAVE, onNodeMouseLeave);
        });
    };
    RenderedRow.prototype.addHoverClass = function (hover) {
        this.eAllRowContainers.forEach(function (eRow) { return utils_1.Utils.addOrRemoveCssClass(eRow, 'ag-row-hover', hover); });
    };
    RenderedRow.prototype.addCellFocusedListener = function () {
        var _this = this;
        var rowFocusedLastTime = null;
        var rowFocusedListener = function () {
            var rowFocused = _this.focusedCellController.isRowFocused(_this.rowIndex, _this.rowNode.floating);
            if (rowFocused !== rowFocusedLastTime) {
                _this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused); });
                _this.eAllRowContainers.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused); });
                rowFocusedLastTime = rowFocused;
            }
        };
        this.mainEventService.addEventListener(events_1.Events.EVENT_CELL_FOCUSED, rowFocusedListener);
        this.destroyFunctions.push(function () {
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_CELL_FOCUSED, rowFocusedListener);
        });
        rowFocusedListener();
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
        this.rowNode.addEventListener(rowNode_1.RowNode.EVENT_DATA_CHANGED, nodeDataChangedListener);
        this.destroyFunctions.push(function () {
            _this.rowNode.removeEventListener(rowNode_1.RowNode.EVENT_DATA_CHANGED, nodeDataChangedListener);
        });
    };
    RenderedRow.prototype.onMouseEvent = function (eventName, mouseEvent, cell) {
        var renderedCell = this.renderedCells[cell.column.getId()];
        if (renderedCell) {
            renderedCell.onMouseEvent(eventName, mouseEvent);
        }
    };
    RenderedRow.prototype.setTopAndHeightCss = function () {
        // if showing scrolls, position on the container
        if (!this.gridOptionsWrapper.isForPrint()) {
            var topPx = this.rowNode.rowTop + "px";
            this.eAllRowContainers.forEach(function (row) { return row.style.top = topPx; });
        }
        var heightPx = this.rowNode.rowHeight + 'px';
        this.eAllRowContainers.forEach(function (row) { return row.style.height = heightPx; });
    };
    // adds in row and row-id attributes to the row
    RenderedRow.prototype.addRowIds = function () {
        var rowStr = this.rowIndex.toString();
        if (this.rowNode.floating === constants_1.Constants.FLOATING_BOTTOM) {
            rowStr = 'fb-' + rowStr;
        }
        else if (this.rowNode.floating === constants_1.Constants.FLOATING_TOP) {
            rowStr = 'ft-' + rowStr;
        }
        this.eAllRowContainers.forEach(function (row) { return row.setAttribute('row', rowStr); });
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
    RenderedRow.prototype.destroy = function () {
        this.destroyScope();
        this.destroyFullWidthComponent();
        this.forEachRenderedCell(function (renderedCell) { return renderedCell.destroy(); });
        this.destroyFunctions.forEach(function (func) { return func(); });
        if (this.renderedRowEventService) {
            this.renderedRowEventService.dispatchEvent(RenderedRow.EVENT_RENDERED_ROW_REMOVED, { node: this.rowNode });
        }
    };
    RenderedRow.prototype.destroyScope = function () {
        if (this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }
    };
    RenderedRow.prototype.isDataInList = function (rows) {
        return rows.indexOf(this.rowNode.data) >= 0;
    };
    RenderedRow.prototype.isGroup = function () {
        return this.rowNode.group === true;
    };
    RenderedRow.prototype.refreshFullWidthComponent = function () {
        this.destroyFullWidthComponent();
        this.createFullWidthComponent();
    };
    RenderedRow.prototype.createFullWidthComponent = function () {
        var params = this.createFullWidthParams(this.eFullWidthRow);
        this.fullWidthRowComponent = this.cellRendererService.useCellRenderer(this.fullWidthCellRenderer, this.eFullWidthRow, params);
        this.angular1Compile(this.eFullWidthRow);
    };
    RenderedRow.prototype.destroyFullWidthComponent = function () {
        if (this.fullWidthRowComponent && this.fullWidthRowComponent.destroy) {
            this.fullWidthRowComponent.destroy();
            this.fullWidthRowComponent = null;
        }
        utils_1.Utils.removeAllChildren(this.eFullWidthRow);
    };
    RenderedRow.prototype.createFullWidthParams = function (eRow) {
        var params = {
            data: this.rowNode.data,
            node: this.rowNode,
            $scope: this.scope,
            rowIndex: this.rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            eGridCell: eRow,
            eParentOfValue: eRow,
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
    RenderedRow.prototype.createGroupSpanningEntireRowCell = function (padding) {
        var eRow = document.createElement('span');
        // padding means we are on the right hand side of a pinned table, ie
        // in the main body.
        if (!padding) {
            var params = this.createFullWidthParams(eRow);
            var cellComponent = this.cellRendererService.useCellRenderer(this.fullWidthCellRenderer, eRow, params);
            if (cellComponent && cellComponent.destroy) {
                this.destroyFunctions.push(function () { return cellComponent.destroy(); });
            }
        }
        if (this.rowNode.footer) {
            utils_1.Utils.addCssClass(eRow, 'ag-footer-cell-entire-row');
        }
        else {
            utils_1.Utils.addCssClass(eRow, 'ag-group-cell-entire-row');
        }
        return eRow;
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
            rowIndex: this.rowIndex,
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
    RenderedRow.prototype.createRowContainer = function (eParent) {
        var eRow = document.createElement('div');
        var rowClickListener = this.onRowClick.bind(this);
        var rowDblClickListener = this.onRowDblClick.bind(this);
        eRow.addEventListener("click", rowClickListener);
        eRow.addEventListener("dblclick", rowDblClickListener);
        eParent.appendChild(eRow);
        this.eAllRowContainers.push(eRow);
        this.destroyFunctions.push(function () {
            eRow.removeEventListener("click", rowClickListener);
            eRow.removeEventListener("dblclick", rowDblClickListener);
            eParent.removeChild(eRow);
        });
        return eRow;
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
        // making local variables to make the below more readable
        var gridOptionsWrapper = this.gridOptionsWrapper;
        // if no selection method enabled, do nothing
        if (!gridOptionsWrapper.isRowSelection()) {
            return;
        }
        // if click selection suppressed, do nothing
        if (gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }
        if (this.rowNode.isSelected()) {
            if (multiSelectKeyPressed) {
                if (gridOptionsWrapper.isRowDeselection()) {
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
    RenderedRow.prototype.refreshCells = function (colIds, animate) {
        if (!colIds) {
            return;
        }
        var columnsToRefresh = this.columnController.getGridColumns(colIds);
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
                rowIndex: this.rowIndex,
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
        classes.push(this.rowIndex % 2 == 0 ? 'ag-row-even' : 'ag-row-odd');
        if (this.rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }
        if (this.rowNode.group) {
            classes.push('ag-row-group');
            // if a group, put the level of the group in
            classes.push('ag-row-level-' + this.rowNode.level);
            if (!this.rowNode.footer && this.rowNode.expanded) {
                classes.push('ag-row-group-expanded');
            }
            if (!this.rowNode.footer && !this.rowNode.expanded) {
                // opposite of expanded is contracted according to the internet.
                classes.push('ag-row-group-contracted');
            }
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
    RenderedRow.EVENT_RENDERED_ROW_REMOVED = 'renderedRowRemoved';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], RenderedRow.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], RenderedRow.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('$compile'), 
        __metadata('design:type', Object)
    ], RenderedRow.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], RenderedRow.prototype, "mainEventService", void 0);
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], RenderedRow.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('focusedCellController'), 
        __metadata('design:type', focusedCellController_1.FocusedCellController)
    ], RenderedRow.prototype, "focusedCellController", void 0);
    __decorate([
        context_1.Autowired('cellRendererService'), 
        __metadata('design:type', cellRendererService_1.CellRendererService)
    ], RenderedRow.prototype, "cellRendererService", void 0);
    __decorate([
        context_1.Autowired('gridPanel'), 
        __metadata('design:type', gridPanel_1.GridPanel)
    ], RenderedRow.prototype, "gridPanel", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedRow.prototype, "init", null);
    return RenderedRow;
})();
exports.RenderedRow = RenderedRow;
