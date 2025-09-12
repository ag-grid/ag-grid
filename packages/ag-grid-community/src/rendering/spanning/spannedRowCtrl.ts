import type { AgColumn } from '../../entities/agColumn';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import type { CellCtrl } from '../cell/cellCtrl';
import { RowCtrl } from '../row/rowCtrl';
import { SpannedCellCtrl } from './spannedCellCtrl';

export class SpannedRowCtrl extends RowCtrl {
    protected override onRowIndexChanged(): void {
        super.onRowIndexChanged();
        this.getAllCellCtrls().forEach((c) => c.refreshAriaRowIndex());
    }

    protected override getInitialRowClasses(_rowContainerType: RowContainerType): string[] {
        return ['ag-spanned-row'];
    }

    protected override getNewCellCtrl(col: AgColumn<any>): CellCtrl | undefined {
        // spanned cells, if handled as a spanned cell of another row, ignore this.
        const cellSpan = this.beans.rowSpanSvc?.getCellSpan(col, this.rowNode);
        if (!cellSpan) {
            return;
        }

        // only render cell in first row of span
        const firstRowOfSpan = cellSpan.firstNode !== this.rowNode;
        if (firstRowOfSpan) {
            return;
        }

        return new SpannedCellCtrl(cellSpan, this, this.beans);
    }

    protected override isCorrectCtrlForSpan(cell: CellCtrl): boolean {
        // spanned cells, if handled as a spanned cell of another row, ignore this.
        const cellSpan = this.beans.rowSpanSvc?.getCellSpan(cell.column, this.rowNode);
        if (!cellSpan) {
            return false;
        }

        // only render cell in first row of span
        const firstRowOfSpan = cellSpan.firstNode !== this.rowNode;
        if (firstRowOfSpan) {
            return false;
        }

        return (cell as SpannedCellCtrl).getCellSpan() === cellSpan;
    }

    /**
     * Below overrides are explicitly disabling styling and other unwanted behaviours for spannedRowCtrl
     */
    // row height should be 0 in spanned row - they're only included for purpose of aria
    protected override onRowHeightChanged(): void {}

    // no styling spanned rows
    protected override refreshFirstAndLastRowStyles(): void {}

    // no hover functionality for spanned rows
    protected override addHoverFunctionality() {}
    public override resetHoveredStatus() {}
}
