import { AbstractColDef } from '../entities/colDef';
import { ColumnPinnedType } from '../entities/column';
import { ColumnGroup, ColumnGroupShowType } from '../entities/columnGroup';
import { BrandedType } from '../interfaces/brandedType';
import { IEventEmitter } from './iEventEmitter';

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
