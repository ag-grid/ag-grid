import type { AgColumn } from '../entities/agColumn';
import type { IColumnCollectionService } from './iColumnCollectionService';

export interface IGroupHierarchyColService extends IColumnCollectionService {
    expandColumn(col: AgColumn): AgColumn[];
    compareVirtualColumns(colA: AgColumn, colB: AgColumn): number | null;
    insertVirtualColumnsForCol(columns: AgColumn[], col: AgColumn): void;
}
