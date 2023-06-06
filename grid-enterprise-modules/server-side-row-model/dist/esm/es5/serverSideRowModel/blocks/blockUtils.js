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
import { _, Autowired, Bean, BeanStub, PostConstruct, RowNode } from "@ag-grid-community/core";
export var GROUP_MISSING_KEY_ID = 'ag-Grid-MissingKey';
var BlockUtils = /** @class */ (function (_super) {
    __extends(BlockUtils, _super);
    function BlockUtils() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockUtils.prototype.postConstruct = function () {
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.usingMasterDetail = this.gridOptionsService.isMasterDetail();
    };
    BlockUtils.prototype.createRowNode = function (params) {
        var rowNode = new RowNode(this.beans);
        var rowHeight = params.rowHeight != null ? params.rowHeight : this.rowHeight;
        rowNode.setRowHeight(rowHeight);
        rowNode.group = params.group;
        rowNode.leafGroup = params.leafGroup;
        rowNode.level = params.level;
        rowNode.uiLevel = params.level;
        rowNode.parent = params.parent;
        // stub gets set to true here, and then false when this rowNode gets it's data
        rowNode.stub = true;
        rowNode.__needsRefreshWhenVisible = false;
        if (rowNode.group) {
            rowNode.expanded = false;
            rowNode.field = params.field;
            rowNode.rowGroupColumn = params.rowGroupColumn;
        }
        return rowNode;
    };
    BlockUtils.prototype.destroyRowNodes = function (rowNodes) {
        var _this = this;
        if (rowNodes) {
            rowNodes.forEach(function (row) { return _this.destroyRowNode(row); });
        }
    };
    BlockUtils.prototype.destroyRowNode = function (rowNode, preserveStore) {
        if (preserveStore === void 0) { preserveStore = false; }
        if (rowNode.childStore && !preserveStore) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
        }
        if (rowNode.sibling) {
            this.destroyRowNode(rowNode.sibling, false);
        }
        // this is needed, so row render knows to fade out the row, otherwise it
        // sees row top is present, and thinks the row should be shown. maybe
        // rowNode should have a flag on whether it is visible???
        rowNode.clearRowTopAndRowIndex();
        if (rowNode.id != null) {
            this.nodeManager.removeNode(rowNode);
        }
    };
    BlockUtils.prototype.setTreeGroupInfo = function (rowNode) {
        rowNode.updateHasChildren();
        var getKeyFunc = this.gridOptionsService.get('getServerSideGroupKey');
        if (rowNode.hasChildren() && getKeyFunc != null) {
            rowNode.key = getKeyFunc(rowNode.data);
        }
        if (!rowNode.hasChildren() && rowNode.childStore != null) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
            rowNode.expanded = false;
        }
    };
    BlockUtils.prototype.setRowGroupInfo = function (rowNode) {
        rowNode.key = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
        if (rowNode.key === null || rowNode.key === undefined) {
            _.doOnce(function () {
                console.warn("AG Grid: null and undefined values are not allowed for server side row model keys");
                if (rowNode.rowGroupColumn) {
                    console.warn("column = " + rowNode.rowGroupColumn.getId());
                }
                console.warn("data is ", rowNode.data);
            }, 'ServerSideBlock-CannotHaveNullOrUndefinedForKey');
        }
        if (this.beans.gridOptionsService.is('groupIncludeFooter')) {
            rowNode.createFooter();
            if (rowNode.sibling) {
                rowNode.sibling.uiLevel = rowNode.uiLevel + 1;
            }
        }
    };
    BlockUtils.prototype.setMasterDetailInfo = function (rowNode) {
        var isMasterFunc = this.gridOptionsService.get('isRowMaster');
        if (isMasterFunc != null) {
            rowNode.master = isMasterFunc(rowNode.data);
        }
        else {
            rowNode.master = true;
        }
    };
    BlockUtils.prototype.updateDataIntoRowNode = function (rowNode, data) {
        rowNode.updateData(data);
        if (this.usingTreeData) {
            this.setTreeGroupInfo(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
        else if (rowNode.group) {
            this.setChildCountIntoRowNode(rowNode);
            // it's not possible for a node to change whether it's a group or not
            // when doing row grouping (as only rows at certain levels are groups),
            // so nothing to do here
        }
        else if (this.usingMasterDetail) {
            // this should be implemented, however it's not the use case i'm currently
            // programming, so leaving for another day. to test this, create an example
            // where whether a master row is expandable or not is dynamic
        }
    };
    BlockUtils.prototype.setDataIntoRowNode = function (rowNode, data, defaultId, cachedRowHeight) {
        var _a;
        rowNode.stub = false;
        if (_.exists(data)) {
            rowNode.setDataAndId(data, defaultId);
            if (this.usingTreeData) {
                this.setTreeGroupInfo(rowNode);
            }
            else if (rowNode.group) {
                this.setRowGroupInfo(rowNode);
            }
            else if (this.usingMasterDetail) {
                this.setMasterDetailInfo(rowNode);
            }
        }
        else {
            rowNode.setDataAndId(undefined, undefined);
            rowNode.key = null;
        }
        if (this.usingTreeData || rowNode.group) {
            this.setGroupDataIntoRowNode(rowNode);
            this.setChildCountIntoRowNode(rowNode);
        }
        // this needs to be done AFTER setGroupDataIntoRowNode(), as the height can depend on the group data
        // getting set, if it's a group node and colDef.autoHeight=true
        if (_.exists(data)) {
            rowNode.setRowHeight(this.gridOptionsService.getRowHeightForNode(rowNode, false, cachedRowHeight).height);
            (_a = rowNode.sibling) === null || _a === void 0 ? void 0 : _a.setRowHeight(this.gridOptionsService.getRowHeightForNode(rowNode.sibling, false, cachedRowHeight).height);
        }
    };
    BlockUtils.prototype.setChildCountIntoRowNode = function (rowNode) {
        var getChildCount = this.gridOptionsService.get('getChildCount');
        if (getChildCount) {
            rowNode.setAllChildrenCount(getChildCount(rowNode.data));
        }
    };
    BlockUtils.prototype.setGroupDataIntoRowNode = function (rowNode) {
        var _this = this;
        var groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        var usingTreeData = this.gridOptionsService.isTreeData();
        groupDisplayCols.forEach(function (col) {
            if (rowNode.groupData == null) {
                rowNode.groupData = {};
            }
            if (usingTreeData) {
                rowNode.groupData[col.getColId()] = rowNode.key;
            }
            else if (col.isRowGroupDisplayed(rowNode.rowGroupColumn.getId())) {
                var groupValue = _this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });
    };
    BlockUtils.prototype.clearDisplayIndex = function (rowNode) {
        rowNode.clearRowTopAndRowIndex();
        var hasChildStore = rowNode.hasChildren() && _.exists(rowNode.childStore);
        if (hasChildStore) {
            var childStore = rowNode.childStore;
            childStore.clearDisplayIndexes();
        }
        var hasDetailNode = rowNode.master && rowNode.detailNode;
        if (hasDetailNode) {
            rowNode.detailNode.clearRowTopAndRowIndex();
        }
    };
    BlockUtils.prototype.setDisplayIndex = function (rowNode, displayIndexSeq, nextRowTop) {
        // set this row
        rowNode.setRowIndex(displayIndexSeq.next());
        rowNode.setRowTop(nextRowTop.value);
        nextRowTop.value += rowNode.rowHeight;
        // set child for master / detail
        var hasDetailRow = rowNode.master;
        if (hasDetailRow) {
            if (rowNode.expanded && rowNode.detailNode) {
                rowNode.detailNode.setRowIndex(displayIndexSeq.next());
                rowNode.detailNode.setRowTop(nextRowTop.value);
                nextRowTop.value += rowNode.detailNode.rowHeight;
            }
            else if (rowNode.detailNode) {
                rowNode.detailNode.clearRowTopAndRowIndex();
            }
        }
        // set children for SSRM child rows
        var hasChildStore = rowNode.hasChildren() && _.exists(rowNode.childStore);
        if (hasChildStore) {
            var childStore = rowNode.childStore;
            if (rowNode.expanded) {
                childStore.setDisplayIndexes(displayIndexSeq, nextRowTop);
            }
            else {
                // we need to clear the row tops, as the row renderer depends on
                // this to know if the row should be faded out
                childStore.clearDisplayIndexes();
            }
        }
    };
    BlockUtils.prototype.binarySearchForDisplayIndex = function (displayRowIndex, rowNodes) {
        var bottomPointer = 0;
        var topPointer = rowNodes.length - 1;
        if (_.missing(topPointer) || _.missing(bottomPointer)) {
            console.warn("AG Grid: error: topPointer = " + topPointer + ", bottomPointer = " + bottomPointer);
            return undefined;
        }
        while (true) {
            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
            var currentRowNode = rowNodes[midPointer];
            // first check current row for index
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }
            // then check if current row contains a detail row with the index
            var expandedMasterRow = currentRowNode.master && currentRowNode.expanded;
            var detailNode = currentRowNode.detailNode;
            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayRowIndex) {
                return currentRowNode.detailNode;
            }
            // then check if child cache contains index
            var childStore = currentRowNode.childStore;
            if (currentRowNode.expanded && childStore && childStore.isDisplayIndexInStore(displayRowIndex)) {
                return childStore.getRowUsingDisplayIndex(displayRowIndex);
            }
            // otherwise adjust pointers to continue searching for index
            if (currentRowNode.rowIndex < displayRowIndex) {
                bottomPointer = midPointer + 1;
            }
            else if (currentRowNode.rowIndex > displayRowIndex) {
                topPointer = midPointer - 1;
            }
            else {
                console.warn("AG Grid: error: unable to locate rowIndex = " + displayRowIndex + " in cache");
                return undefined;
            }
        }
    };
    BlockUtils.prototype.extractRowBounds = function (rowNode, index) {
        var extractRowBounds = function (currentRowNode) { return ({
            rowHeight: currentRowNode.rowHeight,
            rowTop: currentRowNode.rowTop
        }); };
        if (rowNode.rowIndex === index) {
            return extractRowBounds(rowNode);
        }
        if (rowNode.hasChildren() && rowNode.expanded && _.exists(rowNode.childStore)) {
            var childStore = rowNode.childStore;
            if (childStore.isDisplayIndexInStore(index)) {
                return childStore.getRowBounds(index);
            }
        }
        else if (rowNode.master && rowNode.expanded && _.exists(rowNode.detailNode)) {
            if (rowNode.detailNode.rowIndex === index) {
                return extractRowBounds(rowNode.detailNode);
            }
        }
    };
    BlockUtils.prototype.getIndexAtPixel = function (rowNode, pixel) {
        // first check if pixel is in range of current row
        if (rowNode.isPixelInRange(pixel)) {
            return rowNode.rowIndex;
        }
        // then check if current row contains a detail row with pixel in range
        var expandedMasterRow = rowNode.master && rowNode.expanded;
        var detailNode = rowNode.detailNode;
        if (expandedMasterRow && detailNode && detailNode.isPixelInRange(pixel)) {
            return rowNode.detailNode.rowIndex;
        }
        // then check if it's a group row with a child cache with pixel in range
        if (rowNode.hasChildren() && rowNode.expanded && _.exists(rowNode.childStore)) {
            var childStore = rowNode.childStore;
            if (childStore.isPixelInRange(pixel)) {
                return childStore.getRowIndexAtPixel(pixel);
            }
        }
        return null;
        // pixel is not within this row node or it's children / detail, so return undefined
    };
    BlockUtils.prototype.createNodeIdPrefix = function (parentRowNode) {
        var parts = [];
        var rowNode = parentRowNode;
        // pull keys from all parent nodes, but do not include the root node
        while (rowNode && rowNode.level >= 0) {
            if (rowNode.key === '') {
                parts.push(GROUP_MISSING_KEY_ID);
            }
            else {
                parts.push(rowNode.key);
            }
            rowNode = rowNode.parent;
        }
        if (parts.length > 0) {
            return parts.reverse().join('-');
        }
        // no prefix, so node id's are left as they are
        return undefined;
    };
    BlockUtils.prototype.checkOpenByDefault = function (rowNode) {
        if (!rowNode.isExpandable()) {
            return;
        }
        var userFunc = this.gridOptionsService.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return;
        }
        var params = {
            data: rowNode.data,
            rowNode: rowNode
        };
        var userFuncRes = userFunc(params);
        if (userFuncRes) {
            // we do this in a timeout, so that we don't expand a row node while in the middle
            // of setting up rows, setting up rows is complex enough without another chunk of work
            // getting added to the call stack. this is also helpful as openByDefault may or may
            // not happen (so makes setting up rows more deterministic by expands never happening)
            // and also checkOpenByDefault is shard with both store types, so easier control how it
            // impacts things by keeping it in new VM turn.
            window.setTimeout(function () { return rowNode.setExpanded(true); }, 0);
        }
    };
    __decorate([
        Autowired('valueService')
    ], BlockUtils.prototype, "valueService", void 0);
    __decorate([
        Autowired('columnModel')
    ], BlockUtils.prototype, "columnModel", void 0);
    __decorate([
        Autowired('ssrmNodeManager')
    ], BlockUtils.prototype, "nodeManager", void 0);
    __decorate([
        Autowired('beans')
    ], BlockUtils.prototype, "beans", void 0);
    __decorate([
        PostConstruct
    ], BlockUtils.prototype, "postConstruct", null);
    BlockUtils = __decorate([
        Bean('ssrmBlockUtils')
    ], BlockUtils);
    return BlockUtils;
}(BeanStub));
export { BlockUtils };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZXJ2ZXJTaWRlUm93TW9kZWwvYmxvY2tzL2Jsb2NrVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFHRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFHUixhQUFhLEVBQ2IsT0FBTyxFQU1WLE1BQU0seUJBQXlCLENBQUM7QUFHakMsTUFBTSxDQUFDLElBQU0sb0JBQW9CLEdBQXlCLG9CQUFvQixDQUFDO0FBRy9FO0lBQWdDLDhCQUFRO0lBQXhDOztJQXFYQSxDQUFDO0lBeldXLGtDQUFhLEdBQXJCO1FBQ0ksSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3RFLENBQUM7SUFFTSxrQ0FBYSxHQUFwQixVQUFxQixNQUdwQjtRQUVHLElBQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV4QyxJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMvRSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWhDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUM3QixPQUFPLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFD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