import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import { BeanStub } from '../../context/beanStub';
import type { CellFocusedEvent } from '../../events';
import type { ICellEditorComp } from '../../interfaces/iCellEditor';
import type { CellPosition } from '../../interfaces/iCellPosition';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { GridEditingModel } from '../model/gridEditingModel';
import type { IEditStrategy } from './iEditStrategy';
import { _createCellEditorParams, _resolveCellController, _saveNewValue, _takeValueFromCellEditor } from './utils';

export abstract class BaseEditStrategy extends BeanStub implements IEditStrategy {
    protected editModel: GridEditingModel;

    public abstract stopEditing?(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean;
    public abstract cancelEditing?(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean;
    public abstract shouldStopEditing(rowCtrl?: RowCtrl, cellCtrl?: CellCtrl): boolean | null;

    protected abstract onCellFocusChanged?(event: CellFocusedEvent): void;
    public abstract moveToNextEditingCell(
        previousCell: CellCtrl,
        backwards: boolean,
        event?: KeyboardEvent
    ): boolean | null;

    constructor(...args: any[]) {
        super();
        this.editModel = args[0];
    }

    postConstruct(): void {
        this.addManagedListeners(this.beans.eventSvc, {
            cellFocused: this.onCellFocusChanged?.bind(this),
            cellFocusCleared: this.onCellFocusChanged?.bind(this),
        });
    }

    protected isEditing(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null): boolean {
        return this.editModel.isEditing(rowCtrl, cellCtrl) ?? false;
    }

    public stopAllEditing(): void {
        const editingCells = this.editModel.getEditingCellPositions();
        if (editingCells.length === 0) {
            return;
        }
        editingCells.forEach((cellPosition) => {
            const cellCtrl = _resolveCellController(this.beans, {
                rowIndex: cellPosition.rowIndex,
                column: cellPosition.column,
            });

            if (cellCtrl) {
                this.editModel.stopEditing(cellCtrl.rowCtrl!.rowId!, cellCtrl?.column.colId);
                this.destroyEditor(cellCtrl.rowCtrl, cellCtrl);
            }
        });
    }

    setFocusOutOnEditor(cellCtrl: CellCtrl): void {
        if (!this.isEditing(cellCtrl.rowCtrl, cellCtrl)) {
            return;
        }
        const cellEditor = cellCtrl.comp.getCellEditor();

        if (cellEditor && cellEditor.focusOut) {
            cellEditor.focusOut();
        }
    }

    setFocusInOnEditor(cellCtrl: CellCtrl): void {
        if (!this.isEditing(cellCtrl.rowCtrl, cellCtrl)) {
            return;
        }
        const cellComp = cellCtrl.comp;
        const cellEditor = cellComp.getCellEditor();

        if (cellEditor?.focusIn) {
            // if the editor is present, then we just focus it
            cellEditor.focusIn();
        } else {
            // if the editor is not present, it means async cell editor (e.g. React)
            // and we are trying to set focus before the cell editor is present, so we
            // focus the cell instead
            cellCtrl.focusCell(true);
            cellCtrl.onEditorAttachedFuncs.push(() => cellComp.getCellEditor()?.focusIn?.());
        }
    }

    setDataValue(rowCtrl: RowCtrl, cellCtrl: CellCtrl, newValue: any): boolean | null {
        if (rowCtrl && cellCtrl) {
            if (this.shouldStopEditing(rowCtrl, cellCtrl)) {
                this.stopAllEditing();
            }

            this.editModel?.getEditModels(rowCtrl.rowId, cellCtrl.column.getColId())?.[0].updateValue(newValue);
            return true;
        }
        return null;
    }

    public setupEditors(
        rowCtrl?: RowCtrl | null,
        cellCtrl?: CellCtrl,
        key?: string | null,
        cellStartedEdit?: boolean | null
    ): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
        const editingCells = this.editModel.getEditingCellPositions();

        if (editingCells.length === 0) {
            return this.setupEditor(cellCtrl!, key, cellStartedEdit);
        }

        let startedCompDetails: UserCompDetails<ICellEditorComp<any, any, any>> | undefined;

        for (const cellPosition of editingCells) {
            const curCellCtrl = _resolveCellController(this.beans, {
                rowIndex: cellPosition.rowIndex,
                column: cellPosition.column,
            });

            if (!curCellCtrl) {
                continue;
            }

            const shouldStartEditing = cellStartedEdit && rowCtrl === curCellCtrl.rowCtrl && curCellCtrl === cellCtrl;

            const compDetails = this.setupEditor(curCellCtrl, key, shouldStartEditing);

            if (shouldStartEditing) {
                startedCompDetails = compDetails;
            }
        }

        return startedCompDetails;
    }

    private setupEditor(
        cellCtrl: CellCtrl,
        key?: string | null,
        cellStartedEdit?: boolean | null
    ): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
        const editorParams = _createCellEditorParams(this.beans, cellCtrl, key, cellStartedEdit);
        const colDef = cellCtrl.column.getColDef();
        const compDetails = _getCellEditorDetails(this.beans.userCompFactory, colDef, editorParams);

        // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
        const popup = compDetails?.popupFromSelector != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
        const position: 'over' | 'under' | undefined =
            compDetails?.popupPositionFromSelector != null
                ? compDetails.popupPositionFromSelector
                : colDef.cellEditorPopupPosition;

        cellCtrl.editCompDetails = compDetails;
        cellCtrl.comp.setEditDetails(compDetails, popup, position, this.gos.get('reactiveCustomComponents'));

        return compDetails;
    }

    protected destroyEditors(cellPositions: CellPosition[], cancel: boolean): void {
        console.warn('BaseEditStrategy: updateEditors', cellPositions, cancel);

        cellPositions.forEach((cellPosition) => {
            const cellCtrl = _resolveCellController(this.beans, {
                rowIndex: cellPosition.rowIndex,
                column: cellPosition.column,
            });

            this.destroyEditor(cellCtrl?.rowCtrl, cellCtrl, cancel);
        });
    }

    protected destroyEditor(rowCtrl?: RowCtrl | null, cellCtrl?: CellCtrl | null, cancel?: boolean): void {
        const { comp, column, rowNode } = cellCtrl!;

        const { newValue, newValueExists } = _takeValueFromCellEditor(false, comp);
        const oldValue = this.beans.valueSvc.getValueForDisplay(column, rowNode)?.value;
        let valueChanged = false;

        if (!cancel && newValueExists) {
            valueChanged = _saveNewValue(cellCtrl!, oldValue, newValue, rowNode, column);
        }

        comp.setEditDetails(); // passing nothing stops editing

        cellCtrl?.updateAndFormatValue(false);
        cellCtrl?.refreshCell({ forceRefresh: true, suppressFlash: true });

        this.eventSvc.dispatchEvent({
            ...cellCtrl!.createEvent(null, 'cellEditingStopped'),
            oldValue,
            newValue,
            valueChanged,
        });

        rowCtrl?.forEachGui(undefined, (gui) => {
            gui.rowComp.addOrRemoveCssClass('ag-row-editing', false);
        });
    }
}
