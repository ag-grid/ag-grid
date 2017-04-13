// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
export interface IRowModel {
    /** Returns the rowNode at the given index. */
    getRow(index: number): RowNode;
    /** Returns the first and last rows to render. */
    getPageFirstRow(): number;
    getPageLastRow(): number;
    /** This is legacy, not used by ag-Grid, but keeping for backward compatibility */
    getRowCount(): number;
    /** Returns the row index at the given pixel */
    getRowIndexAtPixel(pixel: number): number;
    /** Returns total height of all the rows - used to size the height of the grid div that contains the rows */
    getCurrentPageHeight(): number;
    /** Returns true if the provided rowNode is in the list of rows to render */
    isRowPresent(rowNode: RowNode): boolean;
    /** Returns row top and bottom for a given row */
    getRowBounds(index: number): {
        rowTop: number;
        rowHeight: number;
    };
    /** Add an item at the specified location */
    insertItemsAtIndex(index: number, items: any[], skipRefresh: boolean): void;
    /** Remove an item from the specified location */
    removeItems(rowNodes: RowNode[], skipRefresh: boolean): void;
    /** Add an item at the end */
    addItems(items: any[], skipRefresh: boolean): void;
    /** Returns true if this model has no rows, regardless of model filter. EG if rows present, but filtered
     * out, this still returns false. If it returns true, then the grid shows the 'no rows' overlay - but we
     * don't show that overlay if the rows are just filtered out. */
    isEmpty(): boolean;
    /** Returns true if no rows (either no rows at all, or the rows are filtered out). This is what the grid
     * uses to know if there are rows to render or not. */
    isRowsToRender(): boolean;
    /** Iterate through each node. What this does depends on the model type. For inMemory, goes through
     * all nodes. For pagination, goes through current page. For virtualPage, goes through what's loaded in memory. */
    forEachNode(callback: (rowNode: RowNode) => void): void;
    /** The base class returns the type. We use this instead of 'instanceof' as the client might provide
     * their own implementation of the models in the future. */
    getType(): string;
    /**
     * It tells us if this row model knows about the last row that it can produce. ie InMemoryRowModel = true
     * InfiniteRowModel=false
     */
    isLastRowFound(): boolean;
}
