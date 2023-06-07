var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub, NumberSequence, PostConstruct, RowNode } from "@ag-grid-community/core";
import { BatchRemover } from "./batchRemover";
let GroupStage = class GroupStage extends BeanStub {
    constructor() {
        super(...arguments);
        // we use a sequence variable so that each time we do a grouping, we don't
        // reuse the ids - otherwise the rowRenderer will confuse rowNodes between redraws
        // when it tries to animate between rows.
        this.groupIdSequence = new NumberSequence();
    }
    postConstruct() {
        this.usingTreeData = this.gridOptionsService.isTreeData();
        if (this.usingTreeData) {
            this.getDataPath = this.gridOptionsService.get('getDataPath');
        }
    }
    execute(params) {
        const details = this.createGroupingDetails(params);
        if (details.transactions) {
            this.handleTransaction(details);
        }
        else {
            const afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }
        this.positionLeafsAndGroups(params.changedPath);
        this.orderGroups(details.rootNode);
        this.selectableService.updateSelectableAfterGrouping(details.rootNode);
    }
    positionLeafsAndGroups(changedPath) {
        // we don't do group sorting for tree data
        if (this.usingTreeData) {
            return;
        }
        changedPath.forEachChangedNodeDepthFirst(group => {
            if (group.childrenAfterGroup) {
                const leafNodes = [];
                const groupNodes = [];
                let unbalancedNode;
                group.childrenAfterGroup.forEach(row => {
                    var _a;
                    if (!((_a = row.childrenAfterGroup) === null || _a === void 0 ? void 0 : _a.length)) {
                        leafNodes.push(row);
                    }
                    else {
                        if (row.key === '' && !unbalancedNode) {
                            unbalancedNode = row;
                        }
                        else {
                            groupNodes.push(row);
                        }
                    }
                });
                if (unbalancedNode) {
                    groupNodes.push(unbalancedNode);
                }
                group.childrenAfterGroup = [...leafNodes, ...groupNodes];
            }
        }, false);
    }
    createGroupingDetails(params) {
        const { rowNode, changedPath, rowNodeTransactions, rowNodeOrder } = params;
        const groupedCols = this.usingTreeData ? null : this.columnModel.getRowGroupColumns();
        const details = {
            // someone complained that the parent attribute was causing some change detection
            // to break is some angular add-on - which i never used. taking the parent out breaks
            // a cyclic dependency, hence this flag got introduced.
            includeParents: !this.gridOptionsService.is('suppressParentsInRowNodes'),
            expandByDefault: this.gridOptionsService.getNum('groupDefaultExpanded'),
            groupedCols: groupedCols,
            rootNode: rowNode,
            pivotMode: this.columnModel.isPivotMode(),
            groupedColCount: this.usingTreeData || !groupedCols ? 0 : groupedCols.length,
            rowNodeOrder: rowNodeOrder,
            transactions: rowNodeTransactions,
            // if no transaction, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath
        };
        return details;
    }
    handleTransaction(details) {
        details.transactions.forEach(tran => {
            // we don't allow batch remover for tree data as tree data uses Filler Nodes,
            // and creating/deleting filler nodes needs to be done alongside the node deleting
            // and moving. if we want to Batch Remover working with tree data then would need
            // to consider how Filler Nodes would be impacted (it's possible that it can be easily
            // modified to work, however for now I don't have the brain energy to work it all out).
            const batchRemover = !this.usingTreeData ? new BatchRemover() : undefined;
            // the order here of [add, remove, update] needs to be the same as in ClientSideNodeManager,
            // as the order is important when a record with the same id is added and removed in the same
            // transaction.
            if (_.existsAndNotEmpty(tran.remove)) {
                this.removeNodes(tran.remove, details, batchRemover);
            }
            if (_.existsAndNotEmpty(tran.update)) {
                this.moveNodesInWrongPath(tran.update, details, batchRemover);
            }
            if (_.existsAndNotEmpty(tran.add)) {
                this.insertNodes(tran.add, details, false);
            }
            // must flush here, and not allow another transaction to be applied,
            // as each transaction must finish leaving the data in a consistent state.
            if (batchRemover) {
                const parentsWithChildrenRemoved = batchRemover.getAllParents().slice();
                batchRemover.flush();
                this.removeEmptyGroups(parentsWithChildrenRemoved, details);
            }
        });
        if (details.rowNodeOrder) {
            this.sortChildren(details);
        }
    }
    // this is used when doing delta updates, eg Redux, keeps nodes in right order
    sortChildren(details) {
        details.changedPath.forEachChangedNodeDepthFirst(node => {
            if (!node.childrenAfterGroup) {
                return;
            }
            const didSort = _.sortRowNodesByOrder(node.childrenAfterGroup, details.rowNodeOrder);
            if (didSort) {
                details.changedPath.addParentNode(node);
            }
        }, false, true);
    }
    orderGroups(rootNode) {
        // we don't do group sorting for tree data
        if (this.usingTreeData) {
            return;
        }
        const comparator = this.gridOptionsService.getCallback('initialGroupOrderComparator');
        if (_.exists(comparator)) {
            recursiveSort(rootNode);
        }
        function recursiveSort(rowNode) {
            const doSort = _.exists(rowNode.childrenAfterGroup) &&
                // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
                !rowNode.leafGroup;
            if (doSort) {
                rowNode.childrenAfterGroup.sort((nodeA, nodeB) => comparator({ nodeA, nodeB }));
                rowNode.childrenAfterGroup.forEach((childNode) => recursiveSort(childNode));
            }
        }
    }
    getExistingPathForNode(node, details) {
        const res = [];
        // when doing tree data, the node is part of the path,
        // but when doing grid grouping, the node is not part of the path so we start with the parent.
        let pointer = this.usingTreeData ? node : node.parent;
        while (pointer && pointer !== details.rootNode) {
            res.push({
                key: pointer.key,
                rowGroupColumn: pointer.rowGroupColumn,
                field: pointer.field
            });
            pointer = pointer.parent;
        }
        res.reverse();
        return res;
    }
    moveNodesInWrongPath(childNodes, details, batchRemover) {
        childNodes.forEach(childNode => {
            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(childNode.parent);
            }
            const infoToKeyMapper = (item) => item.key;
            const oldPath = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
            const newPath = this.getGroupInfo(childNode, details).map(infoToKeyMapper);
            const nodeInCorrectPath = _.areEqual(oldPath, newPath);
            if (!nodeInCorrectPath) {
                this.moveNode(childNode, details, batchRemover);
            }
        });
    }
    moveNode(childNode, details, batchRemover) {
        this.removeNodesInStages([childNode], details, batchRemover);
        this.insertOneNode(childNode, details, true, batchRemover);
        // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
        // refreshed into the gui.
        // this is needed to kick off the event that rowComp listens to for refresh. this in turn
        // then will get each cell in the row to refresh - which is what we need as we don't know which
        // columns will be displaying the rowNode.key info.
        childNode.setData(childNode.data);
        // we add both old and new parents to changed path, as both will need to be refreshed.
        // we already added the old parent (in calling method), so just add the new parent here
        if (details.changedPath.isActive()) {
            const newParent = childNode.parent;
            details.changedPath.addParentNode(newParent);
        }
    }
    removeNodes(leafRowNodes, details, batchRemover) {
        this.removeNodesInStages(leafRowNodes, details, batchRemover);
        if (details.changedPath.isActive()) {
            leafRowNodes.forEach(rowNode => details.changedPath.addParentNode(rowNode.parent));
        }
    }
    removeNodesInStages(leafRowNodes, details, batchRemover) {
        this.removeNodesFromParents(leafRowNodes, details, batchRemover);
        if (this.usingTreeData) {
            this.postRemoveCreateFillerNodes(leafRowNodes, details);
            // When not TreeData, then removeEmptyGroups is called just before the BatchRemover is flushed.
            // However for TreeData, there is no BatchRemover, so we have to call removeEmptyGroups here.
            const nodeParents = leafRowNodes.map(n => n.parent);
            this.removeEmptyGroups(nodeParents, details);
        }
    }
    forEachParentGroup(details, group, callback) {
        let pointer = group;
        while (pointer && pointer !== details.rootNode) {
            callback(pointer);
            pointer = pointer.parent;
        }
    }
    removeNodesFromParents(nodesToRemove, details, provided) {
        // this method can be called with BatchRemover as optional. if it is missed, we created a local version
        // and flush it at the end. if one is provided, we add to the provided one and it gets flushed elsewhere.
        const batchRemoverIsLocal = provided == null;
        const batchRemoverToUse = provided ? provided : new BatchRemover();
        nodesToRemove.forEach(nodeToRemove => {
            this.removeFromParent(nodeToRemove, batchRemoverToUse);
            // remove from allLeafChildren. we clear down all parents EXCEPT the Root Node, as
            // the ClientSideNodeManager is responsible for the Root Node.
            this.forEachParentGroup(details, nodeToRemove.parent, parentNode => {
                batchRemoverToUse.removeFromAllLeafChildren(parentNode, nodeToRemove);
            });
        });
        if (batchRemoverIsLocal) {
            batchRemoverToUse.flush();
        }
    }
    postRemoveCreateFillerNodes(nodesToRemove, details) {
        nodesToRemove.forEach(nodeToRemove => {
            // if not group, and children are present, need to move children to a group.
            // otherwise if no children, we can just remove without replacing.
            const replaceWithGroup = nodeToRemove.hasChildren();
            if (replaceWithGroup) {
                const oldPath = this.getExistingPathForNode(nodeToRemove, details);
                // because we just removed the userGroup, this will always return new support group
                const newGroupNode = this.findParentForNode(nodeToRemove, oldPath, details);
                // these properties are the ones that will be incorrect in the newly created group,
                // so copy them from the old childNode
                newGroupNode.expanded = nodeToRemove.expanded;
                newGroupNode.allLeafChildren = nodeToRemove.allLeafChildren;
                newGroupNode.childrenAfterGroup = nodeToRemove.childrenAfterGroup;
                newGroupNode.childrenMapped = nodeToRemove.childrenMapped;
                newGroupNode.updateHasChildren();
                newGroupNode.childrenAfterGroup.forEach(rowNode => rowNode.parent = newGroupNode);
            }
        });
    }
    removeEmptyGroups(possibleEmptyGroups, details) {
        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        let checkAgain = true;
        const groupShouldBeRemoved = (rowNode) => {
            // because of the while loop below, it's possible we already moved the node,
            // so double check before trying to remove again.
            const mapKey = this.getChildrenMappedKey(rowNode.key, rowNode.rowGroupColumn);
            const parentRowNode = rowNode.parent;
            const groupAlreadyRemoved = (parentRowNode && parentRowNode.childrenMapped) ?
                !parentRowNode.childrenMapped[mapKey] : true;
            if (groupAlreadyRemoved) {
                // if not linked, then group was already removed
                return false;
            }
            // if still not removed, then we remove if this group is empty
            return !!rowNode.isEmptyRowGroupNode();
        };
        while (checkAgain) {
            checkAgain = false;
            const batchRemover = new BatchRemover();
            possibleEmptyGroups.forEach(possibleEmptyGroup => {
                // remove empty groups
                this.forEachParentGroup(details, possibleEmptyGroup, rowNode => {
                    if (groupShouldBeRemoved(rowNode)) {
                        checkAgain = true;
                        this.removeFromParent(rowNode, batchRemover);
                        // we remove selection on filler nodes here, as the selection would not be removed
                        // from the RowNodeManager, as filler nodes don't exist on the RowNodeManager
                        rowNode.setSelectedParams({ newValue: false, source: 'rowGroupChanged' });
                    }
                });
            });
            batchRemover.flush();
        }
    }
    // removes the node from the parent by:
    // a) removing from childrenAfterGroup (using batchRemover if present, otherwise immediately)
    // b) removing from childrenMapped (immediately)
    // c) setRowTop(null) - as the rowRenderer uses this to know the RowNode is no longer needed
    // d) setRowIndex(null) - as the rowNode will no longer be displayed.
    removeFromParent(child, batchRemover) {
        if (child.parent) {
            if (batchRemover) {
                batchRemover.removeFromChildrenAfterGroup(child.parent, child);
            }
            else {
                _.removeFromArray(child.parent.childrenAfterGroup, child);
                child.parent.updateHasChildren();
            }
        }
        const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        if (child.parent && child.parent.childrenMapped) {
            child.parent.childrenMapped[mapKey] = undefined;
        }
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
        child.setRowIndex(null);
    }
    addToParent(child, parent) {
        const mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        if (parent) {
            const children = parent.childrenMapped != null;
            if (children) {
                parent.childrenMapped[mapKey] = child;
            }
            parent.childrenAfterGroup.push(child);
            parent.updateHasChildren();
        }
    }
    areGroupColsEqual(d1, d2) {
        if (d1 == null || d2 == null || d1.pivotMode !== d2.pivotMode) {
            return false;
        }
        return _.areEqual(d1.groupedCols, d2.groupedCols);
    }
    checkAllGroupDataAfterColsChanged(details) {
        const recurse = (rowNodes) => {
            if (!rowNodes) {
                return;
            }
            rowNodes.forEach(rowNode => {
                const isLeafNode = !this.usingTreeData && !rowNode.group;
                if (isLeafNode) {
                    return;
                }
                const groupInfo = {
                    field: rowNode.field,
                    key: rowNode.key,
                    rowGroupColumn: rowNode.rowGroupColumn
                };
                this.setGroupData(rowNode, groupInfo);
                recurse(rowNode.childrenAfterGroup);
            });
        };
        recurse(details.rootNode.childrenAfterGroup);
    }
    shotgunResetEverything(details, afterColumnsChanged) {
        if (this.noChangeInGroupingColumns(details, afterColumnsChanged)) {
            return;
        }
        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.filterFromSelection((node) => node && !node.group);
        const { rootNode, groupedCols } = details;
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        rootNode.leafGroup = this.usingTreeData ? false : groupedCols.length === 0;
        // we are doing everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};
        rootNode.updateHasChildren();
        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenMapped = rootNode.childrenMapped;
        }
        this.insertNodes(rootNode.allLeafChildren, details, false);
    }
    noChangeInGroupingColumns(details, afterColumnsChanged) {
        let noFurtherProcessingNeeded = false;
        const groupDisplayColumns = this.columnModel.getGroupDisplayColumns();
        const newGroupDisplayColIds = groupDisplayColumns ?
            groupDisplayColumns.map(c => c.getId()).join('-') : '';
        if (afterColumnsChanged) {
            // we only need to redo grouping if doing normal grouping (ie not tree data)
            // and the group cols have changed.
            noFurtherProcessingNeeded = this.usingTreeData || this.areGroupColsEqual(details, this.oldGroupingDetails);
            // if the group display cols have changed, then we need to update rowNode.groupData
            // (regardless of tree data or row grouping)
            if (this.oldGroupDisplayColIds !== newGroupDisplayColIds) {
                this.checkAllGroupDataAfterColsChanged(details);
            }
        }
        this.oldGroupingDetails = details;
        this.oldGroupDisplayColIds = newGroupDisplayColIds;
        return noFurtherProcessingNeeded;
    }
    insertNodes(newRowNodes, details, isMove) {
        newRowNodes.forEach(rowNode => {
            this.insertOneNode(rowNode, details, isMove);
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        });
    }
    insertOneNode(childNode, details, isMove, batchRemover) {
        const path = this.getGroupInfo(childNode, details);
        const parentGroup = this.findParentForNode(childNode, path, details, batchRemover);
        if (!parentGroup.group) {
            console.warn(`AG Grid: duplicate group keys for row data, keys should be unique`, [parentGroup.data, childNode.data]);
        }
        if (this.usingTreeData) {
            this.swapGroupWithUserNode(parentGroup, childNode, isMove);
        }
        else {
            childNode.parent = parentGroup;
            childNode.level = path.length;
            parentGroup.childrenAfterGroup.push(childNode);
            parentGroup.updateHasChildren();
        }
    }
    findParentForNode(childNode, path, details, batchRemover) {
        let nextNode = details.rootNode;
        path.forEach((groupInfo, level) => {
            nextNode = this.getOrCreateNextNode(nextNode, groupInfo, level, details);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes
            if (!(batchRemover === null || batchRemover === void 0 ? void 0 : batchRemover.isRemoveFromAllLeafChildren(nextNode, childNode))) {
                nextNode.allLeafChildren.push(childNode);
            }
            else {
                // if this node is about to be removed, prevent that
                batchRemover === null || batchRemover === void 0 ? void 0 : batchRemover.preventRemoveFromAllLeafChildren(nextNode, childNode);
            }
        });
        return nextNode;
    }
    swapGroupWithUserNode(fillerGroup, userGroup, isMove) {
        userGroup.parent = fillerGroup.parent;
        userGroup.key = fillerGroup.key;
        userGroup.field = fillerGroup.field;
        userGroup.groupData = fillerGroup.groupData;
        userGroup.level = fillerGroup.level;
        // AG-3441 - preserve the existing expanded status of the node if we're moving it, so that
        // you can drag a sub tree from one parent to another without changing its expansion
        if (!isMove) {
            userGroup.expanded = fillerGroup.expanded;
        }
        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        userGroup.leafGroup = fillerGroup.leafGroup;
        // always null for userGroups, as row grouping is not allowed when doing tree data
        userGroup.rowGroupIndex = fillerGroup.rowGroupIndex;
        userGroup.allLeafChildren = fillerGroup.allLeafChildren;
        userGroup.childrenAfterGroup = fillerGroup.childrenAfterGroup;
        userGroup.childrenMapped = fillerGroup.childrenMapped;
        userGroup.sibling = fillerGroup.sibling;
        userGroup.updateHasChildren();
        this.removeFromParent(fillerGroup);
        userGroup.childrenAfterGroup.forEach((rowNode) => rowNode.parent = userGroup);
        this.addToParent(userGroup, fillerGroup.parent);
    }
    getOrCreateNextNode(parentGroup, groupInfo, level, details) {
        const key = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
        let nextNode = parentGroup.childrenMapped ? parentGroup.childrenMapped[key] : undefined;
        if (!nextNode) {
            nextNode = this.createGroup(groupInfo, parentGroup, level, details);
            // attach the new group to the parent
            this.addToParent(nextNode, parentGroup);
        }
        return nextNode;
    }
    createGroup(groupInfo, parent, level, details) {
        const groupNode = new RowNode(this.beans);
        groupNode.group = true;
        groupNode.field = groupInfo.field;
        groupNode.rowGroupColumn = groupInfo.rowGroupColumn;
        this.setGroupData(groupNode, groupInfo);
        // we put 'row-group-' before the group id, so it doesn't clash with standard row id's. we also use 't-' and 'b-'
        // for top pinned and bottom pinned rows.
        groupNode.id = RowNode.ID_PREFIX_ROW_GROUP + this.groupIdSequence.next();
        groupNode.key = groupInfo.key;
        groupNode.level = level;
        groupNode.leafGroup = this.usingTreeData ? false : level === (details.groupedColCount - 1);
        groupNode.allLeafChildren = [];
        // why is this done here? we are not updating the children count as we go,
        // i suspect this is updated in the filter stage
        groupNode.setAllChildrenCount(0);
        groupNode.rowGroupIndex = this.usingTreeData ? null : level;
        groupNode.childrenAfterGroup = [];
        groupNode.childrenMapped = {};
        groupNode.updateHasChildren();
        groupNode.parent = details.includeParents ? parent : null;
        this.setExpandedInitialValue(details, groupNode);
        if (this.gridOptionsService.is('groupIncludeFooter')) {
            groupNode.createFooter();
        }
        return groupNode;
    }
    setGroupData(groupNode, groupInfo) {
        groupNode.groupData = {};
        const groupDisplayCols = this.columnModel.getGroupDisplayColumns();
        groupDisplayCols.forEach(col => {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            const displayGroupForCol = this.usingTreeData || (groupNode.rowGroupColumn ? col.isRowGroupDisplayed(groupNode.rowGroupColumn.getId()) : false);
            if (displayGroupForCol) {
                groupNode.groupData[col.getColId()] = groupInfo.key;
            }
        });
    }
    getChildrenMappedKey(key, rowGroupColumn) {
        if (rowGroupColumn) {
            // grouping by columns
            return rowGroupColumn.getId() + '-' + key;
        }
        // tree data - we don't have rowGroupColumns
        return key;
    }
    setExpandedInitialValue(details, groupNode) {
        // if pivoting the leaf group is never expanded as we do not show leaf rows
        if (details.pivotMode && groupNode.leafGroup) {
            groupNode.expanded = false;
            return;
        }
        // use callback if exists
        const userCallback = this.gridOptionsService.getCallback('isGroupOpenByDefault');
        if (userCallback) {
            const params = {
                rowNode: groupNode,
                field: groupNode.field,
                key: groupNode.key,
                level: groupNode.level,
                rowGroupColumn: groupNode.rowGroupColumn
            };
            groupNode.expanded = userCallback(params) == true;
            return;
        }
        // use expandByDefault if exists
        const { expandByDefault } = details;
        if (details.expandByDefault === -1) {
            groupNode.expanded = true;
            return;
        }
        // otherwise
        groupNode.expanded = groupNode.level < expandByDefault;
    }
    getGroupInfo(rowNode, details) {
        if (this.usingTreeData) {
            return this.getGroupInfoFromCallback(rowNode);
        }
        return this.getGroupInfoFromGroupColumns(rowNode, details);
    }
    getGroupInfoFromCallback(rowNode) {
        const keys = this.getDataPath ? this.getDataPath(rowNode.data) : null;
        if (keys === null || keys === undefined || keys.length === 0) {
            _.doOnce(() => console.warn(`AG Grid: getDataPath() should not return an empty path for data`, rowNode.data), 'groupStage.getGroupInfoFromCallback');
        }
        const groupInfoMapper = (key) => ({ key, field: null, rowGroupColumn: null });
        return keys ? keys.map(groupInfoMapper) : [];
    }
    getGroupInfoFromGroupColumns(rowNode, details) {
        const res = [];
        details.groupedCols.forEach(groupCol => {
            let key = this.valueService.getKeyForNode(groupCol, rowNode);
            let keyExists = key !== null && key !== undefined && key !== '';
            // unbalanced tree and pivot mode don't work together - not because of the grid, it doesn't make
            // mathematical sense as you are building up a cube. so if pivot mode, we put in a blank key where missing.
            // this keeps the tree balanced and hence can be represented as a group.
            const createGroupForEmpty = details.pivotMode || !this.gridOptionsService.is('groupAllowUnbalanced');
            if (createGroupForEmpty && !keyExists) {
                key = '';
                keyExists = true;
            }
            if (keyExists) {
                const item = {
                    key: key,
                    field: groupCol.getColDef().field,
                    rowGroupColumn: groupCol
                };
                res.push(item);
            }
        });
        return res;
    }
};
__decorate([
    Autowired('columnModel')
], GroupStage.prototype, "columnModel", void 0);
__decorate([
    Autowired('selectableService')
], GroupStage.prototype, "selectableService", void 0);
__decorate([
    Autowired('valueService')
], GroupStage.prototype, "valueService", void 0);
__decorate([
    Autowired('beans')
], GroupStage.prototype, "beans", void 0);
__decorate([
    Autowired('selectionService')
], GroupStage.prototype, "selectionService", void 0);
__decorate([
    PostConstruct
], GroupStage.prototype, "postConstruct", null);
GroupStage = __decorate([
    Bean('groupStage')
], GroupStage);
export { GroupStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBTdGFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yb3dHcm91cGluZy9ncm91cFN0YWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBQ0QsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBT1IsY0FBYyxFQUNkLGFBQWEsRUFDYixPQUFPLEVBU1YsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFxQjlDLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVcsU0FBUSxRQUFRO0lBQXhDOztRQWFJLDBFQUEwRTtRQUMxRSxrRkFBa0Y7UUFDbEYseUNBQXlDO1FBQ2pDLG9CQUFlLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztJQTZxQm5ELENBQUM7SUFqcUJXLGFBQWE7UUFDakIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUQsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztTQUNqRTtJQUNMLENBQUM7SUFFTSxPQUFPLENBQUMsTUFBMEI7UUFFckMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRW5ELElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtZQUN0QixJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDbkM7YUFBTTtZQUNILE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixLQUFLLElBQUksQ0FBQztZQUM3RCxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDMUQ7UUFFRCxJ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