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
let GridSerializer = class GridSerializer extends BeanStub {
    serialize(gridSerializingSession, params = {}) {
        const columnsToExport = this.getColumnsToExport(params.allColumns, params.columnKeys);
        const serializeChain = _.compose(
        // first pass, put in the header names of the cols
        this.prepareSession(columnsToExport), this.prependContent(params), this.exportColumnGroups(params, columnsToExport), this.exportHeaders(params, columnsToExport), this.processPinnedTopRows(params, columnsToExport), this.processRows(params, columnsToExport), this.processPinnedBottomRows(params, columnsToExport), this.appendContent(params));
        return serializeChain(gridSerializingSession).parse();
    }
    processRow(gridSerializingSession, params, columnsToExport, node) {
        const rowSkipper = params.shouldRowBeSkipped || (() => false);
        const context = this.gridOptionsService.context;
        const api = this.gridOptionsService.api;
        const columnApi = this.gridOptionsService.columnApi;
        const skipSingleChildrenGroup = this.gridOptionsService.is('groupRemoveSingleChildren');
        const skipLowestSingleChildrenGroup = this.gridOptionsService.is('groupRemoveLowestSingleChildren');
        // if onlySelected, we ignore groupHideOpenParents as the user has explicitly selected the rows they wish to export.
        // similarly, if specific rowNodes are provided we do the same. (the clipboard service uses rowNodes to define which rows to export)
        const isClipboardExport = params.rowPositions != null;
        const isExplicitExportSelection = isClipboardExport || !!params.onlySelected;
        const hideOpenParents = this.gridOptionsService.is('groupHideOpenParents') && !isExplicitExportSelection;
        const isLeafNode = this.columnModel.isPivotMode() ? node.leafGroup : !node.group;
        const isFooter = !!node.footer;
        const skipRowGroups = params.skipGroups || params.skipRowGroups;
        const shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
        const shouldSkipCurrentGroup = node.allChildrenCount === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);
        if (skipRowGroups && params.skipGroups) {
            _.doOnce(() => console.warn('AG Grid: Since v25.2 `skipGroups` has been renamed to `skipRowGroups`.'), 'gridSerializer-skipGroups');
        }
        if ((!isLeafNode && !isFooter && (params.skipRowGroups || shouldSkipCurrentGroup || hideOpenParents)) ||
            (params.onlySelected && !node.isSelected()) ||
            (params.skipPinnedTop && node.rowPinned === 'top') ||
            (params.skipPinnedBottom && node.rowPinned === 'bottom')) {
            return;
        }
        // if we are in pivotMode, then the grid will show the root node only
        // if it's not a leaf group
        const nodeIsRootNode = node.level === -1;
        if (nodeIsRootNode && !isLeafNode && !isFooter) {
            return;
        }
        const shouldRowBeSkipped = rowSkipper({ node, api, columnApi, context });
        if (shouldRowBeSkipped) {
            return;
        }
        const rowAccumulator = gridSerializingSession.onNewBodyRow(node);
        columnsToExport.forEach((column, index) => {
            rowAccumulator.onColumn(column, index, node);
        });
        if (params.getCustomContentBelowRow) {
            const content = params.getCustomContentBelowRow({ node, api, columnApi, context });
            if (content) {
                gridSerializingSession.addCustomContent(content);
            }
        }
    }
    appendContent(params) {
        return (gridSerializingSession) => {
            const appendContent = params.customFooter || params.appendContent;
            if (appendContent) {
                if (params.customFooter) {
                    _.doOnce(() => console.warn('AG Grid: Since version 25.2.0 the `customFooter` param has been deprecated. Use `appendContent` instead.'), 'gridSerializer-customFooter');
                }
                gridSerializingSession.addCustomContent(appendContent);
            }
            return gridSerializingSession;
        };
    }
    prependContent(params) {
        return (gridSerializingSession) => {
            const prependContent = params.customHeader || params.prependContent;
            if (prependContent) {
                if (params.customHeader) {
                    _.doOnce(() => console.warn('AG Grid: Since version 25.2.0 the `customHeader` param has been deprecated. Use `prependContent` instead.'), 'gridSerializer-customHeader');
                }
                gridSerializingSession.addCustomContent(prependContent);
            }
            return gridSerializingSession;
        };
    }
    prepareSession(columnsToExport) {
        return (gridSerializingSession) => {
            gridSerializingSession.prepare(columnsToExport);
            return gridSerializingSession;
        };
    }
    exportColumnGroups(params, columnsToExport) {
        return (gridSerializingSession) => {
            if (!params.skipColumnGroupHeaders) {
                const groupInstanceIdCreator = new GroupInstanceIdCreator();
                const displayedGroups = this.displayedGroupCreator.createDisplayedGroups(columnsToExport, this.columnModel.getGridBalancedTree(), groupInstanceIdCreator, null);
                this.recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession, params.processGroupHeaderCallback);
            }
            else if (params.columnGroups) {
                _.doOnce(() => console.warn('AG Grid: Since v25.2 the `columnGroups` param has deprecated, and groups are exported by default.'), 'gridSerializer-columnGroups');
            }
            return gridSerializingSession;
        };
    }
    exportHeaders(params, columnsToExport) {
        return (gridSerializingSession) => {
            if (!params.skipHeader && !params.skipColumnHeaders) {
                const gridRowIterator = gridSerializingSession.onNewHeaderRow();
                columnsToExport.forEach((column, index) => {
                    gridRowIterator.onColumn(column, index, undefined);
                });
            }
            else if (params.skipHeader) {
                _.doOnce(() => console.warn('AG Grid: Since v25.2 the `skipHeader` param has been renamed to `skipColumnHeaders`.'), 'gridSerializer-skipHeader');
            }
            return gridSerializingSession;
        };
    }
    processPinnedTopRows(params, columnsToExport) {
        return (gridSerializingSession) => {
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
            if (params.rowPositions) {
                params.rowPositions
                    // only pinnedTop rows, other models are processed by `processRows` and `processPinnedBottomsRows`
                    .filter(position => position.rowPinned === 'top')
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map(position => this.pinnedRowModel.getPinnedTopRow(position.rowIndex))
                    .forEach(processRow);
            }
            else {
                this.pinnedRowModel.forEachPinnedTopRow(processRow);
            }
            return gridSerializingSession;
        };
    }
    processRows(params, columnsToExport) {
        return (gridSerializingSession) => {
            // when in pivot mode, we always render cols on screen, never 'all columns'
            const rowModel = this.rowModel;
            const rowModelType = rowModel.getType();
            const usingCsrm = rowModelType === 'clientSide';
            const usingSsrm = rowModelType === 'serverSide';
            const onlySelectedNonStandardModel = !usingCsrm && params.onlySelected;
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
            const { exportedRows = 'filteredAndSorted', } = params;
            if (params.rowPositions) {
                params.rowPositions
                    // pinnedRows are processed by `processPinnedTopRows` and `processPinnedBottomsRows`
                    .filter(position => position.rowPinned == null)
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map(position => rowModel.getRow(position.rowIndex))
                    .forEach(processRow);
            }
            else if (this.columnModel.isPivotMode()) {
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
                    const selectedNodes = this.selectionService.getSelectedNodes();
                    this.replicateSortedOrder(selectedNodes);
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
    }
    replicateSortedOrder(rows) {
        const sortOptions = this.sortController.getSortOptions();
        const compareNodes = (rowA, rowB) => {
            var _a, _b, _c, _d;
            if (rowA.rowIndex != null && rowB.rowIndex != null) {
                // if the rows have rowIndexes, this is the easiest way to compare,
                // as they're already ordered
                return rowA.rowIndex - rowB.rowIndex;
            }
            // if the level is the same, compare these nodes, or their parents
            if (rowA.level === rowB.level) {
                if (((_a = rowA.parent) === null || _a === void 0 ? void 0 : _a.id) === ((_b = rowB.parent) === null || _b === void 0 ? void 0 : _b.id)) {
                    return this.rowNodeSorter.compareRowNodes(sortOptions, {
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
    }
    processPinnedBottomRows(params, columnsToExport) {
        return (gridSerializingSession) => {
            const processRow = this.processRow.bind(this, gridSerializingSession, params, columnsToExport);
            if (params.rowPositions) {
                params.rowPositions
                    // only pinnedBottom rows, other models are processed by `processRows` and `processPinnedTopRows`
                    .filter(position => position.rowPinned === 'bottom')
                    .sort((a, b) => a.rowIndex - b.rowIndex)
                    .map(position => this.pinnedRowModel.getPinnedBottomRow(position.rowIndex))
                    .forEach(processRow);
            }
            else {
                this.pinnedRowModel.forEachPinnedBottomRow(processRow);
            }
            return gridSerializingSession;
        };
    }
    getColumnsToExport(allColumns = false, columnKeys) {
        const isPivotMode = this.columnModel.isPivotMode();
        if (columnKeys && columnKeys.length) {
            return this.columnModel.getGridColumns(columnKeys);
        }
        if (allColumns && !isPivotMode) {
            // add auto group column for tree data
            const columns = this.gridOptionsService.isTreeData()
                ? this.columnModel.getGridColumns([GROUP_AUTO_COLUMN_ID])
                : [];
            return columns.concat(this.columnModel.getAllPrimaryColumns() || []);
        }
        return this.columnModel.getAllDisplayedColumns();
    }
    recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession, processGroupHeaderCallback) {
        const directChildrenHeaderGroups = [];
        displayedGroups.forEach((columnGroupChild) => {
            const columnGroup = columnGroupChild;
            if (!columnGroup.getChildren) {
                return;
            }
            columnGroup.getChildren().forEach(it => directChildrenHeaderGroups.push(it));
        });
        if (displayedGroups.length > 0 && displayedGroups[0] instanceof ColumnGroup) {
            this.doAddHeaderHeader(gridSerializingSession, displayedGroups, processGroupHeaderCallback);
        }
        if (directChildrenHeaderGroups && directChildrenHeaderGroups.length > 0) {
            this.recursivelyAddHeaderGroups(directChildrenHeaderGroups, gridSerializingSession, processGroupHeaderCallback);
        }
    }
    doAddHeaderHeader(gridSerializingSession, displayedGroups, processGroupHeaderCallback) {
        const gridRowIterator = gridSerializingSession.onNewHeaderGroupingRow();
        let columnIndex = 0;
        displayedGroups.forEach((columnGroupChild) => {
            const columnGroup = columnGroupChild;
            let name;
            if (processGroupHeaderCallback) {
                name = processGroupHeaderCallback({
                    columnGroup: columnGroup,
                    api: this.gridOptionsService.api,
                    columnApi: this.gridOptionsService.columnApi,
                    context: this.gridOptionsService.context
                });
            }
            else {
                name = this.columnModel.getDisplayNameForColumnGroup(columnGroup, 'header');
            }
            const collapsibleGroupRanges = columnGroup.getLeafColumns().reduce((collapsibleGroups, currentColumn, currentIdx, arr) => {
                let lastGroup = _.last(collapsibleGroups);
                const groupShow = currentColumn.getColumnGroupShow() === 'open';
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
    }
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
export { GridSerializer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZFNlcmlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY3N2RXhwb3J0L2dyaWRTZXJpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBR1IsV0FBVyxFQUVYLG9CQUFvQixFQUdwQixzQkFBc0IsRUFXekIsTUFBTSx5QkFBeUIsQ0FBQztBQUtqQyxNQUFNLENBQU4sSUFBWSxPQUF5QztBQUFyRCxXQUFZLE9BQU87SUFBRywyREFBZSxDQUFBO0lBQUUseUNBQU0sQ0FBQTtJQUFFLHFDQUFJLENBQUE7QUFBQyxDQUFDLEVBQXpDLE9BQU8sS0FBUCxPQUFPLFFBQWtDO0FBR3JELElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWUsU0FBUSxRQUFRO0lBVWpDLFNBQVMsQ0FBSSxzQkFBaUQsRUFBRSxTQUEwQixFQUFFO1FBQy9GLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV0RixNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsT0FBTztRQUM1QixrREFBa0Q7UUFDbEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsRUFDcEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsRUFDaEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLEVBQzNDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLEVBQ2xELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxFQUN6QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLGVBQWUs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