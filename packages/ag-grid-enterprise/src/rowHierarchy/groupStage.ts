import type {
    ClientSideRowModelStage,
    GridOptions,
    GroupingApproach,
    IRowGroupStage,
    NamedBean,
    RowNode,
    StageExecuteParams,
} from 'ag-grid-community';
import { BeanStub, _getGroupingApproach } from 'ag-grid-community';

import type { GroupingRowNode, IRowGroupingStrategy } from './rowHierarchyUtils';

export class GroupStage<TData> extends BeanStub implements NamedBean, IRowGroupStage {
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
    private strategyBeanName: string | null = null;
    private strategy: IRowGroupingStrategy<TData> | undefined = undefined;

    /** Gets a filler row by id */
    public getNode(id: string): RowNode<TData> | undefined {
        return this.strategy?.getNode(id);
    }

    public override destroy(): void {
        super.destroy();
        this.strategy = undefined;
    }

    public execute(params: StageExecuteParams<TData>): boolean | undefined {
        const approach = _getGroupingApproach(this.gos);
        const approachChanged = this.approach !== approach;
        const strategy = approachChanged ? this.changeApproach(params, approach) : this.strategy;
        if (!strategy) {
            // Stage not executed if no strategy is available
            return undefined;
        }
        return strategy.execute(params, approach) || approachChanged;
    }

    private getStrategyBeanName(approach: GroupingApproach | null) {
        switch (approach) {
            case 'group':
                return 'groupStrategy';
            case 'treePath':
            case 'treeNested':
            case 'treeSelfRef':
                return 'treeGroupStrategy';
            default:
                return null;
        }
    }

    private changeApproach(
        { rowNode }: StageExecuteParams<TData>,
        approach: GroupingApproach
    ): IRowGroupingStrategy<TData> | undefined {
        this.approach = approach;
        const newBeanName = this.getStrategyBeanName(approach);
        const oldStrategy = this.strategy;
        let strategy = oldStrategy;
        if (this.strategyBeanName !== newBeanName) {
            this.destroyBean(strategy);
            strategy = undefined;
            if (newBeanName) {
                strategy = this.beans.registry.createDynamicBean(newBeanName, false);
                this.createOptionalManagedBean(strategy);
            }
            this.strategy = strategy;
            this.strategyBeanName = newBeanName;
        } else {
            strategy?.reset?.();
        }
        if (oldStrategy) {
            resetGrouping(rowNode, approach !== 'treeNested');
        }
        return strategy;
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
    }
    for (const row of allLeafChildren) {
        const sibling = row.sibling;
        resetChildRowGrouping(row);
        if (sibling) {
            resetChildRowGrouping(sibling);
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

const resetChildRowGrouping = <TData>(row: GroupingRowNode<TData>): void => {
    row.key = null;
    row.treeNodeFlags = 0;
    row.allChildrenCount = null;
    row.allLeafChildren = null;
    row.childrenAfterGroup = null;
    row.childrenAfterAggFilter = null;
    row.childrenAfterFilter = null;
    row.childrenAfterSort = null;
    row.childrenMapped = null;
    row.level = 0;
    if (row.groupData) {
        row.groupData = null;
    }
};
