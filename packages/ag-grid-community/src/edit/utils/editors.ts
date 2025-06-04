import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import type { CellIdPositions, EditedCell } from '../editModelService';
import { _resolveCellController } from './controllers';

export const UNEDITED = Symbol('unedited');

export function _setupEditors(
    beans: BeanCollection,
    editingCells: CellIdPositions[],
    rowNode?: IRowNode | null,
    column?: Column | null,
    key?: string | null,
    cellStartedEdit?: boolean | null
): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
    if (editingCells.length === 0 && rowNode && column) {
        return _setupEditor(beans, rowNode, column, key, cellStartedEdit);
    }

    const { valueSvc, editSvc } = beans;

    let startedCompDetails: UserCompDetails<ICellEditorComp<any, any, any>> | undefined;

    for (const cellPosition of editingCells) {
        const curCellCtrl = _resolveCellController(beans, cellPosition);

        if (!curCellCtrl) {
            if (rowNode && column) {
                const newValue =
                    key ??
                    editSvc?.getCellDataValue(rowNode, column) ??
                    valueSvc.getValueForDisplay(column as AgColumn, rowNode)?.value ??
                    UNEDITED;

                const oldValue = beans.valueSvc.getValue(column as AgColumn, rowNode, undefined, 'api');

                beans.editModelSvc?.setPendingValue(rowNode, column, newValue, oldValue, 'editing');
            }
            continue;
        }

        const shouldStartEditing = cellStartedEdit && rowNode === curCellCtrl.rowNode && curCellCtrl.column === column;

        const compDetails = _setupEditor(beans, rowNode!, curCellCtrl.column!, key, shouldStartEditing);

        if (shouldStartEditing) {
            startedCompDetails = compDetails;
        }
    }

    return startedCompDetails;
}

export function _valuesDiffer({ newValue, oldValue }: Pick<EditedCell, 'newValue' | 'oldValue'>): boolean {
    return newValue !== UNEDITED && `${newValue ?? ''}` !== `${oldValue ?? ''}`;
}

export function _setupEditor(
    beans: BeanCollection,
    rowNode: IRowNode,
    column: Column,
    key?: string | null,
    cellStartedEdit?: boolean | null
): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
    const cellCtrl = _resolveCellController(beans, { rowNode, column })!;
    const editorComp = cellCtrl?.comp?.getCellEditor();

    const editorParams = _createCellEditorParams(beans, rowNode, column, key, cellStartedEdit);

    const newValue = key ?? editorParams.value;
    const oldValue = beans.valueSvc.getValue(column as AgColumn, rowNode, undefined, 'api');

    beans.editModelSvc?.setPendingValue(rowNode, column, newValue ?? UNEDITED, oldValue, 'editing');

    if (editorComp) {
        // don't reinitialise, just refresh if possible
        editorComp.refresh?.(editorParams);
        return cellCtrl.editCompDetails;
    }

    const colDef = column.getColDef();
    const compDetails = _getCellEditorDetails(beans.userCompFactory, colDef, editorParams);

    // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
    const popup = compDetails?.popupFromSelector != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
    const position: 'over' | 'under' | undefined =
        compDetails?.popupPositionFromSelector != null
            ? compDetails.popupPositionFromSelector
            : colDef.cellEditorPopupPosition;

    cellCtrl.editCompDetails = compDetails;
    cellCtrl.comp?.setEditDetails(compDetails, popup, position, beans.gos.get('reactiveCustomComponents'));

    return compDetails;
}

function _takeValueFromCellEditor(cancel: boolean, cellComp: ICellComp): { newValue?: any; newValueExists: boolean } {
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

function _createCellEditorParams(
    beans: BeanCollection,
    rowNode: IRowNode,
    column: Column,
    key?: string | null,
    cellStartedEdit?: boolean | null
): ICellEditorParams {
    const { valueSvc, gos, editSvc } = beans;
    const cellCtrl = _resolveCellController(beans, { rowNode, column })!;
    const {
        cellPosition: { rowIndex },
    } = cellCtrl;
    const batchEdit = editSvc?.batchEditing;

    const agColumn = beans.colModel.getCol(column.getId())!;

    const initialNewValue =
        editSvc?.getCellDataValue(rowNode, column) ?? _takeValueFromCellEditor(false, cellCtrl.comp)?.newValue;
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
        onKeyDown: cellCtrl.onKeyDown.bind(cellCtrl),
        stopEditing: (suppressNavigateAfterEdit) => {
            editSvc!.stopEditing(
                rowNode,
                column,
                undefined,
                undefined,
                undefined,
                batchEdit ? 'ui' : 'api',
                suppressNavigateAfterEdit
            );
            _destroyEditor(beans, { rowNode, column });
            editSvc?.updateCells();
        },
        eGridCell: cellCtrl.eGui,
        parseValue: (newValue: any) => valueSvc.parseValue(agColumn, rowNode, newValue, cellCtrl.value),
        formatValue: cellCtrl.formatValue.bind(cellCtrl),
    });
}

export function _purgeUnchangedEdits(beans: BeanCollection): void {
    const removedRows: IRowNode[] = [];
    const removedCells: CellIdPositions[] = [];
    beans.editModelSvc?.getPendingUpdates().forEach((rowUpdateMap, rowNode) => {
        const removedRowCells: CellIdPositions[] = [];
        rowUpdateMap.forEach((cellData, column) => {
            if (cellData.newValue !== UNEDITED && !_valuesDiffer(cellData) && cellData.state !== 'editing') {
                // remove edits where the pending is equal to the old value
                beans.editModelSvc?.removePendingEdit(rowNode, column);
                removedRowCells.push({ rowNode, column });
            }
        });

        if (removedRowCells.length === rowUpdateMap.size) {
            // if all cells in the row were removed, remove the row
            removedRows.push(rowNode);
        }
        removedCells.push(...removedRowCells);
    });

    removedCells.forEach(({ rowNode, column }) => {
        beans.editSvc?.dispatchCellEvent(rowNode, column, undefined, 'cellEditingStopped');
    });
    removedRows.forEach((rowNode) => {
        beans.editSvc?.dispatchRowEvent(rowNode, 'rowEditingStopped');
    });
}

export function _refreshEditorOnColDefChanged(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const cellEditor = cellCtrl.comp?.getCellEditor();
    if (!cellEditor?.refresh) {
        return;
    }

    const { eventKey, cellStartedEdit } = cellCtrl.editCompDetails!.params;
    const { rowNode, column } = cellCtrl;
    const editorParams = _createCellEditorParams(beans, rowNode, column, eventKey, cellStartedEdit);
    const colDef = column.getColDef();
    const compDetails = _getCellEditorDetails(beans.userCompFactory, colDef, editorParams);
    cellEditor.refresh(compDetails!.params);
}

export function _syncModelsFromEditors(beans: BeanCollection): void {
    beans.editModelSvc?.getPendingCellIds().forEach((cellId) => {
        const cellCtrl = _resolveCellController(beans, cellId);

        if (!cellCtrl) {
            return;
        }

        const { newValue, newValueExists } = _takeValueFromCellEditor(false, cellCtrl.comp);

        if (!newValueExists) {
            return;
        }

        _syncModelFromEditor(beans, cellId.rowNode, cellId.column, newValue);
    });
}

export function _syncModelFromEditor(
    beans: BeanCollection,
    rowNode?: IRowNode | null,
    column?: Column | null,
    newValue?: any,
    _eventSource?: string
): void {
    if (!(rowNode && column)) {
        return;
    }

    const oldValue = beans.valueSvc.getValue(column as AgColumn, rowNode, undefined, 'api');
    const cellCtrl = _resolveCellController(beans, { rowNode, column });
    const hasEditor = !!cellCtrl?.comp?.getCellEditor();

    // Only handle undefined, null is used to indicate a cleared cell value
    if (newValue === undefined) {
        newValue = UNEDITED;
    }

    beans.editModelSvc?.setPendingValue(rowNode, column, newValue, oldValue, hasEditor ? 'editing' : 'changed');

    beans.eventSvc.dispatchEvent({
        type: 'cellEditValuesChanged',
    });
}

export function _destroyEditors(beans: BeanCollection, cellPositions: CellIdPositions[]): void {
    cellPositions.forEach((cellPosition) => _destroyEditor(beans, cellPosition));
}

export function _destroyEditor(beans: BeanCollection, cellPosition: CellIdPositions): void {
    const cellCtrl = _resolveCellController(beans, cellPosition);
    if (!cellCtrl) {
        return;
    }

    const { comp } = cellCtrl;

    comp?.setEditDetails(); // passing nothing stops editing
    comp?.refreshEditStyles(false, false);
    cellCtrl?.updateAndFormatValue(false);
    cellCtrl?.refreshCell({ forceRefresh: true, suppressFlash: true });

    if (beans.editModelSvc?.hasPending(cellPosition.rowNode, cellPosition.column)) {
        beans.editModelSvc?.setState(cellPosition.rowNode, cellPosition.column, 'changed');
    }
}

export function _refreshCell(beans: BeanCollection, cellPosition: CellIdPositions): void {
    const cellCtrl = _resolveCellController(beans, cellPosition);
    if (!cellCtrl) {
        return;
    }

    const { comp } = cellCtrl;
    comp?.refreshEditStyles(false, false);
    cellCtrl?.updateAndFormatValue(false);
    cellCtrl?.refreshCell({ forceRefresh: true, suppressFlash: true });
}
