import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { RowNode } from '../../entities/rowNode';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { ICellEditorComp, ICellEditorParams } from '../../interfaces/iCellEditor';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import type { CellIdPositions } from '../editingModelService';
import { _resolveCellController, _resolveControllers } from './controllers';

export function _setupEditors(
    beans: BeanCollection,
    editingCells: CellIdPositions[],
    rowCtrl?: RowCtrl | null,
    cellCtrl?: CellCtrl | null,
    key?: string | null,
    cellStartedEdit?: boolean | null
): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
    if (editingCells.length === 0 && cellCtrl) {
        return _setupEditor(beans, cellCtrl, key, cellStartedEdit);
    }

    let startedCompDetails: UserCompDetails<ICellEditorComp<any, any, any>> | undefined;

    for (const cellPosition of editingCells) {
        const curCellCtrl = _resolveCellController(beans, cellPosition);

        if (!curCellCtrl) {
            continue;
        }

        const shouldStartEditing = cellStartedEdit && rowCtrl === curCellCtrl.rowCtrl && curCellCtrl === cellCtrl;

        const compDetails = _setupEditor(beans, curCellCtrl, key, shouldStartEditing);

        if (shouldStartEditing) {
            startedCompDetails = compDetails;
        }
    }

    return startedCompDetails;
}

export function _setupEditor(
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    key?: string | null,
    cellStartedEdit?: boolean | null
): UserCompDetails<ICellEditorComp<any, any, any>> | undefined {
    const editorParams = _createCellEditorParams(beans, cellCtrl, key, cellStartedEdit);
    const colDef = cellCtrl.column.getColDef();
    const compDetails = _getCellEditorDetails(beans.userCompFactory, colDef, editorParams);

    // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
    const popup = compDetails?.popupFromSelector != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
    const position: 'over' | 'under' | undefined =
        compDetails?.popupPositionFromSelector != null
            ? compDetails.popupPositionFromSelector
            : colDef.cellEditorPopupPosition;

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

export function _takeValueFromCellEditor(
    cancel: boolean,
    cellComp: ICellComp
): { newValue?: any; newValueExists: boolean } {
    const noValueResult = { newValueExists: false };

    if (cancel) {
        return noValueResult;
    }

    const cellEditor = cellComp.getCellEditor();

    if (!cellEditor) {
        return noValueResult;
    }

    const userWantsToCancel = cellEditor.isCancelAfterEnd && cellEditor.isCancelAfterEnd();

    if (userWantsToCancel) {
        return noValueResult;
    }

    const newValue = cellEditor.getValue();

    return {
        newValue,
        newValueExists: true,
    };
}

/**
 * @returns `True` if the value changes, otherwise `False`.
 */
export function _saveNewValue(
    cellCtrl: CellCtrl,
    oldValue: any,
    newValue: any,
    rowNode: RowNode,
    column: AgColumn
): boolean {
    if (newValue === oldValue) {
        return false;
    }

    console.log('Saving new value', cellCtrl, oldValue, newValue);

    // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
    // getting triggered, which results in all cells getting refreshed. we do not want this refresh
    // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
    // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
    cellCtrl.suppressRefreshCell = true;
    const valueChanged = rowNode.setDataValue(column, newValue, 'edit');
    cellCtrl.suppressRefreshCell = false;

    return valueChanged;
}

export function _createCellEditorParams(
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    key?: string | null,
    cellStartedEdit?: boolean | null
): ICellEditorParams {
    const {
        column,
        rowNode,
        cellPosition: { rowIndex },
    } = cellCtrl;
    const { valueSvc, gos, editingSvc } = beans;

    return _addGridCommonParams(gos, {
        value: valueSvc.getValueForDisplay(column, rowNode)?.value,
        eventKey: key ?? null,
        column,
        colDef: column.getColDef(),
        rowIndex,
        node: rowNode,
        data: rowNode.data,
        cellStartedEdit: cellStartedEdit ?? false,
        onKeyDown: cellCtrl.onKeyDown.bind(cellCtrl),
        stopEditing: (_suppressNavigateAfterEdit) => editingSvc!.stopEditing(cellCtrl.rowCtrl, cellCtrl),
        eGridCell: cellCtrl.eGui,
        parseValue: (newValue: any) => valueSvc.parseValue(column, rowNode, newValue, cellCtrl.value),
        formatValue: cellCtrl.formatValue.bind(cellCtrl),
    });
}

export function _refreshEditorOnColDefChanged(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const cellEditor = cellCtrl.comp?.getCellEditor();
    if (cellEditor?.refresh) {
        const { eventKey, cellStartedEdit } = cellCtrl.editCompDetails!.params;
        const editorParams = _createCellEditorParams(beans, cellCtrl, eventKey, cellStartedEdit);
        const colDef = cellCtrl.column.getColDef();
        const compDetails = _getCellEditorDetails(beans.userCompFactory, colDef, editorParams);
        cellEditor.refresh(compDetails!.params);
    }
}

export function _syncModelsFromEditors(beans: BeanCollection): void {
    console.log('Syncing models from editors');
    beans.editingModelSvc?.getEditingCellIds().forEach((cellId) => {
        const { rowCtrl, cellCtrl } = _resolveControllers(beans, cellId)!;
        const { comp } = cellCtrl!;

        const { newValue, newValueExists } = _takeValueFromCellEditor(false, comp);

        if (!newValueExists) {
            return;
        }

        return _syncModelFromEditor(beans, rowCtrl, cellCtrl, newValue);
    });
}

export function _syncModelFromEditor(
    beans: BeanCollection,
    rowCtrl?: RowCtrl | null,
    cellCtrl?: CellCtrl | null,
    newValue?: any,
    eventSource?: string
): boolean | null {
    if (eventSource !== 'edit' && rowCtrl && cellCtrl && beans.editingSvc?.isEditing(rowCtrl, cellCtrl)) {
        const oldValue = beans.valueSvc.getValue(cellCtrl.column, rowCtrl.rowNode, undefined, 'api');
        beans.editingModelSvc
            ?.getEditModel(rowCtrl.rowId as string, cellCtrl.column.getColId())
            ?.setValues(oldValue, newValue);
        return true;
    }
    return null;
}

export function _destroyEditors(
    beans: BeanCollection,
    cellPositions: CellIdPositions[],
    cancel: boolean,
    source: 'ui' | 'api' = 'ui'
): void {
    console.log('Destroying editors', cellPositions, cancel, source);
    _syncModelsFromEditors(beans);

    cellPositions.forEach((cellPosition) => {
        _destroyEditor(beans, cellPosition, cancel, source);
    });
}

function _takeNewValueFromPosition(
    beans: BeanCollection,
    cellPosition: CellIdPositions
): { newValue?: any; newValueExists: boolean } {
    const cellCtrl = _resolveCellController(beans, cellPosition);
    if (!cellCtrl) {
        return { newValueExists: false };
    }

    if (cellPosition.oldValue !== cellPosition.newValue) {
        return { newValue: cellPosition.newValue, newValueExists: true };
    }

    const { comp } = cellCtrl;
    return _takeValueFromCellEditor(false, comp);
}

export function _destroyEditor(
    beans: BeanCollection,
    cellPosition: CellIdPositions,
    cancel?: boolean,
    source: 'ui' | 'api' = 'ui'
): void {
    console.log('Destroying editor', cellPosition);

    const { rowCtrl, cellCtrl } = _resolveControllers(beans, cellPosition);

    const batchEdit = beans.gos.get('batchEdit');

    const { comp, column, rowNode } = cellCtrl!;

    const { newValue, newValueExists } = _takeNewValueFromPosition(beans, cellPosition); //_takeValueFromCellEditor(false, comp);

    let valueChanged = false;
    let oldValue: any;

    const preserveBatchEdits = source !== 'api' && batchEdit && !cancel;
    if (preserveBatchEdits) {
        _syncModelsFromEditors(beans);
    } else {
        oldValue = beans.valueSvc.getValueForDisplay(column, rowNode)?.value;

        if (!cancel && newValueExists) {
            valueChanged = _saveNewValue(cellCtrl!, oldValue, newValue, rowNode, column);
        }
    }

    comp.setEditDetails(); // passing nothing stops editing
    comp.refreshEditStyles(false, false);
    cellCtrl?.updateAndFormatValue(false);
    cellCtrl?.refreshCell({ forceRefresh: true, suppressFlash: true, editing: false });

    if (!preserveBatchEdits) {
        beans.eventSvc.dispatchEvent({
            ...cellCtrl!.createEvent(null, 'cellEditingStopped'),
            oldValue,
            newValue,
            valueChanged,
        });

        comp.toggleCss('ag-cell-batch-edit', false);

        rowCtrl?.forEachGui(undefined, (gui) => {
            gui.rowComp.toggleCss('ag-row-editing', false);
            gui.rowComp.toggleCss('ag-row-batch-edit', false);
        });
    } else {
        comp.toggleCss('ag-cell-batch-edit', true);
    }
}
