import type { AgColumn } from '../entities/agColumn';

export interface ShowRowGroupColsService {
    refresh(): void;

    getShowRowGroupCols(): AgColumn[];

    getShowRowGroupCol(id: string): AgColumn | undefined;
}
