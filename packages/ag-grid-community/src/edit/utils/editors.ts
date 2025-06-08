import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import { _getCellCtrl } from './controllers';

export const UNEDITED = Symbol('unedited');

export function _setupEditors(
    beans: BeanCollection,
    editingCells: Required<EditPosition>[],
    position?: Required<EditPosition>,
    key?: string | null,
    cellStartedEdit?: boolean | null
): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
    if (editingCells.length === 0 && position?.rowNode && position?.column) {
        return _setupEditor(beans, position, key, cellStartedEdit);
    }

    const { valueSvc, editSvc, editModelSvc } = beans;

    let startedCompDetails: UserCompDetails<ICellEditorComp<any, any, any>> | undefined;

    for (const cellPosition of editingCells) {
        const { rowNode, column } = cellPosition;
        const curCellCtrl = _getCellCtrl(beans, cellPosition);

        if (!curCellCtrl) {
            if (rowNode && column) {
                const newValue =
                    key ??
                    editSvc?.getCellDataValue(cellPosition) ??
                    valueSvc.getValueForDisplay(column as AgColumn, rowNode)?.value ??
                    UNEDITED;

                const oldValue = valueSvc.getValue(column as AgColumn, rowNode, undefined, 'api');

                editModelSvc?.setEdit(cellPosition, { newValue, oldValue, state: 'editing' });
            }
            continue;
        }

        const shouldStartEditing = cellStartedEdit && rowNode === curCellCtrl.rowNode && curCellCtrl.column === column;

        const compDetails = _setupEditor(
            beans,
            { rowNode: rowNode!, column: curCellCtrl.column! }!,
            key,
            shouldStartEditing
        );

        if (shouldStartEditing) {
            startedCompDetails = compDetails;
        }
    }

    return startedCompDetails;
}

export function _valuesDiffer({ newValue, oldValue }: Pick<EditValue, 'newValue' | 'oldValue'>): boolean {
    return newValue !== UNEDITED && `${newValue ?? ''}` !== `${oldValue ?? ''}`;
}

export function _setupEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    key?: string | null,
    cellStartedEdit?: boolean | null
): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
    const cellCtrl = _getCellCtrl(beans, position)!;
    const editorComp = cellCtrl?.comp?.getCellEditor();

    const editorParams = _createEditorParams(beans, position, key, cellStartedEdit);

    const newValue = key ?? editorParams.value;
    const oldValue = beans.valueSvc.getValue(position.column as AgColumn, position.rowNode, undefined, 'api');

    beans.editModelSvc?.setEdit(position, { newValue: newValue ?? UNEDITED, oldValue, state: 'editing' });

    if (editorComp) {
        // don't reinitialise, just refresh if possible
        editorComp.refresh?.(editorParams);
        return cellCtrl.editCompDetails;
    }

    const colDef = position.column.getColDef();
    const compDetails = _getCellEditorDetails(beans.userCompFactory, colDef, editorParams);

    // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
    const popup = compDetails?.popupFromSelector != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
    const popupLocation: 'over' | 'under' | undefined =
        compDetails?.popupPositionFromSelector != null
            ? compDetails.popupPositionFromSelector
            : colDef.cellEditorPopupPosition;

    if (cellCtrl) {
        cellCtrl.editCompDetails = compDetails;
        cellCtrl.comp?.setEditDetails(compDetails, popup, popupLocation, beans.gos.get('reactiveCustomComponents'));
    }

    return compDetails;
}

function _valueFromEditor(cancel: boolean, cellComp?: ICellComp): { newValue?: any; newValueExists: boolean } {
    const noValueResult = { newValueExists: false };

    if (cancel) {
        return noValueResult;
    }

    const cellEditor = cellComp?.getCellEditor();

    if (!cellEditor) {
        return noValueResult;
    }

    const userWantsToCancel = cellEditor.isCancelAfterEnd?.();

    if (userWantsToCancel) {
        return noValueResult;
    }

    const newValue = cellEditor.getValue();

    return {
        newValue,
        newValueExists: true,
    };
}

function _createEditorParams(
    beans: BeanCollection,
    position: Required<EditPosition>,
    key?: string | null,
    cellStartedEdit?: boolean | null
): ICellEditorParams {
    const { valueSvc, gos, editSvc } = beans;
    const cellCtrl = _getCellCtrl(beans, position);
    const rowIndex = position.rowNode?.rowIndex ?? undefined;
    const batchEdit = editSvc?.batch;

    const agColumn = beans.colModel.getCol(position.column.getId())!;
    const { rowNode, column } = position;

    const initialNewValue = editSvc?.getCellDataValue(position) ?? _valueFromEditor(false, cellCtrl?.comp)?.newValue;
    const value =
        initialNewValue === UNEDITED ? valueSvc.getValueForDisplay(agColumn, rowNode)?.value : initialNewValue;

    return _addGridCommonParams(gos, {
        value,
        eventKey: key ?? null,
        column,
        colDef: column.getColDef(),
        rowIndex,
        node: rowNode,
        data: rowNode.data,
        cellStartedEdit: cellStartedEdit ?? false,
        onKeyDown: cellCtrl?.onKeyDown.bind(cellCtrl),
        stopEditing: (suppressNavigateAfterEdit: boolean) => {
            editSvc!.stopEditing(position, { source: batchEdit ? 'ui' : 'api', suppressNavigateAfterEdit });
            _destroyEditor(beans, position);
            editSvc?.updateCells();
        },
        eGridCell: cellCtrl?.eGui,
        parseValue: (newValue: any) => valueSvc.parseValue(agColumn, rowNode, newValue, cellCtrl?.value),
        formatValue: cellCtrl?.formatValue.bind(cellCtrl),
    } as ICellEditorParams);
}

export function _purgeUnchangedEdits(beans: BeanCollection): void {
    const { editModelSvc, editSvc } = beans;
    const removedRows: IRowNode[] = [];
    const removedCells: Required<EditPosition>[] = [];
    editModelSvc?.getEditMap().forEach((editRow, rowNode) => {
        const removedRowCells: Required<EditPosition>[] = [];
        editRow.forEach((edit, column) => {
            if (edit.newValue !== UNEDITED && !_valuesDiffer(edit) && edit.state !== 'editing') {
                // remove edits where the pending is equal to the old value
                editModelSvc?.removeEdits({ rowNode, column });
                removedRowCells.push({ rowNode, column });
            }
        });

        if (removedRowCells.length === editRow.size) {
            // if all cells in the row were removed, remove the row
            removedRows.push(rowNode);
        }
        removedCells.push(...removedRowCells);
    });

    removedCells.forEach((cell) => editSvc?.dispatchCellEvent(cell, undefined, 'cellEditingStopped'));
    removedRows.forEach((rowNode) => editSvc?.dispatchRowEvent({ rowNode }, 'rowEditingStopped'));
}

export function _refreshEditorOnColDefChanged(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const editor = cellCtrl.comp?.getCellEditor();
    if (!editor?.refresh) {
        return;
    }

    const { eventKey, cellStartedEdit } = cellCtrl.editCompDetails!.params;
    const { column } = cellCtrl;
    const editorParams = _createEditorParams(beans, cellCtrl, eventKey, cellStartedEdit);
    const colDef = column.getColDef();
    const compDetails = _getCellEditorDetails(beans.userCompFactory, colDef, editorParams);
    editor.refresh(compDetails!.params);
}

export function _syncFromEditors(beans: BeanCollection): void {
    beans.editModelSvc?.getEditPositions().forEach((cellId) => {
        const cellCtrl = _getCellCtrl(beans, cellId);

        if (!cellCtrl) {
            return;
        }

        const { newValue, newValueExists } = _valueFromEditor(false, cellCtrl.comp);

        if (!newValueExists) {
            return;
        }

        _syncFromEditor(beans, cellId, newValue);
    });
}

export function _syncFromEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    newValue?: any,
    _eventSource?: string
): void {
    const { rowNode, column } = position;

    if (!(rowNode && column)) {
        return;
    }

    const oldValue = beans.valueSvc.getValue(column as AgColumn, rowNode, undefined, 'api');
    const cellCtrl = _getCellCtrl(beans, position);
    const hasEditor = !!cellCtrl?.comp?.getCellEditor();

    // Only handle undefined, null is used to indicate a cleared cell value
    if (newValue === undefined) {
        newValue = UNEDITED;
    }

    beans.editModelSvc?.setEdit(position, { newValue, oldValue, state: hasEditor ? 'editing' : 'changed' });

    beans.eventSvc.dispatchEvent({
        type: 'cellEditValuesChanged',
    });
}

export function _destroyEditors(beans: BeanCollection, edits: Required<EditPosition>[]): void {
    edits.forEach((cellPosition) => _destroyEditor(beans, cellPosition));
}

export function _destroyEditor(beans: BeanCollection, edit: Required<EditPosition>): void {
    const cellCtrl = _getCellCtrl(beans, edit);
    if (!cellCtrl) {
        return;
    }

    const { comp } = cellCtrl;

    comp?.setEditDetails(); // passing nothing stops editing
    comp?.refreshEditStyles(false, false);
    cellCtrl?.updateAndFormatValue(false);
    cellCtrl?.refreshCell({ forceRefresh: true, suppressFlash: true });

    if (beans.editModelSvc?.hasEdits(edit)) {
        beans.editModelSvc?.setState(edit, 'changed');
    }
}

export function _refreshCell(beans: BeanCollection, edit: EditPosition): void {
    const cellCtrl = _getCellCtrl(beans, edit);
    if (!cellCtrl) {
        return;
    }

    const { comp } = cellCtrl;
    comp?.refreshEditStyles(false, false);
    cellCtrl?.updateAndFormatValue(false);
    cellCtrl?.refreshCell({ forceRefresh: true, suppressFlash: true });
}
