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
import type { EditMap, EditValidationMap, EditValue } from '../../interfaces/iEditModelService';
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
        _setupEditor(beans, position, key, event, cellStartedEdit);
    }

    const { valueSvc, editSvc, editModelSvc } = beans;
    const { rowNode, column } = position ?? {};

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

        _setupEditor(beans, { rowNode: rowNode!, column: curCellCtrl.column! }!, key, event, shouldStartEditing);
    }

    return;
}

export function _valuesDiffer({ newValue, oldValue }: Pick<EditValue, 'newValue' | 'oldValue'>): boolean {
    if (newValue === UNEDITED) {
        newValue = oldValue;
    }
    return `${newValue ?? ''}` !== `${oldValue ?? ''}`;
}

export function _setupEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    key?: string | null,
    event?: Event | null,
    cellStartedEdit?: boolean | null
): void {
    const cellCtrl = _getCellCtrl(beans, position)!;
    const editorComp = cellCtrl?.comp?.getCellEditor();

    const editorParams = _createEditorParams(beans, position, key, cellStartedEdit);

    const oldValue = beans.valueSvc.getValue(position.column as AgColumn, position.rowNode, undefined, 'api');

    // if key is a single character, then we treat it as user input
    let newValue = key?.length === 1 ? key : editorParams.value;

    if (newValue === undefined) {
        newValue = oldValue;
    }

    beans.editModelSvc?.setEdit(position, { newValue: newValue ?? UNEDITED, oldValue, state: 'editing' });

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

        beans.editSvc?.dispatchCellEvent(position, null, 'cellEditingStarted');
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

    const userWantsToCancel = cellEditor.isCancelAfterEnd?.();

    if (userWantsToCancel) {
        return noValueResult;
    }

    const validationErrors = cellEditor.getValidationErrors?.();

    if (validationErrors?.length ?? 0 > 0) {
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
        // -, +, . need suppressPreventDefault to prevent the editor from ignoring the keypress
        params.suppressPreventDefault = ['-', '+', '.'].includes(event?.key ?? '') || params.suppressPreventDefault;
    } else {
        event?.preventDefault?.();
    }

    return params;
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

export function _destroyEditors(beans: BeanCollection, edits?: Required<EditPosition>[]): void {
    if (!edits) {
        edits = beans.editModelSvc?.getEditPositions();
    }

    edits!.forEach((cellPosition) => _destroyEditor(beans, cellPosition));
}

export function _destroyEditor(beans: BeanCollection, position: Required<EditPosition>): void {
    const { rowNode, column } = position;
    const cellCtrl = _getCellCtrl(beans, position);
    if (!cellCtrl) {
        if (beans.editModelSvc?.hasEdits(position) && rowNode && column) {
            beans.editModelSvc?.setState(position, 'changed');
        }

        return;
    }

    const { comp } = cellCtrl;

    if (comp && !comp.getCellEditor()) {
        // no editor, nothing to do
        return;
    }

    const errorMessages = comp?.getCellEditor()?.getValidationErrors?.();
    const cellValidationModel = beans.editModelSvc?.getCellValidationModel();

    if (errorMessages?.length) {
        cellValidationModel?.setCellValidation(position, { errorMessages });
    } else {
        cellValidationModel?.clearCellValidation(position);
    }

    comp?.setEditDetails(); // passing nothing stops editing
    if (beans.editModelSvc?.hasEdits(position) && rowNode && column) {
        beans.editModelSvc?.setState(position, 'changed');
    }

    comp?.refreshEditStyles(false, false);

    cellCtrl?.refreshCell({ force: true, suppressFlash: true });

    beans.rowRenderer.refreshCells({ rowNodes: rowNode ? [rowNode] : [], suppressFlash: true, force: true });
    cellCtrl?.rowCtrl?.refreshRow({ suppressFlash: true, force: true });

    const edit = beans.editModelSvc?.getEdit(position);

    beans.editSvc?.dispatchCellEvent(position, null, 'cellEditingStopped', {
        valueChanged: edit && _valuesDiffer(edit),
    });
}

export type MappedValidationErrors = EditMap | undefined;

export function _populateModelValidationErrors(
    beans: BeanCollection,
    includeRows: boolean = false
): EditValidationMap | undefined {
    const mappedEditors = getCellEditorInstanceMap(beans);
    const cellValidationModel = new EditCellValidationModel();

    if (!mappedEditors || mappedEditors.length === 0) {
        return new Map();
    }

    const { ariaAnnounce, localeSvc } = beans;
    const translate = _getLocaleTextFunc(localeSvc);
    const ariaValidationErrorPrefix = translate('ariaValidationErrorPrefix', 'Cell Editor Validation');

    for (const mappedEditor of mappedEditors) {
        const { ctrl, editor } = mappedEditor;
        const { rowNode, column } = ctrl;
        const errorMessages = editor.getValidationErrors?.() ?? [];
        const el = editor.getValidationElement?.();

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
    beans.editModelSvc?.setCellValidationModel(cellValidationModel);

    const rowCtrlSet = new Set<RowCtrl>();

    for (const { ctrl } of mappedEditors) {
        ctrl.editorTooltipFeature?.refreshTooltip(true);
        rowCtrlSet.add(ctrl.rowCtrl);
    }

    if (includeRows) {
        const rowValidations = _generateRowValidationErrors(beans);
        beans.editModelSvc?.setRowValidationModel(rowValidations);

        for (const rowCtrl of rowCtrlSet.values()) {
            rowCtrl.refreshTooltip();
        }
    }

    return;
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
