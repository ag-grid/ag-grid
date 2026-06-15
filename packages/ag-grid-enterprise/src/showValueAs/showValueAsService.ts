import type { LocaleTextFunc } from 'ag-stack';

import type {
    AgColumn,
    AgShowValueAsResolved,
    BeanCollection,
    ChangedPath,
    ColDef,
    ColumnEventType,
    ColumnModel,
    ColumnState,
    ColumnStateParams,
    DataTypeService,
    GridApi,
    GridOptions,
    IPivotResultColsService,
    IRowNode,
    IShowValueAsService,
    IValueColsService,
    MenuItemDef,
    NamedBean,
    RowNode,
    RowRenderer,
    ShowValueAs,
    ShowValueAsApplicable,
    ShowValueAsApplicableParams,
    ShowValueAsConfigResolved,
    ShowValueAsDef,
    ShowValueAsModeResolved,
    ShowValueAsModes,
    ShowValueAsResult,
    ShowValueAsStateValue,
    ShowValueAsType,
    ShowValueAsValueEditorOptions,
    _IRowNodeGroupStage,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams, _mergeDeep } from 'ag-grid-community';

import { Dialog } from '../widgets/dialog';
import { DEFAULT_PRECISION, makeBuiltinShowValueAsModes } from './showValueAsBuiltInModes';
import { ShowValueAsColumnListsImpl, ShowValueAsMenuParamsImpl } from './showValueAsMenuParams';
import { ShowValueAsTransformParamsImpl } from './showValueAsTransformParams';
import { ShowValueAsValuePopup } from './showValueAsValuePopup';
import { unwrapAggValue } from './showValueAsValueReaders';

/** Resolves a column's "Show Values As" mode and transforms its raw value into the value to display. */
export class ShowValueAsService extends BeanStub implements NamedBean, IShowValueAsService {
    beanName = 'showValueAsSvc' as const;

    private colModel: ColumnModel;
    private rowRenderer: RowRenderer;
    private gridApi: GridApi;
    private gridOptions: GridOptions;
    private groupStage?: _IRowNodeGroupStage;
    private pivotResultCols?: IPivotResultColsService;
    private valueColsSvc?: IValueColsService;
    private dataTypeSvc?: DataTypeService;
    /** The currently-open value-input dialog, if any — so a second {@link openValueEditor} replaces it rather than
     *  stacking a second dialog on top. */
    private valueEditorDialog: Dialog | null = null;
    /** The built-in mode definitions, built once on first use (a grid that never resolves a column never pays).
     *  Read via {@link builtinModes}. Indexing yields `undefined` for an unknown (user-defined) mode name. */
    private cachedBuiltinModes: Record<string, ShowValueAsDef | undefined> | undefined;
    /** The built-in modes already resolved (merged + formatter), shared by every column that doesn't override
     *  them — their resolution is invariant for the grid, so it runs once not per column. Read via
     *  {@link resolvedBuiltinModes}. */
    private cachedResolvedBuiltinModes: Record<string, ShowValueAsModeResolved> | undefined;

    // Caches for the two active-column scans, each keyed by the column-array ref it was computed for (ref-stable
    // until that set changes) and dropped by {@link setActive} when the active set changes — so a destroyed column
    // is never retained. Plain fields (no wrapper object) to avoid a per-recompute allocation.
    private anyActiveColsKey: AgColumn[] | null = null;
    private anyActiveResult = false;
    private displayedColsKey: AgColumn[] | null = null;
    private displayedActiveResult: AgColumn[] | null = null;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.rowRenderer = beans.rowRenderer;
        this.gridApi = beans.gridApi;
        this.gridOptions = beans.gridOptions;
        this.groupStage = beans.groupStage;
        this.pivotResultCols = beans.pivotResultCols;
        this.valueColsSvc = beans.valueColsSvc;
        this.dataTypeSvc = beans.dataTypeSvc;
    }

    public postConstruct(): void {
        // Adjacent-sibling modes ((previous)/(next)) and filtered denominators depend on the visible row order /
        // membership, which sort and filter change without otherwise repainting these cells. Refresh after each —
        // change-detected, so only the cells whose value actually moved repaint (a no-op with no active modes).
        const refresh = (): void => this.refreshRenderedCells();
        this.addManagedEventListeners({ sortChanged: refresh, filterChanged: refresh });
    }

    public override destroy(): void {
        this.valueEditorDialog?.close();
        super.destroy();
        this.cachedBuiltinModes = undefined;
        this.cachedResolvedBuiltinModes = undefined;
        this.anyActiveColsKey = null;
        this.displayedColsKey = null;
        this.displayedActiveResult = null;
    }

    /** Resolve the column's config (all modes, once) and active mode from the colDef. `applyInitial` is true only
     *  at column creation: `showValueAsInitial` is create-only, so on a later colDef change only an explicit
     *  `showValueAs` may move the active mode — with neither, the mode the user/state applied is left untouched.
     *  Cold path (column create / colDef change), never per-cell. */
    public resolveColumn(column: AgColumn, applyInitial: boolean): void {
        const colDef = column.colDef;
        const svaConfig = colDef.showValueAsConfig;
        if (isColDefDisabled(colDef)) {
            // Explicit per-column disable always clears config + active mode.
            column.showValueAsConfig = null;
            this.setActive(column, null);
            return;
        }
        if (!applyInitial && colDef.showValueAs === undefined) {
            // colDef change with no explicit `showValueAs`: never re-impose a selection (initial is create-only).
            // Refresh the resolved config (its modes/precision may have changed) and re-bind any active mode to it
            // so its def/formatter/precision don't go stale (or it clears if the override removed the mode).
            const active = column.showValueAs;
            if (svaConfig != null || active != null) {
                const oldPrecision = column.showValueAsConfig?.precision ?? DEFAULT_PRECISION;
                column.showValueAsConfig = this.resolveConfig(column);
                if (active) {
                    // Preserve a per-selection precision (one that differed from the old config default);
                    // otherwise let it follow the (possibly changed) new config default.
                    const precision = active.precision !== oldPrecision ? active.precision : undefined;
                    this.applyActive(column, active.type, { type: active.type, params: active.params, precision });
                }
            } else {
                column.showValueAsConfig = null;
            }
            return;
        }
        const selected = this.colDefSelection(colDef); // mode name / object form; null when none, disabled, or `false`
        // Participates if it has a config or a selection; otherwise clear and bail.
        if (svaConfig == null && selected == null) {
            column.showValueAsConfig = null;
            this.setActive(column, null);
            return;
        }
        column.showValueAsConfig = this.resolveConfig(column);
        if (selected == null) {
            this.setActive(column, null);
            return;
        }
        const { type, selection } = parseSelection(selected);
        if (type == null) {
            this.setActive(column, null);
        } else {
            this.applyActive(column, type, selection);
        }
    }

    public colDefSelection(colDef: ColDef): ShowValueAsStateValue {
        // A disabled column (or a `false`/absent selector) has no active mode.
        if (isColDefDisabled(colDef)) {
            return null;
        }
        const value = colDefSelector(colDef);
        return value == null || value === false ? null : value;
    }

    /** Built-in mode definitions, built once on first use. */
    private get builtinModes(): Record<string, ShowValueAsDef | undefined> {
        this.cachedBuiltinModes ??= makeBuiltinShowValueAsModes(this.beans);
        return this.cachedBuiltinModes;
    }

    /** The built-in modes resolved once (deep-merged + formatter) — shared by every column that doesn't override
     *  them, since their resolution doesn't depend on the column. In their canonical (definition) order. */
    private get resolvedBuiltinModes(): Record<string, ShowValueAsModeResolved> {
        let resolved = this.cachedResolvedBuiltinModes;
        if (!resolved) {
            const builtinModes = this.builtinModes;
            // Null-prototype: shared directly as a column's `modes` (no overrides), then indexed by a user-supplied
            // mode name in `applyActive` — a name like `toString` must not hit an inherited `Object.prototype` member.
            resolved = Object.create(null) as Record<string, ShowValueAsModeResolved>;
            for (const type of Object.keys(builtinModes)) {
                const mode = this.resolveMode(type, builtinModes[type], undefined);
                if (mode) {
                    resolved[type] = mode;
                }
            }
            this.cachedResolvedBuiltinModes = resolved;
        }
        return resolved;
    }

    /** Resolve the column's config on demand — for a state/menu-applied mode the colDef didn't pre-resolve. */
    private ensureConfig(column: AgColumn): void {
        column.showValueAsConfig ??= this.resolveConfig(column);
    }

    /** Build the column's resolved config: the shared built-in modes plus, only when the column declares
     *  `showValueAsConfig.modes`, a deep-merge of its overrides (a builtin gains/changes fields, `false`/`null`
     *  removes it, or a new mode is added). The built-ins are resolved once (see {@link resolvedBuiltinModes}). */
    private resolveConfig(column: AgColumn): ShowValueAsConfigResolved | null {
        const config = column.colDef.showValueAsConfig;
        if (config === false || config === null) {
            return null; // feature disabled for this column
        }
        const resolvedBuiltins = this.resolvedBuiltinModes;
        const colModes = config?.modes;
        let modes: Record<string, ShowValueAsModeResolved>;
        if (!colModes) {
            // No per-column overrides — share the resolved built-ins (read-only downstream).
            modes = resolvedBuiltins;
        } else {
            // Copy the shared built-ins (null-proto, like the source), then re-resolve only the column's overrides.
            modes = Object.assign(Object.create(null), resolvedBuiltins);
            const builtinModes = this.builtinModes;
            for (const type of Object.keys(colModes)) {
                const mode = this.resolveMode(type, builtinModes[type], colModes[type]);
                if (mode) {
                    modes[type] = mode; // overrides a built-in or adds a new mode
                } else {
                    delete modes[type]; // a `false`/`null` override removes a built-in
                }
            }
        }
        return {
            modes,
            precision: config?.precision ?? DEFAULT_PRECISION,
            suppressHeaderIndicator: config?.suppressHeaderIndicator,
        };
    }

    /** Resolve one mode from its built-in base and the column's override entry (`colDef.showValueAsConfig.modes`),
     *  or `null` when disabled (`false`/`null`) or unknown (neither side provides a def). */
    private resolveMode(
        type: ShowValueAsType,
        builtinDef: ShowValueAsDef | undefined,
        colEntry: ShowValueAsModes[string] | undefined
    ): ShowValueAsModeResolved | null {
        if (colEntry === null || colEntry === false) {
            return null; // disabled
        }
        // A function override receives the built-in def (sound to widen: built-ins are full defs) and returns
        // its override, so it can wrap the default; a plain object is merged over the built-in directly.
        let colDef: Partial<ShowValueAsDef> | undefined;
        if (typeof colEntry === 'function') {
            colDef = colEntry(builtinDef);
        } else if (colEntry != null && colEntry !== true) {
            colDef = colEntry;
        }
        if (!builtinDef && !colDef) {
            return null; // unknown mode
        }
        const def = {} as ShowValueAsDef;
        _mergeDeep(def, builtinDef, true, true);
        _mergeDeep(def, colDef, true, true);
        // A mode with no `transform` is a pass-through (shows the raw value, see `transform()`) — it can still
        // override the formatter / transformed data type.
        const transformedDataType = def.transformedDataType ?? 'number';
        // Formatter precedence: the mode's own formatter (built-in default or per-mode override), else the
        // transformed type's default formatter. The column's own `valueFormatter` is NEVER used (it is written
        // for the raw value).
        const formatter = def.formatter ?? this.beans.dataTypeSvc?.getFormatValue(transformedDataType) ?? null;
        return { type, def, formatter, transformedDataType };
    }

    /** Sole writer of `column.showValueAs`. When the active-column set changes, drops the scan caches (and their
     *  column references, so a destroyed column is never retained) — the only event that invalidates them. */
    private setActive(column: AgColumn, resolved: AgShowValueAsResolved | null): void {
        if ((column.showValueAs != null) !== (resolved != null)) {
            this.anyActiveColsKey = null;
            this.displayedColsKey = null;
            this.displayedActiveResult = null;
        }
        column.showValueAs = resolved;
    }

    /** Sets `column.showValueAs` (the active mode) from a lookup into the resolved config + the selector params. */
    private applyActive(column: AgColumn, type: ShowValueAsType, selection: ShowValueAs | undefined): void {
        const config = column.showValueAsConfig;
        const mode = config?.modes[type];
        if (!mode) {
            this.setActive(column, null); // disabled / unknown active mode
            return;
        }
        const fields: AgShowValueAsResolved = {
            type: mode.type,
            def: mode.def,
            formatter: mode.formatter,
            transformedDataType: mode.transformedDataType,
            params: selection?.params,
            precision: selection?.precision ?? config?.precision ?? DEFAULT_PRECISION,
            _applyingSig: -1,
            _applyingValue: false,
        };
        const old = column.showValueAs;
        this.setActive(column, old ? Object.assign(old, fields) : fields);
    }

    /** Serialises a column's active mode to column state: the bare mode name when there is nothing else to
     *  preserve, else `{ type, params, precision }` — keeping a per-selection `precision` (one that differs from
     *  the config default) so it survives a round-trip. `null` when there is no mode. */
    public toColState(column: AgColumn): ShowValueAsStateValue {
        const resolved = column.showValueAs;
        if (!resolved) {
            return null;
        }
        const { type, params, precision } = resolved;
        // The config default is always set alongside an active mode (resolveConfig defaults it).
        const configPrecision = column.showValueAsConfig?.precision ?? DEFAULT_PRECISION;
        if (params === undefined && precision === configPrecision) {
            return type;
        }
        const state: ShowValueAs = { type };
        if (params !== undefined) {
            state.params = params;
        }
        if (precision !== configPrecision) {
            state.precision = precision;
        }
        return state;
    }

    public isApplying(column: AgColumn): boolean {
        const resolved = column.showValueAs;
        if (!resolved) {
            return false;
        }
        // Awaiting input (e.g. "% Of" before a base is chosen) ⇒ the raw value is shown. The mode stays
        // selectable in the menu (distinct from view inapplicability) — its menu is how it gets configured.
        // Use the same params `transform()` will: the selector's, else the def's defaults — so a mode configured
        // ready via `def.params` (e.g. a default base) is not wrongly treated as awaiting input.
        const ready = resolved.def.ready;
        if (ready && !ready(resolved.params ?? resolved.def.params)) {
            return false;
        }
        // Applicable - the mode's `applicable` resolves to `true`; otherwise the raw value is shown.
        const applicable = resolved.def.applicable;
        // A constant/absent value is free to evaluate; only a callback (which allocates applicable-params and
        // runs per cell) is worth memoising on this hot path.
        if (typeof applicable !== 'function') {
            return applicable == null || applicable === true;
        }
        // Memo (on the resolved object, so it lives and dies with the active mode) keyed by the
        // grouping/pivot/tree-data state the test depends on (per the `ShowValueAsApplicableParams` contract):
        // a state change recomputes, a mode/params change drops it in `applyActive` — no lifecycle-timed
        // invalidation needed.
        const groupStage = this.groupStage;
        const pivotResultCols = this.pivotResultCols;
        // Only the active states vary at runtime (the `hasX` module flags are fixed for the grid's lifetime).
        const sig =
            (groupStage?.grouping ? 1 : 0) |
            (pivotResultCols && this.colModel.isPivotActive() ? 2 : 0) |
            (groupStage?.treeData ? 4 : 0);
        if (resolved._applyingSig === sig) {
            return resolved._applyingValue!;
        }
        const value = applicable(this.buildApplicableParams(column)) === true;
        resolved._applyingSig = sig;
        resolved._applyingValue = value;
        return value;
    }

    /** Whether any of the given value columns currently has an active mode — cached for the per-aggregation check.
     *  Keyed by the value-column array ref (ref-stable until the set changes); {@link setActive} drops the cache
     *  when the active set changes. */
    public anyValueColHasActiveMode(valueColumns: AgColumn[] | undefined): boolean {
        if (!valueColumns) {
            return false;
        }
        if (this.anyActiveColsKey !== valueColumns) {
            let result = false;
            for (let i = 0, len = valueColumns.length; i < len; ++i) {
                if (valueColumns[i].showValueAs != null) {
                    result = true;
                    break;
                }
            }
            this.anyActiveColsKey = valueColumns;
            this.anyActiveResult = result;
        }
        return this.anyActiveResult;
    }

    /** The currently-displayed columns with an active mode — for the refresh sweep. Cached by the displayed-column
     *  array ref ({@link VisibleColsService.allCols}, reassigned whenever columns change, so a removed column drops
     *  out); {@link setActive} drops the cache when the active set changes. */
    private getDisplayedActiveCols(): AgColumn[] {
        const displayed = this.beans.visibleCols.allCols;
        if (this.displayedColsKey !== displayed) {
            const result: AgColumn[] = [];
            for (let i = 0, len = displayed.length; i < len; ++i) {
                const col = displayed[i];
                if (col.showValueAs != null) {
                    result.push(col);
                }
            }
            this.displayedColsKey = displayed;
            this.displayedActiveResult = result;
        }
        return this.displayedActiveResult!;
    }

    /** Refresh the Show Values As cells across every rendered row — for a general view refresh, where any row's
     *  aggregate-derived value may be stale (recycled DOM, or rendered before aggregation settled). Change-detected
     *  (`force: false`), so only moved values repaint, honouring each column's `enableCellChangeFlash`. */
    public refreshRenderedCells(): void {
        const aggCols = this.getDisplayedActiveCols();
        // `refreshCells` builds a colId map once and walks each row's cells a single time — cheaper than scanning
        // for each column per row, and the same primitive the menu uses (see `setColumnShowValueAs`).
        if (aggCols.length) {
            this.rowRenderer.refreshCells({ columns: aggCols, force: false });
        }
    }

    /** Refresh the Show Values As cells in the rendered rows the caller did NOT already refresh — for the post-edit
     *  re-aggregation, where `nodes`/`path` identify the rows the change-detection flush refreshed (they flash their
     *  own moved cells). Row membership is O(1) via the `Set`/`ChangedPath`; `refreshCells` can't express the
     *  exclusion, so this walks each remaining row's cells once, refreshing those on an active column directly. */
    public refreshRenderedCellsExcept(nodes: Set<RowNode> | null, path: ChangedPath | null): void {
        if (!this.getDisplayedActiveCols().length) {
            return;
        }
        const params = { force: false, newData: false };
        const rowCtrls = this.rowRenderer.getAllRowCtrls();
        for (let r = 0, rLen = rowCtrls.length; r < rLen; ++r) {
            const rowCtrl = rowCtrls[r];
            const node = rowCtrl.rowNode;
            if (nodes?.has(node) || path?.hasRow(node)) {
                continue;
            }
            const cellCtrls = rowCtrl.getAllCellCtrls();
            for (let c = 0, cLen = cellCtrls.length; c < cLen; ++c) {
                const cellCtrl = cellCtrls[c];
                if (cellCtrl.column.showValueAs != null) {
                    cellCtrl.refreshOrDestroyCell(params);
                }
            }
        }
    }

    public transform(column: AgColumn, rowNode: IRowNode, rawValue: any): ShowValueAsResult | null {
        const resolved = column.showValueAs;
        if (!resolved) {
            return rawValue;
        }
        const transform = resolved.def.transform;
        // A mode with no transform is a pass-through — show the raw (unwrapped) value, no params needed.
        if (!transform) {
            return unwrapAggValue(rawValue) ?? null;
        }
        // The selector's params, falling back to the def's defaults — base modes read `base`/`baseItem`, ordered
        // modes `over`, custom modes their own shape.
        const params = resolved.params ?? resolved.def.params;
        // Callers gate on isApplying() — don't re-evaluate it per cell here. Normalise a custom transform's
        // `undefined` to `null` (a blank cell), matching the pass-through branch above.
        return (
            transform(
                new ShowValueAsTransformParamsImpl(
                    this.gridApi,
                    this.gridOptions.context,
                    this.beans,
                    column,
                    rowNode,
                    rawValue,
                    params
                )
            ) ?? null
        );
    }

    public formatValue(
        column: AgColumn,
        rowNode: IRowNode | null,
        transformedValue: any,
        rawValue: any
    ): string | null {
        const resolved = column.showValueAs;
        const formatter = resolved?.formatter;
        // No formatter (custom mode without one) - use the cell's default rendering.
        if (!formatter) {
            return null;
        }
        return formatter(
            _addGridCommonParams(this.gos, {
                value: transformedValue,
                rawValue: unwrapAggValue(rawValue),
                aggValue: rawValue,
                showValueAsType: resolved.type,
                precision: resolved.precision,
                node: rowNode,
                data: rowNode?.data,
                colDef: column.colDef,
                column,
            })
        );
    }

    public syncColState(
        column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        source: ColumnEventType
    ): void {
        // Fall back to the default only when the state value is `undefined` (not `null`, which clears it).
        const stateValue = stateItem?.showValueAs;
        const value = stateValue !== undefined ? stateValue : defaultState?.showValueAs;
        if (value === undefined) {
            return; // not specified by state
        }
        // The state selection is a mode name or the object form (`{ type, base, … }`).
        const selection = value != null && typeof value === 'object' ? value : undefined;
        const type = selection ? selection.type : (value as ShowValueAsType | null);
        // A colDef-level disable (`showValueAsConfig: false`/`null`) wins over a state-applied mode.
        if (type != null && isColDefDisabled(column.colDef)) {
            return;
        }
        if (type == null) {
            if (column.showValueAs == null) {
                return; // already no mode
            }
            this.setActive(column, null);
        } else {
            // A bare mode name is a no-op only when it already matches the active *paramless* selection (default
            // precision). If the active selection carries params or a non-default precision, the bare name must
            // re-apply to clear them. Object selections always re-resolve (input may differ).
            const resolved = column.showValueAs;
            const configPrecision = column.showValueAsConfig?.precision ?? DEFAULT_PRECISION;
            if (
                !selection &&
                resolved?.type === type &&
                resolved.params === undefined &&
                resolved.precision === configPrecision
            ) {
                return;
            }
            // Build the resolved config on demand for a state-applied mode (colDef declared no showValueAs).
            this.ensureConfig(column);
            this.applyActive(column, type, selection);
        }
        column.dispatchStateUpdatedEvent('showValueAs');
        // Promote a not-yet-aggregated column so a state-applied total mode has its denominator.
        if (!this.promoteToValueColumn(column, source)) {
            this.rowRenderer.refreshCells({ columns: [column.colId], force: true });
        }
    }

    public getActiveModeLabel(column: AgColumn): string | null {
        const resolved = column.showValueAs;
        // Dormant modes show the raw value, so don't announce a transform.
        if (!resolved || !this.isApplying(column)) {
            return null;
        }
        return modeLabel(resolved.def, resolved.type);
    }

    public isMenuEligible(column: AgColumn): boolean {
        const colDef = column.colDef;
        if (isColDefDisabled(colDef)) {
            return false; // explicitly disabled for this column
        }
        // User opt-in (any column type — supports custom transforms/formatters on non-numeric columns).
        if (colDef.showValueAsConfig != null || this.colDefSelection(colDef) != null) {
            return true;
        }
        // Value columns always; numeric columns are promotable to value columns on demand.
        if (column.aggregationActive) {
            return true;
        }
        const baseType = this.dataTypeSvc?.getBaseDataType(column);
        return baseType === 'number' || baseType === 'bigint';
    }

    public getMenuItems(column: AgColumn, localeTextFunc: LocaleTextFunc): MenuItemDef[] {
        // Build the resolved config on demand for an eligible column the colDef didn't pre-configure.
        this.ensureConfig(column);
        const active = column.showValueAs?.type ?? null;
        const result: MenuItemDef[] = [
            {
                name: localeTextFunc('showValueAsNone', 'None'),
                action: () => this.setColumnShowValueAs(column, null),
                checked: active == null,
            },
        ];
        // The candidate columns are shared across the modes' submenus — built on first use.
        let columnLists: ShowValueAsColumnListsImpl | null = null;
        const getColumnLists = (): ShowValueAsColumnListsImpl => {
            columnLists ??= new ShowValueAsColumnListsImpl(column, this.beans);
            return columnLists;
        };
        const modes = column.showValueAsConfig?.modes;
        for (const type of modes ? Object.keys(modes) : []) {
            const item = this.buildModeMenuItem(column, type, modes![type], active, localeTextFunc, getColumnLists);
            if (item) {
                result.push(item);
            }
        }
        return result;
    }

    /** The column-menu item for one mode, or `null` when it should be omitted (not applicable and not the active
     *  selection). `getColumnLists` lazily builds the candidate columns shared across the modes' submenus. */
    private buildModeMenuItem(
        column: AgColumn,
        type: ShowValueAsType,
        mode: ShowValueAsModeResolved,
        active: ShowValueAsType | null,
        localeTextFunc: LocaleTextFunc,
        getColumnLists: () => ShowValueAsColumnListsImpl
    ): MenuItemDef | null {
        const isActive = active === type;
        // The mode's `applicable` test (constant/callback) for the current view; `true` by default.
        const applicableDef = mode.def.applicable;
        let applicable: ShowValueAsApplicable = true;
        if (applicableDef != null) {
            applicable =
                typeof applicableDef === 'function' ? applicableDef(this.buildApplicableParams(column)) : applicableDef;
        }
        // Not applicable and not the active selection ⇒ omitted (unless 'disable', which always shows greyed).
        if (applicable === false && !isActive) {
            return null;
        }
        const item: MenuItemDef = {
            name: modeLabel(mode.def, type),
            checked: isActive,
            tooltip: this.modeTooltip(type, mode),
        };
        const menuFn = mode.def.menu;
        const subMenu = menuFn
            ? menuFn(
                  new ShowValueAsMenuParamsImpl(
                      this.gridApi,
                      this.gridOptions.context,
                      this.beans,
                      column,
                      type,
                      isActive,
                      localeTextFunc,
                      getColumnLists()
                  )
              )
            : undefined;
        // A submenu with a single real choice (e.g. "% of Parent Total" in tree data: only "Top level", no
        // fields) is pointless — collapse to that entry's own action. With no submenu, select the mode directly.
        if (subMenu && subMenu.length > 1) {
            item.subMenu = subMenu;
        } else {
            const only = subMenu?.length === 1 ? subMenu[0] : null;
            item.action =
                only && typeof only === 'object' && only.action
                    ? only.action
                    : () => this.setColumnShowValueAs(column, type);
        }
        // Not applicable ⇒ greyed AND intentionally non-interactive: a `'disable'` mode, or the active selection
        // kept visible after the view changed (e.g. "% of Parent Total" still selected after ungrouping). It is
        // informational only — there is nothing meaningful to (re)configure without its view context; the user
        // changes the selection via the always-enabled "None" / other applicable modes.
        if (applicable !== true) {
            item.disabled = true;
        }
        return item;
    }

    /** Opens the built-in number-input popup ({@link ShowValueAsValuePopup}) anchored under the column header,
     *  calling `onApply` with the committed value. Backs the `editValue` menu-param helper. */
    public openValueEditor(
        column: AgColumn,
        type: ShowValueAsType,
        onApply: (value: number) => void,
        options: ShowValueAsValueEditorOptions | undefined,
        localeTextFunc: LocaleTextFunc
    ): void {
        if (!this.beans.popupSvc) {
            return;
        }
        // A second call while one is open replaces it (closing tears the old one down via its `destroyed`
        // listener), so the dialogs never stack.
        this.valueEditorDialog?.close();
        const mode = column.showValueAsConfig?.modes[type];
        const title = options?.title ?? (mode ? modeLabel(mode.def, type) : type);
        const columnName = this.beans.colNames.getDisplayNameForColumn(column, 'header') || column.colId;
        const message =
            options?.message ??
            localeTextFunc('showValueAsValuePrompt', `Compare each '${columnName}' value against the number below.`, [
                columnName,
            ]);

        let done = false;
        const finish = (committed: number | null): void => {
            if (done) {
                return;
            }
            done = true;
            dialog.close();
            if (committed != null) {
                onApply(committed);
            }
        };

        const body = this.createBean(
            new ShowValueAsValuePopup({
                description: message,
                applyLabel: localeTextFunc('showValueAsApply', 'Apply'),
                cancelLabel: localeTextFunc('showValueAsCancel', 'Cancel'),
                value: options?.value,
                onApply: (v) => finish(v),
                onCancel: () => finish(null),
            })
        );
        const dialog = this.createBean(
            new Dialog({
                title,
                component: body,
                width: 320,
                centered: true,
                movable: true,
                modal: false,
                cssIdentifier: 'show-value-as-value',
            })
        );
        this.valueEditorDialog = dialog;
        dialog.addEventListener('destroyed', () => {
            this.destroyBean(body);
            if (this.valueEditorDialog === dialog) {
                this.valueEditorDialog = null;
            }
        });
        body.focusInput();
    }

    /** Tooltip for a mode: its label and the calculation it performs — shared by the menu and header indicator.
     *  `displayName`/`description` resolve their callback form per call (so a built-in follows a runtime locale
     *  change), else are used verbatim. */
    private modeTooltip(type: ShowValueAsType, mode: ShowValueAsModeResolved): string {
        const label = modeLabel(mode.def, type);
        const description = resolveText(mode.def.description);
        return description ? `${label}: ${description}` : label;
    }

    public getActiveModeTooltip(column: AgColumn): string | null {
        const resolved = column.showValueAs;
        return resolved ? this.modeTooltip(resolved.type, resolved) : null;
    }

    public setColumnShowValueAs(column: AgColumn, selection: ShowValueAsType | ShowValueAs | null): void {
        if (selection == null) {
            if (column.showValueAs == null) {
                return;
            }
            this.setActive(column, null);
        } else {
            const { type, selection: sel } = parseSelection(selection);
            this.ensureConfig(column);
            this.applyActive(column, type, sel);
        }
        column.dispatchStateUpdatedEvent('showValueAs');
        // A mode needing an aggregated total on a not-yet-aggregated column promotes it to a value column,
        // which re-aggregates (and refreshes cells). Otherwise a redraw only — never re-sorts or re-filters.
        if (!this.promoteToValueColumn(column)) {
            this.rowRenderer.refreshCells({ columns: [column.colId], force: true });
        }
    }

    /** Promote a not-yet-aggregated column to a value column (the mode's `defaultAggFunc`) when its active mode
     *  needs an aggregated total. No-op (returns `false`) when not needed or already a
     *  value column / pivoting. Triggers a one-time re-aggregation. */
    private promoteToValueColumn(column: AgColumn, source: ColumnEventType = 'api'): boolean {
        const aggFunc = column.showValueAs?.def.defaultAggFunc;
        const valueColsSvc = this.valueColsSvc;
        if (!aggFunc || column.aggregationActive || this.colModel.isPivotActive() || !valueColsSvc) {
            return false;
        }
        valueColsSvc.setColumnAggFunc(column, aggFunc, source);
        return true;
    }

    private buildApplicableParams(column: AgColumn): ShowValueAsApplicableParams {
        // `undefined` ⇒ that hierarchy's module is not registered (so the mode can't apply, it is hidden);
        // `false` ⇒ registered but inactive. The `hasX` flags distinguish the two.
        const groupStage = this.groupStage;
        return _addGridCommonParams(this.gos, {
            column,
            rowGroupActive: groupStage?.hasRowGrouping ? groupStage.grouping : undefined,
            treeData: groupStage?.hasTreeData ? groupStage.treeData : undefined,
            pivotActive: this.pivotResultCols ? this.colModel.isPivotActive() : undefined,
        });
    }
}

/** A mode's display text: its (pre-localized) `displayName`, else the mode name. */
/** A mode's display text: its `displayName` — a string verbatim, or a callback resolved per call (so a built-in
 *  follows a runtime locale change) — else the mode name. */
const modeLabel = (def: ShowValueAsDef, type: ShowValueAsType): string => resolveText(def.displayName) ?? type;

/** Resolves a `string | (() => string)` label field to its string, or `null` when unset. */
const resolveText = (value: string | (() => string) | undefined): string | null =>
    (typeof value === 'function' ? value() : value) ?? null;

const isColDefDisabled = (colDef: ColDef): boolean => {
    const config = colDef.showValueAsConfig;
    return config === false || config === null;
};

/** The colDef's `showValueAs` selector, falling back to `showValueAsInitial`. */
const colDefSelector = (colDef: ColDef): ShowValueAsType | ShowValueAs | false | null | undefined =>
    colDef.showValueAs !== undefined ? colDef.showValueAs : colDef.showValueAsInitial;

/** Split a selection — a mode name or the object form carrying `params` — into its mode name and that object. */
const parseSelection = (
    value: ShowValueAsType | ShowValueAs
): { type: ShowValueAsType; selection: ShowValueAs | undefined } =>
    typeof value === 'string' ? { type: value, selection: undefined } : { type: value.type, selection: value };
