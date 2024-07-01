import type { IRowModel, ISelectionContext, RowNode } from 'ag-grid-community';
/**
 * This is the same as RowRangeSelectionContext in core, except that we store RowNode IDs
 * instead of RowNode instances directly, because RowNodes can be dropped when scrolled out
 * of view
 */
export declare class ServerSideRowRangeSelectionContext implements ISelectionContext<string> {
    private rowModel;
    private root;
    /**
     * Note that the "end" `RowNode` may come before or after the "root" `RowNode` in the
     * actual grid.
     */
    private end;
    private cachedRange;
    init(rowModel: IRowModel): void;
    reset(): void;
    setRoot(node: string): void;
    setEndRange(end: string): void;
    getRoot(): string | null;
    getRange(): RowNode[];
    isInRange(node: string): boolean;
    /**
     * Truncates the range to the given node (assumed to be within the current range).
     * Returns nodes that remain in the current range and those that should be removed
     *
     * @param node - Node at which to truncate the range
     * @returns Object of nodes to either keep or discard (i.e. deselect) from the range
     */
    truncate(node: string): {
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
    extend(node: string, groupSelectsChildren?: boolean): {
        keep: RowNode[];
        discard: RowNode[];
    };
}
