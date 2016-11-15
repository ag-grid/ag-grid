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
    NumberSequence,
    Utils
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

        // putting this in a wrapper, so it's pass by reference
        this.recursivelyGroup(rowNode, groupedCols, 0, expandByDefault);
    }

    private recursivelyGroup(rowNode: RowNode, groupColumns: Column[], level: number, expandByDefault: any): void {

        var groupingThisLevel = level < groupColumns.length;
        rowNode.leafGroup = level === groupColumns.length;

        if (groupingThisLevel) {
            var groupColumn = groupColumns[level];
            this.setChildrenAfterGroup(rowNode, groupColumn, expandByDefault, level);
            rowNode.childrenAfterGroup.forEach( child => {
                this.recursivelyGroup(child, groupColumns, level + 1, expandByDefault);
            });
        } else {
            rowNode.childrenAfterGroup = rowNode.allLeafChildren;
            rowNode.childrenAfterGroup.forEach( child => {
                child.level = level;
                child.parent = rowNode;
            });
        }

    }

    private setChildrenAfterGroup(rowNode: RowNode, groupColumn: Column, expandByDefault: any, level: number): void {

        rowNode.childrenAfterGroup = [];
        rowNode.childrenMapped = {};

        rowNode.allLeafChildren.forEach( child => {
            var groupKey = this.getKeyForNode(groupColumn, child);

            var groupForChild = <RowNode> rowNode.childrenMapped[groupKey];
            if (!groupForChild) {
                groupForChild = this.createGroup(groupColumn, groupKey, rowNode, expandByDefault, level);
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

    private createGroup(groupColumn: Column, groupKey: string, parent: RowNode, expandByDefault: any, level: number): RowNode {
        var nextGroup = new RowNode();
        this.context.wireBean(nextGroup);

        nextGroup.group = true;
        nextGroup.field = groupColumn.getColDef().field;
        // we use negative number for the ids of the groups, this makes sure we don't clash with the
        // id's of the leaf nodes.
        nextGroup.id = (this.groupIdSequence.next()*-1).toString();
        console.log(`used id ${nextGroup.id}`);
        nextGroup.key = groupKey;
        nextGroup.expanded = this.isExpanded(expandByDefault, level);
        nextGroup.allLeafChildren = [];
        nextGroup.allChildrenCount = 0;
        nextGroup.level = level;

        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();
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
