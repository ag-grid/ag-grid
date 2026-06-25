import type { LocaleTextFunc } from 'ag-stack';

import type {
    AgColumn,
    AgShowValuesAsResolved,
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
    IShowValuesAsService,
    IValueColsService,
    MenuItemDef,
    NamedBean,
    RowNode,
    RowRenderer,
    ShowValuesAs,
    ShowValuesAsApplicability,
    ShowValuesAsApplicabilityParams,
    ShowValuesAsDefResolved,
    ShowValuesAsModeDef,
    ShowValuesAsModeDefResolved,
    ShowValuesAsModesDef,
    ShowValuesAsResult,
    ShowValuesAsStateValue,
    ShowValuesAsType,
    _IRowNodeGroupStage,
} from 'ag-grid-community';
import { BeanStub, _addGridCommonParams, _mergeDeep } from 'ag-grid-community';

import { DEFAULT_PRECISION, makeBuiltinShowValuesAsModesDef } from './showValuesAsBuiltInModes';
import { ShowValuesAsColumnListsImpl, ShowValuesAsMenuParamsImpl } from './showValuesAsMenuParams';
import { ShowValuesAsTransformParamsImpl } from './showValuesAsTransformParams';
import { unwrapAggValue } from './showValuesAsValueReaders';

/** Resolves a column's "Show Values As" mode and transforms its raw value into the value to display. */
export class ShowValuesAsService extends BeanStub implements NamedBean, IShowValuesAsService {
    beanName = 'showValuesAsSvc' as const;

    private colModel: ColumnModel;
    private rowRenderer: RowRenderer;
    private gridApi: GridApi;
    private gridOptions: GridOptions;
    private groupStage?: _IRowNodeGroupStage;
    private pivotResultCols?: IPivotResultColsService;
    private valueColsSvc?: IValueColsService;
    private dataTypeSvc?: DataTypeService;
    /** The built-in mode definitions, built once on first use (a grid that never resolves a column never pays).
     *  Read via {@link builtinModes}. Indexing yields `undefined` for an unknown (user-defined) mode name. */
    private cachedBuiltinModes: Record<string, ShowValuesAsModeDef | undefined> | undefined;
    /** The built-in modes already resolved (merged + formatter), shared by every column that doesn't override
     *  them — their resolution is invariant for the grid, so it runs once not per column. Read via
     *  {@link resolvedBuiltinModes}. */
    private cachedResolvedBuiltinModes: Record<string, ShowValuesAsModeDefResolved> | undefined;

    // Cache for the displayed-active value-column scan, keyed by the column-array ref it was computed for
    // (ref-stable until that set changes) — so a destroyed column is never retained. Dropped by {@link setActive}
    // when the active set toggles. Plain fields (no wrapper object) to avoid a per-recompute allocation.
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
        // Filtered denominators depend on the visible row membership, which sort and filter change without
        // otherwise repainting these cells. Refresh after each — change-detected, so only the cells whose value
        // actually moved repaint (a no-op with no active modes).
        const refresh = (): void => this.refreshRenderedCells();
        this.addManagedEventListeners({ sortChanged: refresh, filterChanged: refresh });
    }

    public override destroy(): void {
        super.destroy();
        this.cachedBuiltinModes = undefined;
        this.cachedResolvedBuiltinModes = undefined;
        this.displayedColsKey = null;
        this.displayedActiveResult = null;
    }

    /** Resolve the column's config (all modes, once) and active mode from the colDef. `applyInitial` is true only
     *  at column creation: `initialShowValuesAs` is create-only, so on a later colDef change only an explicit
     *  `showValuesAs` may move the active mode — with neither, the mode the user/state applied is left untouched.
     *  Cold path (column create / colDef change), never per-cell. */
    public resolveColumn(column: AgColumn, applyInitial: boolean): void {
        const colDef = column.colDef;
        const svaConfig = colDef.showValuesAsDef;
        if (svaConfig === null) {
            // Explicit per-column disable: `null` config marks the column disabled (distinct from `undefined` =
            // un-configured) and clears any active mode.
            column.showValuesAsDef = null;
            this.setActive(column, null);
            return;
        }
        if (!applyInitial && colDef.showValuesAs === undefined) {
            // colDef change with no explicit `showValuesAs`: never re-impose a selection (initial is create-only).
            // Refresh the resolved config (its modes/precision may have changed) and re-bind any active mode to it
            // so its def/formatter/precision don't go stale (or it clears if the override removed the mode).
            const active = column.showValuesAs;
            if (svaConfig != null || active != null) {
                const oldPrecision = column.showValuesAsDef?.precision ?? DEFAULT_PRECISION;
                column.showValuesAsDef = this.resolveConfig(column);
                if (active) {
                    const precision = active.precision !== oldPrecision ? active.precision : undefined;
                    this.applyActive(column, active.type, { type: active.type, params: active.params, precision });
                }
            } else {
                column.showValuesAsDef = undefined; // unconfigured (not disabled)
            }
            return;
        }
        const selected = this.colDefSelection(colDef); // mode name / object form; null when none, disabled, or `false`
        // Participates if it has a config or a selection; otherwise clear and bail.
        if (svaConfig == null && selected == null) {
            column.showValuesAsDef = undefined; // unconfigured (not disabled)
            this.setActive(column, null);
            return;
        }
        column.showValuesAsDef = this.resolveConfig(column);
        if (selected == null) {
            this.setActive(column, null);
            return;
        }
        const type = typeof selected === 'string' ? selected : selected.type;
        const selection = typeof selected === 'string' ? undefined : selected;
        if (type == null) {
            this.setActive(column, null);
        } else {
            this.applyActive(column, type, selection);
        }
    }

    public colDefSelection(colDef: ColDef): ShowValuesAsStateValue {
        // A disabled column (`showValuesAsDef: null`) or a `false`/absent selector has no active mode.
        if (colDef.showValuesAsDef === null) {
            return null;
        }
        // The colDef's selector, falling back to create-only `initialShowValuesAs`.
        const value = colDef.showValuesAs !== undefined ? colDef.showValuesAs : colDef.initialShowValuesAs;
        return value ?? null;
    }

    /** Built-in mode definitions, built once on first use. */
    private get builtinModes(): Record<string, ShowValuesAsModeDef | undefined> {
        this.cachedBuiltinModes ??= makeBuiltinShowValuesAsModesDef(this.beans);
        return this.cachedBuiltinModes;
    }

    /** The built-in modes resolved once (deep-merged + formatter) — shared by every column that doesn't override
     *  them, since their resolution doesn't depend on the column. In their canonical (definition) order. */
    private get resolvedBuiltinModes(): Record<string, ShowValuesAsModeDefResolved> {
        let resolved = this.cachedResolvedBuiltinModes;
        if (!resolved) {
            const builtinModes = this.builtinModes;
            // Null-prototype: shared directly as a column's `modes` (no overrides), then indexed by a user-supplied
            // mode name in `applyActive` — a name like `toString` must not hit an inherited `Object.prototype` member.
            resolved = Object.create(null) as Record<string, ShowValuesAsModeDefResolved>;
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
        column.showValuesAsDef ??= this.resolveConfig(column);
    }

    /** Build the column's resolved config: the shared built-in modes plus, only when the column declares
     *  `showValuesAsDef.modes`, a deep-merge of its overrides (a builtin gains/changes fields, `false`/`null`
     *  removes it, or a new mode is added). The built-ins are resolved once (see {@link resolvedBuiltinModes}). */
    private resolveConfig(column: AgColumn): ShowValuesAsDefResolved | null {
        const config = column.colDef.showValuesAsDef;
        if (config === null) {
            return null; // feature disabled for this column
        }
        const resolvedBuiltins = this.resolvedBuiltinModes;
        const colModes = config?.modes;
        let modes: Record<string, ShowValuesAsModeDefResolved>;
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

    /** Resolve one mode from its built-in base and the column's override entry (`colDef.showValuesAsDef.modes`),
     *  or `null` when disabled (`false`/`null`) or unknown (neither side provides a def). */
    private resolveMode(
        type: ShowValuesAsType,
        builtinDef: ShowValuesAsModeDef | undefined,
        colEntry: ShowValuesAsModesDef[string] | undefined
    ): ShowValuesAsModeDefResolved | null {
        if (colEntry === null || colEntry === false) {
            return null; // disabled
        }
        // A function override receives the built-in def (sound to widen: built-ins are full defs) and returns
        // its override, so it can wrap the default; a plain object is merged over the built-in directly.
        let colDef: Partial<ShowValuesAsModeDef> | undefined;
        if (typeof colEntry === 'function') {
            colDef = colEntry(builtinDef);
        } else if (colEntry != null && colEntry !== true) {
            colDef = colEntry;
        }
        if (!builtinDef && !colDef) {
            return null; // unknown mode
        }
        const def = {} as ShowValuesAsModeDef;
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

    /** Sole writer of `column.showValuesAs`. Drops the displayed-active scan cache (and its column references, so a
     *  destroyed column is never retained) when the active set toggles. */
    private setActive(column: AgColumn, resolved: AgShowValuesAsResolved | null): void {
        if ((column.showValuesAs != null) !== (resolved != null)) {
            this.displayedColsKey = null;
            this.displayedActiveResult = null;
        }
        column.showValuesAs = resolved;
    }

    /** Sets `column.showValuesAs` (the active mode) from a lookup into the resolved config + the selector params.
     *  An unknown/disabled mode resolves to no active mode (the column stays enabled, just nothing applied). */
    private applyActive(column: AgColumn, type: ShowValuesAsType, selection: ShowValuesAs | undefined): void {
        const config = column.showValuesAsDef;
        const mode = config?.modes[type];
        if (!mode) {
            this.setActive(column, null); // disabled / unknown mode — no active mode
            return;
        }
        const fields: AgShowValuesAsResolved = {
            type: mode.type,
            def: mode.def,
            formatter: mode.formatter,
            transformedDataType: mode.transformedDataType,
            params: selection?.params,
            precision: selection?.precision ?? config?.precision ?? DEFAULT_PRECISION,
            _applyingSig: -1,
            _applyingValue: false,
        };
        const old = column.showValuesAs;
        this.setActive(column, old ? Object.assign(old, fields) : fields);
    }

    /** Serialises a column's active mode to column state: the bare mode name when there is nothing else to
     *  preserve, else `{ type, params, precision }` — keeping a per-selection `precision` (one that differs from
     *  the config default) so it survives a round-trip. `null` when there is no mode. */
    public toColState(column: AgColumn): ShowValuesAsStateValue {
        const resolved = column.showValuesAs;
        if (!resolved) {
            return null;
        }
        const { type, params, precision } = resolved;
        // The config default is always set alongside an active mode (resolveConfig defaults it).
        const configPrecision = column.showValuesAsDef?.precision ?? DEFAULT_PRECISION;
        if (params === undefined && precision === configPrecision) {
            return type;
        }
        const state: ShowValuesAs = { type };
        if (params !== undefined) {
            state.params = params;
        }
        if (precision !== configPrecision) {
            state.precision = precision;
        }
        return state;
    }

    public isApplying(column: AgColumn): boolean {
        const resolved = column.showValuesAs;
        if (!resolved) {
            return false;
        }
        // Awaiting input (e.g. "% Of" before a base is chosen) ⇒ the raw value is shown. The mode stays
        // selectable in the menu (distinct from view inapplicability) — its menu is how it gets configured.
        // Use the same params `transform()` will: the selector's, else the def's defaults — so a mode configured
        // ready via `def.params` (e.g. a default base) is not wrongly treated as awaiting input.
        const def = resolved.def;
        const ready = def.ready;
        if (ready && !ready(resolved.params ?? def.params)) {
            return false;
        }
        // Applicable - the mode's `applicability` resolves to `true`; otherwise the raw value is shown.
        const applicability = def.applicability;
        // A constant/absent value is free to evaluate; only a callback (which allocates applicability-params and
        // runs per cell) is worth memoising on this hot path.
        if (typeof applicability !== 'function') {
            return isApplicabilityEnabled(applicability);
        }
        // Memo (on the resolved object, so it lives and dies with the active mode) keyed by the
        // grouping/pivot/tree-data state the test depends on (per the `ShowValuesAsApplicabilityParams` contract):
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
        const value = isApplicabilityEnabled(applicability(this.buildApplicabilityParams(column)));
        resolved._applyingSig = sig;
        resolved._applyingValue = value;
        return value;
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
                if (col.showValuesAs != null) {
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
        // for each column per row, and the same primitive the menu uses (see `setColumnShowValuesAs`).
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
                if (cellCtrl.column.showValuesAs != null) {
                    cellCtrl.refreshOrDestroyCell(params);
                }
            }
        }
    }

    public transform(column: AgColumn, rowNode: IRowNode, rawValue: any): ShowValuesAsResult | null {
        const resolved = column.showValuesAs;
        if (!resolved) {
            return rawValue;
        }
        const def = resolved.def;
        const transform = def.transform;
        // A mode with no transform is a pass-through — show the raw (unwrapped) value, no params needed.
        if (!transform) {
            return unwrapAggValue(rawValue) ?? null;
        }
        // The selector's params, falling back to the def's defaults.
        const params = resolved.params ?? def.params;
        // Callers gate on isApplying() — don't re-evaluate it per cell here. Normalise a custom transform's
        // `undefined` to `null` (a blank cell), matching the pass-through branch above.
        return (
            transform(
                new ShowValuesAsTransformParamsImpl(
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
        rawValue: any,
        notApplicable: boolean
    ): string | null {
        const resolved = column.showValuesAs;
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
                showValuesAsType: resolved.type,
                precision: resolved.precision,
                notApplicable,
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
        const stateValue = stateItem?.showValuesAs;
        const value = stateValue !== undefined ? stateValue : defaultState?.showValuesAs;
        if (value === undefined) {
            return; // not specified by state
        }
        // The state selection is a mode name or the object form (`{ type, params, … }`).
        const selection = value != null && typeof value === 'object' ? value : undefined;
        const type = selection ? selection.type : (value as ShowValuesAsType | null);
        // A disabled column (`showValuesAsDef: null`) wins over a state-applied mode.
        if (type != null && column.showValuesAsDef === null) {
            return;
        }
        if (type == null) {
            if (column.showValuesAs == null) {
                return; // already no mode
            }
            this.setActive(column, null);
        } else {
            // A bare mode name is a no-op only when it already matches the active *paramless* selection (default
            // precision). If the active selection carries params or a non-default precision, the bare name must
            // re-apply to clear them. Object selections always re-resolve (input may differ).
            const resolved = column.showValuesAs;
            const configPrecision = column.showValuesAsDef?.precision ?? DEFAULT_PRECISION;
            if (
                !selection &&
                resolved?.type === type &&
                resolved.params === undefined &&
                resolved.precision === configPrecision
            ) {
                return;
            }
            // Build the resolved config on demand for a state-applied mode (colDef declared no showValuesAs).
            this.ensureConfig(column);
            this.applyActive(column, type, selection);
        }
        this.applyModeChangeEffects(column, source);
    }

    public getActiveModeLabel(column: AgColumn): string | null {
        const resolved = column.showValuesAs;
        // Dormant modes show the raw value, so don't announce a transform.
        if (!resolved || !this.isApplying(column)) {
            return null;
        }
        return modeLabel(resolved.def, resolved.type);
    }

    public isMenuEligible(column: AgColumn): boolean {
        // The column-menu submenu is off by default. `enableShowValuesAs: false` (column or `defaultColDef`) hard-blocks
        // it, and `showValuesAsDef: null` disables the feature entirely. The transform / header indicator are
        // independent of this gate — a mode applied via colDef/state still shows them.
        const colDef = column.colDef;
        if (colDef.enableShowValuesAs === false || column.showValuesAsDef === null) {
            return false;
        }
        // Set DIRECTLY on the column (not merely inherited from `defaultColDef`), `true` forces the menu on for any
        // column type — overriding the value/numeric heuristic. This is the escape hatch for columns whose numeric
        // output isn't statically detectable (e.g. a `valueGetter`/custom `aggFunc` producing a number from string
        // or object data): the heuristic can't see it, so opt in explicitly on the column.
        if (column.userProvidedColDef?.enableShowValuesAs === true) {
            return true;
        }
        // Otherwise the menu must be enabled (typically grid-wide via `defaultColDef`) AND the column must normally
        // support it — so a grid-wide opt-in doesn't surface the menu where it can't be used. Supported = a value
        // column (any aggFunc, including custom) or a numeric column (promotable to a value column on demand).
        // `showValuesAsDef` is NOT a signal: it is config (precision / custom modes) and deep-merges from
        // `defaultColDef`, so it would wrongly mark every column.
        if (colDef.enableShowValuesAs !== true) {
            return false;
        }
        if (column.aggregationActive) {
            return true;
        }
        const baseType = this.dataTypeSvc?.getBaseDataType(column);
        return baseType === 'number' || baseType === 'bigint';
    }

    public getMenuItems(column: AgColumn, localeTextFunc: LocaleTextFunc): MenuItemDef[] {
        // Build the resolved config on demand for an eligible column the colDef didn't pre-configure.
        this.ensureConfig(column);
        const active = column.showValuesAs?.type ?? null;
        const result: MenuItemDef[] = [
            {
                name: localeTextFunc('showValuesAsNone', 'None'),
                action: () => this.setColumnShowValuesAs(column, null),
                checked: active == null,
            },
        ];
        // The candidate columns are shared across the modes' submenus — built on first use.
        let columnLists: ShowValuesAsColumnListsImpl | null = null;
        const getColumnLists = (): ShowValuesAsColumnListsImpl => {
            columnLists ??= new ShowValuesAsColumnListsImpl(column, this.beans);
            return columnLists;
        };
        const modes = column.showValuesAsDef?.modes;
        for (const type of modes ? Object.keys(modes) : []) {
            const item = this.buildModeMenuItem(column, type, modes![type], active, getColumnLists);
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
        type: ShowValuesAsType,
        mode: ShowValuesAsModeDefResolved,
        active: ShowValuesAsType | null,
        getColumnLists: () => ShowValuesAsColumnListsImpl
    ): MenuItemDef | null {
        const isActive = active === type;
        const def = mode.def;
        // The mode's `applicability` test (constant/callback) for the current view; `true` by default.
        const applicabilityDef = def.applicability;
        let applicability: ShowValuesAsApplicability = true;
        if (applicabilityDef != null) {
            applicability =
                typeof applicabilityDef === 'function'
                    ? applicabilityDef(this.buildApplicabilityParams(column))
                    : applicabilityDef;
        }
        const menuState = menuStateFor(applicability);
        if (menuState === 'hidden' && !isActive) {
            return null;
        }
        const item: MenuItemDef = {
            name: modeLabel(def, type),
            checked: isActive,
            tooltip: this.modeTooltip(type, mode),
        };
        const menuFn = def.menu;
        const subMenu = menuFn
            ? menuFn(
                  new ShowValuesAsMenuParamsImpl(
                      this.gridApi,
                      this.gridOptions.context,
                      this.beans,
                      column,
                      type,
                      isActive,
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
                    : () => this.setColumnShowValuesAs(column, type);
        }
        if (menuState === 'disabled' || menuState === 'inapplicable') {
            // Greyed AND non-interactive — a mode that does not apply in the current view cannot be selected.
            // An active selection that has become inapplicable still shows checked but is changed away from by
            // choosing an applicable mode.
            item.disabled = true;
        } else if (menuState !== 'enabled') {
            // A `'hidden'` mode kept because it is the active selection: greyed to show it is dormant — raw
            // value / `#N/A` — but still selectable so it stays visible and can be changed away from.
            item.cssClasses = ['ag-show-values-as-inapplicable'];
        }
        return item;
    }

    /** Tooltip for a mode: its label and the calculation it performs — shared by the menu and header indicator.
     *  `displayName`/`description` resolve their callback form per call (so a built-in follows a runtime locale
     *  change), else are used verbatim. */
    private modeTooltip(type: ShowValuesAsType, mode: ShowValuesAsModeDefResolved): string {
        const label = modeLabel(mode.def, type);
        const description = resolveText(mode.def.description);
        return description ? `${label}: ${description}` : label;
    }

    public getActiveModeTooltip(column: AgColumn): string | null {
        const resolved = column.showValuesAs;
        return resolved ? this.modeTooltip(resolved.type, resolved) : null;
    }

    public setColumnShowValuesAs(column: AgColumn, selection: ShowValuesAsType | ShowValuesAs | null): void {
        if (selection == null) {
            if (column.showValuesAs == null) {
                return;
            }
            this.setActive(column, null);
        } else {
            const type = typeof selection === 'string' ? selection : selection.type;
            const sel = typeof selection === 'string' ? undefined : selection;
            this.ensureConfig(column);
            this.applyActive(column, type, sel);
        }
        this.applyModeChangeEffects(column);
    }

    /** Propagate a mode change to the grid. A mode needing an aggregated total on a not-yet-aggregated column
     *  promotes it to a value column (which re-aggregates). Otherwise just redraw the cells: a total mode reads the
     *  root aggregate on demand via the transform params (which aggregates the root lazily), so no re-agg here. */
    private applyModeChangeEffects(column: AgColumn, source?: ColumnEventType): void {
        column.dispatchStateUpdatedEvent('showValuesAs');
        if (this.promoteToValueColumn(column, source)) {
            return; // promotion re-aggregates and refreshes
        }
        this.rowRenderer.refreshCells({ columns: [column.colId], force: true });
    }

    /** Promote a not-yet-aggregated column to a value column (the mode's `defaultAggFunc`) when its active mode
     *  needs an aggregated total. No-op (returns `false`) when not needed or already a
     *  value column / pivoting. Triggers a one-time re-aggregation. */
    private promoteToValueColumn(column: AgColumn, source: ColumnEventType = 'api'): boolean {
        const aggFunc = column.showValuesAs?.def.defaultAggFunc;
        const valueColsSvc = this.valueColsSvc;
        if (!aggFunc || column.aggregationActive || this.colModel.isPivotActive() || !valueColsSvc) {
            return false;
        }
        valueColsSvc.setColumnAggFunc(column, aggFunc, source);
        return true;
    }

    private buildApplicabilityParams(column: AgColumn): ShowValuesAsApplicabilityParams {
        // `undefined` ⇒ that hierarchy's module is not registered; `false` ⇒ registered but inactive. The `hasX`
        // flags distinguish the two, letting a custom `applicability` callback hide a mode its module can't support.
        // The built-ins never hide: they stay greyed and non-interactive in either case.
        const groupStage = this.groupStage;
        return _addGridCommonParams(this.gos, {
            column,
            rowGroupActive: groupStage?.hasRowGrouping ? groupStage.grouping : undefined,
            treeData: groupStage?.hasTreeData ? groupStage.treeData : undefined,
            pivotActive: this.pivotResultCols ? this.colModel.isPivotActive() : undefined,
        });
    }
}

/** A mode's display text: its `displayName` — a string verbatim, or a callback resolved per call (so a built-in
 *  follows a runtime locale change) — else the mode name. */
const modeLabel = (def: ShowValuesAsModeDef, type: ShowValuesAsType): string => resolveText(def.displayName) ?? type;

/** Resolves a `string | (() => string)` label field to its string, or `null` when unset. */
const resolveText = (value: string | (() => string) | undefined): string | null =>
    (typeof value === 'function' ? value() : value) ?? null;

/** `true`/`'enabled'` (or an absent value) all mean applicable: the transform runs and the menu shows it normally. */
const isApplicabilityEnabled = (applicability: ShowValuesAsApplicability | null | undefined): boolean =>
    applicability == null || applicability === true || applicability === 'enabled';

/** How a mode appears in the column menu, collapsed from its resolved {@link ShowValuesAsApplicability}. */
type ShowValuesAsMenuState = 'enabled' | 'inapplicable' | 'disabled' | 'hidden';

const menuStateFor = (applicability: ShowValuesAsApplicability): ShowValuesAsMenuState => {
    if (applicability === 'disabled') {
        return 'disabled';
    }
    if (applicability === false || applicability === 'hide') {
        return 'hidden';
    }
    return isApplicabilityEnabled(applicability) ? 'enabled' : 'inapplicable';
};
