import { _unwrapUserComp } from '../../components/framework/unwrapUserComp';
import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type {
    GetCellEditorInstancesParams,
    ICellEditor,
    ICellEditorComp,
    ICellEditorParams,
    ICellEditorValidationError,
} from '../../interfaces/iCellEditor';
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import type { IRowNode } from '../../interfaces/iRowNode';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _getLocaleTextFunc } from '../../misc/locale/localeUtils';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import { _setAriaInvalid } from '../../utils/aria';
import { _getCellCtrl } from './controllers';

export const UNEDITED = Symbol('unedited');

export function getCellEditorInstanceMap<TData = any>(
    beans: BeanCollection,
    params: GetCellEditorInstancesParams<TData> = {}
): { ctrl: CellCtrl; editor: ICellEditor }[] {
    const res: { ctrl: CellCtrl; editor: ICellEditor }[] = [];

    const ctrls = beans.rowRenderer.getCellCtrls(params.rowNodes, params.columns as AgColumn[]);

    for (const ctrl of ctrls) {
        const cellEditor = ctrl.comp?.getCellEditor();

        if (cellEditor) {
            res.push({
                ctrl,
                editor: _unwrapUserComp(cellEditor),
            });
        }
    }

    return res;
}

export const getCellEditorInstances = <TData = any>(
    beans: BeanCollection,
    params: GetCellEditorInstancesParams<TData> = {}
): ICellEditor[] => getCellEditorInstanceMap(beans, params).map((res) => res.editor);

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
    const { rowNode, column } = position ?? {};

    let startedCompDetails: UserCompDetails<ICellEditorComp<any, any, any>> | undefined;

    for (const cellPosition of editingCells) {
        const { rowNode: cellRowNode, column: cellColumn } = cellPosition;
        const curCellCtrl = _getCellCtrl(beans, cellPosition);

        if (!curCellCtrl) {
            if (cellRowNode && cellColumn) {
                const oldValue = valueSvc.getValue(cellColumn as AgColumn, cellRowNode, undefined, 'api');

                const newValue =
                    key ??
                    editSvc?.getCellDataValue(cellPosition) ??
                    valueSvc.getValueForDisplay(cellColumn as AgColumn, cellRowNode)?.value ??
                    oldValue ??
                    UNEDITED;

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

    const oldValue = beans.valueSvc.getValue(position.column as AgColumn, position.rowNode, undefined, 'api');
    let newValue = key ?? editorParams.value;

    if (newValue === undefined) {
        newValue = oldValue;
    }

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
        cellCtrl?.rowCtrl?.refreshRow({ suppressFlash: true });
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

    if (cellEditor.getValidationErrors?.()?.length) {
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
    const cellCtrl = _getCellCtrl(beans, position) as CellCtrl;
    const rowIndex = position.rowNode?.rowIndex ?? (undefined as unknown as number);
    const batchEdit = editSvc?.isBatchEditing();

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
        },
        eGridCell: cellCtrl?.eGui,
        parseValue: (newValue: any) => valueSvc.parseValue(agColumn, rowNode, newValue, cellCtrl?.value),
        formatValue: cellCtrl?.formatValue.bind(cellCtrl),
        validate: () => {
            editSvc?.validateEdit();
        },
    });
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
    source?: string
): void {
    const { rowNode, column } = position;

    if (!(rowNode && column)) {
        return;
    }

    const oldValue = beans.valueSvc.getValue(column as AgColumn, rowNode, undefined, 'api');
    const cellCtrl = _getCellCtrl(beans, position);
    const hasEditor = !!cellCtrl?.comp?.getCellEditor();
    const prevEditValue = beans.editModelSvc?.getEdit(position)?.newValue;

    // Only handle undefined, null is used to indicate a cleared cell value
    if (newValue === undefined) {
        newValue = UNEDITED;
    }

    // Note: we don't clear the edit state here (even if new===old) as this is also called from the stop editing flow.
    beans.editModelSvc?.setEdit(position, { newValue, oldValue, state: hasEditor ? 'editing' : 'changed' });

    if (prevEditValue === newValue) {
        // If the value hasn't changed, we don't need to dispatch an event
        return;
    }

    const { rowIndex, rowPinned, data } = rowNode;
    beans.eventSvc.dispatchEvent({
        type: 'cellEditValuesChanged',
        value: newValue,
        colDef: column.getColDef(),
        newValue,
        oldValue,
        source,
        column,
        rowIndex,
        rowPinned,
        data,
        node: rowNode,
    });
}

export function _destroyEditors(beans: BeanCollection, edits: Required<EditPosition>[]): void {
    edits.forEach((cellPosition) => _destroyEditor(beans, cellPosition));
}

export function _destroyEditor(beans: BeanCollection, position: EditPosition): void {
    const cellCtrl = _getCellCtrl(beans, position);
    if (!cellCtrl) {
        return;
    }

    const { comp } = cellCtrl;

    if (comp && !comp.getCellEditor()) {
        // no editor, nothing to do
        return;
    }

    const { rowNode, column } = position;

    comp?.setEditDetails(); // passing nothing stops editing
    if (beans.editModelSvc?.hasEdits(position) && rowNode && column) {
        beans.editModelSvc?.setState(position, 'changed');
    }

    comp?.refreshEditStyles(false, false);

    cellCtrl?.refreshCell({ force: true, suppressFlash: true });

    beans.rowRenderer.refreshCells({ rowNodes: rowNode ? [rowNode] : [], suppressFlash: true, force: true });
}

export function _validateEdit(beans: BeanCollection): ICellEditorValidationError[] | null {
    const mappedEditors = getCellEditorInstanceMap(beans);

    if (!mappedEditors || mappedEditors.length === 0) {
        return null;
    }

    const { ariaAnnounce, localeSvc } = beans;
    const errors: ICellEditorValidationError[] = [];
    const translate = _getLocaleTextFunc(localeSvc);
    const ariaValidationErrorPrefix = translate('ariaValidationErrorPrefix', 'Cell Editor Validation');

    for (const mappedEditor of mappedEditors) {
        const { ctrl, editor } = mappedEditor;
        const { rowNode, column } = ctrl;
        const { rowIndex, rowPinned } = rowNode;
        const errorMessages = editor.getValidationErrors?.();
        const el = editor.getValidationElement?.();

        ctrl.refreshEditorTooltip();

        if (el) {
            const isInvalid = errorMessages != null && errorMessages.length > 0;
            const invalidMessage = isInvalid ? errorMessages.join('. ') : '';

            _setAriaInvalid(el, isInvalid);
            if (isInvalid) {
                ariaAnnounce.announceValue(`${ariaValidationErrorPrefix} ${errorMessages}`, 'editorValidation');
            }

            if (el instanceof HTMLInputElement) {
                el.setCustomValidity(invalidMessage);
            } else {
                el.classList.toggle('invalid', isInvalid);
            }
        }

        if (errorMessages) {
            errors.push({
                column,
                rowIndex: rowIndex!,
                rowPinned,
                messages: errorMessages,
            });
        }
    }

    return errors.length ? errors : null;
}
