import type { ColumnCollections } from '../columns/columnModel';
import type { AgColumn } from '../entities/agColumn';
import type { IColumnCollectionService } from './iColumnCollectionService';

export interface IGroupHierarchyColService extends IColumnCollectionService {
    isGroupHierarchyColsEnabled(cols: ColumnCollections): boolean;
    isGroupHierarchyColsEnabledForCol(col: AgColumn): boolean;
    getVirtualColumnsForColumn(col: AgColumn): AgColumn[];
}
