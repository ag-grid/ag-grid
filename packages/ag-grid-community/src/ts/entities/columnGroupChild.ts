import { AbstractColDef } from "./colDef";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { ColumnGroup } from "./columnGroup";

// Implemented by Column and ColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
export interface ColumnGroupChild<T> extends IEventEmitter {
    getUniqueId(): string;
    getActualWidth(): number;
    getMinWidth(): number;
    getLeft(): number;
    getOldLeft(): number;
    getDefinition(): AbstractColDef;
    getColumnGroupShow(): string | undefined;
    getParent(): ColumnGroupChild<T>;
    isResizable(): boolean;
    setParent(parent: ColumnGroup<T>): void;
    isEmptyGroup(): boolean;
    isMoving(): boolean;
    getPinned(): string;
}
