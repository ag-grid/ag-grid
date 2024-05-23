import type { AbstractColDef } from '../entities/colDef';
import type { ColumnPinnedType } from '../entities/column';
import type { ColumnGroup, ColumnGroupShowType } from '../entities/columnGroup';
import type { BrandedType } from '../interfaces/brandedType';
import type { IEventEmitter } from './iEventEmitter';

export type HeaderColumnId = BrandedType<string, 'HeaderColumnId'>;

// Implemented by Column and ColumnGroup. Allows the groups to contain a list of this type for it's children.
// See the note at the top of Column class.
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
