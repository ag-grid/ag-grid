import {
    _camelCaseToHumanText,
    _findFocusableElements,
    _getActiveDomElement,
    _getDocument,
    _isStringLargerThan,
    _requestAnimationFrame,
} from 'ag-stack';

import type {
    AgColumn,
    CalculatedColumnDef,
    CalculatedColumnExpressionPicker,
    CalculatedColumnUpdate,
    CalculatedColumnValidationReason,
    CalculatedColumnsOptions,
    ColDef,
    ColKey,
    ColumnEventType,
    ColumnState,
    ColumnTreeBuild,
    HeaderPosition,
    ICalculatedColumnsService,
    NamedBean,
} from 'ag-grid-community';
import {
    BeanStub,
    _addColumnDefaultAndTypes,
    _createUserColumn,
    _isCalculatedColumnsEnabled,
    _mergedEqual,
    _normaliseCalculatedExpression,
    _warnOnce,
} from 'ag-grid-community';

import { appendColumnToTree } from '../columns/columnTreeEdit';
import type { FormulaError } from '../formula/ast/utils';
import type { MenuRestoreFocusParams, MenuUtils } from '../menu/menuUtils';
import { Dialog } from '../widgets/dialog';
import {
    CalculatedColumnForm,
    DEFAULT_CALCULATED_COLUMN_DATA_TYPES,
    DEFAULT_CALCULATED_COLUMN_EXPRESSION_PICKERS,
    DEFAULT_DRAFT,
} from './calculatedColumnForm';
import type {
    CalculatedColumnDataTypeOption,
    CalculatedColumnDraft,
    ColumnSuggestion,
} from './calculatedColumnFormTypes';
import type { CalculatedColumnReferenceMapper } from './calculatedColumnReferenceMapper';
import {
    createCalculatedColumnReferenceMapper,
    translateCalculatedColumnReferenceError,
} from './calculatedColumnReferenceMapper';
import { clearStaleDataTypeProperties, replaceBracketReferences } from './calculatedColumnUtils';

type ValidationState = 'valid' | CalculatedColumnValidationReason;

// bounds the parse-error memo; dialog keystrokes feed it one entry per expression variant.
const FORMULA_ERROR_CACHE_LIMIT = 256;

const BASE_DATA_TYPE_LOCALE_KEYS: Record<string, string> = {
    text: 'dataTypeText',
    number: 'dataTypeNumber',
    bigint: 'dataTypeBigInt',
    boolean: 'dataTypeBoolean',
    date: 'dataTypeDate',
    dateString: 'dataTypeDateString',
    dateTime: 'dataTypeDateTime',
    dateTimeString: 'dataTypeDateTimeString',
    object: 'dataTypeObject',
};

type CalcColEventCommonParams = {
    column: AgColumn;
    columns: AgColumn[];
    expression: string;
    source: ColumnEventType;
};

type CalculatedColumnDialogRestoreFocusParams = {
    eventSource?: HTMLElement;
    headerPosition: HeaderPosition | null;
};

type DynamicCalculatedColumn = {
    colDef: ColDef;
    /** Source col, or `null`. Tree placement (leaf anchor); non-leaf anchors (e.g. auto-group col)
     *  also seat in display order via `anchoredToColId`. */
    anchorColId: string | null;
    /** Owned AgColumn for stable identity across refreshes; `null` until built. The rebuild sweep destroys it. */
    instance: AgColumn | null;
};

type OpenCalculatedColumnDialog = {
    dialog: Dialog;
    highlight: boolean;
};

type PendingLiveApplyUpdate = {
    draft: CalculatedColumnDraft;
    mapper: CalculatedColumnReferenceMapper;
};

type KnownCalculatedColumn = {
    column: AgColumn;
    expression: string;
};

export class CalculatedColumnsService extends BeanStub implements NamedBean, ICalculatedColumnsService {
    public readonly beanName = 'calculatedColsSvc' as const;

    /** Dynamic calc cols (API/dialog added), keyed by colId. Insertion order = tree append order. */
    private readonly dynamicColumns = new Map<string, DynamicCalculatedColumn>();
    /** Added cols parked by `resetColumnState` so a later `applyColumnState` can restore them, by colId. */
    private readonly inactiveDynamicColumns = new Map<string, DynamicCalculatedColumn>();
    /** Build-time overrides for static (columnDefs-declared) calc cols, keyed by colId: a replacement
     *  colDef from `updateCalculatedColumn`, or `null` when removed. Consumed by the build via {@link overrideFor}. */
    private readonly staticColOverrides = new Map<string, ColDef | null>();
    private validationStatesByColId = new Map<string, ValidationState>();
    private validationStatesInitialised = false;
    // Guards the first lifecycle pass so the initial column set establishes a baseline without emitting events.
    private lifecycleInitialised = false;
    private knownCalculatedColumns = new Map<string, KnownCalculatedColumn>();
    // Re-entry counter: while > 0 (a programmatic rebuild via {@link refreshDynamicColumns}), lifecycle/validation
    // dispatch is skipped — the imperative caller emits its own events; declarative loads run with it at 0.
    private suppressValidationChecks = 0;
    private readonly openDialogsByColId = new Map<string, OpenCalculatedColumnDialog>();
    private readonly scheduledLiveApplyColIds = new Set<string>();
    private readonly pendingLiveApplyUpdatesByColId = new Map<string, PendingLiveApplyUpdate>();
    // Memoised parse results keyed by expression; see getFormulaError.
    private readonly formulaErrorsByExpression = new Map<string, FormulaError | null>();

    public postConstruct(): void {
        this.addManagedEventListeners({
            newColumnsLoaded: (event) => {
                this.checkColumnLifecycle(event.source);
                this.checkValidationStates(event.source);
            },
        });
        this.addManagedPropertyListener('calculatedColumns', () => {
            if (!this.isEnabled()) {
                this.clearDynamicColumnInstances();
            }
            this.refreshDynamicColumns('gridOptionsChanged');
            this.refreshOpenDialogHighlights();
        });
    }

    public isEnabled(): boolean {
        return _isCalculatedColumnsEnabled(this.gos.get('calculatedColumns'));
    }

    public isHighlightedColumn(column: AgColumn | null): boolean {
        return (
            column != null &&
            this.isEnabled() &&
            this.getOptions()?.suppressColumnHighlighting !== true &&
            this.openDialogsByColId.get(column.colId)?.highlight === true
        );
    }

    private refreshCalculatedColumnHighlight(column: AgColumn | null): void {
        if (column == null) {
            return;
        }

        const cellCtrls = this.beans.rowRenderer.getCellCtrls(null, [column]);
        for (const cellCtrl of cellCtrls) {
            cellCtrl.refreshCalculatedColumnCss();
        }
        this.beans.ctrlsSvc.getHeaderRowContainerCtrl()?.refresh();
    }

    private refreshOpenDialogHighlights(): void {
        const colsById = this.beans.colModel.colsById;
        for (const [colId, openDialog] of this.openDialogsByColId) {
            if (openDialog.highlight) {
                this.refreshCalculatedColumnHighlight(colsById[colId] ?? null);
            }
        }
    }

    private updateCalculatedColumn(column: ColKey, colDef: CalculatedColumnUpdate, validateExpression = true): void {
        if (!this.isEnabled()) {
            return;
        }
        const source: ColumnEventType = 'calculatedColumn';
        const { colModel } = this.beans;
        const targetColumn = colModel.getCol(column);
        if (!targetColumn?.isCalculatedCol) {
            return;
        }
        const oldExpression = targetColumn.colDef.calculatedExpression;
        const safeColDef: CalculatedColumnUpdate = { ...colDef };
        const calcExpr = _normaliseCalculatedExpression(safeColDef.calculatedExpression);
        if (calcExpr !== undefined) {
            safeColDef.calculatedExpression = calcExpr;
            if (validateExpression && !_isStringLargerThan(calcExpr, 0, true)) {
                _warnOnce('updateCalculatedColumn: calculatedExpression cannot be empty.');
                return;
            }
            if (
                validateExpression &&
                (!this.validateColumnReferences(calcExpr) || !this.validateFormulaExpression(calcExpr))
            ) {
                return;
            }
        }

        const targetColId = targetColumn.colId;
        const nextColDef = this.getUpdatedCalculatedColDef(targetColumn, safeColDef);
        // Skip rebuild when merged colDef is unchanged, avoiding a spurious `newColumnsLoaded`.
        const merged = _addColumnDefaultAndTypes(this.beans, nextColDef, targetColId);
        const changed = !_mergedEqual(merged, targetColumn.colDef);
        // Skip when unchanged: a redundant override entry would needlessly re-apply on every later rebuild.
        if (changed) {
            const dynamicColumn = this.dynamicColumns.get(targetColId);
            if (dynamicColumn) {
                dynamicColumn.colDef = nextColDef;
            } else {
                this.staticColOverrides.set(targetColId, nextColDef);
            }
            this.refreshDynamicColumns(source);
            if (calcExpr !== undefined) {
                this.beans.formula?.refreshFormulas(false);
            }
        }
        const nextColumn = colModel.colsById[targetColId] ?? targetColumn;
        const newExpression = nextColumn.colDef.calculatedExpression ?? '';
        if (calcExpr !== undefined && oldExpression !== newExpression) {
            this.dispatchExpressionChangedEvent(
                this.getEventCommonParams(nextColumn, newExpression, source),
                oldExpression ?? ''
            );
        }
        if (validateExpression) {
            this.checkValidationStates(source, true);
        }
        this.refreshCalculatedColumn(targetColId);
    }

    private getFormulaError(expression: string): FormulaError | null {
        const cache = this.formulaErrorsByExpression;
        const cached = cache.get(expression);
        if (cached !== undefined) {
            return cached;
        }
        if (cache.size >= FORMULA_ERROR_CACHE_LIMIT) {
            cache.clear();
        }
        const error = (this.beans.formula?.validateExpression(`=${expression}`) ?? null) as FormulaError | null;
        cache.set(expression, error);
        return error;
    }

    private getFormulaExpressionError(expression: string): string | null {
        return this.getFormulaError(expression)?.getTranslatedMessage(this.getLocaleTextFunc()) ?? null;
    }

    private validateFormulaExpression(expression: string): boolean {
        const error = this.getFormulaExpressionError(expression);
        if (error) {
            _warnOnce(error);
            return false;
        }
        return true;
    }

    private getInvalidColumnReference(expression: string): string | undefined {
        const colsById = this.beans.colModel.colsById;
        let invalidReference: string | undefined;
        replaceBracketReferences(expression, (ref) => {
            if (invalidReference == null && !colsById[ref]) {
                invalidReference = ref;
            }
            return ref;
        });

        return invalidReference;
    }

    private validateColumnReferences(expression: string): boolean {
        const invalidReference = this.getInvalidColumnReference(expression);

        if (invalidReference != null) {
            _warnOnce(
                translateCalculatedColumnReferenceError(
                    { type: 'unknown', reference: invalidReference },
                    this.getLocaleTextFunc()
                )
            );
            return false;
        }

        return true;
    }

    public openCalculatedColumnDialog(
        column: AgColumn | null | undefined,
        mode: 'add' | 'edit',
        focus = true,
        restoreFocusParams?: CalculatedColumnDialogRestoreFocusParams
    ): void {
        if (!this.isEnabled()) {
            return;
        }
        const liveApply = this.isLiveApplyMode();
        if (mode === 'add') {
            const colId = this.createUniqueColId();
            const headerName = this.getLocaleTextFunc()('calculatedColumnDefaultTitle', 'Untitled');
            const draft: CalculatedColumnDraft = { colId, headerName, ...this.getDefaultDraft() };
            if (liveApply) {
                // Live apply adds the column up front, then opens the dialog over it.
                const newColumn = this.addDynamicCalculatedColumn(draft, column);
                if (newColumn) {
                    this.showDialog(draft, () => null, true, newColumn, focus, undefined, restoreFocusParams, column);
                }
                return;
            }
            this.showDialog(
                draft,
                (nextDraft) => {
                    const newColumn = this.addDynamicCalculatedColumn(nextDraft, column);
                    if (newColumn) {
                        this.focusCalculatedColumn(nextDraft.colId);
                    }
                },
                false,
                undefined,
                focus,
                undefined,
                restoreFocusParams,
                column
            );
            return;
        }

        if (!column?.isCalculatedCol) {
            return;
        }
        // Built once and shared by toDraft + showDialog — both need the same column snapshot.
        const mapper = createCalculatedColumnReferenceMapper(this.beans, this.beans.colModel.colsList, column.colId);
        const draft = this.toDraft(column, mapper);
        this.showDialog(
            draft,
            (nextDraft) => {
                const { colId: _, ...update } = this.toColDef(nextDraft);
                this.updateCalculatedColumn(column.colId, update);
            },
            liveApply,
            column,
            focus,
            mapper,
            restoreFocusParams,
            column
        );
    }

    // Projects a new dynamic calculated column into the tree and emits the created event.
    private addDynamicCalculatedColumn(
        draft: CalculatedColumnDraft,
        anchorColumn: AgColumn | null | undefined
    ): AgColumn | undefined {
        const colId = draft.colId;
        const nextColDef = this.toColDef(draft);
        const columnGroupShow = anchorColumn?.colDef.columnGroupShow;
        if (columnGroupShow != null) {
            nextColDef.columnGroupShow = columnGroupShow;
        }
        this.inactiveDynamicColumns.delete(colId);
        this.dynamicColumns.set(colId, {
            colDef: nextColDef,
            anchorColId: anchorColumn?.colId ?? null,
            instance: null,
        });
        this.refreshDynamicColumns('calculatedColumn');
        const newColumn = this.beans.colModel.colsById[colId];
        if (newColumn) {
            this.dispatchCreatedOrRemovedEvent(
                'calculatedColumnCreated',
                this.getEventCommonParams(newColumn, draft.calculatedExpression, 'calculatedColumn')
            );
        }
        this.checkValidationStates('calculatedColumn', true);
        return newColumn ?? undefined;
    }

    public removeCalculatedColumn(column: AgColumn | null | undefined): void {
        if (!this.isEnabled()) {
            return;
        }
        if (!column?.isCalculatedCol) {
            return;
        }
        const source: ColumnEventType = 'calculatedColumn';
        const expression = column.colDef.calculatedExpression ?? '';
        const colId = column.colId;
        this.closeCalculatedColumnDialog(colId);
        if (this.dynamicColumns.delete(colId)) {
            for (const dc of this.dynamicColumns.values()) {
                if (dc.anchorColId === colId) {
                    dc.anchorColId = null;
                }
            }
        } else {
            this.staticColOverrides.set(colId, null);
        }
        this.refreshDynamicColumns(source);
        this.dispatchCreatedOrRemovedEvent(
            'calculatedColumnRemoved',
            this.getEventCommonParams(column, expression, source)
        );
        this.checkValidationStates(source, true);
    }

    private isLiveApplyMode(): boolean {
        return this.getOptions()?.applyMode !== 'deferred';
    }

    private getOptions(): CalculatedColumnsOptions | undefined {
        const calculatedColumns = this.gos.get('calculatedColumns');
        return typeof calculatedColumns === 'object' && calculatedColumns != null ? calculatedColumns : undefined;
    }

    public overrideFor(colDef: ColDef): ColDef | null | undefined {
        if (!this.isEnabled()) {
            return undefined;
        }
        const overrides = this.staticColOverrides;
        if (overrides.size === 0) {
            return undefined;
        }
        const key = colDef.colId ?? colDef.field;
        return key != null ? overrides.get(key) : undefined;
    }

    public contributeTo(build: ColumnTreeBuild): void {
        if (!this.isEnabled()) {
            return;
        }
        const { dynamicColumns, staticColOverrides } = this;
        // Static-col overrides/removals are handled by the build via `overrideFor`; here we only splice
        // in dynamic (API/dialog-added) cols, so nothing to do without them.
        if (dynamicColumns.size === 0) {
            return;
        }

        // Place each dynamic col. `appendColumnToTree(col, anchorId)` positions it in the TREE (inheriting
        // a leaf anchor's group membership); `anchoredToColId` is stamped so order restoration also seats
        // it after the anchor in DISPLAY order — needed for non-leaf anchors (e.g. auto-group col). A
        // missing/removed anchor (or none) falls back to a plain append.
        const source = build.source;
        const buildToken = build.buildToken;
        const newColDefs = build.newColDefs;
        dynamicColumns.forEach((dc, colId) => {
            const agCol = this.getOrCreateColumn(dc, colId, buildToken, source, newColDefs);
            agCol.buildToken = buildToken; // So the post-build sweep keeps the col alive.
            const anchorId = dc.anchorColId;
            if (anchorId != null && anchorId !== colId && staticColOverrides.get(anchorId) !== null) {
                agCol.anchoredToColId = anchorId;
                appendColumnToTree(build, agCol, anchorId);
            } else {
                agCol.anchoredToColId = undefined;
                appendColumnToTree(build, agCol);
            }
        });
    }

    private clearDynamicColumnInstances(): void {
        this.dynamicColumns.forEach((dynamicColumn) => {
            dynamicColumn.instance = null;
        });
    }

    public resetDynamicColumnDefs(preserveCreatedColumns = false): boolean {
        if (!preserveCreatedColumns) {
            this.inactiveDynamicColumns.clear();
        }
        if (!this.dynamicColumns.size && !this.staticColOverrides.size) {
            return false;
        }
        // Owned AgColumns are destroyed by the rebuild that always follows (colModel owns tree lifetime).
        // `resetColumnState` parks added cols for a later `applyColumnState`, dropping the about-to-be-swept instance ref.
        if (preserveCreatedColumns) {
            this.dynamicColumns.forEach((dynamicColumn, colId) => {
                dynamicColumn.instance = null;
                this.inactiveDynamicColumns.set(colId, dynamicColumn);
            });
        }
        this.dynamicColumns.clear();
        this.staticColOverrides.clear();
        return true;
    }

    public restoreDynamicColumnDefs(state: ColumnState[]): boolean {
        if (!this.isEnabled()) {
            return false;
        }
        const inactive = this.inactiveDynamicColumns;
        if (!inactive.size) {
            return false;
        }
        let restored = false;
        for (let i = 0, len = state.length; i < len; ++i) {
            const colId = state[i].colId;
            const dynamicColumn = inactive.get(colId);
            if (dynamicColumn === undefined) {
                continue;
            }
            inactive.delete(colId);
            if (!this.dynamicColumns.has(colId)) {
                this.dynamicColumns.set(colId, dynamicColumn);
                restored = true;
            }
        }
        return restored;
    }

    private getOrCreateColumn(
        dc: DynamicCalculatedColumn,
        colId: string,
        buildToken: number,
        source: ColumnEventType,
        newColDefs: boolean
    ): AgColumn {
        const beans = this.beans;
        const existing = dc.instance;
        if (existing !== null) {
            // Reuse the owned instance (always alive: contributed/stamped every refresh, nulled when
            // parked/removed). Restamp + refresh colDef in case expression/cellDataType changed.
            existing.buildToken = buildToken;
            existing.reapplyColDef(dc.colDef, source, newColDefs);
            return existing;
        }
        const agCol = _createUserColumn(beans, dc.colDef, colId, true, buildToken);
        dc.instance = agCol;
        return agCol;
    }

    /** Rebuild the column tree for a calc-col mutation. Suppresses lifecycle/validation dispatch during the
     *  rebuild so the imperative caller (or column-state op) emits its own events, not duplicates. */
    public refreshDynamicColumns(source: ColumnEventType): void {
        this.suppressValidationChecks++;
        try {
            this.beans.colModel.rebuildCols(source);
        } finally {
            this.suppressValidationChecks--;
        }
    }

    private createUniqueColId(): string {
        const { colModel } = this.beans;
        const parked = this.inactiveDynamicColumns;
        let index = 0;
        let colId: string;
        do {
            colId = `calculated_${++index}`;
        } while (colModel.getCol(colId) !== undefined || parked.has(colId));
        return colId;
    }

    private getUpdatedCalculatedColDef(column: AgColumn, colDefUpdate: CalculatedColumnUpdate): ColDef {
        const colId = column.colId;
        const dynamicColumn = this.dynamicColumns.get(colId);
        const staticOverride = this.staticColOverrides.get(colId);
        const userColDef = column.getUserProvidedColDef();
        const baseColDef = dynamicColumn?.colDef ?? staticOverride ?? userColDef ?? column.colDef;
        const safeUpdate: ColDef = { ...colDefUpdate };
        delete safeUpdate.colId;

        const nextColDef = {
            ...clearStaleDataTypeProperties(baseColDef, userColDef, safeUpdate),
            ...safeUpdate,
        };
        nextColDef.calculatedExpression ??= baseColDef.calculatedExpression;

        return this.toCalculatedColDef(nextColDef, colId);
    }

    private showDialog(
        draft: CalculatedColumnDraft,
        onApply: (draft: CalculatedColumnDraft) => void,
        // Always passed explicitly: the 'live'-by-default resolution lives in isLiveApplyMode().
        liveApply: boolean,
        columnToHighlight?: AgColumn | null,
        focusDialog = true,
        existingMapper?: CalculatedColumnReferenceMapper,
        restoreFocusParams?: CalculatedColumnDialogRestoreFocusParams,
        restoreFocusColumn?: AgColumn | null
    ): void {
        const openDialogState = this.openDialogsByColId.get(draft.colId);
        if (openDialogState) {
            this.beans.menuSvc?.hidePopupMenu();
            if (focusDialog) {
                openDialogState.dialog.getGui().focus({ preventScroll: true });
            }
            return;
        }

        const state: { close?: () => void; resolved: boolean } = { resolved: false };
        const beans = this.beans;
        const mapper =
            existingMapper ?? createCalculatedColumnReferenceMapper(beans, beans.colModel.colsList, draft.colId);

        const getValidatedExpression = (
            nextDraft: CalculatedColumnDraft
        ): { valid: true; expression: string } | { valid: false; error: string } => {
            // An empty expression is "incomplete", not a malformed formula — surface a calc-column
            // message rather than the formula parser's "Formulas must begin with =." error.
            if (!_isStringLargerThan(nextDraft.calculatedExpression, 0, true)) {
                return {
                    valid: false,
                    error: this.getLocaleTextFunc()('calculatedColumnExpressionEmpty', 'Enter an expression'),
                };
            }
            const result = mapper.toInternalExpression(nextDraft.calculatedExpression);
            if ('error' in result) {
                return {
                    valid: false,
                    error: translateCalculatedColumnReferenceError(result.error, this.getLocaleTextFunc()),
                };
            }
            const error = this.getFormulaExpressionError(result.expression);
            return error ? { valid: false, error } : { valid: true, expression: result.expression };
        };
        const handleValidate = (nextDraft: CalculatedColumnDraft): string | null => {
            const result = getValidatedExpression(nextDraft);
            return result.valid ? null : result.error;
        };
        const handleApply = (nextDraft: CalculatedColumnDraft): string | null => {
            if (state.resolved) {
                return null;
            }
            const result = getValidatedExpression(nextDraft);
            if (!result.valid) {
                return result.error;
            }
            state.resolved = true;
            onApply({ ...nextDraft, calculatedExpression: result.expression });
            state.close?.();
            return null;
        };
        const handleCancel = () => {
            if (state.resolved) {
                return;
            }
            state.resolved = true;
            state.close?.();
        };
        const handleDraftChange = liveApply
            ? (nextDraft: CalculatedColumnDraft) => this.scheduleLiveApplyUpdate(nextDraft, mapper)
            : undefined;
        const dataTypeOptions = this.getDataTypeOptions(draft.cellDataType);

        const form = this.createManagedBean(
            new CalculatedColumnForm(
                draft,
                dataTypeOptions,
                this.getExpressionPickers(),
                () => mapper.suggestions,
                () => this.getFunctionSuggestions(),
                handleValidate,
                handleApply,
                handleCancel,
                liveApply,
                handleDraftChange
            )
        );
        const dialog = this.createManagedBean(
            new Dialog({
                title: this.getLocaleTextFunc()('calculatedColumn', 'Calculated Column'),
                component: form,
                minWidth: 320,
                width: 400,
                minHeight: 380,
                height: 380,
                centered: true,
                movable: true,
                resizable: true,
                modal: false,
                cssIdentifier: 'calculated-column',
                closedCallback: (event) => {
                    if (restoreFocusColumn) {
                        this.restoreFocusOnDialogClose(restoreFocusColumn, form.getGui(), event, restoreFocusParams);
                    }
                },
            })
        );
        state.close = () => dialog.close();
        this.openDialogsByColId.set(draft.colId, { dialog, highlight: columnToHighlight != null });
        this.refreshCalculatedColumnHighlight(columnToHighlight ?? null);
        if (focusDialog) {
            const focusableElements = _findFocusableElements(form.getGui());
            if (focusableElements.length) {
                focusableElements[0].focus({ preventScroll: true });
            }
        }
        const destroyDialogMouseListeners = this.addManagedElementListeners(dialog.getGui(), {
            mousedown: () => form.hideSuggestions(),
        });
        dialog.addDestroyFunc(() => {
            for (let i = 0, len = destroyDialogMouseListeners.length; i < len; ++i) {
                destroyDialogMouseListeners[i]();
            }
        });
        dialog.addDestroyFunc(() => {
            if (liveApply && this.isAlive() && !this.beans.context.isDestroyed()) {
                this.flushLiveApplyUpdate(draft.colId);
            } else {
                this.cancelLiveApplyUpdate(draft.colId);
            }
            if (this.openDialogsByColId.get(draft.colId)?.dialog === dialog) {
                this.openDialogsByColId.delete(draft.colId);
                this.refreshCalculatedColumnHighlight(columnToHighlight ?? null);
            }
        });
        dialog.addEventListener('destroyed', () => this.destroyBean(form));
    }

    private restoreFocusOnDialogClose(
        column: AgColumn,
        eComp: HTMLElement,
        event: MouseEvent | TouchEvent | KeyboardEvent | undefined,
        params: CalculatedColumnDialogRestoreFocusParams | undefined
    ): void {
        if (!params?.eventSource) {
            return;
        }

        const restoreFocusParams: MenuRestoreFocusParams = {
            column,
            columnIndex: column.allColsIndex,
            headerPosition: params.headerPosition,
            eventSource: params.eventSource,
        };

        (this.beans.menuUtils as MenuUtils | undefined)?.restoreFocusOnClose(restoreFocusParams, eComp, event, true);
        if (_getActiveDomElement(this.beans) === _getDocument(this.beans).body && params.headerPosition) {
            this.beans.focusSvc.focusHeaderPosition({ headerPosition: params.headerPosition });
        }
    }

    private scheduleLiveApplyUpdate(draft: CalculatedColumnDraft, mapper: CalculatedColumnReferenceMapper): void {
        const colId = draft.colId;
        this.pendingLiveApplyUpdatesByColId.set(colId, { draft, mapper });
        if (this.scheduledLiveApplyColIds.has(colId)) {
            return;
        }

        // Coalesce keystrokes into one column rebuild per frame; a cancelled update leaves the frame
        // scheduled but with no pending entry, so it harmlessly no-ops.
        this.scheduledLiveApplyColIds.add(colId);
        _requestAnimationFrame(this.beans, () => {
            this.scheduledLiveApplyColIds.delete(colId);
            this.flushLiveApplyUpdate(colId);
        });
    }

    private flushLiveApplyUpdate(colId: string): void {
        const pending = this.pendingLiveApplyUpdatesByColId.get(colId);
        if (pending === undefined) {
            return;
        }

        this.pendingLiveApplyUpdatesByColId.delete(colId);
        const { draft, mapper } = pending;
        const { colId: _, ...update } = this.toColDef({
            ...draft,
            calculatedExpression: mapper.toInternalExpressionBestEffort(draft.calculatedExpression),
        });
        this.updateCalculatedColumn(colId, update, false);
    }

    private cancelLiveApplyUpdate(colId: string): void {
        this.pendingLiveApplyUpdatesByColId.delete(colId);
    }

    private closeCalculatedColumnDialog(colId: string): void {
        const openDialog = this.openDialogsByColId.get(colId);
        if (openDialog === undefined) {
            return;
        }

        this.cancelLiveApplyUpdate(colId);
        openDialog.dialog.close();
    }

    private getDefaultDraft(): Omit<CalculatedColumnDraft, 'colId' | 'headerName'> {
        const firstDataType = this.getDataTypeOptions()[0]?.value ?? DEFAULT_DRAFT.cellDataType;
        return {
            ...DEFAULT_DRAFT,
            cellDataType: firstDataType,
        };
    }

    private getDataTypeOptions(currentDataType?: string): CalculatedColumnDataTypeOption[] {
        const configuredDataTypes = this.getOptions()?.dataTypes;
        const dataTypes = configuredDataTypes
            ? this.getValidConfiguredDataTypes(configuredDataTypes)
            : [...DEFAULT_CALCULATED_COLUMN_DATA_TYPES];

        if (currentDataType != null && dataTypes.indexOf(currentDataType) < 0) {
            dataTypes.push(currentDataType);
        }

        return dataTypes.map((dataType) => ({
            value: dataType,
            text: this.getDataTypeDisplayName(dataType),
        }));
    }

    private getValidConfiguredDataTypes(dataTypes: string[]): string[] {
        const dataTypeSvc = this.beans.dataTypeSvc;
        if (!dataTypeSvc) {
            return [...dataTypes];
        }

        const validDataTypes: string[] = [];
        for (const dataType of dataTypes) {
            if (dataTypeSvc.isDataTypeRegistered(dataType)) {
                validDataTypes.push(dataType);
            } else {
                this.warn(304, { dataType });
            }
        }
        return validDataTypes;
    }

    private getDataTypeDisplayName(dataType: string): string {
        const localeKey = BASE_DATA_TYPE_LOCALE_KEYS[dataType];
        if (localeKey != null) {
            return this.getLocaleTextFunc()(localeKey, this.formatDataTypeName(dataType));
        }

        return this.formatDataTypeName(dataType);
    }

    private formatDataTypeName(dataType: string): string {
        return _camelCaseToHumanText(dataType.replace(/[_-]+/g, '.')) ?? dataType;
    }

    private getExpressionPickers(): CalculatedColumnExpressionPicker[] {
        const expressionPickers = this.getOptions()?.expressionPickers;
        return expressionPickers === undefined
            ? [...DEFAULT_CALCULATED_COLUMN_EXPRESSION_PICKERS]
            : (expressionPickers ?? []);
    }

    private toDraft(column: AgColumn, mapper: CalculatedColumnReferenceMapper): CalculatedColumnDraft {
        const colDef = column.colDef;
        const colId = column.colId;
        const cellDataType = colDef.cellDataType;
        const displayName = this.beans.colNames.getDisplayNameForColumn(column, 'header');

        return {
            colId,
            headerName: colDef.headerName ?? displayName ?? colId,
            cellDataType: typeof cellDataType === 'string' ? cellDataType : DEFAULT_DRAFT.cellDataType,
            calculatedExpression: mapper.toDisplayExpression(colDef.calculatedExpression ?? ''),
        };
    }

    private focusCalculatedColumn(colId: string): void {
        window.setTimeout(() => {
            const beans = this.beans;
            const headerPos = this.isAlive() && beans.headerNavigation?.getHeaderPositionForColumn(colId, false);
            if (headerPos) {
                beans.focusSvc.focusHeaderPosition({ headerPosition: headerPos });
            }
        }, 0);
    }

    private toColDef(draft: CalculatedColumnDraft): ColDef {
        return {
            colId: draft.colId,
            headerName: draft.headerName,
            calculatedExpression: _normaliseCalculatedExpression(draft.calculatedExpression) ?? '',
            cellDataType: draft.cellDataType,
            editable: false,
            suppressPaste: true,
        };
    }

    private toCalculatedColDef(colDef: CalculatedColumnDef | ColDef, colId: string): ColDef {
        // strip fields that conflict with calculatedExpression invariants (see colDefValidations.ts).
        return {
            ...colDef,
            colId,
            calculatedExpression: _normaliseCalculatedExpression(colDef.calculatedExpression),
            editable: false,
            suppressPaste: true,
            field: undefined,
            valueGetter: undefined,
            valueSetter: undefined,
            cellEditor: undefined,
            cellEditorSelector: undefined,
        };
    }

    private getExpressionValidationState(expression: string): ValidationState {
        if (!_isStringLargerThan(expression, 0, true)) {
            return 'valid';
        }
        if (this.getInvalidColumnReference(expression) != null) {
            return 'unknownReference';
        }
        return this.getFormulaExpressionError(expression) == null ? 'valid' : 'invalidExpression';
    }

    /** Fire created/expressionChanged/removed events for calc cols added, edited, or removed *declaratively*
     *  (via columnDefs). Imperative dialog paths rebuild through {@link refreshDynamicColumns} (counter > 0),
     *  so this stays silent for them and they dispatch inline — avoiding double-fire. The baseline is always
     *  updated (even when silent) so a later declarative load doesn't replay suppressed changes as new events. */
    private checkColumnLifecycle(source: ColumnEventType): void {
        const previousColumns = this.knownCalculatedColumns;
        const nextColumns = new Map<string, KnownCalculatedColumn>();
        const shouldDispatch = this.lifecycleInitialised && this.suppressValidationChecks === 0;

        const cols = this.beans.colModel.colsList;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const column = cols[i];
            if (!column.isCalculatedCol) {
                continue;
            }
            const expression = column.colDef.calculatedExpression ?? '';

            const colId = column.colId;
            nextColumns.set(colId, { column, expression });
            if (!shouldDispatch) {
                continue;
            }

            const previousColumn = previousColumns.get(colId);
            if (previousColumn == null) {
                this.dispatchCreatedOrRemovedEvent(
                    'calculatedColumnCreated',
                    this.getEventCommonParams(column, expression, source)
                );
            } else if (previousColumn.expression !== expression) {
                this.dispatchExpressionChangedEvent(
                    this.getEventCommonParams(column, expression, source),
                    previousColumn.expression
                );
            }
        }

        if (shouldDispatch) {
            previousColumns.forEach((previousColumn, colId) => {
                if (!nextColumns.has(colId)) {
                    this.dispatchCreatedOrRemovedEvent(
                        'calculatedColumnRemoved',
                        this.getEventCommonParams(previousColumn.column, previousColumn.expression, source)
                    );
                }
            });
        }

        this.knownCalculatedColumns = nextColumns;
        this.lifecycleInitialised = true;
    }

    private checkValidationStates(source: ColumnEventType, forceDispatch = false): void {
        if (this.suppressValidationChecks > 0) {
            return;
        }

        const shouldDispatch = forceDispatch || this.validationStatesInitialised;
        const previousStates = this.validationStatesByColId;
        const nextStates = new Map<string, ValidationState>();

        const cols = this.beans.colModel.colsList;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const column = cols[i];
            if (!column.isCalculatedCol) {
                continue;
            }
            const expression = column.colDef.calculatedExpression ?? '';

            const colId = column.colId;
            const state = this.getExpressionValidationState(expression);
            nextStates.set(colId, state);

            const previousState = previousStates.get(colId);
            const hasPreviousState = previousState !== undefined;
            const stateChanged =
                (hasPreviousState && previousState !== state) || (!hasPreviousState && state !== 'valid');
            if (shouldDispatch && stateChanged) {
                const valid = state === 'valid';
                this.dispatchValidationStateChangedEvent(
                    this.getEventCommonParams(column, expression, source),
                    valid,
                    valid ? undefined : state
                );
            }
        }

        this.validationStatesByColId = nextStates;
        this.validationStatesInitialised = true;
    }

    private getEventCommonParams(
        column: AgColumn,
        expression: string,
        source: ColumnEventType
    ): CalcColEventCommonParams {
        return { column, columns: [column], expression, source };
    }

    private dispatchCreatedOrRemovedEvent(
        type: 'calculatedColumnCreated' | 'calculatedColumnRemoved',
        commonParams: CalcColEventCommonParams
    ): void {
        this.eventSvc.dispatchEvent({ type, ...commonParams } as Parameters<typeof this.eventSvc.dispatchEvent>[0]);
    }

    private dispatchExpressionChangedEvent(commonParams: CalcColEventCommonParams, oldExpression: string): void {
        this.eventSvc.dispatchEvent({
            type: 'calculatedColumnExpressionChanged',
            ...commonParams,
            oldExpression,
        });
    }

    private dispatchValidationStateChangedEvent(
        commonParams: CalcColEventCommonParams,
        valid: boolean,
        reason?: CalculatedColumnValidationReason
    ): void {
        this.eventSvc.dispatchEvent({
            type: 'calculatedColumnValidationStateChanged',
            ...commonParams,
            valid,
            reason,
        });
    }

    private getFunctionSuggestions(): ColumnSuggestion[] {
        return (this.beans.formula?.getFunctionNames() ?? []).map((name) => ({
            type: 'function',
            value: name,
            label: name,
        }));
    }

    private refreshCalculatedColumn(colId: string): void {
        window.setTimeout(() => {
            const beans = this.beans;
            const column = this.isAlive() && beans.colModel.colsById[colId];
            if (column) {
                beans.rowRenderer.refreshCells({ columns: [column], force: true });
            }
        }, 0);
    }
}
