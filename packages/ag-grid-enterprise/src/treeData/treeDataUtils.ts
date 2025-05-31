import { _ROW_ID_PREFIX_ROW_GROUP, _warn } from 'ag-grid-community';

import type { GroupingRowNode } from '../rowHierarchy/rowHierarchyUtils';

/** Maximum number of duplicates to warn about per node, to avoid flooding the console */
const MAX_DUPLICATES_TO_WARN = 15;

export const makeFillerRowId = (treeParent: GroupingRowNode<any>, key: string, level: number): string => {
    let id = level + '-' + key;
    let current = treeParent;
    while (--level >= 0) {
        id = level + '-' + current.key + '-' + id;
        current = current.treeParent!;
    }
    return _ROW_ID_PREFIX_ROW_GROUP + id;
};

export type NodesByPathMap<TData> = Map<string, GroupingRowNode<TData>> & {
    dupPaths?: Map<string, GroupingRowNode<TData>[]>;
};

export const addNodeByPath = <TData>(
    map: NodesByPathMap<TData>,
    pathKey: string,
    node: GroupingRowNode<TData>
): void => {
    const existing = map.get(pathKey);
    if (existing === undefined) {
        map.set(pathKey, node);
        return;
    }
    if (node.sourceRowIndex < existing.sourceRowIndex) {
        map.set(pathKey, node); // We choose the node with the lowest sourceRowIndex
    }
    if (existing !== node) {
        const duplicates = map.dupPaths?.get(pathKey);
        if (!duplicates) {
            (map.dupPaths ??= new Map()).set(pathKey, [existing, node]);
        } else if (duplicates.length < MAX_DUPLICATES_TO_WARN) {
            duplicates.push(node);
        }
    }
};

export const warnDuplicatePaths = <TData>({ dupPaths }: NodesByPathMap<TData>): void => {
    if (dupPaths) {
        for (const duplicates of dupPaths.values()) {
            const row = duplicates.sort((a, b) => a.sourceRowIndex - b.sourceRowIndex)[0];
            _warn(186, { rowId: row.id, rowData: row.data, duplicateRowsData: duplicates.slice(1).map((x) => x.data) }); // Duplicate path
        }
    }
};

export const updateAllLeafChildren = <TData>(row: GroupingRowNode<TData>, len: number, changed: boolean): boolean => {
    let leafs = row.allLeafChildren;
    let result = (leafs?.length || 0) !== len;
    if (len === 0) {
        if (leafs !== null) {
            row.allLeafChildren = null;
            const sibling = row.sibling;
            if (sibling) sibling.allLeafChildren = null;
        }
    } else if (result || changed) {
        if (!leafs) {
            row.allLeafChildren = leafs = new Array(len);
            const sibling = row.sibling;
            if (sibling) sibling.allLeafChildren = leafs;
        } else if (result) {
            leafs.length = len; // resize
        }
        const rows = row.childrenAfterGroup!;
        for (let i = 0, writeIdx = 0, childrenLen = rows.length; i < childrenLen; ++i) {
            const child = rows![i];
            if (child.data) {
                if ((result ||= leafs[writeIdx] !== child)) leafs[writeIdx] = child;
                ++writeIdx;
            }
            const childLeafs = child.allLeafChildren;
            if (childLeafs) {
                for (let j = 0, len = childLeafs.length; j < len; ++j, ++writeIdx) {
                    const leaf = childLeafs![j];
                    if ((result ||= leafs[writeIdx] !== leaf)) leafs[writeIdx] = leaf;
                }
            }
        }
    }
    return result;
};
