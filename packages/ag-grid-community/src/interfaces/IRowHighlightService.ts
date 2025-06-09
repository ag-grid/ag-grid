import type { RowNode } from '../entities/rowNode';

export type RowHighlightPosition = 'above' | 'below' | 'none';

export interface IRowHighlightService {
    readonly row: RowNode | null;
    readonly position: RowHighlightPosition | null;

    clear(): void;
    set(row: RowNode, position: RowHighlightPosition): void;
}
