import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef } from '../entities/colDef';

/** Deep clones plain object properties of a definition. Functions, arrays, and class instances are kept by reference. */
function cloneColDef<T>(object: T): T {
    const obj = object as any;
    const res: any = {};
    for (const key of Object.keys(obj)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
        }
        const value = obj[key];
        if (typeof value === 'object' && value !== null && value.constructor === Object) {
            res[key] = cloneColDef(value);
        } else {
            res[key] = value;
        }
    }
    return res;
}

/** Builds an exportable array of ColDef/ColGroupDef from the current column state.
 *  Includes display order, grouping hierarchy, widths, visibility, sort, pinning, and agg state. */
export const exportColumnDefs = (beans: BeanCollection): (ColDef | ColGroupDef)[] | undefined => {
    const cm = beans.colModel;
    if (!cm.ready) {
        return undefined;
    }
    const colDefList = cm.colDefList;

    // Build rowGroup/pivot index maps for O(1) lookups
    const rgMap = new Map<AgColumn, number>();
    const rowGroupCols = beans.rowGroupColsSvc?.columns;
    if (rowGroupCols) {
        for (let i = 0, len = rowGroupCols.length; i < len; ++i) {
            rgMap.set(rowGroupCols[i], i);
        }
    }
    const pvMap = new Map<AgColumn, number>();
    const pivotCols = beans.pivotColsSvc?.columns;
    if (pivotCols) {
        for (let i = 0, len = pivotCols.length; i < len; ++i) {
            pvMap.set(pivotCols[i], i);
        }
    }

    // Get columns in display order (uses lastOrder during pivot to preserve pre-pivot order)
    const displayList = cm.getColOrderForExport();
    let cols: AgColumn[];
    if (displayList) {
        const colDefSet = new Set(colDefList);
        cols = [];
        for (let i = 0, len = displayList.length; i < len; ++i) {
            const col = displayList[i];
            if (colDefSet.delete(col)) {
                cols.push(col);
            }
        }
        for (const col of colDefSet) {
            cols.push(col);
        }
    } else {
        cols = colDefList;
    }

    const res: (ColDef | ColGroupDef)[] = [];
    const groupDefs = new Map<string, ColGroupDef>();

    for (let c = 0, cLen = cols.length; c < cLen; ++c) {
        const col = cols[c];
        const d = cloneColDef(col.colDef);
        d.colId = col.colId;
        d.width = col.getActualWidth();
        d.rowGroup = col.isRowGroupActive();
        d.rowGroupIndex = d.rowGroup ? rgMap.get(col) ?? null : null;
        d.pivot = col.isPivotActive();
        d.pivotIndex = d.pivot ? pvMap.get(col) ?? null : null;
        d.aggFunc = col.isValueActive() ? col.getAggFunc() : null;
        d.hide = col.isVisible() ? undefined : true;
        d.pinned = col.isPinned() ? col.getPinned() : null;
        d.sort = col.getSortDef();
        d.sortIndex = col.getSortIndex() ?? null;

        let addToResult = true;
        let childDef: ColDef | ColGroupDef = d;
        let pointer = col.getOriginalParent();
        while (pointer) {
            if (pointer.isPadding()) {
                pointer = pointer.getOriginalParent();
                continue;
            }
            const groupId = pointer.getGroupId();
            const existing = groupDefs.get(groupId);
            if (existing) {
                existing.children.push(childDef);
                addToResult = false;
                break;
            }
            const gd = cloneColDef(pointer.getColGroupDef());
            if (!gd) {
                break;
            }
            gd.groupId = groupId;
            gd.children = [childDef];
            groupDefs.set(groupId, gd);
            childDef = gd;
            pointer = pointer.getOriginalParent();
        }
        if (addToResult) {
            res.push(childDef);
        }
    }

    return res;
};
