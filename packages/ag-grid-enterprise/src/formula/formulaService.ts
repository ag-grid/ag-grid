import type {
    AgColumn,
    FormulaFunctionParams,
    IFormulaDataService,
    IFormulaService,
    NamedBean,
    RowNode,
    _ChangedRowNodes,
    _ColumnCollections,
} from 'ag-grid-community';
import { BeanStub, _convertColumnEventSourceType, _isExpressionString, _warn } from 'ag-grid-community';

import { parseFormula } from './ast/parsers';
import { serializeFormula } from './ast/serializer';
import type { FormulaNode } from './ast/utils';
import { FormulaError } from './ast/utils';
import { CellFormula } from './cellFormula';
import type { Addr } from './functions/resolver';
import { evalAst, unresolvedDeps } from './functions/resolver';
import SUPPORTED_FUNCTIONS from './functions/supportedFuncs';
import { shiftNode } from './functions/utils';
import type { FormulaErrorId, FormulaErrorType } from './i18n';
import { isValidFunctionName } from './refUtils';

/** Shared params object for `rowRenderer.refreshCells`, hoisted to avoid per-call allocation. */
const REFRESH_CELLS_PARAMS = { suppressFlash: true, force: true } as const;

interface FormulaFrame {
    address: Addr;
    ast: FormulaNode;
    unresolvedDepIterator: Generator<Addr>;
}

export class FormulaService extends BeanStub implements IFormulaService, NamedBean {
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
    private readonly cachedResult: Map<RowNode, Map<AgColumn, CellFormula>> = new Map();

    /**
     * Stored at the class level so a `valueGetter` that resolves another formula cell (e.g. via
     * `api.getCellValue`) reuses the same cycle-detection state instead of hitting a false
     * positive. Read at the top of every `resolveValue` call; null outside of an active eval.
     */
    private activeCtx: {
        setVisiting: (r: RowNode, c: AgColumn) => void;
        setVisited: (r: RowNode, c: AgColumn) => void;
        errorAllVisitors: (source: unknown) => FormulaErrorType;
    } | null = null;

    /** Built-in operations (extendable via gridOptions.formulaFuncs). Read per function call. */
    private supportedOperations: Map<string, (params: FormulaFunctionParams) => unknown>;

    /**
     * Pre-bound view of `ensureCellFormula` that `unresolvedDeps` can invoke without allocating
     * a fresh bound function for every frame push. Bound once during field init.
     */
    private readonly ensureCellFormulaBound = this.ensureCellFormula.bind(this);

    /**
     * Pre-bound callback passed to `evalAst` to resolve an `Addr` into a raw value (or throw a
     * FormulaError if the referenced cell is not ready / errored). Defined as an arrow field so
     * one closure exists per service instance instead of per-frame allocation.
     */
    private readonly resolveAddrRef = (addr: Addr): unknown => {
        const { row, column } = addr;
        const cachedRefFormula = this.ensureCellFormula(row, column);
        if (cachedRefFormula) {
            if (!cachedRefFormula.isValueReady()) {
                throw new FormulaError(53);
            }
            // Cell is fresh; `buildError` skips the version check and allocates a FormulaError
            // only if this cell actually holds an error.
            const error = this.buildError(cachedRefFormula);
            if (error) {
                throw error;
            }
            return cachedRefFormula.getValue();
        }
        return this.fetchRawValue(column, row);
    };

    /** Map "A", "B", ..., "AA" -> actual AgColumn. */
    private readonly colRefMap: Map<string, AgColumn> = new Map();

    /** Reverse lookup for A1 labels by column instance. */
    private readonly colToRefMap: Map<AgColumn, string> = new Map();

    /** Lazy-sorted, validated subset of `supportedOperations` keys surfaced to autocomplete. */
    private functionNames: string[] | null = null;

    /** Cached reference to the optional formula data service, resolved in `postConstruct`. */
    private formulaDataSvc: IFormulaDataService | undefined = undefined;

    /**
     * Cached result of the "any column currently allows formulas?" scan, refreshed on every
     * `setFormulasActive` call (which is the only time the underlying column set changes).
     * Lets property-change listeners skip the O(cols) rescan on every masterDetail /
     * enableCellExpressions toggle.
     */
    private formulaColumnsPresent = false;

    /**
     * Recompute `active`, the `formulaColumnsPresent` cache, and trigger a full formula refresh
     * if the active state changed. Called by `columnModel` whenever the column set changes.
     */
    public setFormulasActive(cols: _ColumnCollections): void {
        const columns = cols.list;
        let formulaColumnsPresent = false;
        for (let i = 0, len = columns.length; i < len; ++i) {
            if (columns[i].isAllowFormula()) {
                formulaColumnsPresent = true;
                break;
            }
        }
        this.formulaColumnsPresent = formulaColumnsPresent;
        const active = formulaColumnsPresent && this.checkForIncompatibleServices(cols);

        if (active !== this.active) {
            this.active = active;
            this.refreshFormulas(true);
        }
    }

    private checkForIncompatibleServices(cols: _ColumnCollections): boolean {
        if (this.gos.get('masterDetail')) {
            _warn(295, { blockedService: 'Master Detail' });
            return false;
        }

        if (this.gos.get('treeData')) {
            _warn(295, { blockedService: 'Tree Data' });
            return false;
        }

        if (this.gos.get('enableCellExpressions')) {
            _warn(295, { blockedService: 'Cell Expressions' });
            return false;
        }

        const columns = cols.list;
        for (let i = 0, len = columns.length; i < len; ++i) {
            const col = columns[i];
            if (col.isAllowPivot() || col.isPivotActive()) {
                _warn(295, { blockedService: 'Column Pivoting' });
                return false;
            }
            if (col.isAllowRowGroup() || col.isRowGroupActive()) {
                _warn(295, { blockedService: 'Row Groups' });
                return false;
            }
            if (col.isAllowValue() || col.isValueActive() || col.getAggFunc()) {
                _warn(295, { blockedService: 'Value Aggregation' });
                return false;
            }
        }

        return true;
    }

    public postConstruct(): void {
        this.setupFunctions();
        this.formulaDataSvc = this.beans.formulaDataSvc;

        const refreshFormulas = () => {
            if (this.active) {
                this.refreshFormulas(true);
            }
        };
        const onNewColumnsLoaded = () => {
            if (!this.active) {
                return;
            }
            this.rebuildColRefMap();
            // Columns may have been destroyed and recreated; every cached CellFormula's `.column`
            // reference could be dangling, so we can't safely keep the ASTs around either.
            this.refreshFormulas(true);
        };
        const onColumnMoved = () => {
            if (!this.active) {
                return;
            }
            // Rebuild unconditionally: `col.formulaRef` is read by the header and formula input,
            // and absolute `COLUMN("A",true)` refs resolve via `colRefMap`, so both must reflect
            // the new order even when no formula has been evaluated yet.
            this.rebuildColRefMap();
            if (this.cachedResult.size === 0) {
                return;
            }
            // Column instances are stable across a reorder - only their positions changed. Parsed
            // ASTs keep referring to the right colIds; only absolute `COLUMN("A",true)` refs pick
            // up different columns via colRefMap. Bumping the value version re-evaluates surviving
            // cells while preserving their parsed ASTs.
            this.bumpValueCacheAndRefresh();
        };
        const onPinnedRowsChanged = () => {
            const cache = this.cachedResult;
            if (!this.active || cache.size === 0) {
                return;
            }
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

        // there is no need to check for treeData here because the columnModel
        // already calls `refreshAll` when treeData is updated
        this.addManagedPropertyListeners(['masterDetail', 'enableCellExpressions'], (e) => {
            if (this.formulaColumnsPresent) {
                this.beans.colModel.refreshAll(_convertColumnEventSourceType(e.source));
            }
        });

        this.addManagedListeners(this.beans.eventSvc, {
            cellValueChanged: refreshFormulas,
            newColumnsLoaded: onNewColumnsLoaded,
            columnMoved: onColumnMoved,
            pinnedRowDataChanged: onPinnedRowsChanged,
            pinnedRowsChanged: onPinnedRowsChanged,
        });
    }

    public override destroy(): void {
        this.active = false;
        super.destroy();

        this.cachedResult.clear();
        this.colRefMap.clear();
        this.colToRefMap.clear();
        this.supportedOperations.clear();
        this.functionNames = null;
        this.activeCtx = null;
        this.formulaDataSvc = undefined;
    }

    /**
     * Evict a row from the cache. Pinned rows and group-feature siblings share the row's `data`
     * object but live as distinct entries, each with its own captured formulaString — drop them
     * all together.
     */
    private dropRow(row: RowNode): void {
        const cache = this.cachedResult;
        cache.delete(row);
        const sibling = row.sibling;
        if (sibling) {
            cache.delete(sibling);
            const siblingPinnedSibling = sibling.pinnedSibling;
            if (siblingPinnedSibling) {
                cache.delete(siblingPinnedSibling);
            }
        }
        const pinnedSibling = row.pinnedSibling;
        if (pinnedSibling) {
            cache.delete(pinnedSibling);
        }
    }

    /**
     * Called by CSRM after every model refresh. Drops cache entries for destroyed / updated rows
     * and, when surviving values could be affected by row changes, bumps the value version so they
     * recompute on next read while keeping parsed ASTs.
     */
    public onRowsChanged(changed: _ChangedRowNodes | undefined, newData: boolean | undefined): void {
        if (!this.active) {
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
     * Bulk-invalidate every cached value (ASTs preserved) and repaint. Cheap O(1): just bumps the
     * version counter so every entry becomes implicitly stale on next read.
     */
    private bumpValueCacheAndRefresh(): void {
        this.valueCacheVersion++;
        this.beans.rowRenderer.refreshCells(REFRESH_CELLS_PARAMS);
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
        const { beans, active, colRefMap, colToRefMap } = this;
        colRefMap.clear();
        colToRefMap.clear();

        if (!active) {
            return;
        }
        const list = beans.colModel.getCols();
        if (!list) {
            return;
        }

        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const base = alphabet.length;

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
                label = alphabet[n % base] + label;
                if (n < base) {
                    break;
                }
                n = Math.floor(n / base) - 1;
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
    public refreshFormulas(refreshCells: boolean) {
        this.cachedResult.clear();
        if (refreshCells) {
            this.beans.rowRenderer.refreshCells(REFRESH_CELLS_PARAMS);
        }
    }

    /**
     * Is a value a formula string (starts with '=')
     **/
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
     * Return the current formula error for a cell, recomputing if the cached entry is stale.
     *
     * Called from rendering/tooltips where callers want the up-to-date error state. Delegates to
     * `resolveValue` which is a no-op when the cell is already fresh (isValueReady check inside).
     */
    public getFormulaError(column: AgColumn, node: RowNode): FormulaError | null {
        this.resolveValue(column, node);
        const cell = this.cachedResult.get(node)?.get(column);
        return cell ? this.buildError(cell) : null;
    }

    /**
     * Construct a FormulaError from a freshly-evaluated cell's stored error fields. The caller is
     * responsible for having verified freshness (via `isValueReady()` or a prior `resolveValue`) -
     * this method does not check the version. Returns null if the cell has no error.
     *
     * Lives on the service (not on CellFormula) so CellFormula stays a lean data holder and the
     * FormulaError allocation is co-located with the other error-shaping logic.
     */
    private buildError(cell: CellFormula): FormulaError | null {
        const errorType = cell.errorType;
        if (!errorType) {
            return null;
        }
        const errorId = cell.errorId;
        if (errorId != null) {
            return new FormulaError(errorId, cell.errorVariableValues ?? undefined, errorType);
        }
        return new FormulaError(cell.errorMessage, errorType);
    }

    /** Get a registered function by name (used by the evaluator). */
    public getFunction(name: string) {
        return this.supportedOperations.get(name.toUpperCase());
    }

    /** Ensure a CellFormula exists for (row,col) if it's a formula cell; returns null for non-formula. */
    private ensureCellFormula(row: RowNode, col: AgColumn): CellFormula | null {
        const cache = this.cachedResult;
        let rowMap = cache.get(row);
        const cached = rowMap?.get(col);
        if (cached) {
            return cached;
        }

        const str = this.getFormulaFromDataSource(row, col) ?? this.fetchRawValue(col, row);
        if (typeof str !== 'string' || str[0] !== '=') {
            return null;
        }

        const cf = new CellFormula(row, col, str, this.beans, this);
        if (!rowMap) {
            rowMap = new Map<AgColumn, CellFormula>();
            cache.set(row, rowMap);
        }
        rowMap.set(col, cf);

        return cf;
    }

    private getFormulaFromDataSource(row: RowNode, col: AgColumn): string | undefined {
        const dataSource = this.formulaDataSvc;
        if (!dataSource?.hasDataSource()) {
            return undefined;
        }
        return dataSource.getFormula({ column: col, rowNode: row });
    }

    private coerceFormulaValue(cell: CellFormula, value: unknown): unknown {
        let baseDataType = cell.baseDataType;
        if (baseDataType === undefined) {
            baseDataType = this.beans.dataTypeSvc?.getBaseDataType(cell.column) ?? null;
            cell.baseDataType = baseDataType;
        }
        if (baseDataType === 'bigint') {
            const bigintValue = this.toBigIntValue(value);
            return bigintValue ?? value;
        }
        if (baseDataType === 'number' && typeof value === 'bigint') {
            const asNumber = Number(value);
            return Number.isFinite(asNumber) ? asNumber : value;
        }
        return value;
    }

    private toBigIntValue(value: unknown): bigint | null {
        if (typeof value === 'bigint') {
            return value;
        }
        if (typeof value === 'number') {
            if (!Number.isFinite(value) || !Number.isInteger(value)) {
                return null;
            }
            return BigInt(value);
        }
        return null;
    }

    /** Fetch a non-formula value from the grid without triggering nested formula calc. */
    private fetchRawValue(col: AgColumn, row: RowNode): unknown {
        return this.beans.valueSvc.getValue(col, row, 'data');
    }

    /**
     * Lazily build (or reuse) the per-evaluation cycle-detection / error-propagation context.
     * Reusing the existing `activeCtx` when nested evaluations occur (e.g. a `valueGetter`
     * calling `api.getCellValue`) keeps one shared visiting set per outer call, so we don't
     * raise false-positive cycle errors across nested eval boundaries.
     */
    private getVisitorContext() {
        if (this.activeCtx) {
            return this.activeCtx;
        }
        const stateByCell = new Map<RowNode, Set<AgColumn>>();
        const setVisiting = (r: RowNode, c: AgColumn): void => {
            let colSet = stateByCell.get(r);

            const isVisiting = colSet?.has(c);
            if (isVisiting) {
                // already visiting, so we have a cycle.
                throw new FormulaError(51);
            }

            if (!colSet) {
                colSet = new Set<AgColumn>();
                stateByCell.set(r, colSet);
            }
            colSet.add(c);
        };

        const setVisited = (r: RowNode, c: AgColumn): void => {
            const colSet = stateByCell.get(r);
            if (colSet) {
                colSet.delete(c);
                if (colSet.size === 0) {
                    stateByCell.delete(r);
                }
            }
        };

        /**
         * Stamp every still-visiting cell with the final error fields decomposed from `source`.
         * Accepts the thrown value directly (CellFormula, FormulaError, or anything else) so the
         * catch site stays a single call and decomposition happens exactly once per eval cycle.
         * Returns the error type so the catch can use it as the return value.
         */
        const errorAllVisitors = (source: unknown): FormulaErrorType => {
            let type: FormulaErrorType;
            let errorId: FormulaErrorId | null;
            let message: string;
            let variableValues: string[] | null;
            if (source instanceof CellFormula) {
                // Throw sites only raise a CellFormula after stamping errorType; fall back to
                // the generic error type rather than `null` if that invariant is ever violated.
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
                type = '#ERROR!';
                errorId = null;
                message = String((source as { message?: unknown } | null | undefined)?.message ?? source);
                variableValues = null;
            }
            // forEach on Map/Set avoids the per-step iterator/entry allocations that destructuring
            // `for...of [row, cells]` pays. Hot on grids with many cascading errors.
            stateByCell.forEach((cells, row) => {
                cells.forEach((col) => {
                    const cache = this.ensureCellFormula(row, col);
                    cache?.setErrorFields(type, errorId, message, variableValues);
                });
            });
            return type;
        };

        return (this.activeCtx = { setVisited, setVisiting, errorAllVisitors });
    }

    private makeFormulaFrame(address: Addr): FormulaFrame {
        // unresolvedDeps only yields formula cells, so cache must exist.
        const cachedItem = this.ensureCellFormula(address.row, address.column)!;

        const ast = cachedItem.getAst();
        if (!ast) {
            throw new FormulaError(52);
        }

        const unresolvedDepIterator = unresolvedDeps(this.beans, ast, this.ensureCellFormulaBound);

        return { address, ast, unresolvedDepIterator };
    }

    /**
     * Evaluate a single cell's formula **iteratively** (no recursion to avoid large stack traces),
     * caching dependency results into their own CellFormula entries.
     *
     * Returns the computed value, or a '#...' string on error.
     */
    public resolveValue(column: AgColumn, node: RowNode): unknown {
        // If start cell isn't a formula, return raw value.
        const rootCachedCellFormula = this.ensureCellFormula(node, column);
        if (!rootCachedCellFormula) {
            // if this isn't a formula shouldn't be resolving here.
            // we don't try to return the formatted value as that could
            // endlessly loop
            return this.fetchRawValue(column, node);
        }

        // Fast path: cached value / cached error on start.
        if (rootCachedCellFormula.isValueReady()) {
            return rootCachedCellFormula.getValue();
        }

        const hadCtx = !!this.activeCtx; // top level call
        const { setVisited, setVisiting, errorAllVisitors } = this.getVisitorContext();

        const evalStack: FormulaFrame[] = [];

        try {
            // Seed the stack with the root formula cell.
            // Dependencies will be added to tail, and the last item is picked each pass
            // As items are removed from the tail, items at the head should become resolvable.
            setVisiting(node, column);
            evalStack.push(this.makeFormulaFrame({ row: node, column }));

            while (evalStack.length) {
                const { address, ast, unresolvedDepIterator } = evalStack[evalStack.length - 1];
                const { row, column: col } = address;

                // formula is guaranteed to exist for frames; check cache/error each pass.
                const cachedCellFormula = this.ensureCellFormula(row, col)!;

                // if not stale and cache ready, short circuit
                if (cachedCellFormula.isValueReady()) {
                    // value is ready, so set complete
                    evalStack.pop();
                    setVisited(row, col);

                    // Up-to-date but errored: rethrow the cell as its own error carrier. The outer
                    // catch reads the error fields directly off CellFormula so we avoid allocating
                    // a FormulaError just to propagate within the eval loop.
                    if (cachedCellFormula.errorType) {
                        throw cachedCellFormula;
                    }
                    continue;
                }

                // pull next unresolved dependency
                const depStep = unresolvedDepIterator.next();
                if (!depStep.done) {
                    const depAddr = depStep.value;
                    const depCachedCellFormula = this.ensureCellFormula(depAddr.row, depAddr.column);
                    if (!depCachedCellFormula || depCachedCellFormula.isValueReady()) {
                        continue; // skip if not formula or value ready
                    }

                    // value not ready, so mark as visiting before adding any dependencies to the stack
                    setVisiting(depAddr.row, depAddr.column);
                    evalStack.push(this.makeFormulaFrame(depAddr)); // push dependency to be resolved
                    continue;
                }

                // all deps ready, evaluate this frame. Reuse the frame's `address` as the
                // current-cell arg rather than allocating a fresh `{ row, column }` each iteration.
                const computed = evalAst(this.beans, ast, this.resolveAddrRef, address);
                const coerced = this.coerceFormulaValue(cachedCellFormula, computed);

                // An inner valueGetter might have errored via errorAllVisitors during evalAst above,
                // which would have stamped errorType with the current cacheVersion. If so, rethrow
                // the cell itself (no FormulaError allocation) instead of overwriting with the coerced value.
                if (cachedCellFormula.errorType && cachedCellFormula.isValueReady()) {
                    setVisited(row, col);
                    throw cachedCellFormula;
                }

                // cache result and mark as completed
                cachedCellFormula.setComputedValue(coerced);
                setVisited(row, col);
                evalStack.pop();
            }

            if (!rootCachedCellFormula.isValueReady()) {
                throw new FormulaError(53);
            }

            return rootCachedCellFormula.getValue();
        } catch (e) {
            return errorAllVisitors(e);
        } finally {
            // clear out the active ctx to ensure fresh visiting tree
            if (!hadCtx) {
                this.activeCtx = null;
            }
        }
    }
}
