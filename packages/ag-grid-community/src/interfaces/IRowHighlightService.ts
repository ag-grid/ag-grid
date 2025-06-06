import type { RowNode } from '../entities/rowNode';
import type { RowHighlightPosition } from '../rowHighlight/rowHighlightPosition';

export interface IRowHighlightService {
    readonly row: RowNode | null;
    readonly position: RowHighlightPosition | null;

    clear(): void;
    set(row: RowNode, position: RowHighlightPosition): void;
}
