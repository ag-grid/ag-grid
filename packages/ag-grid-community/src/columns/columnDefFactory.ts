import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { IColsService } from '../interfaces/iColsService';
import { SKIP_JS_BUILTINS } from '../utils/mergeDeep';

// returns copy of an object, doing a deep clone of any objects with that object.
// this is used for eg creating copies of Column Definitions, where we want to
// deep copy all objects, but do not want to deep copy functions (eg when user provides
// a function or class for colDef.cellRenderer)
/** @knipIgnore Used in tests */
export function _deepCloneDefinition<T>(object: T, keysToSkip?: string[]): T | undefined {
    if (!object) {
        return;
    }

    const obj = object as any;
    const res: any = {};

    for (const key of Object.keys(obj)) {
        if ((keysToSkip && keysToSkip.indexOf(key) >= 0) || SKIP_JS_BUILTINS.has(key)) {
            continue;
        }

        const value = obj[key];

        // 'simple object' means a bunch of key/value pairs, eg {filter: 'myFilter'}. it does
        // NOT include the following:
        // 1) arrays
        // 2) functions or classes (eg api instance)
        const sourceIsSimpleObject = typeof value === 'object' && value !== null && value.constructor === Object;

        if (sourceIsSimpleObject) {
            res[key] = _deepCloneDefinition(value);
        } else {
            res[key] = value;
        }
    }

    return res;
}

export class ColumnDefFactory extends BeanStub implements NamedBean {
    beanName = 'colDefFactory' as const;

    private rowGroupColsSvc?: IColsService;
    private pivotColsSvc?: IColsService;

    public wireBeans(beans: BeanCollection): void {
        this.rowGroupColsSvc = beans.rowGroupColsSvc;
        this.pivotColsSvc = beans.pivotColsSvc;
    }

    public getColumnDefs(
        colDefColsList: AgColumn[],
        showingPivotResult: boolean,
        lastOrder: string[] | null,
        colsList: AgColumn[],
        sorted: boolean = false
    ): (ColDef | ColGroupDef)[] | undefined {
        const cols = colDefColsList.slice();

        if (showingPivotResult) {
            // Position-map indexed by colId: O(N) build + O(N log N) sort, vs O(N²) repeated
            // `indexOf` walks. lastOrder is required when showingPivotResult is true (callers
            // captured it during the same refresh that set the flag).
            const order = lastOrder!;
            const idxById = new Map<string, number>();
            for (let i = 0, len = order.length; i < len; ++i) {
                idxById.set(order[i], i);
            }
            cols.sort((a, b) => (idxById.get(a.colId) ?? 0) - (idxById.get(b.colId) ?? 0));
        } else if (lastOrder || sorted) {
            const idxByCol = new Map<AgColumn, number>();
            for (let i = 0, len = colsList.length; i < len; ++i) {
                idxByCol.set(colsList[i], i);
            }
            cols.sort((a, b) => (idxByCol.get(a) ?? 0) - (idxByCol.get(b) ?? 0));
        }

        const rowGroupColumns = this.rowGroupColsSvc?.columns;
        const pivotColumns = this.pivotColsSvc?.columns;

        return this.buildColumnDefs(cols, rowGroupColumns, pivotColumns);
    }

    private buildColumnDefs(
        cols: AgColumn[],
        rowGroupColumns: AgColumn[] = [],
        pivotColumns: AgColumn[] = []
    ): (ColDef | ColGroupDef)[] {
        // Precompute (col → index) maps once instead of `indexOf` per col (which would be O(N²)
        // across all cols × rowGroup/pivot list lengths).
        const rowGroupIdx = indexCols(rowGroupColumns);
        const pivotIdx = indexCols(pivotColumns);

        const res: (ColDef | ColGroupDef)[] = [];
        const colGroupDefs: { [id: string]: ColGroupDef } = {};

        for (const col of cols) {
            const colDef = this.createDefFromColumn(col, rowGroupIdx, pivotIdx);

            let addToResult = true;
            let childDef: ColDef | ColGroupDef = colDef;

            let pointer = col.originalParent;
            let lastPointer: AgProvidedColumnGroup | null = null;
            while (pointer) {
                // Padding groups balance the tree depth-wise; they aren't user-defined so we skip them.
                if (pointer.padding) {
                    pointer = pointer.originalParent;
                    continue;
                }

                // if colDef for this group already exists, use it
                const existingParentDef = colGroupDefs[pointer.groupId];
                if (existingParentDef) {
                    existingParentDef.children.push(childDef);
                    addToResult = false;
                    break;
                }

                const parentDef = this.createDefFromGroup(pointer);

                if (parentDef) {
                    parentDef.children = [childDef];
                    colGroupDefs[parentDef.groupId!] = parentDef;
                    childDef = parentDef;
                    pointer = pointer.originalParent;
                }

                if (pointer != null && lastPointer === pointer) {
                    addToResult = false;
                    break;
                }
                // Ensure we don't get stuck in an infinite loop
                lastPointer = pointer;
            }

            if (addToResult) {
                res.push(childDef);
            }
        }

        return res;
    }

    private createDefFromGroup(group: AgProvidedColumnGroup): ColGroupDef | null | undefined {
        const defCloned = _deepCloneDefinition(group.getColGroupDef(), ['children']);

        if (defCloned) {
            defCloned.groupId = group.groupId;
        }

        return defCloned;
    }

    private createDefFromColumn(
        col: AgColumn,
        rowGroupIdx: Map<AgColumn, number>,
        pivotIdx: Map<AgColumn, number>
    ): ColDef {
        const colDefCloned = _deepCloneDefinition(col.colDef)!;
        const rowGroupActive = col.rowGroupActive;
        const pivotActive = col.pivotActive;

        colDefCloned.colId = col.colId;
        colDefCloned.width = col.getActualWidth();
        colDefCloned.rowGroup = rowGroupActive;
        colDefCloned.rowGroupIndex = rowGroupActive ? (rowGroupIdx.get(col) ?? -1) : null;
        colDefCloned.pivot = pivotActive;
        colDefCloned.pivotIndex = pivotActive ? (pivotIdx.get(col) ?? -1) : null;
        colDefCloned.aggFunc = col.aggregationActive ? col.aggFunc : null;
        colDefCloned.hide = col.visible ? undefined : true;
        const pinned = col.pinned;
        colDefCloned.pinned = pinned === 'left' || pinned === 'right' ? pinned : null;

        colDefCloned.sort = col.getSortDef();
        colDefCloned.sortIndex = col.sortIndex != null ? col.sortIndex : null;

        return colDefCloned;
    }
}

function indexCols(cols: AgColumn[]): Map<AgColumn, number> {
    const map = new Map<AgColumn, number>();
    for (let i = 0, len = cols.length; i < len; ++i) {
        map.set(cols[i], i);
    }
    return map;
}
