import type {
    ClientSideRowModelStage,
    GridOptions,
    IClientSideRowModel,
    NamedBean,
    NestedDataGetter,
    RefreshModelParams,
    RowNode,
    _IRowNodeGroupStage,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import type { IRowGroupingStrategy } from './rowHierarchyUtils';

export class GroupStage<TData> extends BeanStub implements NamedBean, _IRowNodeGroupStage {
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

    public treeData: boolean = false;
    private hasTreeData: boolean = false;
    private needReset: boolean = false;
    private nested: boolean = false;
    private strategy: IRowGroupingStrategy<TData> | null | undefined = undefined;

    public postConstruct(): void {
        const gos = this.gos;
        if (gos.isModuleRegistered('TreeData')) {
            this.hasTreeData = true;
            this.treeData = gos.get('treeData');
        }
        this.addManagedEventListeners({
            showRowGroupColsSetChanged: () => this.strategy?.onShowRowGroupColsSetChanged(),
        });
    }

    public invalidateGroupCols(): void {
        this.strategy?.invalidateGroupCols?.();
    }

    public override destroy(): void {
        this.strategy = this.destroyBean(this.strategy);
        super.destroy();
    }

    public getNonLeaf(id: string): RowNode<TData> | undefined {
        return this.strategy?.nonLeafsById?.get(id);
    }

    public getNestedDataGetter(): NestedDataGetter<TData> | null | undefined {
        return this.getStrategy()?.nestedDataGetter;
    }

    public onPropChange(changedProps: ReadonlySet<keyof GridOptions<any>>): boolean {
        const gos = this.gos;
        const oldNestedDataGetter = this.strategy?.nestedDataGetter;
        if (changedProps.has('treeData')) {
            const value = gos.get('treeData') && this.hasTreeData;
            if (this.treeData !== value) {
                this.beans.rowDragSvc?.cancelRowDrag();
                this.treeData = value;
                this.needReset = true;
                this.strategy = this.destroyBean(this.strategy);
            }
        }
        this.strategy?.onPropChange?.(changedProps);
        return this.getNestedDataGetter() !== oldNestedDataGetter;
    }

    public extractData(): TData[] {
        const rootNode = (this.beans.rowModel as IClientSideRowModel).rootNode;
        const nodes = this.nested ? rootNode?.childrenAfterGroup : rootNode?._leafs;
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

    public execute(params: RefreshModelParams<TData>): boolean | undefined {
        const beans = this.beans;
        const rootNode = beans.rowModel.rootNode;
        if (!rootNode) {
            return false;
        }
        const strategy = this.getStrategy();
        const nested = !!strategy?.nestedDataGetter;
        const needReset = this.needReset;
        this.nested = nested;
        if (needReset) {
            this.needReset = false;
            beans.rowDragSvc?.cancelRowDrag();
            params.animate = false; // resetting grouping / treeData, so no animation
            resetGrouping(rootNode, !nested);
        }
        return strategy ? strategy.execute(rootNode, params) || needReset : undefined;
    }

    public loadLeafs(node: RowNode): RowNode[] | null {
        return node.footer ? loadFooterLeafs(node) : loadRealLeafs(node);
    }

    public loadGroupData(node: RowNode<any>): Record<string, any> | null {
        const strategy = this.getStrategy();
        if (strategy) {
            return strategy.loadGroupData(node);
        }
        node._groupData = null;
        return null;
    }

    public clearNonLeafs(): void {
        this.strategy?.clearNonLeafs();
    }

    private getStrategy(): IRowGroupingStrategy<TData> | null {
        let strategy = this.strategy;
        if (strategy !== undefined && this.isAlive()) {
            return strategy;
        }
        strategy =
            this.beans.registry.createDynamicBean(this.treeData ? 'treeGroupStrategy' : 'groupStrategy', false) ?? null;
        this.strategy = strategy && this.createBean(strategy);
        return strategy;
    }
}

const loadFooterLeafs = (node: RowNode): RowNode[] | null => {
    const sibling = node.sibling;
    if (!sibling) {
        return null;
    }
    const siblingLeafs = sibling._leafs;
    if (siblingLeafs !== undefined) {
        return siblingLeafs; // use cache if available
    }
    return loadRealLeafs(sibling); // load leafs from sibling
};

const loadRealLeafs = (node: RowNode): RowNode[] | null => {
    const childrenAfterGroup = node.childrenAfterGroup;
    const childrenAfterGroupLen = childrenAfterGroup?.length;
    node._leafs = null; // clear any previous value, we are going to recalculate
    if (!childrenAfterGroupLen) {
        return null; // no children, so no leafs
    }
    let leafs: RowNode[] | null | undefined;
    const onlyChild = childrenAfterGroupLen === 1 ? childrenAfterGroup[0] : null;
    if (onlyChild?.group && onlyChild.sourceRowIndex < 0) {
        leafs = onlyChild._leafs; // use cache if available
        if (leafs === undefined) {
            leafs = loadRealLeafs(onlyChild); // reload leafs for child
        }
    } else if (node.leafGroup) {
        leafs = childrenAfterGroup; // leafGroup means children are always leafs
    } else {
        leafs = [];
        for (let i = 0; i < childrenAfterGroupLen; ++i) {
            const child = childrenAfterGroup[i];
            if (child.sourceRowIndex >= 0) {
                leafs.push(child); // direct user provided group or leaf node
            }
            if (!child.group) {
                continue; // leaf node, so no leafs below this
            }
            let childLeafs = child._leafs;
            if (childLeafs === undefined) {
                childLeafs = loadRealLeafs(child); // reload leafs for child
            }
            if (childLeafs) {
                for (let j = 0, len = childLeafs.length; j < len; ++j) {
                    leafs.push(childLeafs[j]);
                }
            }
        }
    }
    node._leafs = leafs;
    return leafs;
};

const resetGrouping = <TData>(rootNode: RowNode<TData>, canResetTreeNode: boolean): void => {
    const allLeafs = rootNode._leafs!;
    const rootSibling = rootNode.sibling;
    rootNode.treeNodeFlags = 0;
    rootNode.childrenAfterGroup = allLeafs;
    rootNode.childrenMapped = null;
    rootNode._groupData = undefined;
    if (rootSibling) {
        rootSibling.childrenAfterGroup = rootNode.childrenAfterGroup;
        rootSibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
        rootSibling.childrenAfterFilter = rootNode.childrenAfterFilter;
        rootSibling.childrenAfterSort = rootNode.childrenAfterSort;
        rootSibling.childrenMapped = null;
        rootSibling._groupData = undefined;
    }
    for (let i = 0, allLeafsLen = allLeafs.length ?? 0; i < allLeafsLen; ++i) {
        const row = allLeafs[i];
        const sibling = row.sibling;
        row._leafs = undefined;
        resetChildRowGrouping(row);
        if (sibling) {
            resetChildRowGrouping(sibling);
        }
        row.parent = rootNode;
        if (canResetTreeNode) {
            row.treeParent = null;
        }
        row.group = false;
        row.updateHasChildren();
    }
    rootNode.updateHasChildren();
};

const resetChildRowGrouping = <TData>(row: RowNode<TData>): void => {
    row.key = null;
    row.treeNodeFlags = 0;
    row.allChildrenCount = null;
    row.childrenAfterGroup = null;
    row.childrenAfterAggFilter = null;
    row.childrenAfterFilter = null;
    row.childrenAfterSort = null;
    row.childrenMapped = null;
    row.level = 0;
    row._groupData = undefined;
};
