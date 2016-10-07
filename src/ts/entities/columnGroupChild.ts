import {AbstractColDef} from "./colDef";
import {IEventEmitter} from "../interfaces/iEventEmitter";

// Implemented by Column and ColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
export interface ColumnGroupChild extends IEventEmitter {
    getUniqueId(): string;
    getActualWidth(): number;
    getMinWidth(): number;
    getLeft(): number;
    getDefinition(): AbstractColDef;
    getColumnGroupShow(): string;
    getParent(): ColumnGroupChild;
    setParent(parent: ColumnGroupChild): void;
}
