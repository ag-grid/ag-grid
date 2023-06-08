var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
import { _, Autowired, Bean, BeanStub, ColumnGroup, GROUP_AUTO_COLUMN_ID, GroupInstanceIdCreator } from "@ag-grid-community/core";
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
        var context = this.gridOptionsService.context;
        var api = this.gridOptionsService.api;
        var columnApi = this.gridOptionsService.columnApi;
        var skipSingleChildrenGroup = this.gridOptionsService.is('groupRemoveSingleChildren');
        var skipLowestSingleChildrenGroup = this.gridOptionsService.is('groupRemoveLowestSingleChildren');
        // if onlySelected, we ignore groupHideOpenParents as the user has explicitly selected the rows they wish to export.
        // similarly, if specific rowNodes are provided we do the same. (the clipboard service uses rowNodes to define which rows to export)
        var isClipboardExport = params.rowPositions != null;
        var isExplicitExportSelection = isClipboardExport || !!params.onlySelected;
        var hideOpenParents = this.gridOptionsService.is('groupHideOpenParents') && !isExplicitExportSelection;
        var isLeafNode = this.columnModel.isPivotMode() ? node.leafGroup : !node.group;
        var isFooter = !!node.footer;
        var skipRowGroups = params.skipGroups || params.skipRowGroups;
        var shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
        var shouldSkipCurrentGroup = node.allChildrenCount === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);
        if (skipRowGroups && params.skipGroups) {
            _.doOnce(function () { return console.warn('AG Grid: Since v25.2 `skipGroups` has been renamed to `skipRowGroups`.'); }, 'gridSerializer-skipGroups');
        }
        if ((!isLeafNode && !isFooter && (params.skipRowGroups || shouldSkipCurrentGroup || hideOpenParents)) ||
            (params.onlySelected && !node.isSelected()) ||
            (params.skipPinnedTop && node.rowPinned === 'top') ||
            (params.skipPinnedBottom && node.rowPinned === 'bottom')) {
            return;
        }
        // if we are in pivotMode, then the grid will show the root node only
        // if it's not a leaf group
        var nodeIsRootNode = node.level === -1;
        if (nodeIsRootNode && !isLeafNode && !isFooter) {
            return;
        }
        var shouldRowBeSkipped = rowSkipper({ node: node, api: api, columnApi: columnApi, context: context });
        if (shouldRowBeSkipped) {
            return;
        }
        var rowAccumulator = gridSerializingSession.onNewBodyRow(node);
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
            var usingCsrm = rowModelType === 'clientSide';
            var usingSsrm = rowModelType === 'serverSide';
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
                    rowModel.forEachPivotNode(processRow, true);
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
                    _this.replicateSortedOrder(selectedNodes);
                    // serialize each node
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
                        rowModel.forEachNodeAfterFilterAndSort(processRow, true);
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
    GridSerializer.prototype.replicateSortedOrder = function (rows) {
        var _this = this;
        var sortOptions = this.sortController.getSortOptions();
        var compareNodes = function (rowA, rowB) {
            var _a, _b, _c, _d;
            if (rowA.rowIndex != null && rowB.rowIndex != null) {
                // if the rows have rowIndexes, this is the easiest way to compare,
                // as they're already ordered
                return rowA.rowIndex - rowB.rowIndex;
            }
            // if the level is the same, compare these nodes, or their parents
            if (rowA.level === rowB.level) {
                if (((_a = rowA.parent) === null || _a === void 0 ? void 0 : _a.id) === ((_b = rowB.parent) === null || _b === void 0 ? void 0 : _b.id)) {
                    return _this.rowNodeSorter.compareRowNodes(sortOptions, {
                        rowNode: rowA,
                        currentPos: (_c = rowA.rowIndex) !== null && _c !== void 0 ? _c : -1,
                    }, {
                        rowNode: rowB,
                        currentPos: (_d = rowB.rowIndex) !== null && _d !== void 0 ? _d : -1,
                    });
                }
                // level is same, but parent isn't, compare parents
                return compareNodes(rowA.parent, rowB.parent);
            }
            // if level is different, match levels
            if (rowA.level > rowB.level) {
                return compareNodes(rowA.parent, rowB);
            }
            return compareNodes(rowA, rowB.parent);
        };
        // sort the nodes either by existing row index or compare them
        rows.sort(compareNodes);
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
            var columns = this.gridOptionsService.isTreeData()
                ? this.columnModel.getGridColumns([GROUP_AUTO_COLUMN_ID])
                : [];
            return columns.concat(this.columnModel.getAllGridColumns() || []);
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
                    api: _this.gridOptionsService.api,
                    columnApi: _this.gridOptionsService.columnApi,
                    context: _this.gridOptionsService.context
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
        Autowired('rowNodeSorter')
    ], GridSerializer.prototype, "rowNodeSorter", void 0);
    __decorate([
        Autowired('sortController')
    ], GridSerializer.prototype, "sortController", void 0);
    GridSerializer = __decorate([
        Bean("gridSerializer")
    ], GridSerializer);
    return GridSerializer;
}(BeanStub));
export { GridSerializer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZFNlcmlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY3N2RXhwb3J0L2dyaWRTZXJpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBR1IsV0FBVyxFQUVYLG9CQUFvQixFQUdwQixzQkFBc0IsRUFXekIsTUFBTSx5QkFBeUIsQ0FBQztBQUtqQyxNQUFNLENBQU4sSUFBWSxPQUF5QztBQUFyRCxXQUFZLE9BQU87SUFBRywyREFBZSxDQUFBO0lBQUUseUNBQU0sQ0FBQTtJQUFFLHFDQUFJLENBQUE7QUFBQyxDQUFDLEVBQXpDLE9BQU8sS0FBUCxPQUFPLFFBQWtDO0FBR3JEO0lBQW9DLGtDQUFRO0lBQTVDOztJQXNXQSxDQUFDO0lBNVZVLGtDQUFTLEdBQWhCLFVBQW9CLHNCQUFpRCxFQUFFLE1BQTRCO1FBQTVCLHVCQUFBLEVBQUEsV0FBNEI7UUFDL0YsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRGLElBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxPQUFPO1FBQzVCLGtEQUFrRDtRQUNsRCxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxFQUNwQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUMzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxFQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsRUFDM0MsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsRUFDbEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLEVBQ3pDLElB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