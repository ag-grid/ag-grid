import type { AgColumn } from '../../entities/agColumn';
import type { CellCtrl } from '../cell/cellCtrl';
import { RowCtrl } from '../row/rowCtrl';
import { SpannedCellCtrl } from './spannedCellCtrl';

export class SpannedRowCtrl extends RowCtrl {
    protected override getInitialRowClasses(): string[] {
        return ['ag-spanned-row'];
    }

    public override getNewCellCtrl(col: AgColumn<any>): CellCtrl | undefined {
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

    public override isCorrectCtrlForSpan(cell: CellCtrl): boolean {
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
    protected override onRowHeightChanged(): void {
        // row height should be 0 in spanned row - they're only included for purpose of aria
    }
    protected override refreshFirstAndLastRowStyles(): void {
        // no styling spanned rows
    }
    protected override addHoverFunctionality() {
        // no hover functionality for spanned rows
    }
    public override resetHoveredStatus() {
        // no hover functionality for spanned rows
    }
}
