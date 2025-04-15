import type { Bean } from '../../context/bean';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';

export interface IEditStrategy extends Bean {
    startEditing?(
        rowCtrl: RowCtrl,
        cellCtrl?: CellCtrl,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null
    ): boolean;

    stopEditing?(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl): boolean;

    cancelEditing?(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl): boolean;

    isEditing?(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean;

    moveToNextEditingCell(previousCell: CellCtrl, backwards: boolean, event?: KeyboardEvent): boolean | null;
}

type RowStatusUpdateRecord = {
    status: boolean;
    cells: Record<string, boolean>;
};

export type EditingStateUpdates = Record<string, RowStatusUpdateRecord>;
