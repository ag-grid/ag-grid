// Type definitions for ag-grid v5.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../entities/rowNode";
export interface IRowModel {
    /** Returns the rowNode at the given index. */
    getRow(index: number): RowNode;
    /** Returns the total row count. */
    getRowCount(): number;
    /** Returns the row index at the given pixel */
    getRowIndexAtPixel(pixel: number): number;
    /** Returns total height of all the rows - used to size the height of the grid div that contains the rows */
    getRowCombinedHeight(): number;
    /** Returns true if this model has any rows, regardless of model filter. EG if rows present, but filtered
     * out, this still returns false. If it returns true, then the grid shows the 'not rows' overlay - but we
     * don't show that overlay if the rows are just filtered out. */
    isEmpty(): boolean;
    /** Returns true if not rows (either not rows at all, or the rows are filtered out). This is what the grid
     * uses to know if there are rows to render or now. */
    isRowsToRender(): boolean;
    /** Iterate through each node. What this does depends on the model type. For inMemory, goes through
     * all nodes. For pagination, goes through current page. For virtualPage, goes through what's loaded in memory. */
    forEachNode(callback: (rowNode: RowNode) => void): void;
    /** The base class returns the type. We use this instead of 'instanceof' as the client might provide
     * their own implementation of the models in the future. */
    getType(): string;
}
