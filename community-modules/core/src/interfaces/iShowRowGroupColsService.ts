import type { AgColumn } from '../entities/agColumn';
import type { ComponentClass } from '../widgets/component';

export interface IShowRowGroupColsService {
    refresh(): void;

    getShowRowGroupCols(): AgColumn[];

    getShowRowGroupCol(id: string): AgColumn | undefined;
}

export interface IColumnDropZonesService {
    getDropZoneComponent(): ComponentClass;
}
