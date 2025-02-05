import type { BeanCollection } from '../context/context';
import type { RowPinnedType } from '../interfaces/iRowNode';

export function _selectAllCells(beans: BeanCollection) {
    const { pinnedRowModel, rowModel } = beans;
    const [isEmptyPinnedTop, isEmptyPinnedBottom] = [
        pinnedRowModel?.isEmpty('top') ?? true,
        pinnedRowModel?.isEmpty('bottom') ?? true,
    ];

    const floatingStart: RowPinnedType = isEmptyPinnedTop ? null : 'top';
    let floatingEnd: RowPinnedType;
    let rowEnd: number;

    if (isEmptyPinnedBottom) {
        floatingEnd = null;
        rowEnd = rowModel.getRowCount() - 1;
    } else {
        floatingEnd = 'bottom';
        rowEnd = pinnedRowModel?.getPinnedBottomRowCount() ?? 0 - 1;
    }

    const { visibleCols, rangeSvc } = beans;
    const allDisplayedColumns = visibleCols.allCols;

    if (!rangeSvc || !allDisplayedColumns?.length) {
        return;
    }

    rangeSvc.setCellRange({
        rowStartIndex: 0,
        rowStartPinned: floatingStart,
        rowEndIndex: rowEnd,
        rowEndPinned: floatingEnd,
    });
}
