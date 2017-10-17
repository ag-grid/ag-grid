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
    GetGroupKeys,
    PostConstruct
} from "ag-grid/main";

interface GroupInfo {
    key: any; // e.g. 'Ireland'
    field: string; // e.g. 'country'
    rowGroupColumn: Column
}

interface GroupingDetails {
    pivot: boolean;
    includeParents: boolean;
    expandByDefault: number;
    changedPath: ChangedPath;
    rootNode: RowNode;
    groupedCols: Column[];
    groupedColCount: number;
    transaction: RowNodeTransaction;
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
    private getGroupKeys: GetGroupKeys;

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
        this.getGroupKeys = this.gridOptionsWrapper.getGroupKeysFunc();
        this.usingTreeData = this.gridOptionsWrapper.isTreeData();
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
        let {rowNode, changedPath, rowNodeTransaction} = params;

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
            pivot: this.columnController.isPivotMode(),
            groupedColCount: this.usingTreeData ? 0 : groupedCols.length,

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

            let infoToKeyMapper = (item: GroupInfo) => item.key;
            let oldPath: string[] = this.getExistingPathForNode(childNode, details).map(infoToKeyMapper);
            let newPath: string[] = this.getGroupInfo(childNode, details.groupedCols).map(infoToKeyMapper);

            let nodeInCorrectPath = _.compareArrays(oldPath, newPath);

            if (!nodeInCorrectPath) {
                this.moveNode(childNode, details);
            }
        });
    }

    private moveNode(childNode: RowNode, details: GroupingDetails): void {
        // we add both old and new parents to changed path, as both will need to be refreshed
        let oldParent = childNode.parent;

        this.removeOneNode(childNode, details);
        this.insertOneNode(childNode, details);

        // add in new parent
        if (details.changedPath) {
            let newParent = childNode.parent;
            details.changedPath.addParentNode(oldParent);
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

        // if not filler group, and children are present, need to move children to new filler group.
        // otherwise if no children, we can just remove without replacing.
        let replaceWithFillerGroup = !childNode.fillerGroup && childNode.childrenAfterGroup.length > 0;
        if (replaceWithFillerGroup) {
            let oldPath = this.getExistingPathForNode(childNode, details);
            // because we just removed the userGroup, this will always return new support group
            let supportGroup = this.getOrCreateGroup(childNode, oldPath, details);

            // these properties are the ones that will be incorrect in the newly created group,
            // so copy them form the old childNode
            supportGroup.expanded = childNode.expanded;
            supportGroup.allLeafChildren = childNode.allLeafChildren;
            supportGroup.childrenAfterGroup = childNode.childrenAfterGroup;
            supportGroup.childrenMapped = childNode.childrenMapped;
        }

        // remove empty groups
        forEachParentGroup( parentNode => {
            let isEmptyGeneratedGroup = parentNode.fillerGroup && parentNode.allLeafChildren.length===0;
            if (isEmptyGeneratedGroup) {
                this.removeFromParent(parentNode);
            }
        });
    }

    private removeFromParent(child: RowNode) {
        _.removeFromArray(child.parent.childrenAfterGroup, child);
        child.parent.childrenMapped[child.key] = undefined;
    }

    private addToParent(child: RowNode, parent: RowNode) {
        parent.childrenMapped[child.key] = child;
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

        let path: GroupInfo[] = this.getGroupInfo(childNode, details.groupedCols);

        let nextGroup = this.getOrCreateGroup(childNode, path, details);

        if (childNode.fillerGroup) {
            childNode.parent = nextGroup;
            childNode.level = path.length;
            nextGroup.childrenAfterGroup.push(childNode);
        } else {
            this.swapFillerWithUserGroup(nextGroup, childNode);
        }
    }

    private getOrCreateGroup(childNode: RowNode, path: GroupInfo[], details: GroupingDetails): RowNode {
        let nextGroup: RowNode = details.rootNode;

        path.forEach( (groupInfo, level) => {
            nextGroup = this.getOrCreateNextGroup(nextGroup, groupInfo, level, details);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes, not impacted by grouping

            // todo - the newRowNode is still in allLeafChildren of the root node - need to check that this is not a problem
            if (childNode.fillerGroup) {
                nextGroup.allLeafChildren.push(childNode);
            }
        });

        return nextGroup;
    }

    private swapFillerWithUserGroup(fillerGroup: RowNode, userGroup: RowNode) {
        if (!fillerGroup.fillerGroup) {
            console.warn(`ag-Grid: duplicate group keys for row data, keys should be unique`,
                [userGroup.data, fillerGroup.data]);
        }
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

    private getOrCreateNextGroup(parentGroup: RowNode, groupInfo: GroupInfo, level: number,
                                 details: GroupingDetails): RowNode {

        let nextGroup = <RowNode> parentGroup.childrenMapped[groupInfo.key];
        if (!nextGroup) {
            nextGroup = this.createSubGroup(groupInfo, parentGroup, level, details);
            // attach the new group to the parent
            this.addToParent(nextGroup, parentGroup);
        }

        return nextGroup;
    }

    private createSubGroup(groupInfo: GroupInfo, parent: RowNode, level: number, details: GroupingDetails): RowNode {
        let newGroup = new RowNode();
        this.context.wireBean(newGroup);

        newGroup.group = true;
        newGroup.fillerGroup = true;
        newGroup.field = groupInfo.field;
        newGroup.rowGroupColumn = groupInfo.rowGroupColumn;
        newGroup.groupData = {};

        let groupDisplayCols: Column[] = this.columnController.getGroupDisplayColumns();

        groupDisplayCols.forEach(col => {
            // newGroup.rowGroupColumn=null when working off GroupInfo, and we always display the group in the group column
            // if rowGroupColumn is present, then it's grid row grouping and we only include if configuration says so
            let displayGroupForCol = this.usingTreeData || col.isRowGroupDisplayed(newGroup.rowGroupColumn.getId());
            if (displayGroupForCol) {
                newGroup.groupData[col.getColId()] = groupInfo.key;
            }
        });

        // we use negative number for the ids of the groups, this makes sure we don't clash with the
        // id's of the leaf nodes.
        newGroup.id = (this.groupIdSequence.next()*-1).toString();
        newGroup.key = groupInfo.key;

        newGroup.level = level;
        newGroup.leafGroup = this.usingTreeData ? false : level === (details.groupedColCount-1);

        // if doing pivoting, then the leaf group is never expanded,
        // as we do not show leaf rows
        if (details.pivot && newGroup.leafGroup) {
            newGroup.expanded = false;
        } else {
            newGroup.expanded = this.isExpanded(details.expandByDefault, level);
        }

        newGroup.allLeafChildren = [];
        // why is this done here? we are not updating the children could as we go,
        // i suspect this is updated in the filter stage

        newGroup.setAllChildrenCount(0);

        newGroup.rowGroupIndex = this.usingTreeData ? null : level;

        newGroup.childrenAfterGroup = [];
        newGroup.childrenMapped = {};

        newGroup.parent = details.includeParents ? parent : null;

        return newGroup;
    }

    private isExpanded(expandByDefault: number, level: number) {
        if (expandByDefault===-1) {
            return true;
        } else {
            return level < expandByDefault;
        }
    }

    private getGroupInfo(rowNode: RowNode, groupColumns: Column[]): GroupInfo[] {
        if (this.usingTreeData) {
            return this.getGroupInfoFromCallback(rowNode);
        } else {
            return this.getGroupInfoFromGroupColumns(rowNode, groupColumns);
        }
    }

    private getGroupInfoFromCallback(rowNode: RowNode) : GroupInfo[] {
        let keys: string[] = this.getGroupKeys(rowNode.data);
        let groupInfoMapper = (key: string) => <GroupInfo> {key: key, field: null, rowGroupColumn: null};
        return keys ? keys.map(groupInfoMapper) : [];
    }

    private getGroupInfoFromGroupColumns(rowNode: RowNode, groupColumns: Column[]) {
        let res: GroupInfo[] = [];
        groupColumns.forEach( groupCol => {
            let key: any = this.getKeyForNode(groupCol, rowNode);
            let keyExists = key!==null && key!==undefined;
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

    private getKeyForNode(groupColumn: Column, rowNode: RowNode): any {
        let value = this.valueService.getValue(groupColumn, rowNode);
        let result: any;
        let keyCreator = groupColumn.getColDef().keyCreator;

        if (keyCreator) {
            result = keyCreator({value: value});
        } else {
            result = value;
        }

        return result;
    }
}