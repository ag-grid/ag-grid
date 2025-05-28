import type { BeanCollection, IsGroupOpenByDefaultParams, WithoutGridCommon } from 'ag-grid-community';
import { RowNode, _warn } from 'ag-grid-community';

import type { GroupingRowNode } from '../rowHierarchy/rowHierarchyUtils';
import { _resetRowGroup } from '../rowHierarchy/rowHierarchyUtils';

export const newFillerRow = <TData>(
    beans: BeanCollection,
    id: string,
    key: string,
    parent: GroupingRowNode<TData>
): GroupingRowNode<TData> => {
    const filler: GroupingRowNode<TData> = new RowNode<TData>(beans);
    filler.id = id;
    filler.key = key;
    filler.group = true;
    filler.field = null;
    filler.leafGroup = false;
    filler.rowGroupIndex = null;
    filler.allChildrenCount = null;
    filler.treeParent = parent;
    return filler;
};

export const destroyFillerRow = <TData>(node: GroupingRowNode<TData>): void => {
    _resetRowGroup(node);
    node.parent = null;
    node.treeParent = null;
    node.clearRowTopAndRowIndex();
};

export type DuplicatePathRowMap<TData> = Map<string, GroupingRowNode<TData>[]>;

export const addDuplicatePathRow = <TData>(
    map: DuplicatePathRowMap<TData> | undefined,
    pathKey: string,
    existing: GroupingRowNode<TData>,
    duplicate: GroupingRowNode<TData>
): DuplicatePathRowMap<TData> => {
    let array: GroupingRowNode<TData>[] | undefined;
    if (!map) {
        map = new Map();
    } else {
        array = map.get(pathKey);
    }
    if (array === undefined) {
        map.set(pathKey, [existing, duplicate]);
    } else {
        array.push(duplicate);
    }
    return map;
};

const compareSourceRowIndex = <TData>(a: GroupingRowNode<TData>, b: GroupingRowNode<TData>): number =>
    a.sourceRowIndex - b.sourceRowIndex;

export const warnDuplicatePathRows = <TData>(map: DuplicatePathRowMap<TData>): void => {
    for (const array of map.values()) {
        array.sort(compareSourceRowIndex);
        const row = array[0];
        const length = array.length;
        const duplicateRowsData = new Array(array.length - 1);
        for (let i = 1; i < length; i++) {
            duplicateRowsData[i - 1] = array[i].data;
        }
        _warn(186, { rowId: row.id, rowData: row.data, duplicateRowsData }); // Duplicate path
    }
};

export type IsGroupOpenByDefaultCallback =
    | ((params: WithoutGridCommon<IsGroupOpenByDefaultParams>) => boolean)
    | undefined;

export const getExpandedInitialValue = (
    isGroupOpenByDefault: IsGroupOpenByDefaultCallback,
    expandByDefault: number,
    row: RowNode
): boolean => {
    return isGroupOpenByDefault
        ? isGroupOpenByDefault({
              rowNode: row,
              field: row.field!,
              key: row.key!,
              level: row.level,
              rowGroupColumn: row.rowGroupColumn!,
          }) == true
        : expandByDefault === -1 || row.level < expandByDefault;
};

export const updateRootArrays = <TData>(
    rootNode: GroupingRowNode<TData>,
    rootChildrenAfterGroup: GroupingRowNode<TData>[]
) => {
    rootNode.childrenAfterFilter = rootChildrenAfterGroup;
    rootNode.childrenAfterAggFilter = rootChildrenAfterGroup;
    rootNode.childrenAfterSort = rootChildrenAfterGroup;
    const sibling = rootNode.sibling;
    if (sibling) {
        sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
        sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
        sibling.childrenAfterSort = rootNode.childrenAfterSort;
    }
};

export const updateRowArrays = <TData>(row: GroupingRowNode<TData>, childrenAfterGroup: GroupingRowNode<TData>[]) => {
    row.allLeafChildren ??= null;
    row.childrenAfterFilter ??= childrenAfterGroup;
    row.childrenAfterAggFilter ??= childrenAfterGroup;
    row.childrenAfterSort ??= childrenAfterGroup;
    const sibling = row.sibling;
    if (sibling) {
        sibling.allLeafChildren = row.allLeafChildren;
        sibling.childrenAfterGroup = row.childrenAfterGroup;
        sibling.childrenAfterAggFilter = row.childrenAfterAggFilter;
        sibling.childrenAfterFilter = row.childrenAfterFilter;
        sibling.childrenAfterSort = row.childrenAfterSort;
    }
};

export const updateAllLeafChildren = <TData>(
    row: GroupingRowNode<TData>,
    allLeafChildren: GroupingRowNode<TData>[] | null,
    newAllLeafChildrenLen: number
): boolean => {
    if (newAllLeafChildrenLen === 0) {
        if (allLeafChildren) {
            row.allLeafChildren = null;
            return !!allLeafChildren?.length;
        }
        return false;
    }

    let changed = false;
    if (!allLeafChildren) {
        allLeafChildren = row.allLeafChildren = new Array(newAllLeafChildrenLen);
        changed = true;
    } else if (allLeafChildren.length !== newAllLeafChildrenLen) {
        allLeafChildren.length = newAllLeafChildrenLen;
        changed = true;
    }

    let writeIdx = 0;
    const childrenAfterGroup = row.childrenAfterGroup;
    if (childrenAfterGroup) {
        for (const child of childrenAfterGroup) {
            if (child.data) {
                changed ||= allLeafChildren[writeIdx] !== child;
                allLeafChildren[writeIdx++] = child;
            }
            const childLeafChildren = child.allLeafChildren;
            if (childLeafChildren) {
                for (const leaf of childLeafChildren) {
                    changed ||= allLeafChildren[writeIdx] !== leaf;
                    allLeafChildren[writeIdx++] = leaf;
                }
            }
        }
    }
    return changed;
};

export const addProcessedNodes = <TData>(processedNodes: Set<GroupingRowNode<TData>>, row: GroupingRowNode<TData>) => {
    processedNodes.add(row);
    const childrenAfterGroup = row.childrenAfterGroup;
    if (childrenAfterGroup) {
        for (const child of childrenAfterGroup) {
            addProcessedNodes(processedNodes, child);
        }
    }
};
