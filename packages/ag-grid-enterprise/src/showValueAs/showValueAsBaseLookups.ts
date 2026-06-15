import type { AgColumn, ColumnModel, IPivotResultColsService, IRowNode } from 'ag-grid-community';

import { adjacentSiblingKey, adjacentStep, childByKey, pivotResultCol, readNodeExact } from './showValueAsValueReaders';

/** The index of pivot dimension `baseField` within this pivot result column's `pivotKeys`, or `null` when not
 *  pivoting / `baseField` is not a pivot dimension. */
export const pivotDimIndex = (colModel: ColumnModel, column: AgColumn, baseField: string): number | null => {
    const pivotKeys = column.colDef.pivotKeys;
    if (!pivotKeys) {
        return null;
    }
    // pivotActiveIndex is the dimension's position in the pivot key path — O(1) vs scanning the pivot cols.
    const index = colModel.getCol(baseField)?.pivotActiveIndex ?? -1;
    return index >= 0 && index < pivotKeys.length ? index : null;
};

/** The distinct pivot key `step` positions from `column`'s at dimension `index`, among the columns matching its
 *  other keys and value field (the items of that dimension within the same parent group). */
const adjacentPivotKey = (
    pivotResultCols: IPivotResultColsService | undefined,
    column: AgColumn,
    index: number,
    step: number
): string | null => {
    const ordered = pivotResultCols?.getAggregationOrderedList();
    const { pivotKeys, pivotValueColumn } = column.colDef;
    if (!ordered || !pivotKeys || !pivotValueColumn) {
        return null;
    }
    const keysAtIndex: string[] = [];
    for (let i = 0, len = ordered.length; i < len; ++i) {
        const cd = ordered[i].colDef;
        const k = cd.pivotKeys;
        // Same value field, leaf (not a total) column, matching every other key.
        if (k && cd.pivotValueColumn === pivotValueColumn && !cd.pivotTotalColumnIds && k.length === pivotKeys.length) {
            let match = true;
            for (let j = 0, klen = k.length; j < klen; ++j) {
                if (j !== index && k[j] !== pivotKeys[j]) {
                    match = false;
                    break;
                }
            }
            if (match && !keysAtIndex.includes(k[index])) {
                keysAtIndex.push(k[index]);
            }
        }
    }
    const cur = keysAtIndex.indexOf(pivotKeys[index]);
    const target = cur + step;
    return cur >= 0 && target >= 0 && target < keysAtIndex.length ? keysAtIndex[target] : null;
};

/** This node's value in the sibling pivot column where the `index`-th pivot key is `baseItem` (an explicit value,
 *  or the adjacent distinct key for `(previous)`/`(next)`); the other pivot keys held fixed. */
export const pivotBaseValue = (
    pivotResultCols: IPivotResultColsService | undefined,
    node: IRowNode,
    column: AgColumn,
    index: number,
    baseItem: string | number
): number | bigint | null => {
    const { pivotKeys, pivotValueColumn } = column.colDef;
    if (!pivotResultCols || !pivotKeys || !pivotValueColumn) {
        return null;
    }
    const step = adjacentStep(baseItem);
    const targetKey = step != null ? adjacentPivotKey(pivotResultCols, column, index, step) : String(baseItem);
    if (targetKey == null) {
        return null;
    }
    if (targetKey === pivotKeys[index]) {
        return readNodeExact(node, column); // base is this column itself ⇒ 100% / zero difference
    }
    const keys = pivotKeys.slice();
    keys[index] = targetKey;
    const baseCol = pivotResultCol(pivotResultCols, keys, pivotValueColumn);
    return baseCol ? readNodeExact(node, baseCol) : null;
};

/** The cousin value where row-group dimension `baseField` is `baseItem`, the other group levels held fixed:
 *  navigate to the base field's ancestor, swap to the `baseItem` sibling, then re-descend the original keys.
 *  A leaf row resolves to the cousin group at its parent level (so it shows as a share of that, like the other
 *  modes). `null` when no such cousin exists. */
export const rowBaseValue = (
    colModel: ColumnModel,
    node: IRowNode,
    column: AgColumn,
    baseField: string,
    baseItem: string | number
): number | bigint | null => {
    // rowGroupActiveIndex is the field's group depth — O(1) vs scanning the row-group cols.
    const dimIndex = colModel.getCol(baseField)?.rowGroupActiveIndex ?? -1;
    // The base field must be at or above this node's level (a deeper field has no unique cousin here).
    if (dimIndex < 0 || node.level < dimIndex) {
        return null;
    }
    const path: IRowNode[] = [];
    for (let n: IRowNode | null = node; n; n = n.parent) {
        if (n.level >= 0) {
            path[n.level] = n;
        }
    }
    const dimNode = path[dimIndex];
    const siblings = dimNode?.parent?.childrenAfterSort;
    if (!siblings) {
        return null;
    }
    const step = adjacentStep(baseItem);
    const targetKey = step != null ? adjacentSiblingKey(siblings, dimNode, step) : String(baseItem);
    if (targetKey == null) {
        return null;
    }
    let cur: IRowNode | undefined = childByKey(siblings, targetKey);
    // Re-descend the original path below the swapped level — through group levels only, so a leaf row resolves to
    // its parent-level cousin group (leaf rows have no key to match).
    const deepestGroupLevel = node.group ? node.level : node.level - 1;
    for (let lvl = dimIndex + 1; cur && lvl <= deepestGroupLevel; ++lvl) {
        cur = childByKey(cur.childrenAfterSort, path[lvl]?.key);
    }
    return cur ? readNodeExact(cur, column) : null;
};
