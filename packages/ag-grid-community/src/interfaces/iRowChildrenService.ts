import type { RowNode } from '../entities/rowNode';

export interface IRowChildrenService {
    updateHasChildren(rowNode: RowNode): void;

    hasChildren(rowNode: RowNode): boolean;

    setAllChildrenCount(rowNode: RowNode, allChildrenCount: number | null): void;
}
