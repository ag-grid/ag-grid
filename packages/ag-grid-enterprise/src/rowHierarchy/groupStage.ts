import type {
    ClientSideRowModelStage,
    GridOptions,
    IRowGroupingStrategy,
    IRowNodeStage,
    NamedBean,
    RowGroupingStrategyExecuteParams,
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

    private strategy: IRowGroupingStrategy<TData> | undefined = undefined;

    public execute(params: StageExecuteParams<TData>): boolean {
        const { beans, gos, strategy: oldStrategy } = this;

        let newStrategy = oldStrategy;
        const treeDataManagedByNodeManager = params.nodeManager!.treeData;
        if (treeDataManagedByNodeManager) {
            newStrategy = undefined;
        } else {
            const { changedRowNodes, changedProps } = params;
            if (
                !changedRowNodes ||
                (changedProps &&
                    (changedProps.has('treeData') ||
                        (gos.get('treeData') &&
                            changedProps.has('treeDataParentIdField') &&
                            changedProps.has('treeDataChildrenField'))))
            ) {
                newStrategy = undefined;
                if (gos.get('treeData') && gos.get('treeDataParentIdField') && !gos.get('treeDataChildrenField')) {
                    newStrategy = beans.treeParentIdStrategy;
                }
            }
            newStrategy ??= beans.groupStrategy;
        }

        const strategyChanged = oldStrategy !== newStrategy;
        if (strategyChanged) {
            oldStrategy?.deactivate?.();
            if (!treeDataManagedByNodeManager && oldStrategy) {
                this.reset(params);
            }
            this.strategy = newStrategy;
        }

        newStrategy?.execute(params, strategyChanged);
        return !!newStrategy;
    }

    private reset(params: RowGroupingStrategyExecuteParams<TData>): void {
        const rootNode = params.rowNode;
        const allLeafChildren = rootNode.allLeafChildren!;
        rootNode.childrenAfterGroup = allLeafChildren;
        const sibling = rootNode.sibling;
        rootNode.groupData = null;
        rootNode.childrenMapped = null;
        if (sibling) {
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
            sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
            sibling.childrenAfterSort = rootNode.childrenAfterSort;
            sibling.childrenMapped = null;
            sibling.groupData = null;
        }
        for (let i = 0, len = allLeafChildren?.length || 0; i < len; i++) {
            const row = allLeafChildren[i];
            row.parent = rootNode;
            row.key = null;
            row.level = 0;
            row.childrenAfterGroup = null;
            row.childrenAfterAggFilter = null;
            row.childrenAfterFilter = null;
            row.childrenAfterSort = null;
            row.childrenMapped = null;
            row.treeNodeFlags = 0;
            if (row.groupData) {
                row.groupData = null;
            }
            if (row.group || row.hasChildren()) {
                row.group = false;
                row.updateHasChildren();
            }
            const sibling = row.sibling;
            if (sibling) {
                sibling.childrenAfterGroup = null;
                sibling.childrenAfterAggFilter = null;
                sibling.childrenAfterFilter = null;
                sibling.childrenAfterSort = null;
                sibling.childrenMapped = null;
                sibling.groupData = null;
            }
        }
        rootNode.updateHasChildren();
        rootNode.treeNodeFlags = 0;
    }
}
