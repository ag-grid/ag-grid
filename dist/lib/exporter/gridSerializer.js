/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.1
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
var context_1 = require("../context/context");
var columnController_1 = require("../columnController/columnController");
var constants_1 = require("../constants");
var selectionController_1 = require("../selectionController");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var displayedGroupCreator_1 = require("../columnController/displayedGroupCreator");
var columnFactory_1 = require("../columnController/columnFactory");
var groupInstanceIdCreator_1 = require("../columnController/groupInstanceIdCreator");
var columnGroup_1 = require("../entities/columnGroup");
var pinnedRowModel_1 = require("../rowModels/pinnedRowModel");
var utils_1 = require("../utils");
var BaseGridSerializingSession = /** @class */ (function () {
    function BaseGridSerializingSession(config) {
        var columnController = config.columnController, valueService = config.valueService, gridOptionsWrapper = config.gridOptionsWrapper, processCellCallback = config.processCellCallback, processHeaderCallback = config.processHeaderCallback, cellAndHeaderEscaper = config.cellAndHeaderEscaper;
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
    BaseGridSerializingSession.prototype.extractRowCellValue = function (column, index, type, node) {
        var isRowGrouping = this.columnController.getRowGroupColumns().length > 0;
        var valueForCell;
        if (node && node.group && isRowGrouping && index === 0) {
            valueForCell = this.createValueForGroupNode(node);
        }
        else {
            valueForCell = this.valueService.getValue(column, node);
        }
        valueForCell = this.processCell(node, column, valueForCell, this.processCellCallback, type);
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
    BaseGridSerializingSession.prototype.processCell = function (rowNode, column, value, processCellCallback, type) {
        if (processCellCallback) {
            return processCellCallback({
                column: column,
                node: rowNode,
                value: value,
                api: this.gridOptionsWrapper.getApi(),
                columnApi: this.gridOptionsWrapper.getColumnApi(),
                context: this.gridOptionsWrapper.getContext(),
                type: type
            });
        }
        else {
            return value;
        }
    };
    return BaseGridSerializingSession;
}());
exports.BaseGridSerializingSession = BaseGridSerializingSession;
var GridSerializer = /** @class */ (function () {
    function GridSerializer() {
    }
    GridSerializer.prototype.serialize = function (gridSerializingSession, params) {
        var dontSkipRows = function () { return false; };
        var skipGroups = params && params.skipGroups;
        var skipHeader = params && params.skipHeader;
        var columnGroups = params && params.columnGroups;
        var skipFooters = params && params.skipFooters;
        var skipPinnedTop = params && params.skipPinnedTop;
        var skipPinnedBottom = params && params.skipPinnedBottom;
        var includeCustomHeader = params && params.customHeader;
        var includeCustomFooter = params && params.customFooter;
        var allColumns = params && params.allColumns;
        var onlySelected = params && params.onlySelected;
        var columnKeys = params && params.columnKeys;
        var onlySelectedAllPages = params && params.onlySelectedAllPages;
        var rowSkipper = (params && params.shouldRowBeSkipped) || dontSkipRows;
        var api = this.gridOptionsWrapper.getApi();
        var skipSingleChildrenGroup = this.gridOptionsWrapper.isGroupRemoveSingleChildren();
        var skipLowestSingleChildrenGroup = this.gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        var context = this.gridOptionsWrapper.getContext();
        // when in pivot mode, we always render cols on screen, never 'all columns'
        var isPivotMode = this.columnController.isPivotMode();
        var rowModelNormal = this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        var onlySelectedNonStandardModel = !rowModelNormal && onlySelected;
        var columnsToExport = [];
        if (utils_1._.existsAndNotEmpty(columnKeys)) {
            columnsToExport = this.columnController.getGridColumns(columnKeys);
        }
        else if (allColumns && !isPivotMode) {
            // add auto group column for tree data
            columnsToExport = this.gridOptionsWrapper.isTreeData() ?
                this.columnController.getGridColumns([constants_1.Constants.GROUP_AUTO_COLUMN_ID]) : [];
            columnsToExport = columnsToExport.concat(this.columnController.getAllPrimaryColumns() || []);
        }
        else {
            columnsToExport = this.columnController.getAllDisplayedColumns();
        }
        if (includeCustomHeader) {
            gridSerializingSession.addCustomHeader(includeCustomHeader);
        }
        gridSerializingSession.prepare(columnsToExport);
        // first pass, put in the header names of the cols
        if (columnGroups) {
            var groupInstanceIdCreator = new groupInstanceIdCreator_1.GroupInstanceIdCreator();
            var displayedGroups = this.displayedGroupCreator.createDisplayedGroups(columnsToExport, this.columnController.getGridBalancedTree(), groupInstanceIdCreator, null);
            this.recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession);
        }
        if (!skipHeader) {
            var gridRowIterator_1 = gridSerializingSession.onNewHeaderRow();
            columnsToExport.forEach(function (column, index) {
                gridRowIterator_1.onColumn(column, index, undefined);
            });
        }
        this.pinnedRowModel.forEachPinnedTopRow(processRow);
        if (isPivotMode) {
            if (this.rowModel.forEachPivotNode) {
                this.rowModel.forEachPivotNode(processRow);
            }
            else {
                //Must be enterprise, so we can just loop through all the nodes
                this.rowModel.forEachNode(processRow);
            }
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
                if (rowModelNormal) {
                    this.rowModel.forEachNodeAfterFilterAndSort(processRow);
                }
                else {
                    this.rowModel.forEachNode(processRow);
                }
            }
        }
        this.pinnedRowModel.forEachPinnedBottomRow(processRow);
        if (includeCustomFooter) {
            gridSerializingSession.addCustomFooter(includeCustomFooter);
        }
        function processRow(node) {
            var shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
            var shouldSkipCurrentGroup = node.allChildrenCount === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);
            if (node.group && (skipGroups || shouldSkipCurrentGroup)) {
                return;
            }
            if (skipFooters && node.footer) {
                return;
            }
            if (onlySelected && !node.isSelected()) {
                return;
            }
            if (skipPinnedTop && node.rowPinned === 'top') {
                return;
            }
            if (skipPinnedBottom && node.rowPinned === 'bottom') {
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
            if (shouldRowBeSkipped) {
                return;
            }
            var rowAccumulator = gridSerializingSession.onNewBodyRow();
            columnsToExport.forEach(function (column, index) {
                rowAccumulator.onColumn(column, index, node);
            });
        }
        return gridSerializingSession.parse();
    };
    GridSerializer.prototype.recursivelyAddHeaderGroups = function (displayedGroups, gridSerializingSession) {
        var directChildrenHeaderGroups = [];
        displayedGroups.forEach(function (columnGroupChild) {
            var columnGroup = columnGroupChild;
            if (!columnGroup.getChildren) {
                return;
            }
            columnGroup.getChildren().forEach(function (it) { return directChildrenHeaderGroups.push(it); });
        });
        if (displayedGroups.length > 0 && displayedGroups[0] instanceof columnGroup_1.ColumnGroup) {
            this.doAddHeaderHeader(gridSerializingSession, displayedGroups);
        }
        if (directChildrenHeaderGroups && directChildrenHeaderGroups.length > 0) {
            this.recursivelyAddHeaderGroups(directChildrenHeaderGroups, gridSerializingSession);
        }
    };
    GridSerializer.prototype.doAddHeaderHeader = function (gridSerializingSession, displayedGroups) {
        var _this = this;
        var gridRowIterator = gridSerializingSession.onNewHeaderGroupingRow();
        var columnIndex = 0;
        displayedGroups.forEach(function (columnGroupChild) {
            var columnGroup = columnGroupChild;
            var columnName = _this.columnController.getDisplayNameForColumnGroup(columnGroup, 'header');
            gridRowIterator.onColumn(columnName || '', columnIndex++, columnGroup.getLeafColumns().length - 1);
        });
    };
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
        context_1.Autowired('pinnedRowModel'),
        __metadata("design:type", pinnedRowModel_1.PinnedRowModel)
    ], GridSerializer.prototype, "pinnedRowModel", void 0);
    __decorate([
        context_1.Autowired('selectionController'),
        __metadata("design:type", selectionController_1.SelectionController)
    ], GridSerializer.prototype, "selectionController", void 0);
    __decorate([
        context_1.Autowired('columnFactory'),
        __metadata("design:type", columnFactory_1.ColumnFactory)
    ], GridSerializer.prototype, "columnFactory", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], GridSerializer.prototype, "gridOptionsWrapper", void 0);
    GridSerializer = __decorate([
        context_1.Bean("gridSerializer")
    ], GridSerializer);
    return GridSerializer;
}());
exports.GridSerializer = GridSerializer;
var RowType;
(function (RowType) {
    RowType[RowType["HEADER_GROUPING"] = 0] = "HEADER_GROUPING";
    RowType[RowType["HEADER"] = 1] = "HEADER";
    RowType[RowType["BODY"] = 2] = "BODY";
})(RowType = exports.RowType || (exports.RowType = {}));
