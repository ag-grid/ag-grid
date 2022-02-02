import { RowNode } from "../entities/rowNode";
export interface RowNodeTransaction {
    /** Row nodes added */
    add: RowNode[];
    /** Row nodes removed */
    remove: RowNode[];
    /** Row nodes updated */
    update: RowNode[];
}
