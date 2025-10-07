import type {
    ClientSideRowModelStage,
    GridOptions,
    IClientSideRowModel,
    IRowGroupStage,
    NamedBean,
    NestedDataGetter,
    ParentIdGetter,
    RowNode,
    StageExecuteParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { fieldGetter } from './fieldGetter';
import type { IRowGroupingStrategy } from './rowHierarchyUtils';

export class GroupStage<TData> extends BeanStub implements NamedBean, IRowGroupStage {
    beanName = 'groupStage' as const;

    public step: ClientSideRowModelStage = 'group';
    public readonly refreshProps: (keyof GridOptions<any>)[] = [
        'groupAllowUnbalanced',
        'groupDefaultExpanded',
        'groupDisplayType',
        'groupHideOpenParents',
        'initialGroupOrderComparator',
        'treeData',
        'treeDataChildrenField',
        'treeDataParentIdField',
    ];

    public nestedDataGetter: NestedDataGetter<TData> | null = null;
    public treeData: boolean = false;
    private parentIdField: string | undefined;
    private cachedParentIdGetter: ParentIdGetter<TData> | null = null;
    private cachedNestedDataGetter: NestedDataGetter<TData> | null = null;
    private childrenField: string | undefined;

    private approachChanged: boolean | 'full' = 'full';
    private parentIdGetter: ((data: TData) => string | null | undefined) | null = null;
    private strategy: IRowGroupingStrategy<TData> | undefined = undefined;

    public postConstruct(): void {
        this.onPropChange(null);
    }

    public onPropChange(changedProps: ReadonlySet<keyof GridOptions<any>> | null): void {
        let { gos, treeData, parentIdField, childrenField } = this;
        let cachedFieldGettersChanged = false;
        if (!changedProps || changedProps.has('treeData')) {
            const value = gos.get('treeData') && gos.isModuleRegistered('TreeData');
            if (this.treeData !== value) {
                this.treeData = treeData = value;
                this.approachChanged = 'full';
                cachedFieldGettersChanged = true;
            }
        }
        if (!changedProps || changedProps.has('treeDataParentIdField')) {
            const value = gos.get('treeDataParentIdField') || undefined;
            if (parentIdField !== value) {
                this.parentIdField = parentIdField = value;
                this.cachedParentIdGetter = value ? fieldGetter(value) : null;
                cachedFieldGettersChanged = true;
            }
        }
        if (!changedProps || changedProps.has('treeDataChildrenField')) {
            const value = gos.get('treeDataChildrenField') || undefined;
            if (childrenField !== value) {
                this.childrenField = childrenField = value;
                this.cachedNestedDataGetter = childrenField ? fieldGetter(childrenField) : null;
                cachedFieldGettersChanged = true;
            }
        }
        if (cachedFieldGettersChanged) {
            const parentIdGetter = treeData && parentIdField ? this.cachedParentIdGetter : null;
            const nestedDataGetter = treeData && !parentIdField && childrenField ? this.cachedNestedDataGetter : null;
            if (this.parentIdGetter !== parentIdGetter || this.nestedDataGetter !== nestedDataGetter) {
                this.nestedDataGetter = nestedDataGetter;
                this.parentIdGetter = parentIdGetter;
                this.approachChanged ||= true;
            }
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
        const approachChanged = !!this.approachChanged;
        const strategy = approachChanged ? this.changeApproach(params) : this.strategy;
        if (!strategy) {
            return undefined; // Stage not executed if no strategy is available
        }
        return strategy.execute(params, approachChanged, this.parentIdGetter, this.nestedDataGetter) || approachChanged;
    }

    private changeApproach({ rowNode }: StageExecuteParams<TData>): IRowGroupingStrategy<TData> | undefined {
        let { treeData, approachChanged, strategy } = this;
        this.approachChanged = false;
        if (approachChanged !== 'full') {
            strategy?.reset?.();
            return strategy;
        }
        if (strategy) {
            this.destroyBean(strategy);
            resetGrouping(rowNode, !this.nestedDataGetter);
        }
        strategy = this.beans.registry.createDynamicBean(treeData ? 'treeGroupStrategy' : 'groupStrategy', false);
        this.strategy = strategy && this.createBean(strategy);
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
