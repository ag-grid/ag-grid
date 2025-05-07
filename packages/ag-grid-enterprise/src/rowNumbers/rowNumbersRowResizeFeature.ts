import type { BeanCollection, CellCtrl, GridOptionsService, IRowNumbersRowResizeFeature } from 'ag-grid-community';

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
        if (!_isRowNumbersResizerEnabled(this.beans.gos)) {
            this.removeRowResizerFromCellComp();
        } else {
            this.addResizerToCellComp();
        }
    }

    private addResizerToCellComp() {
        const { beans, cellCtrl } = this;
        const { eGui } = cellCtrl;

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

        eGui.appendChild(rowResizer.getGui());
    }

    private removeRowResizerFromCellComp(): void {
        if (!this.rowResizer) {
            return;
        }

        const { eGui } = this.cellCtrl;

        eGui.removeChild(this.rowResizer.getGui());
        this.rowResizer = this.beans.context.destroyBean(this.rowResizer);
    }

    public destroy(): void {
        this.removeRowResizerFromCellComp();
    }
}
