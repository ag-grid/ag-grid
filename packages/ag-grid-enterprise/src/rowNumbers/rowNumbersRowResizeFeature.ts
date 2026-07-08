import type { BeanCollection, CellCtrl, IRowNumbersRowResizeFeature, RowNode } from 'ag-grid-community';
import { _isRowNumbers } from 'ag-grid-community';

import type { AgRowNumbersRowResizer } from './rowNumbersRowResizer';

export function _isRowNumbersResizerEnabled(beans: BeanCollection): boolean {
    const rowNumbers = _isRowNumbers(beans);

    return !(!rowNumbers || typeof rowNumbers !== 'object' || !rowNumbers.enableRowResizer);
}

export class RowNumbersRowResizeFeature implements IRowNumbersRowResizeFeature {
    private rowResizer: AgRowNumbersRowResizer | undefined;

    constructor(
        private readonly beans: BeanCollection,
        private readonly cellCtrl: CellCtrl
    ) {}

    public refreshRowResizer(): void {
        if (!_isRowNumbersResizerEnabled(this.beans) || !this.isRowResizeSupported(this.cellCtrl.rowNode)) {
            this.removeRowResizerFromCellComp();
        } else {
            this.addResizerToCellComp();
        }
    }

    private isRowResizeSupported(node: RowNode): boolean {
        const { pinnedRowModel, rowModel, visibleCols } = this.beans;
        const rowModelModelHasOnRowHeightChanged = !!(rowModel as any).onRowHeightChanged;

        if (visibleCols.autoHeightCols.length) {
            this.beans.log.warn(276);
            return false;
        }

        if (node.rowPinned != null) {
            return pinnedRowModel?.isManual() ? rowModelModelHasOnRowHeightChanged : true;
        }
        return rowModelModelHasOnRowHeightChanged;
    }

    private addResizerToCellComp(): void {
        const { beans, cellCtrl } = this;

        let { rowResizer } = this;

        if (!rowResizer) {
            rowResizer = beans.registry.createDynamicBean<AgRowNumbersRowResizer>(
                'rowNumberRowResizer',
                false,
                cellCtrl
            );

            if (!rowResizer) {
                return;
            }

            this.rowResizer = beans.context.createBean(rowResizer);
        }

        cellCtrl.comp.setRowResizerElement(rowResizer.getGui());
    }

    private removeRowResizerFromCellComp(): void {
        const {
            rowResizer,
            beans: { context },
            cellCtrl,
        } = this;

        if (!rowResizer) {
            return;
        }

        cellCtrl.comp?.setRowResizerElement(null);
        this.rowResizer = context.destroyBean(rowResizer);
    }

    public destroy(): void {
        this.removeRowResizerFromCellComp();
    }
}
