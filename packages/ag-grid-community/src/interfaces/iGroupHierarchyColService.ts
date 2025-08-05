import type { ColumnCollections } from '../columns/columnModel';
import type { AgColumn } from '../entities/agColumn';
import type { IColumnCollectionService } from './iColumnCollectionService';

export interface IGroupHierarchyColService extends IColumnCollectionService {
    isDateHierarchyColsEnabled(cols: ColumnCollections): boolean;
    isDateHierarchyColsEnabledForCol(col: AgColumn): boolean;
    getVirtualColumnsForColumn(col: AgColumn): AgColumn[];
}
