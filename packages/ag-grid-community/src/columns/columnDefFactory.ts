import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import { _isPlainObject, _isProtoPollutionKey } from '../utils/mergeDeep';
import type { ColumnModel } from './columnModel';

// Deep-clones a ColDef; functions/classes (eg cellRenderer) are copied by reference.
/** @knipIgnore Used in tests */
export function _deepCloneDefinition<T>(object: T, rootKeyToSkip?: string): T | undefined {
    if (!object) {
        return;
    }
    const obj = object as any;
    const res: any = {};
    for (const key of Object.keys(obj)) {
        if (key === rootKeyToSkip || _isProtoPollutionKey(key)) {
            continue;
        }
        const value = obj[key];
        if (_isPlainObject(value)) {
            res[key] = _deepCloneDefinition(value);
        } else {
            res[key] = value;
        }
    }
    return res;
}

export class ColumnDefFactory extends BeanStub implements NamedBean {
    beanName = 'colDefFactory' as const;

    private colModel: ColumnModel;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
    }

    /** Snapshot of the column tree as `ColDef[] | ColGroupDef[]`, display-ordered. Backs `getColumnDefs`. */
    public getColumnDefs(): (ColDef | ColGroupDef)[] | undefined {
        const colModel = this.colModel;
        if (!colModel.ready) {
            return undefined;
        }
        const colDefColsList = colModel.colDefList;
        // Pivot primaries keep their pre-pivot `colsListIndex` (absent from the pivot `colsList`) — the order to report.
        colModel.ensureColsListIndex();
        const cols = colDefColsList.slice().sort(byColsListIndex);

        const res: (ColDef | ColGroupDef)[] = [];
        const colGroupDefs: { [id: string]: ColGroupDef } = Object.create(null);
        const maxAncestors = colModel.colDefTreeDepth + 1;

        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            // Skip hierarchy virtuals — round-tripping them through updateGridOptions causes `_1`-suffixed dupes.
            if (col.colKind === 'hierarchy') {
                continue;
            }
            const colDef = createDefFromColumn(col);

            let addToResult = true;
            let childDef: ColDef | ColGroupDef = colDef;

            let pointer = col.originalParent;
            let ancestors = 0;
            while (pointer) {
                if (++ancestors > maxAncestors) {
                    break; // safety net for malformed (cyclic) chain — bail rather than hang
                }
                // Padding groups balance tree depth; not user-defined, so skip.
                if (pointer.padding) {
                    pointer = pointer.originalParent;
                    continue;
                }
                // Sibling already built this group — nest under it and stop (also breaks any malformed parent cycle).
                const existingParentDef = colGroupDefs[pointer.groupId];
                if (existingParentDef) {
                    existingParentDef.children.push(childDef);
                    addToResult = false;
                    break;
                }
                const parentDef = _deepCloneDefinition(pointer.colGroupDef, 'children');
                if (!parentDef) {
                    addToResult = false;
                    break;
                }
                parentDef.groupId = pointer.groupId;
                parentDef.children = [childDef];
                colGroupDefs[parentDef.groupId] = parentDef;
                childDef = parentDef;
                pointer = pointer.originalParent;
            }

            if (addToResult) {
                res.push(childDef);
            }
        }

        return res;
    }
}

/** User-facing `ColDef` from a live column's runtime state (width, sort, pin, agg, …). */
const createDefFromColumn = (col: AgColumn): ColDef => {
    const { colId, colDef, actualWidth, aggregationActive, rowGroupActive, visible, pivotActive, pinned } = col;
    const colDefCloned = _deepCloneDefinition(colDef)!;
    colDefCloned.colId = colId;
    colDefCloned.width = actualWidth;
    colDefCloned.rowGroup = rowGroupActive;
    // `rowGroupActiveIndex`/`pivotActiveIndex` are stamped on each active col by its cols service (valid when active).
    colDefCloned.rowGroupIndex = rowGroupActive ? col.rowGroupActiveIndex : null;
    colDefCloned.pivot = pivotActive;
    colDefCloned.pivotIndex = pivotActive ? col.pivotActiveIndex : null;
    colDefCloned.aggFunc = aggregationActive ? col.aggFunc : null;
    colDefCloned.hide = visible ? undefined : true;
    colDefCloned.pinned = pinned === 'left' || pinned === 'right' ? pinned : null;
    colDefCloned.sort = col.getSortDef();
    colDefCloned.sortIndex = col.sortIndex ?? null;
    return colDefCloned;
};

/** Sort comparator by `colsListIndex` (display order). */
const byColsListIndex = (a: AgColumn, b: AgColumn): number => a.colsListIndex - b.colsListIndex;
