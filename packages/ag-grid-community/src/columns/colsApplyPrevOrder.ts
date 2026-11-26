import { _pushToMapArray } from 'ag-stack';

import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ICalculatedColumnsService } from '../interfaces/iCalculatedColumns';
import { _isMatchedAtId } from './columnTree/matching/columnMatcher';

export const applyPrevColumnsOrder = (
    colsList: AgColumn[],
    colsById: Record<string, AgColumn>,
    prevOrder: AgColumn[],
    calculatedColsSvc: ICalculatedColumnsService | undefined
): AgColumn[] => {
    const colsListLen = colsList.length;
    const prevOrderLen = prevOrder.length;
    // Fast path: same length and column at every index -> already ordered (width/sort/hide-only refresh).
    if (colsListLen === prevOrderLen) {
        let same = 0;
        while (same < prevOrderLen && colsList[same] === prevOrder[same]) {
            ++same;
        }
        if (same === prevOrderLen) {
            return colsList;
        }
    }
    // Phase 1: resolve prevOrder colIds to live cols. In-order walk keeps positions monotonic, so
    // `groupHighestLeaf` ends holding each group's highest leaf (the O(1) answer findPreviousSibling needs).
    const preservedOrder: AgColumn[] = [];
    const colPositionMap = new Map<AgColumn, number>();
    const groupHighestLeaf = new Map<AgProvidedColumnGroup, AgColumn>();
    let hasPreservedAutoGroup = false;
    for (let i = 0; i < prevOrderLen; ++i) {
        const prev = prevOrder[i];
        const current = colsById[prev.colId];
        if (current != null && isSameCol(prev, current)) {
            colPositionMap.set(current, preservedOrder.length);
            preservedOrder.push(current);
            hasPreservedAutoGroup ||= current.colKind === 'auto-group';
            let g = current.originalParent;
            while (g != null) {
                groupHighestLeaf.set(g, current);
                g = g.originalParent;
            }
        }
    }
    if (hasPreservedAutoGroup) {
        resnapAutoGroupCols(preservedOrder, colsList, colPositionMap);
    }
    if (preservedOrder.length === colsListLen) {
        return preservedOrder; // all preserved — order already correct
    }
    if (preservedOrder.length === 0) {
        // no preserved anchors; keep current order (service cols already at head), calculated cols seated
        return calculatedColsSvc?.seatCalculatedCols(colsList, colsById, colPositionMap) ?? colsList;
    }

    // Phase 2: bucket new cols. New service col -> after the preserved service col it trails (front if none),
    // so a runtime-added auto col stays with its siblings; rest -> `additionalCols`.
    const serviceFront: AgColumn[] = [];
    const additionalCols: AgColumn[] = [];
    let serviceFollowers: Map<AgColumn, AgColumn[]> | null = null;
    let lastPreserved: AgColumn | null = null;
    for (let i = 0; i < colsListLen; ++i) {
        const col = colsList[i];
        if (colPositionMap.has(col)) {
            lastPreserved = col;
            continue;
        }
        const colKind = col.colKind;
        if (colKind === 'auto-group' || colKind === 'selection' || colKind === 'row-number') {
            if (lastPreserved === null) {
                serviceFront.push(col);
            } else {
                serviceFollowers ??= new Map<AgColumn, AgColumn[]>();
                _pushToMapArray(serviceFollowers, lastPreserved, col);
            }
        } else {
            additionalCols.push(col);
        }
    }

    // Phase 3: resolve group-sibling anchors for additional cols (skipped for flat colDefs).
    let followers: Map<AgColumn, AgColumn[]> | null = null;
    let noSiblings: AgColumn[] = additionalCols;
    if (additionalCols.length > 0 && anyPreservedHasSiblings(preservedOrder)) {
        const partitioned = partitionBySiblings(additionalCols, colPositionMap, groupHighestLeaf);
        followers = partitioned.followers;
        noSiblings = partitioned.orphans;
    }

    // Phase 4: emit forward — front service cols, each preserved col with its trailing service cols then
    // group-sibling followers, then orphans; calculated cols are then seated after their sources.
    const result = new Array<AgColumn>(colsListLen);
    let pos = 0;
    for (let i = 0, len = serviceFront.length; i < len; ++i) {
        result[pos++] = serviceFront[i];
    }
    for (let i = 0, len = preservedOrder.length; i < len; ++i) {
        const col = preservedOrder[i];
        result[pos++] = col;
        const serviceBucket = serviceFollowers?.get(col);
        if (serviceBucket !== undefined) {
            for (let j = 0, m = serviceBucket.length; j < m; ++j) {
                result[pos++] = serviceBucket[j];
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
    return calculatedColsSvc?.seatCalculatedCols(result, colsById, colPositionMap) ?? result;
};

/** The object, or one a later build recreated at its id from the same source as the matcher would pair them. */
const isSameCol = (prev: AgColumn, current: AgColumn): boolean => {
    if (current === prev) {
        return true;
    }
    const prevPivotValue = prev.pivotValueColumn;
    // A pivot result column outlives its value column across `columnDefs: []`: that column's check below judges it.
    if (prevPivotValue == null && prev.buildToken === current.createdBuildToken && prev.buildToken > 0) {
        return false; // the build that created `current` destroyed `prev`: matching kept them apart
    }
    return (
        isSameSource(prev.derivedFromCol, current.derivedFromCol) &&
        isSameSource(prevPivotValue, current.pivotValueColumn) &&
        _isMatchedAtId(prev, current)
    );
};

/** `isSameCol` judges columns at one id; a pivot total column's id leaves out its value column's. */
const isSameSource = (prev: AgColumn | null | undefined, current: AgColumn | null | undefined): boolean =>
    prev == null || current == null
        ? prev == null && current == null
        : prev.colId === current.colId && isSameCol(prev, current);

/** Re-seat preserved auto-group cols into `colsList` (hierarchy) order without moving their slots: each
 *  auto-col position in `preservedOrder` takes the next preserved auto col as `colsList` lists them. */
const resnapAutoGroupCols = (
    preservedOrder: AgColumn[],
    colsList: AgColumn[],
    colPositionMap: Map<AgColumn, number>
): void => {
    let autoIdx = 0;
    const colsListLen = colsList.length;
    for (let i = 0, len = preservedOrder.length; i < len; ++i) {
        if (preservedOrder[i].colKind !== 'auto-group') {
            continue;
        }
        while (autoIdx < colsListLen) {
            const candidate = colsList[autoIdx++];
            if (candidate.colKind === 'auto-group' && colPositionMap.has(candidate)) {
                preservedOrder[i] = candidate;
                colPositionMap.set(candidate, i); // keep the position map in step with the reordered slot
                break;
            }
        }
    }
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
