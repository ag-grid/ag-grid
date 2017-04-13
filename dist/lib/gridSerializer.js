/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
var context_1 = require("./context/context");
var columnController_1 = require("./columnController/columnController");
var constants_1 = require("./constants");
var floatingRowModel_1 = require("./rowModels/floatingRowModel");
var utils_1 = require("./utils");
var selectionController_1 = require("./selectionController");
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var displayedGroupCreator_1 = require("./columnController/displayedGroupCreator");
var balancedColumnTreeBuilder_1 = require("./columnController/balancedColumnTreeBuilder");
var groupInstanceIdCreator_1 = require("./columnController/groupInstanceIdCreator");
var columnGroup_1 = require("./entities/columnGroup");
var BaseGridSerializingSession = (function () {
    function BaseGridSerializingSession(columnController, valueService, gridOptionsWrapper, processCellCallback, processHeaderCallback, cellAndHeaderEscaper) {
        this.columnController = columnController;
        this.valueService = valueService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.processCellCallback = processCellCallback;
        this.processHeaderCallback = processHeaderCallback;
        this.cellAndHeaderEscaper = cellAndHeaderEscaper;
    }
    BaseGridSerializingSession.prototype.extractHeaderValue = function (column) {
        var nameForCol = this.getHeaderName(this.processHeaderCallback, column);
        if (nameForCol === null || nameForCol === undefined) {
            nameForCol = '';
        }
        return this.cellAndHeaderEscaper ? this.cellAndHeaderEscaper(nameForCol) : nameForCol;
    };
    BaseGridSerializingSession.prototype.extractRowCellValue = function (column, index, node) {
        var isRowGrouping = this.columnController.getRowGroupColumns().length > 0;
        var valueForCell;
        if (node.group && isRowGrouping && index === 0) {
            valueForCell = this.createValueForGroupNode(node);
        }
        else {
            valueForCell = this.valueService.getValue(column, node);
        }
        valueForCell = this.processCell(node, column, valueForCell, this.processCellCallback);
        if (valueForCell === null || valueForCell === undefined) {
            valueForCell = '';
        }
        return this.cellAndHeaderEscaper ? this.cellAndHeaderEscaper(valueForCell) : valueForCell;
    };
    BaseGridSerializingSession.prototype.getHeaderName = function (callback, column) {
        if (callback) {
            return callback({
                column: column,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        }
        else {
            return this.columnController.getDisplayNameForColumn(column, 'csv', true);
        }
    };
    BaseGridSerializingSession.prototype.createValueForGroupNode = function (node) {
        var keys = [node.key];
        while (node.parent) {
            node = node.parent;
            keys.push(node.key);
        }
        return keys.reverse().join(' -> ');
    };
    BaseGridSerializingSession.prototype.processCell = function (rowNode, column, value, processCellCallback) {
        if (processCellCallback) {
            return processCellCallback({
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext()
            });
        }
        else {
            return value;
        }
    };
    return BaseGridSerializingSession;
}());
exports.BaseGridSerializingSession = BaseGridSerializingSession;
var GridSerializer = (function () {
    function GridSerializer() {
    }
    GridSerializer.prototype.serialize = function (gridSerializingSession, userParams) {
        var baseParams = this.gridOptionsWrapper.getDefaultExportParams();
        var params = {};
        utils_1.Utils.assign(params, baseParams);
        utils_1.Utils.assign(params, userParams);
        var dontSkipRows = function () { return false; };
        var skipGroups = params && params.skipGroups;
        var skipHeader = params && params.skipHeader;
        var columnGroups = params && params.columnGroups;
        var skipFooters = params && params.skipFooters;
        var skipFloatingTop = params && params.skipFloatingTop;
        var skipFloatingBottom = params && params.skipFloatingBottom;
        var includeCustomHeader = params && params.customHeader;
        var includeCustomFooter = params && params.customFooter;
        var allColumns = params && params.allColumns;
        var onlySelected = params && params.onlySelected;
        var columnKeys = params && params.columnKeys;
        var onlySelectedAllPages = params && params.onlySelectedAllPages;
        var rowSkipper = (params && params.shouldRowBeSkipped) || dontSkipRows;
        var api = this.gridOptionsWrapper.getApi();
        var context = this.gridOptionsWrapper.getContext();
        // when in pivot mode, we always render cols on screen, never 'all columns'
        var isPivotMode = this.columnController.isPivotMode();
        var rowModelNormal = this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_NORMAL;
        var onlySelectedNonStandardModel = !rowModelNormal && onlySelected;
        // we can only export if it's a normal row model - unless we are exporting
        // selected only, as this way we don't use the selected nodes rather than
        // the row model to get the rows
        if (!rowModelNormal && !onlySelected) {
            console.log('ag-Grid: getDataAsCsv is only available for standard row model');
            return '';
        }
        var inMemoryRowModel = this.rowModel;
        var columnsToExport;
        if (utils_1.Utils.existsAndNotEmpty(columnKeys)) {
            columnsToExport = this.columnController.getGridColumns(columnKeys);
        }
        else if (allColumns && !isPivotMode) {
            columnsToExport = this.columnController.getAllPrimaryColumns();
        }
        else {
            columnsToExport = this.columnController.getAllDisplayedColumns();
        }
        if (!columnsToExport || columnsToExport.length === 0) {
            return '';
        }
        gridSerializingSession.prepare(columnsToExport);
        if (includeCustomHeader) {
            gridSerializingSession.addCustomHeader(params.customHeader);
        }
        // first pass, put in the header names of the cols
        if (!skipHeader || columnGroups) {
            var groupInstanceIdCreator = new groupInstanceIdCreator_1.GroupInstanceIdCreator();
            var displayedGroups = this.displayedGroupCreator.createDisplayedGroups(columnsToExport, this.columnController.getGridBalancedTree(), groupInstanceIdCreator);
            if (columnGroups && displayedGroups.length > 0 && displayedGroups[0] instanceof columnGroup_1.ColumnGroup) {
                var gridRowIterator_1 = gridSerializingSession.onNewHeaderGroupingRow();
                var columnIndex_1 = 0;
                displayedGroups.forEach(function (it) {
                    var casted = it;
                    gridRowIterator_1.onColumn(casted.getDefinition().headerName, columnIndex_1++, casted.getChildren().length - 1);
                });
            }
            if (!skipHeader) {
                var gridRowIterator_2 = gridSerializingSession.onNewHeaderRow();
                columnsToExport.forEach(function (column, index) {
                    gridRowIterator_2.onColumn(column, index, null);
                });
            }
        }
        this.floatingRowModel.forEachFloatingTopRow(processRow);
        if (isPivotMode) {
            inMemoryRowModel.forEachPivotNode(processRow);
        }
        else {
            // onlySelectedAllPages: user doing pagination and wants selected items from
            // other pages, so cannot use the standard row model as it won't have rows from
            // other pages.
            // onlySelectedNonStandardModel: if user wants selected in non standard row model
            // (eg viewport) then again rowmodel cannot be used, so need to use selected instead.
            if (onlySelectedAllPages || onlySelectedNonStandardModel) {
                var selectedNodes = this.selectionController.getSelectedNodes();
                selectedNodes.forEach(function (node) {
                    processRow(node);
                });
            }
            else {
                // here is everything else - including standard row model and selected. we don't use
                // the selection model even when just using selected, so that the result is the order
                // of the rows appearing on the screen.
                inMemoryRowModel.forEachNodeAfterFilterAndSort(processRow);
            }
        }
        this.floatingRowModel.forEachFloatingBottomRow(processRow);
        if (includeCustomFooter) {
            gridSerializingSession.addCustomFooter(params.customFooter);
        }
        function processRow(node) {
            if (skipGroups && node.group) {
                return;
            }
            if (skipFooters && node.footer) {
                return;
            }
            if (onlySelected && !node.isSelected()) {
                return;
            }
            if (skipFloatingTop && node.floating === 'top') {
                return;
            }
            if (skipFloatingBottom && node.floating === 'bottom') {
                return;
            }
            // if we are in pivotMode, then the grid will show the root node only
            // if it's not a leaf group
            var nodeIsRootNode = node.level === -1;
            if (nodeIsRootNode && !node.leafGroup) {
                return;
            }
            var shouldRowBeSkipped = rowSkipper({
                node: node,
                api: api,
                context: context
            });
            if (shouldRowBeSkipped)
                return;
            var rowAccumulator = gridSerializingSession.onNewBodyRow();
            columnsToExport.forEach(function (column, index) {
                rowAccumulator.onColumn(column, index, node);
            });
        }
        return gridSerializingSession.parse();
    };
    return GridSerializer;
}());
__decorate([
    context_1.Autowired('displayedGroupCreator'),
    __metadata("design:type", displayedGroupCreator_1.DisplayedGroupCreator)
], GridSerializer.prototype, "displayedGroupCreator", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], GridSerializer.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('rowModel'),
    __metadata("design:type", Object)
], GridSerializer.prototype, "rowModel", void 0);
__decorate([
    context_1.Autowired('floatingRowModel'),
    __metadata("design:type", floatingRowModel_1.FloatingRowModel)
], GridSerializer.prototype, "floatingRowModel", void 0);
__decorate([
    context_1.Autowired('selectionController'),
    __metadata("design:type", selectionController_1.SelectionController)
], GridSerializer.prototype, "selectionController", void 0);
__decorate([
    context_1.Autowired('balancedColumnTreeBuilder'),
    __metadata("design:type", balancedColumnTreeBuilder_1.BalancedColumnTreeBuilder)
], GridSerializer.prototype, "balancedColumnTreeBuilder", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], GridSerializer.prototype, "gridOptionsWrapper", void 0);
GridSerializer = __decorate([
    context_1.Bean("gridSerializer")
], GridSerializer);
exports.GridSerializer = GridSerializer;
var RowType;
(function (RowType) {
    RowType[RowType["HEADER_GROUPING"] = 0] = "HEADER_GROUPING";
    RowType[RowType["HEADER"] = 1] = "HEADER";
    RowType[RowType["BODY"] = 2] = "BODY";
})(RowType = exports.RowType || (exports.RowType = {}));
