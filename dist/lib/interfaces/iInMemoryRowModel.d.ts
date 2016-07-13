// Type definitions for ag-grid v5.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RowNode } from "../entities/rowNode";
import { IRowModel } from "./iRowModel";
export interface IInMemoryRowModel extends IRowModel {
    /** InMemory model only. Gets the model to refresh. Provide a step for the
     * step in the pipeline you want to refresh from. */
    refreshModel(step: number, fromIndex?: number): void;
    /** InMemory model only. If tree / group structure, returns the top level
     * nodes only. */
    getTopLevelNodes(): RowNode[];
    /** InMemory model only. */
    forEachLeafNode(callback: (rowNode: RowNode) => void): void;
    /** InMemory model only. */
    forEachNodeAfterFilter(callback: (rowNode: RowNode) => void): void;
    /** InMemory model only. */
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode) => void): void;
    /** InMemory model only. */
    forEachPivotNode(callback: (rowNode: RowNode) => void): void;
    /** InMemory model only. */
    expandOrCollapseAll(expand: boolean): void;
    /** InMemory model only. */
    setRowData(rows: any[], refresh: boolean, firstId?: number): void;
}
