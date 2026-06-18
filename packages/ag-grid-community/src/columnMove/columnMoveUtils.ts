import { _indexMap } from 'ag-stack';

import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import { isProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { GridOptionsService } from '../gridOptionsService';

export function placeLockedColumns(cols: AgColumn[], gos: GridOptionsService): AgColumn[] {
    let leftCount = 0;
    let rightCount = 0;
    const len = cols.length;
    let firstLeftIdx = len;
    let lastLeftIdx = -1;
    let firstRightIdx = len;
    let lastRightIdx = -1;
    for (let i = 0; i < len; ++i) {
        const pos = cols[i].colDef.lockPosition;
        if (pos === 'right') {
            ++rightCount;
            if (firstRightIdx === len) {
                firstRightIdx = i;
            }
            lastRightIdx = i;
        } else if (pos === 'left' || pos === true) {
            ++leftCount;
            if (firstLeftIdx === len) {
                firstLeftIdx = i;
            }
            lastLeftIdx = i;
        }
    }
    if (leftCount === 0 && rightCount === 0) {
        return cols; // Fast path: no locked cols — input order is already correct.
    }
    let leftIdx: number;
    let normalIdx: number;
    let rightIdx: number;
    if (gos.get('enableRtl')) {
        if (lastRightIdx === rightCount - 1 && firstLeftIdx === len - leftCount) {
            return cols;
        }
        rightIdx = 0;
        normalIdx = rightCount;
        leftIdx = len - leftCount;
    } else {
        if (lastLeftIdx === leftCount - 1 && firstRightIdx === len - rightCount) {
            return cols;
        }
        leftIdx = 0;
        normalIdx = leftCount;
        rightIdx = len - rightCount;
    }
    const result = new Array<AgColumn>(len);
    for (let i = 0; i < len; ++i) {
        const col = cols[i];
        const pos = col.colDef.lockPosition;
        let idx: number;
        if (pos === 'right') {
            idx = rightIdx++;
        } else if (pos === 'left' || pos === true) {
            idx = leftIdx++;
        } else {
            idx = normalIdx++;
        }
        result[idx] = col;
    }
    return result;
}

/** Callers gate on `colModel.hasMarryChildren`, so a married group always exists here — the
 *  position-index Map is always needed, hence built eagerly. */
export function doesMovePassMarryChildren(
    allColumnsCopy: AgColumn[],
    gridBalancedTree: (AgColumn | AgProvidedColumnGroup)[]
): boolean {
    const positionByCol = _indexMap(allColumnsCopy);
    // Current married group's leaf spread; SMI scalars not an object (no alloc). Reset per accumulate.
    let min = 0;
    let max = 0;
    let count = 0;

    /** Walks the subtree, updating `min` / `max` / `count` with leaf positions in `positionByCol`. */
    const accumulate = (children: (AgColumn | AgProvidedColumnGroup)[]): void => {
        for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            if (isProvidedColumnGroup(child)) {
                accumulate(child.children);
                continue;
            }
            const idx = positionByCol.get(child) ?? -1;
            if (count === 0) {
                min = idx;
                max = idx;
            } else if (idx < min) {
                min = idx;
            } else if (idx > max) {
                max = idx;
            }
            ++count;
        }
    };

    const visit = (tree: (AgColumn | AgProvidedColumnGroup)[]): boolean => {
        for (let i = 0, len = tree.length; i < len; ++i) {
            const child = tree[i];
            if (!isProvidedColumnGroup(child)) {
                continue;
            }
            if (child.colGroupDef?.marryChildren) {
                count = 0;
                accumulate(child.children);
                if (count > 1 && max - min > count - 1) {
                    return false;
                }
            }
            if (!visit(child.children)) {
                return false;
            }
        }
        return true;
    };

    return visit(gridBalancedTree);
}
