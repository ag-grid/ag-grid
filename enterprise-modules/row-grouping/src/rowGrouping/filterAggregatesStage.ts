import {
    _,
    Autowired,
    Bean,
    IRowNodeStage,
    StageExecuteParams,
    BeanStub,
    FilterManager,
    RowNode,
    ColumnModel,
} from "@ag-grid-community/core";

@Bean('filterAggregatesStage')
export class FilterAggregatesStage extends BeanStub implements IRowNodeStage {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnModel') private columnModel: ColumnModel;

    public execute(params: StageExecuteParams): void {
        const isPivotMode = this.columnModel.isPivotMode();
        const isAggFilterActive = this.filterManager.isAggregateFilterPresent();

        // This is the default filter for applying only to leaf nodes, realistically this should not apply as primary agg columns,
        // should not be applied by the filterManager if getGroupAggFiltering is missing. Predicate will apply filters to leaf level.
        const defaultPrimaryColumnPredicate = (params: { node: RowNode }) => !params.node.group;

        // Default secondary column predicate, selecting only leaf level groups.
        const defaultSecondaryColumnPredicate = ((params: { node: RowNode }) => params.node.leafGroup);

        // The predicate to determine whether filters should apply to this row. Either defined by the user in groupAggFiltering or a default depending
        // on current pivot mode status.
        const applyFilterToNode = this.gridOptionsWrapper.getGroupAggFiltering()
            || (isPivotMode ? defaultSecondaryColumnPredicate : defaultPrimaryColumnPredicate);

        const { changedPath } = params;

        const preserveChildren = (node: RowNode, recursive = false) => {
            if (node.childrenAfterFilter) {
                node.childrenAfterAggFilter = node.childrenAfterFilter;
                if (recursive) {
                    node.childrenAfterAggFilter.forEach((child) => preserveChildren(child, recursive));
                }
                this.setAllChildrenCount(node);
            }

            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        }

        const filterChildren = (node: RowNode) => {
            node.childrenAfterAggFilter = node.childrenAfterFilter?.filter((child: RowNode) => {
                const shouldFilterRow = applyFilterToNode({ node: child });
                if (shouldFilterRow) {
                    const doesNodePassFilter = this.filterManager.doesRowPassAggregateFilters({ rowNode: child });
                    if (doesNodePassFilter) {
                        // Node has passed, so preserve children
                        preserveChildren(child, true);
                        return true;
                    }
                }
                const hasChildPassed = child.childrenAfterAggFilter?.length;
                return hasChildPassed;
            }) || null;

            this.setAllChildrenCount(node);
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };

        changedPath!.forEachChangedNodeDepthFirst(
            isAggFilterActive ? filterChildren : preserveChildren,
            true,
        );
    }

    private setAllChildrenCountTreeData(rowNode: RowNode) {
        // for tree data, we include all children, groups and leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterAggFilter!.forEach((child: RowNode) => {
            // include child itself
            allChildrenCount++;
            // include children of children
            allChildrenCount += child.allChildrenCount as any;
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }

    private setAllChildrenCountGridGrouping(rowNode: RowNode) {
        // for grid data, we only count the leafs
        let allChildrenCount = 0;
        rowNode.childrenAfterAggFilter!.forEach((child: RowNode) => {
            if (child.group) {
                allChildrenCount += child.allChildrenCount as any;
            } else {
                allChildrenCount++;
            }
        });
        rowNode.setAllChildrenCount(allChildrenCount);
    }

    private setAllChildrenCount(rowNode: RowNode) {
        if (!rowNode.hasChildren()) {
            rowNode.setAllChildrenCount(null);
            return;
        }

        if (this.gridOptionsService.is('treeData')) {
            this.setAllChildrenCountTreeData(rowNode);
        } else {
            this.setAllChildrenCountGridGrouping(rowNode);
        }
    }
}