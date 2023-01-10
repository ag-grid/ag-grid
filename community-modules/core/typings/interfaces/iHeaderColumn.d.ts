import { AbstractColDef } from "../entities/colDef";
import { IEventEmitter } from "./iEventEmitter";
import { ColumnGroup, ColumnGroupShowType } from "../entities/columnGroup";
import { ColumnPinnedType } from "../entities/column";
export interface IHeaderColumn extends IEventEmitter {
    getUniqueId(): string;
    getActualWidth(): number;
    getMinWidth(): number | null | undefined;
    getLeft(): number | null;
    getOldLeft(): number | null;
    getDefinition(): AbstractColDef | null;
    getColumnGroupShow(): ColumnGroupShowType | undefined;
    getParent(): IHeaderColumn;
    isResizable(): boolean;
    setParent(parent: ColumnGroup | null): void;
    isEmptyGroup(): boolean;
    isMoving(): boolean;
    getPinned(): ColumnPinnedType;
}
