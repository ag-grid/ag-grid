import type {
    AgColumn,
    BeanCollection,
    GridApi,
    IRowNode,
    RowNode,
    ShowValueAsTransformParams,
} from 'ag-grid-community';

import { pivotBaseValue, pivotDimIndex, rowBaseValue } from './showValueAsBaseLookups';
import {
    adjacentStep,
    pivotResultCol,
    readAggScalar,
    readNodeExact,
    readNodeValue,
    unwrapAggValue,
} from './showValueAsValueReaders';

export class ShowValueAsTransformParamsImpl implements ShowValueAsTransformParams {
    private _rawValue: any = this;

    constructor(
        public readonly api: GridApi,
        public readonly context: any,
        private readonly _beans: BeanCollection,
        public readonly column: AgColumn,
        public readonly node: IRowNode,
        public readonly aggValue: any,
        public readonly params: any
    ) {}

    public get rawValue(): any {
        let value = this._rawValue;
        if (value === this) {
            value = unwrapAggValue(this.aggValue);
            this._rawValue = value;
        }
        return value;
    }

    /** This column's total down the rows: the grand total when not pivoting, this pivot column's total when pivoting. */
    public columnTotal(): number | null {
        const root = this._beans.rowModel.rootNode;
        return root ? readAggScalar(root, this.column) : null;
    }

    /** The overall total: equal to {@link columnTotal} when not pivoting; when pivoting, the value field summed
     *  across all its pivot columns (the 2-D grand total, not just this pivot column). */
    public grandTotal(): number | null {
        const root = this._beans.rowModel.rootNode;
        if (!root) {
            return null;
        }
        return this._beans.colModel.isPivotActive() ? this.rowTotalAt(root) : readAggScalar(root, this.column);
    }

    public parentTotal(): number | null {
        const parent = this.node.parent;
        return parent ? readAggScalar(parent, this.column) : null;
    }

    public parentColumnTotal(): number | null {
        const { pivotKeys, pivotValueColumn } = this.column.colDef;
        if (!pivotKeys || !pivotValueColumn || pivotKeys.length === 0) {
            // a top-level pivot column has no parent column
            return null;
        }
        const parentCol = pivotResultCol(this._beans.pivotResultCols, pivotKeys.slice(0, -1), pivotValueColumn);
        return parentCol ? readAggScalar(this.node, parentCol) : null;
    }

    /** Row total along the column axis: when pivoting, this value field summed across its pivot columns at the
     *  node; otherwise the cell's own value (a single field's row total is itself ⇒ 100%). */
    public rowTotal(): number | null {
        return this.rowTotalAt(this.node);
    }

    private rowTotalAt(node: IRowNode): number | null {
        const column = this.column;
        const valueCol = column.pivotValueColumn;
        const resultCols = valueCol ? this._beans.pivotResultCols?.getAggregationOrderedList() : null;
        if (valueCol && resultCols) {
            let sum = 0;
            let any = false;
            for (let i = 0, len = resultCols.length; i < len; ++i) {
                const cd = resultCols[i].colDef;
                // Sum this value field's leaf pivot columns; skip total columns to avoid double counting.
                if (cd.pivotValueColumn === valueCol && !cd.pivotTotalColumnIds) {
                    const v = readAggScalar(node, resultCols[i]);
                    if (v != null) {
                        sum += v;
                        any = true;
                    }
                }
            }
            return any ? sum : null;
        }
        return readNodeValue(node, column);
    }

    public valueOfColumn(colId: string): number | bigint | null {
        const col = this._beans.colModel.getCol(colId);
        return col ? readNodeExact(this.node, col as AgColumn) : null;
    }

    /** Comparison value for a column base: while pivoting, the same pivot cell (this column's keys) of value
     *  field `colId`; otherwise that column's value at the node. `null` when not resolvable. */
    public baseColumnValue(colId: string): number | bigint | null {
        const beans = this._beans;
        if (beans.colModel.isPivotActive()) {
            const pivotKeys = this.column.colDef.pivotKeys;
            if (pivotKeys) {
                const baseCol = pivotResultCol(beans.pivotResultCols, pivotKeys, colId);
                return baseCol ? readNodeExact(this.node, baseCol) : null;
            }
        }
        return this.valueOfColumn(colId);
    }

    /** This column's aggregate at the ancestor grouped by row-group field `field` (the node itself when it is
     *  that group); with no `field`, the outermost (top-level) ancestor — which also covers tree data, where
     *  nodes have no `rowGroupColumn`. `null` when no such ancestor exists. Backs `% of Parent Total`. */
    public ancestorTotal(field?: string): number | null {
        const column = this.column;
        if (field) {
            for (let n = this.node as RowNode | null; n; n = n.parent) {
                if (n.rowGroupColumn?.colId === field) {
                    return readNodeValue(n, column);
                }
            }
            return null;
        }
        let outermost: RowNode | null = null;
        for (let n = this.node as RowNode | null; n && n.level >= 0; n = n.parent) {
            outermost = n; // walking up, the last node above the root is the top-level ancestor
        }
        // Read the displayed value (not `aggData`) so a top-level leaf — its own ancestor — resolves too.
        return outermost ? readNodeValue(outermost, column) : null;
    }

    /** `childIndex` gives the node's O(1) position in its parent's sorted children (kept in lockstep with
     *  `childrenAfterSort` by the sort stage); falls back to `indexOf` when stale or unset — e.g. a node outside
     *  the current sorted set queried via the API. */
    public siblingValue(offset: number): number | bigint | null {
        const node = this.node;
        const siblings = node.parent?.childrenAfterSort;
        if (!siblings) {
            return null;
        }
        let index = node.childIndex;
        if (siblings[index] !== node) {
            index = siblings.indexOf(node);
            if (index < 0) {
                return null;
            }
        }
        const target = index + offset;
        return target >= 0 && target < siblings.length ? readNodeExact(siblings[target], this.column) : null;
    }

    /** The base field/item: the comparison cell is this one with dimension `baseField` set to `baseItem`, the
     *  other dimensions held fixed — a sibling pivot column (column dimension) or a cousin group row (row
     *  dimension). With no `baseField`, `(previous)`/`(next)` falls back to the adjacent sibling. */
    public baseItemValue(baseItem: string | number, baseField?: string): number | bigint | null {
        if (!baseField) {
            const offset = adjacentStep(baseItem);
            return offset == null ? null : this.siblingValue(offset);
        }
        const beans = this._beans;
        const index = pivotDimIndex(beans.colModel, this.column, baseField);
        return index != null
            ? pivotBaseValue(beans.pivotResultCols, this.node, this.column, index, baseItem)
            : rowBaseValue(beans.colModel, this.node, this.column, baseField, baseItem);
    }
}
