import { _isExpressionString, _parseBigIntOrNull } from 'ag-stack';

import type {
    AgColumn,
    CellValueChangedEvent,
    FormulaFunctionParams,
    IFormulaDataService,
    IFormulaService,
    NamedBean,
    RowNode,
    RowNodeDataChangedEvent,
    _ChangedRowNodes,
} from 'ag-grid-community';
import { BeanStub, _convertColumnEventSourceType } from 'ag-grid-community';

import { parseFormula } from './ast/parsers';
import { serializeFormula } from './ast/serializer';
import type { FormulaNode } from './ast/utils';
import { FormulaError, findFirstInvalidOperation } from './ast/utils';
import { CellFormula } from './cellFormula';
import type { Addr, FormulaResolver, FormulaVisitorContext } from './functions/resolver';
import { evalAst, formulaVisitorSetVisited, formulaVisitorSetVisiting, unresolvedDeps } from './functions/resolver';
import SUPPORTED_FUNCTIONS from './functions/supportedFuncs';
import { shiftNode } from './functions/utils';
import type { FormulaErrorId, FormulaErrorType } from './i18n';
import { isValidFunctionName } from './refUtils';

/** Shared params object for `rowRenderer.refreshCells`, hoisted to avoid per-call allocation. */
const REFRESH_CELLS_PARAMS = { suppressFlash: true, force: true } as const;

/** A1-style column-label alphabet and its length (base 26). */
const COL_REF_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COL_REF_BASE = COL_REF_ALPHABET.length;

interface FormulaFrame {
    address: Addr;
    ast: FormulaNode;
    unresolvedDepIterator: Generator<Addr>;
}

export class FormulaService extends BeanStub implements IFormulaService, NamedBean, FormulaResolver {
    public readonly beanName = 'formula' as const;

    /**
     * Monotonic cache-generation counter for computed formula values. Stamped into
     * `CellFormula._valueVersion` on every cache write; a mismatch on read means the entry is
     * implicitly stale. Incrementing this bulk-invalidates every cached value in O(1) while
     * preserving parsed ASTs. Read on every `CellFormula.isValueReady()`.
     */
    public valueCacheVersion = 0;

    /**
     * Whether formulas are currently enabled for the grid and safe to evaluate. When false,
     * formula parsing/evaluation helpers short-circuit and caches are not refreshed. Read on
     * every `isFormula()` check (per cell, per render).
     */
    public active = false;

    /**
     * Cache: RowNode -> (AgColumn -> CellFormula).
     *
     * Map (not WeakMap) so we can iterate for explicit cleanup on destroyed rows. Memory stays
     * bounded because every destructive event purges destroyed entries explicitly
     * (`onRowsChanged`) or wipes the whole map (`refreshFormulas`).
     */
    private readonly cachedResult: Map<RowNode, Map<AgColumn, CellFormula | null>> = new Map();

    /**
     * Stored at the class level so a `valueGetter` that resolves another formula cell (e.g. via
     * `api.getCellValue`) reuses the same cycle-detection state instead of hitting a false
     * positive. Read at the top of every `resolveValue` call; null outside of an active eval.
     */
    private activeCtx: FormulaVisitorContext | null = null;

    /** Built-in operations (extendable via gridOptions.formulaFuncs). Read per function call. */
    private supportedOperations: Map<string, (params: FormulaFunctionParams) => unknown>;

    /** Map "A", "B", ..., "AA" -> actual AgColumn. */
    private readonly colRefMap: Map<string, AgColumn> = new Map();

    /** Reverse lookup for A1 labels by column instance. */
    private readonly colToRefMap: Map<AgColumn, string> = new Map();

    /** Lazy-sorted, validated subset of `supportedOperations` keys surfaced to autocomplete. */
    private functionNames: string[] | null = null;

    /** Cached reference to the optional formula data service, resolved in `postConstruct`. */
    private formulaDataSvc: IFormulaDataService | undefined = undefined;

    /**
     * Cached result of the "any column currently uses formula evaluation?" scan, refreshed on
     * every `setFormulasActive` call (which is the only time the underlying column set changes).
     * Lets property-change listeners skip the O(cols) rescan on every masterDetail /
     * enableCellExpressions toggle.
     */
    private formulaColumnsPresent = false;

    /** Calculated columns use formula evaluation without enabling editable formula behaviours. */
    private calculatedColumnsActive = false;

    public hasCachedRows(): boolean {
        return this.cachedResult.size > 0;
    }

    /**
     * Recompute `active`, the `formulaColumnsPresent` cache, and trigger a full formula refresh
     * if the active state changed. Called by `columnModel` whenever the column set changes.
     */
    public setFormulasActive(columns: AgColumn[]): void {
        const calculatedColumnsEnabled = this.beans.calculatedColsSvc?.isEnabled() === true;
        let editableFormulaColumnsPresent = false;
        let calculatedColumnsPresent = false;
        for (let i = 0, len = columns.length; i < len; ++i) {
            const col = columns[i];
            if (col.allowFormula) {
                editableFormulaColumnsPresent = true;
            }
            if (col.isCalculatedCol) {
                calculatedColumnsPresent = true;
            }
            if (editableFormulaColumnsPresent && (calculatedColumnsPresent || !calculatedColumnsEnabled)) {
                break;
            }
        }
        const formulaColumnsPresent = editableFormulaColumnsPresent || calculatedColumnsPresent;
        this.formulaColumnsPresent = formulaColumnsPresent;
        const editableFormulasCompatible =
            editableFormulaColumnsPresent && this.checkForEditableFormulaIncompatibleServices(columns);
        // Calculated columns work with pivot in every role: as a pivot value (aggFunc) feeding the result
        // columns, alongside a pivot, and as a pivot dimension (its per-leaf formula result is the key).
        const calculatedColumnsCompatible = calculatedColumnsPresent && this.checkForBaseIncompatibleServices();
        const editableFormulasSupported = this.beans.rowModel.getType() === 'clientSide';
        const active = editableFormulasCompatible && editableFormulasSupported;
        const calculatedColumnsActive = calculatedColumnsCompatible;

        if (active !== this.active || calculatedColumnsActive !== this.calculatedColumnsActive) {
            this.active = active;
            this.calculatedColumnsActive = calculatedColumnsActive;
            this.rebuildColRefMap();
            this.refreshFormulas(true);
        }
    }

    public isEvaluationActive(): boolean {
        return this.active || this.calculatedColumnsActive;
    }

    private checkForBaseIncompatibleServices(): boolean {
        if (this.gos.get('masterDetail')) {
            this.warn(295, { blockedService: 'Master Detail' });
            return false;
        }
        if (this.gos.get('enableCellExpressions')) {
            this.warn(295, { blockedService: 'Cell Expressions' });
            return false;
        }
        return true;
    }

    private checkForEditableFormulaIncompatibleServices(columns: AgColumn[]): boolean {
        if (!this.checkForBaseIncompatibleServices()) {
            return false;
        }
        if (this.gos.get('treeData')) {
            this.warn(295, { blockedService: 'Tree Data' });
            return false;
        }
        for (let i = 0, len = columns.length; i < len; ++i) {
            const col = columns[i];
            if (col.isAllowPivot() || col.isPivotActive()) {
                this.warn(295, { blockedService: 'Column Pivoting' });
                return false;
            }
            if (col.isAllowRowGroup() || col.isRowGroupActive()) {
                this.warn(295, { blockedService: 'Row Groups' });
                return false;
            }
            if (col.isAllowValue() || col.isValueActive() || col.aggFunc) {
                this.warn(295, { blockedService: 'Value Aggregation' });
                return false;
            }
        }
        return true;
    }

    public postConstruct(): void {
        this.setupFunctions();
        this.formulaDataSvc = this.beans.formulaDataSvc;

        const onCellValueChanged = (event: CellValueChangedEvent) => {
            this.onRowDataChanged(event.node as RowNode);
        };

        const onRowNodeDataChanged = (event: RowNodeDataChangedEvent) => {
            this.onRowDataChanged(event.node as RowNode);
        };

        const onNewColumnsLoaded = () => {
            if (!this.isEvaluationActive()) {
                return;
            }
            this.rebuildColRefMap();
            // Columns may have been destroyed and recreated; every cached CellFormula's `.column`
            // reference could be dangling, so we can't safely keep the ASTs around either.
            this.refreshFormulas(true);
        };
        const onColumnMoved = () => {
            if (!this.isEvaluationActive()) {
                return;
            }
            // Rebuild unconditionally: `col.formulaRef` is read by the header and formula input,
            // and absolute `COLUMN("A",true)` refs resolve via `colRefMap`, so both must reflect
            // the new order even when no formula has been evaluated yet.
            this.rebuildColRefMap();
            if (this.cachedResult.size === 0) {
                return;
            }
            // Column instances are stable across a reorder — only their positions changed. Parsed
            // ASTs keep referring to the right colIds; only absolute `COLUMN("A",true)` refs pick
            // up different columns via colRefMap. Bumping the value version re-evaluates surviving
            // cells while preserving their parsed ASTs.
            this.bumpValueCacheAndRefresh();
        };
        const onPinnedRowsChanged = () => {
            const cache = this.cachedResult;
            if (!this.isEvaluationActive() || cache.size === 0) {
                return;
            }
            // Do NOT use `dropRow` here: a pinned row's `pinnedSibling` points back to the
            // unpinned main whose cache entry is still valid (absolute refs resolve via CSRM only).
            // Drop only pinned entries and their group-footer sibling.
            let dropped = false;
            for (const row of cache.keys()) {
                if (row.rowPinned) {
                    cache.delete(row);
                    dropped = true;
                    const sibling = row.sibling;
                    if (sibling) {
                        cache.delete(sibling);
                    }
                }
            }
            if (dropped) {
                this.beans.rowRenderer.refreshCells(REFRESH_CELLS_PARAMS);
            }
        };
        const onModelUpdated = () => {
            if (this.beans.rowModel.getType() === 'clientSide' || !this.isEvaluationActive()) {
                return;
            }
            // SSRM / Infinite / Viewport don't expose per-block changed-row sets, so we conservatively
            // invalidate the entire cache on every model/store update.
            this.refreshFormulas(true);
        };

        // there is no need to check for treeData here because the columnModel
        // already calls `refreshAll` when treeData is updated
        this.addManagedPropertyListeners(['masterDetail', 'enableCellExpressions'], (e) => {
            if (this.formulaColumnsPresent) {
                this.beans.colModel.refreshAll(_convertColumnEventSourceType(e.source));
            }
        });

        this.addManagedListeners(this.beans.eventSvc, {
            cellValueChanged: onCellValueChanged,
            rowNodeDataChanged: onRowNodeDataChanged,
            newColumnsLoaded: onNewColumnsLoaded,
            columnMoved: onColumnMoved,
            modelUpdated: onModelUpdated,
            storeUpdated: onModelUpdated,
            pinnedRowDataChanged: onPinnedRowsChanged,
            pinnedRowsChanged: onPinnedRowsChanged,
        });
    }

    private onRowDataChanged(node: RowNode): void {
        if (!this.active && !this.calculatedColumnsActive) {
            return;
        }
        // Value and row-data changes can fire once for the source node and once for its pinned sibling.
        // Skip the pinned-side event: refreshCells is sync, so running both repaints twice.
        if (node.rowPinned != null && node.pinnedSibling) {
            return;
        }
        // Evict this row's formulas so same-row calculated columns re-evaluate, then invalidate every
        // cached value because an editable formula in another row may reference the changed row.
        this.dropRow(node);
        this.bumpValueCacheAndRefresh(false);
    }

    public override destroy(): void {
        this.active = false;
        this.calculatedColumnsActive = false;
        super.destroy();

        this.cachedResult.clear();
        this.colRefMap.clear();
        this.colToRefMap.clear();
        this.supportedOperations.clear();
        this.functionNames = null;
        this.activeCtx = null;
        this.formulaDataSvc = undefined;
    }

    /** Evict a row and its pinned / group-footer siblings from the cache. */
    private dropRow(row: RowNode): boolean {
        const cache = this.cachedResult;
        let dropped = cache.delete(row);
        const sibling = row.sibling;
        if (sibling) {
            if (cache.delete(sibling)) {
                dropped = true;
            }
            const siblingPinnedSibling = sibling.pinnedSibling;
            if (siblingPinnedSibling && cache.delete(siblingPinnedSibling)) {
                dropped = true;
            }
        }
        const pinnedSibling = row.pinnedSibling;
        if (pinnedSibling && cache.delete(pinnedSibling)) {
            dropped = true;
        }
        return dropped;
    }

    /**
     * Called by CSRM after every model refresh. Drops cache entries for destroyed / updated rows
     * and, when surviving values could be affected by row changes, bumps the value version so they
     * recompute on next read while keeping parsed ASTs.
     */
    public onRowsChanged(changed: _ChangedRowNodes | undefined, newData: boolean | undefined): void {
        if (!this.active && !this.calculatedColumnsActive) {
            return;
        }

        if (newData) {
            this.refreshFormulas(true);
            return;
        }

        // Default `true` covers the no-`changed` path (sort / filter / paginate / column change):
        // row data is unchanged but absolute-index refs may resolve differently.
        let needsRefresh = true;

        if (changed) {
            const { adds, removals, updates, reordered } = changed;
            for (const row of removals) {
                this.dropRow(row);
            }
            for (const row of updates) {
                this.dropRow(row);
            }

            // Bump only when something could actually invalidate surviving formulas:
            //   - reordered: absolute-index row refs (`ROW("N",true)`) resolve to a different row
            //   - removals: a surviving formula might reference a removed row (now #REF!)
            //   - adds:     absolute-index refs (`ROW("N",true)`) can transition from #REF! to a row
            //   - updates:  a surviving formula might reference an updated row's value
            needsRefresh = reordered || removals.length > 0 || adds.size > 0 || updates.size > 0;
        }

        if (needsRefresh) {
            this.bumpValueCacheAndRefresh();
        }
    }

    /**
     * Bulk-invalidate every cached value via a version bump (ASTs preserved) and repaint.
     * O(1); entries become stale on next read.
     */
    private bumpValueCacheAndRefresh(forceRefresh: boolean = true): void {
        this.valueCacheVersion++;
        this.beans.rowRenderer.refreshCells(forceRefresh ? REFRESH_CELLS_PARAMS : undefined);
    }

    /**
     * Re-serialize `params.value` with every relative ref shifted by (`rowDelta`, `columnDelta`).
     * Used by copy/paste and fill-handle to keep relative references pointing at the right cells
     * after a move. Returns the input unchanged if parsing fails.
     *
     * @param params.useRefFormat when false, disables REF-wrapping for the result (unsafe mode).
     */
    public updateFormulaByOffset(params: {
        value: string;
        rowDelta?: number;
        columnDelta?: number;
        useRefFormat?: boolean;
    }): string {
        const { value, rowDelta = 0, columnDelta = 0, useRefFormat = true } = params;
        const beans = this.beans;
        try {
            const unsafe = !useRefFormat;
            const ast = parseFormula(beans, value, unsafe);
            shiftNode(beans, ast, rowDelta, columnDelta, unsafe);
            // Serialize back to a formula string (REF format)
            return serializeFormula(beans, ast, useRefFormat, unsafe);
        } catch {
            return value;
        }
    }

    private setupFunctions() {
        const supportedOperations = (this.supportedOperations = new Map());
        const supportedFunctionNames = Object.keys(SUPPORTED_FUNCTIONS);
        for (let i = 0, len = supportedFunctionNames.length; i < len; ++i) {
            const name = supportedFunctionNames[i];
            supportedOperations.set(name, SUPPORTED_FUNCTIONS[name as keyof typeof SUPPORTED_FUNCTIONS]);
        }
        this.functionNames = null;

        // register custom functions, not reactive.
        const customFuncs = this.gos.get('formulaFuncs');
        if (customFuncs) {
            const customFunctionNames = Object.keys(customFuncs);
            for (let i = 0, len = customFunctionNames.length; i < len; ++i) {
                const name = customFunctionNames[i];
                supportedOperations.set(name.toUpperCase(), customFuncs[name].func);
            }
        }
    }

    public getFunctionNames(): string[] {
        return this.functionNames ?? this.buildFunctionNames();
    }

    private buildFunctionNames(): string[] {
        const supportedOperations = this.supportedOperations;
        const names: string[] = [];

        for (const name of supportedOperations.keys()) {
            if (!isValidFunctionName(name)) {
                continue;
            }
            names.push(name);
        }

        names.sort((a, b) => a.localeCompare(b));
        this.functionNames = names;
        return names;
    }

    /**
     * Rebuild the A1-style label -> AgColumn map from the current primary column order.
     * Does NOT touch the formula cache; callers are responsible for invalidating values if needed.
     */
    private rebuildColRefMap() {
        const { beans, colRefMap, colToRefMap } = this;
        colRefMap.clear();
        colToRefMap.clear();

        if (!this.isEvaluationActive()) {
            return;
        }
        const list = beans.colModel.colsList;
        if (!list) {
            return;
        }

        let idx = 0;
        for (let i = 0, len = list.length; i < len; ++i) {
            const col = list[i];
            if (!col.primary) {
                continue;
            }
            let label = '';
            let n = idx++;
            // generate a column label (A, B, C, ..., Z, AA, AB, ...)
            while (true) {
                label = COL_REF_ALPHABET[n % COL_REF_BASE] + label;
                if (n < COL_REF_BASE) {
                    break;
                }
                n = Math.floor(n / COL_REF_BASE) - 1;
            }
            if (col.formulaRef !== label) {
                col.formulaRef = label;
                col.dispatchColEvent('formulaRefChanged', 'api');
            }
            colRefMap.set(label, col);
            colToRefMap.set(col, label);
        }
    }

    /** Lookup a column by A1-style reference label, e.g. "A", "AB". */
    public getColByRef(ref: string): AgColumn | null {
        return this.colRefMap.get(ref.toUpperCase()) ?? null;
    }

    /** Find the A1-style label for a given column (reverse lookup). */
    public getColRef(col: AgColumn): string | null {
        return this.colToRefMap.get(col) ?? null;
    }

    /** Clear all cached results and re-render cells. */
    public refreshFormulas(refreshCells: boolean): void {
        this.cachedResult.clear();
        if (refreshCells) {
            this.beans.rowRenderer.refreshCells(REFRESH_CELLS_PARAMS);
        }
    }

    /**
     * Drop a row's formula cache (with its sibling chain) and repaint. When given a string id,
     * body / pinned-top / pinned-bottom are all consulted and every match is evicted. Returns
     * `true` if anything was dropped.
     */
    public refreshRow(row: RowNode | string): boolean {
        if (!this.active && !this.calculatedColumnsActive) {
            return false;
        }

        let dropped = false;
        if (typeof row === 'string') {
            const { rowModel, pinnedRowModel } = this.beans;
            const body = rowModel.getRowNode(row) as RowNode | undefined;
            if (body && this.dropRow(body)) {
                dropped = true;
            }
            const pinnedTop = pinnedRowModel?.getPinnedRowById(row, 'top');
            if (pinnedTop && this.dropRow(pinnedTop)) {
                dropped = true;
            }
            const pinnedBottom = pinnedRowModel?.getPinnedRowById(row, 'bottom');
            if (pinnedBottom && this.dropRow(pinnedBottom)) {
                dropped = true;
            }
        } else {
            dropped = this.dropRow(row);
        }

        if (dropped) {
            this.bumpValueCacheAndRefresh();
        }
        return dropped;
    }

    public isFormula(value: unknown): value is `=${string}` {
        return this.active && _isExpressionString(value);
    }

    /**
     * Normalise a formula by parsing and serializing it (REF(COLUMN(), ROW()) format).
     * @returns null if the formula is invalid.
     */
    public normaliseFormula(value: string, shorthand: boolean = false): string | null {
        const beans = this.beans;
        try {
            return serializeFormula(beans, parseFormula(beans, value), !shorthand, false);
        } catch {
            return null;
        }
    }

    /**
     * Validate an expression's syntax and function names without running it. Cell references are
     * NOT validated — callers that care about ref resolution (e.g. the calculated-columns dialog)
     * do that separately, and the formula cell editor relies on runtime cellFormula tooltips.
     * @returns the first encountered FormulaError, or null when the expression is well-formed.
     */
    public validateExpression(expression: string): FormulaError | null {
        try {
            const ast = parseFormula(this.beans, expression, true);
            const bad = findFirstInvalidOperation(ast, (name) => !!this.getFunction(name));
            return bad ? new FormulaError(27, [bad]) : null;
        } catch (error) {
            return error instanceof FormulaError ? error : new FormulaError(1);
        }
    }

    /**
     * Return the `formulaDataSource` formula for (row, col), or undefined. Raw-data `"=..."`
     * values take a separate path via the standard field lookup + `isFormula` check.
     */
    public getDataSourceFormula(row: RowNode, col: AgColumn): string | undefined {
        if (!this.active || !this.formulaDataSvc?.hasDataSource()) {
            return undefined;
        }
        const cf = this.ensureCellFormula(row, col);
        return cf?.fromDataSource ? cf.formulaString : undefined;
    }

    /**
     * Return the current formula error for a cell, or null. Recomputes if the cached entry is
     * stale. Short-circuits for non-formula cells (common in mostly-plain allowFormula columns).
     */
    public getFormulaError(column: AgColumn, node: RowNode): FormulaError | null {
        const cell = this.ensureCellFormula(node, column);
        if (!cell) {
            return null;
        }
        if (!cell.isValueReady()) {
            this.resolveValue(column, node);
        }
        const errorType = cell.errorType;
        if (!errorType) {
            return null;
        }
        const errorId = cell.errorId;
        return errorId != null
            ? new FormulaError(errorId, cell.errorVariableValues ?? undefined, errorType)
            : new FormulaError(cell.errorMessage, errorType);
    }

    /** Get a registered function by name (used by the evaluator). */
    public getFunction(name: string) {
        const supportedOperations = this.supportedOperations;
        return supportedOperations.get(name) ?? supportedOperations.get(name.toUpperCase());
    }

    /**
     * Ensure a `CellFormula` exists for (row, col), or null if the cell isn't a formula.
     * Non-formula results are negatively cached (as `null`) so N dependent formulas referencing
     * the same plain cell trigger one `getFormula` + `fetchRawValue` pair, not N.
     */
    public ensureCellFormula(row: RowNode, col: AgColumn): CellFormula | null {
        const active = this.active;
        const calculatedColumnsActive = this.calculatedColumnsActive;
        if (active && col.allowFormula) {
            if (!calculatedColumnsActive) {
                return this.ensureEditableCellFormula(row, col);
            }

            const calculatedExpression = col.calculatedExpression;
            return calculatedExpression === undefined
                ? this.ensureEditableCellFormula(row, col)
                : this.ensureCalculatedCellFormula(row, col, calculatedExpression ?? '');
        }

        if (!calculatedColumnsActive) {
            return null;
        }

        const calculatedExpression = col.calculatedExpression;
        return calculatedExpression === undefined
            ? null
            : this.ensureCalculatedCellFormula(row, col, calculatedExpression ?? '');
    }

    private ensureEditableCellFormula(row: RowNode, col: AgColumn): CellFormula | null {
        const cache = this.cachedResult;
        let rowMap = cache.get(row);
        const cached = rowMap?.get(col);
        if (cached !== undefined) {
            return cached;
        }
        if (!rowMap) {
            rowMap = new Map<AgColumn, CellFormula | null>();
            cache.set(row, rowMap);
        }

        // Block re-entry for this (row, col) while `ds.getFormula` / `fetchRawValue` runs —
        // either may synchronously call back via api (e.g. a valueGetter hitting `api.getCellValue`).
        rowMap.set(col, null);

        try {
            const dataSvc = this.formulaDataSvc;
            const fromSource = dataSvc?.hasDataSource() ? dataSvc.getFormula({ column: col, rowNode: row }) : undefined;
            if (_isExpressionString(fromSource)) {
                const cellFormula = new CellFormula(row, col, fromSource, true, this.beans, this);
                rowMap.set(col, cellFormula);
                return cellFormula;
            }

            const str = this.fetchRawValue(col, row);
            if (_isExpressionString(str)) {
                const cellFormula = new CellFormula(row, col, str, false, this.beans, this);
                rowMap.set(col, cellFormula);
                return cellFormula;
            }

            return null;
        } catch (e) {
            rowMap.delete(col); // clear the negative cache to retry next time
            throw e;
        }
    }

    private ensureCalculatedCellFormula(row: RowNode, col: AgColumn, calculatedExpression: string): CellFormula | null {
        if (row.stub || row.failedLoad) {
            return null;
        }
        // An actively-aggregating calc col's group row shows the aggregated value, not a formula evaluation.
        // Gate on the active state (not just a defined aggFunc), matching getValueFromData.
        if (col.aggregationActive && row.group) {
            return null;
        }
        // Execute only on rows with their own data — leaf rows and Tree Data parents that carry data.
        // Synthetic rows without data (group rows, footers, tree filler nodes) stay blank.
        if (!row.data) {
            return null;
        }

        const cache = this.cachedResult;
        let rowMap = cache.get(row);
        const cached = rowMap?.get(col);
        if (cached !== undefined) {
            return cached;
        }
        if (!rowMap) {
            rowMap = new Map<AgColumn, CellFormula | null>();
            cache.set(row, rowMap);
        }

        rowMap.set(col, null);

        try {
            const trimmedExpression = calculatedExpression.trim();
            if (!trimmedExpression) {
                return null;
            }
            const formula = trimmedExpression.startsWith('=') ? trimmedExpression : `=${calculatedExpression}`;
            const cellFormula = new CellFormula(row, col, formula, false, this.beans, this);
            rowMap.set(col, cellFormula);
            return cellFormula;
        } catch (e) {
            rowMap.delete(col);
            throw e;
        }
    }

    private coerceFormulaValue(cell: CellFormula, value: unknown): unknown {
        let baseDataType = cell.baseDataType;
        if (baseDataType === undefined) {
            baseDataType = this.beans.dataTypeSvc?.getBaseDataType(cell.column) ?? null;
            cell.baseDataType = baseDataType;
        }
        if (baseDataType === 'bigint') {
            return _parseBigIntOrNull(value) ?? value;
        }
        if (baseDataType === 'number' && typeof value === 'bigint') {
            const asNumber = Number(value);
            return Number.isFinite(asNumber) ? asNumber : value;
        }
        return value;
    }

    /** Fetch a non-formula value from the grid without triggering nested formula calc. */
    private fetchRawValue(col: AgColumn, row: RowNode): unknown {
        if (col.isCalculatedCol) {
            return col.calculatedExpression?.trim() ? undefined : '';
        }
        const valueSvc = this.beans.valueSvc;
        // A referenced pivot result column gives the row's contribution to that bucket: aggregate on a group,
        // and on a leaf its source measure if it falls in the bucket, else blank (it contributes nothing).
        // The blank is returned explicitly — not via getValueFromData, which can resolve the source value.
        const pivotValueCol = col.pivotValueColumn;
        if (pivotValueCol && !row.group && !row.rowPinned) {
            return this.leafInPivotBucket(col, row) ? valueSvc.getValueFromData(pivotValueCol, row) : undefined;
        }
        return valueSvc.getValueFromData(col, row);
    }

    /** True if leaf `row` falls in pivot result column `resultCol`'s bucket — its pivot-dimension keys match. */
    private leafInPivotBucket(resultCol: AgColumn, row: RowNode): boolean {
        const beans = this.beans;
        const pivotCols = beans.pivotColsSvc?.columns;
        const pivotKeys = resultCol.colDef.pivotKeys;
        if (!pivotCols || !pivotKeys) {
            return false;
        }
        const valueSvc = beans.valueSvc;
        for (let i = 0, len = pivotKeys.length; i < len; ++i) {
            const pivotCol = pivotCols[i];
            if (!pivotCol || valueSvc.getKeyForNode(pivotCol, row) !== pivotKeys[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Resolve an `Addr` for `evalAst`. Throws a FormulaError if the cell isn't ready, or the
     * `CellFormula` itself if it holds an error — the outer catch decomposes it, avoiding a
     * FormulaError allocation on the eval hot path.
     */
    public resolveAddrRef(addr: Addr): unknown {
        const { row, column } = addr;
        const cachedRefFormula = this.ensureCellFormula(row, column);
        if (cachedRefFormula) {
            if (!cachedRefFormula.isValueReady()) {
                throw new FormulaError(53);
            }
            if (cachedRefFormula.errorType) {
                throw cachedRefFormula;
            }
            return cachedRefFormula.getValue();
        }
        return this.fetchRawValue(column, row);
    }

    private makeFormulaFrame(address: Addr): FormulaFrame {
        // unresolvedDeps only yields formula cells, so cache must exist.
        const cachedItem = this.ensureCellFormula(address.row, address.column)!;

        const ast = cachedItem.getAst();
        if (!ast) {
            throw new FormulaError(52);
        }

        const unresolvedDepIterator = unresolvedDeps(this.beans, ast, this, address);

        return { address, ast, unresolvedDepIterator };
    }

    /**
     * Evaluate a cell's formula iteratively (no recursion), caching dependency results.
     * Returns the computed value, or a '#...' string on error.
     */
    public resolveValue(column: AgColumn, node: RowNode): unknown {
        // If start cell isn't a formula, return raw value. We don't route through the
        // formatter here — that could loop back through the formula engine.
        const rootCachedCellFormula = this.ensureCellFormula(node, column);
        if (!rootCachedCellFormula) {
            return this.fetchRawValue(column, node);
        }

        // Fast path: cached value / cached error on start.
        if (rootCachedCellFormula.isValueReady()) {
            return rootCachedCellFormula.getValue();
        }

        // Reuse an existing ctx for nested evals (e.g. a valueGetter calling `api.getCellValue`)
        // so they share the visiting set and don't raise false-positive cycle errors.
        const existingCtx = this.activeCtx;
        const ctx = existingCtx ?? (this.activeCtx = new Map());

        const evalStack: FormulaFrame[] = [];

        try {
            // Seed the stack with the root formula cell. Dependencies are added to the tail and
            // the last item is picked each pass — as items are removed from the tail, items at
            // the head should become resolvable.
            formulaVisitorSetVisiting(ctx, node, column);
            evalStack.push(this.makeFormulaFrame({ row: node, column }));

            while (evalStack.length) {
                const { address, ast, unresolvedDepIterator } = evalStack[evalStack.length - 1];
                const { row, column: col } = address;

                // formula is guaranteed to exist for frames; check cache/error each pass.
                const cachedCellFormula = this.ensureCellFormula(row, col)!;

                if (cachedCellFormula.isValueReady()) {
                    evalStack.pop();
                    formulaVisitorSetVisited(ctx, row, col);

                    // Up-to-date but errored: rethrow the cell as its own error carrier. The outer
                    // catch reads the error fields directly off CellFormula so we avoid allocating
                    // a FormulaError just to propagate within the eval loop.
                    if (cachedCellFormula.errorType) {
                        throw cachedCellFormula;
                    }
                    continue;
                }

                const depStep = unresolvedDepIterator.next();
                if (!depStep.done) {
                    const depAddr = depStep.value;
                    const depCachedCellFormula = this.ensureCellFormula(depAddr.row, depAddr.column);
                    if (!depCachedCellFormula || depCachedCellFormula.isValueReady()) {
                        continue;
                    }

                    // value not ready — mark visiting before pushing so cycle detection fires on
                    // the next setVisiting for this cell.
                    formulaVisitorSetVisiting(ctx, depAddr.row, depAddr.column);
                    evalStack.push(this.makeFormulaFrame(depAddr));
                    continue;
                }

                // All deps ready — evaluate this frame. Reuse the frame's `address` as the
                // current-cell arg rather than allocating a fresh `{ row, column }` each iteration.
                const computed = evalAst(this.beans, ast, this, address);
                const coerced = this.coerceFormulaValue(cachedCellFormula, computed);

                // An inner valueGetter might have errored via `errorAllVisitors` during evalAst
                // above, stamping errorType at the current cacheVersion. If so, rethrow the cell
                // itself (no FormulaError allocation) instead of overwriting with the coerced value.
                if (cachedCellFormula.errorType && cachedCellFormula.isValueReady()) {
                    formulaVisitorSetVisited(ctx, row, col);
                    throw cachedCellFormula;
                }

                cachedCellFormula.setComputedValue(coerced);
                formulaVisitorSetVisited(ctx, row, col);
                evalStack.pop();
            }

            if (!rootCachedCellFormula.isValueReady()) {
                throw new FormulaError(53);
            }

            return rootCachedCellFormula.getValue();
        } catch (e) {
            return this.errorAllVisitors(ctx, e);
        } finally {
            // Only the outermost call clears the ctx, so nested evals keep sharing it.
            if (!existingCtx) {
                this.activeCtx = null;
            }
        }
    }

    /**
     * Stamp every still-visiting cell with the final error fields decomposed from `source`.
     * Accepts the thrown value directly (CellFormula, FormulaError, or anything else) so the
     * catch site stays a single call and decomposition happens exactly once per eval cycle.
     * Returns the error type so the catch can use it as the return value.
     */
    private errorAllVisitors(ctx: FormulaVisitorContext, source: unknown): FormulaErrorType {
        let type: FormulaErrorType = '#ERROR!';
        let errorId: FormulaErrorId | null = null;
        let message: string;
        let variableValues: string[] | null = null;
        if (source instanceof CellFormula) {
            // Throw sites only raise a CellFormula after stamping errorType; fall back to the
            // generic error type rather than `null` if that invariant is ever violated.
            type = source.errorType ?? '#ERROR!';
            errorId = source.errorId;
            message = source.errorMessage;
            variableValues = source.errorVariableValues;
        } else if (source instanceof FormulaError) {
            type = source.type;
            errorId = source.errorId;
            message = source.message;
            variableValues = source.variableValues ?? null;
        } else {
            message = String((source as { message?: unknown } | null | undefined)?.message ?? source);
        }
        ctx.forEach((cells, row) => {
            for (const col of cells) {
                this.ensureCellFormula(row, col)?.setErrorFields(type, errorId, message, variableValues);
            }
        });
        return type;
    }
}
