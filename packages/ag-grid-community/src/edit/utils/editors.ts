import { _getLocaleTextFunc, _setAriaInvalid } from 'ag-stack';

import { _unwrapUserComp } from '../../components/framework/unwrapUserComp';
import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellEditingStoppedEvent } from '../../events';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type {
    DefaultProvidedCellEditorParams,
    EditingCellPosition,
    GetCellEditorInstancesParams,
    ICellEditor,
    ICellEditorParams,
    ICellEditorValidationError,
} from '../../interfaces/iCellEditor';
import type { Column } from '../../interfaces/iColumn';
import type { EditMap, EditState, EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { EditCellValidationModel, EditRowValidationModel } from '../editModelService';
import { _applyCellEditStyles } from '../styles/cellEditStyleFeature';
import { _getCellCtrl } from './controllers';

export const UNEDITED = Symbol('unedited');

/** public api getCellEditorInstances */
export const getCellEditorInstances = <TData = any>(
    beans: BeanCollection,
    params: GetCellEditorInstancesParams<TData> = {}
): ICellEditor[] => {
    const ctrls = beans.rowRenderer.getCellCtrls(params.rowNodes, params.columns as AgColumn[]);
    const editors: ICellEditor[] = new Array(ctrls.length);
    let count = 0;
    for (let i = 0, len = ctrls.length; i < len; ++i) {
        const ctrl = ctrls[i];
        const cellEditor = ctrl.comp?.getCellEditor();
        if (cellEditor) {
            editors[count++] = _unwrapUserComp(cellEditor);
        }
    }
    editors.length = count;
    return editors;
};

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
                const oldValue = valueSvc.getValueFromData(cellColumn as AgColumn, cellRowNode);
                const isNewValueCell = position?.rowNode === cellRowNode && position?.column === cellColumn;
                const cellStartValue = (isNewValueCell && key) || undefined;

                const newValue =
                    cellStartValue ??
                    editSvc?.getCellDataValue(cellPosition) ??
                    valueSvc.getDisplayValue(cellColumn as AgColumn, cellRowNode, 'edit', false) ??
                    oldValue ??
                    UNEDITED;

                editModelSvc?.setEdit(cellPosition, {
                    pendingValue: getNormalisedFormula(beans, newValue, false, cellColumn),
                    sourceValue: oldValue,
                    state: 'editing',
                });
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
                cellStartedEdit: shouldStartEditing && cellStartedEdit,
            }
        );
    }
}

export function _sourceAndPendingDiffer({
    pendingValue,
    sourceValue,
}: Pick<EditValue, 'pendingValue' | 'sourceValue'>): boolean {
    if (pendingValue === UNEDITED) {
        pendingValue = sourceValue;
    }
    return pendingValue !== sourceValue;
}

/** Returns a copy of the edit map containing only entries where the pending value differs from the source value. */
export function _filterChangedEdits(edits: EditMap): EditMap {
    const result: EditMap = new Map();
    for (const [rowNode, editRow] of edits) {
        const filtered = new Map<Column, EditValue>();
        for (const [column, editValue] of editRow) {
            if (_sourceAndPendingDiffer(editValue)) {
                filtered.set(column, editValue);
            }
        }
        if (filtered.size > 0) {
            result.set(rowNode, filtered);
        }
    }
    return result;
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
    const { editModelSvc, gos, userCompFactory } = beans;

    const cellCtrl = _getCellCtrl(beans, position);
    const editorComp = cellCtrl?.comp?.getCellEditor();

    const editorParams = _createEditorParams(beans, position, key, cellStartedEdit && !silent);
    const previousEdit = editModelSvc?.getEdit(position);

    const newValue = editorParams.value ?? previousEdit?.sourceValue;

    if (editorComp) {
        editModelSvc?.setEdit(position, {
            editorValue: getNormalisedFormula(beans, newValue, true, position.column),
            state: 'editing',
        });
        // don't reinitialise, just refresh if possible
        editorComp.refresh?.(editorParams);
        return;
    }

    const colDef = position.column.getColDef();
    const compDetails = _getCellEditorDetails(userCompFactory, colDef, editorParams);

    if (!compDetails) {
        return;
    }

    const { popupFromSelector, popupPositionFromSelector } = compDetails;

    // if cellEditorSelector was used, we give preference to popup and popupPosition from the selector
    const popup = popupFromSelector ?? !!colDef.cellEditorPopup;
    const popupLocation: 'over' | 'under' | undefined = popupPositionFromSelector ?? colDef.cellEditorPopupPosition;

    checkAndPreventDefault(compDetails.params, event);

    if (!cellCtrl) {
        return;
    }

    const { rangeFeature, rowCtrl, comp, onEditorAttachedFuncs } = cellCtrl;

    editModelSvc?.setEdit(position, {
        editorValue: getNormalisedFormula(beans, newValue, true, position.column),
        state: 'editing',
        // Reset lifecycle flags for this new editor session. Previous sessions may have left
        // cellStartedEditing/cellStoppedEditing set on a reused row node.
        editorState: { cellStartedEditing: undefined, cellStoppedEditing: undefined },
    });

    cellCtrl.editCompDetails = compDetails;
    onEditorAttachedFuncs.push(() => rangeFeature?.unsetComp());
    comp?.setEditDetails(compDetails, popup, popupLocation, gos.get('reactiveCustomComponents'));
    rowCtrl?.refreshRow({ suppressFlash: true });
    cellCtrl.refreshNoteState();

    dispatchEditingStarted(beans, position, event, newValue, silent);
}

/** Dispatches cellEditingStarted if the edit is in 'editing' state and no prior start was dispatched. */
function dispatchEditingStarted(
    beans: BeanCollection,
    position: Required<EditPosition>,
    event?: Event | null,
    value?: any,
    silent?: boolean
) {
    const { editSvc, editModelSvc } = beans;
    const edit = editModelSvc?.getEdit(position);

    // Only dispatch cellEditingStarted if the edit is still in 'editing' state.
    // If isCancelBeforeStart() cancelled the edit synchronously inside setEditDetails,
    // the edit state will have been set to 'changed' or removed entirely.
    if (!silent && edit?.state === 'editing' && !edit?.editorState?.cellStartedEditing) {
        editSvc?.dispatchCellEvent(position, event, 'cellEditingStarted', { value });
        editModelSvc?.setEdit(position, { editorState: { cellStartedEditing: true } });
    }
}

function _valueFromEditor(
    beans: BeanCollection,
    cellEditor: ICellEditor,
    params?: { isCancelling?: boolean; isStopping?: boolean }
): { editorValue?: any; editorValueExists: boolean; isCancelAfterEnd?: boolean } {
    const noValueResult = { editorValueExists: false };

    if (_hasValidationRules(beans)) {
        const validationErrors = cellEditor.getValidationErrors?.();

        if ((validationErrors?.length ?? 0) > 0) {
            return noValueResult;
        }
    }

    if (params?.isCancelling) {
        return noValueResult;
    }

    if (params?.isStopping) {
        const isCancelAfterEnd = cellEditor?.isCancelAfterEnd?.();
        if (isCancelAfterEnd) {
            return { ...noValueResult, isCancelAfterEnd };
        }
    }

    const editorValue = cellEditor.getValue();

    return {
        editorValue,
        editorValueExists: true,
    };
}

function _createEditorParams(
    beans: BeanCollection,
    position: Required<EditPosition>,
    key?: string | null,
    cellStartedEdit?: boolean | null
): ICellEditorParams {
    const { valueSvc, gos, editSvc } = beans;
    const enableGroupEditing = beans.gos.get('enableGroupEdit');
    const cellCtrl = _getCellCtrl(beans, position) as CellCtrl;
    const rowIndex = position.rowNode?.rowIndex ?? (undefined as unknown as number);
    const batchEdit = editSvc?.isBatchEditing();

    const agColumn = beans.colModel.getCol(position.column)!;
    const { rowNode, column } = position;

    const editor = cellCtrl.comp?.getCellEditor();

    const cellDataValue = editSvc?.getCellDataValue(position);
    const initialNewValue =
        cellDataValue === undefined
            ? editor
                ? _valueFromEditor(beans, editor)?.editorValue
                : undefined
            : cellDataValue;

    const value =
        initialNewValue === UNEDITED ? valueSvc.getDisplayValue(agColumn, rowNode, 'edit', false) : initialNewValue;

    // if formula, normalise the value to shorthand for users.
    let paramsValue = enableGroupEditing ? initialNewValue : value;
    if (agColumn.allowFormula && beans.formula?.isFormula(paramsValue)) {
        // normalise to shorthand for editing
        paramsValue = beans.formula?.normaliseFormula(paramsValue, true) ?? paramsValue;
    }

    return _addGridCommonParams(gos, {
        value: paramsValue,
        eventKey: key ?? null,
        column,
        colDef: column.getColDef(),
        rowIndex,
        node: rowNode,
        data: rowNode.data,
        cellStartedEdit: !!cellStartedEdit,
        onKeyDown: cellCtrl?.onKeyDown.bind(cellCtrl),
        stopEditing: (suppressNavigateAfterEdit: boolean) => {
            editSvc!.stopEditing(position, { source: batchEdit ? 'ui' : 'api', suppressNavigateAfterEdit });
            _destroyEditor(beans, position, {});
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
            if (!includeEditing && (edit.state === 'editing' || edit.pendingValue === UNEDITED)) {
                return;
            }

            if (!_sourceAndPendingDiffer(edit) && (edit.state !== 'editing' || includeEditing)) {
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

export function _syncFromEditors(
    beans: BeanCollection,
    params: { persist: boolean; isCancelling?: boolean; isStopping?: boolean }
): void {
    for (const cellId of beans.editModelSvc?.getEditPositions() ?? []) {
        const cellCtrl = _getCellCtrl(beans, cellId);

        if (!cellCtrl) {
            continue;
        }

        const editor = cellCtrl.comp?.getCellEditor();

        if (!editor) {
            continue;
        }

        const { editorValue, editorValueExists, isCancelAfterEnd } = _valueFromEditor(beans, editor, params);

        if (isCancelAfterEnd) {
            const { cellStartedEditing, cellStoppedEditing } = beans.editModelSvc?.getEdit(cellId)?.editorState || {};
            beans.editModelSvc?.setEdit(cellId, {
                editorState: { isCancelAfterEnd, cellStartedEditing, cellStoppedEditing },
            });
        }

        _syncFromEditor(beans, cellId, editorValue, undefined, !editorValueExists, params);
    }
}

export function _syncFromEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    editorValue?: any,
    _source?: string,
    valueSameAsSource?: boolean,
    params?: { persist?: boolean; isCancelling?: boolean; isStopping?: boolean }
): void {
    const { editModelSvc, valueSvc } = beans;
    if (!editModelSvc) {
        return;
    }
    const { rowNode, column } = position;

    if (!(rowNode && column)) {
        return;
    }

    let edit = editModelSvc.getEdit(position);

    if (edit?.sourceValue === undefined) {
        // sourceValue not set means sync called without corresponding startEdit - from API call
        const pendingValue = edit ? getNormalisedFormula(beans, edit.editorValue, false, column) : UNEDITED;
        const editValue: Partial<EditValue> = {
            sourceValue: valueSvc.getValueFromData(column as AgColumn, rowNode),
            pendingValue,
        };

        if (params?.persist) {
            editValue.state = 'changed';
        }
        edit = editModelSvc.setEdit(position, editValue);
    }

    // Note: we don't clear the edit state here (even if new===old) as this is also called from the stop editing flow.
    // Note: editorValue should be in the correct target format already, so no need to parse it again - this is done in the editor, via the colDef parseValue function.
    editModelSvc.setEdit(position, {
        editorValue: valueSameAsSource ? getNormalisedFormula(beans, edit.sourceValue, true, column) : editorValue,
    });

    if (params?.persist) {
        _persistEditorValue(beans, position);
    }
}

/**
 * Converts formula to shorthand or longhand depending on context
 * @param forEditing if true, converts to shorthand (A1), if false converts to longhand (REF(COL(id),ROW(id))) for storage
 */
function getNormalisedFormula(beans: BeanCollection, value: any, forEditing: boolean, column: Column): any {
    const { formula } = beans;
    if ((column as AgColumn).allowFormula && formula?.isFormula(value)) {
        return formula?.normaliseFormula(value, forEditing) ?? value;
    }
    return value;
}

function _persistEditorValue(beans: BeanCollection, position: Required<EditPosition>): void {
    const { editModelSvc } = beans;

    const edit = editModelSvc?.getEdit(position);

    // propagate the editor value to pending.
    const pendingValue = getNormalisedFormula(beans, edit?.editorValue, false, position.column);

    const editValue: Partial<EditValue> = { pendingValue };

    // For API-driven edits (e.g. Delete/Backspace, paste, undo/redo) that did NOT go through
    // an editor session and are not currently in 'editing' state, set the state to 'changed'.
    // Actively-editing cells have their state managed by _destroyEditor.
    if (!edit?.editorState?.cellStoppedEditing && edit?.state !== 'editing') {
        editValue.state = 'changed';
    }

    editModelSvc?.setEdit(position, editValue);
}

export function _destroyEditors(
    beans: BeanCollection,
    edits?: Required<EditPosition>[],
    params: { event?: Event; silent?: boolean; cancel?: boolean } = {}
): void {
    if (!edits) {
        edits = beans.editModelSvc?.getEditPositions();
    }

    if (edits) {
        for (const cellPosition of edits) {
            _destroyEditor(beans, cellPosition, params);
        }
    }
}

type DestroyEditorParams = { event?: Event | null; silent?: boolean; cancel?: boolean };

export function _destroyEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    params: DestroyEditorParams,
    cellCtrl: CellCtrl | undefined = _getCellCtrl(beans, position)
): void {
    const editModelSvc = beans.editModelSvc;

    const edit = editModelSvc?.getEdit(position);

    // Determine the edit state:
    // - If the edit went through a prior editor session (cellStoppedEditing) and already
    //   has a resolved state, preserve it
    // - Otherwise, mark as 'changed'
    let state: EditState;
    if (edit && edit.state !== 'editing' && edit.editorState?.cellStoppedEditing) {
        state = edit.state;
    } else {
        state = 'changed';
    }

    if (!cellCtrl) {
        if (edit) {
            editModelSvc?.setEdit(position, { state });
        }

        return;
    }

    const comp = cellCtrl.comp;
    const cellEditor = comp?.getCellEditor();

    // editor already cleaned up, refresh cell (React usually)
    if (comp && !cellEditor) {
        cellCtrl?.refreshCell();

        if (edit) {
            editModelSvc?.setEdit(position, { state });
            const args = beans.gos.get('enableGroupEdit')
                ? _enabledGroupEditStoppedArgs(edit, params?.cancel)
                : {
                      valueChanged: false,
                      newValue: undefined,
                      oldValue: edit.sourceValue,
                  };
            dispatchEditingStopped(beans, position, args, params);
        }

        return;
    }

    if (_hasValidationRules(beans)) {
        const errorMessages = edit && cellEditor?.getValidationErrors?.();
        const cellValidationModel = editModelSvc?.getCellValidationModel();

        if (errorMessages?.length) {
            cellValidationModel?.setCellValidation(position, { errorMessages });
        } else {
            cellValidationModel?.clearCellValidation(position);
        }
    }

    if (edit) {
        editModelSvc?.setEdit(position, { state });
    }

    comp?.setEditDetails(); // passing nothing stops editing
    comp?.refreshEditStyles(false, false);

    cellCtrl?.refreshCell({ force: true, suppressFlash: true });

    const latest = editModelSvc?.getEdit(position);

    if (latest && latest.state !== 'editing') {
        const cancel = params?.cancel;
        const args = beans.gos.get('enableGroupEdit')
            ? _enabledGroupEditStoppedArgs(latest, cancel)
            : _cellEditStoppedArgs(latest, edit, cancel);
        dispatchEditingStopped(beans, position, args, params);
    }
}

type EditingStoppedArgs = Partial<Pick<CellEditingStoppedEvent, 'valueChanged' | 'newValue' | 'oldValue' | 'value'>>;

/** Group editing event args (AG-15792): uses sourceValue for oldValue/value, does not check isCancelAfterEnd. */
function _enabledGroupEditStoppedArgs(latest: Readonly<EditValue>, cancel: boolean | undefined): EditingStoppedArgs {
    const { sourceValue, pendingValue } = latest;

    let newValue: any;
    if (!cancel && pendingValue !== UNEDITED) {
        newValue = pendingValue;
    }

    return {
        valueChanged: !cancel && _sourceAndPendingDiffer(latest),
        newValue,
        oldValue: sourceValue,
        value: sourceValue,
    };
}

/** Standard cell editing event args: newValue from editorValue (fallback to pendingValue), value is newValue. */
function _cellEditStoppedArgs(
    latest: Readonly<EditValue>,
    edit: Readonly<EditValue> | undefined,
    cancel: boolean | undefined
): EditingStoppedArgs {
    if (cancel || latest.editorState.isCancelAfterEnd) {
        return {
            valueChanged: false,
            newValue: undefined,
            oldValue: latest.sourceValue,
        };
    }

    let newValue: any = latest.editorValue;
    if (newValue == null || newValue === UNEDITED) {
        newValue = edit?.pendingValue;
    }
    if (newValue === UNEDITED) {
        newValue = undefined;
    }

    return {
        valueChanged: _sourceAndPendingDiffer(latest),
        newValue,
        oldValue: latest.sourceValue,
    };
}

function dispatchEditingStopped(
    beans: BeanCollection,
    position: Required<EditPosition>,
    args: EditingStoppedArgs,
    { silent, event }: DestroyEditorParams = {}
) {
    const { editSvc, editModelSvc } = beans;

    const latest = editModelSvc?.getEdit(position);
    const { editorState } = latest || {};
    const { isCancelBeforeStart, cellStartedEditing, cellStoppedEditing } = editorState || {};

    // Only dispatch cellEditingStopped if cellEditingStarted was previously fired for this cell
    // and cellEditingStopped has not already been dispatched (at-most-once guarantee).
    // Batch-only edits (set via setDataValue with 'batch'/'data' source) never open an editor
    // and never fire cellEditingStarted, so they must not fire cellEditingStopped either.
    if (!silent && !isCancelBeforeStart && cellStartedEditing && !cellStoppedEditing) {
        editSvc?.dispatchCellEvent(position, event, 'cellEditingStopped', args);
        editModelSvc?.setEdit(position, { editorState: { cellStoppedEditing: true } });
    }
}

function _columnDefsRequireValidation(cols: AgColumn[]): boolean {
    for (let i = 0, len = cols.length; i < len; ++i) {
        const colDef = cols[i].colDef;
        const params = colDef.cellEditorParams;
        if (!params || (!colDef.editable && !colDef.groupRowEditable)) {
            continue;
        }
        if (
            params.minLength !== undefined ||
            params.maxLength !== undefined ||
            params.getValidationErrors !== undefined ||
            params.min !== undefined ||
            params.max !== undefined
        ) {
            return true;
        }
    }
    return false;
}

function _editorsRequireValidation(beans: BeanCollection): boolean {
    const ctrls = beans.rowRenderer.getCellCtrls();
    for (let i = 0, len = ctrls.length; i < len; ++i) {
        const ctrl = ctrls[i];
        const cellEditor = ctrl.comp?.getCellEditor();
        if (cellEditor) {
            const editor = _unwrapUserComp(cellEditor);
            if (editor.getValidationElement || editor.getValidationErrors) {
                return true;
            }
        }
    }
    return false;
}

function _hasValidationRules(beans: BeanCollection): boolean {
    return (
        !!beans.gos.get('getFullRowEditValidationErrors') ||
        _columnDefsRequireValidation(beans.colModel.colDefList) ||
        _editorsRequireValidation(beans)
    );
}

export function _populateModelValidationErrors(beans: BeanCollection, force?: boolean): void {
    if (!(force || _hasValidationRules(beans))) {
        return;
    }

    const cellValidationModel = new EditCellValidationModel();

    const { ariaAnnounce, localeSvc, editModelSvc, gos } = beans;
    const includeRows = gos.get('editType') === 'fullRow';
    const translate = _getLocaleTextFunc(localeSvc);
    const ariaValidationErrorPrefix = translate('ariaValidationErrorPrefix', 'Cell Editor Validation');
    const rowCtrlSet = new Set<RowCtrl>();
    for (const ctrl of beans.rowRenderer.getCellCtrls()) {
        const cellEditorComp = ctrl.comp?.getCellEditor();
        if (!cellEditorComp) {
            continue;
        }

        const editor = _unwrapUserComp(cellEditorComp);
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
        rowCtrlSet.add(ctrl.rowCtrl);
    }

    _syncFromEditors(beans, { persist: false });

    // the cellValidationModel should probably be reused to avoid
    // the second loop over mappedEditor below
    editModelSvc?.setCellValidationModel(cellValidationModel);

    if (includeRows) {
        const rowValidations = _generateRowValidationErrors(beans);
        editModelSvc?.setRowValidationModel(rowValidations);
    }

    for (const rowCtrl of rowCtrlSet.values()) {
        beans.editSvc?.applyRowEditStyles(rowCtrl);
        for (const cellCtrl of rowCtrl.getAllCellCtrls()) {
            cellCtrl.tooltipFeature?.refreshTooltip(true);
            cellCtrl.editorTooltipFeature?.refreshTooltip(true);
            _applyCellEditStyles(beans, cellCtrl);
        }
    }
}

const _generateRowValidationErrors = (beans: BeanCollection): EditRowValidationModel => {
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

            const { editorValue, pendingValue, sourceValue } = editValue;

            const newValue = editorValue ?? (pendingValue === UNEDITED ? undefined : pendingValue) ?? sourceValue;

            editorsState.push({
                column,
                colId: column.getColId(),
                rowIndex: rowIndex!,
                rowPinned,
                oldValue: sourceValue,
                newValue,
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
    _populateModelValidationErrors(beans, true);

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
