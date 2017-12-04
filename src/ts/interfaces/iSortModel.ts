import { Column } from "../entities/column";

/** Sort model, defining the sort direction of a single column. */
export interface ISortModel {
    /** ID of the column to sort. */
    colId: string;
    /** Direction to sort the column. */
    sort: Column.SortDir;
}
