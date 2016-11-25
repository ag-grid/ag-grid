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

    public execute(rowNode: RowNode): void {

        var groupedCols = this.columnController.getRowGroupColumns();
        var expandByDefault: number;

        if (this.gridOptionsWrapper.isGroupSuppressRow()) {
            expandByDefault = -1;
        } else {
            expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
        }

        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();

        this.recursivelyGroup(rowNode, groupedCols, 0, expandByDefault, includeParents);

        if (this.gridOptionsWrapper.isGroupRemoveSingleChildren()) {
            this.recursivelyDeptFirstRemoveSingleChildren(rowNode, includeParents);
        }

        this.recursivelySetLevelOnChildren(rowNode, 0);
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
            this.setChildrenAfterGroup(rowNode, groupColumn, expandByDefault, level, includeParents);
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

    private setChildrenAfterGroup(rowNode: RowNode, groupColumn: Column, expandByDefault: any, level: number, includeParents: boolean): void {

        rowNode.childrenAfterGroup = [];
        rowNode.childrenMapped = {};

        rowNode.allLeafChildren.forEach( child => {
            var groupKey = this.getKeyForNode(groupColumn, child);

            var groupForChild = <RowNode> rowNode.childrenMapped[groupKey];
            if (!groupForChild) {
                groupForChild = this.createGroup(groupColumn, groupKey, rowNode, expandByDefault, level, includeParents);
                rowNode.childrenMapped[groupKey] = groupForChild;
                rowNode.childrenAfterGroup.push(groupForChild);
            }

            groupForChild.allLeafChildren.push(child);
        });
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
