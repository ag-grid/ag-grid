import type {
    AgColumn,
    BeanCollection,
    GridApi,
    IRowNode,
    RowNode,
    ShowValueAsTransformParams,
} from 'ag-grid-community';

import { pivotResultCol, readAggScalar, readNodeValue, unwrapAggValue } from './showValueAsValueReaders';

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
}
