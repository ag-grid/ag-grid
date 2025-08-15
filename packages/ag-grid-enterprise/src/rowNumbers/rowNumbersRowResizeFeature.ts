import type {
    BeanCollection,
    CellCtrl,
    GridOptionsService,
    IRowNumbersRowResizeFeature,
    RowNode,
} from 'ag-grid-community';
import { _removeFromParent, _warn } from 'ag-grid-community';

import type { AgRowNumbersRowResizer } from './rowNumbersRowResizer';

export function _isRowNumbersResizerEnabled(gos: GridOptionsService): boolean {
    const rowNumbers = gos.get('rowNumbers');

    if (!rowNumbers || typeof rowNumbers !== 'object' || !rowNumbers.enableRowResizer) {
        return false;
    }

    return true;
}

export class RowNumbersRowResizeFeature implements IRowNumbersRowResizeFeature {
    private rowResizer: AgRowNumbersRowResizer | undefined;

    constructor(
        private readonly beans: BeanCollection,
        private readonly cellCtrl: CellCtrl
    ) {}

    public refreshRowResizer(): void {
        if (!_isRowNumbersResizerEnabled(this.beans.gos) || !this.isRowResizeSupported(this.cellCtrl.rowNode)) {
            this.removeRowResizerFromCellComp();
        } else {
            this.addResizerToCellComp();
        }
    }

    private isRowResizeSupported(node: RowNode): boolean {
        const { pinnedRowModel, rowModel, visibleCols } = this.beans;
        const rowModelModelHasOnRowHeightChanged = !!(rowModel as any).onRowHeightChanged;

        if (visibleCols.autoHeightCols.length) {
            _warn(276);
            return false;
        }

        if (node.rowPinned != null) {
            return pinnedRowModel?.isManual() ? rowModelModelHasOnRowHeightChanged : true;
        }
        return rowModelModelHasOnRowHeightChanged;
    }

    private addResizerToCellComp() {
        const { beans, cellCtrl } = this;
        const { eGui } = cellCtrl;

        let { rowResizer } = this;

        if (rowResizer) {
            return;
        }

        rowResizer = beans.registry.createDynamicBean<AgRowNumbersRowResizer>('rowNumberRowResizer', false, cellCtrl);

        if (!rowResizer) {
            return;
        }

        this.rowResizer = beans.context.createBean(rowResizer);
        eGui.appendChild(rowResizer.getGui());
    }

    private removeRowResizerFromCellComp(): void {
        const {
            rowResizer,
            beans: { context },
        } = this;

        if (!rowResizer) {
            return;
        }

        _removeFromParent(rowResizer.getGui());
        this.rowResizer = context.destroyBean(rowResizer);
    }

    public destroy(): void {
        this.removeRowResizerFromCellComp();
    }
}
