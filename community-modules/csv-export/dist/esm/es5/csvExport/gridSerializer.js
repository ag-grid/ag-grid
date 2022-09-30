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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, ColumnGroup, Constants, GroupInstanceIdCreator } from "@ag-grid-community/core";
export var RowType;
(function (RowType) {
    RowType[RowType["HEADER_GROUPING"] = 0] = "HEADER_GROUPING";
    RowType[RowType["HEADER"] = 1] = "HEADER";
    RowType[RowType["BODY"] = 2] = "BODY";
})(RowType || (RowType = {}));
var GridSerializer = /** @class */ (function (_super) {
    __extends(GridSerializer, _super);
    function GridSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridSerializer.prototype.serialize = function (gridSerializingSession, params) {
        if (params === void 0) { params = {}; }
        var columnsToExport = this.getColumnsToExport(params.allColumns, params.columnKeys);
        var serializeChain = _.compose(
        // first pass, put in the header names of the cols
        this.prepareSession(columnsToExport), this.prependContent(params), this.exportColumnGroups(params, columnsToExport), this.exportHeaders(params, columnsToExport), this.processPinnedTopRows(params, columnsToExport), this.processRows(params, columnsToExport), this.processPinnedBottomRows(params, columnsToExport), this.appendContent(params));
        return serializeChain(gridSerializingSession).parse();
    };
    GridSerializer.prototype.processRow = function (gridSerializingSession, params, columnsToExport, node) {
        var rowSkipper = params.shouldRowBeSkipped || (function () { return false; });
        var gridOptionsWrapper = this.gridOptionsWrapper;
        var context = gridOptionsWrapper.getContext();
        var api = gridOptionsWrapper.getApi();
        var columnApi = gridOptionsWrapper.getColumnApi();
        var skipSingleChildrenGroup = gridOptionsWrapper.isGroupRemoveSingleChildren();
        var skipLowestSingleChildrenGroup = gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        // if onlySelected, we ignore groupHideOpenParents as the user has explicitly selected the rows they wish to export.
        // similarly, if specific rowNodes are provided we do the same. (the clipboard service uses rowNodes to define which rows to export)
        var isClipboardExport = params.rowPositions != null;
        var isExplicitExportSelection = isClipboardExport || !!params.onlySelected;
        var hideOpenParents = gridOptionsWrapper.isGroupHideOpenParents() && !isExplicitExportSelection;
        var isLeafNode = this.columnModel.isPivotMode() ? node.leafGroup : !node.group;
        var skipRowGroups = params.skipGroups || params.skipRowGroups;
        var shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
        var shouldSkipCurrentGroup = node.allChildrenCount === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);
        if (skipRowGroups && params.skipGroups) {
            _.doOnce(function () { return console.warn('AG Grid: Since v25.2 `skipGroups` has been renamed to `skipRowGroups`.'); }, 'gridSerializer-skipGroups');
        }
        if ((!isLeafNode && (params.skipRowGroups || shouldSkipCurrentGroup || hideOpenParents)) ||
            (params.onlySelected && !node.isSelected()) ||
            (params.skipPinnedTop && node.rowPinned === 'top') ||
            (params.skipPinnedBottom && node.rowPinned === 'bottom')) {
            return;
        }
        // if we are in pivotMode, then the grid will show the root node only
        // if it's not a leaf group
        var nodeIsRootNode = node.level === -1;
        if (nodeIsRootNode && !node.leafGroup && (!node.footer || !isClipboardExport)) {
            return;
        }
        var shouldRowBeSkipped = rowSkipper({ node: node, api: api, columnApi: columnApi, context: context });
        if (shouldRowBeSkipped) {
            return;
        }
        var rowAccumulator = gridSerializingSession.onNewBodyRow();
        columnsToExport.forEach(function (column, index) {
            rowAccumulator.onColumn(column, index, node);
        });
        if (params.getCustomContentBelowRow) {
            var content = params.getCustomContentBelowRow({ node: node, api: api, columnApi: columnApi, context: context });
            if (content) {
                gridSerializingSession.addCustomContent(content);
            }
        }
    };
    GridSerializer.prototype.appendContent = function (params) {
        return function (gridSerializingSession) {
            var appendContent = params.customFooter || params.appendContent;
            if (appendContent) {
                if (params.customFooter) {
                    _.doOnce(function () { return console.warn('AG Grid: Since version 25.2.0 the `customFooter` param has been deprecated. Use `appendContent` instead.'); }, 'gridSerializer-customFooter');
                }
                gridSerializingSession.addCustomContent(appendContent);
            }
            return gridSerializingSession;
        };
    };
    GridSerializer.prototype.prependContent = function (params) {
        return function (gridSerializingSession) {
            var prependContent = params.customHeader || params.prependContent;
            if (prependContent) {
                if (params.customHeader) {
                    _.doOnce(function () { return console.warn('AG Grid: Since version 25.2.0 the `customHeader` param has been deprecated. Use `prependContent` instead.'); }, 'gridSerializer-customHeader');
                }
                gridSerializingSession.addCustomContent(prependContent);
            }
            return gridSerializingSession;
        };
    };
    GridSerializer.prototype.prepareSession = function (columnsToExport) {
        return function (gridSerializingSession) {
            gridSerializingSession.prepare(columnsToExport);
            return gridSerializingSession;
        };
    };
    GridSerializer.prototype.exportColumnGroups = function (params, columnsToExport) {
        var _this = this;
        return function (gridSerializingSession) {
            if (!params.skipColumnGroupHeaders) {
                var groupInstanceIdCreator = new GroupInstanceIdCreator();
                var displayedGroups = _this.displayedGroupCreator.createDisplayedGroups(columnsToExport, _this.columnModel.getGridBalancedTree(), groupInstanceIdCreator, null);
                _this.recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession, params.processGroupHeaderCallback);
            }
            else if (params.columnGroups) {
                _.doOnce(function () { return console.warn('AG Grid: Since v25.2 the `columnGroups` param has deprecated, and groups are exported by default.'); }, 'gridSerializer-columnGroups');
            }
            return gridSerializingSession;
        };
    };
    GridSerializer.prototype.exportHeaders = function (params, columnsToExport) {
        return function (gridSerializingSession) {
            if (!params.skipHeader && !params.skipColumnHeaders) {
                var gridRowIterator_1 = gridSerializingSession.onNewHeaderRow();
                columnsToExport.forEach(function (column, index) {
                    gridRowIterator_1.onColumn(column, index, undefined);
                });
            }
            else if (params.skipHeader) {
                _.doOnce(function () { return console.warn('AG Grid: Since v25.2 the `skipHeader` param has been renamed to `skipColumnHeaders`.'); }, 'gridSerializer-skipHeader');
            }
            return gridSerializingSession;
        };
    };
    GridSerializer.prototype.processPinnedTopRows = function (params, columnsToExport) {
        var _this = this;
        return function (gridSerializingSession) {
            var processRow = _this.processRow.bind(_this, gridSerializingSession, params, columnsToExport);
            if (params.rowPositions) {
                params.rowPositions
                    // only pinnedTop rows, other models are processed by `processRows` and `processPinnedBottomsRows`
                    .filter(function (position) { return position.rowPinned === 'top'; })
                    .sort(function (a, b) { return a.rowIndex - b.rowIndex; })
                    .map(function (position) { return _this.pinnedRowModel.getPinnedTopRow(position.rowIndex); })
                    .forEach(processRow);
            }
            else {
                _this.pinnedRowModel.forEachPinnedTopRow(processRow);
            }
            return gridSerializingSession;
        };
    };
    GridSerializer.prototype.processRows = function (params, columnsToExport) {
        var _this = this;
        return function (gridSerializingSession) {
            // when in pivot mode, we always render cols on screen, never 'all columns'
            var rowModel = _this.rowModel;
            var rowModelType = rowModel.getType();
            var usingCsrm = rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
            var usingSsrm = rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE;
            var onlySelectedNonStandardModel = !usingCsrm && params.onlySelected;
            var processRow = _this.processRow.bind(_this, gridSerializingSession, params, columnsToExport);
            var _a = params.exportedRows, exportedRows = _a === void 0 ? 'filteredAndSorted' : _a;
            if (params.rowPositions) {
                params.rowPositions
                    // pinnedRows are processed by `processPinnedTopRows` and `processPinnedBottomsRows`
                    .filter(function (position) { return position.rowPinned == null; })
                    .sort(function (a, b) { return a.rowIndex - b.rowIndex; })
                    .map(function (position) { return rowModel.getRow(position.rowIndex); })
                    .forEach(processRow);
            }
            else if (_this.columnModel.isPivotMode()) {
                if (usingCsrm) {
                    rowModel.forEachPivotNode(processRow);
                }
                else {
                    // must be enterprise, so we can just loop through all the nodes
                    rowModel.forEachNode(processRow);
                }
            }
            else {
                // onlySelectedAllPages: user doing pagination and wants selected items from
                // other pages, so cannot use the standard row model as it won't have rows from
                // other pages.
                // onlySelectedNonStandardModel: if user wants selected in non standard row model
                // (eg viewport) then again RowModel cannot be used, so need to use selected instead.
                if (params.onlySelectedAllPages || onlySelectedNonStandardModel) {
                    var selectedNodes = _this.selectionService.getSelectedNodes();
                    selectedNodes.forEach(processRow);
                }
                else {
                    // here is everything else - including standard row model and selected. we don't use
                    // the selection model even when just using selected, so that the result is the order
                    // of the rows appearing on the screen.
                    if (exportedRows === 'all') {
                        rowModel.forEachNode(processRow);
                    }
                    else if (usingCsrm) {
                        rowModel.forEachNodeAfterFilterAndSort(processRow);
                    }
                    else if (usingSsrm) {
                        rowModel.forEachNodeAfterFilterAndSort(processRow);
                    }
                    else {
                        rowModel.forEachNode(processRow);
                    }
                }
            }
            return gridSerializingSession;
        };
    };
    GridSerializer.prototype.processPinnedBottomRows = function (params, columnsToExport) {
        var _this = this;
        return function (gridSerializingSession) {
            var processRow = _this.processRow.bind(_this, gridSerializingSession, params, columnsToExport);
            if (params.rowPositions) {
                params.rowPositions
                    // only pinnedBottom rows, other models are processed by `processRows` and `processPinnedTopRows`
                    .filter(function (position) { return position.rowPinned === 'bottom'; })
                    .sort(function (a, b) { return a.rowIndex - b.rowIndex; })
                    .map(function (position) { return _this.pinnedRowModel.getPinnedBottomRow(position.rowIndex); })
                    .forEach(processRow);
            }
            else {
                _this.pinnedRowModel.forEachPinnedBottomRow(processRow);
            }
            return gridSerializingSession;
        };
    };
    GridSerializer.prototype.getColumnsToExport = function (allColumns, columnKeys) {
        if (allColumns === void 0) { allColumns = false; }
        var isPivotMode = this.columnModel.isPivotMode();
        if (columnKeys && columnKeys.length) {
            return this.columnModel.getGridColumns(columnKeys);
        }
        if (allColumns && !isPivotMode) {
            // add auto group column for tree data
            var columns = this.gridOptionsWrapper.isTreeData()
                ? this.columnModel.getGridColumns([Constants.GROUP_AUTO_COLUMN_ID])
                : [];
            return columns.concat(this.columnModel.getAllPrimaryColumns() || []);
        }
        return this.columnModel.getAllDisplayedColumns();
    };
    GridSerializer.prototype.recursivelyAddHeaderGroups = function (displayedGroups, gridSerializingSession, processGroupHeaderCallback) {
        var directChildrenHeaderGroups = [];
        displayedGroups.forEach(function (columnGroupChild) {
            var columnGroup = columnGroupChild;
            if (!columnGroup.getChildren) {
                return;
            }
            columnGroup.getChildren().forEach(function (it) { return directChildrenHeaderGroups.push(it); });
        });
        if (displayedGroups.length > 0 && displayedGroups[0] instanceof ColumnGroup) {
            this.doAddHeaderHeader(gridSerializingSession, displayedGroups, processGroupHeaderCallback);
        }
        if (directChildrenHeaderGroups && directChildrenHeaderGroups.length > 0) {
            this.recursivelyAddHeaderGroups(directChildrenHeaderGroups, gridSerializingSession, processGroupHeaderCallback);
        }
    };
    GridSerializer.prototype.doAddHeaderHeader = function (gridSerializingSession, displayedGroups, processGroupHeaderCallback) {
        var _this = this;
        var gridRowIterator = gridSerializingSession.onNewHeaderGroupingRow();
        var columnIndex = 0;
        displayedGroups.forEach(function (columnGroupChild) {
            var columnGroup = columnGroupChild;
            var name;
            if (processGroupHeaderCallback) {
                name = processGroupHeaderCallback({
                    columnGroup: columnGroup,
                    api: _this.gridOptionsWrapper.getApi(),
                    columnApi: _this.gridOptionsWrapper.getColumnApi(),
                    context: _this.gridOptionsWrapper.getContext()
                });
            }
            else {
                name = _this.columnModel.getDisplayNameForColumnGroup(columnGroup, 'header');
            }
            var collapsibleGroupRanges = columnGroup.getLeafColumns().reduce(function (collapsibleGroups, currentColumn, currentIdx, arr) {
                var lastGroup = _.last(collapsibleGroups);
                var groupShow = currentColumn.getColumnGroupShow() === 'open';
                if (!groupShow) {
                    if (lastGroup && lastGroup[1] == null) {
                        lastGroup[1] = currentIdx - 1;
                    }
                }
                else if (!lastGroup || lastGroup[1] != null) {
                    lastGroup = [currentIdx];
                    collapsibleGroups.push(lastGroup);
                }
                if (currentIdx === arr.length - 1 && lastGroup && lastGroup[1] == null) {
                    lastGroup[1] = currentIdx;
                }
                return collapsibleGroups;
            }, []);
            gridRowIterator.onColumn(columnGroup, name || '', columnIndex++, columnGroup.getLeafColumns().length - 1, collapsibleGroupRanges);
        });
    };
    __decorate([
        Autowired('displayedGroupCreator')
    ], GridSerializer.prototype, "displayedGroupCreator", void 0);
    __decorate([
        Autowired('columnModel')
    ], GridSerializer.prototype, "columnModel", void 0);
    __decorate([
        Autowired('rowModel')
    ], GridSerializer.prototype, "rowModel", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], GridSerializer.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('selectionService')
    ], GridSerializer.prototype, "selectionService", void 0);
    __decorate([
        Autowired('rowPositionUtils')
    ], GridSerializer.prototype, "rowPositionUtils", void 0);
    GridSerializer = __decorate([
        Bean("gridSerializer")
    ], GridSerializer);
    return GridSerializer;
}(BeanStub));
export { GridSerializer };
