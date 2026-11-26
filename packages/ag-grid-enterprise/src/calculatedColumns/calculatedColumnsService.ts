import {
    _addManagedElementListeners,
    _camelCaseToHumanText,
    _findFocusableElements,
    _isNothingFocused,
    _isStringLargerThan,
    _requestAnimationFrame,
} from 'ag-stack';

import type {
    AgColumn,
    CalculatedColumnExpressionPicker,
    CalculatedColumnExpressionValidation,
    CalculatedColumnUpdate,
    CalculatedColumnValidationErrors,
    CalculatedColumnValidationReason,
    CalculatedColumnValidationState,
    CalculatedColumnsOptions,
    CalculatedExpressionError,
    ColDef,
    ColKey,
    ColumnEventType,
    ColumnIdAllocator,
    ColumnModel,
    ColumnState,
    ColumnTreeBuild,
    GridOptions,
    HeaderPosition,
    ICalculatedColumnsService,
    IRowGroupColsService,
    NamedBean,
    RefreshCalculatedColumnsParams,
    _UserColumnService,
} from 'ag-grid-community';
import {
    BeanStub,
    _addColumnDefaultAndTypes,
    _addGridCommonParams,
    _createUserColumn,
    _isCalculatedColumnsEnabled,
    _mergedEqual,
    _normaliseCalculatedExpression,
    _warnOnce,
} from 'ag-grid-community';

import { appendColumnToTree, getBuildColumn } from '../columns/columnTreeEdit';
import { inspectFormulaExpression } from '../formula/ast/parsers';
import type { FormulaError } from '../formula/ast/utils';
import type { MenuRestoreFocusParams, MenuUtils } from '../menu/menuUtils';
import { Dialog } from '../widgets/dialog';
import type { CalculatedColumnExpressionPresentation } from './calculatedColumnExpressionEditor';
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
    getCalculatedColumnReferences,
    translateCalculatedColumnReferenceError,
} from './calculatedColumnReferenceMapper';
import {
    USER_OWNED_PROPERTIES,
    clearStaleDataTypeProperties,
    getCalculatedColumnChanges,
    getIgnoredCalculatedColDefProperties,
    pickUserOwnedProperties,
    replaceBracketReferences,
    toCalculatedColDef,
    toFormulaString,
} from './calculatedColumnUtils';

interface DialogValidation {
    expression: string;
    errors: CalculatedColumnValidationErrors | null;
    expressionError?: CalculatedExpressionError;
}

// bounds the parse-error memo; dialog keystrokes feed it one entry per expression variant.
const FORMULA_ERROR_CACHE_LIMIT = 256;

function getParentGroupId(column: AgColumn | null | undefined): string | null {
    return column?.getFirstRealParent()?.groupId ?? null;
}

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

type CalculatedColumnDialogContext = {
    colId: string;
    sourceColumn: AgColumn | null;
    liveApply: boolean;
    mapper: CalculatedColumnReferenceMapper;
    initialHeaderName?: string;
};

type DynamicCalculatedColumn = {
    colDef: ColDef;
    /** Authored definition merged with defaults and types, excluding `processColDef` output. */
    resolvedAuthoredColDef?: ColDef;
    /** Source col, or `null`. Tree placement (leaf anchor); non-leaf anchors (e.g. auto-group col)
     *  also seat in display order via `anchoredToColId`. */
    anchorColId: string | null;
    /** Source pinning applied once on creation, then persisted through normal column state. */
    initialPinned?: ColDef['pinned'];
    /** Owned AgColumn for stable identity across refreshes; `null` until built. The rebuild sweep destroys it. */
    instance: AgColumn | null;
    /** Group placement captured when `resetColumnState` parks the column (the instance is dropped at that
     *  point), so a later `applyColumnState` restore persists the column back into its group. */
    parentGroupId?: string | null;
    /** Validation metadata parked alongside the column by `resetColumnState`. */
    parkedExpressionError?: CalculatedExpressionError;
    /** A move of it, or the last ordered column state, left it away from its source: order-keeping rebuilds keep it. */
    placedByUser?: boolean;
};

type ProcessColDef = NonNullable<CalculatedColumnsOptions['processColDef']>;

type ColDefProcessor = {
    processColDef: ProcessColDef;
    hasCol: (colId: string) => boolean;
    getCol: (colId: string) => AgColumn | null;
};

type OpenCalculatedColumnDialog = {
    dialog: Dialog;
    highlight: boolean;
    readOnly: boolean;
    refreshValidation: () => void;
};

type KnownCalculatedColumn = {
    column: AgColumn;
    colDef: ColDef;
    validationState: CalculatedColumnValidationState;
};

type PendingLiveApplyUpdate = {
    colDef: CalculatedColumnUpdate;
    expressionError?: CalculatedExpressionError;
    timeout?: number;
};

export class CalculatedColumnsService extends BeanStub implements NamedBean, ICalculatedColumnsService {
    public readonly beanName = 'calculatedColsSvc' as const;

    /** Dynamic calc cols (API/dialog added), keyed by colId. Insertion order = tree append order. */
    private readonly dynamicColumns = new Map<string, DynamicCalculatedColumn>();
    /** Added cols parked by `resetColumnState` so a later `applyColumnState` can restore them, by colId. */
    private readonly inactiveDynamicColumns = new Map<string, DynamicCalculatedColumn>();
    /** Highest `calculated_N` index handed out to this grid, so {@link createUniqueColId} never reuses one. */
    private lastCalculatedColIndex = 0;
    // Guards the first lifecycle pass so the initial column set establishes a baseline without emitting events.
    private lifecycleInitialised = false;
    private knownCalculatedColumns = new Map<string, KnownCalculatedColumn>();
    /** The columns the option was just turned on for, as authored: the next build's start resolves them. */
    private turnedOnColumns: Map<string, KnownCalculatedColumn> | null = null;
    private readonly openDialogsByColId = new Map<string, OpenCalculatedColumnDialog>();
    private readonly liveCreationColumnIds = new Set<string>();
    private readonly pendingLiveApplyUpdatesByColId = new Map<string, PendingLiveApplyUpdate>();
    // Memoised parse results keyed by expression; see getFormulaError.
    private readonly formulaErrorsByExpression = new Map<string, FormulaError | null>();
    // Guaranteed present: registered by CalculatedColumnsModule alongside this service.
    private userColumnSvc!: _UserColumnService;
    /** The `calculatedColumns` option last applied. */
    private appliedCalculatedColumns: GridOptions['calculatedColumns'];

    public postConstruct(): void {
        this.userColumnSvc = this.beans.userColumnSvc!;
        this.userColumnSvc.registerOwner(() => this.isEnabled(), USER_OWNED_PROPERTIES);
        this.appliedCalculatedColumns = this.gos.get('calculatedColumns');
    }

    public addOptionKeysTo(keys: Set<keyof GridOptions>): void {
        keys.add('calculatedColumns');
    }

    public applyOptions(changedProps: ReadonlySet<keyof GridOptions>): boolean {
        if (!changedProps.has('calculatedColumns')) {
            return false;
        }
        const previousValue = this.appliedCalculatedColumns;
        const currentValue = this.gos.get('calculatedColumns');
        this.appliedCalculatedColumns = currentValue;
        const enabled = _isCalculatedColumnsEnabled(currentValue);
        const enablementChanged = enabled !== _isCalculatedColumnsEnabled(previousValue);
        const previousOptions = typeof previousValue === 'object' ? previousValue : undefined;
        const options = typeof currentValue === 'object' ? currentValue : undefined;
        const rebuild = enablementChanged || (enabled && previousOptions?.processColDef !== options?.processColDef);

        if (rebuild && enabled) {
            this.adoptUserColumns();
        } else if (rebuild) {
            this.clearDynamicColumnInstances();
        }
        if (enablementChanged && enabled) {
            this.recordColumnsTurnedOn();
        }
        if (
            rebuild ||
            (previousOptions?.suppressColumnHighlighting === true) !== (options?.suppressColumnHighlighting === true)
        ) {
            this.refreshOpenDialogHighlights();
        }
        return rebuild;
    }

    public isEnabled(): boolean {
        return _isCalculatedColumnsEnabled(this.gos.get('calculatedColumns'));
    }

    public getExpressionError(column: AgColumn): CalculatedExpressionError | undefined {
        const error = this.userColumnSvc.getEntry(column.colId)?.calculatedExpressionError;
        return error && error.expression === this.getResolvedAuthoredColDef(column).calculatedExpression
            ? error
            : undefined;
    }

    public refreshCalculatedColumns(params?: RefreshCalculatedColumnsParams): void {
        if (!this.isEnabled()) {
            return;
        }
        const { colModel, formula } = this.beans;
        const columns = params?.columns?.map((key) => colModel.getCol(key)) ?? colModel.colDefList;
        const targets = new Set(columns.filter((column): column is AgColumn => !!column?.isCalculatedCol));
        const updates: { colId: string; colDef: ColDef; validation: CalculatedColumnExpressionValidation }[] = [];
        for (const column of targets) {
            const colId = column.colId;
            const colDef = pickUserOwnedProperties(this.getResolvedAuthoredColDef(column));
            const validation = this.getExpressionValidation(
                colDef.calculatedExpression ?? '',
                this.getExpressionError(column)
            );
            const context = this.createDialogContext(colId, true, null);
            const result = this.validateDialogDraft(this.toDraft(column, context.mapper), context, true);
            const entry = this.userColumnSvc.getEntry(colId);
            if (_mergedEqual(entry?.calculatedExpressionError, result.expressionError)) {
                continue;
            }
            if (entry?.created) {
                this.userColumnSvc.setCreatedColumn(
                    colId,
                    entry.properties ?? {},
                    entry.parentGroupId ?? null,
                    result.expressionError
                );
            } else if (result.expressionError || Object.keys(entry?.properties ?? {}).length) {
                this.userColumnSvc.setOverride(colId, entry?.properties ?? {}, result.expressionError);
            } else {
                this.userColumnSvc.clearColumn(colId);
            }
            updates.push({ colId, colDef, validation });
        }
        if (updates.length) {
            this.rebuildColsAndValidate('api');
        }
        if (params?.columns == null) {
            for (const dialog of this.openDialogsByColId.values()) {
                dialog.refreshValidation();
            }
        } else {
            for (const column of targets) {
                this.openDialogsByColId.get(column.colId)?.refreshValidation();
            }
        }
        if (!targets.size) {
            return;
        }
        // dependencies may be outside the requested columns, so refresh their cached values too
        formula?.refreshFormulas(true);
        for (const { colId, colDef, validation } of updates) {
            const column = colModel.getCol(colId);
            if (column?.isCalculatedCol) {
                this.dispatchChangedEvents(
                    column,
                    colDef,
                    pickUserOwnedProperties(this.getResolvedAuthoredColDef(column)),
                    'api',
                    validation
                );
            }
        }
    }

    /** The column's definition as the user authored it. The dialog, the reference mapper, saved validation errors and
     *  the created/changed/removed events all read this, so `processColDef` output never shows as, or hides, a user
     *  edit. Validation state events read the built expression instead, as that is the one the grid evaluates. */
    private getResolvedAuthoredColDef(column: AgColumn): ColDef {
        return this.dynamicColumns.get(column.colId)?.resolvedAuthoredColDef ?? column.colDef;
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
        this.beans.ctrlsSvc.getHeaderRowContainerCtrl()?.onHeaderClassesChanged(column);
    }

    private refreshOpenDialogHighlights(): void {
        const colsById = this.beans.colModel.colsById;
        for (const [colId, openDialog] of this.openDialogsByColId) {
            if (openDialog.highlight) {
                this.refreshCalculatedColumnHighlight(colsById[colId] ?? null);
            }
        }
    }

    private updateCalculatedColumn(
        column: ColKey,
        colDef: CalculatedColumnUpdate,
        expressionError?: CalculatedExpressionError
    ): void {
        if (!this.isEnabled()) {
            return;
        }
        const source: ColumnEventType = 'calculatedColumn';
        const { colModel } = this.beans;
        const targetColumn = colModel.getCol(column);
        if (!targetColumn?.isCalculatedCol || targetColumn.colDef.calculatedColumnReadOnly) {
            return;
        }
        const current = this.getResolvedAuthoredColDef(targetColumn);
        const oldColDef = pickUserOwnedProperties(current);
        const oldExpressionValidation = this.getExpressionValidation(
            current.calculatedExpression ?? '',
            this.getExpressionError(targetColumn)
        );
        const safeColDef: CalculatedColumnUpdate = { ...colDef };
        // the dialog shows a resolved title/type; do not persist these defaults on unrelated edits.
        if (safeColDef.headerName === this.getDraftHeaderName(targetColumn)) {
            delete safeColDef.headerName;
        }
        if (safeColDef.cellDataType === current.cellDataType) {
            delete safeColDef.cellDataType;
        }
        const calcExpr = _normaliseCalculatedExpression(safeColDef.calculatedExpression);
        if (calcExpr !== undefined) {
            safeColDef.calculatedExpression = calcExpr;
        }

        const targetColId = targetColumn.colId;
        const entry = this.userColumnSvc.getEntry(targetColId);
        const nextExpressionError = calcExpr === undefined ? entry?.calculatedExpressionError : expressionError;
        const nextColDef = this.getUpdatedCalculatedColDef(targetColumn, safeColDef);
        const dynamicColumn = this.dynamicColumns.get(targetColId);
        // Error-only changes also invalidate evaluated values and update persisted state.
        const merged = _addColumnDefaultAndTypes(this.beans, nextColDef, targetColId);
        const changed =
            !_mergedEqual(merged, current) || !_mergedEqual(nextExpressionError, entry?.calculatedExpressionError);
        const previousColumns = this.knownCalculatedColumns;
        // Skip when unchanged: a redundant override entry would needlessly re-apply on every later rebuild.
        if (changed) {
            if (dynamicColumn) {
                dynamicColumn.colDef = nextColDef;
                this.recordCreatedColumn(targetColId, nextColDef, entry?.parentGroupId ?? null, nextExpressionError);
            } else {
                this.setDeclaredColOverride(targetColumn, nextColDef, nextExpressionError);
            }
            colModel.rebuildCols(source);
        }
        const nextColumn = colModel.colsById[targetColId] ?? targetColumn;
        this.dispatchChangedEvents(
            nextColumn,
            oldColDef,
            pickUserOwnedProperties(this.getResolvedAuthoredColDef(nextColumn)),
            source,
            oldExpressionValidation
        );
        if (changed) {
            this.dispatchValidationChanges(source, previousColumns);
        }
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
        const error = (this.beans.formula?.validateExpression(toFormulaString(expression)) ??
            null) as FormulaError | null;
        cache.set(expression, error);
        return error;
    }

    private getFormulaExpressionError(expression: string): string | null {
        return this.getFormulaError(expression)?.getTranslatedMessage(this.getLocaleTextFunc()) ?? null;
    }

    /** `hasCol` defaults to the built columns; a build in progress passes its own, as `colsById` is only seeded
     *  once the build finishes. */
    private getInvalidColumnReference(
        expression: string,
        hasCol: (colId: string) => boolean = (colId) => !!this.beans.colModel.colsById[colId]
    ): string | undefined {
        let invalidReference: string | undefined;
        replaceBracketReferences(expression, (ref) => {
            if (invalidReference == null && !hasCol(ref)) {
                invalidReference = ref;
            }
            return ref;
        });

        return invalidReference;
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
                this.liveCreationColumnIds.add(colId);
                const newColumn = this.addDynamicCalculatedColumn(draft, column);
                if (newColumn) {
                    const context = this.createDialogContext(colId, liveApply, column ?? null);
                    this.showDialog(draft, () => null, context, newColumn, focus, restoreFocusParams, column);
                } else {
                    this.liveCreationColumnIds.delete(colId);
                }
                return;
            }
            this.showDialog(
                draft,
                (nextDraft) => {
                    const newColumn = this.addDynamicCalculatedColumn(nextDraft, column);
                    if (newColumn && restoreFocusParams) {
                        this.focusCalculatedColumn(nextDraft.colId);
                    }
                },
                this.createDialogContext(colId, liveApply, column ?? null),
                undefined,
                focus,
                restoreFocusParams,
                column
            );
            return;
        }

        if (!column?.isCalculatedCol) {
            return;
        }
        // Built once and shared by toDraft + showDialog — both need the same column snapshot.
        const context = this.createDialogContext(column.colId, liveApply, null);
        const draft = this.toDraft(column, context.mapper);
        this.showDialog(
            draft,
            (nextDraft) => {
                const { colId: _, ...update } = this.toColDef(nextDraft);
                this.updateCalculatedColumn(column.colId, update);
            },
            context,
            column,
            focus,
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
        const nextColDef = { ...this.toColDef(draft), calculatedColumnReadOnly: false };
        const columnGroupShow = anchorColumn?.colDef.columnGroupShow;
        if (columnGroupShow != null) {
            nextColDef.columnGroupShow = columnGroupShow;
        }
        this.inactiveDynamicColumns.delete(colId);
        this.dynamicColumns.set(colId, {
            colDef: nextColDef,
            anchorColId: anchorColumn?.colId ?? null,
            initialPinned: anchorColumn?.pinned,
            instance: null,
        });
        this.recordCreatedColumn(colId, nextColDef, getParentGroupId(anchorColumn));
        const previousColumns = this.knownCalculatedColumns;
        this.beans.colModel.rebuildCols('calculatedColumn');
        const newColumn = this.beans.colModel.colsById[colId];
        if (newColumn) {
            this.dispatchCreatedOrRemovedEvent(
                'calculatedColumnCreated',
                this.getEventCommonParams(newColumn, draft.calculatedExpression, 'calculatedColumn')
            );
        }
        this.dispatchValidationChanges('calculatedColumn', previousColumns);
        return newColumn ?? undefined;
    }

    public removeCalculatedColumn(column: AgColumn | null | undefined): void {
        if (!this.isEnabled()) {
            return;
        }
        if (!column?.isCalculatedCol || column.colDef.calculatedColumnReadOnly) {
            return;
        }
        const source: ColumnEventType = 'calculatedColumn';
        const expression = this.getResolvedAuthoredColDef(column).calculatedExpression ?? '';
        const colId = column.colId;
        this.closeCalculatedColumnDialog(colId);
        const wasDynamic = this.dynamicColumns.delete(colId);
        if (wasDynamic) {
            for (const dc of this.dynamicColumns.values()) {
                if (dc.anchorColId === colId) {
                    dc.anchorColId = null;
                }
            }
        }
        this.userColumnSvc.removeColumn(colId, !wasDynamic);
        const previousColumns = this.knownCalculatedColumns;
        this.beans.colModel.rebuildCols(source);
        this.dispatchCreatedOrRemovedEvent(
            'calculatedColumnRemoved',
            this.getEventCommonParams(column, expression, source)
        );
        this.dispatchValidationChanges(source, previousColumns);
    }

    /** Records a created (API/dialog-added) calc col in the user-column layer. */
    private recordCreatedColumn(
        colId: string,
        colDef: ColDef,
        parentGroupId: string | null,
        expressionError?: CalculatedExpressionError
    ): void {
        this.userColumnSvc.setCreatedColumn(colId, pickUserOwnedProperties(colDef), parentGroupId, expressionError);
    }

    private isLiveApplyMode(): boolean {
        return this.getOptions()?.applyMode !== 'deferred';
    }

    private getOptions(): CalculatedColumnsOptions | undefined {
        const calculatedColumns = this.gos.get('calculatedColumns');
        return typeof calculatedColumns === 'object' && calculatedColumns != null ? calculatedColumns : undefined;
    }

    /** Records the user's changes to a `columnDefs`-declared calc col in the user-column layer. Properties
     *  put back to the declared value are dropped, so reverting an edit persists nothing. */
    private setDeclaredColOverride(
        column: AgColumn,
        nextColDef: ColDef,
        expressionError?: CalculatedExpressionError
    ): void {
        const userColumnSvc = this.userColumnSvc;
        const colId = column.colId;
        // The declaration as the developer wrote it: the built column's own definition already has any
        // previous entry merged in, so diffing against it would drop the properties that entry carries.
        const declared = pickUserOwnedProperties(userColumnSvc.getDeclaredDef(colId) ?? {}) as Record<string, any>;
        const next = pickUserOwnedProperties(nextColDef) as Record<string, any>;
        const properties: Record<string, any> = {};
        const nextKeys = Object.keys(next);
        for (let i = 0, len = nextKeys.length; i < len; ++i) {
            const key = nextKeys[i];
            if (next[key] !== declared[key]) {
                properties[key] = next[key];
            }
        }
        const declaredKeys = Object.keys(declared);
        for (let i = 0, len = declaredKeys.length; i < len; ++i) {
            const key = declaredKeys[i];
            if (!(key in next)) {
                properties[key] = undefined; // the update cleared a declared property
            }
        }
        if (Object.keys(properties).length || expressionError) {
            userColumnSvc.setOverride(colId, properties as ColDef, expressionError);
        } else {
            userColumnSvc.clearColumn(colId);
        }
    }

    public beginBuild(ids: ColumnIdAllocator): void {
        const turnedOn = this.turnedOnColumns;
        if (turnedOn !== null) {
            // inside the build, so a column option a `dataTypeMatcher` sets while they merge is applied after it
            this.turnedOnColumns = null;
            const beans = this.beans;
            turnedOn.forEach((entry, colId) => {
                const colDef = _addColumnDefaultAndTypes(beans, entry.colDef, colId);
                if (colDef.calculatedExpression === undefined) {
                    turnedOn.delete(colId);
                } else {
                    entry.colDef = pickUserOwnedProperties(colDef);
                }
            });
            this.knownCalculatedColumns = turnedOn;
        }
        const dynamicColumns = this.dynamicColumns;
        if (dynamicColumns.size === 0 || !this.isEnabled()) {
            return;
        }
        for (const colId of dynamicColumns.keys()) {
            ids.held.set(colId, null);
        }
    }

    public contributeTo(build: ColumnTreeBuild): void {
        const dynamicColumns = this.dynamicColumns;
        // Overrides/removals of `columnDefs`-declared cols are applied by the build from the user-column
        // layer; here we only splice in dynamic (API/dialog-added) cols, so nothing to do without them.
        if (dynamicColumns.size === 0 || !this.isEnabled()) {
            return;
        }
        const userColumnSvc = this.userColumnSvc;

        // Place each dynamic col. `appendColumnToTree(col, anchorId)` positions it in the TREE (inheriting
        // a leaf anchor's group membership); `anchoredToColId` is stamped so order restoration also seats
        // it after the anchor in DISPLAY order — needed for non-leaf anchors (e.g. auto-group col). A
        // missing/removed anchor (or none) falls back to a plain append.
        const source = build.source;
        const buildToken = build.buildToken;
        const newColDefs = build.newColDefs;
        const processColDef = this.getOptions()?.processColDef;
        const colDefProcessor = processColDef ? this.createColDefProcessor(processColDef, build) : null;
        if (colDefProcessor) {
            // Anchors first, so a column added from another reads this build's instance of it.
            const processed = new Set<string>();
            const process = (colId: string): void => {
                const dc = dynamicColumns.get(colId);
                if (dc === undefined || processed.has(colId)) {
                    return;
                }
                processed.add(colId); // before the anchor, so an anchor cycle ends
                const anchorId = dc.anchorColId;
                if (anchorId != null) {
                    process(anchorId);
                }
                this.getOrCreateColumn(dc, colId, buildToken, source, newColDefs, colDefProcessor);
            };
            for (const colId of dynamicColumns.keys()) {
                process(colId);
            }
        }
        dynamicColumns.forEach((dc, colId) => {
            const anchorId = dc.anchorColId;
            const agCol = colDefProcessor
                ? dc.instance! // created by the passes above
                : this.getOrCreateColumn(dc, colId, buildToken, source, newColDefs, null);
            agCol.buildToken = buildToken; // So the post-build sweep keeps the col alive.
            if (anchorId != null && anchorId !== colId && !userColumnSvc.getEntry(anchorId)?.removed) {
                agCol.anchoredToColId = anchorId;
                appendColumnToTree(build, agCol, anchorId);
            } else {
                agCol.anchoredToColId = undefined;
                appendColumnToTree(build, agCol);
            }
        });
    }

    public seatCalculatedCols(
        colsList: AgColumn[],
        colsById: Record<string, AgColumn>,
        keptCols: ReadonlyMap<AgColumn, number> | null
    ): AgColumn[] {
        if (this.dynamicColumns.size === 0) {
            return colsList;
        }
        let followers: Map<AgColumn, AgColumn[]> | null = null;
        let seated: Set<AgColumn> | null = null;
        // Map order is add order, so each source's list ends with its newest follower.
        for (const dc of this.dynamicColumns.values()) {
            const col = dc.instance;
            if (col?.inColsList) {
                if (keptCols === null) {
                    dc.placedByUser = false; // an order from the definitions the column is in resets its move
                }
                if (this.isSeatedBySource(col, colsById, keptCols)) {
                    followers ??= new Map();
                    seated ??= new Set();
                    const rootId = keptCols?.has(col) ? this.rootSourceId(dc) : null;
                    const source = colsById[rootId ?? col.anchoredToColId!] ?? colsById[col.anchoredToColId!];
                    addFollower(followers, source, col, keptCols);
                    seated.add(col);
                }
            }
        }
        if (followers === null || seated === null) {
            return colsList;
        }
        const result: AgColumn[] = [];
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const col = colsList[i];
            if (!seated.has(col)) {
                pushWithFollowers(result, col, followers);
            }
        }
        if (result.length < colsList.length) {
            const pushed = new Set(result);
            for (const col of seated) {
                if (pushed.has(col)) {
                    continue;
                }
                result.push(col); // a source cycle no shown column reaches
            }
        }
        return result;
    }

    /** The source a calculated col's chain of calculated sources starts from. */
    private rootSourceId(dc: DynamicCalculatedColumn | undefined): string | null {
        const dynamicColumns = this.dynamicColumns;
        let anchorId = dc?.anchorColId ?? null;
        for (let steps = dynamicColumns.size; anchorId != null && steps > 0; --steps) {
            const next = dynamicColumns.get(anchorId);
            if (next === undefined) {
                return anchorId;
            }
            anchorId = next.anchorColId ?? null;
        }
        return null; // no source, or a source cycle
    }

    /** Whether only cols sharing its chain's root stand between `cols[index]` and its source or that root. */
    private isAtSeat(cols: readonly AgColumn[], index: number, sourceId: string, rootId: string): boolean {
        const dynamicColumns = this.dynamicColumns;
        for (let i = index - 1; i >= 0; --i) {
            const colId = cols[i].colId;
            if (colId === sourceId || colId === rootId) {
                return true;
            }
            if (this.rootSourceId(dynamicColumns.get(colId)) !== rootId) {
                return false;
            }
        }
        return false;
    }

    public markPlacedByOrder(order: readonly AgColumn[], start: number, end: number): void {
        const dynamicColumns = this.dynamicColumns;
        for (let i = dynamicColumns.size === 0 ? end : start; i < end; ++i) {
            const col = order[i];
            const dc = col.isCalculatedCol ? dynamicColumns.get(col.colId) : undefined;
            const rootId = dc?.instance === col ? this.rootSourceId(dc) : null;
            if (rootId != null) {
                dc!.placedByUser = !this.isAtSeat(order, i, dc!.anchorColId!, rootId);
            }
        }
    }

    /** A col with a shown source moves; with `keptCols`, one not user-placed if it or a chain source lost its place. */
    private isSeatedBySource(
        col: AgColumn,
        colsById: Record<string, AgColumn>,
        keptCols: ReadonlyMap<AgColumn, number> | null
    ): boolean {
        const dynamicColumns = this.dynamicColumns;
        let current = col;
        for (let steps = dynamicColumns.size; steps > 0; --steps) {
            // a col kept ahead of a placed source of its chain still follows the chain's root
            if (
                keptCols !== null &&
                dynamicColumns.get(current.colId)?.placedByUser &&
                (current === col || keptCols.get(col)! > keptCols.get(current)!)
            ) {
                return false;
            }
            const anchorId = current.anchoredToColId;
            const anchor = anchorId == null ? undefined : colsById[anchorId];
            if (anchor === undefined || anchor === current || !anchor.inColsList) {
                return false;
            }
            if (keptCols === null || !keptCols.has(current) || !keptCols.has(anchor)) {
                return true;
            }
            if (!anchor.isCalculatedCol) {
                return false;
            }
            current = anchor;
        }
        return false;
    }

    /** `colsById` is seeded after the build, so `processColDef` resolves columns against the ones built so far, the
     *  auto group columns the grouping declared before the callbacks run keeps, and the dynamic columns spliced in. */
    private createColDefProcessor(processColDef: ProcessColDef, build: ColumnTreeBuild): ColDefProcessor {
        const { colModel, autoColSvc } = this.beans;
        const previousCols = colModel.colsById;
        const dynamicColumns = this.dynamicColumns;
        // none to keep without a group column: the previous build's are the only ones a lookup can return
        const rowGroupCols = autoColSvc?.columns.length ? this.getRowGroupColsOf(build) : null;
        const getCol = (colId: string): AgColumn | null => {
            const col = getBuildColumn(build, colId);
            if (col) {
                return col;
            }
            const autoCol = previousCols[colId];
            if (rowGroupCols !== null && autoCol?.colKind === 'auto-group') {
                return autoColSvc!.isColKept(autoCol, rowGroupCols) ? autoCol : null;
            }
            return dynamicColumns.get(colId)?.instance ?? null;
        };
        return {
            processColDef,
            hasCol: (colId) => getCol(colId) !== null || dynamicColumns.has(colId),
            getCol,
        };
    }

    /** Cols `build` groups as declared before its callbacks run: its own, the hierarchy's, and the calculated ones by
     *  their previous instances. */
    private getRowGroupColsOf(build: ColumnTreeBuild): Set<AgColumn> {
        const { rowGroupColsSvc, colModel, groupHierarchyColSvc } = this.beans;
        const rowGroupCols = new Set<AgColumn>();
        if (!rowGroupColsSvc) {
            return rowGroupCols;
        }
        const newColDefs = build.newColDefs;
        addRowGroupCols(rowGroupCols, rowGroupColsSvc, colModel, build.columns, newColDefs);
        addRowGroupCols(rowGroupCols, rowGroupColsSvc, colModel, groupHierarchyColSvc?.columns, newColDefs);
        for (const dc of this.dynamicColumns.values()) {
            const col = dc.instance;
            if (col && rowGroupColsSvc.willExtractCol(col, colModel.isColNew(col), newColDefs)) {
                rowGroupCols.add(col);
            }
        }
        return rowGroupCols;
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
        if (!this.dynamicColumns.size) {
            return false;
        }
        // Owned AgColumns are destroyed by the rebuild that always follows (colModel owns tree lifetime).
        // `resetColumnState` parks added cols for a later `applyColumnState`, dropping the about-to-be-swept instance ref.
        if (preserveCreatedColumns) {
            this.dynamicColumns.forEach((dynamicColumn, colId) => {
                dynamicColumn.parentGroupId = getParentGroupId(dynamicColumn.instance);
                dynamicColumn.parkedExpressionError = this.userColumnSvc.getEntry(colId)?.calculatedExpressionError;
                dynamicColumn.placedByUser = false;
                dynamicColumn.instance = null;
                this.inactiveDynamicColumns.set(colId, dynamicColumn);
            });
        }
        this.dynamicColumns.clear();
        return true;
    }

    /** Takes ownership of restored user-column entries that describe calculated columns, so the dialog,
     *  removal and event paths treat them exactly like ones added in this session. Entries the layer no
     *  longer holds take their columns with them. */
    public adoptUserColumns(): boolean {
        if (!this.isEnabled()) {
            return false;
        }
        const userColumnSvc = this.userColumnSvc;
        const dynamicColumns = this.dynamicColumns;
        // An entry of any other kind (a tombstone, an override, a created entry without an expression) names
        // the colId but does not define that column, so it cannot keep the column alive.
        const describesCalcCol = (colId: string): boolean => {
            const entry = userColumnSvc.getEntry(colId);
            return entry?.created === true && entry.properties?.calculatedExpression != null;
        };
        const deleteStaleColumns = (columns: Map<string, DynamicCalculatedColumn>): boolean => {
            let removed = false;
            columns.forEach((_dc, colId) => {
                if (!describesCalcCol(colId)) {
                    columns.delete(colId); // safe: Map iteration tolerates deleting the current key
                    removed = true;
                }
            });
            return removed;
        };
        let changed = deleteStaleColumns(dynamicColumns);
        // A column parked by `resetColumnState` and absent from the state is gone for good, so a later
        // `applyColumnState` cannot resurrect it.
        deleteStaleColumns(this.inactiveDynamicColumns);

        userColumnSvc.forEachEntry((entry, colId) => {
            const properties = entry.properties;
            if (!entry.created || properties?.calculatedExpression == null) {
                return;
            }
            const colDef = toCalculatedColDef({ ...properties, calculatedColumnReadOnly: false }, colId);
            const existing = dynamicColumns.get(colId);
            if (existing) {
                if (!_mergedEqual(colDef, existing.colDef)) {
                    existing.colDef = colDef;
                    changed = true;
                }
                // Group placement is part of what an entry describes, so a column already held must be
                // re-seated when the entry names a different group. Only decidable once built; before that
                // `anchorColId` was itself derived from the entry, and re-deriving it from a null instance
                // would read as a move to the top level.
                const instance = existing.instance;
                if (instance !== null && (entry.parentGroupId ?? null) !== getParentGroupId(instance)) {
                    existing.anchorColId = this.findAnchorInGroup(entry.parentGroupId);
                    changed = true;
                }
                return;
            }
            // `columnDefs` owns the colId, so the user column cannot take it without clobbering a real
            // column — including one currently hidden by a tombstone, which is not in the built columns.
            if (userColumnSvc.isDeclared(colId)) {
                _warnOnce(`userColumns: colId '${colId}' is declared in columnDefs; skipping.`);
                return;
            }
            this.inactiveDynamicColumns.delete(colId);
            dynamicColumns.set(colId, {
                colDef,
                anchorColId: this.findAnchorInGroup(entry.parentGroupId),
                instance: null,
            });
            changed = true;
        });
        return changed;
    }

    /** A leaf in `groupId` to append a restored column after, so it is built into that group. Only columns
     *  that survive the coming rebuild qualify: `colDefList` still holds the ones this restore dropped, and
     *  anchoring to one of those would strand the new column at the top level. */
    private findAnchorInGroup(groupId: string | null | undefined): string | null {
        if (groupId == null) {
            return null;
        }
        const { colModel } = this.beans;
        const userColumnSvc = this.userColumnSvc;
        const cols = colModel.colDefList;
        for (let i = cols.length - 1; i >= 0; --i) {
            const col = cols[i];
            if (getParentGroupId(col) !== groupId) {
                continue;
            }
            const colId = col.colId;
            const entry = userColumnSvc.getEntry(colId);
            if (entry?.removed) {
                continue;
            }
            if (userColumnSvc.isDeclared(colId) || this.dynamicColumns.has(colId)) {
                return colId;
            }
        }
        return null;
    }

    public restoreDynamicColumnDefs(state: ColumnState[]): boolean {
        if (!this.isEnabled()) {
            return false;
        }
        const inactive = this.inactiveDynamicColumns;
        if (!inactive.size) {
            return false;
        }
        const stateColIds = new Set<string>();
        for (let i = 0, len = state.length; i < len; ++i) {
            stateColIds.add(state[i].colId);
        }
        let restored = false;
        // In parked order, not the state's: the map's order is the add order the placement reads.
        for (const [colId, dynamicColumn] of inactive) {
            if (!stateColIds.has(colId)) {
                continue;
            }
            inactive.delete(colId);
            if (!this.dynamicColumns.has(colId)) {
                this.dynamicColumns.set(colId, dynamicColumn);
                this.recordCreatedColumn(
                    colId,
                    dynamicColumn.colDef,
                    dynamicColumn.parentGroupId ?? null,
                    dynamicColumn.parkedExpressionError
                );
                dynamicColumn.parkedExpressionError = undefined;
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
        newColDefs: boolean,
        colDefProcessor: ColDefProcessor | null
    ): AgColumn {
        const beans = this.beans;
        const colDef = colDefProcessor ? this.processUserColDef(colDefProcessor, dc, colId) : dc.colDef;
        dc.resolvedAuthoredColDef = colDefProcessor ? _addColumnDefaultAndTypes(beans, dc.colDef, colId) : undefined;
        const existing = dc.instance;
        if (existing !== null) {
            // Reuse the owned instance (always alive: contributed/stamped every refresh, nulled when
            // parked/removed). Restamp + refresh colDef in case expression/cellDataType changed.
            existing.buildToken = buildToken;
            existing.reapplyColDef(colDef, source, newColDefs);
            return existing;
        }
        const agCol = _createUserColumn(beans, colDef, colId, true, buildToken);
        if (dc.initialPinned !== undefined && colDef.pinned === undefined && colDef.initialPinned === undefined) {
            beans.pinnedCols?.setColPinned(agCol, dc.initialPinned, source);
        }
        dc.initialPinned = undefined;
        dc.instance = agCol;
        return agCol;
    }

    /** Applies `calculatedColumns.processColDef` to a dialog-created column's stored colDef. The result becomes the
     *  column's own colDef (`userProvidedColDef`) on purpose, so data type and show-values-as reads see it; the
     *  stored colDef is left untouched so the dialog and grid state only ever see the user's values. */
    private processUserColDef(processor: ColDefProcessor, dc: DynamicCalculatedColumn, colId: string): ColDef {
        const storedColDef = dc.colDef;
        const anchorId = dc.anchorColId;
        const expression = storedColDef.calculatedExpression ?? '';
        const error = this.userColumnSvc.getEntry(colId)?.calculatedExpressionError;
        const result = processor.processColDef(
            _addGridCommonParams(this.gos, {
                colDef: { ...storedColDef },
                sourceColumn: anchorId == null ? null : processor.getCol(anchorId),
                expressionValidation: this.getExpressionValidation(
                    expression,
                    error?.expression === expression ? error : undefined,
                    processor.hasCol
                ),
            })
        );
        if (result == null) {
            return storedColDef;
        }
        const ignored = getIgnoredCalculatedColDefProperties(result, colId);
        if (ignored.length) {
            this.warn(336, { colId, properties: ignored });
        }
        // An omitted expression would silently stop the column being calculated, so keep the user's.
        const colDef = toCalculatedColDef(
            { ...result, calculatedExpression: result.calculatedExpression ?? storedColDef.calculatedExpression },
            colId
        );
        // only an explicit callback value can lock a created column, after its initial live dialog closes
        if (this.liveCreationColumnIds.has(colId) || colDef.calculatedColumnReadOnly == null) {
            colDef.calculatedColumnReadOnly = false;
        }
        return colDef;
    }

    private createUniqueColId(): string {
        const { colModel } = this.beans;
        const userColumnSvc = this.userColumnSvc;
        const parked = this.inactiveDynamicColumns;
        // Resume above the highest index handed out: a freed colId is silently satisfied by whatever outlives
        // the column and names it by id — a saved sort, or another expression (they store colIds, not headers).
        let index = this.lastCalculatedColIndex;
        let colId: string;
        do {
            colId = `calculated_${++index}`;
            // The layer check covers tombstoned declared columns, which are absent from the built columns
            // but whose entry a new column with the same colId would overwrite.
        } while (
            colModel.getCol(colId) !== undefined ||
            colModel.getColGroup(colId) !== undefined || // column and group ids are one namespace
            parked.has(colId) ||
            userColumnSvc.getEntry(colId) !== undefined
        );
        this.lastCalculatedColIndex = index;
        return colId;
    }

    private getUpdatedCalculatedColDef(column: AgColumn, colDefUpdate: CalculatedColumnUpdate): ColDef {
        const colId = column.colId;
        const dynamicColumn = this.dynamicColumns.get(colId);
        const userColDef = column.getUserProvidedColDef();
        // A declared col the user already edited resolves against its entry merged over the declaration.
        const userColumnSvc = this.userColumnSvc;
        const override = userColumnSvc.getEntry(colId)?.properties;
        const declaredDef = userColumnSvc.getDeclaredDef(colId) ?? userColDef;
        const declaredColDef = override ? { ...declaredDef, ...override } : declaredDef;
        const baseColDef = dynamicColumn?.colDef ?? declaredColDef ?? column.colDef;
        const safeUpdate: ColDef = { ...colDefUpdate };
        delete safeUpdate.colId;

        const nextColDef = {
            ...clearStaleDataTypeProperties(baseColDef, userColDef, safeUpdate),
            ...safeUpdate,
        };
        nextColDef.calculatedExpression ??= baseColDef.calculatedExpression;

        return toCalculatedColDef(nextColDef, colId);
    }

    private createDialogContext(
        colId: string,
        liveApply: boolean,
        sourceColumn: AgColumn | null
    ): CalculatedColumnDialogContext {
        const beans = this.beans;
        const calculatedColumn = beans.colModel.getCol(colId) ?? null;
        const isColumnReferenceable = this.getOptions()?.isColumnReferenceable;
        const originalError = calculatedColumn && this.getExpressionError(calculatedColumn);
        const mapper = createCalculatedColumnReferenceMapper(beans, beans.colModel.colDefList, colId, {
            originalExpression: calculatedColumn
                ? (this.getResolvedAuthoredColDef(calculatedColumn).calculatedExpression ?? '')
                : undefined,
            originalError:
                originalError?.reason === 'restrictedReference'
                    ? { type: 'restricted', reference: originalError.reference }
                    : undefined,
            isColumnReferenceable: isColumnReferenceable
                ? (column) =>
                      isColumnReferenceable(
                          _addGridCommonParams(this.gos, {
                              column,
                              colDef: column.colDef,
                              calculatedColumn,
                              sourceColumn,
                          })
                      )
                : undefined,
        });
        return {
            colId,
            sourceColumn,
            liveApply,
            mapper,
            initialHeaderName: calculatedColumn ? this.getDraftHeaderName(calculatedColumn) : undefined,
        };
    }

    private validateDialogDraft(
        draft: CalculatedColumnDraft,
        context: CalculatedColumnDialogContext,
        revalidate = false
    ): DialogValidation {
        const { colId, mapper, liveApply, sourceColumn } = context;
        const { expression, error } = mapper.toInternalExpression(
            draft.calculatedExpression,
            revalidate ? 'revalidate' : undefined
        );
        const restricted = error?.type === 'restricted';
        const column = this.beans.colModel.getCol(colId) ?? null;
        const getValidationErrors = this.getOptions()?.getValidationErrors;
        const savedError = column && this.getExpressionError(column);
        const savedCustomError =
            !revalidate && savedError?.reason === 'customValidation' && savedError.expression === expression
                ? savedError
                : undefined;
        const savedMessages = savedCustomError?.messages ?? null;
        // fast path: without a callback, live mode can only surface the saved messages below
        if (liveApply && !getValidationErrors && !restricted) {
            return {
                expression,
                errors: savedMessages ? { calculatedExpression: savedMessages } : null,
                expressionError: savedCustomError,
            };
        }
        let internalError: string | null = null;
        if (error) {
            internalError = translateCalculatedColumnReferenceError(error, this.getLocaleTextFunc());
        } else if (!_isStringLargerThan(expression, 0, true)) {
            if (!liveApply) {
                internalError = this.getLocaleTextFunc()('calculatedColumnExpressionEmpty', 'Enter an expression');
            }
        } else {
            internalError =
                this.inspectDialogExpression(
                    draft.calculatedExpression,
                    mapper,
                    revalidate ? 'revalidate' : 'diagnostics'
                ).diagnostic?.message ?? null;
        }
        const internalErrors = this.normaliseValidationErrors({
            headerName:
                !liveApply && !draft.headerName.trim()
                    ? [this.getLocaleTextFunc()('calculatedColumnTitleEmpty', 'Enter a title')]
                    : undefined,
            calculatedExpression: internalError ? [internalError] : undefined,
        });

        // saved errors survive state restoration; application callbacks are never run during restore
        let errors: CalculatedColumnValidationErrors | null = {
            ...internalErrors,
            calculatedExpression: internalErrors?.calculatedExpression ?? savedMessages ?? undefined,
        };
        if (getValidationErrors) {
            errors = getValidationErrors(
                _addGridCommonParams(this.gos, {
                    colDef: {
                        ...(column && this.getResolvedAuthoredColDef(column)),
                        ...this.toColDef(draft),
                        calculatedExpression: expression,
                    },
                    displayExpression: draft.calculatedExpression,
                    referencedColumns: getCalculatedColumnReferences(this.beans, expression),
                    internalErrors,
                    column,
                    sourceColumn,
                })
            );
        }
        errors = this.normaliseValidationErrors(errors);
        if (restricted && !errors?.calculatedExpression) {
            errors = { ...errors, calculatedExpression: [internalError!] };
        }
        const messages = errors?.calculatedExpression;
        return {
            expression,
            errors,
            expressionError: restricted
                ? { expression, reason: 'restrictedReference', reference: error.reference }
                : messages && (getValidationErrors || savedCustomError)
                  ? { expression, reason: 'customValidation', messages }
                  : undefined,
        };
    }

    private normaliseValidationErrors(
        errors: CalculatedColumnValidationErrors | null
    ): CalculatedColumnValidationErrors | null {
        const result: CalculatedColumnValidationErrors = {};
        for (const field of ['headerName', 'cellDataType', 'calculatedExpression'] as const) {
            const messages = errors?.[field];
            if (messages?.length) {
                result[field] = [...messages];
            }
        }
        return Object.keys(result).length ? result : null;
    }

    private inspectDialogExpression(
        expression: string,
        mapper: CalculatedColumnReferenceMapper,
        mode: 'diagnostics' | 'revalidate' = 'diagnostics'
    ): CalculatedColumnExpressionPresentation {
        const { tokens, references, error, range } = inspectFormulaExpression(this.beans, expression);
        const referenceError = mapper.toInternalExpression(expression, mode, references).error;
        if (referenceError) {
            return {
                tokens,
                diagnostic: {
                    message: translateCalculatedColumnReferenceError(referenceError, this.getLocaleTextFunc()),
                    range: referenceError.range,
                },
            };
        }
        return {
            tokens,
            diagnostic: error ? { message: error.getTranslatedMessage(this.getLocaleTextFunc()), range } : undefined,
        };
    }

    private showDialog(
        draft: CalculatedColumnDraft,
        onApply: (draft: CalculatedColumnDraft) => void,
        context: CalculatedColumnDialogContext,
        columnToHighlight?: AgColumn | null,
        focusDialog = true,
        restoreFocusParams?: CalculatedColumnDialogRestoreFocusParams,
        restoreFocusColumn?: AgColumn | null
    ): void {
        const { colId, liveApply } = context;
        const openDialogState = this.openDialogsByColId.get(colId);
        if (openDialogState) {
            this.beans.menuSvc?.hidePopupMenu();
            if (focusDialog) {
                openDialogState.dialog.getGui().focus({ preventScroll: true });
            }
            return;
        }

        const state: { close?: () => void; resolved: boolean } = { resolved: false };
        const readOnly = !!columnToHighlight?.colDef.calculatedColumnReadOnly;
        const handleValidate = (nextDraft: CalculatedColumnDraft): CalculatedColumnValidationErrors | null => {
            const result = this.validateDialogDraft(nextDraft, context);
            if (liveApply && !readOnly && columnToHighlight) {
                const savedError = this.getExpressionError(columnToHighlight);
                // reconcile both new and cleared rejections when reopening
                if (!_mergedEqual(savedError, result.expressionError)) {
                    this.scheduleLiveApplyUpdate(nextDraft, context, result);
                }
            }
            return result.errors;
        };
        const handleApply = (nextDraft: CalculatedColumnDraft): CalculatedColumnValidationErrors | null => {
            if (state.resolved) {
                return null;
            }
            const result = this.validateDialogDraft(nextDraft, context);
            if (result.errors) {
                return result.errors;
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
            ? (nextDraft: CalculatedColumnDraft) => this.scheduleLiveApplyUpdate(nextDraft, context)
            : undefined;
        const dataTypeOptions = this.getDataTypeOptions(draft.cellDataType);

        const form = this.createManagedBean(
            new CalculatedColumnForm(
                draft,
                dataTypeOptions,
                this.getExpressionPickers(),
                () => context.mapper.suggestions,
                () => this.getFunctionSuggestions(),
                (expression, errors) => {
                    const presentation = this.inspectDialogExpression(expression, context.mapper);
                    // live diagnostics do not block updates; custom feedback still controls which errors are shown
                    const showLiveDiagnostic =
                        liveApply && !!expression.trim() && !this.getOptions()?.getValidationErrors && !errors?.length;
                    if (
                        presentation.diagnostic &&
                        !showLiveDiagnostic &&
                        !errors?.includes(presentation.diagnostic.message)
                    ) {
                        presentation.diagnostic = undefined;
                    }
                    return presentation;
                },
                handleValidate,
                handleApply,
                handleCancel,
                liveApply,
                handleDraftChange,
                readOnly
            )
        );
        const dialog = this.createManagedBean(
            new Dialog({
                title: readOnly
                    ? this.getLocaleTextFunc()('calculatedColumnView', 'View Calculated Column')
                    : this.getLocaleTextFunc()('calculatedColumn', 'Calculated Column'),
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
                    const column = restoreFocusParams
                        ? restoreFocusColumn
                        : (this.beans.colModel.getCol(colId) ?? restoreFocusColumn);
                    if (focusDialog && column) {
                        this.restoreFocusOnDialogClose(column, form.getGui(), event, restoreFocusParams);
                    }
                },
            })
        );
        state.close = () => dialog.close();
        this.openDialogsByColId.set(colId, {
            dialog,
            highlight: columnToHighlight != null,
            readOnly,
            refreshValidation: () => this.refreshDialogValidation(form, context),
        });
        this.refreshCalculatedColumnHighlight(columnToHighlight ?? null);
        if (focusDialog) {
            const focusableElements = _findFocusableElements(form.getGui());
            (focusableElements[0] ?? dialog.getGui()).focus({ preventScroll: true });
        }
        const destroyDialogMouseListeners = _addManagedElementListeners(this, dialog.getGui(), {
            mousedown: () => form.hideSuggestions(),
        });
        dialog.addDestroyFunc(() => {
            for (let i = 0, len = destroyDialogMouseListeners.length; i < len; ++i) {
                destroyDialogMouseListeners[i]();
            }
        });
        dialog.addDestroyFunc(() => {
            if (liveApply && !readOnly && this.isAlive() && !this.beans.context.isDestroyed()) {
                this.flushLiveApplyUpdate(colId);
            } else {
                this.cancelLiveApplyUpdate(colId);
            }
            if (this.openDialogsByColId.get(colId)?.dialog === dialog) {
                this.openDialogsByColId.delete(colId);
                this.refreshCalculatedColumnHighlight(columnToHighlight ?? null);
            }
            this.finishLiveCreation(colId);
        });
        dialog.addEventListener('destroyed', () => this.destroyBean(form));
    }

    private refreshDialogValidation(form: CalculatedColumnForm, context: CalculatedColumnDialogContext): void {
        const { colId, liveApply, sourceColumn } = context;
        context.mapper = this.createDialogContext(colId, liveApply, sourceColumn).mapper;
        form.refreshValidation((draft) => {
            const result = this.validateDialogDraft(draft, context, true);
            const pending = this.pendingLiveApplyUpdatesByColId.get(colId);
            if (pending) {
                // keep the draft and its deadline; only replace the cached validation and reference conversion
                pending.colDef = this.getLiveApplyColDef(draft, result, context.initialHeaderName);
                pending.expressionError = result.expressionError;
            }
            return result.errors;
        });
    }

    private restoreFocusOnDialogClose(
        column: AgColumn,
        eComp: HTMLElement,
        event: MouseEvent | TouchEvent | KeyboardEvent | undefined,
        params: CalculatedColumnDialogRestoreFocusParams | undefined
    ): void {
        if (!this.isAlive() || this.beans.context.isDestroyed()) {
            return;
        }
        const eventSource = params?.eventSource;
        if (!eventSource) {
            if (column.isAlive() && _isNothingFocused(this.beans)) {
                const headerPosition = this.beans.headerNavigation?.getHeaderPositionForColumn(column, false);
                if (headerPosition) {
                    this.beans.focusSvc.focusHeaderPosition({ headerPosition });
                }
            }
            return;
        }

        const restoreFocusParams: MenuRestoreFocusParams = {
            column,
            columnIndex: column.allColsIndex,
            headerPosition: params.headerPosition,
            getEventSource: () => eventSource,
        };

        (this.beans.menuUtils as MenuUtils | undefined)?.restoreFocusOnClose(restoreFocusParams, eComp, event, true);
        if (_isNothingFocused(this.beans) && params.headerPosition) {
            this.beans.focusSvc.focusHeaderPosition({ headerPosition: params.headerPosition });
        }
    }

    private scheduleLiveApplyUpdate(
        draft: CalculatedColumnDraft,
        context: CalculatedColumnDialogContext,
        validation = this.validateDialogDraft(draft, context)
    ): CalculatedColumnValidationErrors | null {
        const colId = context.colId;
        const { errors, expressionError } = validation;
        const update = this.getLiveApplyColDef(draft, validation, context.initialHeaderName);
        const configuredDelay = this.getOptions()?.applyDebounce ?? 0;
        const delay = Number.isInteger(configuredDelay) && configuredDelay >= 0 ? configuredDelay : 0;
        const previous = this.pendingLiveApplyUpdatesByColId.get(colId);
        if (delay === 0 && previous && previous.timeout === undefined) {
            previous.colDef = update;
            previous.expressionError = expressionError;
            return errors;
        }

        this.cancelLiveApplyUpdate(colId);
        const pending: PendingLiveApplyUpdate = { colDef: update, expressionError };
        this.pendingLiveApplyUpdatesByColId.set(colId, pending);
        const apply = () => {
            // a cancelled frame must not flush an edit from a later dialog or schedule
            if (this.isAlive() && this.pendingLiveApplyUpdatesByColId.get(colId) === pending) {
                this.flushLiveApplyUpdate(colId);
            }
        };
        if (delay > 0) {
            pending.timeout = window.setTimeout(apply, delay);
        } else {
            _requestAnimationFrame(this.beans, apply);
        }
        return errors;
    }

    private getLiveApplyColDef(
        draft: CalculatedColumnDraft,
        validation: DialogValidation,
        initialHeaderName: string | undefined
    ): CalculatedColumnUpdate {
        const { colId: _, ...update } = this.toColDef({ ...draft, calculatedExpression: validation.expression });
        // validate the raw title, but preserve the existing live-mode fallback for an accepted empty title
        update.headerName ||= initialHeaderName;
        // rejected drafts stay in the form, not in the pending or committed column definition
        if (validation.errors?.headerName) {
            delete update.headerName;
        }
        if (validation.errors?.cellDataType) {
            delete update.cellDataType;
        }
        return update;
    }

    private flushLiveApplyUpdate(colId: string): void {
        const pending = this.pendingLiveApplyUpdatesByColId.get(colId);
        if (pending === undefined) {
            return;
        }

        this.cancelLiveApplyUpdate(colId);
        this.updateCalculatedColumn(colId, pending.colDef, pending.expressionError);
    }

    private cancelLiveApplyUpdate(colId: string): void {
        const pending = this.pendingLiveApplyUpdatesByColId.get(colId);
        if (pending?.timeout !== undefined) {
            window.clearTimeout(pending.timeout);
        }
        this.pendingLiveApplyUpdatesByColId.delete(colId);
    }

    private closeCalculatedColumnDialog(colId: string): void {
        this.liveCreationColumnIds.delete(colId);
        const openDialog = this.openDialogsByColId.get(colId);
        if (openDialog === undefined) {
            return;
        }

        this.cancelLiveApplyUpdate(colId);
        openDialog.dialog.close();
    }

    private finishLiveCreation(colId: string): void {
        if (
            this.liveCreationColumnIds.delete(colId) &&
            this.isAlive() &&
            !this.beans.context.isDestroyed() &&
            this.beans.colModel.getCol(colId)?.isCalculatedCol &&
            this.getOptions()?.processColDef
        ) {
            this.rebuildColsAndValidate('calculatedColumn');
        }
    }

    private getDefaultDraft(): Omit<CalculatedColumnDraft, 'colId' | 'headerName'> {
        const firstDataType = this.getDataTypeOptions()[0]?.value ?? DEFAULT_DRAFT.cellDataType;
        return {
            ...DEFAULT_DRAFT,
            cellDataType: firstDataType,
        };
    }

    private getDataTypeOptions(currentDataType?: ColDef['cellDataType']): CalculatedColumnDataTypeOption[] {
        const configuredDataTypes = this.getOptions()?.dataTypes;
        const dataTypes = configuredDataTypes
            ? this.getValidConfiguredDataTypes(configuredDataTypes)
            : [...DEFAULT_CALCULATED_COLUMN_DATA_TYPES];

        if (typeof currentDataType === 'string' && dataTypes.indexOf(currentDataType) < 0) {
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
        const colDef = this.getResolvedAuthoredColDef(column);
        return {
            colId: column.colId,
            headerName: this.getDraftHeaderName(column),
            cellDataType: colDef.cellDataType,
            calculatedExpression: mapper.toDisplayExpression(colDef.calculatedExpression ?? ''),
        };
    }

    /** The authored title: a `headerValueGetter` or `processColDef` name shown here would be saved back as the title. */
    private getDraftHeaderName(column: AgColumn): string {
        return column.headerNameOverride ?? this.getResolvedAuthoredColDef(column).headerName ?? column.colId;
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

    private getExpressionValidationState(
        expression: string,
        hasCol?: (colId: string) => boolean
    ): CalculatedColumnValidationState {
        if (!_isStringLargerThan(expression, 0, true)) {
            return 'valid';
        }
        if (this.getInvalidColumnReference(expression, hasCol) != null) {
            return 'unknownReference';
        }
        return this.getFormulaExpressionError(expression) == null ? 'valid' : 'invalidExpression';
    }

    private getExpressionValidation(
        expression: string,
        error?: CalculatedExpressionError,
        hasCol?: (colId: string) => boolean
    ): CalculatedColumnExpressionValidation {
        if (error) {
            return { valid: false, reason: error.reason };
        }
        const state = this.getExpressionValidationState(expression, hasCol);
        return state === 'valid' ? { valid: true } : { valid: false, reason: state };
    }

    /** Dialog/state rebuilds silently update the baseline so later declarative loads do not replay their changes. */
    public onColumnsLoaded(source: ColumnEventType, silent: boolean): void {
        const previousColumns = this.knownCalculatedColumns;
        const nextColumns = new Map<string, KnownCalculatedColumn>();
        // nothing while the option is off, nor in a build it was turned on during: the one staged behind it tells
        const shouldDispatch =
            this.lifecycleInitialised && !silent && this.isEnabled() && this.turnedOnColumns === null;
        const dynamicColumns = this.dynamicColumns;

        const cols = this.beans.colModel.colDefList;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const column = cols[i];
            if (column.isCalculatedCol) {
                nextColumns.set(column.colId, {
                    column,
                    colDef: pickUserOwnedProperties(this.getResolvedAuthoredColDef(column)),
                    validationState: this.getExpressionValidationState(column.colDef.calculatedExpression ?? ''),
                });
            }
        }
        // establish the baseline before dispatch, including silent state-restoration rebuilds.
        this.knownCalculatedColumns = nextColumns;
        this.lifecycleInitialised = true;

        nextColumns.forEach(({ column, colDef }, colId) => {
            const expression = colDef.calculatedExpression ?? '';
            const openDialog = this.openDialogsByColId.get(colId);
            if (openDialog && openDialog.readOnly !== !!column.colDef.calculatedColumnReadOnly) {
                this.closeCalculatedColumnDialog(colId);
            }
            if (!shouldDispatch) {
                return;
            }

            const previousColumn = previousColumns.get(colId);
            if (previousColumn != null) {
                this.dispatchChangedEvents(column, previousColumn.colDef, colDef, source);
            } else if (!dynamicColumns.has(colId)) {
                // one the user created is told by the call creating it: here the option turned it back on
                this.dispatchCreatedOrRemovedEvent(
                    'calculatedColumnCreated',
                    this.getEventCommonParams(column, expression, source)
                );
            }
        });

        previousColumns.forEach((previousColumn, colId) => {
            if (nextColumns.has(colId)) {
                return;
            }
            // The column is gone, so a dialog editing it has nothing left to edit — regardless of whether
            // it was the user, a `columnDefs` change or a state restore that took it away.
            this.closeCalculatedColumnDialog(colId);
            if (shouldDispatch) {
                this.dispatchCreatedOrRemovedEvent(
                    'calculatedColumnRemoved',
                    this.getEventCommonParams(
                        previousColumn.column,
                        previousColumn.colDef.calculatedExpression ?? '',
                        source
                    )
                );
            }
        });

        if (shouldDispatch) {
            this.dispatchValidationChanges(source, previousColumns);
        }
    }

    private dispatchChangedEvents(
        column: AgColumn,
        oldColDef: ColDef,
        colDef: ColDef,
        source: ColumnEventType,
        oldExpressionValidation?: CalculatedColumnExpressionValidation
    ): void {
        const changes = getCalculatedColumnChanges(oldColDef, colDef);
        if (!changes && !oldExpressionValidation) {
            return;
        }
        const expressionValidation = this.getExpressionValidation(
            colDef.calculatedExpression ?? '',
            this.getExpressionError(column)
        );
        if (!changes && _mergedEqual(oldExpressionValidation, expressionValidation)) {
            return;
        }
        const commonParams = this.getEventCommonParams(column, colDef.calculatedExpression ?? '', source);
        this.eventSvc.dispatchEvent({
            type: 'calculatedColumnChanged',
            ...commonParams,
            changes: changes ?? {},
            expressionValidation,
        });
        if (changes?.calculatedExpression) {
            this.dispatchExpressionChangedEvent(commonParams, oldColDef.calculatedExpression ?? '');
        }
    }

    /** Records each declared column the user did not remove, as authored and valid, for the next build to resolve. */
    private recordColumnsTurnedOn(): void {
        const userColumnSvc = this.userColumnSvc;
        const known = new Map<string, KnownCalculatedColumn>();
        const cols = this.beans.colModel.colDefList;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const column = cols[i];
            const declared = column.userProvidedColDef;
            // the user's change of it, which the option applies again; null for one the user removed
            const override = declared ? userColumnSvc.overrideFor(declared) : undefined;
            if (override !== null) {
                const colDef = override ?? declared ?? column.colDef;
                known.set(column.colId, { column, colDef, validationState: 'valid' });
            }
        }
        this.turnedOnColumns = known;
    }

    public rebuildColsAndValidate(source: ColumnEventType): void {
        const previousColumns = this.knownCalculatedColumns;
        const turnedOn = this.turnedOnColumns;
        this.turnedOnColumns = null; // a silent rebuild compares no definition with them
        this.beans.colModel.rebuildCols(source);
        if (this.knownCalculatedColumns === previousColumns) {
            this.turnedOnColumns = turnedOn; // staged behind a build in flight, or no columns yet: kept for that build
        }
        this.dispatchValidationChanges(source, previousColumns);
    }

    private dispatchValidationChanges(
        source: ColumnEventType,
        previousColumns: ReadonlyMap<string, KnownCalculatedColumn>
    ): void {
        this.knownCalculatedColumns.forEach(({ column, validationState }, colId) => {
            if ((previousColumns.get(colId)?.validationState ?? 'valid') === validationState) {
                return;
            }
            const valid = validationState === 'valid';
            this.dispatchValidationStateChangedEvent(
                this.getEventCommonParams(column, column.colDef.calculatedExpression ?? '', source),
                valid,
                valid ? undefined : validationState
            );
        });
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
}

const addRowGroupCols = (
    rowGroupCols: Set<AgColumn>,
    rowGroupColsSvc: IRowGroupColsService,
    colModel: ColumnModel,
    cols: AgColumn[] | undefined,
    newColDefs: boolean
): void => {
    if (!cols) {
        return;
    }
    for (let i = 0, len = cols.length; i < len; ++i) {
        const col = cols[i];
        if (rowGroupColsSvc.willExtractCol(col, colModel.isColNew(col), newColDefs)) {
            rowGroupCols.add(col);
        }
    }
};

/** Lists `col` after `source`; kept cols in their kept order, before the new ones, as the list is pushed in reverse. */
const addFollower = (
    followers: Map<AgColumn, AgColumn[]>,
    source: AgColumn,
    col: AgColumn,
    keptCols: ReadonlyMap<AgColumn, number> | null
): void => {
    let cols = followers.get(source);
    if (cols === undefined) {
        cols = [];
        followers.set(source, cols);
    }
    const keptAt = keptCols?.get(col);
    if (keptCols === null || keptAt === undefined) {
        cols.push(col);
        return;
    }
    let at = cols.length;
    while (at > 0 && (keptCols.get(cols[at - 1]) ?? -1) < keptAt) {
        --at;
    }
    cols.splice(at, 0, col);
};

/** Pushes `col`, then each col seated after it, newest first, each followed by its own. */
const pushWithFollowers = (result: AgColumn[], col: AgColumn, followers: Map<AgColumn, AgColumn[]>): void => {
    result.push(col);
    const cols = followers.get(col);
    if (cols === undefined) {
        return;
    }
    for (let i = cols.length - 1; i >= 0; --i) {
        pushWithFollowers(result, cols[i], followers);
    }
};
