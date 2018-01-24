import {
    _,
    Autowired,
    Bean,
    Column,
    ColumnController,
    Context,
    EventService,
    GridOptionsWrapper,
    IRowNodeStage,
    NumberSequence,
    RowNode,
    RowNodeTransaction,
    SelectionController,
    StageExecuteParams,
    ValueService,
    ChangedPath,
    GetDataPath,
    PostConstruct
} from "ag-grid/main";

interface GroupInfo {
    key: string; // e.g. 'Ireland'
    field: string; // e.g. 'country'
    rowGroupColumn: Column
}

interface GroupingDetails {
    pivotMode: boolean;
    includeParents: boolean;
    expandByDefault: number;
    changedPath: ChangedPath;
    rootNode: RowNode;
    groupedCols: Column[];
    groupedColCount: number;
    transaction: RowNodeTransaction;
    rowNodeOrder: {[id: string]: number};
}

@Bean('groupStage')
export class GroupStage implements IRowNodeStage {

    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    // if doing tree data, this is true. we set this at create time - as our code does not
    // cater for the scenario where this is switched on / off dynamically
    private usingTreeData: boolean;
    private getDataPath: GetDataPath;

    // we use a sequence variable so that each time we do a grouping, we don't
    // reuse the ids - otherwise the rowRenderer will confuse rowNodes between redraws
    // when it tries to animate between rows. we set to -1 as others row id 0 will be shared
    // with the other rows.
    private groupIdSequence = new NumberSequence(1);

    // when grouping, these items are of note:
    // rowNode.parent: RowNode: set to the parent
    // rowNode.childrenAfterGroup: RowNode[] = the direct children of this group
    // rowNode.childrenMapped: string=>RowNode = children mapped by group key (when groups) or an empty map if leaf group (this is then used by pivot)
    // for leaf groups, rowNode.childrenAfterGroup = rowNode.allLeafChildren;

    @PostConstruct
    private postConstruct(): void {
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
        if (this.usingTreeData) {
            this.getDataPath = this.gridOptionsWrapper.getDataPathFunc();
            if (_.missing(this.getDataPath)) {
                console.warn('ag-Grid: property usingTreeData=true, but you did not provide getDataPath function, please provide getDataPath function if using tree data.')
            }
        }
    }

    public execute(params: StageExecuteParams): void {

        let details = this.createGroupingDetails(params);

        if (details.transaction) {
            this.handleTransaction(details);
        } else {
            this.shotgunResetEverything(details);
        }
    }

    private createGroupingDetails(params: StageExecuteParams): GroupingDetails {
        let {rowNode, changedPath, rowNodeTransaction, rowNodeOrder} = params;

        let groupedCols = this.usingTreeData ? null : this.columnController.getRowGroupColumns();
        let isGrouping = this.usingTreeData || groupedCols.length > 0;
        let usingTransaction = isGrouping && _.exists(rowNodeTransaction);

        let details = <GroupingDetails> {
            // someone complained that the parent attribute was causing some change detection
            // to break is some angular add-on - which i never used. taking the parent out breaks
            // a cyclic dependency, hence this flag got introduced.
            includeParents: !this.gridOptionsWrapper.isSuppressParentsInRowNodes(),
            expandByDefault: this.gridOptionsWrapper.isGroupSuppressRow() ?
                -1 : this.gridOptionsWrapper.getGroupDefaultExpanded(),
            groupedCols: groupedCols,
            rootNode: rowNode,
            pivotMode: this.columnController.isPivotMode(),
            groupedColCount: this.usingTreeData ? 0 : groupedCols.length,
            rowNodeOrder: rowNodeOrder,

            // important not to do transaction if we are not grouping, as otherwise the 'insert index' is ignored.
            // ie, if not grouping, then we just want to shotgun so the rootNode.allLeafChildren gets copied
            // to rootNode.childrenAfterGroup and maintaining order (as delta transaction misses the order).
            transaction: usingTransaction ? rowNodeTransaction : null,

            // if no transaction, then it's shotgun, so no changed path
            changedPath: usingTransaction ? changedPath : null
        };

        return details;
    }

    private handleTransaction(details: GroupingDetails): void {
        let tran = details.transaction;
        if (tran.add) {
            this.insertNodes(tran.add, details);
        }
        if (tran.update) {
            this.moveNodesInWrongPath(tran.update, details);
        }
        if (tran.remove) {
            this.removeNodes(tran.remove, details);
        }
        if (details.rowNodeOrder) {
            this.recursiveSortChildren(details.rootNode, details);
        }
    }

    // this is used when doing delta updates, eg Redux, keeps nodes in right order
    private recursiveSortChildren(node: RowNode, details: GroupingDetails): void {
        _.sortRowNodesByOrder(node.childrenAfterGroup, details.rowNodeOrder);
        node.childrenAfterGroup.forEach( childNode => {
            if (childNode.childrenAfterGroup) {
                this.recursiveSortChildren(childNode, details)
            }
        } );
    }

    private getExistingPathForNode(node: RowNode, details: GroupingDetails): GroupInfo[] {
        let res: GroupInfo[] = [];

        // when doing tree data, the node is part of the path,
        // but when doing grid grouping, the node is not part of the path so we start with the parent.
        let pointer = this.usingTreeData ? node : node.parent;
        while (pointer !== details.rootNode) {
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

    private moveNodesInWrongPath(childNodes: RowNode[], details: GroupingDetails): void {

        childNodes.forEach( childNode => {

            // we add node, even if parent has not changed, as the data could have
            // changed, hence aggregations will be wrong
            if (details.changedPath) {
                details.changedPath.addParentNode(childNode.parent);
            }

            let infoToKeyMapper = (item: GroupInfo) => item.key;
            let oldPath: string[] = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
            let newPath: string[] = this.getGroupInfo(childNode, details).map(infoToKeyMapper);

            let nodeInCorrectPath = _.compareArrays(oldPath, newPath);

            if (!nodeInCorrectPath) {
                this.moveNode(childNode, details);
            }
        });
    }

    private moveNode(childNode: RowNode, details: GroupingDetails): void {

        this.removeOneNode(childNode, details);
        this.insertOneNode(childNode, details);

        // hack - if we didn't do this, then renaming a tree item (ie changing rowNode.key) wouldn't get
        // refreshed into the gui.
        // this is needed to kick off the event that rowComp listens to for refresh. this in turn
        // then will get each cell in the row to refresh - which is what we need as we don't know which
        // columns will be displaying the rowNode.key info.
        childNode.setData(childNode.data);

        // we add both old and new parents to changed path, as both will need to be refreshed.
        // we already added the old parent (in calling method), so just add the new parent here
        if (details.changedPath) {
            let newParent = childNode.parent;
            details.changedPath.addParentNode(newParent);
        }
    }

    private removeNodes(leafRowNodes: RowNode[], details: GroupingDetails): void {
        leafRowNodes.forEach( leafToRemove => {
            this.removeOneNode(leafToRemove, details);
            if (details.changedPath) {
                details.changedPath.addParentNode(leafToRemove.parent);
            }
        });
    }

    private removeOneNode(childNode: RowNode, details: GroupingDetails): void {

        // utility func to execute once on each parent node
        let forEachParentGroup = ( callback:  (parent: RowNode)=>void ) => {
            let pointer = childNode.parent;
            while (pointer !== details.rootNode) {
                callback(pointer);
                pointer = pointer.parent;
            }
        };

        // remove leaf from direct parent
        this.removeFromParent(childNode);

        // remove from allLeafChildren
        forEachParentGroup(parentNode => _.removeFromArray(parentNode.allLeafChildren, childNode));

        // if not group, and children are present, need to move children to a group.
        // otherwise if no children, we can just remove without replacing.
        let replaceWithGroup = childNode.hasChildren();
        if (replaceWithGroup) {
            let oldPath = this.getExistingPathForNode(childNode, details);
            // because we just removed the userGroup, this will always return new support group
            let newGroupNode = this.findParentForNode(childNode, oldPath, details);

            // these properties are the ones that will be incorrect in the newly created group,
            // so copy them form the old childNode
            newGroupNode.expanded = childNode.expanded;
            newGroupNode.allLeafChildren = childNode.allLeafChildren;
            newGroupNode.childrenAfterGroup = childNode.childrenAfterGroup;
            newGroupNode.childrenMapped = childNode.childrenMapped;

            newGroupNode.childrenAfterGroup.forEach( rowNode => rowNode.parent = newGroupNode);
        }

        // remove empty groups
        forEachParentGroup( node => {
            if (node.isEmptyFillerNode()) {
                this.removeFromParent(node);
                // we remove selection on filler nodes here, as the selection would not be removed
                // from the RowNodeManager, as filler nodes don't exist on teh RowNodeManager
                node.setSelected(false);
            }
        });
    }

    private removeFromParent(child: RowNode) {
        _.removeFromArray(child.parent.childrenAfterGroup, child);
        let mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        child.parent.childrenMapped[mapKey] = undefined;
        // this is important for transition, see rowComp removeFirstPassFuncs. when doing animation and
        // remove, if rowTop is still present, the rowComp thinks it's just moved position.
        child.setRowTop(null);
    }

    private addToParent(child: RowNode, parent: RowNode) {
        let mapKey = this.getChildrenMappedKey(child.key, child.rowGroupColumn);
        parent.childrenMapped[mapKey] = child;
        parent.childrenAfterGroup.push(child);
    }

    private shotgunResetEverything(details: GroupingDetails): void {
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        details.rootNode.leafGroup = this.usingTreeData ? false : details.groupedCols.length === 0;

        // we are going everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        details.rootNode.childrenAfterGroup = [];
        details.rootNode.childrenMapped = {};

        this.insertNodes(details.rootNode.allLeafChildren, details);
    }

    private insertNodes(newRowNodes: RowNode[], details: GroupingDetails): void {
        newRowNodes.forEach( rowNode => {
            this.insertOneNode(rowNode, details);
            if (details.changedPath) {
                details.changedPath.addParentNode(rowNode.parent);
            }
        });
    }

    private insertOneNode(childNode: RowNode, details: GroupingDetails): void {

        let path: GroupInfo[] = this.getGroupInfo(childNode, details);

        let parentGroup = this.findParentForNode(childNode, path, details);

        if (!parentGroup.group) {
            console.warn(`ag-Grid: duplicate group keys for row data, keys should be unique`,
                [parentGroup.data, childNode.data]);
        }

        if (this.usingTreeData) {
            this.swapGroupWithUserNode(parentGroup, childNode);
        } else {
            childNode.parent = parentGroup;
            childNode.level = path.length;
            parentGroup.childrenAfterGroup.push(childNode);
        }
    }

    private findParentForNode(childNode: RowNode, path: GroupInfo[], details: GroupingDetails): RowNode {
        let nextNode: RowNode = details.rootNode;

        path.forEach( (groupInfo, level) => {
            nextNode = this.getOrCreateNextNode(nextNode, groupInfo, level, details);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes
            nextNode.allLeafChildren.push(childNode);
        });

        return nextNode;
    }

    private swapGroupWithUserNode(fillerGroup: RowNode, userGroup: RowNode) {
        userGroup.parent = fillerGroup.parent;
        userGroup.key = fillerGroup.key;
        userGroup.field = fillerGroup.field;
        userGroup.groupData = fillerGroup.groupData;
        userGroup.level = fillerGroup.level;
        userGroup.expanded = fillerGroup.expanded;

        // we set .leafGroup to false for tree data, as .leafGroup is only used when pivoting, and pivoting
        // isn't allowed with treeData, so the grid never actually use .leafGroup when doing treeData.
        userGroup.leafGroup = fillerGroup.leafGroup;

        // always null for userGroups, as row grouping is not allowed when doing tree data
        userGroup.rowGroupIndex = fillerGroup.rowGroupIndex;

        userGroup.allLeafChildren = fillerGroup.allLeafChildren;
        userGroup.childrenAfterGroup = fillerGroup.childrenAfterGroup;
        userGroup.childrenMapped = fillerGroup.childrenMapped;

        this.removeFromParent(fillerGroup);
        userGroup.childrenAfterGroup.forEach( rowNode => rowNode.parent = userGroup);
        this.addToParent(userGroup, fillerGroup.parent);
    }

    private getOrCreateNextNode(parentGroup: RowNode, groupInfo: GroupInfo, level: number,
                                details: GroupingDetails): RowNode {

        let mapKey = this.getChildrenMappedKey(groupInfo.key, groupInfo.rowGroupColumn);
        let nextNode = <RowNode> parentGroup.childrenMapped[mapKey];
        if (!nextNode) {
            nextNode = this.createGroup(groupInfo, parentGroup, level, details);
            // attach the new group to the parent
            this.addToParent(nextNode, parentGroup);
        }

        return nextNode;
    }

    private createGroup(groupInfo: GroupInfo, parent: RowNode, level: number, details: GroupingDetails): RowNode {
        let groupNode = new RowNode();
        this.context.wireBean(groupNode);

        groupNode.group = true;
        groupNode.field = groupInfo.field;
        groupNode.rowGroupColumn = groupInfo.rowGroupColumn;
        groupNode.groupData = {};

        let groupDisplayCols: Column[] = this.columnController.getGroupDisplayColumns();

        groupDisplayCols.forEach(col => {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            let displayGroupForCol = this.usingTreeData || col.isRowGroupDisplayed(groupNode.rowGroupColumn.getId());
            if (displayGroupForCol) {
                groupNode.groupData[col.getColId()] = groupInfo.key;
            }
        });

        // we use negative number for the ids of the groups, this makes sure we don't clash with the
        // id's of the leaf nodes.
        groupNode.id = (this.groupIdSequence.next()*-1).toString();
        groupNode.key = groupInfo.key;

        groupNode.level = level;
        groupNode.leafGroup = this.usingTreeData ? false : level === (details.groupedColCount-1);

        // if doing pivoting, then the leaf group is never expanded,
        // as we do not show leaf rows
        if (details.pivotMode && groupNode.leafGroup) {
            groupNode.expanded = false;
        } else {
            groupNode.expanded = this.isExpanded(details.expandByDefault, level);
        }

        groupNode.allLeafChildren = [];
        // why is this done here? we are not updating the children could as we go,
        // i suspect this is updated in the filter stage

        groupNode.setAllChildrenCount(0);

        groupNode.rowGroupIndex = this.usingTreeData ? null : level;

        groupNode.childrenAfterGroup = [];
        groupNode.childrenMapped = {};

        groupNode.parent = details.includeParents ? parent : null;

        return groupNode;
    }

    private getChildrenMappedKey(key: string, rowGroupColumn: Column): string {
        if (rowGroupColumn) {
            // grouping by columns
            return rowGroupColumn.getId() + '-' + key;
        } else {
            // tree data - we don't have rowGroupColumns
            return key;
        }
    }

    private isExpanded(expandByDefault: number, level: number) {
        if (expandByDefault===-1) {
            return true;
        } else {
            return level < expandByDefault;
        }
    }

    private getGroupInfo(rowNode: RowNode, details: GroupingDetails): GroupInfo[] {
        if (this.usingTreeData) {
            return this.getGroupInfoFromCallback(rowNode);
        } else {
            return this.getGroupInfoFromGroupColumns(rowNode, details);
        }
    }

    private getGroupInfoFromCallback(rowNode: RowNode) : GroupInfo[] {
        let keys: string[] = this.getDataPath(rowNode.data);
        if (keys===null || keys===undefined || keys.length===0) {
            _.doOnce(
                () => console.warn(`getDataPath() should not return an empty path for data`, rowNode.data),
                'groupStage.getGroupInfoFromCallback'
            );
        }
        let groupInfoMapper = (key: string) => <GroupInfo> {key: key, field: null, rowGroupColumn: null};
        return keys ? keys.map(groupInfoMapper) : [];
    }

    private getGroupInfoFromGroupColumns(rowNode: RowNode, details: GroupingDetails) {
        let res: GroupInfo[] = [];
        details.groupedCols.forEach( groupCol => {
            let key: string = this.valueService.getKeyForNode(groupCol, rowNode);
            let keyExists = key!==null && key!==undefined;

            // unbalanced tree and pivot mode don't work together - not because of the grid, it doesn't make
            // mathematical sense as you are building up a cube. so if pivot mode, we put in a blank key where missing.
            // this keeps the tree balanced and hence can be represented as a group.
            if (details.pivotMode && !keyExists) {
                key = ' ';
                keyExists = true;
            }

            if (keyExists) {
                let item = <GroupInfo> {
                    key: key,
                    field: groupCol.getColDef().field,
                    rowGroupColumn: groupCol
                };
                res.push(item);
            }
        });
        return res;
    }

}