import type { RowNode } from '../entities/rowNode';
import type { IRowModel } from '../interfaces/iRowModel';
export interface ISelectionContext<TNode> {
    init(rowModel: IRowModel): void;
    reset(): void;
    setRoot(node: TNode): void;
    setEndRange(node: TNode): void;
    getRange(): RowNode[];
    getRoot(): TNode | null;
    isInRange(node: TNode): boolean;
    truncate(node: TNode): {
        keep: RowNode[];
        discard: RowNode[];
    };
    extend(node: TNode, groupSelectsChildren?: boolean): {
        keep: RowNode[];
        discard: RowNode[];
    };
}
/**
 * The context of a row range selection operation.
 *
 * Used to model the stateful range selection behaviour found in Excel, where
 * a given cell/row represents the "root" of a selection range, and subsequent
 * selections are based off that root.
 *
 * See AG-9620 for more
 */
export declare class RowRangeSelectionContext implements ISelectionContext<RowNode> {
    private root;
    /**
     * Note that the "end" `RowNode` may come before or after the "root" `RowNode` in the
     * actual grid.
     */
    private end;
    private rowModel;
    private cachedRange;
    init(rowModel: IRowModel): void;
    reset(): void;
    setRoot(node: RowNode): void;
    setEndRange(end: RowNode): void;
    getRange(): RowNode[];
    isInRange(node: RowNode): boolean;
    getRoot(): RowNode | null;
    private getEnd;
    /**
     * Truncates the range to the given node (assumed to be within the current range).
     * Returns nodes that remain in the current range and those that should be removed
     *
     * @param node - Node at which to truncate the range
     * @returns Object of nodes to either keep or discard (i.e. deselect) from the range
     */
    truncate(node: RowNode): {
        keep: RowNode[];
        discard: RowNode[];
    };
    /**
     * Extends the range to the given node. Returns nodes that remain in the current range
     * and those that should be removed.
     *
     * @param node - Node marking the new end of the range
     * @returns Object of nodes to either keep or discard (i.e. deselect) from the range
     */
    extend(node: RowNode, groupSelectsChildren?: boolean): {
        keep: RowNode[];
        discard: RowNode[];
    };
}
