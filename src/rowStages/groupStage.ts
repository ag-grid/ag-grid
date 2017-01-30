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
    NumberSequence
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

    public execute(params: StageExecuteParams): void {
        let rootNode = params.rowNode;
        let newRowNodes = params.newRowNodes;

        var groupedCols = this.columnController.getRowGroupColumns();
        var expandByDefault: number;

        if (this.gridOptionsWrapper.isGroupSuppressRow()) {
            expandByDefault = -1;
        } else {
            expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        }

        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();

        if (newRowNodes) {
            this.insertRowNodes(newRowNodes, rootNode, groupedCols, expandByDefault, includeParents);
        } else {
            this.recursivelyGroup(rootNode, groupedCols, 0, expandByDefault, includeParents);

            // remove single children only works when doing a new grouping, it is not compatible with
            // inserting / removing rows, as the group which a new record may belong to may have already
            // been snipped out.
            if (this.gridOptionsWrapper.isGroupRemoveSingleChildren()) {
                this.recursivelyDeptFirstRemoveSingleChildren(rootNode, includeParents);
            }
        }

        this.recursivelySetLevelOnChildren(rootNode, 0);
    }

    private recursivelySetLevelOnChildren(rowNode: RowNode, level: number): void {
        for (let i = 0; i<rowNode.childrenAfterGroup.length; i++) {
            let childNode = rowNode.childrenAfterGroup[i];
            childNode.level = level;
            if (childNode.group) {
                this.recursivelySetLevelOnChildren(childNode, level+1);
            }
        }
    }

    private recursivelyDeptFirstRemoveSingleChildren(rowNode: RowNode, includeParents: boolean): void {
        if (Utils.missingOrEmpty(rowNode.childrenAfterGroup)) { return; }

        for (let i = 0; i<rowNode.childrenAfterGroup.length; i++) {
            let childNode = rowNode.childrenAfterGroup[i];
            if (childNode.group) {
                this.recursivelyDeptFirstRemoveSingleChildren(childNode, includeParents);
                if (childNode.childrenAfterGroup.length <=1) {
                    let nodeToMove = childNode.childrenAfterGroup[0];
                    rowNode.childrenAfterGroup[i] = nodeToMove;
                    // we check if parent
                    if (includeParents) {
                        nodeToMove.parent = rowNode;
                    }
                }
            }
        }
    }

    private recursivelyGroup(rowNode: RowNode, groupColumns: Column[], level: number, expandByDefault: any, includeParents: boolean): void {

        var groupingThisLevel = level < groupColumns.length;
        rowNode.leafGroup = level === groupColumns.length;

        if (groupingThisLevel) {
            var groupColumn = groupColumns[level];
            this.bucketIntoChildrenAfterGroup(rowNode, groupColumn, expandByDefault, level, includeParents);
            rowNode.childrenAfterGroup.forEach( child => {
                this.recursivelyGroup(child, groupColumns, level + 1, expandByDefault, includeParents);
            });
        } else {
            rowNode.childrenAfterGroup = rowNode.allLeafChildren;
            rowNode.childrenAfterGroup.forEach( child => {
                child.parent = rowNode;
            });
        }

    }

    private bucketIntoChildrenAfterGroup(rowNode: RowNode, groupColumn: Column, expandByDefault: any, level: number, includeParents: boolean): void {

        rowNode.childrenAfterGroup = [];
        rowNode.childrenMapped = {};

        rowNode.allLeafChildren.forEach( child => {
            this.placeNodeIntoNextGroup(rowNode, child, groupColumn, expandByDefault, level, includeParents);
        });
    }

    private insertRowNodes(newRowNodes: RowNode[], rootNode: RowNode, groupColumns: Column[], expandByDefault: any, includeParents: boolean): void {

        newRowNodes.forEach( rowNode => {
            let nextGroup = rootNode;
            groupColumns.forEach( (groupColumn, level) => {
                nextGroup = this.placeNodeIntoNextGroup(nextGroup, rowNode, groupColumn, expandByDefault, level, includeParents);
            });
            rowNode.parent = nextGroup;
        });
    }


    private placeNodeIntoNextGroup(previousGroup: RowNode, nodeToPlace: RowNode, groupColumn: Column, expandByDefault: any,
                                   level: number, includeParents: boolean): RowNode {
        var groupKey = this.getKeyForNode(groupColumn, nodeToPlace);

        var nextGroup = <RowNode> previousGroup.childrenMapped[groupKey];
        if (!nextGroup) {
            nextGroup = this.createGroup(groupColumn, groupKey, previousGroup, expandByDefault, level, includeParents);
            previousGroup.childrenMapped[groupKey] = nextGroup;
            previousGroup.childrenAfterGroup.push(nextGroup);
        }

        nextGroup.allLeafChildren.push(nodeToPlace);

        return nextGroup;
    }

    private getKeyForNode(groupColumn: Column, rowNode: RowNode): any {
        var value = this.valueService.getValue(groupColumn, rowNode);
        var result: any;
        var keyCreator = groupColumn.getColDef().keyCreator;

        if (keyCreator) {
            result = keyCreator({value: value});
        } else {
            result = value;
        }

        return result;
    }

    private createGroup(groupColumn: Column, groupKey: string, parent: RowNode, expandByDefault: any, level: number, includeParents: boolean): RowNode {
        var nextGroup = new RowNode();
        this.context.wireBean(nextGroup);

        nextGroup.group = true;
        nextGroup.field = groupColumn.getColDef().field;
        // we use negative number for the ids of the groups, this makes sure we don't clash with the
        // id's of the leaf nodes.
        nextGroup.id = (this.groupIdSequence.next()*-1).toString();
        nextGroup.key = groupKey;
        nextGroup.expanded = this.isExpanded(expandByDefault, level);
        nextGroup.allLeafChildren = [];
        nextGroup.allChildrenCount = 0;
        nextGroup.rowGroupIndex = level;

        nextGroup.parent = includeParents ? parent : null;

        return nextGroup;
    }

    private isExpanded(expandByDefault: number, level: any) {
        if (expandByDefault===-1) {
            return true;
        } else {
            return level < expandByDefault;
        }
    }

}
