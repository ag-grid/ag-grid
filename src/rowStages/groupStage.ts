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
    ChangedPath
} from "ag-grid/main";


@Bean('groupStage')
export class GroupStage implements IRowNodeStage {

    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

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

    public execute(params: StageExecuteParams): void {

        let {rowNode, changedPath, rowNodeTransaction} = params;

        let groupedCols = this.columnController.getRowGroupColumns();
        let expandByDefault: number;

        if (this.gridOptionsWrapper.isGroupSuppressRow()) {
            expandByDefault = -1;
        } else {
            expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        }

        let includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        let isPivot = this.columnController.isPivotMode();

        let isGrouping = groupedCols.length > 0;

        // important not to do transaction if we are not grouping, as otherwise the 'insert index' is ignored.
        // ie, if not grouping, then we just want to shotgun so the rootNode.allLeafChildren gets copied
        // to rootNode.childrenAfterGroup and maintaining order (as delta transaction misses the order).
        let doTransaction = isGrouping && _.exists(rowNodeTransaction);
        if (doTransaction) {
            this.handleTransaction(rowNodeTransaction, changedPath, rowNode, groupedCols, expandByDefault, includeParents, isPivot);
        } else {
            this.shotgunResetEverything(rowNode, groupedCols, expandByDefault, includeParents, isPivot);
        }
    }

    private handleTransaction(tran: RowNodeTransaction, changedPath: ChangedPath, rootNode: RowNode, groupedCols: Column[], expandByDefault: number, includeParents: boolean, isPivot: boolean): void {
        if (tran.add) {
            this.insertRowNodesIntoGroups(tran.add, changedPath, rootNode, groupedCols, expandByDefault, includeParents, isPivot);
        }
        if (tran.update) {
            // the InMemoryNodeManager already updated the value, however we
            // need to check the grouping, in case a dimension changed.
            this.checkParents(tran.update, changedPath, rootNode, groupedCols, expandByDefault, includeParents, isPivot);
        }
        if (tran.remove) {
            this.removeRowNodesFromGroups(tran.remove, changedPath, rootNode);
        }
    }

    private checkParents(leafRowNodes: RowNode[], changedPath: ChangedPath, rootNode: RowNode,
                         groupColumns: Column[], expandByDefault: any, includeParents: boolean, isPivot: boolean): void {

        leafRowNodes.forEach( (nodeToPlace: RowNode) => {

            // always add existing parent, as if row is moved, then old parent needs
            // to be recomputed
            if (changedPath) {
                changedPath.addParentNode(nodeToPlace.parent);
            }

            let groupKeys = groupColumns.map( col => this.getKeyForNode(col, nodeToPlace) );

            let parent = nodeToPlace.parent;
            let keysMatch = true;

            groupKeys.forEach( (key: string) => {
                if (parent.key !== key) {
                    keysMatch = false;
                }
                parent = parent.parent;
            });

            if (!keysMatch) {
                this.removeRowNodeFromGroups(nodeToPlace, rootNode);
                this.insertRowNodeIntoGroups(nodeToPlace, rootNode, groupColumns, expandByDefault, includeParents, isPivot);

                // add in new parent
                if (changedPath) {
                    changedPath.addParentNode(nodeToPlace.parent);
                }
            }
        });
    }

    private removeRowNodesFromGroups(leafRowNodes: RowNode[], changedPath: ChangedPath, rootNode: RowNode): void {
        leafRowNodes.forEach( leafToRemove => {
            this.removeRowNodeFromGroups(leafToRemove, rootNode);
            if (changedPath) {
                changedPath.addParentNode(leafToRemove.parent);
            }
        });
    }

    private removeRowNodeFromGroups(leafToRemove: RowNode, rootNode: RowNode): void {

        // step 1 - remove leaf from direct parent
        _.removeFromArray(leafToRemove.parent.childrenAfterGroup, leafToRemove);

        // step 2 - go up the row group hierarchy and:
        //  a) remove from allLeafChildren
        //  b) remove empty groups
        let groupPointer = leafToRemove.parent;
        while (groupPointer !== rootNode) {
            _.removeFromArray(groupPointer.allLeafChildren, leafToRemove);

            let isEmptyGroup = groupPointer.allLeafChildren.length===0;
            if (isEmptyGroup) {
                this.removeGroupFromParent(groupPointer);
            }

            groupPointer = groupPointer.parent;
        }
    }

    private removeGroupFromParent(groupPointer: RowNode) {
        _.removeFromArray(groupPointer.parent.childrenAfterGroup, groupPointer);
        groupPointer.parent.childrenMapped[groupPointer.key] = undefined;
    }

    private shotgunResetEverything(rootNode: RowNode, groupedCols: Column[], expandByDefault: number, includeParents: boolean, isPivot: boolean): void {
        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        rootNode.leafGroup = groupedCols.length === 0;

        // we are going everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};

        this.insertRowNodesIntoGroups(rootNode.allLeafChildren, null, rootNode, groupedCols, expandByDefault, includeParents, isPivot);
    }

    private insertRowNodesIntoGroups(newRowNodes: RowNode[], changedPath: ChangedPath, rootNode: RowNode, groupColumns: Column[], expandByDefault: any, includeParents: boolean, isPivot: boolean): void {
        newRowNodes.forEach( rowNode => {
            this.insertRowNodeIntoGroups(rowNode, rootNode, groupColumns, expandByDefault, includeParents, isPivot);
            if (changedPath) {
                changedPath.addParentNode(rowNode.parent);
            }
        });
    }

    private insertRowNodeIntoGroups(rowNode: RowNode, rootNode: RowNode, groupColumns: Column[], expandByDefault: any, includeParents: boolean, isPivot: boolean): void {
        let nextGroup: RowNode = rootNode;
        groupColumns.forEach( (groupColumn, level) => {
            nextGroup = this.getOrCreateNextGroup(nextGroup, rowNode, groupColumn, expandByDefault, level, includeParents, groupColumns.length, isPivot);
            // node gets added to all group nodes.
            // note: we do not add to rootNode here, as the rootNode is the master list of rowNodes, not impacted by grouping
            nextGroup.allLeafChildren.push(rowNode);
        });
        rowNode.parent = nextGroup;
        rowNode.level = groupColumns.length;
        nextGroup.childrenAfterGroup.push(rowNode);
    }

    private getOrCreateNextGroup(parentGroup: RowNode, nodeToPlace: RowNode, groupColumn: Column, expandByDefault: any,
                                 level: number, includeParents: boolean, numberOfGroupColumns: number, isPivot: boolean): RowNode {
        let groupKey : string = this.getKeyForNode(groupColumn, nodeToPlace);

        let nextGroup = <RowNode> parentGroup.childrenMapped[groupKey];
        if (!nextGroup) {
            nextGroup = this.createSubGroup(groupKey, groupColumn, parentGroup, expandByDefault, level, includeParents, numberOfGroupColumns, isPivot);
            // attach the new group to the parent
            parentGroup.childrenMapped[groupKey] = nextGroup;
            parentGroup.childrenAfterGroup.push(nextGroup);
        }

        return nextGroup;
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

    private createSubGroup(groupKey: string, groupColumn: Column, parent: RowNode, expandByDefault: any, level: number, includeParents: boolean, numberOfGroupColumns: number, isPivot: boolean): RowNode {
        let newGroup = new RowNode();
        this.context.wireBean(newGroup);

        newGroup.group = true;
        newGroup.field = groupColumn.getColDef().field;
        newGroup.rowGroupColumn = groupColumn;
        newGroup.groupData = {};

        let groupDisplayCols: Column[] = this.columnController.getGroupDisplayColumns();

        groupDisplayCols.forEach(col => {
            if (col.isRowGroupDisplayed(newGroup.rowGroupColumn.getId())){
                newGroup.groupData[col.getColId()] = groupKey;
            }
        });

        // we use negative number for the ids of the groups, this makes sure we don't clash with the
        // id's of the leaf nodes.
        newGroup.id = (this.groupIdSequence.next()*-1).toString();
        newGroup.key = groupKey;

        newGroup.level = level;
        newGroup.leafGroup = level === (numberOfGroupColumns-1);

        // if doing pivoting, then the leaf group is never expanded,
        // as we do not show leaf rows
        if (isPivot && newGroup.leafGroup) {
            newGroup.expanded = false;
        } else {
            newGroup.expanded = this.isExpanded(expandByDefault, level);
        }

        newGroup.allLeafChildren = [];
        // why is this done here? we are not updating the children could as we go,
        // i suspect this is updated in the filter stage

        newGroup.setAllChildrenCount(0);
        newGroup.rowGroupIndex = level;

        newGroup.childrenAfterGroup = [];
        newGroup.childrenMapped = {};

        newGroup.parent = includeParents ? parent : null;

        return newGroup;
    }

    private isExpanded(expandByDefault: number, level: number) {
        if (expandByDefault===-1) {
            return true;
        } else {
            return level < expandByDefault;
        }
    }

}
