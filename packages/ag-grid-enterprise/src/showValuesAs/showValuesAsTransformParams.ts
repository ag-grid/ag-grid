import type {
    AgColumn,
    BeanCollection,
    GridApi,
    IRowNode,
    RowNode,
    ShowValuesAsTransformParams,
} from 'ag-grid-community';

import { pivotResultCol, readAggScalar, readNodeValue, unwrapAggValue } from './showValuesAsValueReaders';

export class ShowValuesAsTransformParamsImpl implements ShowValuesAsTransformParams {
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
        const root = this.rootWithTotal();
        return root ? readAggScalar(root, this.column) : null;
    }

    /** The overall total: equal to {@link columnTotal} when not pivoting; when pivoting, the value field summed
     *  across all its pivot columns (the 2-D grand total, not just this pivot column). */
    public grandTotal(): number | null {
        const root = this.rootWithTotal();
        if (!root) {
            return null;
        }
        return this._beans.colModel.isPivotActive() ? this.rowTotalAt(root) : readAggScalar(root, this.column);
    }

    /** Root, ensuring its aggregate exists. The pipeline skips the root aggregate unless a grand-total row / pivot
     *  needs it, so a total mode triggers it on demand — synchronous, computes only the root from the already
     *  aggregated groups (no re-sort/filter/render). `null` aggData is the "not yet aggregated" sentinel. */
    private rootWithTotal(): RowNode | null {
        const root = this._beans.rowModel.rootNode;
        if (root && root.aggData == null) {
            this._beans.aggStage?.aggregateRootOnly();
        }
        return root;
    }

    public parentTotal(): number | null {
        const parent = this.node.parent;
        if (!parent) {
            return null;
        }
        // A top-level group's parent is the root, which the pipeline may not have aggregated — do it on demand.
        if (parent.level === -1 && parent.aggData == null) {
            this._beans.aggStage?.aggregateRootOnly();
        }
        return readAggScalar(parent, this.column);
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
}
