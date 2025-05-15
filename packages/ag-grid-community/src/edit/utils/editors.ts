import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import type { Column } from '../../interfaces/iColumn';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import type { CellIdPositions } from '../editModelService';
import { _resolveCellController, _resolveControllers } from './controllers';

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

    let startedCompDetails: UserCompDetails<ICellEditorComp<any, any, any>> | undefined;

    for (const cellPosition of editingCells) {
        const curCellCtrl = _resolveCellController(beans, cellPosition);

        if (!curCellCtrl) {
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

function _setupEditor(
    beans: BeanCollection,
    rowNode: IRowNode,
    column: Column,
    key?: string | null,
    cellStartedEdit?: boolean | null
): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
    const editorParams = _createCellEditorParams(beans, rowNode, column, key, cellStartedEdit);
    const colDef = column.getColDef();
    const compDetails = _getCellEditorDetails(beans.userCompFactory, colDef, editorParams);

    // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
    const popup = compDetails?.popupFromSelector != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
    const position: 'over' | 'under' | undefined =
        compDetails?.popupPositionFromSelector != null
            ? compDetails.popupPositionFromSelector
            : colDef.cellEditorPopupPosition;

    const cellCtrl = _resolveCellController(beans, { rowNode, column })!;

    cellCtrl.editCompDetails = compDetails;
    cellCtrl.comp.setEditDetails(compDetails, popup, position, beans.gos.get('reactiveCustomComponents'));

    return compDetails;
}

export function _getOldValue(beans: BeanCollection, cellCtrl?: CellCtrl): any {
    if (!cellCtrl) {
        return undefined;
    }

    const { column, rowNode } = cellCtrl;
    return beans.valueSvc.getValue(column, rowNode, undefined, 'api');
}

function _takeValueFromCellEditor(cancel: boolean, cellComp: ICellComp): { newValue?: any; newValueExists: boolean } {
    const noValueResult = { newValueExists: false };

    if (cancel) {
        return noValueResult;
    }

    const cellEditor = cellComp.getCellEditor();

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

    const agColumn = beans.colModel.getCol(column.getId())!;

    return _addGridCommonParams(gos, {
        value: valueSvc.getValueForDisplay(agColumn, rowNode)?.value,
        eventKey: key ?? null,
        column,
        colDef: column.getColDef(),
        rowIndex,
        node: rowNode,
        data: rowNode.data,
        cellStartedEdit: cellStartedEdit ?? false,
        onKeyDown: cellCtrl.onKeyDown.bind(cellCtrl),
        stopEditing: (suppressNavigateAfterEdit) =>
            editSvc!.stopEditing(rowNode, column, undefined, undefined, undefined, 'api', suppressNavigateAfterEdit),
        eGridCell: cellCtrl.eGui,
        parseValue: (newValue: any) => valueSvc.parseValue(agColumn, rowNode, newValue, cellCtrl.value),
        formatValue: cellCtrl.formatValue.bind(cellCtrl),
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
        const { comp, rowNode, column } = _resolveCellController(beans, cellId)!;

        const { newValue, newValueExists } = _takeValueFromCellEditor(false, comp);

        if (!newValueExists) {
            return;
        }

        return _syncModelFromEditor(beans, rowNode, column, newValue);
    });
}

export function _syncModelFromEditor(
    beans: BeanCollection,
    rowNode?: IRowNode | null,
    column?: Column | null,
    newValue?: any,
    eventSource?: string
): boolean | null {
    if (eventSource !== 'edit' && rowNode && column && beans.editSvc?.isEditing(rowNode, column)) {
        beans.editModelSvc?.addPendingEdit(rowNode, column, newValue);
        return true;
    }
    return null;
}

export function _destroyEditors(beans: BeanCollection, cellPositions: CellIdPositions[]): void {
    cellPositions.forEach((cellPosition) => _destroyEditor(beans, cellPosition));
}

export function _destroyEditor(beans: BeanCollection, cellPosition: CellIdPositions): void {
    const { cellCtrl } = _resolveControllers(beans, cellPosition);
    const { comp } = cellCtrl!;

    comp.setEditDetails(); // passing nothing stops editing
    comp.refreshEditStyles(false, false);
    cellCtrl?.updateAndFormatValue(false);
    cellCtrl?.refreshCell({ forceRefresh: true, suppressFlash: true });
}
