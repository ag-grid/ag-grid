var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, PostConstruct, RowNode } from "@ag-grid-community/core";
export const GROUP_MISSING_KEY_ID = 'ag-Grid-MissingKey';
let BlockUtils = class BlockUtils extends BeanStub {
    postConstruct() {
        this.rowHeight = this.gridOptionsService.getRowHeightAsNumber();
        this.usingTreeData = this.gridOptionsService.isTreeData();
        this.usingMasterDetail = this.gridOptionsService.isMasterDetail();
    }
    createRowNode(params) {
        const rowNode = new RowNode(this.beans);
        const rowHeight = params.rowHeight != null ? params.rowHeight : this.rowHeight;
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
    }
    destroyRowNodes(rowNodes) {
        if (rowNodes) {
            rowNodes.forEach((row) => this.destroyRowNode(row));
        }
    }
    destroyRowNode(rowNode, preserveStore = false) {
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
    }
    setTreeGroupInfo(rowNode) {
        rowNode.updateHasChildren();
        const getKeyFunc = this.gridOptionsService.get('getServerSideGroupKey');
        if (rowNode.hasChildren() && getKeyFunc != null) {
            rowNode.key = getKeyFunc(rowNode.data);
        }
        if (!rowNode.hasChildren() && rowNode.childStore != null) {
            this.destroyBean(rowNode.childStore);
            rowNode.childStore = null;
            rowNode.expanded = false;
        }
    }
    setRowGroupInfo(rowNode) {
        rowNode.key = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
        if (rowNode.key === null || rowNode.key === undefined) {
            _.doOnce(() => {
                console.warn(`AG Grid: null and undefined values are not allowed for server side row model keys`);
                if (rowNode.rowGroupColumn) {
                    console.warn(`column = ${rowNode.rowGroupColumn.getId()}`);
                }
                console.warn(`data is `, rowNode.data);
            }, 'ServerSideBlock-CannotHaveNullOrUndefinedForKey');
        }
        if (this.beans.gridOptionsService.is('groupIncludeFooter')) {
            rowNode.createFooter();
            if (rowNode.sibling) {
                rowNode.sibling.uiLevel = rowNode.uiLevel + 1;
            }
        }
    }
    setMasterDetailInfo(rowNode) {
        const isMasterFunc = this.gridOptionsService.get('isRowMaster');
        if (isMasterFunc != null) {
            rowNode.master = isMasterFunc(rowNode.data);
        }
        else {
            rowNode.master = true;
        }
    }
    updateDataIntoRowNode(rowNode, data) {
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
    }
    setDataIntoRowNode(rowNode, data, defaultId, cachedRowHeight) {
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
    }
    setChildCountIntoRowNode(rowNode) {
        const getChildCount = this.gridOptionsService.get('getChildCount');
        if (getChildCount) {
            rowNode.setAllChildrenCount(getChildCount(rowNode.data));
        }
    }
    setGroupDataIntoRowNode(rowNode) {
        const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        const usingTreeData = this.gridOptionsService.isTreeData();
        groupDisplayCols.forEach(col => {
            if (rowNode.groupData == null) {
                rowNode.groupData = {};
            }
            if (usingTreeData) {
                rowNode.groupData[col.getColId()] = rowNode.key;
            }
            else if (col.isRowGroupDisplayed(rowNode.rowGroupColumn.getId())) {
                const groupValue = this.valueService.getValue(rowNode.rowGroupColumn, rowNode);
                rowNode.groupData[col.getColId()] = groupValue;
            }
        });
    }
    clearDisplayIndex(rowNode) {
        rowNode.clearRowTopAndRowIndex();
        const hasChildStore = rowNode.hasChildren() && _.exists(rowNode.childStore);
        if (hasChildStore) {
            const childStore = rowNode.childStore;
            childStore.clearDisplayIndexes();
        }
        const hasDetailNode = rowNode.master && rowNode.detailNode;
        if (hasDetailNode) {
            rowNode.detailNode.clearRowTopAndRowIndex();
        }
    }
    setDisplayIndex(rowNode, displayIndexSeq, nextRowTop) {
        // set this row
        rowNode.setRowIndex(displayIndexSeq.next());
        rowNode.setRowTop(nextRowTop.value);
        nextRowTop.value += rowNode.rowHeight;
        // set child for master / detail
        const hasDetailRow = rowNode.master;
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
        const hasChildStore = rowNode.hasChildren() && _.exists(rowNode.childStore);
        if (hasChildStore) {
            const childStore = rowNode.childStore;
            if (rowNode.expanded) {
                childStore.setDisplayIndexes(displayIndexSeq, nextRowTop);
            }
            else {
                // we need to clear the row tops, as the row renderer depends on
                // this to know if the row should be faded out
                childStore.clearDisplayIndexes();
            }
        }
    }
    binarySearchForDisplayIndex(displayRowIndex, rowNodes) {
        let bottomPointer = 0;
        let topPointer = rowNodes.length - 1;
        if (_.missing(topPointer) || _.missing(bottomPointer)) {
            console.warn(`AG Grid: error: topPointer = ${topPointer}, bottomPointer = ${bottomPointer}`);
            return undefined;
        }
        while (true) {
            const midPointer = Math.floor((bottomPointer + topPointer) / 2);
            const currentRowNode = rowNodes[midPointer];
            // first check current row for index
            if (currentRowNode.rowIndex === displayRowIndex) {
                return currentRowNode;
            }
            // then check if current row contains a detail row with the index
            const expandedMasterRow = currentRowNode.master && currentRowNode.expanded;
            const detailNode = currentRowNode.detailNode;
            if (expandedMasterRow && detailNode && detailNode.rowIndex === displayRowIndex) {
                return currentRowNode.detailNode;
            }
            // then check if child cache contains index
            const childStore = currentRowNode.childStore;
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
                console.warn(`AG Grid: error: unable to locate rowIndex = ${displayRowIndex} in cache`);
                return undefined;
            }
        }
    }
    extractRowBounds(rowNode, index) {
        const extractRowBounds = (currentRowNode) => ({
            rowHeight: currentRowNode.rowHeight,
            rowTop: currentRowNode.rowTop
        });
        if (rowNode.rowIndex === index) {
            return extractRowBounds(rowNode);
        }
        if (rowNode.hasChildren() && rowNode.expanded && _.exists(rowNode.childStore)) {
            const childStore = rowNode.childStore;
            if (childStore.isDisplayIndexInStore(index)) {
                return childStore.getRowBounds(index);
            }
        }
        else if (rowNode.master && rowNode.expanded && _.exists(rowNode.detailNode)) {
            if (rowNode.detailNode.rowIndex === index) {
                return extractRowBounds(rowNode.detailNode);
            }
        }
    }
    getIndexAtPixel(rowNode, pixel) {
        // first check if pixel is in range of current row
        if (rowNode.isPixelInRange(pixel)) {
            return rowNode.rowIndex;
        }
        // then check if current row contains a detail row with pixel in range
        const expandedMasterRow = rowNode.master && rowNode.expanded;
        const detailNode = rowNode.detailNode;
        if (expandedMasterRow && detailNode && detailNode.isPixelInRange(pixel)) {
            return rowNode.detailNode.rowIndex;
        }
        // then check if it's a group row with a child cache with pixel in range
        if (rowNode.hasChildren() && rowNode.expanded && _.exists(rowNode.childStore)) {
            const childStore = rowNode.childStore;
            if (childStore.isPixelInRange(pixel)) {
                return childStore.getRowIndexAtPixel(pixel);
            }
        }
        return null;
        // pixel is not within this row node or it's children / detail, so return undefined
    }
    createNodeIdPrefix(parentRowNode) {
        const parts = [];
        let rowNode = parentRowNode;
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
    }
    checkOpenByDefault(rowNode) {
        if (!rowNode.isExpandable()) {
            return;
        }
        const userFunc = this.gridOptionsService.getCallback('isServerSideGroupOpenByDefault');
        if (!userFunc) {
            return;
        }
        const params = {
            data: rowNode.data,
            rowNode
        };
        const userFuncRes = userFunc(params);
        if (userFuncRes) {
            // we do this in a timeout, so that we don't expand a row node while in the middle
            // of setting up rows, setting up rows is complex enough without another chunk of work
            // getting added to the call stack. this is also helpful as openByDefault may or may
            // not happen (so makes setting up rows more deterministic by expands never happening)
            // and also checkOpenByDefault is shard with both store types, so easier control how it
            // impacts things by keeping it in new VM turn.
            window.setTimeout(() => rowNode.setExpanded(true), 0);
        }
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
export { BlockUtils };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9zZXJ2ZXJTaWRlUm93TW9kZWwvYmxvY2tzL2Jsb2NrVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFHRCxTQUFTLEVBQ1QsSUFBSSxFQUNKLFFBQVEsRUFHUixhQUFhLEVBQ2IsT0FBTyxFQU1WLE1BQU0seUJBQXlCLENBQUM7QUFHakMsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQXlCLG9CQUFvQixDQUFDO0FBRy9FLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVcsU0FBUSxRQUFRO0lBWTVCLGFBQWE7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUNoRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3RFLENBQUM7SUFFTSxhQUFhLENBQUMsTUFHcEI7UUFFRyxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFeEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDL0UsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVoQyxPQUFPLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ3JDLE9BQU8sQ0FBQyxLQUFLLEdBQUcs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