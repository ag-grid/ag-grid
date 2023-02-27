import {
    _,
    Autowired,
    Bean,
    BeanStub,
    ChangedPath,
    Column,
    ColumnModel,
    GetDataPath,
    IRowNodeStage,
    IsGroupOpenByDefaultParams,
    NumberSequence,
    PostConstruct,
    RowNode,
    RowNodeTransaction,
    SelectableService,
    StageExecuteParams,
    ValueService,
    Beans,
    SelectionService,
    WithoutGridCommon,
    InitialGroupOrderComparatorParams
} from "@ag-grid-community/core";
import { BatchRemover } from "./batchRemover";

interface GroupInfo {
    key: string; // e.g. 'Ireland'
    field: string | null; // e.g. 'country'
    rowGroupColumn: Column | null;
}

interface GroupingDetails {
    pivotMode: boolean;
    includeParents: boolean;
    expandByDefault: number;
    changedPath: ChangedPath;
    rootNode: RowNode;
    groupedCols: Column[];
    groupedColCount: number;
    transactions: RowNodeTransaction[];
    rowNodeOrder: { [id: string]: number; };
}

@Bean('groupStage')
export class GroupStage extends BeanStub implements IRowNodeStage {

    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('selectableService') private selectableService: SelectableService;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('beans') private beans: Beans;
    @Autowired('selectionService') private selectionService: SelectionService;

    // if doing tree data, this is true. we set this at create time - as our code does not
    // cater for the scenario where this is switched on / off dynamically
    private usingTreeData: boolean;
    private getDataPath: GetDataPath | undefined;

    // we use a sequence variable so that each time we do a grouping, we don't
    // reuse the ids - otherwise the rowRenderer will confuse rowNodes between redraws
    // when it tries to animate between rows.
    private groupIdSequence = new NumberSequence();

    // when grouping, these items are of note:
    // rowNode.parent: RowNode: set to the parent
    // rowNode.childrenAfterGroup: RowNode[] = the direct children of this group
    // rowNode.childrenMapped: string=>RowNode = children mapped by group key (when groups) or an empty map if leaf group (this is then used by pivot)
    // for leaf groups, rowNode.childrenAfterGroup = rowNode.allLeafChildren;

    private oldGroupingDetails: GroupingDetails;
    private oldGroupDisplayColIds: string;

    @PostConstruct
    private postConstruct(): void {
        this.usingTreeData = this.gridOptionsService.isTreeData();
        if (this.usingTreeData) {
            this.getDataPath = this.gridOptionsService.get('getDataPath');
        }
    }

    public execute(params: StageExecuteParams): void {

        const details = this.createGroupingDetails(params);

        if (details.transactions) {
            this.handleTransaction(details);
        } else {
            const afterColsChanged = params.afterColumnsChanged === true;
            this.shotgunResetEverything(details, afterColsChanged);
        }

        this.positionLeafsAndGroups(params.changedPath!);
        this.orderGroups(details.rootNode);

        this.selectableService.updateSelectableAfterGrouping(details.rootNode);
    }

    private positionLeafsAndGroups(changedPath: ChangedPath) {
        // we don't do group sorting for tree data
        if (this.usingTreeData) { return; }
        
        changedPath.forEachChangedNodeDepthFirst(group => {
            if (group.childrenAfterGroup) {
                const leafNodes: RowNode[] = [];
                const groupNodes: RowNode[] = [];
                let unbalancedNode: RowNode | undefined;

                group.childrenAfterGroup.forEach(row => {
                    if (!row.childrenAfterGroup?.length) {
                        leafNodes.push(row);
                    } else {
                        if (row.key === '' && !unbalancedNode) {
                            unbalancedNode = row;
                        } else {
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

    private createGroupingDetails(params: StageExecuteParams): GroupingDetails {
        const { rowNode, changedPath, rowNodeTransactions, rowNodeOrder } = params;

        const groupedCols = this.usingTreeData ? null : this.columnModel.getRowGroupColumns();

        const details: GroupingDetails = {
            // someone complained that the parent attribute was causing some change detection
            // to break is some angular add-on - which i never used. taking the parent out breaks
            // a cyclic dependency, hence this flag got introduced.
            includeParents: !this.gridOptionsService.is('suppressParentsInRowNodes'),
            expandByDefault: this.gridOptionsService.getNum('groupDefaultExpanded')!,
            groupedCols: groupedCols!,
            rootNode: rowNode,
            pivotMode: this.columnModel.isPivotMode(),
            groupedColCount: this.usingTreeData || !groupedCols ? 0 : groupedCols.length,
            rowNodeOrder: rowNodeOrder!,
            transactions: rowNodeTransactions!,

            // if no transaction, then it's shotgun, changed path would be 'not active' at this point anyway
            changedPath: changedPath!
        };

        return details;
    }

    private handleTransaction(details: GroupingDetails): void {

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
                this.removeNodes(tran.remove as RowNode[], details, batchRemover);
            }
            if (_.existsAndNotEmpty(tran.update)) {
                this.moveNodesInWrongPath(tran.update as RowNode[], details, batchRemover);
            }
            if (_.existsAndNotEmpty(tran.add)) {
                this.insertNodes(tran.add as RowNode[], details, false);
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
    private sortChildren(details: GroupingDetails): void {
        details.changedPath.forEachChangedNodeDepthFirst(node => {
            if (!node.childrenAfterGroup) {
                return;
            }

            const didSort = _.sortRowNodesByOrder(node.childrenAfterGroup!, details.rowNodeOrder);
            if (didSort) {
                details.changedPath.addParentNode(node);
            }
        }, false, true);
    }

    private orderGroups(rootNode: RowNode): void {
        // we don't do group sorting for tree data
        if (this.usingTreeData) { return; }

        const comparator = this.getInitialGroupOrderComparator();
        if (_.exists(comparator)) { recursiveSort(rootNode); }

        function recursiveSort(rowNode: RowNode): void {
            const doSort = _.exists(rowNode.childrenAfterGroup) &&
                // we only want to sort groups, so we do not sort leafs (a leaf group has leafs as children)
                !rowNode.leafGroup;

            if (doSort) {
                rowNode.childrenAfterGroup!.sort((nodeA, nodeB) => comparator!({ nodeA, nodeB }));
                rowNode.childrenAfterGroup!.forEach((childNode: RowNode) => recursiveSort(childNode));
            }
        }
    }

    private getInitialGroupOrderComparator() {
        const initialGroupOrderComparator = this.gridOptionsService.getCallback('initialGroupOrderComparator');
        if (initialGroupOrderComparator) {
            return initialGroupOrderComparator;
        }
        // this is the deprecated way, so provide a proxy to make it compatible
        const defaultGroupOrderComparator = this.gridOptionsService.get('defaultGroupOrderComparator');
        if (defaultGroupOrderComparator) {
            return (params: WithoutGridCommon<InitialGroupOrderComparatorParams>) => defaultGroupOrderComparator(params.nodeA, params.nodeB);
        }
    }

    private getExistingPathForNode(node: RowNode, details: GroupingDetails): GroupInfo[] {
        const res: GroupInfo[] = [];

        // when doing tree data, the node is part of the path,
        // but when doing grid grouping, the node is not part of the path so we start with the parent.
        let pointer = this.usingTreeData ? node : node.parent;
        while (pointer && pointer !== details.rootNode) {
            res.push({
                key: pointer.key!,
                rowGroupColumn: pointer.rowGroupColumn,
                field: pointer.field
            });
            pointer = pointer.parent;
        }
        res.reverse();
        return res;
    }

    private moveNodesInWrongPath(childNodes: RowNode[], details: GroupingDetails, batchRemover: BatchRemover | undefined): void {
        childNodes.forEach(childNode => {

            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(childNode.parent);
            }

            const infoToKeyMapper = (item: GroupInfo) => item.key;
            const oldPath: string[] = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
            const newPath: string[] = this.getGroupInfo(childNode, details).map(infoToKeyMapper);

            const nodeInCorrectPath = _.areEqual(oldPath, newPath);

            if (!nodeInCorrectPath) {
                this.moveNode(childNode, details, batchRemover);
            }
        });
    }

    private moveNode(childNode: RowNode, details: GroupingDetails, batchRemover: BatchRemover | undefined): void {

        this.removeNodesInStages([childNode], details, batchRemover);
        this.insertOneNode(childNode, details, true);

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

    private removeNodes(leafRowNodes: RowNode[], details: GroupingDetails, batchRemover: BatchRemover | undefined): void {
        this.removeNodesInStages(leafRowNodes, details, batchRemover);
        if (details.changedPath.isActive()) {
            leafRowNodes.forEach(rowNode => details.changedPath.addParentNode(rowNode.parent));
        }
    }

    private removeNodesInStages(leafRowNodes: RowNode[], details: GroupingDetails, batchRemover: BatchRemover | undefined): void {
        this.removeNodesFromParents(leafRowNodes, details, batchRemover);
        if (this.usingTreeData) {
            this.postRemoveCreateFillerNodes(leafRowNodes, details);

            // When not TreeData, then removeEmptyGroups is called just before the BatchRemover is flushed.
            // However for TreeData, there is no BatchRemover, so we have to call removeEmptyGroups here.
            const nodeParents = leafRowNodes.map(n => n.parent!);
            this.removeEmptyGroups(nodeParents, details);
        }
    }

    private forEachParentGroup(details: GroupingDetails, group: RowNode, callback: (parent: RowNode) => void): void {
        let pointer: RowNode | null = group;
        while (pointer && pointer !== details.rootNode) {
            callback(pointer);
            pointer = pointer.parent;
        }
    }

    private removeNodesFromParents(nodesToRemove: RowNode[], details: GroupingDetails, provided: BatchRemover | undefined): void {
        // this method can be called with BatchRemover as optional. if it is missed, we created a local version
        // and flush it at the end. if one is provided, we add to the provided one and it gets flushed elsewhere.
        const batchRemoverIsLocal = provided == null;
        const batchRemoverToUse = provided ? provided : new BatchRemover();

        nodesToRemove.forEach(nodeToRemove => {
            this.removeFromParent(nodeToRemove, batchRemoverToUse);

            // remove from allLeafChildren. we clear down all parents EXCEPT the Root Node, as
            // the ClientSideNodeManager is responsible for the Root Node.
            this.forEachParentGroup(details, nodeToRemove.parent!, parentNode => {
                batchRemoverToUse.removeFromAllLeafChildren(parentNode, nodeToRemove);
            });
        });

        if (batchRemoverIsLocal) {
            batchRemoverToUse.flush();
        }
    }

    private postRemoveCreateFillerNodes(nodesToRemove: RowNode[], details: GroupingDetails): void {
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

                newGroupNode.childrenAfterGroup!.forEach(rowNode => rowNode.parent = newGroupNode);
            }

        });
    }

    private removeEmptyGroups(possibleEmptyGroups: RowNode[], details: GroupingDetails): void {
        // we do this multiple times, as when we remove groups, that means the parent of just removed
        // group can then be empty. to get around this, if we remove, then we check everything again for
        // newly emptied groups. the max number of times this will execute is the depth of the group tree.
        let checkAgain = true;

        const groupShouldBeRemoved = (rowNode: RowNode): boolean => {

            // because of the while loop below, it's possible we already moved the node,
            // so double check before trying to remove again.
            const mapKey = this.getChildrenMappedKey(rowNode.key!, rowNode.rowGroupColumn);
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
            const batchRemover: BatchRemover = new BatchRemover();
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
    private removeFromParent(child: RowNode, batchRemover?: BatchRemover) {
        if (child.parent) {
            if (batchRemover) {
                batchRemover.removeFromChildrenAfterGroup(child.parent, child);
            } else {
                _.removeFromArray(child.parent.childrenAfterGroup!, child);
                child.parent.updateHasChildren();
            }
        }
        const mapKey = this.getChildrenMappedKey(child.key!, child.rowGroupColumn);
        if (child.parent && child.parent.childrenMapped) {
            child.parent.childrenMapped[mapKey] = undefined;
        }
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
        child.setRowIndex(null);
    }

    private addToParent(child: RowNode, parent: RowNode | null) {
        const mapKey = this.getChildrenMappedKey(child.key!, child.rowGroupColumn);
        if (parent) {
            const children = parent.childrenMapped != null;
            if (children) {
                parent.childrenMapped![mapKey] = child;
            }
            parent.childrenAfterGroup!.push(child);
            parent.updateHasChildren();
        }
    }

    private areGroupColsEqual(d1: GroupingDetails, d2: GroupingDetails): boolean {
        if (d1 == null || d2 == null || d1.pivotMode !== d2.pivotMode) { return false; }

        return _.areEqual(d1.groupedCols, d2.groupedCols);
    }

    private checkAllGroupDataAfterColsChanged(details: GroupingDetails): void {

        const recurse = (rowNodes: RowNode[] | null) => {
            if (!rowNodes) { return; }
            rowNodes.forEach(rowNode => {
                const isLeafNode = !this.usingTreeData && !rowNode.group;
                if (isLeafNode) { return; }
                const groupInfo: GroupInfo = {
                    field: rowNode.field,
                    key: rowNode.key!,
                    rowGroupColumn: rowNode.rowGroupColumn
                };
                this.setGroupData(rowNode, groupInfo);
                recurse(rowNode.childrenAfterGroup);
            });
        };

        recurse(details.rootNode.childrenAfterGroup);
    }

    private shotgunResetEverything(details: GroupingDetails, afterColumnsChanged: boolean): void {

        if (this.noChangeInGroupingColumns(details, afterColumnsChanged)) {
            return;
        }

        // groups are about to get disposed, so need to deselect any that are selected
        this.selectionService.removeGroupsFromSelection();

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

    private noChangeInGroupingColumns(details: GroupingDetails, afterColumnsChanged: boolean): boolean {
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

    private insertNodes(newRowNodes: RowNode[], details: GroupingDetails, isMove: boolean): void {
        newRowNodes.forEach(rowNode => {
            this.insertOneNode(rowNode, details, isMove);
            if (details.changedPath.isActive()) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        });
    }

    private insertOneNode(childNode: RowNode, details: GroupingDetails, isMove: boolean): void {

        const path: GroupInfo[] = this.getGroupInfo(childNode, details);

        const parentGroup = this.findParentForNode(childNode, path, details);
        if (!parentGroup.group) {
            console.warn(`AG Grid: duplicate group keys for row data, keys should be unique`,
                [parentGroup.data, childNode.data]);
        }

        if (this.usingTreeData) {
            this.swapGroupWithUserNode(parentGroup, childNode, isMove);
        } else {
            childNode.parent = parentGroup;
            childNode.level = path.length;
            parentGroup.childrenAfterGroup!.push(childNode);
            parentGroup.updateHasChildren();
        }
    }

    private findParentForNode(childNode: RowNode, path: GroupInfo[], details: GroupingDetails): RowNode {
        let nextNode: RowNode = details.rootNode;

        path.forEach((groupInfo, level) => {
            nextNode = this.getOrCreateNextNode(nextNode, groupInfo, level, details);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes
            nextNode.allLeafChildren.push(childNode);
        });

        return nextNode;
    }

    private swapGroupWithUserNode(fillerGroup: RowNode, userGroup: RowNode, isMove: boolean) {
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
        userGroup.updateHasChildren();

        this.removeFromParent(fillerGroup);
        userGroup.childrenAfterGroup!.forEach((rowNode: RowNode) => rowNode.parent = userGroup);
        this.addToParent(userGroup, fillerGroup.parent);
    }

    private getOrCreateNextNode(parentGroup: RowNode, groupInfo: GroupInfo, level: number,
        details: GroupingDetails): RowNode {

        const key = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
        let nextNode = parentGroup.childrenMapped ? parentGroup.childrenMapped[key] : undefined;

        if (!nextNode) {
            nextNode = this.createGroup(groupInfo, parentGroup, level, details);
            // attach the new group to the parent
            this.addToParent(nextNode, parentGroup);
        }

        return nextNode;
    }

    private createGroup(groupInfo: GroupInfo, parent: RowNode, level: number, details: GroupingDetails): RowNode {
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

    private setGroupData(groupNode: RowNode, groupInfo: GroupInfo): void {
        groupNode.groupData = {};
        const groupDisplayCols: Column[] = this.columnModel.getGroupDisplayColumns();
        groupDisplayCols.forEach(col => {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            const displayGroupForCol = this.usingTreeData || (groupNode.rowGroupColumn ? col.isRowGroupDisplayed(groupNode.rowGroupColumn.getId()) : false);
            if (displayGroupForCol) {
                groupNode.groupData![col.getColId()] = groupInfo.key;
            }
        });
    }

    private getChildrenMappedKey(key: string, rowGroupColumn: Column | null): string {
        if (rowGroupColumn) {
            // grouping by columns
            return rowGroupColumn.getId() + '-' + key;
        }
        // tree data - we don't have rowGroupColumns
        return key;
    }

    private setExpandedInitialValue(details: GroupingDetails, groupNode: RowNode): void {
        // if pivoting the leaf group is never expanded as we do not show leaf rows
        if (details.pivotMode && groupNode.leafGroup) {
            groupNode.expanded = false;
            return;
        }

        // use callback if exists
        const userCallback = this.gridOptionsService.getCallback('isGroupOpenByDefault');
        if (userCallback) {
            const params: WithoutGridCommon<IsGroupOpenByDefaultParams> = {
                rowNode: groupNode,
                field: groupNode.field!,
                key: groupNode.key!,
                level: groupNode.level,
                rowGroupColumn: groupNode.rowGroupColumn!
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

    private getGroupInfo(rowNode: RowNode, details: GroupingDetails): GroupInfo[] {
        if (this.usingTreeData) {
            return this.getGroupInfoFromCallback(rowNode);
        }
        return this.getGroupInfoFromGroupColumns(rowNode, details);
    }

    private getGroupInfoFromCallback(rowNode: RowNode): GroupInfo[] {
        const keys: string[] | null = this.getDataPath ? this.getDataPath(rowNode.data) : null;

        if (keys === null || keys === undefined || keys.length === 0) {
            _.doOnce(
                () => console.warn(`AG Grid: getDataPath() should not return an empty path for data`, rowNode.data),
                'groupStage.getGroupInfoFromCallback'
            );
        }
        const groupInfoMapper = (key: string | null) => ({ key, field: null, rowGroupColumn: null }) as GroupInfo;
        return keys ? keys.map(groupInfoMapper) : [];
    }

    private getGroupInfoFromGroupColumns(rowNode: RowNode, details: GroupingDetails) {
        const res: GroupInfo[] = [];
        details.groupedCols.forEach(groupCol => {
            let key: string = this.valueService.getKeyForNode(groupCol, rowNode);
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
                } as GroupInfo;
                res.push(item);
            }
        });
        return res;
    }
}
