import type {
    ClientSideRowModelStage,
    GridOptions,
    GroupingApproach,
    IRowGroupingStrategy,
    IRowNodeStage,
    NamedBean,
    StageExecuteParams,
} from 'ag-grid-community';
import { BeanStub, _getGroupingApproach } from 'ag-grid-community';

import type { GroupingRowNode } from './rowHierarchyUtils';
import { _resetRowGroup } from './rowHierarchyUtils';

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
        let beanName: 'treeGroupStrategy' | 'groupStrategy' | undefined;
        switch (approach) {
            case 'group':
                beanName = 'groupStrategy';
                break;
            case 'treePath':
            case 'treeNested':
            case 'treeSelfRef':
                beanName = 'treeGroupStrategy';
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
        const oldApproach = this.approach;
        const approach = _getGroupingApproach(this.gos);
        if (oldApproach !== approach) {
            this.approach = approach;
            this.destroyBean(strategy);
            if (strategy) {
                strategy.reset?.();
                resetGrouping(params.rowNode, approach !== 'treeNested');
            }
            strategy = this.createStrategy();
            this.strategy = strategy;
        }

        strategy?.execute(params, approach);
        return !!strategy;
    }
}

const resetGrouping = <TData>(rootNode: GroupingRowNode<TData>, canResetTreeNode: boolean): void => {
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
        _resetRowGroup(row);
        if (sibling) {
            _resetRowGroup(sibling);
        }
        row.parent = rootNode;
        if (canResetTreeNode) {
            row.treeParent = null;
        }
        if (row.group || row.hasChildren()) {
            row.group = false;
            row.updateHasChildren();
        }
    }
    rootNode.updateHasChildren();
};
