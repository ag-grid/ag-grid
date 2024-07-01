import type { AgColumn } from '../entities/agColumn';
import type { ComponentSelector } from '../widgets/component';
export interface IShowRowGroupColsService {
    refresh(): void;
    getShowRowGroupCols(): AgColumn[];
    getShowRowGroupCol(id: string): AgColumn | undefined;
}
export interface IColumnDropZonesService {
    getDropZoneSelector(): ComponentSelector;
}
