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

        const preserveFilterStageConfig = (node: RowNode) => {
            node.childrenAfterAggFilter = node.childrenAfterFilter;
            const childCount = node.childrenAfterAggFilter!.reduce((acc: number, child: RowNode) => (
                acc + (child.allChildrenCount || 1)
            ), 0);
            node.setAllChildrenCount(childCount);

            if(node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        }

        const preserveChildren = (node: RowNode) => {
            if (node.childrenAfterFilter) {
                node.childrenAfterAggFilter = node.childrenAfterFilter;
                const childCount = node.childrenAfterAggFilter.reduce((acc: number, child: RowNode) => {
                    preserveChildren(child);
                    return acc + (child.allChildrenCount || 1);
                }, 0);
                node.setAllChildrenCount(childCount);
            }

            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        }

        const filterChildren = (node: RowNode) => {
            let childCount = 0;
            node.childrenAfterAggFilter = node.childrenAfterFilter?.filter((child: RowNode) => {
                const shouldFilterRow = applyFilterToNode({ node: child });
                if (shouldFilterRow) {
                    const doesNodePassFilter = this.filterManager.doesRowPassAggregateFilters({ rowNode: child });
                    if (doesNodePassFilter) {
                        // Node has passed, so preserve children
                        preserveChildren(child);
                        childCount += child.allChildrenCount || 1;
                        return true;
                    }
                }
                const hasChildPassed = child.childrenAfterAggFilter?.length;
                if (hasChildPassed) {
                    childCount += child.allChildrenCount || 1;
                    return true;
                }
                return false;
            }) || null;

            node.setAllChildrenCount(childCount);
            if (node.sibling) {
                node.sibling.childrenAfterAggFilter = node.childrenAfterAggFilter;
            }
        };

        changedPath!.forEachChangedNodeDepthFirst(
            isAggFilterActive ? filterChildren : preserveFilterStageConfig,
            false,
        );
    }
}