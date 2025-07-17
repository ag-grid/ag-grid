import { _unwrapUserComp } from '../../components/framework/unwrapUserComp';
import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type {
    DefaultProvidedCellEditorParams,
    EditingCellPosition,
    GetCellEditorInstancesParams,
    ICellEditor,
    ICellEditorParams,
    ICellEditorValidationError,
} from '../../interfaces/iCellEditor';
import type { EditMap, EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import { _getLocaleTextFunc } from '../../misc/locale/localeUtils';
import type { CellCtrl, ICellComp } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { _setAriaInvalid } from '../../utils/aria';
import { EditCellValidationModel, EditRowValidationModel } from '../editModelService';
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
    event?: Event | null,
    cellStartedEdit?: boolean | null
): void {
    if (editingCells.length === 0 && position?.rowNode && position?.column) {
        _setupEditor(beans, position, { key, event, cellStartedEdit });
    }

    const { valueSvc, editSvc, editModelSvc } = beans;
    const { rowNode, column } = position ?? {};

    for (const cellPosition of editingCells) {
        const { rowNode: cellRowNode, column: cellColumn } = cellPosition;
        const curCellCtrl = _getCellCtrl(beans, cellPosition);

        if (!curCellCtrl) {
            if (cellRowNode && cellColumn) {
                const oldValue = valueSvc.getValue(cellColumn as AgColumn, cellRowNode, undefined, 'api');
                const isNewValueCell = position?.rowNode === cellRowNode && position?.column === cellColumn;
                const cellStartValue = (isNewValueCell && key) || undefined;

                const newValue =
                    cellStartValue ??
                    editSvc?.getCellDataValue(cellPosition) ??
                    valueSvc.getValueForDisplay(cellColumn as AgColumn, cellRowNode)?.value ??
                    oldValue ??
                    UNEDITED;

                editModelSvc?.setEdit(cellPosition, { newValue, oldValue, state: 'editing' });
            }
            continue;
        }

        const shouldStartEditing = cellStartedEdit && rowNode === curCellCtrl.rowNode && curCellCtrl.column === column;

        _setupEditor(
            beans,
            { rowNode: rowNode!, column: curCellCtrl.column },
            {
                key: shouldStartEditing ? key : null,
                event: shouldStartEditing ? event : null,
                cellStartedEdit: shouldStartEditing,
            }
        );
    }

    return;
}

export function _valuesDiffer({ newValue, oldValue }: Pick<EditValue, 'newValue' | 'oldValue'>): boolean {
    if (newValue === UNEDITED) {
        newValue = oldValue;
    }
    return newValue !== oldValue;
}

export function _setupEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    params?: {
        key?: string | null;
        event?: Event | null;
        cellStartedEdit?: boolean | null;
        silent?: boolean;
    }
): void {
    const { key, event, cellStartedEdit, silent } = params ?? {};
    const cellCtrl = _getCellCtrl(beans, position)!;
    const editorComp = cellCtrl?.comp?.getCellEditor();

    const editorParams = _createEditorParams(beans, position, key, cellStartedEdit);

    const previousEdit = beans.editModelSvc?.getEdit(position);

    // if key is a single character, then we treat it as user input
    let newValue = key?.length === 1 ? key : editorParams.value;

    if (newValue === undefined) {
        newValue = previousEdit?.oldValue;
    }

    beans.editModelSvc?.setEdit(position, { newValue: newValue ?? UNEDITED, state: 'editing' });

    if (editorComp) {
        // don't reinitialise, just refresh if possible
        editorComp.refresh?.(editorParams);
        return;
    }

    const colDef = position.column.getColDef();
    const compDetails = _getCellEditorDetails(beans.userCompFactory, colDef, editorParams);

    // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
    const popup = compDetails?.popupFromSelector != null ? compDetails.popupFromSelector : !!colDef.cellEditorPopup;
    const popupLocation: 'over' | 'under' | undefined =
        compDetails?.popupPositionFromSelector != null
            ? compDetails.popupPositionFromSelector
            : colDef.cellEditorPopupPosition;

    checkAndPreventDefault(compDetails!.params, event);

    if (cellCtrl) {
        cellCtrl.editCompDetails = compDetails;
        cellCtrl.comp?.setEditDetails(compDetails, popup, popupLocation, beans.gos.get('reactiveCustomComponents'));
        cellCtrl?.rowCtrl?.refreshRow({ suppressFlash: true });

        if (!silent) {
            beans.editSvc?.dispatchCellEvent(position, event, 'cellEditingStarted');
        }
    }

    return;
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

    const validationErrors = cellEditor.getValidationErrors?.();

    if ((validationErrors?.length ?? 0) > 0) {
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

export function _purgeUnchangedEdits(beans: BeanCollection, includeEditing?: boolean): void {
    const { editModelSvc } = beans;
    editModelSvc?.getEditMap().forEach((editRow, rowNode) => {
        editRow.forEach((edit, column) => {
            if (!includeEditing && (edit.state === 'editing' || edit.newValue === UNEDITED)) {
                return;
            }

            if (!_valuesDiffer(edit) && (edit.state !== 'editing' || includeEditing)) {
                // remove edits where the pending is equal to the old value
                editModelSvc?.removeEdits({ rowNode, column });
            }
        });
    });
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

    editor.refresh(checkAndPreventDefault(compDetails!.params, eventKey));
}

function checkAndPreventDefault(
    params: ICellEditorParams & DefaultProvidedCellEditorParams,
    event?: Event | null
): ICellEditorParams {
    if (event instanceof KeyboardEvent && params.column.getColDef().cellEditor === 'agNumberCellEditor') {
        // `-`, `+`, `.`, `e` need suppressPreventDefault to prevent the editor from ignoring the keypress
        params.suppressPreventDefault =
            ['-', '+', '.', 'e'].includes(event?.key ?? '') || params.suppressPreventDefault;
    } else {
        event?.preventDefault?.();
    }

    return params;
}

export function _syncFromEditors(beans: BeanCollection, params?: { event?: Event | null }): void {
    beans.editModelSvc?.getEditPositions().forEach((cellId) => {
        const cellCtrl = _getCellCtrl(beans, cellId);

        if (!cellCtrl) {
            return;
        }

        const { newValue, newValueExists } = _valueFromEditor(false, cellCtrl.comp);

        if (!newValueExists) {
            return;
        }

        _syncFromEditor(beans, cellId, newValue, undefined, params);
    });
}

export function _syncFromEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    newValue?: any,
    _source?: string,
    params?: { event?: Event | null }
): void {
    const { editModelSvc, valueSvc } = beans;
    if (!editModelSvc) {
        return;
    }
    const { rowNode, column } = position;

    if (!(rowNode && column)) {
        return;
    }

    const oldValue =
        editModelSvc.getEdit(position)?.oldValue ?? valueSvc.getValue(column as AgColumn, rowNode, undefined, 'api');
    const cellCtrl = _getCellCtrl(beans, position);
    const hasEditor = !!cellCtrl?.comp?.getCellEditor();

    // Only handle undefined, null is used to indicate a cleared cell value
    if (newValue === undefined) {
        newValue = UNEDITED;
    }

    // Note: we don't clear the edit state here (even if new===old) as this is also called from the stop editing flow.
    editModelSvc.setEdit(position, { newValue, oldValue, state: hasEditor ? 'editing' : 'changed' });

    // re-read the value once it's been through all the formatting and parsing
    const { value } = valueSvc.getValueForDisplay(column as AgColumn, rowNode, true);

    newValue = value;

    // persist newly formatted value
    editModelSvc.setEdit(position, { newValue });

    if (newValue === oldValue || hasEditor) {
        // If the value hasn't changed or the editor is currently open, we don't need to dispatch an event
        return;
    }

    const edit = editModelSvc.getEdit(position);

    beans.editSvc?.dispatchCellEvent(position, params?.event, 'cellValueChanged', {
        valueChanged: edit && _valuesDiffer(edit),
        newValue: edit?.newValue,
        oldValue: edit?.oldValue,
    });
}

export function _destroyEditors(
    beans: BeanCollection,
    edits?: Required<EditPosition>[],
    params?: { event?: Event; silent?: boolean }
): void {
    if (!edits) {
        edits = beans.editModelSvc?.getEditPositions();
    }

    edits!.forEach((cellPosition) => _destroyEditor(beans, cellPosition, params));
}

export function _destroyEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    params?: { event?: Event | null; silent?: boolean }
): void {
    const { editSvc, editModelSvc } = beans;
    const { rowNode, column } = position;
    const cellCtrl = _getCellCtrl(beans, position);
    if (!cellCtrl) {
        if (editModelSvc?.hasEdits(position) && rowNode && column) {
            editModelSvc?.setState(position, 'changed');
        }

        return;
    }

    const { comp } = cellCtrl;

    if (comp && !comp.getCellEditor()) {
        // no editor, nothing to do
        return;
    }

    const errorMessages = comp?.getCellEditor()?.getValidationErrors?.();
    const cellValidationModel = editModelSvc?.getCellValidationModel();

    if (errorMessages?.length) {
        cellValidationModel?.setCellValidation(position, { errorMessages });
    } else {
        cellValidationModel?.clearCellValidation(position);
    }

    const wasEditing = editModelSvc?.getEdit(position)?.state === 'editing';

    if (editModelSvc?.hasEdits(position) && rowNode && column) {
        editModelSvc?.setState(position, 'changed');
    }

    comp?.setEditDetails(); // passing nothing stops editing
    comp?.refreshEditStyles(false, false);

    cellCtrl?.refreshCell({ force: true, suppressFlash: true });
    const edit = editModelSvc?.getEdit(position);

    if (wasEditing && edit?.state === 'changed' && !params?.silent) {
        editSvc?.dispatchCellEvent(position, params?.event, 'cellEditingStopped', {
            valueChanged: edit && _valuesDiffer(edit),
            newValue: edit?.newValue,
            oldValue: edit?.oldValue,
        });
    }
}

export type MappedValidationErrors = EditMap | undefined;

export function _populateModelValidationErrors(beans: BeanCollection): void {
    const mappedEditors = getCellEditorInstanceMap(beans);
    const cellValidationModel = new EditCellValidationModel();

    const { ariaAnnounce, localeSvc, editModelSvc, gos } = beans;
    const includeRows = gos.get('editType') === 'fullRow';
    const translate = _getLocaleTextFunc(localeSvc);
    const ariaValidationErrorPrefix = translate('ariaValidationErrorPrefix', 'Cell Editor Validation');

    for (const mappedEditor of mappedEditors) {
        const { ctrl, editor } = mappedEditor;
        const { rowNode, column } = ctrl;
        const errorMessages = editor.getValidationErrors?.() ?? [];
        const el = editor.getValidationElement?.(false) || (!editor.isPopup?.() && ctrl.eGui);

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

        if (errorMessages?.length > 0) {
            cellValidationModel.setCellValidation(
                {
                    rowNode,
                    column,
                },
                {
                    errorMessages,
                }
            );
        }
    }

    _syncFromEditors(beans);

    // the cellValidationModel should probably be reused to avoid
    // the second loop over mappedEditor below
    editModelSvc?.setCellValidationModel(cellValidationModel);

    const rowCtrlSet = new Set<RowCtrl>();

    for (const { ctrl } of mappedEditors) {
        rowCtrlSet.add(ctrl.rowCtrl);
    }

    if (includeRows) {
        const rowValidations = _generateRowValidationErrors(beans);
        editModelSvc?.setRowValidationModel(rowValidations);
    }

    for (const rowCtrl of rowCtrlSet.values()) {
        rowCtrl.rowEditStyleFeature?.applyRowStyles();
        for (const cellCtrl of rowCtrl.getAllCellCtrls()) {
            cellCtrl.tooltipFeature?.refreshTooltip(true);
            cellCtrl.editorTooltipFeature?.refreshTooltip(true);
            cellCtrl.editStyleFeature?.applyCellStyles?.();
        }
    }
}

export const _generateRowValidationErrors = (beans: BeanCollection): EditRowValidationModel => {
    const rowValidationModel = new EditRowValidationModel();
    const getFullRowEditValidationErrors = beans.gos.get('getFullRowEditValidationErrors');
    // populate row-level errors
    const editMap = beans.editModelSvc?.getEditMap();

    if (!editMap) {
        return rowValidationModel;
    }

    for (const rowNode of editMap.keys()) {
        const rowEditMap = editMap.get(rowNode);

        if (!rowEditMap) {
            continue;
        }

        const editorsState: EditingCellPosition[] = [];
        const { rowIndex, rowPinned } = rowNode;

        for (const column of rowEditMap.keys()) {
            const editValue = rowEditMap.get(column);
            if (!editValue) {
                continue;
            }

            editorsState.push({
                column,
                colId: column.getColId(),
                rowIndex: rowIndex!,
                rowPinned,
                ...editValue,
                // don't expose this implementation detail
                newValue: editValue.newValue === UNEDITED ? undefined : editValue.newValue,
            });
        }

        const errorMessages = getFullRowEditValidationErrors?.({ editorsState }) ?? [];

        if (errorMessages.length > 0) {
            rowValidationModel.setRowValidation(
                {
                    rowNode,
                },
                { errorMessages }
            );
        }
    }

    return rowValidationModel;
};

export function _validateEdit(beans: BeanCollection): ICellEditorValidationError[] | null {
    _populateModelValidationErrors(beans);

    const map = beans.editModelSvc?.getCellValidationModel().getCellValidationMap();

    if (!map) {
        return null;
    }

    const validations: ICellEditorValidationError[] = [];
    map.forEach((rowValidations, rowNode) => {
        rowValidations.forEach(({ errorMessages }, column) => {
            validations.push({
                column,
                rowIndex: rowNode.rowIndex!,
                rowPinned: rowNode.rowPinned,
                messages: errorMessages ?? null,
            });
        });
    });

    return validations;
}
