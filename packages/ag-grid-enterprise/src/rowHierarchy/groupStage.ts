import type {
    ClientSideRowModelStage,
    GridOptions,
    IClientSideRowModel,
    IRowGroupStage,
    NamedBean,
    NestedDataGetter,
    RowNode,
    StageExecuteParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { fieldGetter } from './fieldGetter';
import type { IRowGroupingStrategy } from './rowHierarchyUtils';

export class GroupStage<TData> extends BeanStub implements NamedBean, IRowGroupStage {
    beanName = 'groupStage' as const;

    public refreshProps: Set<keyof GridOptions<any>> = new Set([
        'groupAllowUnbalanced',
        'groupDefaultExpanded',
        'groupDisplayType',
        'groupHideOpenParents',
        'initialGroupOrderComparator',
        'treeData',
        'treeDataChildrenField',
        'treeDataParentIdField',
    ]);

    public step: ClientSideRowModelStage = 'group';
    public nestedDataGetter: NestedDataGetter<TData> | null = null;
    public treeData: boolean = false;

    private approachChanged = true;
    private oldTreeData: boolean | null = null;
    private parentIdGetter: ((data: TData) => string | null | undefined) | null = null;
    private strategy: IRowGroupingStrategy<TData> | undefined = undefined;

    public postConstruct(): void {
        this.onPropChange(null);
    }

    public onPropChange(changedProps: ReadonlySet<keyof GridOptions<any>> | null): void {
        const gos = this.gos;
        const treeDataChanged = !changedProps || changedProps.has('treeData');
        const treeDataParentIdFieldChanged = !changedProps || changedProps.has('treeDataParentIdField');
        const treeDataChildrenFieldChanged = !changedProps || changedProps.has('treeDataChildrenField');

        if (treeDataChanged) {
            this.treeData = gos.get('treeData') && gos.isModuleRegistered('TreeData');
        }
        let parentIdField: string | null | undefined;
        let dataChildrenField: string | null | undefined;
        if (treeDataChanged || treeDataParentIdFieldChanged || treeDataChildrenFieldChanged) {
            this.approachChanged = true;
            if (this.treeData) {
                parentIdField = gos.get('treeDataParentIdField');
                if (!parentIdField) {
                    dataChildrenField = gos.get('treeDataChildrenField');
                }
            }
        }
        if (treeDataChanged || treeDataChildrenFieldChanged) {
            this.nestedDataGetter = dataChildrenField ? fieldGetter(dataChildrenField) : null;
        }
        if (treeDataChanged || treeDataParentIdFieldChanged) {
            this.parentIdGetter = parentIdField ? fieldGetter(parentIdField) : null;
        }
    }

    public extractData(nestedDataGetter: NestedDataGetter<TData> | null | undefined): TData[] {
        const rootNode = (this.beans.rowModel as IClientSideRowModel).rootNode;
        const nodes = nestedDataGetter ? rootNode?.childrenAfterGroup : rootNode?.allLeafChildren;
        if (!nodes) {
            return this.gos.get('rowData') ?? [];
        }
        const len = nodes.length;
        const result = new Array<TData>(len);
        let writeIdx = 0;
        for (let i = 0; i < len; ++i) {
            const data = nodes[i].data;
            if (data != null) {
                result[writeIdx++] = data;
            }
        }
        result.length = writeIdx;
        return result;
    }

    /** Gets a filler row by id */
    public getNode(id: string): RowNode<TData> | undefined {
        return this.strategy?.getNode(id);
    }

    public override destroy(): void {
        super.destroy();
        this.strategy = this.destroyBean(this.strategy);
        this.nestedDataGetter = null;
        this.parentIdGetter = null;
    }

    public execute(params: StageExecuteParams<TData>): boolean | undefined {
        const approachChanged = this.approachChanged;
        const strategy = approachChanged ? this.changeApproach(params) : this.strategy;
        if (!strategy) {
            return undefined; // Stage not executed if no strategy is available
        }
        return strategy.execute(params, this.parentIdGetter, this.nestedDataGetter) || approachChanged;
    }

    private changeApproach({ rowNode }: StageExecuteParams<TData>): IRowGroupingStrategy<TData> | undefined {
        const oldStrategy = this.strategy;
        const treeData = this.treeData;
        this.approachChanged = false;
        let strategy = oldStrategy;
        if (this.oldTreeData !== treeData) {
            this.oldTreeData = treeData;
            this.destroyBean(strategy);
            strategy = this.beans.registry.createDynamicBean(treeData ? 'treeGroupStrategy' : 'groupStrategy', false);
            this.strategy = strategy && this.createBean(strategy);
        } else {
            strategy?.reset?.();
        }
        if (oldStrategy) {
            resetGrouping(rowNode, !this.nestedDataGetter);
        }
        return strategy;
    }
}

const resetGrouping = <TData>(rootNode: RowNode<TData>, canResetTreeNode: boolean): void => {
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

const resetChildRowGrouping = <TData>(row: RowNode<TData>): void => {
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
