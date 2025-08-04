import type { ColumnCollections } from '../columns/columnModel';
import type { Column } from './iColumn';
import type { IColumnCollectionService } from './iColumnCollectionService';

export interface IDateHierarchyColService extends IColumnCollectionService {
    isDateHierarchyColsEnabled(cols: ColumnCollections): boolean;
    isDateHierarchyColsEnabledForCol(col: Column): boolean;
}
