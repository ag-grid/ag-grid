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
import { Autowired, Bean, BeanStub, ColumnGroup, Constants, GroupInstanceIdCreator, _ } from "@ag-grid-community/core";
var GridSerializer = /** @class */ (function (_super) {
    __extends(GridSerializer, _super);
    function GridSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridSerializer.prototype.serialize = function (gridSerializingSession, params) {
        if (params === void 0) { params = {}; }
        var rowSkipper = params.shouldRowBeSkipped || (function () { return false; });
        var gridOptionsWrapper = this.gridOptionsWrapper;
        var api = gridOptionsWrapper.getApi();
        var columnApi = gridOptionsWrapper.getColumnApi();
        var skipSingleChildrenGroup = gridOptionsWrapper.isGroupRemoveSingleChildren();
        var skipLowestSingleChildrenGroup = gridOptionsWrapper.isGroupRemoveLowestSingleChildren();
        var hideOpenParents = gridOptionsWrapper.isGroupHideOpenParents();
        var context = gridOptionsWrapper.getContext();
        // when in pivot mode, we always render cols on screen, never 'all columns'
        var isPivotMode = this.columnController.isPivotMode();
        var rowModelNormal = this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE;
        var onlySelectedNonStandardModel = !rowModelNormal && params.onlySelected;
        var columnsToExport = [];
        if (_.existsAndNotEmpty(params.columnKeys)) {
            columnsToExport = this.columnController.getGridColumns(params.columnKeys);
        }
        else if (params.allColumns && !isPivotMode) {
            // add auto group column for tree data
            columnsToExport = gridOptionsWrapper.isTreeData() ?
                this.columnController.getGridColumns([Constants.GROUP_AUTO_COLUMN_ID]) : [];
            columnsToExport = columnsToExport.concat(this.columnController.getAllPrimaryColumns() || []);
        }
        else {
            columnsToExport = this.columnController.getAllDisplayedColumns();
        }
        if (params.customHeader) {
            gridSerializingSession.addCustomContent(params.customHeader);
        }
        gridSerializingSession.prepare(columnsToExport);
        // first pass, put in the header names of the cols
        if (params.columnGroups) {
            var groupInstanceIdCreator = new GroupInstanceIdCreator();
            var displayedGroups = this.displayedGroupCreator.createDisplayedGroups(columnsToExport, this.columnController.getGridBalancedTree(), groupInstanceIdCreator, null);
            this.recursivelyAddHeaderGroups(displayedGroups, gridSerializingSession, params.processGroupHeaderCallback);
        }
        if (!params.skipHeader) {
            var gridRowIterator_1 = gridSerializingSession.onNewHeaderRow();
            columnsToExport.forEach(function (column, index) {
                gridRowIterator_1.onColumn(column, index, undefined);
            });
        }
        this.pinnedRowModel.forEachPinnedTopRow(processRow);
        var rowModel = this.rowModel;
        var clientSideRowModel = this.rowModel;
        if (isPivotMode) {
            // @ts-ignore - ignore tautology below as we are using it to check if it's clientSideRowModel
            if (clientSideRowModel.forEachPivotNode) {
                clientSideRowModel.forEachPivotNode(processRow);
            }
            else {
                // n=must be enterprise, so we can just loop through all the nodes
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
                    clientSideRowModel.forEachNodeAfterFilterAndSort(processRow);
                }
                else {
                    rowModel.forEachNode(processRow);
                }
            }
        }
        this.pinnedRowModel.forEachPinnedBottomRow(processRow);
        if (params.customFooter) {
            gridSerializingSession.addCustomContent(params.customFooter);
        }
        function processRow(node) {
            var shouldSkipLowestGroup = skipLowestSingleChildrenGroup && node.leafGroup;
            var shouldSkipCurrentGroup = node.allChildrenCount === 1 && (skipSingleChildrenGroup || shouldSkipLowestGroup);
            if (node.group && (params.skipGroups || shouldSkipCurrentGroup || hideOpenParents)) {
                return;
            }
            if (params.skipFooters && node.footer) {
                return;
            }
            if (params.onlySelected && !node.isSelected()) {
                return;
            }
            if (params.skipPinnedTop && node.rowPinned === 'top') {
                return;
            }
            if (params.skipPinnedBottom && node.rowPinned === 'bottom') {
                return;
            }
            // if we are in pivotMode, then the grid will show the root node only
            // if it's not a leaf group
            var nodeIsRootNode = node.level === -1;
            if (nodeIsRootNode && !node.leafGroup) {
                return;
            }
            var shouldRowBeSkipped = rowSkipper({ node: node, api: api, context: context });
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
        }
        return gridSerializingSession.parse();
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
                name = _this.columnController.getDisplayNameForColumnGroup(columnGroup, 'header');
            }
            gridRowIterator.onColumn(name || '', columnIndex++, columnGroup.getLeafColumns().length - 1);
        });
    };
    __decorate([
        Autowired('displayedGroupCreator')
    ], GridSerializer.prototype, "displayedGroupCreator", void 0);
    __decorate([
        Autowired('columnController')
    ], GridSerializer.prototype, "columnController", void 0);
    __decorate([
        Autowired('rowModel')
    ], GridSerializer.prototype, "rowModel", void 0);
    __decorate([
        Autowired('pinnedRowModel')
    ], GridSerializer.prototype, "pinnedRowModel", void 0);
    __decorate([
        Autowired('selectionController')
    ], GridSerializer.prototype, "selectionController", void 0);
    GridSerializer = __decorate([
        Bean("gridSerializer")
    ], GridSerializer);
    return GridSerializer;
}(BeanStub));
export { GridSerializer };
export var RowType;
(function (RowType) {
    RowType[RowType["HEADER_GROUPING"] = 0] = "HEADER_GROUPING";
    RowType[RowType["HEADER"] = 1] = "HEADER";
    RowType[RowType["BODY"] = 2] = "BODY";
})(RowType || (RowType = {}));
