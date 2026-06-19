import type {
    AgColumn,
    BeanCollection,
    Column,
    GridApi,
    IRowNode,
    ShowValuesAsColumnLists,
    ShowValuesAsMenuParams,
    ShowValuesAsType,
} from 'ag-grid-community';

/** Max dimension-item entries listed in a field's submenu, and max nodes expanded per level while collecting
 *  them — bounds the work and keeps the menu usable on large data. */
const DIMENSION_ITEMS_CAP = 100;
const DIMENSION_WALK_CAP = 10000;

/** The candidate columns a mode's menu can offer, plus the `getColumn` / `dimensionItems` helpers — computed
 *  lazily from the active row-group / pivot / value columns and shared across a column's modes (a mode reading
 *  only `rowGroups` never computes `valueColumns`, and the shared instance is not recomputed per mode). */
export class ShowValuesAsColumnListsImpl implements ShowValuesAsColumnLists {
    private _rowGroups?: AgColumn[];
    private _dimensions?: AgColumn[];
    private _valueColumns?: AgColumn[];

    constructor(
        public readonly column: AgColumn,
        private readonly _beans: BeanCollection
    ) {}

    /** Active row-group fields, excluding the mode's own column. */
    public get rowGroups(): AgColumn[] {
        if (!this._rowGroups) {
            const set = new Set<AgColumn>();
            collectColumns(this._beans.rowGroupColsSvc?.columns, this.column, set);
            this._rowGroups = Array.from(set);
        }
        return this._rowGroups;
    }

    /** Active dimension fields (row-group ⊕ pivot), excluding the mode's own column. */
    public get dimensions(): AgColumn[] {
        if (!this._dimensions) {
            const set = new Set<AgColumn>(this.rowGroups);
            collectColumns(this._beans.pivotColsSvc?.columns, this.column, set);
            this._dimensions = Array.from(set);
        }
        return this._dimensions;
    }

    /** Value (aggregated) columns other than this measure (cleanly resolved while pivoting via the same keys);
     *  the dimension fields are excluded. */
    public get valueColumns(): AgColumn[] {
        if (!this._valueColumns) {
            const dims = new Set<AgColumn>(this.dimensions);
            const ownField = (this.column.colDef.pivotValueColumn as AgColumn | null) ?? this.column;
            const result: AgColumn[] = [];
            const valueCols = this._beans.valueColsSvc?.columns;
            for (let i = 0, len = valueCols?.length ?? 0; i < len; ++i) {
                const col = valueCols![i];
                if (col !== ownField && !dims.has(col)) {
                    result.push(col);
                }
            }
            this._valueColumns = result;
        }
        return this._valueColumns;
    }

    /** Distinct items (display order) of dimension field `field` — its pivot keys while pivoting, else its
     *  row-group keys. Capped to keep the menu usable on large data. */
    public dimensionItems(field: string | Column): string[] {
        const fieldId = typeof field === 'string' ? field : field.getColId();
        const beans = this._beans;
        const pivotCols = beans.pivotColsSvc?.columns;
        if (pivotCols && beans.colModel.isPivotActive()) {
            for (let i = 0, len = pivotCols.length; i < len; ++i) {
                if (pivotCols[i].getColId() === fieldId) {
                    return pivotDimensionItems(beans, i);
                }
            }
        }
        return rowDimensionItems(beans, fieldId);
    }

    public getColumn(colId: string): AgColumn | null {
        return this._beans.colModel.getCol(colId) ?? null;
    }
}

/** Distinct keys of the `index`-th pivot dimension, across the leaf pivot result columns. */
const pivotDimensionItems = (beans: BeanCollection, index: number): string[] => {
    const ordered = beans.pivotResultCols?.getAggregationOrderedList();
    if (!ordered) {
        return [];
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (let i = 0, len = ordered.length; i < len && result.length < DIMENSION_ITEMS_CAP; ++i) {
        const k = ordered[i].colDef.pivotKeys;
        if (k && index < k.length && !seen.has(k[index])) {
            seen.add(k[index]);
            result.push(k[index]);
        }
    }
    return result;
};

/** Distinct group keys at the row-group level of `fieldId`, walking the grouped row model to that depth. */
const rowDimensionItems = (beans: BeanCollection, fieldId: string): string[] => {
    const root = beans.rowModel.rootNode;
    // rowGroupActiveIndex is the field's group depth — O(1) vs scanning the row-group cols.
    const level = beans.colModel.getCol(fieldId)?.rowGroupActiveIndex ?? -1;
    if (!root || level < 0) {
        return [];
    }
    // Walk childrenAfterSort so the listed items follow display order.
    let frontier: IRowNode[] = root.childrenAfterSort ?? [];
    for (let depth = 0; depth < level && frontier.length; ++depth) {
        const next: IRowNode[] = [];
        for (let i = 0, len = frontier.length; i < len && next.length < DIMENSION_WALK_CAP; ++i) {
            const kids = frontier[i].childrenAfterSort;
            if (kids) {
                for (let j = 0, klen = kids.length; j < klen && next.length < DIMENSION_WALK_CAP; ++j) {
                    next.push(kids[j]);
                }
            }
        }
        frontier = next;
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (let i = 0, len = frontier.length; i < len && result.length < DIMENSION_ITEMS_CAP; ++i) {
        const key = frontier[i].key;
        if (key != null && !seen.has(key)) {
            seen.add(key);
            result.push(key);
        }
    }
    return result;
};

/** Per-mode {@link ShowValuesAsMenuParams}: a class with prototype methods. The column lists are created lazily
 *  on first access; `apply` delegates to the service bean, which owns the selection state. */
export class ShowValuesAsMenuParamsImpl implements ShowValuesAsMenuParams {
    constructor(
        public readonly api: GridApi,
        public readonly context: any,
        private readonly _beans: BeanCollection,
        public readonly column: AgColumn,
        public readonly type: ShowValuesAsType,
        public readonly active: boolean,
        public readonly columnLists: ShowValuesAsColumnListsImpl
    ) {}

    public get currentParams(): any {
        return this.active ? this.column.showValuesAs?.params : undefined;
    }

    public apply(params?: any): void {
        this._beans.showValuesAsSvc?.setColumnShowValuesAs(
            this.column,
            params != null ? { type: this.type, params } : this.type
        );
    }
}

/** Adds to `set` the columns in `cols` other than `column` (the Set dedupes a field that is both a row-group
 *  and a pivot field). */
const collectColumns = (cols: AgColumn[] | undefined, column: AgColumn, set: Set<AgColumn>): void => {
    if (cols) {
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            if (col !== column) {
                set.add(col);
            }
        }
    }
};
