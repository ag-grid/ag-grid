import type { RowNode } from '../entities/rowNode';
import type { IRowNode } from './iRowNode';

export type RowDropHighlightPosition = 'above' | 'below' | 'none';

export interface RowDropHighlight<TData = any> {
    row: IRowNode<TData> | null;
    position: RowDropHighlightPosition;
}

export interface IRowDropHighlightService {
    readonly row: RowNode | null;
    readonly position: RowDropHighlightPosition;

    clear(): void;
    set(row: RowNode, position: Exclude<RowDropHighlightPosition, 'none'>): void;
}
