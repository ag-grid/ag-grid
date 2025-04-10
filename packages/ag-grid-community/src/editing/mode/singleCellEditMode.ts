import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { BaseEditMode } from './baseEditMode';

export class SingleCellEditMode extends BaseEditMode {
    public startEditing(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined
    ): boolean {
        console.warn('SingleCellEditMode: startEditing', rowCtrl, cellCtrl, key, event);
        if (this.editingModel.isEditing()) {
            this.stopEditing();
        }

        const rowId = rowCtrl.rowId!;
        const colId = cellCtrl?.column.getColId() ?? this.beans.visibleCols.getFirstColumn()!.getColId();

        this.editingModel.createEditModel(rowId, colId);
        return true;
    }

    public stopEditing(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl, cancel?: boolean): boolean {
        console.warn('SingleCellEditMode: stopEditing', cancel);
        if (rowCtrl) {
            this.editingModel.stopEditing(rowCtrl!.rowId!, cellCtrl?.column.colId);
        } else {
            this.editingModel.stopEditing();
        }
        return true;
    }

    public isEditing(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean {
        console.warn('SingleCellEditMode: isEditing', rowCtrl, cellCtrl);
        return this.editingModel.isEditing(rowCtrl?.rowId ?? undefined, cellCtrl?.column.colId);
    }
}
