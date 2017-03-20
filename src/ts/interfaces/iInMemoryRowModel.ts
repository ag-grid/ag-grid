import {RowNode} from "../entities/rowNode";
import {IRowModel} from "./iRowModel";
import {PaginationDef, RefreshModelParams, PaginationModel} from "../rowModels/inMemory/inMemoryRowModel";

export interface IInMemoryRowModel extends IRowModel {

    /** InMemory model only. Gets the model to refresh. Provide a step for the
     * step in the pipeline you want to refresh from. */
    refreshModel(params: RefreshModelParams): void;
    /** InMemory model only. If tree / group structure, returns the top level
     * nodes only. */
    getTopLevelNodes(): RowNode[];
    /** InMemory model only. */
    forEachLeafNode(callback: (rowNode: RowNode)=>void): void;
    /** InMemory model only. */
    forEachNodeAfterFilter(callback: (rowNode: RowNode)=>void): void;
    /** InMemory model only. */
    forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode)=>void): void;
    /** InMemory model only. */
    forEachPivotNode(callback: (rowNode: RowNode)=>void): void;
    /** InMemory model only. */
    expandOrCollapseAll(expand: boolean): void;
    /** InMemory model only. */
    setRowData(rows: any[], refresh: boolean, firstId?: number): void;
    /** When the row height was changed for a row node */
    onRowHeightChanged(): void;
    /** When all row heights should be reset */
    resetRowHeights(): void;
    /** To activate pagination call here passing the page size and the current page */
    setPaginationDef(paginationDef:PaginationDef): PaginationModel;
    /** If pagination is activated this will returned the current pagination model, otherwise null */
    getPaginationModel(): PaginationModel;
}