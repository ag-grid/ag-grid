import {RowNode} from "../entities/rowNode";

export interface RowNodeTransaction<T = any> {
    add: RowNode<T>[];
    remove: RowNode<T>[];
    update: RowNode<T>[];
}
