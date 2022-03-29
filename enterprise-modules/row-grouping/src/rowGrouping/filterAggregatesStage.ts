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
            node.childrenAfterAggFilter = node.childrenAfterFilter;

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
            filterActive ? filterChildren : preserveFilterStageConfig,
            false,
        );
        this.selectableService.updateSelectableAfterAggregateFiltering(rowNode);
    }
}