import { _setAriaInvalid } from '../../agStack/utils/aria';
import { _getLocaleTextFunc } from '../../agStack/utils/locale';
import { _unwrapUserComp } from '../../components/framework/unwrapUserComp';
import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { ColDef } from '../../entities/colDef';
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
import type { EditValue } from '../../interfaces/iEditModelService';
import type { EditPosition } from '../../interfaces/iEditService';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { EditCellValidationModel, EditRowValidationModel } from '../editModelService';
import { _getCellCtrl } from './controllers';

export const UNEDITED = Symbol('unedited');

function getCellEditorInstanceMap<TData = any>(
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
                    editSvc?.getCellDataValue(cellPosition, false) ??
                    valueSvc.getValueForDisplay(cellColumn as AgColumn, cellRowNode)?.value ??
                    oldValue ??
                    UNEDITED;

                editModelSvc?.setEdit(cellPosition, {
                    pendingValue: getNormalisedFormula(beans, newValue, false),
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

    const editorParams = _createEditorParams(beans, position, key, cellStartedEdit && !silent);

    const previousEdit = beans.editModelSvc?.getEdit(position);

    let newValue = editorParams.value;

    if (newValue === undefined) {
        newValue = previousEdit?.sourceValue;
    }

    beans.editModelSvc?.setEdit(position, {
        editorValue: getNormalisedFormula(beans, newValue, true),
        state: 'editing',
    });

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
        cellCtrl.onEditorAttachedFuncs.push(() => cellCtrl.rangeFeature?.unsetComp());
        cellCtrl.comp?.setEditDetails(compDetails, popup, popupLocation, beans.gos.get('reactiveCustomComponents'));
        cellCtrl?.rowCtrl?.refreshRow({ suppressFlash: true });

        const edit = beans.editModelSvc?.getEdit(position, true);

        if (!silent && !edit?.editorState?.cellStartedEditing) {
            beans.editSvc?.dispatchCellEvent(position, event, 'cellEditingStarted', { value: newValue });
            beans.editModelSvc?.setEdit(position, { editorState: { cellStartedEditing: true } });
        }
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

    const agColumn = beans.colModel.getCol(position.column.getId())!;
    const { rowNode, column } = position;

    const editor = cellCtrl.comp?.getCellEditor();

    const cellDataValue = editSvc?.getCellDataValue(position, false);
    const initialNewValue =
        cellDataValue === undefined
            ? editor
                ? _valueFromEditor(beans, editor)?.editorValue
                : undefined
            : cellDataValue;

    const value =
        initialNewValue === UNEDITED ? valueSvc.getValueForDisplay(agColumn, rowNode)?.value : initialNewValue;

    // if formula, normalise the value to shorthand for users.
    let paramsValue = enableGroupEditing ? initialNewValue : value;
    if (beans.formula?.isFormula(paramsValue)) {
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
            beans.editModelSvc?.setEdit(cellId, { editorState: { isCancelAfterEnd } });
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

    let edit = editModelSvc.getEdit(position, true);

    if (!edit?.sourceValue) {
        // sourceValue not set means sync called without corresponding startEdit - from API call
        edit = editModelSvc.setEdit(position, {
            sourceValue: valueSvc.getValue(column as AgColumn, rowNode, undefined, 'api'),
            pendingValue: edit ? getNormalisedFormula(beans, edit.editorValue, false) : UNEDITED,
        });
    }

    // Note: we don't clear the edit state here (even if new===old) as this is also called from the stop editing flow.
    // Note: editorValue should be in the correct target format already, so no need to parse it again - this is done in the editor, via the colDef parseValue function.
    editModelSvc.setEdit(position, {
        editorValue: valueSameAsSource ? getNormalisedFormula(beans, edit.sourceValue, true) : editorValue,
    });

    if (params?.persist) {
        _persistEditorValue(beans, position);
    }
}

/**
 * Converts formula to shorthand or longhand depending on context
 * @param forEditing if true, converts to shorthand (A1), if false converts to longhand (REF(COL(id),ROW(id))) for storage
 */
function getNormalisedFormula(beans: BeanCollection, value: any, forEditing: boolean): any {
    const { formula } = beans;
    if (formula?.isFormula(value)) {
        return formula?.normaliseFormula(value, forEditing) ?? value;
    }
    return value;
}

function _persistEditorValue(beans: BeanCollection, position: Required<EditPosition>): void {
    const { editModelSvc } = beans;

    const edit = editModelSvc?.getEdit(position, true);

    // propagate the editor value to pending.
    editModelSvc?.setEdit(position, {
        pendingValue: getNormalisedFormula(beans, edit?.editorValue, false),
    });
}

export function _destroyEditors(
    beans: BeanCollection,
    edits?: Required<EditPosition>[],
    params?: { event?: Event; silent?: boolean; cancel?: boolean }
): void {
    if (!edits) {
        edits = beans.editModelSvc?.getEditPositions();
    }

    for (const cellPosition of edits ?? []) {
        _destroyEditor(beans, cellPosition, params);
    }
}

type DestroyEditorParams = { event?: Event | null; silent?: boolean; cancel?: boolean };

export function _destroyEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    params?: DestroyEditorParams
): void {
    const enableGroupEditing = beans.gos.get('enableGroupEdit');
    const { editModelSvc } = beans;
    const cellCtrl = _getCellCtrl(beans, position);

    const edit = editModelSvc?.getEdit(position, true);

    if (!cellCtrl) {
        if (edit) {
            editModelSvc?.setEdit(position, { state: 'changed' });
        }

        return;
    }

    const { comp } = cellCtrl;

    if (comp && !comp.getCellEditor()) {
        // editor already cleaned up, refresh cell
        cellCtrl?.refreshCell();

        if (edit) {
            editModelSvc?.setEdit(position, { state: 'changed' });
            const args = enableGroupEditing
                ? groupEditOverrides(params, edit)
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
        const errorMessages = comp?.getCellEditor()?.getValidationErrors?.();
        const cellValidationModel = editModelSvc?.getCellValidationModel();

        if (errorMessages?.length) {
            cellValidationModel?.setCellValidation(position, { errorMessages });
        } else {
            cellValidationModel?.clearCellValidation(position);
        }
    }

    editModelSvc?.setEdit(position, { state: 'changed' });

    comp?.setEditDetails(); // passing nothing stops editing
    comp?.refreshEditStyles(false, false);

    cellCtrl?.refreshCell({ force: true, suppressFlash: true });

    const latest = editModelSvc?.getEdit(position);

    if (latest && latest.state === 'changed') {
        const args = enableGroupEditing
            ? groupEditOverrides(params, latest)
            : {
                  valueChanged: _sourceAndPendingDiffer(latest) && !params?.cancel,
                  newValue:
                      params?.cancel || latest.editorState.isCancelAfterEnd
                          ? undefined
                          : latest?.editorValue ?? edit?.pendingValue,
                  oldValue: latest?.sourceValue,
              };

        dispatchEditingStopped(beans, position, args, params);
    }
}

type EditingStoppedArgs = Partial<Pick<CellEditingStoppedEvent, 'valueChanged' | 'newValue' | 'oldValue' | 'value'>>;

function groupEditOverrides(params: DestroyEditorParams | undefined, latest: Readonly<EditValue>): EditingStoppedArgs {
    return params?.cancel
        ? {
              valueChanged: false,
              oldValue: latest.sourceValue,
              newValue: undefined,
              value: latest.sourceValue,
          }
        : {
              valueChanged: false,
              oldValue: latest.sourceValue,
              newValue: latest.pendingValue,
              value: latest.sourceValue,
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
    const { isCancelBeforeStart } = editorState || {};

    if (!silent && !isCancelBeforeStart) {
        editSvc?.dispatchCellEvent(position, event, 'cellEditingStopped', args);
        editModelSvc?.setEdit(position, { editorState: { cellStoppedEditing: true } });
    }
}

function _hasValidationRules(beans: BeanCollection): boolean {
    const { gos, colModel } = beans;
    const getFullRowEditValidationErrors = !!gos.get('getFullRowEditValidationErrors');
    const columnsHaveRules = colModel
        .getColumnDefs()
        ?.filter((c: ColDef) => c.editable)
        .some(({ cellEditorParams }: ColDef) => {
            const { minLength, maxLength, getValidationErrors, min, max } = cellEditorParams || {};

            return (
                minLength !== undefined ||
                maxLength !== undefined ||
                getValidationErrors !== undefined ||
                min !== undefined ||
                max !== undefined
            );
        });

    const editorsHaveRules = beans.gridApi
        .getCellEditorInstances()
        // Check if either method was provided in the editor
        .some((editor) => editor.getValidationElement || editor.getValidationErrors);

    return columnsHaveRules || getFullRowEditValidationErrors || editorsHaveRules;
}

export function _populateModelValidationErrors(beans: BeanCollection, force?: boolean): void {
    if (!(force || _hasValidationRules(beans))) {
        return;
    }

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

    _syncFromEditors(beans, { persist: false });

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
