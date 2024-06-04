import type { AgColumn } from '../entities/agColumn';
import type { ColumnEventType } from '../events';

export interface AutoColService {
    createAutoCols(rowGroupCols: AgColumn[]): AgColumn[];

    updateAutoCols(autoGroupCols: AgColumn[], source: ColumnEventType): void;
}
