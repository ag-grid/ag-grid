import { RowNode } from "../entities/rowNode";

export interface RowNodeTransaction<TData> {
    /** Row nodes added */
    add: RowNode<TData>[];
    /** Row nodes removed */
    remove: RowNode<TData>[];
    /** Row nodes updated */
    update: RowNode<TData>[];
}
