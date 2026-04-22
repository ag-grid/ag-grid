import type {
    AgColumn,
    BeanCollection,
    FormulaFunctionParams,
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
import type { Addr } from './functions/resolver';
import { evalAst, unresolvedDeps } from './functions/resolver';
import SUPPORTED_FUNCTIONS from './functions/supportedFuncs';
import { shiftNode } from './functions/utils';
import type { FormulaErrorId, FormulaErrorType } from './i18n';
import { isFormulaIdentChar, isFormulaIdentStart } from './refUtils';

/**
 * Per-cell cache entry.
 *
 * Holds the parsed AST (durable across value invalidation) and the last computed value. The
 * "value freshness" is a version stamp compared against `FormulaService.valueCacheVersion`: a bulk
 * invalidation bumps the service counter once (O(1)) and every entry becomes implicitly stale.
 *
 * Error state stores only the small pieces needed to rebuild a `FormulaError` via
 * `FormulaService.buildError`. We deliberately do NOT hold the original `FormulaError` instance -
 * its stack trace can be several KB per error and adds up fast on grids with many erroring
 * formulas. Reconstruction produces a correctly-typed, translation-capable error; only the
 * original stack trace is lost, which is not user-facing.
 */
export class CellFormula {
    // Hot fields (hit on every read) declared first so V8 keeps them as inline-cache slots.
    /** Version at which `_value` / error fields were computed. -1 = never computed. */
    private _valueVersion = -1;
    public errorType: FormulaErrorType | null = null;
    private _value: unknown = undefined;
    public astStale = true;
    public ast: FormulaNode | null = null;

    // Cold error metadata, only touched when a cell errors. Public so the outer resolveValue catch
    // can decompose a `throw cachedCellFormula` without allocating a FormulaError to propagate.
    public errorId: FormulaErrorId | null = null;
    public errorMessage: string = '';
    public errorVariableValues: string[] | null = null;

    constructor(
        public readonly rowNode: RowNode,
        public readonly column: AgColumn,
        public formulaString: string,
        private readonly beans: BeanCollection,
        private readonly service: FormulaService
    ) {}

    public setFormulaString(next: string) {
        if (this.formulaString === next) {
            return;
        }
        this.formulaString = next;
        this.astStale = true;
        this._valueVersion = -1;
        // inline _clearError: drop the stale error fields
        this.errorType = null;
        this.errorId = null;
        this.errorMessage = '';
        this.errorVariableValues = null;
    }

    /** Cache write: store a fresh computed value (and clear previous error). */
    public setComputedValue(v: unknown) {
        this._value = v;
        this._valueVersion = this.service.valueCacheVersion;
        // inline cleanup - avoids a method call on the hot post-eval path
        this.errorType = null;
        this.errorId = null;
        this.errorMessage = '';
        this.errorVariableValues = null;
    }

    /**
     * Cache write from raw fields - used by the eval loop so it can propagate a thrown
     * `CellFormula` without having to allocate a FormulaError around it.
     */
    public setErrorFields(
        type: FormulaErrorType,
        errorId: FormulaErrorId | null,
        message: string,
        variableValues: string[] | null
    ) {
        this.errorType = type;
        this.errorId = errorId;
        // errorId-based errors derive their message from i18n + variableValues; we don't need to
        // preserve the runtime string. Message-based errors store the raw message so we can
        // rebuild them verbatim.
        this.errorMessage = errorId == null ? message : '';
        this.errorVariableValues = variableValues;
        this._valueVersion = this.service.valueCacheVersion;
    }

    public isValueReady(): boolean {
        return this._valueVersion === this.service.valueCacheVersion;
    }

    /** Return the error type string or the computed value. */
    public getValue(): unknown {
        return this.errorType ?? this._value;
    }

    /** Returns the AST for the formula and recomputes if stale */
    public getAst(): FormulaNode | null {
        if (!this.astStale) {
            return this.ast;
        }
        const ast = parseFormula(this.beans, this.formulaString) ?? null;
        this.ast = ast;
        this.astStale = false;
        return ast;
    }
}

interface FormulaFrame {
    address: Addr;
    ast: FormulaNode;
    unresolvedDepIterator: Generator<Addr>;
}
export class FormulaService extends BeanStub implements IFormulaService, NamedBean {
    public readonly beanName = 'formula' as const;

    /**
     * Cache: RowNode -> (AgColumn -> CellFormula).
     *
     * Map (not WeakMap) so we can iterate for explicit cleanup on destroyed
     * rows. Memory stays bounded because every destructive event purges
     * destroyed entries explicitly (`onRowsChanged`) or wipes the whole map
     * (`refreshFormulas`).
     */
    private readonly cachedResult: Map<RowNode, Map<AgColumn, CellFormula>> = new Map();

    /**
     * Monotonic counter bumped on every bulk invalidation. Each CellFormula stamps this version
     * when it stores a value; a later mismatch means its cached value is implicitly stale. Lets
     * `onRowsChanged` invalidate every entry in O(1) instead of iterating the cache.
     */
    public valueCacheVersion = 0;

    /** Map "A", "B", ..., "AA" -> actual AgColumn */
    private colRefMap: Map<string, AgColumn> = new Map();

    /** Built-in operations (extendable via gridOptions.formulaFuncs). */
    private supportedOperations: Map<string, (params: FormulaFunctionParams) => unknown>;
    private functionNames: string[] | null = null;

    public active = false;

    public setFormulasActive(cols: _ColumnCollections): void {
        const formulaColumnsPresent = cols.list.some((col) => col.isAllowFormula());
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

        return cols.list.every((col) => {
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
            return true;
        });
    }

    public postConstruct(): void {
        this.setupFunctions();

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

        // there is no need to check for treeData here because the columnModel
        // already calls `refreshAll` when treeData is updated
        this.addManagedPropertyListeners(['masterDetail', 'enableCellExpressions'], (e) => {
            const { colModel } = this.beans;
            const formulaColumnsPresent = colModel.cols?.list.some((col) => col.isAllowFormula());
            if (formulaColumnsPresent) {
                colModel.refreshAll(_convertColumnEventSourceType(e.source));
            }
        });

        const onPinnedRowDataChanged = () => {
            if (!this.active) {
                return;
            }
            // Pinned row changes don't flow through CSRM's `onRowsChanged`, but a `pinnedTopRowData`
            // / `pinnedBottomRowData` replacement can reuse RowNodes via `updateData` (new data,
            // same node) or drop them entirely. Both leave stale CellFormula entries in the cache
            // (stale `formulaString` / stale cached value). Drop every pinned-row entry; non-pinned
            // rows never reference pinned rows via absolute refs (those resolve through CSRM only)
            // so their cache is unaffected.
            const cache = this.cachedResult;
            let dropped = false;
            for (const row of cache.keys()) {
                if (row.rowPinned) {
                    cache.delete(row);
                    dropped = true;
                }
            }
            if (dropped) {
                this.beans.rowRenderer.refreshCells({ suppressFlash: true, force: true });
            }
        };

        this.addManagedListeners(this.beans.eventSvc, {
            cellValueChanged: refreshFormulas,
            newColumnsLoaded: onNewColumnsLoaded,
            columnMoved: onColumnMoved,
            pinnedRowDataChanged: onPinnedRowDataChanged,
        });
    }

    /**
     * Called by CSRM after every model refresh. Drops cache entries for destroyed / updated rows
     * and, when surviving values could be affected by row changes, bumps the value version so they
     * recompute on next read while keeping parsed ASTs.
     */
    public onRowsChanged(params: {
        changedRowNodes: _ChangedRowNodes | undefined;
        newData: boolean | undefined;
    }): void {
        if (!this.active) {
            return;
        }

        if (params.newData) {
            this.refreshFormulas(true);
            return;
        }

        const changed = params.changedRowNodes;
        let needsRefresh: boolean;

        if (changed) {
            const cache = this.cachedResult;
            const { removals, updates, reordered } = changed;

            // Pinned rows and group-feature siblings share their `data` object with their main
            // RowNode but are distinct entries in the cache. When the main row is removed/updated
            // we must drop those auxiliary entries too or they'll keep serving stale formula
            // strings (captured at creation) over the now-updated shared data.
            const dropRow = (row: RowNode): void => {
                cache.delete(row);
                const sibling = row.sibling;
                if (sibling) {
                    cache.delete(sibling);
                }
                const pinnedSibling = row.pinnedSibling;
                if (pinnedSibling) {
                    cache.delete(pinnedSibling);
                }
            };

            for (const row of removals) {
                dropRow(row);
            }
            updates.forEach(dropRow);

            // Bump only when something could actually invalidate surviving formulas:
            //   - removals: a surviving formula might reference a removed row (now #REF!)
            //   - updates:  a surviving formula might reference an updated row's value
            //   - reordered: absolute-index row refs (`ROW("N",true)`) resolve to a different row
            // Pure appends (adds with no reorder) leave every existing relative/absolute ref
            // pointing at the same data, so we skip the bump entirely and no surviving formula
            // needs to re-evaluate. New rows populate the cache lazily on their first render.
            needsRefresh = removals.length > 0 || updates.size > 0 || reordered;
        } else {
            // No ChangedRowNodes detail (sort / filter / paginate / column change). Row data is
            // unchanged, but positions may have shifted so absolute-index refs need re-evaluation.
            needsRefresh = true;
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
        this.beans.rowRenderer.refreshCells({ suppressFlash: true, force: true });
    }

    public updateFormulaByOffset(params: {
        value: string;
        rowDelta?: number;
        columnDelta?: number;
        useRefFormat?: boolean;
    }): string {
        const { value, rowDelta = 0, columnDelta = 0, useRefFormat = true } = params;
        const { beans } = this;
        try {
            const unsafe = !useRefFormat;
            const ast = parseFormula(beans, value, unsafe);
            shiftNode(beans, ast, rowDelta, columnDelta, unsafe);

            // Serialize back to a formula string (REF format)
            return serializeFormula(beans, ast, /*useRefFormat*/ useRefFormat, unsafe);
        } catch {
            return value;
        }
    }

    private setupFunctions() {
        this.supportedOperations = new Map();
        Object.keys(SUPPORTED_FUNCTIONS).forEach((name) => {
            this.supportedOperations.set(name, SUPPORTED_FUNCTIONS[name as keyof typeof SUPPORTED_FUNCTIONS]);
        });
        this.functionNames = null;

        // register custom functions, not reactive.
        const customFuncs = this.gos.get('formulaFuncs');
        if (customFuncs) {
            Object.keys(customFuncs).forEach((name) => {
                this.supportedOperations.set(name.toUpperCase(), customFuncs[name].func);
            });
        }
    }

    public getFunctionNames(): string[] {
        if (this.functionNames) {
            return this.functionNames;
        }

        const names: string[] = [];

        for (const name of this.supportedOperations.keys()) {
            if (!isFormulaIdentStart(name[0])) {
                continue;
            }
            if (![...name].every((char) => isFormulaIdentChar(char))) {
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
        if (!this.active) {
            this.colRefMap = new Map();
            return;
        }
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const base = alphabet.length;
        const list = this.beans.colModel.getCols();
        const map = new Map<string, AgColumn>();

        let idx = 0;
        list?.forEach((col) => {
            if (!col.primary) {
                return;
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
            const upper = label.toUpperCase();
            if (col.formulaRef !== upper) {
                col.formulaRef = upper;
                col.dispatchColEvent('formulaRefChanged', 'api');
            }
            map.set(upper, col);
        });

        this.colRefMap = map;
    }

    /** Lookup a column by A1-style reference label, e.g. "A", "AB". */
    public getColByRef(ref: string): AgColumn | null {
        return this.colRefMap.get(ref.toUpperCase()) ?? null;
    }

    /** Find the A1-style label for a given column (reverse lookup). */
    public getColRef(col: AgColumn): string | null {
        for (const [label, value] of this.colRefMap.entries()) {
            if (value === col) {
                return label;
            }
        }
        return null;
    }

    /** Clear all cached results and re-render cells. */
    public refreshFormulas(refreshCells: boolean) {
        this.cachedResult.clear();
        if (refreshCells) {
            this.beans.rowRenderer.refreshCells({ suppressFlash: true, force: true });
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
        const { beans } = this;
        try {
            const parsedAST = parseFormula(beans, value);
            const serialized = serializeFormula(beans, parsedAST, !shorthand, false);
            return serialized;
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
        const dataSource = this.beans.formulaDataSvc;
        if (!dataSource?.hasDataSource()) {
            return undefined;
        }
        return dataSource.getFormula({ column: col, rowNode: row });
    }

    private coerceFormulaValue(column: AgColumn, value: unknown): unknown {
        const baseDataType = this.beans.dataTypeSvc?.getBaseDataType(column);
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
     * The context needs to be stored at the class level, as if a valueGetter trys to resolve another formula cell
     * using api.getCellValue, cyclic dependency issues may occur.
     */
    private activeCtx: {
        setVisiting: (r: RowNode, c: AgColumn) => void;
        setVisited: (r: RowNode, c: AgColumn) => void;
        errorAllVisitors: (source: unknown) => FormulaErrorType;
    } | null;

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

        const unresolvedDepIterator = unresolvedDeps(this.beans, ast, this.ensureCellFormula.bind(this));

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

                // all deps ready, evaluate this frame.
                const computed = evalAst(
                    this.beans,
                    ast,
                    (addr) => {
                        const { row: refRow, column: refCol } = addr;
                        const cachedRefFormula = this.ensureCellFormula(refRow, refCol);
                        if (cachedRefFormula) {
                            if (!cachedRefFormula.isValueReady()) {
                                throw new FormulaError(53);
                            }
                            // Cell is fresh; `buildError` skips the version check and allocates a
                            // FormulaError only if this cell actually holds an error.
                            const error = this.buildError(cachedRefFormula);
                            if (error) {
                                throw error;
                            }
                            return cachedRefFormula.getValue();
                        }
                        return this.fetchRawValue(refCol, refRow);
                    },
                    { row, column: col }
                );
                const coerced = this.coerceFormulaValue(col, computed);

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
