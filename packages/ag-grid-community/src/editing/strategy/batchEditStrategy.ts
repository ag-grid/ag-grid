import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditStrategy } from './baseEditStrategy';

export class BatchEditStrategy extends BaseEditStrategy {
    protected override onCellFocusChanged(event: CellFocusedEvent<any, any>): void {
        // NOP
    }

    public override stopEditing(
        rowCtrl?: RowCtrl | undefined,
        cellCtrl?: CellCtrl | undefined,
        cancel?: boolean | undefined
    ): boolean {
        return false;
    }

    public override cancelEditing(rowCtrl?: RowCtrl | undefined, cellCtrl?: CellCtrl | undefined): boolean {
        return false;
    }

    public override moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent
    ): boolean | null {
        // NOP
        return false;
    }
}
