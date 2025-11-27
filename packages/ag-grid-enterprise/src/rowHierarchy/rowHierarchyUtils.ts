import type {
    Bean,
    BeanCollection,
    GridOptions,
    GridOptionsService,
    IRowNode,
    NestedDataGetter,
    RowNode,
    StageExecuteParams,
} from 'ag-grid-community';

export interface IRowGroupingStrategy<TData = any> extends Bean {
    /** Getter for grid option treeDataChildrenField, only not null for tree nested data. */
    readonly nestedDataGetter?: NestedDataGetter<TData> | null;

    /** Map of group nodes (for grouping) or filler nodes (for treeData) by their id. Used by ClientSideRowModel. */
    readonly nonLeafsById: ReadonlyMap<string, RowNode<TData>> | null;

    onPropChange?(changedProps: ReadonlySet<keyof GridOptions<any>> | null): void;

    onShowRowGroupColsSetChanged(): void;

    execute(params: StageExecuteParams<TData>): boolean | undefined | void;

    /** Used to lazily compute and store groupData for a row node */
    loadGroupData(node: RowNode<TData>): Record<string, any> | null;

    /** Clears any cached group/filler nodes maintained by the strategy. */
    clearNonLeafs(): void;
}

/**
 * Returns if the node and all of its parents are all firstChild until ancestor node is reached
 * This is to check for [groupHideOpenParents] where we only show the expand controls for first child of a group
 *
 * @returns returns if node and all of its parents are first child until ancestor node is reached
 */
export function _isHiddenParent(node: RowNode, ancestor: RowNode, gos: GridOptionsService): boolean {
    let currentNode = node;

    const levelDiff = currentNode.level - ancestor.level;
    if (levelDiff <= 0) {
        return false;
    }

    const isHideOpenParents = gos.get('groupHideOpenParents');
    if (!isHideOpenParents) {
        return false;
    }

    for (let i = 0; i < levelDiff; i++) {
        const isFirstChild = currentNode.parent?.getFirstChild() === currentNode;
        if (!isFirstChild) {
            return false;
        }
        currentNode = currentNode.parent!;
    }
    return currentNode === ancestor;
}

export const _getRowDefaultExpanded = (
    beans: BeanCollection,
    rowNode: IRowNode,
    level: number,
    group = rowNode.group
): boolean => {
    const gos = beans.gos;
    // see AG-11476 isGroupOpenByDefault callback doesn't apply to master/detail grid
    // We call isGroupOpenByDefault only for group nodes and not for master/detail leafs
    const isGroupOpenByDefault = group && gos.get('isGroupOpenByDefault');
    if (!isGroupOpenByDefault) {
        const groupDefaultExpanded = gos.get('groupDefaultExpanded');
        return groupDefaultExpanded === -1 || level < groupDefaultExpanded;
    }
    const params = {
        api: beans.gridApi,
        context: beans.gridOptions.context,
        rowNode,
        field: rowNode.field!,
        key: rowNode.key!,
        level,
        rowGroupColumn: rowNode.rowGroupColumn!,
    };
    return isGroupOpenByDefault(params) == true;
};
