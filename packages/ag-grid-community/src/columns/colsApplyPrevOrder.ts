import { _pushToMapArray } from 'ag-stack';

import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';

export const applyPrevColumnsOrder = (
    colsList: AgColumn[],
    colsById: Record<string, AgColumn>,
    prevOrder: string[]
): AgColumn[] => {
    const colsListLen = colsList.length;
    const prevOrderLen = prevOrder.length;
    // Fast path: same length and colId at every index -> already ordered (width/sort/hide-only refresh).
    if (colsListLen === prevOrderLen) {
        let inOrder = true;
        for (let i = 0; i < prevOrderLen; ++i) {
            if (colsList[i].colId !== prevOrder[i]) {
                inOrder = false;
                break;
            }
        }
        if (inOrder) {
            return colsList;
        }
    }
    // Phase 1: resolve prevOrder colIds to live cols. In-order walk keeps positions monotonic, so
    // `groupHighestLeaf` ends holding each group's highest leaf (the O(1) answer findPreviousSibling needs).
    const preservedOrder: AgColumn[] = [];
    const colPositionMap = new Map<AgColumn, number>();
    const groupHighestLeaf = new Map<AgProvidedColumnGroup, AgColumn>();
    for (let i = 0; i < prevOrderLen; ++i) {
        const current = colsById[prevOrder[i]];
        if (current != null) {
            colPositionMap.set(current, preservedOrder.length);
            preservedOrder.push(current);
            let g = current.originalParent;
            while (g != null) {
                groupHighestLeaf.set(g, current);
                g = g.originalParent;
            }
        }
    }
    if (preservedOrder.length === colsListLen) {
        return preservedOrder; // all preserved — order already correct
    }
    if (preservedOrder.length === 0) {
        return colsList; // no preserved anchors; keep current order (service cols already at head)
    }

    // Phase 2: bucket new cols. Service -> head; new calc col -> right after its (preserved) anchor,
    // so same-anchor adds stack newest-first; anchor not yet preserved (chained on a sibling added this
    // build) -> after `lastPreserved` (else front); unanchored calc -> tail (`endCalc`); rest -> `additionalCols`.
    const servicePrepend: AgColumn[] = [];
    const additionalCols: AgColumn[] = [];
    const frontCalc: AgColumn[] = [];
    const endCalc: AgColumn[] = [];
    let calcFollowers: Map<AgColumn, AgColumn[]> | null = null;
    let lastPreserved: AgColumn | null = null;
    for (let i = 0; i < colsListLen; ++i) {
        const col = colsList[i];
        if (colPositionMap.has(col)) {
            lastPreserved = col;
            continue;
        }
        const colKind = col.colKind;
        if (colKind === 'auto-group' || colKind === 'selection' || colKind === 'row-number') {
            servicePrepend.push(col);
        } else if (col.isCalculatedCol) {
            // Gated on `isCalculatedCol` for perf: only calc cols carry `anchoredToColId` today, so we
            // skip the field read for every other column (the field itself is column-kind agnostic).
            const anchorId = col.anchoredToColId;
            const anchor = anchorId != null ? colsById[anchorId] : undefined;
            if (anchor !== undefined && colPositionMap.has(anchor)) {
                calcFollowers ??= new Map<AgColumn, AgColumn[]>();
                _pushToMapArray(calcFollowers, anchor, col);
            } else if (anchorId == null) {
                endCalc.push(col);
            } else if (lastPreserved === null) {
                frontCalc.push(col);
            } else {
                calcFollowers ??= new Map<AgColumn, AgColumn[]>();
                _pushToMapArray(calcFollowers, lastPreserved, col);
            }
        } else {
            additionalCols.push(col);
        }
    }

    // Phase 3: resolve group-sibling anchors for non-calc additional cols (skipped for flat colDefs).
    let followers: Map<AgColumn, AgColumn[]> | null = null;
    let noSiblings: AgColumn[] = additionalCols;
    if (additionalCols.length > 0 && anyPreservedHasSiblings(preservedOrder)) {
        const partitioned = partitionBySiblings(additionalCols, colPositionMap, groupHighestLeaf);
        followers = partitioned.followers;
        noSiblings = partitioned.orphans;
    }

    // Phase 4: emit forward — service head, front calc, each preserved col with its calc then
    // group-sibling followers, then non-calc orphans, then end calc cols.
    const result = new Array<AgColumn>(colsListLen);
    let pos = 0;
    for (let i = 0, len = servicePrepend.length; i < len; ++i) {
        result[pos++] = servicePrepend[i];
    }
    for (let i = 0, len = frontCalc.length; i < len; ++i) {
        result[pos++] = frontCalc[i];
    }
    for (let i = 0, len = preservedOrder.length; i < len; ++i) {
        const col = preservedOrder[i];
        result[pos++] = col;
        const calcBucket = calcFollowers?.get(col);
        if (calcBucket !== undefined) {
            for (let j = 0, m = calcBucket.length; j < m; ++j) {
                result[pos++] = calcBucket[j];
            }
        }
        const bucket = followers?.get(col);
        if (bucket !== undefined) {
            for (let j = 0, m = bucket.length; j < m; ++j) {
                result[pos++] = bucket[j];
            }
        }
    }
    for (let i = 0, len = noSiblings.length; i < len; ++i) {
        result[pos++] = noSiblings[i];
    }
    for (let i = 0, len = endCalc.length; i < len; ++i) {
        result[pos++] = endCalc[i];
    }
    return result;
};

/** True when any preserved col sits in a group with siblings — i.e. there are anchors to resolve. */
const anyPreservedHasSiblings = (preservedOrder: AgColumn[]): boolean => {
    for (let i = 0, len = preservedOrder.length; i < len; ++i) {
        let ancestor = preservedOrder[i].originalParent;
        while (ancestor != null) {
            if (ancestor.children.length > 1) {
                return true;
            }
            ancestor = ancestor.originalParent;
        }
    }
    return false;
};

/** Map each `additionalCols` entry to its previous-refresh sibling anchor:
 *  `{ followers: anchor -> following cols, orphans: cols with no anchor }`. */
const partitionBySiblings = (
    additionalCols: AgColumn[],
    colPositionMap: Map<AgColumn, number>,
    groupHighestLeaf: Map<AgProvidedColumnGroup, AgColumn>
): { followers: Map<AgColumn, AgColumn[]>; orphans: AgColumn[] } => {
    const followers = new Map<AgColumn, AgColumn[]>();
    const orphans: AgColumn[] = [];
    for (let i = 0, len = additionalCols.length; i < len; ++i) {
        const col = additionalCols[i];
        const anchor = findPreviousSibling(col, colPositionMap, groupHighestLeaf);
        if (anchor == null) {
            orphans.push(col);
            continue;
        }
        _pushToMapArray(followers, anchor, col);
    }
    return { followers, orphans };
};

/** Walk up the parent chain for a cousin already in `positionMap`, returning the highest-positioned one.
 *  `groupHighestLeaf` gives a group subtree's highest leaf in O(1) (vs a recursive leaf walk). */
const findPreviousSibling = (
    col: AgColumn,
    positionMap: Map<AgColumn, number>,
    groupHighestLeaf: Map<AgProvidedColumnGroup, AgColumn>
): AgColumn | null => {
    let parent = col.originalParent;
    let currentGroup: AgProvidedColumnGroup | null = null;
    while (parent != null) {
        let highestIdx = -1;
        let highestSibling: AgColumn | null = null;
        const children = parent.children;
        for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            if (child === currentGroup || child === col) {
                continue;
            }
            let candidate: AgColumn | undefined;
            if (child.isColumn) {
                candidate = child;
            } else {
                candidate = groupHighestLeaf.get(child);
            }
            if (candidate !== undefined) {
                const idx = positionMap.get(candidate);
                if (idx !== undefined && idx > highestIdx) {
                    highestIdx = idx;
                    highestSibling = candidate;
                }
            }
        }
        if (highestSibling != null) {
            return highestSibling;
        }
        currentGroup = parent;
        parent = parent.originalParent;
    }
    return null;
};
