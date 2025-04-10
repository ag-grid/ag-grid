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
        if (this.beans.editingModelSvc?.isEditing()) {
            this.stopEditing();
        }

        const rowId = rowCtrl.rowId!;
        const colId = cellCtrl?.column.getColId() ?? this.beans.visibleCols.getFirstColumn()!.getColId();

        this.beans.editingModelSvc?.createEditModel(rowId, colId);
        return true;
    }

    public stopEditing(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl, cancel?: boolean): boolean {
        console.warn('SingleCellEditMode: stopEditing', cancel);
        if (rowCtrl) {
            this.beans.editingModelSvc?.stopEditing(rowCtrl!.rowId!, cellCtrl?.column.colId);
        } else {
            this.beans.editingModelSvc?.stopEditing();
        }
        return true;
    }

    public isEditing(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean {
        return this.beans.editingModelSvc?.isEditing(rowCtrl?.rowId ?? undefined, cellCtrl?.column.colId) ?? false;
    }
}
