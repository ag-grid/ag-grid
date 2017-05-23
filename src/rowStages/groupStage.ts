import {
    Bean,
    Context,
    IRowNodeStage,
    Autowired,
    SelectionController,
    GridOptionsWrapper,
    ColumnController,
    ValueService,
    EventService,
    StageExecuteParams,
    RowNode,
    Column,
    Utils,
    NumberSequence,
    _
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
        let rootNode = params.rowNode;

        // let newRowNodes = params.newRowNodes;

        let groupedCols = this.columnController.getRowGroupColumns();
        let expandByDefault: number;

        if (this.gridOptionsWrapper.isGroupSuppressRow()) {
            expandByDefault = -1;
        } else {
            expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        }

        let includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
        let isPivot = this.columnController.isPivotMode();

        // because we are not creating the root node each time, we have the logic
        // here to change leafGroup once.
        rootNode.leafGroup = groupedCols.length === 0;

        // we are going everything from scratch, so reset childrenAfterGroup and childrenMapped from the rootNode
        rootNode.childrenAfterGroup = [];
        rootNode.childrenMapped = {};

        this.insertRowNodesIntoGroups(rootNode.allLeafChildren, rootNode, groupedCols, expandByDefault, includeParents, isPivot);

        // this.recursivelySetLevelOnChildren(rootNode, 0);
    }

    // private recursivelySetLevelOnChildren(rowNode: RowNode, level: number): void {
    //     for (let i = 0; i<rowNode.childrenAfterGroup.length; i++) {
    //         let childNode = rowNode.childrenAfterGroup[i];
    //         childNode.level = level;
    //         if (childNode.group) {
    //             this.recursivelySetLevelOnChildren(childNode, level+1);
    //         }
    //     }
    // }

    private insertRowNodesIntoGroups(newRowNodes: RowNode[], rootNode: RowNode, groupColumns: Column[], expandByDefault: any, includeParents: boolean, isPivot: boolean): void {

        newRowNodes.forEach( rowNode => {
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
        });

    }

    private getOrCreateNextGroup(parentGroup: RowNode, nodeToPlace: RowNode, groupColumn: Column, expandByDefault: any,
                                 level: number, includeParents: boolean, numberOfGroupColumns: number, isPivot: boolean): RowNode {
        let groupKey: string = this.getKeyForNode(groupColumn, nodeToPlace);

        let nextGroup = <RowNode> parentGroup.childrenMapped[groupKey];
        if (!nextGroup) {
            nextGroup = this.createSubGroup(groupColumn, groupKey, parentGroup, expandByDefault, level, includeParents, numberOfGroupColumns, isPivot);
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

    private createSubGroup(groupColumn: Column, groupKey: string, parent: RowNode, expandByDefault: any, level: number, includeParents: boolean, numberOfGroupColumns: number, isPivot: boolean): RowNode {
        let newGroup = new RowNode();
        this.context.wireBean(newGroup);

        newGroup.group = true;
        newGroup.field = groupColumn.getColDef().field;
        newGroup.rowGroupColumn = groupColumn;
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
