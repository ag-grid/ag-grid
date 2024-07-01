import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { RowPinnedType } from '../interfaces/iRowNode';
import type { RowNode } from './rowNode';
export interface RowPosition {
    /** A positive number from 0 to n, where n is the last row the grid is rendering
     * or -1 if you want to navigate to the grid header */
    rowIndex: number;
    /** Either 'top', 'bottom' or null/undefined (for not pinned) */
    rowPinned: RowPinnedType;
}
export declare class RowPositionUtils extends BeanStub implements NamedBean {
    beanName: "rowPositionUtils";
    private rowModel;
    private pinnedRowModel;
    private pageBoundsService;
    wireBeans(beans: BeanCollection): void;
    getFirstRow(): RowPosition | null;
    getLastRow(): RowPosition | null;
    getRowNode(gridRow: RowPosition): RowNode | undefined;
    sameRow(rowA: RowPosition | undefined, rowB: RowPosition | undefined): boolean;
    before(rowA: RowPosition, rowB: RowPosition): boolean;
}
