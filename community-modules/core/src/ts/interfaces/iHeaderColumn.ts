import { AbstractColDef } from "../entities/colDef";
import { IEventEmitter } from "./iEventEmitter";
import { ColumnGroup } from "../entities/columnGroup";
import { ColumnPinnedType } from "../entities/column";

// Implemented by Column and ColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
export interface IHeaderColumn extends IEventEmitter {
    getUniqueId(): string;
    getActualWidth(): number;
    getMinWidth(): number | null | undefined;
    getLeft(): number | null;
    getOldLeft(): number | null;
    getDefinition(): AbstractColDef | null;
    getColumnGroupShow(): string | undefined;
    getParent(): IHeaderColumn;
    isResizable(): boolean;
    setParent(parent: ColumnGroup | null): void;
    isEmptyGroup(): boolean;
    isMoving(): boolean;
    getPinned(): ColumnPinnedType;
}
