import type { BeanName } from '../../context/context';
import type { CellFocusedEvent } from '../../events';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditStrategy } from './baseEditStrategy';

export class BatchEditStrategy extends BaseEditStrategy {
    override beanName = 'batchEditMode' as BeanName | undefined;

    public override startEditing(
        _rowCtrl: RowCtrl,
        _cellCtrl?: CellCtrl | undefined,
        _key?: string | null | undefined,
        _event?: KeyboardEvent | MouseEvent | null | undefined
    ): boolean {
        return false;
    }

    public override shouldStopEditing(
        _rowCtrl?: RowCtrl | undefined,
        _cellCtrl?: CellCtrl | undefined
    ): boolean | null {
        return false;
    }

    protected override onCellFocusChanged(_event: CellFocusedEvent<any, any>): void {
        // NOP
    }

    public override stopEditing(
        _rowCtrl?: RowCtrl | undefined,
        _cellCtrl?: CellCtrl | undefined,
        _cancel?: boolean | undefined
    ): boolean {
        return false;
    }

    public override cancelEditing(_rowCtrl?: RowCtrl | undefined, _cellCtrl?: CellCtrl | undefined): boolean {
        return false;
    }

    public override moveToNextEditingCell(
        _previousCell: CellCtrl,
        _backwards: boolean,
        _event?: KeyboardEvent
    ): boolean | null {
        // NOP
        return false;
    }
}
