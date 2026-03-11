import type { RowNode } from '../entities/rowNode';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface IRowChildrenService {
    getHasChildrenValue(rowNode: RowNode): boolean | null;
}
