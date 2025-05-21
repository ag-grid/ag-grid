import type { BeanCollection, IsGroupOpenByDefaultParams, WithoutGridCommon } from 'ag-grid-community';
import { RowNode, _ROW_ID_PREFIX_ROW_GROUP, _warn } from 'ag-grid-community';

import type { GroupingRowNode } from '../rowHierarchy/rowHierarchyUtils';
import { _resetRowGroup } from '../rowHierarchy/rowHierarchyUtils';

export const makeFillerRowId = (path: string[], level: number): string => {
    let id = level + '-' + path[level];
    for (let i = level - 1; i >= 0; --i) {
        id = i + '-' + path[i] + '-' + id;
    }
    return _ROW_ID_PREFIX_ROW_GROUP + id;
};

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

export interface DuplicatePathRow<TData> {
    row: GroupingRowNode;
    data: TData[];
}

export type DuplicatePathRowMap<TData> = Map<string, DuplicatePathRow<TData>>;

export const addDuplicatePathRow = <TData>(
    map: DuplicatePathRowMap<TData> | undefined,
    pathKey: string,
    existing: GroupingRowNode<TData>,
    duplicate: GroupingRowNode<TData>
): DuplicatePathRowMap<TData> => {
    let entry: DuplicatePathRow<TData> | undefined;
    if (!map) {
        map = new Map();
    } else {
        entry = map.get(pathKey);
    }
    if (entry === undefined) {
        map.set(pathKey, {
            row: existing,
            data: [duplicate.data!],
        });
    } else {
        entry.data.push(duplicate.data!);
    }
    return map;
};

export const warnDuplicatePathRows = <TData>(map: Map<string, DuplicatePathRow<TData>>): void => {
    for (const entry of map.values()) {
        const row = entry.row;
        _warn(186, {
            rowId: row.id,
            rowData: row.data,
            duplicateRowsData: entry.data,
        }); // Duplicate path
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
