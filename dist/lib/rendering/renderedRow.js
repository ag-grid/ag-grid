/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
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
var utils_1 = require('../utils');
var renderedCell_1 = require("./renderedCell");
var rowNode_1 = require("../entities/rowNode");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var columnController_1 = require("../columnController/columnController");
var column_1 = require("../entities/column");
var events_1 = require("../events");
var eventService_1 = require("../eventService");
var context_1 = require("../context/context");
var context_2 = require("../context/context");
var context_3 = require("../context/context");
var focusedCellController_1 = require("../focusedCellController");
var constants_1 = require("../constants");
var RenderedRow = (function () {
    function RenderedRow(parentScope, cellRendererMap, rowRenderer, eBodyContainer, ePinnedLeftContainer, ePinnedRightContainer, node, rowIndex) {
        this.renderedCells = {};
        this.destroyFunctions = [];
        this.parentScope = parentScope;
        this.cellRendererMap = cellRendererMap;
        this.rowRenderer = rowRenderer;
        this.eBodyContainer = eBodyContainer;
        this.ePinnedLeftContainer = ePinnedLeftContainer;
        this.ePinnedRightContainer = ePinnedRightContainer;
        this.rowIndex = rowIndex;
        this.rowNode = node;
    }
    RenderedRow.prototype.init = function () {
        var _this = this;
        this.pinningLeft = this.columnController.isPinningLeft();
        this.pinningRight = this.columnController.isPinningRight();
        this.createContainers();
        var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
        this.rowIsHeaderThatSpans = this.rowNode.group && groupHeaderTakesEntireRow;
        this.scope = this.createChildScopeOrNull(this.rowNode.data);
        if (this.rowIsHeaderThatSpans) {
            this.createGroupRow();
        }
        else {
            this.refreshCellsIntoRow();
        }
        this.addDynamicStyles();
        this.addDynamicClasses();
        this.addRowIds();
        this.setTopAndHeightCss();
        this.addRowSelectedListener();
        this.addCellFocusedListener();
        this.addColumnListener();
        this.attachContainers();
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
        if (this.scope) {
            this.eLeftCenterAndRightRows.forEach(function (row) { return _this.$compile(row)(_this.scope); });
        }
    };
    RenderedRow.prototype.addColumnListener = function () {
        var _this = this;
        var columnListener = this.onColumnChanged.bind(this);
        this.mainEventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, columnListener);
        //this.mainEventService.addEventListener(Events.EVENT_COLUMN_MOVED, columnListener);
        //this.mainEventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, columnListener);
        //this.mainEventService.addEventListener(Events.EVENT_COLUMN_RESIZED, columnListener);
        //this.mainEventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, columnListener);
        this.mainEventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, columnListener);
        this.mainEventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, columnListener);
        this.destroyFunctions.push(function () {
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, columnListener);
            //this.mainEventService.removeEventListener(Events.EVENT_COLUMN_MOVED, columnListener);
            //this.mainEventService.removeEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, columnListener);
            //this.mainEventService.removeEventListener(Events.EVENT_COLUMN_RESIZED, columnListener);
            //this.mainEventService.removeEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, columnListener);
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, columnListener);
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_COLUMN_PINNED, columnListener);
        });
    };
    RenderedRow.prototype.onColumnChanged = function (event) {
        // if row is a group row that spans, then it's not impacted by column changes
        if (this.rowIsHeaderThatSpans) {
            return;
        }
        this.refreshCellsIntoRow();
    };
    RenderedRow.prototype.refreshCellsIntoRow = function () {
        var _this = this;
        var columns = this.columnController.getAllDisplayedColumns();
        var renderedCellKeys = Object.keys(this.renderedCells);
        columns.forEach(function (column) {
            var renderedCell = _this.getOrCreateCell(column);
            _this.ensureCellInCorrectRow(renderedCell);
            renderedCell.checkPinnedClasses();
            utils_1.Utils.removeFromArray(renderedCellKeys, column.getColId());
        });
        // remove old cells from gui, but we don't destroy them, we might use them again
        renderedCellKeys.forEach(function (key) {
            var renderedCell = _this.renderedCells[key];
            // could be old reference, ie removed cell
            if (!renderedCell) {
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
            var renderedCell = new renderedCell_1.RenderedCell(column, this.cellRendererMap, this.rowNode, this.rowIndex, this.scope, this);
            this.context.wireBean(renderedCell);
            this.renderedCells[colId] = renderedCell;
            return renderedCell;
        }
    };
    RenderedRow.prototype.addRowSelectedListener = function () {
        var _this = this;
        var rowSelectedListener = function () {
            var selected = _this.rowNode.isSelected();
            _this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-selected', selected); });
        };
        this.rowNode.addEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
        this.destroyFunctions.push(function () {
            _this.rowNode.removeEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
        });
    };
    RenderedRow.prototype.addCellFocusedListener = function () {
        var _this = this;
        var rowFocusedLastTime = null;
        var rowFocusedListener = function () {
            var rowFocused = _this.focusedCellController.isRowFocused(_this.rowIndex, _this.rowNode.floating);
            if (rowFocused !== rowFocusedLastTime) {
                _this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused); });
                _this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused); });
                rowFocusedLastTime = rowFocused;
            }
        };
        this.mainEventService.addEventListener(events_1.Events.EVENT_CELL_FOCUSED, rowFocusedListener);
        this.destroyFunctions.push(function () {
            _this.mainEventService.removeEventListener(events_1.Events.EVENT_CELL_FOCUSED, rowFocusedListener);
        });
        rowFocusedListener();
    };
    RenderedRow.prototype.createContainers = function () {
        this.eBodyRow = this.createRowContainer();
        this.eLeftCenterAndRightRows = [this.eBodyRow];
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.ePinnedLeftRow = this.createRowContainer();
            this.ePinnedRightRow = this.createRowContainer();
            this.eLeftCenterAndRightRows.push(this.ePinnedLeftRow);
            this.eLeftCenterAndRightRows.push(this.ePinnedRightRow);
        }
    };
    RenderedRow.prototype.attachContainers = function () {
        this.eBodyContainer.appendChild(this.eBodyRow);
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.ePinnedLeftContainer.appendChild(this.ePinnedLeftRow);
            this.ePinnedRightContainer.appendChild(this.ePinnedRightRow);
        }
    };
    RenderedRow.prototype.onMouseEvent = function (eventName, mouseEvent, eventSource, cell) {
        var renderedCell = this.renderedCells[cell.column.getId()];
        if (renderedCell) {
            renderedCell.onMouseEvent(eventName, mouseEvent, eventSource);
        }
    };
    RenderedRow.prototype.setTopAndHeightCss = function () {
        // if showing scrolls, position on the container
        if (!this.gridOptionsWrapper.isForPrint()) {
            var topPx = this.rowNode.rowTop + "px";
            this.eLeftCenterAndRightRows.forEach(function (row) { return row.style.top = topPx; });
        }
        var heightPx = this.rowNode.rowHeight + 'px';
        this.eLeftCenterAndRightRows.forEach(function (row) { return row.style.height = heightPx; });
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
        this.eLeftCenterAndRightRows.forEach(function (row) { return row.setAttribute('row', rowStr); });
        if (typeof this.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
            var businessKey = this.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.rowNode);
            if (typeof businessKey === 'string' || typeof businessKey === 'number') {
                this.eLeftCenterAndRightRows.forEach(function (row) { return row.setAttribute('row-id', businessKey); });
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
    RenderedRow.prototype.softRefresh = function () {
        utils_1.Utils.iterateObject(this.renderedCells, function (key, renderedCell) {
            if (renderedCell && renderedCell.isVolatile()) {
                renderedCell.refreshCell();
            }
        });
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
        this.destroyFunctions.forEach(function (func) { return func(); });
        this.destroyScope();
        this.eBodyContainer.removeChild(this.eBodyRow);
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.ePinnedLeftContainer.removeChild(this.ePinnedLeftRow);
            this.ePinnedRightContainer.removeChild(this.ePinnedRightRow);
        }
        utils_1.Utils.iterateObject(this.renderedCells, function (key, renderedCell) {
            if (renderedCell) {
                renderedCell.destroy();
            }
        });
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
    RenderedRow.prototype.createGroupRow = function () {
        var eGroupRow = this.createGroupSpanningEntireRowCell(false);
        if (this.pinningLeft) {
            this.ePinnedLeftRow.appendChild(eGroupRow);
            var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
            this.eBodyRow.appendChild(eGroupRowPadding);
        }
        else {
            this.eBodyRow.appendChild(eGroupRow);
        }
        if (this.pinningRight) {
            var ePinnedRightPadding = this.createGroupSpanningEntireRowCell(true);
            this.ePinnedRightRow.appendChild(ePinnedRightPadding);
        }
    };
    RenderedRow.prototype.createGroupSpanningEntireRowCell = function (padding) {
        var eRow;
        // padding means we are on the right hand side of a pinned table, ie
        // in the main body.
        if (padding) {
            eRow = document.createElement('span');
        }
        else {
            var rowCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
            if (!rowCellRenderer) {
                rowCellRenderer = {
                    renderer: 'group',
                    innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
                };
            }
            var params = {
                node: this.rowNode,
                data: this.rowNode.data,
                rowIndex: this.rowIndex,
                api: this.gridOptionsWrapper.getApi(),
                colDef: {
                    cellRenderer: rowCellRenderer
                }
            };
            // start duplicated code
            var actualCellRenderer;
            if (typeof rowCellRenderer === 'object' && rowCellRenderer !== null) {
                var cellRendererObj = rowCellRenderer;
                actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
                if (!actualCellRenderer) {
                    throw 'Cell renderer ' + rowCellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
                }
            }
            else if (typeof rowCellRenderer === 'function') {
                actualCellRenderer = rowCellRenderer;
            }
            else {
                throw 'Cell Renderer must be String or Function';
            }
            var resultFromRenderer = actualCellRenderer(params);
            // end duplicated code
            if (utils_1.Utils.isNodeOrElement(resultFromRenderer)) {
                // a dom node or element was returned, so add child
                eRow = resultFromRenderer;
            }
            else {
                // otherwise assume it was html, so just insert
                eRow = utils_1.Utils.loadTemplate(resultFromRenderer);
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
            return newChildScope;
        }
        else {
            return null;
        }
    };
    RenderedRow.prototype.addDynamicStyles = function () {
        var rowStyle = this.gridOptionsWrapper.getRowStyle();
        if (rowStyle) {
            if (typeof rowStyle === 'function') {
                console.log('ag-Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            }
            else {
                this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addStylesToElement(row, rowStyle); });
            }
        }
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
            this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addStylesToElement(row, cssToUseFromFunc); });
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
    RenderedRow.prototype.createRowContainer = function () {
        var _this = this;
        var vRow = document.createElement('div');
        vRow.addEventListener("click", this.onRowClicked.bind(this));
        vRow.addEventListener("dblclick", function (event) {
            var agEvent = _this.createEvent(event, _this);
            _this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
        });
        return vRow;
    };
    RenderedRow.prototype.onRowClicked = function (event) {
        var agEvent = this.createEvent(event, this);
        this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_CLICKED, agEvent);
        // ctrlKey for windows, metaKey for Apple
        var multiSelectKeyPressed = event.ctrlKey || event.metaKey;
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
                    this.rowNode.setSelected(false);
                }
            }
            else {
                // selected with no multi key, must make sure anything else is unselected
                this.rowNode.setSelected(true, true);
            }
        }
        else {
            this.rowNode.setSelected(true, !multiSelectKeyPressed);
        }
    };
    RenderedRow.prototype.getRowNode = function () {
        return this.rowNode;
    };
    RenderedRow.prototype.getRowIndex = function () {
        return this.rowIndex;
    };
    RenderedRow.prototype.refreshCells = function (colIds) {
        if (!colIds) {
            return;
        }
        var columnsToRefresh = this.columnController.getColumns(colIds);
        utils_1.Utils.iterateObject(this.renderedCells, function (key, renderedCell) {
            if (!renderedCell) {
                return;
            }
            var colForCel = renderedCell.getColumn();
            if (columnsToRefresh.indexOf(colForCel) >= 0) {
                renderedCell.refreshCell();
            }
        });
    };
    RenderedRow.prototype.addDynamicClasses = function () {
        var _this = this;
        var classes = [];
        classes.push('ag-row');
        classes.push('ag-row-no-focus');
        classes.push(this.rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");
        if (this.rowNode.isSelected()) {
            classes.push("ag-row-selected");
        }
        if (this.rowNode.group) {
            classes.push("ag-row-group");
            // if a group, put the level of the group in
            classes.push("ag-row-level-" + this.rowNode.level);
            if (!this.rowNode.footer && this.rowNode.expanded) {
                classes.push("ag-row-group-expanded");
            }
            if (!this.rowNode.footer && !this.rowNode.expanded) {
                // opposite of expanded is contracted according to the internet.
                classes.push("ag-row-group-contracted");
            }
            if (this.rowNode.footer) {
                classes.push("ag-row-footer");
            }
        }
        else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            if (this.rowNode.parent) {
                classes.push("ag-row-level-" + (this.rowNode.parent.level + 1));
            }
            else {
                classes.push("ag-row-level-0");
            }
        }
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
            _this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addCssClass(row, classStr); });
        });
    };
    RenderedRow.EVENT_RENDERED_ROW_REMOVED = 'renderedRowRemoved';
    __decorate([
        context_2.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], RenderedRow.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_2.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], RenderedRow.prototype, "columnController", void 0);
    __decorate([
        context_2.Autowired('$compile'), 
        __metadata('design:type', Object)
    ], RenderedRow.prototype, "$compile", void 0);
    __decorate([
        context_2.Autowired('eventService'), 
        __metadata('design:type', eventService_1.EventService)
    ], RenderedRow.prototype, "mainEventService", void 0);
    __decorate([
        context_2.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], RenderedRow.prototype, "context", void 0);
    __decorate([
        context_2.Autowired('focusedCellController'), 
        __metadata('design:type', focusedCellController_1.FocusedCellController)
    ], RenderedRow.prototype, "focusedCellController", void 0);
    __decorate([
        context_3.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedRow.prototype, "init", null);
    return RenderedRow;
})();
exports.RenderedRow = RenderedRow;
