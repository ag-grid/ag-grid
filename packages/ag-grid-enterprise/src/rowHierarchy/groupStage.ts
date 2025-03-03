import type {
    ClientSideRowModelStage,
    GridOptions,
    IRowGroupingStrategy,
    IRowNodeStage,
    NamedBean,
    RowGroupingRowNode,
    StageExecuteParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

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

    private parentIdTreeStrategy: IRowGroupingStrategy<TData> | undefined = undefined;
    private groupStrategy: IRowGroupingStrategy<TData> | undefined = undefined;

    /** The active strategy */
    private strategy: IRowGroupingStrategy<TData> | undefined = undefined;

    public postConstruct(): void {
        this.strategy = this.getNewStrategy();
    }

    public override destroy(): void {
        super.destroy();
        this.parentIdTreeStrategy = undefined;
        this.groupStrategy = undefined;
    }

    private createStrategy(name: 'GroupStrategy' | 'TreeParentIdStrategy'): IRowGroupingStrategy<TData> | undefined {
        return this.createOptionalManagedBean(
            this.beans.registry.createDynamicBean<IRowGroupingStrategy<TData>>(name, false)
        );
    }

    private getNewStrategy(): IRowGroupingStrategy<TData> | undefined {
        const gos = this.gos;
        if (gos.get('treeData')) {
            if (gos.get('treeDataChildrenField')) {
                return undefined; // managed by node manager
            }
            if (gos.get('treeDataParentIdField')) {
                return (this.parentIdTreeStrategy ??= this.createStrategy('TreeParentIdStrategy'));
            }
            if (gos.get('getDataPath')) {
                return undefined; // managed by node manager
            }
        }

        return (this.groupStrategy ??= this.createStrategy('GroupStrategy'));
    }

    private treeDataManagedByNodeManager(): boolean {
        // TODO: this method is temporary and will be removed once we move most of the computation
        // for treeData in node managers as strategies in the next refactoring PRs.
        // resetGrouping should replace the reset logic present in the tree nodeManagers
        const gos = this.gos;
        return gos.get('treeData') && (!!gos.get('getDataPath') || !!gos.get('treeDataChildrenField'));
    }

    public execute(params: StageExecuteParams<TData>): boolean {
        const { strategy: oldStrategy } = this;

        const newStrategy = this.getNewStrategy();

        const strategyChanged = oldStrategy !== newStrategy;
        if (strategyChanged) {
            this.strategy = newStrategy;
            if (oldStrategy) {
                oldStrategy.deactivate?.();
                if (!this.treeDataManagedByNodeManager()) {
                    resetGrouping(params.rowNode);
                }
            }
        }

        newStrategy?.execute(params);
        return !!newStrategy;
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
    if (row.groupData) {
        row.groupData = null;
    }
};
