import { AbstractColDef } from "../entities/colDef";
import { IEventEmitter } from "./iEventEmitter";
import { ColumnGroup, ColumnGroupShowType } from "../entities/columnGroup";
import { ColumnPinnedType } from "../entities/column";
import { BrandedType } from "../utils";
export type HeaderColumnId = BrandedType<string, 'HeaderColumnId'>;
export interface IHeaderColumn<TValue = any> extends IEventEmitter {
    getUniqueId(): HeaderColumnId;
    getActualWidth(): number;
    getMinWidth(): number | null | undefined;
    getLeft(): number | null;
    getOldLeft(): number | null;
    getDefinition(): AbstractColDef<any, TValue> | null;
    getColumnGroupShow(): ColumnGroupShowType | undefined;
    getParent(): IHeaderColumn;
    isResizable(): boolean;
    setParent(parent: ColumnGroup | null): void;
    isEmptyGroup(): boolean;
    isMoving(): boolean;
    getPinned(): ColumnPinnedType;
}
