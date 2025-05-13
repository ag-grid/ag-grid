import type {
    ClientSideRowModelStage,
    GridOptions,
    GroupingApproach,
    IRowGroupingStrategy,
    IRowNodeStage,
    NamedBean,
    RowGroupingRowNode,
    StageExecuteParams,
} from 'ag-grid-community';
import { BeanStub, _getGroupingApproach } from 'ag-grid-community';

export class GroupStage<TData> extends BeanStub implements NamedBean, IRowNodeStage {
    beanName = 'groupStage' as const;

    public refreshProps: Set<keyof GridOptions<any>> = new Set([
        'groupDefaultExpanded',
        'groupAllowUnbalanced',
        'initialGroupOrderComparator',
        'groupHideOpenParents',
        'groupDisplayType',
        'treeData',
        'treeDataChildrenField',
        'treeDataParentIdField',
    ]);
    public step: ClientSideRowModelStage = 'group';

    private approach: GroupingApproach | null = null;
    private strategy: IRowGroupingStrategy<TData> | undefined = undefined;

    public override destroy(): void {
        super.destroy();
        this.strategy = undefined;
        this.approach = null;
    }

    private createStrategy(): IRowGroupingStrategy<TData> | undefined {
        const { beans, approach } = this;
        let beanName: 'treeParentIdStrategy' | 'groupStrategy' | undefined;
        switch (approach) {
            case 'treeSelfRef':
                beanName = 'treeParentIdStrategy';
                break;
            case 'group':
                beanName = 'groupStrategy';
                break;
        }
        if (beanName) {
            const bean = beans.registry.createDynamicBean<IRowGroupingStrategy<TData>>(beanName, false);
            this.createOptionalManagedBean(bean);
            return bean;
        }
        return undefined;
    }

    public execute(params: StageExecuteParams<TData>): boolean {
        let strategy = this.strategy;
        const approach = _getGroupingApproach(this.gos);
        if (this.approach !== approach) {
            this.approach = approach;
            this.destroyBean(strategy);
            if (strategy && this.approach !== 'treeNested' && this.approach !== 'treePath') {
                resetGrouping(params.rowNode);
            }
            strategy = this.createStrategy();
            this.strategy = strategy;
        }

        strategy?.execute(params);
        return !!strategy;
    }
}

const resetGrouping = <TData>(rootNode: RowGroupingRowNode<TData>): void => {
    const allLeafChildren = rootNode.allLeafChildren!;
    const rootSibling = rootNode.sibling;
    rootNode.treeNodeFlags = 0;
    rootNode.childrenAfterGroup = allLeafChildren;
    rootNode.childrenMapped = null;
    rootNode.groupData = null;
    if (rootSibling) {
        rootSibling.childrenAfterGroup = rootNode.childrenAfterGroup;
        rootSibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
        rootSibling.childrenAfterFilter = rootNode.childrenAfterFilter;
        rootSibling.childrenAfterSort = rootNode.childrenAfterSort;
        rootSibling.childrenMapped = null;
        rootSibling.groupData = null;
    }
    for (const row of allLeafChildren) {
        const sibling = row.sibling;
        resetChildRowGrouping(row);
        if (sibling) {
            resetChildRowGrouping(sibling);
        }
        row.parent = rootNode;
        row.level = 0;
        row.key = null;
        row.treeNodeFlags = 0;
        if (row.group || row.hasChildren()) {
            row.group = false;
            row.updateHasChildren();
        }
    }
    rootNode.updateHasChildren();
};

const resetChildRowGrouping = <TData>(row: RowGroupingRowNode<TData>): void => {
    row.allLeafChildren = null;
    row.childrenAfterGroup = null;
    row.childrenAfterAggFilter = null;
    row.childrenAfterFilter = null;
    row.childrenAfterSort = null;
    row.childrenMapped = null;
    row.treeNode = null;
    if (row.groupData) {
        row.groupData = null;
    }
};
