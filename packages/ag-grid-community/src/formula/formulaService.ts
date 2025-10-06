import { _getClientSideRowModel } from '../api/rowModelApiUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { RowNode } from '../entities/rowNode';
import { parseFormula } from './ast/parsers';
import { colIdFromIndex, colIndexFromId, rowIdFromIndex, rowIndexFromId, serializeFormula } from './ast/serializer';
import type { Cell, CellRef, FormulaNode } from './ast/utils';
import { FormulaError } from './ast/utils';
import SUPPORTED_FUNCTIONS from './functions/supportedFuncs';
import { evalAst, iterateCellAddresses } from './functions/utils';

// plunker: https://plnkr.co/edit/8idB7tTubExLB58S?open=main.js
// plunker2: https://plnkr.co/edit/VsIBH0GJb3iyq45c?open=main.js

/** Return the cell's formula string if present (starts with '='); otherwise null. */
const getFormula = (column: AgColumn, node: RowNode): string | null => {
    if (!node.data) {
        return null;
    }

    const { valueGetter, field } = column.colDef;

    let maybe: unknown = null;
    if (field) {
        maybe = (node.data as any)[field];
    } else if (typeof valueGetter === 'function') {
        maybe = valueGetter({ data: node.data, column, node } as any);
    } else {
        return null;
    }

    return typeof maybe === 'string' && maybe.startsWith('=') ? maybe : null;
};

/**
 * Cell Formula Cache
 * Caches the parsed AST until the formula changes, and the last computed value/error.
 */
class CellFormula {
    public error: FormulaError | null = null;
    public ast: FormulaNode | null = null;
    public astStale = true;

    private _value: unknown = undefined;
    private _valueStale = true;

    constructor(
        public readonly rowNode: RowNode,
        public readonly column: AgColumn,
        public formulaString: string,
        private readonly beans: BeanCollection
    ) { }

    public setFormulaString(next: string) {
        if (this.formulaString === next) {
            return;
        }
        this.formulaString = next;
        this.astStale = true;
        this._valueStale = true;
    }

    /** Cache write: store a fresh computed value (and clear previous error). */
    public setComputedValue(v: unknown) {
        this._value = v;
        this._valueStale = false;
        this.error = null;
    }

    /** Cache write: store an error (value considered stale). */
    public setError(e: FormulaError) {
        this.error = e;
        this._valueStale = true;
    }

    /** Try to read cached value if it’s fresh and error-free. */
    public tryGetCachedValue(): { hit: boolean; value?: unknown } {
        if (!this._valueStale && this.error == null) {
            return { hit: true, value: this._value };
        }
        if (this.error != null) {
            return { hit: true, value: this.error.type };
        }
        return { hit: false };
    }

    /** Ensure we have an up-to-date AST (no evaluation here). */
    public ensureAst(): FormulaNode | null {
        if (!this.astStale) {
            return this.ast;
        }
        const ast = parseFormula(this.beans, this.formulaString);
        this.ast = ast ?? null;
        this.astStale = false;
        return this.ast;
    }
}

export class FormulaService extends BeanStub implements NamedBean {
    public readonly beanName = 'formula' as const;

    /** Cache: row -> (column -> CellFormula) */
    private cachedResult: WeakMap<RowNode, WeakMap<AgColumn, CellFormula>> = new WeakMap();

    /** Map "A", "B", ..., "AA" -> actual AgColumn */
    private colRefMap: Map<string, AgColumn> = new Map();

    /** Built-in operations (extendable via gridOptions.formulaFuncs). */
    // eslint-disable-next-line @typescript-eslint/ban-types
    private supportedOperations: Map<string, Function>;

    private formulasEnabled = false;

    public postConstruct(): void {
        this.formulasEnabled = this.gos.get('enableFormulas') === true;
        if (!this.formulasEnabled) {
            return;
        }

        this.setupFunctions();

        this.addManagedListeners(this.beans.eventSvc, {
            newColumnsLoaded: this.setupColRefMap.bind(this),
            columnMoved: this.setupColRefMap.bind(this),
            cellValueChanged: this.reset.bind(this),
        });
    }

    public updateFormulaByOffset(value: string, direction: 'up' | 'down' | 'left' | 'right'): string {
        const beans = this.beans;
        const cols = beans.visibleCols.allCols;
        const ast = parseFormula(this.beans, value);

        // Compute the row and column delta based on drag direction
        const rowDelta = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
        const columnDelta = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;

        // Shift a row reference by dRow, only if it is relative
        const shiftRowRef = (ref?: CellRef) => {
            if (!ref || rowDelta === 0 || ref.absolute) {
                return;
            }

            const idx1 = rowIndexFromId(beans, ref.id); // 1-based
            if (idx1 == null) {
                return;
            }

            const next1 = idx1 + rowDelta;
            if (next1 < 1) {
                return;
            }

            const nextId = rowIdFromIndex(this.beans, next1);
            if (nextId) {
                ref.id = nextId;
            }
        };

        // Shift a column reference by dCol, only if it is relative
        const shiftColRef = (ref?: CellRef) => {
            if (!ref || columnDelta === 0 || ref.absolute) {
                return;
            }

            const i0 = colIndexFromId(beans.colModel, cols, ref.id); // 0-based
            if (i0 == null) {
                return;
            }

            const j0 = i0 + columnDelta;
            if (j0 < 0) {
                return;
            }

            const nextId = colIdFromIndex(cols, j0);
            if (nextId) {
                ref.id = nextId;
            }
        };

        // Type guard to check if an operand value is a cell reference or range
        const isCellOperand = (
            value: string | number | boolean | Cell
        ): value is { column: CellRef; row: CellRef; endColumn?: CellRef; endRow?: CellRef } => {
            return (
                !!value &&
                typeof value === 'object' &&
                value !== null &&
                'row' in (value as any) &&
                'column' in (value as any)
            );
        };

        // Traverse the AST and apply shifts to any cell references
        const shiftNode = (node: FormulaNode): void => {
            if (node.type === 'operand') {
                const { value } = node;
                if (!isCellOperand(value)) {
                    return;
                }

                const { row, column, endRow, endColumn } = value;

                // Shift the primary row and column
                shiftRowRef(row);
                shiftColRef(column);

                // Shift the range end, if present
                shiftRowRef(endRow);
                shiftColRef(endColumn);

                return;
            }

            if (node.type === 'operation') {
                for (const child of node.operands) {
                    shiftNode(child);
                }
            }
        };

        shiftNode(ast);

        // Serialize back to a formula string (REF format)
        return serializeFormula(this.beans, ast, /*useRefFormat*/ true);
    }

    private setupFunctions() {
        // eslint-disable-next-line no-restricted-properties
        this.supportedOperations = new Map(Object.entries(SUPPORTED_FUNCTIONS));

        this.supportedOperations.set('+', SUPPORTED_FUNCTIONS.SUM);
        this.supportedOperations.set('-', SUPPORTED_FUNCTIONS.MINUS);
        this.supportedOperations.set('*', SUPPORTED_FUNCTIONS.MULTIPLY);
        this.supportedOperations.set('/', SUPPORTED_FUNCTIONS.DIVIDE);
        this.supportedOperations.set('^', SUPPORTED_FUNCTIONS.POWER);
        this.supportedOperations.set('%', SUPPORTED_FUNCTIONS.PERCENT);

        // Register custom functions, not reactive.
        const customFuncs = this.gos.get('formulaFuncs');
        if (customFuncs) {
            Object.keys(customFuncs).forEach((name) => {
                this.supportedOperations.set(name, customFuncs[name]!);
            });
        }
    }

    private setupColRefMap() {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const base = alphabet.length;
        const list = this.beans.colModel.getCols();
        const map = new Map<string, AgColumn>();

        let idx = 0;
        list?.forEach((col) => {
            if (!col.isPrimary()) {
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
            if (col.formulaRef !== label.toUpperCase()) {
                col.formulaRef = label.toUpperCase();
                col.dispatchColEvent('formulaRefChanged', 'api');
            }
            map.set(label.toUpperCase(), col);
        });

        this.colRefMap = map;

        this.reset();
    }

    /** Lookup a column by A1-style reference label, e.g. "A", "AB". */
    public getColByRef(ref: string): AgColumn | null {
        return this.colRefMap.get(ref) ?? null;
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
    private reset() {
        /**
         * This needs optimised
         * Consider debouncing on high frequency cell value updates
         * Consider only invalidating/refreshing part of the tree.
         */

        this.cachedResult = new WeakMap(); // drops cached values & ASTs
        // if CSRM, need to refresh everything as sorting/filtering may be impacted.
        const csrm = _getClientSideRowModel(this.beans);
        if (csrm) {
            csrm.refreshModel({ step: 'group' });
        }
        // if not CSRM, just refresh cells (no re-sort).
        this.beans.rowRenderer.refreshCells();
    }

    /**
     * Is a value a formula string (starts with '=')
     **/
    public isFormula(value: unknown): value is string {
        return this.formulasEnabled && typeof value === 'string' && value.startsWith('=');
    }

    /**
     * Normalise a formula by parsing and serializing it (REF(COLUMN(), ROW()) format).
     * @returns null if the formula is invalid.
     */
    public normaliseFormula(value: string, shorthand: boolean = false): string | null {
        try {
            const parsedAST = parseFormula(this.beans, value);
            const serialized = serializeFormula(this.beans, parsedAST, !shorthand);
            return serialized;
        } catch {
            return null;
        }
    }

    /** Does this cell contain a formula (by sniffing its data/valueGetter)? */
    public isFormulaCell(column: AgColumn, node: RowNode): boolean {
        return getFormula(column, node) != null;
    }

    /** Return the raw formula string if present. */
    public getFormula(column: AgColumn, node: RowNode): string | null {
        return getFormula(column, node);
    }

    /** If the cell has been evaluated and errored, return its last error (else null). */
    public getFormulaError(column: AgColumn, node: RowNode): FormulaError | null {
        const rowMap = this.cachedResult.get(node);
        const cell = rowMap?.get(column);
        return cell?.error ?? null;
    }

    /** Get a registered function by name (used by the evaluator). */
    public getFunction(name: string) {
        return this.supportedOperations.get(name);
    }

    /** Get or create the inner Map for a given row in a WeakMap<RowNode, Map<...>>. */
    private getOrCreate<K, V>(wm: WeakMap<RowNode, Map<K, V>>, row: RowNode): Map<K, V> {
        let m = wm.get(row);
        if (!m) {
            m = new Map<K, V>();
            wm.set(row, m);
        }
        return m;
    }

    /** Ensure a CellFormula exists for (row,col) if it's a formula cell; returns null for non-formula. */
    private ensureCellFormula(row: RowNode, col: AgColumn): CellFormula | null {
        // Get or create the per-row cache map
        let rowMap = this.cachedResult.get(row);
        if (!rowMap) {
            rowMap = new Map<AgColumn, CellFormula>();
            this.cachedResult.set(row, rowMap);
        }

        // See if it's already there
        let cf = rowMap.get(col);
        const str = this.getFormula(col, row);
        if (!str) {
            // Not a formula cell — clear any stale entry
            // (Optional) if you want to keep stale CFs for diagnostics, remove the delete.
            if (cf) {
                rowMap.delete(col);
            }
            return null;
        }

        // Create or refresh
        if (!cf) {
            cf = new CellFormula(row, col, str, this.beans);
            rowMap.set(col, cf);
        } else if (cf.formulaString !== str) {
            cf.setFormulaString(str);
        }

        return cf;
    }

    /** Fetch a non-formula value from the grid without triggering nested formula calc. */
    private fetchRawValue(col: AgColumn, row: RowNode): unknown {
        return this.beans.valueSvc.getValue(col, row, false, 'ui');
    }

    /**
     * Evaluate a single cell's formula **iteratively** (no recursion to avoid large stack traces),
     * caching dependency results into their own CellFormula entries.
     *
     * Returns the computed value, or a '#...' string on error.
     */
    public resolveValue(column: AgColumn, node: RowNode): unknown {
        // If start cell isn't a formula, return raw value.
        const startHolder = this.ensureCellFormula(node, column);
        if (!startHolder) {
            return this.fetchRawValue(column, node);
        }

        // Fast path: cached value / cached error on start.
        const cached = startHolder.tryGetCachedValue();
        if (cached.hit) {
            return cached.value;
        }
        if (startHolder.error) {
            return startHolder.error.type;
        }

        // Visitation state for formula cells: 0=unseen, 1=visiting, 2=done
        type Status = 0 | 1 | 2;
        const status = new WeakMap<RowNode, Map<AgColumn, Status>>();
        const getStatus = (r: RowNode, c: AgColumn) => status.get(r)?.get(c) ?? (0 as Status);
        const setStatus = (r: RowNode, c: AgColumn, s: Status) => {
            this.getOrCreate(status, r).set(c, s);
        };

        type Addr = { row: RowNode; column: AgColumn };
        type Frame = {
            addr: Addr;
            phase: 'discover' | 'compute';
            ast?: FormulaNode;
            depIter?: Iterator<Addr>;
        };

        const stack: Frame[] = [{ addr: { row: node, column }, phase: 'discover' }];

        try {
            while (stack.length) {
                const f = stack[stack.length - 1];
                const { row, column: col } = f.addr;

                if (f.phase === 'discover') {
                    const st = getStatus(row, col);
                    if (st === 2) {
                        stack.pop();
                        continue;
                    }
                    if (st === 1) {
                        throw new FormulaError('Circular reference', '#CIRCREF!');
                    }
                    setStatus(row, col, 1); // visiting

                    // Formula cell?
                    const holder = this.ensureCellFormula(row, col);
                    if (!holder) {
                        // Non-formula: nothing to schedule.
                        setStatus(row, col, 2);
                        stack.pop();
                        continue;
                    }

                    // Check cached value / cached error.
                    {
                        const cached = holder.tryGetCachedValue();
                        if (cached.hit) {
                            setStatus(row, col, 2);
                            stack.pop();
                            continue;
                        }
                        if (holder.error) {
                            // Propagate cached error only along current chain (ancestors waiting to compute).
                            const err = holder.error;
                            for (let k = stack.length - 1; k >= 0; k--) {
                                const anc = stack[k];
                                if (anc.phase !== 'compute') {
                                    continue;
                                }
                                const ancCF = this.ensureCellFormula(anc.addr.row, anc.addr.column);
                                if (ancCF) {
                                    ancCF.setError(err);
                                }
                            }
                            throw err;
                        }
                    }

                    // Parse AST and create a lazy dependency iterator.
                    const ast = holder.ensureAst();
                    if (!ast) {
                        throw new FormulaError('Formula parsing error', '#PARSE!');
                    }

                    f.ast = ast;
                    f.depIter = iterateCellAddresses(this.beans, ast);
                    f.phase = 'compute';
                }

                // compute phase: advance dependencies lazily via .next()
                try {
                    // Pull deps one by one until we either schedule a formula dep or deps are exhausted.
                    let scheduled = false;
                    while (true) {
                        const it = f.depIter!;
                        const step = it.next();
                        if (step.done) {
                            break;
                        }

                        const d = step.value;
                        const depHolder = this.ensureCellFormula(d.row, d.column);
                        if (!depHolder) {
                            // Non-formula dependency: read raw at evaluation time, no frame needed.
                            continue;
                        }

                        const stDep = getStatus(d.row, d.column);
                        if (stDep === 1) {
                            throw new FormulaError('Circular reference', '#CIRCREF!');
                        }
                        if (stDep !== 2) {
                            stack.push({ addr: d, phase: 'discover' });
                            scheduled = true;
                            break; // pause current frame until dep is done
                        }
                        // else already done - keep pulling next dep
                    }
                    if (scheduled) {
                        continue;
                    }

                    // All deps consumed - evaluate this AST now.
                    const ast = f.ast!;
                    const val = evalAst(this.beans, ast, (addr) => {
                        const depHolder = this.ensureCellFormula(addr.row, addr.column);
                        if (depHolder) {
                            if (depHolder.error) {
                                throw depHolder.error;
                            }
                            const hit = depHolder.tryGetCachedValue();
                            if (hit.hit) {
                                return hit.value;
                            }
                            // Shouldn't happen: any formula dep should have been scheduled & computed.
                            throw new FormulaError('Internal scheduling error', '#PARSE!');
                        }
                        // Non-formula dependency: read directly.
                        return this.fetchRawValue(addr.column, addr.row);
                    });

                    setStatus(row, col, 2);
                    const holder2 = this.ensureCellFormula(row, col)!;
                    holder2.setComputedValue(val); // persist

                    stack.pop();
                } catch (e: any) {
                    const err = e instanceof FormulaError ? e : new FormulaError(String(e?.message ?? e), '#PARSE!');

                    // Mark failing cell
                    const currCF = this.ensureCellFormula(row, col);
                    if (currCF) {
                        currCF.setError(err);
                    }

                    // Mark all ancestors waiting to compute
                    for (let k = stack.length - 1; k >= 0; k--) {
                        const anc = stack[k];
                        if (anc.phase !== 'compute') {
                            continue;
                        }
                        const ancCF = this.ensureCellFormula(anc.addr.row, anc.addr.column);
                        if (ancCF) {
                            ancCF.setError(err);
                        }
                    }

                    throw err;
                }
            }

            // Success: start cell should now have a cached value.
            const cached = startHolder.tryGetCachedValue();
            return cached.hit ? cached.value : undefined;
        } catch (e: any) {
            const err = e instanceof FormulaError ? e : new FormulaError(String(e?.message ?? e), '#PARSE!');
            startHolder.setError(err);
            return err.type;
        }
    }

    /** True if the user is currently typing a formula into a focused text input. */
    public isWritingFormula = (): boolean => {
        const active = document.activeElement as HTMLInputElement | null;
        if (!active || active.tagName !== 'INPUT' || active.type !== 'text') {
            return false;
        }

        const v = active.value ?? '';
        if (!v.startsWith('=')) {
            return false;
        }

        const last = v.trim().slice(-1);
        if (last !== '(' && last !== ',' && last !== '=') {
            return false;
        }

        return this.beans.focusSvc.doesRowOrCellHaveBrowserFocus();
    };
}
