import {
    _,
    Autowired,
    Bean,
    IRowNodeStage,
    SelectableService,
    StageExecuteParams,
    BeanStub,
    FilterManager,
    RowNode,
} from "@ag-grid-community/core";

@Bean('filterAggregatesStage')
export class FilterAggregatesStage extends BeanStub implements IRowNodeStage {

    @Autowired('selectableService') private selectableService: SelectableService;
    @Autowired('filterManager') private filterManager: FilterManager;

    public execute(params: StageExecuteParams): void {
        const filterActive = this.filterManager.isAdvancedAggregateFilterPresent();
        const defaultApplyToLeafPredicate = (params: { node: RowNode }) => !params.node.group;
        const applyFilterToNode = this.gridOptionsWrapper.getGroupAggFiltering() || defaultApplyToLeafPredicate;

        const { rowNode, changedPath } = params;

        const preserveFilterStageConfig = (node: RowNode) => {
            node.childrenAfterAggregateFilter = node.childrenAfterFilter;

            if(node.sibling) {
                node.sibling.childrenAfterAggregateFilter = node.childrenAfterAggregateFilter;
            }
        }

        const preserveChildren = (node: RowNode) => {
            if (node.childrenAfterFilter) {
                node.childrenAfterAggregateFilter = node.childrenAfterFilter;
                const childCount = node.childrenAfterAggregateFilter.reduce((acc: number, child: RowNode) => {
                    preserveChildren(child);
                    return acc + (child.allChildrenCount || 1);
                }, 0);
                node.setAllChildrenCount(childCount);
            }

            if (node.sibling) {
                node.sibling.childrenAfterAggregateFilter = node.childrenAfterAggregateFilter;
            }
        }

        const filterChildren = (node: RowNode) => {
            let childCount = 0;
            node.childrenAfterAggregateFilter = node.childrenAfterFilter?.filter((child: RowNode) => {
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
                const hasChildPassed = child.childrenAfterAggregateFilter?.length;
                if (hasChildPassed) {
                    childCount += child.allChildrenCount || 1;
                    return true;
                }
                return false;
            }) || null;

            node.setAllChildrenCount(childCount);
            if (node.sibling) {
                node.sibling.childrenAfterAggregateFilter = node.childrenAfterAggregateFilter;
            }
        };

        changedPath!.forEachChangedNodeDepthFirst(
            filterActive ? filterChildren : preserveFilterStageConfig,
            false,
            (node: RowNode) => node.childrenAfterFilter
        );
        this.selectableService.updateSelectableAfterAggregateFiltering(rowNode);
    }
}