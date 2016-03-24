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
    Column
} from "ag-grid/main";

@Bean('groupStage')
export class GroupStage implements IRowNodeStage {

    @Autowired('selectionController') private selectionController: SelectionController;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('context') private context: Context;

    public execute(rowsToGroup: RowNode[]): RowNode[] {
        var result: RowNode[];

        var groupedCols = this.columnController.getRowGroupColumns();

        if (groupedCols.length > 0) {
            var expandByDefault: number;
            if (this.gridOptionsWrapper.isGroupSuppressRow()) {
                expandByDefault = -1;
            } else {
                expandByDefault = this.gridOptionsWrapper.getGroupDefaultExpanded();
            }
            result = this.group(rowsToGroup, groupedCols, expandByDefault);
        } else {
            result = rowsToGroup;
        }

        return result;
    }

    private group(rowNodes: RowNode[], groupedCols: Column[], expandByDefault: number) {

        var topMostGroup = new RowNode();
        this.context.wireBean(topMostGroup);

        topMostGroup.level = -1;
        topMostGroup.children = [];
        topMostGroup._childrenMap = {};

        var allGroups: RowNode[] = [];
        allGroups.push(topMostGroup);

        var levelToInsertChild = groupedCols.length - 1;
        var i: number;
        var currentLevel: number;
        var node: RowNode;
        var currentGroup: any;
        var groupKey: string;
        var nextGroup: RowNode;
        var includeParents = !this.gridOptionsWrapper.isSuppressParentsInRowNodes();

        // start at -1 and go backwards, as all the positive indexes
        // are already used by the nodes.
        var index = -1;

        for (i = 0; i < rowNodes.length; i++) {
            node = rowNodes[i];

            // all leaf nodes have the same level in this grouping, which is one level after the last group
            node.level = levelToInsertChild + 1;

            for (currentLevel = 0; currentLevel < groupedCols.length; currentLevel++) {
                var groupColumn = groupedCols[currentLevel];
                groupKey = this.valueService.getValue(groupColumn, node);

                if (currentLevel === 0) {
                    currentGroup = topMostGroup;
                }

                // if group doesn't exist yet, create it
                nextGroup = currentGroup._childrenMap[groupKey];
                if (!nextGroup) {
                    nextGroup = new RowNode();
                    this.context.wireBean(nextGroup);
                    nextGroup.group = true;
                    nextGroup.field = groupColumn.getColDef().field;
                    nextGroup.id = index--;
                    nextGroup.key = groupKey;
                    nextGroup.expanded = this.isExpanded(expandByDefault, currentLevel);
                    nextGroup.children = [];
                    // for top most level, parent is null
                    nextGroup.parent = null;
                    nextGroup.allChildrenCount = 0;
                    nextGroup.level = currentGroup.level + 1;
                    // this is a temporary map, we remove at the end of this method
                    nextGroup._childrenMap = {};

                    if (includeParents) {
                        nextGroup.parent = currentGroup === topMostGroup ? null : currentGroup;
                    }
                    currentGroup._childrenMap[groupKey] = nextGroup;
                    currentGroup.children.push(nextGroup);
                    allGroups.push(nextGroup);
                }

                nextGroup.allChildrenCount++;

                if (currentLevel == levelToInsertChild) {
                    if (includeParents) {
                        node.parent = nextGroup === topMostGroup ? null : nextGroup;
                    }
                    nextGroup.children.push(node);
                } else {
                    currentGroup = nextGroup;
                }
            }

        }

        //remove the temporary map
        for (i = 0; i < allGroups.length; i++) {
            delete allGroups[i]._childrenMap;
        }

        return topMostGroup.children;
    }

    private isExpanded(expandByDefault: any, level: any) {
        if (typeof expandByDefault === 'number') {
            if (expandByDefault===-1) {
                return true;
            } else {
                return level < expandByDefault;
            }
        } else {
            return false;
        }
    }

}
