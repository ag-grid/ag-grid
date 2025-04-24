import type { Bean } from '../../context/bean';
import type { ICellEditorComp } from '../../interfaces/iCellEditor';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
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

    stopAllEditing?(): void;

    cancelEditing?(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl): boolean;

    moveToNextEditingCell(previousCell: CellCtrl, backwards: boolean, event?: KeyboardEvent): boolean | null;

    setupEditors(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        cellStartedEdit?: boolean | null
    ): UserCompDetails<ICellEditorComp<any, any, any>> | undefined;
}
