import { KeyCode, _getLocaleTextFunc, _setAriaInvalid } from 'ag-stack';

import { _unwrapUserComp } from '../../components/framework/unwrapUserComp';
import { _getCellEditorDetails } from '../../components/framework/userCompUtils';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import type { CellEditingStoppedEvent } from '../../events';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type {
    AgBaseCellEditor,
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
import type { IRowNode } from '../../interfaces/iRowNode';
import type { CellCtrl } from '../../rendering/cell/cellCtrl';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
import { EditCellValidationModel, EditRowValidationModel } from '../editModelService';
import { _getCellCtrl, _getRowCtrl } from './controllers';
import { _announceChangedValidationErrors } from './validationAnnouncements';
import { _formatValidationMessages } from './validationMessages';

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

    // One pass shared across the row's attaches: each attach revalidates, so an unseeded k-th editor
    // would re-run every validator before it.
    const validationCache: EditorValidationCache = new Map();

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

        editSvc!.withEditorAttachValidationCache(validationCache, curCellCtrl, () =>
            _setupEditor(
                beans,
                { rowNode: rowNode!, column: curCellCtrl.column },
                {
                    key: shouldStartEditing ? key : null,
                    event: shouldStartEditing ? event : null,
                    cellStartedEdit: shouldStartEditing && cellStartedEdit,
                }
            )
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

    const { rowCtrl, comp } = cellCtrl;

    // A silent setup continues a session that already fired cellEditingStarted, and wiping its bookkeeping
    // would swallow the stop. A new session resets it: a reused row node can carry the previous one's flags.
    const { cellStartedEditing, cellStoppedEditing } = (silent ? previousEdit?.editorState : undefined) ?? {};

    editModelSvc?.setEdit(position, {
        editorValue: getNormalisedFormula(beans, newValue, true, position.column),
        state: 'editing',
        editorState: { cellStartedEditing, cellStoppedEditing },
    });

    cellCtrl.editCompDetails = compDetails;
    beans.editSvc?.invalidateEditorsValidation(); // a new editor may bring validation with it
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
    params?: { isCancelling?: boolean; isStopping?: boolean },
    knownInvalid?: boolean
): { editorValue?: any; editorValueExists: boolean; isCancelAfterEnd?: boolean } {
    const noValueResult = { editorValueExists: false };

    // Cancellation discards the live editor value, so neither its value nor its validation result is needed.
    // In particular, custom validators must not be able to delay or prevent an explicit cancel.
    if (params?.isCancelling) {
        return noValueResult;
    }

    if (knownInvalid === undefined && beans.editSvc!.hasValidationRules()) {
        const validationErrors = cellEditor.getValidationErrors?.();
        knownInvalid = (validationErrors?.length ?? 0) > 0;
    }
    if (knownInvalid) {
        return noValueResult;
    }

    if (params?.isStopping) {
        const isCancelAfterEnd = cellEditor.isCancelAfterEnd?.();
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
        stopEditing: (suppressNavigateAfterEdit: boolean, event?: KeyboardEvent) => {
            editSvc!.stopEditing(position, {
                source: batchEdit ? 'ui' : 'api',
                suppressNavigateAfterEdit,
                event,
            });
            // Block mode holds an invalid edit's editors open — tearing this one down would orphan it.
            // Row-scoped, since in full-row the hold can come from a sibling cell. The stop's own result
            // can't stand in for this: a mid-batch stop reports false while still being a real close.
            const held =
                editSvc!.cellEditingInvalidCommitBlocks() && !!beans.editModelSvc?.hasValidationErrors({ rowNode });
            if (!held) {
                _destroyEditor(beans, position, {});
            }
        },
        eGridCell: cellCtrl?.eGui,
        parseValue: (newValue: any) => valueSvc.parseValue(agColumn, rowNode, newValue, cellCtrl?.value),
        formatValue: cellCtrl?.formatValue.bind(cellCtrl),
        validate: () => {
            _validateEdit(beans);
        },
    });
}

function purgeEditIfUnchanged(
    editModelSvc: NonNullable<BeanCollection['editModelSvc']>,
    rowNode: IRowNode,
    column: Column,
    edit: EditValue,
    includeEditing?: boolean
): void {
    if (!includeEditing && (edit.state === 'editing' || edit.pendingValue === UNEDITED)) {
        return;
    }

    // remove edits where the pending is equal to the old value
    if (!_sourceAndPendingDiffer(edit)) {
        editModelSvc.removeEdits({ rowNode, column });
    }
}

export function _purgeUnchangedEdits(beans: BeanCollection, includeEditing?: boolean): void {
    const { editModelSvc } = beans;
    // Read-only iteration (removeEdits only deletes the current entry) — no need for a map copy.
    editModelSvc?.getEditMap()?.forEach((editRow, rowNode) => {
        editRow.forEach((edit, column) => purgeEditIfUnchanged(editModelSvc, rowNode, column, edit, includeEditing));
    });
}

/**
 * Scoped purge for a single staged cell — O(1) instead of rescanning the whole edit map.
 * Staging one cell can only make that cell match its source, so bulk operations (paste/fill)
 * must purge per-cell here rather than calling {@link _purgeUnchangedEdits} per staged cell (O(N^2)).
 */
export function _purgeUnchangedEdit(
    beans: BeanCollection,
    position: Required<EditPosition>,
    includeEditing?: boolean
): void {
    const { editModelSvc } = beans;
    if (!editModelSvc) {
        return;
    }
    const edit = editModelSvc.getEdit(position);
    if (edit) {
        purgeEditIfUnchanged(editModelSvc, position.rowNode, position.column, edit, includeEditing);
    }
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

/**
 * Commits every open editor's buffered input (e.g. a Firefox date segment) so a stop validates and reads
 * the final value. Stop-only: the Firefox flush blurs the input, so it must never run per keystroke.
 */
export function _flushEditors(beans: BeanCollection): void {
    const editModelSvc = beans.editModelSvc;
    // Every staged edit would otherwise cost a cell-ctrl resolve to discover it has no editor to flush.
    if (!editModelSvc?.hasOpenEditors()) {
        return;
    }

    // Walk the live map rather than getEditPositions: only the position is needed, not the cloned values.
    // One scratch position for the whole walk — _getCellCtrl only reads it.
    const position = {} as Required<EditPosition>;
    editModelSvc.getEditMap()?.forEach((editRow, rowNode) => {
        position.rowNode = rowNode;
        for (const column of editRow.keys()) {
            position.column = column;
            const editor = _getCellCtrl(beans, position)?.comp?.getCellEditor();
            if (editor) {
                (_unwrapUserComp(editor) as AgBaseCellEditor).agFlushInput?.();
            }
        }
    });
}

/**
 * Block mode can't hold an invalid editor whose popup is gone, so the caller must revert: an orphaned
 * editor would leave the cell uneditable.
 */
const getPopupEditValidation = (
    beans: BeanCollection,
    cellCtrl: CellCtrl
): { revertBlockedInvalid: boolean; validationCache?: EditorValidationCache } => {
    // Buffered input has to reach the value first, or it reads as the old valid one.
    _flushEditors(beans);

    if (!beans.editSvc!.cellEditingInvalidCommitBlocks()) {
        // Revert mode only closes this cell, so snapshot its verdict alone: a full populate would
        // restyle and announce every open editor on a plain popup dismiss.
        const editor = cellCtrl.comp?.getCellEditor();
        let validationCache: EditorValidationCache | undefined;
        if (editor && beans.editSvc!.hasValidationRules()) {
            validationCache = new Map();
            cacheEditorValidation(validationCache, editor, _unwrapUserComp(editor));
        }
        return { revertBlockedInvalid: false, validationCache };
    }

    const validationCache = _populateModelValidationErrors(beans);
    // Cell-scoped: a row-level error, or a sibling's, is not this value's fault, and reverting cannot fix it.
    return {
        revertBlockedInvalid: !!beans.editModelSvc?.getCellValidationModel().hasCellValidation(cellCtrl),
        validationCache,
    };
};

/**
 * A popup editor closed — clicked away, Escape, or focus moved on. That is this cell's stop and no more:
 * the row or batch it belongs to keeps its own session, and block mode still holds an invalid value.
 */
export const _onPopupEditorClosed = (
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    e?: MouseEvent | TouchEvent | KeyboardEvent
): void => {
    const editSvc = beans.editSvc;
    if (!editSvc?.isEditing(cellCtrl, { withOpenEditor: true })) {
        return;
    }

    const isKeyboardEvent = e instanceof KeyboardEvent;
    const isMouseEvent = e instanceof MouseEvent;

    const isEscape = isKeyboardEvent && e.key === KeyCode.ESCAPE;

    const fullRow = beans.gos.get('editType') === 'fullRow';
    const popupValidation = !isEscape ? getPopupEditValidation(beans, cellCtrl) : undefined;
    const revertBlockedInvalid = popupValidation?.revertBlockedInvalid ?? false;
    const validationCache = popupValidation?.validationCache;
    const batch = editSvc.isBatchEditing();

    // Full-row owns its own stop (Escape, Enter, grid focus loss); ending it because a popup closed
    // would commit — or, when blocked, discard — every sibling at whatever value it happens to hold.
    const { rowNode, column } = cellCtrl;
    if (!isEscape && fullRow && editSvc.isRowEditing(rowNode, { checkSiblings: true })) {
        if (revertBlockedInvalid) {
            editSvc.revertCellEdit({ rowNode, column }, validationCache);
        } else {
            editSvc.closeCellEditor({ rowNode, column }, validationCache);
        }
        return;
    }

    // Mid-batch a mouse-driven cancel is a no-op (only Escape cancels), so revert this cell
    // directly; that also keeps any earlier staged value, as per-cell Escape does.
    if (revertBlockedInvalid && batch) {
        editSvc.revertCellEdit({ rowNode, column }, validationCache);
        return;
    }

    // note: this happens because of a click outside of the grid or if the popupEditor
    // is closed with `Escape` key. if another cell was clicked, then the editing will
    // have already stopped and returned on the conditional above.
    editSvc.stopEditing(
        cellCtrl,
        {
            source: batch ? 'ui' : 'api',
            cancel: isEscape || revertBlockedInvalid,
            event: isKeyboardEvent || isMouseEvent ? e : undefined,
        },
        validationCache
    );

    if (isEscape) {
        cellCtrl.focusCell({ forceBrowserFocus: true, sourceEvent: e });
    }
};

type SyncEditorParams = { persist?: boolean; isCancelling?: boolean; isStopping?: boolean };

/** Validation results captured for one explicit pass, keyed by the editor instance that produced them. */
export type EditorValidationCache = Map<ICellEditor, string[]>;

type EditorValidationVisitor = (ctrl: CellCtrl, editor: ICellEditor, errorMessages: string[]) => void;

/** Returns the editor's cached verdict, running its validator once and snapshotting the result on a miss. */
const cacheEditorValidation = (
    validationCache: EditorValidationCache,
    cellEditorComp: ICellEditor,
    editor: ICellEditor
): string[] => {
    // Keyed by editor instance — row/column is not enough: virtualisation can replace the editor at the
    // same position mid-pass.
    let errorMessages = validationCache.get(cellEditorComp);
    if (errorMessages === undefined) {
        // Snapshot the result: custom editors may reuse and mutate the same array between passes.
        errorMessages = [...(editor.getValidationErrors?.() ?? [])];
        validationCache.set(cellEditorComp, errorMessages);
    }
    return errorMessages;
};

/**
 * Runs each live editor validator once and snapshots the result against the editor instance that produced it.
 * The optional visitor lets a full validation pass update its models without a second controller scan.
 */
const collectEditorValidation = (
    beans: BeanCollection,
    visitor?: EditorValidationVisitor,
    validationCache: EditorValidationCache = new Map()
): EditorValidationCache => {
    for (const ctrl of beans.rowRenderer.getCellCtrls()) {
        const cellEditorComp = ctrl.comp?.getCellEditor();
        if (!cellEditorComp) {
            continue;
        }

        const editor = _unwrapUserComp(cellEditorComp);
        const errorMessages = cacheEditorValidation(validationCache, cellEditorComp, editor);
        visitor?.(ctrl, editor, errorMessages);
    }

    return validationCache;
};

/** Captures editor validation without changing validation models, styles or announcements. */
export const _collectEditorValidationCache = (beans: BeanCollection): EditorValidationCache =>
    collectEditorValidation(beans);

export const _syncFromEditors = (
    beans: BeanCollection,
    params: SyncEditorParams & { persist: boolean },
    validationCache?: EditorValidationCache
): void => {
    // As in _flushEditors, and for the same reason: this runs per keystroke, and getEditPositions would
    // allocate a position plus a copy of every edit value to reach the two fields read here.
    const position = {} as Required<EditPosition>;
    beans.editModelSvc?.getEditMap()?.forEach((editRow, rowNode) => {
        position.rowNode = rowNode;
        for (const column of editRow.keys()) {
            position.column = column;
            _syncFromEditorComp(beans, position, params, validationCache);
        }
    });
};

/** The single-cell half of {@link _syncFromEditors}: stages one open editor's value into the model. */
export const _syncFromEditorComp = (
    beans: BeanCollection,
    position: Required<EditPosition>,
    params: SyncEditorParams & { persist: boolean },
    validationCache?: EditorValidationCache
): void => {
    const editor = _getCellCtrl(beans, position)?.comp?.getCellEditor();

    if (!editor) {
        return;
    }

    const cachedValidationErrors = validationCache?.get(editor);
    // A cache miss means this editor attached after the pass; it must validate itself, not be assumed valid.
    const knownInvalid = cachedValidationErrors === undefined ? undefined : cachedValidationErrors.length > 0;
    const { editorValue, editorValueExists, isCancelAfterEnd } = _valueFromEditor(beans, editor, params, knownInvalid);

    if (isCancelAfterEnd) {
        const { cellStartedEditing, cellStoppedEditing } = beans.editModelSvc?.getEdit(position)?.editorState || {};
        beans.editModelSvc?.setEdit(position, {
            editorState: { isCancelAfterEnd, cellStartedEditing, cellStoppedEditing },
        });
    }

    syncFromEditorValue(beans, position, editorValue, !editorValueExists, params);
};

export function _syncFromEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    editorValue?: any,
    params?: SyncEditorParams
): void {
    syncFromEditorValue(beans, position, editorValue, false, params);
}

function syncFromEditorValue(
    beans: BeanCollection,
    position: Required<EditPosition>,
    editorValue: any,
    valueSameAsSource: boolean,
    params?: SyncEditorParams
): void {
    const { editModelSvc, valueSvc } = beans;
    if (!editModelSvc) {
        return;
    }
    const { rowNode, column } = position;

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

/** `edits` is explicit so that tearing down every open editor can never be the result of an omitted argument. */
export function _destroyEditors(
    beans: BeanCollection,
    edits: Required<EditPosition>[],
    params: DestroyEditorParams = {},
    validationCache?: EditorValidationCache
): void {
    for (let i = 0, len = edits.length; i < len; ++i) {
        _destroyEditor(beans, edits[i], params, undefined, validationCache);
    }
}

export type DestroyEditorParams = {
    event?: Event | null;
    silent?: boolean;
    cancel?: boolean;
};

export function _destroyEditor(
    beans: BeanCollection,
    position: Required<EditPosition>,
    params: DestroyEditorParams,
    cellCtrl: CellCtrl | undefined = _getCellCtrl(beans, position),
    validationCache?: EditorValidationCache
): void {
    const editModelSvc = beans.editModelSvc;

    if (cellCtrl) {
        // Do not let a delayed framework editor apply this validation pass after cancellation or recycling.
        beans.editSvc?.clearPendingEditorAttachValidation(cellCtrl);
    }

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
            // Unguarded: with the editor gone no probe can see its rules, so a guarded clear would
            // strand the error and reject every later commit.
            editModelSvc?.getCellValidationModel().clearCellValidation(position);
            editModelSvc?.setEdit(position, { state });
            dispatchStoppedIfFinished(beans, position, edit, params);
            // The row survives even though the cell doesn't, so refresh its edit styles here — no cell
            // ctrl remains to do it, and the row would keep its stale editing classes.
            const rowCtrl = _getRowCtrl(beans, { rowNode: position.rowNode });
            if (rowCtrl) {
                beans.editSvc?.applyRowEditStyles(rowCtrl);
            }
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
            // Derived like every other stop: the model can still hold a pending value that differs from
            // source here, so the args can't be hardcoded to "nothing changed".
            dispatchStoppedIfFinished(beans, position, edit, params);
        }

        return;
    }

    if (!params.cancel && beans.editSvc!.hasValidationRules()) {
        const cachedValidationErrors = cellEditor ? validationCache?.get(cellEditor) : undefined;
        // A cached empty array means known-valid; `??` must not invoke a stateful validator again.
        const errorMessages = edit && (cachedValidationErrors ?? cellEditor?.getValidationErrors?.());
        const cellValidationModel = editModelSvc?.getCellValidationModel();

        if (errorMessages?.length) {
            cellValidationModel?.setCellValidation(position, { errorMessages });
        } else {
            cellValidationModel?.clearCellValidation(position);
        }
    }

    if (edit) {
        // hasOpenEditors under-reports until setEditDetails below: the edit is closed, the editor isn't.
        editModelSvc?.setEdit(position, { state });
    }

    comp?.setEditDetails(); // passing nothing stops editing
    comp?.refreshEditStyles(false, false);

    cellCtrl?.refreshCell({ force: true, suppressFlash: true });

    dispatchStoppedIfFinished(beans, position, edit, params);
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

/** Fires cellEditingStopped once the edit has left the 'editing' state, with the right event args. */
const dispatchStoppedIfFinished = (
    beans: BeanCollection,
    position: Required<EditPosition>,
    edit: Readonly<EditValue> | undefined,
    params: DestroyEditorParams
): void => {
    const latest = beans.editModelSvc?.getEdit(position);
    if (!latest || latest.state === 'editing') {
        return;
    }
    const cancel = params?.cancel;
    const args = beans.gos.get('enableGroupEdit')
        ? _enabledGroupEditStoppedArgs(latest, cancel)
        : _cellEditStoppedArgs(latest, edit, cancel);
    dispatchEditingStopped(beans, position, args, params);
};

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

/** The uncached scan behind {@link EditService.editorsRequireValidation}, which owns the memo. */
export function _scanEditorsForValidation(beans: BeanCollection): boolean {
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

export function _populateModelValidationErrors(
    beans: BeanCollection,
    force?: boolean,
    validationCache?: EditorValidationCache
): EditorValidationCache {
    const editSvc = beans.editSvc;
    if (!(force || editSvc?.hasValidationRules() || beans.editModelSvc?.hasValidationErrors())) {
        return new Map();
    }

    const cellValidationModel = new EditCellValidationModel();
    const { editModelSvc } = beans;
    const previousCellValidationModel = editModelSvc?.getCellValidationModel();
    const previousRowValidationModel = editModelSvc?.getRowValidationModel();
    const translate = _getLocaleTextFunc(beans.localeSvc);
    const rowCtrlSet = new Set<RowCtrl>();
    validationCache = collectEditorValidation(
        beans,
        (ctrl, editor, errorMessages) => {
            const { rowNode, column } = ctrl;
            const isInvalid = errorMessages.length > 0;
            const el = editor.getValidationElement?.(false) || (!editor.isPopup?.() && ctrl.eGui);

            if (el) {
                const invalidMessage = isInvalid ? _formatValidationMessages(errorMessages, translate, 'inline') : '';

                _setAriaInvalid(el, isInvalid);

                if (el instanceof HTMLInputElement) {
                    el.setCustomValidity(invalidMessage);
                } else {
                    el.classList.toggle('invalid', isInvalid);
                }
            }

            if (isInvalid) {
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
        },
        validationCache
    );

    _syncFromEditors(beans, { persist: false }, validationCache);
    editModelSvc?.setCellValidationModel(cellValidationModel);

    // Keep this after cell verdict collection: invalid editors sync to source, so the row rule sees stageable values.
    _populateRowValidationErrors(beans);

    if (editModelSvc && previousCellValidationModel && previousRowValidationModel) {
        _announceChangedValidationErrors(
            beans,
            { cell: previousCellValidationModel, row: previousRowValidationModel },
            { cell: cellValidationModel, row: editModelSvc.getRowValidationModel() }
        );
    }

    for (const rowCtrl of rowCtrlSet.values()) {
        editSvc?.applyRowEditStyles(rowCtrl);
        for (const cellCtrl of rowCtrl.getAllCellCtrls()) {
            cellCtrl.tooltipFeature?.refreshTooltip(true);
            cellCtrl.editorTooltipFeature?.refreshTooltip(true);
            editSvc?.applyCellEditStyles(cellCtrl);
        }
    }

    return validationCache;
}

/** The row half of {@link _populateModelValidationErrors}: cell errors, and the editors behind them, untouched.
 *  Row rules only ever apply to a full row, so any other edit type leaves the map as it is — empty. */
export const _populateRowValidationErrors = (beans: BeanCollection): void => {
    if (beans.gos.get('editType') === 'fullRow') {
        beans.editModelSvc?.setRowValidationModel(_generateRowValidationErrors(beans));
    }
};

const _generateRowValidationErrors = (beans: BeanCollection): EditRowValidationModel => {
    const rowValidationModel = new EditRowValidationModel();
    const getFullRowEditValidationErrors = beans.gos.get('getFullRowEditValidationErrors');
    const editMap = beans.editModelSvc?.getEditMap();

    if (!getFullRowEditValidationErrors || !editMap) {
        return rowValidationModel;
    }

    for (const [rowNode, rowEditMap] of editMap) {
        const editorsState: EditingCellPosition[] = [];
        const { rowIndex, rowPinned } = rowNode;

        for (const [column, editValue] of rowEditMap) {
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

        const errorMessages = getFullRowEditValidationErrors({ editorsState }) ?? [];

        if (errorMessages.length > 0) {
            rowValidationModel.setRowValidation({ rowNode }, { errorMessages });
        }
    }

    return rowValidationModel;
};

export function _validateEdit(beans: BeanCollection): ICellEditorValidationError[] | null {
    _populateModelValidationErrors(beans, true);
    return _readEditValidationErrors(beans);
}

/** The read half of {@link _validateEdit}: reports the validation state as it stands, changing nothing. */
export function _readEditValidationErrors(beans: BeanCollection): ICellEditorValidationError[] | null {
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
