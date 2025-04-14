import type { RowNode } from '../entities/rowNode';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { RowPinnedType } from '../interfaces/iRowNode';

/** Whether the given node is pinned manually to the top or bottom container */
export function _isManualPinnedRow(rowNode: RowNode): boolean {
    // `rowPinned` is only truthy for rows actually in the pinned containers.
    // `pinnedSibling` is only defined when the row has been pinned manually.
    return !!(rowNode.rowPinned && rowNode.pinnedSibling);
}

export function _getNodesInRangeForSelection(
    rowModel: IPinnedRowModel,
    float: NonNullable<RowPinnedType>,
    start: RowNode | undefined,
    end: RowNode | undefined
): RowNode[] {
    const isTop = float === 'top';
    if (!start) {
        return _getNodesInRangeForSelection(
            rowModel,
            float,
            isTop ? rowModel.getPinnedTopRow(0) : rowModel.getPinnedBottomRow(0),
            end
        );
    }
    if (!end) {
        const count = isTop ? rowModel.getPinnedTopRowCount() : rowModel.getPinnedBottomRowCount();
        return _getNodesInRangeForSelection(
            rowModel,
            float,
            start,
            isTop ? rowModel.getPinnedTopRow(count - 1) : rowModel.getPinnedBottomRow(count - 1)
        );
    }

    let started = false;
    let finished = false;
    const range: RowNode[] = [];

    rowModel.forEachPinnedRow(float, (node) => {
        if (node === start && !started) {
            started = true;
            range.push(node);
            return;
        }

        if (started && node === end) {
            finished = true;
            range.push(node);
            return;
        }

        if (started && !finished) {
            range.push(node);
        }
    });

    return range;
}
