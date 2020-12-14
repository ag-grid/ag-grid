import { AbstractColDef } from "./colDef";
import { IEventEmitter } from "../interfaces/iEventEmitter";
import { ColumnGroup } from "./columnGroup";
export interface ColumnGroupChild extends IEventEmitter {
    getUniqueId(): string;
    getActualWidth(): number;
    getMinWidth(): number | null | undefined;
    getLeft(): number | null;
    getOldLeft(): number | null;
    getDefinition(): AbstractColDef | null;
    getColumnGroupShow(): string | undefined;
    getParent(): ColumnGroupChild;
    isResizable(): boolean;
    setParent(parent: ColumnGroup | null): void;
    isEmptyGroup(): boolean;
    isMoving(): boolean;
    getPinned(): string | null | undefined;
}
