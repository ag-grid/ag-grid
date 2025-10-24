import type {
    AgColumn,
    BeanCollection,
    FormulaFunctionParams,
    IFormulaService,
    NamedBean,
    RowNode,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { parseFormula } from './ast/parsers';
import { colIdFromIndex, colIndexFromId, rowIdFromIndex, rowIndexFromId, serializeFormula } from './ast/serializer';
import type { Cell, CellRef, FormulaNode } from './ast/utils';
import { FormulaError } from './ast/utils';
import type { Addr } from './functions/resolver';
import { evalAst, unresolvedDeps } from './functions/resolver';
import SUPPORTED_FUNCTIONS from './functions/supportedFuncs';

// plunker: https://plnkr.co/edit/8idB7tTubExLB58S?open=main.js
// plunker2: https://plnkr.co/edit/VsIBH0GJb3iyq45c?open=main.js

/**
 * Cell Formula Cache
 * Caches the parsed AST until the formula changes, and the last computed value/error.
 */
export class CellFormula {
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
    ) {}

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
        this._valueStale = false;
    }

    public isValueReady(): boolean {
        return !this._valueStale;
    }

    /**
     * Return the error type or the value
     */
    public getValue(): unknown {
        return this.error?.type ?? this._value;
    }

    public getError(): FormulaError | null {
        return this.error;
    }

    /** Returns the AST for the formula and recomputes if stale */
    public getAst(): FormulaNode | null {
        if (!this.astStale) {
            return this.ast;
        }
        const ast = parseFormula(this.beans, this.formulaString);
        this.ast = ast ?? null;
        this.astStale = false;
        return this.ast;
    }
}

interface FormulaFrame {
    address: Addr;
    ast: FormulaNode;
    unresolvedDepIterator: Generator<Addr>;
}
export class FormulaService extends BeanStub implements IFormulaService, NamedBean {
    public readonly beanName = 'formula' as const;

    /** Cache: row -> (column -> CellFormula) */
    private cachedResult: WeakMap<RowNode, WeakMap<AgColumn, CellFormula>> = new WeakMap();

    /** Map "A", "B", ..., "AA" -> actual AgColumn */
    private colRefMap: Map<string, AgColumn> = new Map();

    /** Built-in operations (extendable via gridOptions.formulaFuncs). */
    // eslint-disable-next-line @typescript-eslint/ban-types
    private supportedOperations: Map<string, (params: FormulaFunctionParams) => unknown>;

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
            rowDataUpdated: this.reset.bind(this),
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

        // Register custom functions, not reactive.
        const customFuncs = this.gos.get('formulaFuncs');
        if (customFuncs) {
            Object.keys(customFuncs).forEach((name) => {
                this.supportedOperations.set(name.toUpperCase(), customFuncs[name].func);
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
    private reset() {
        /**
         * This needs optimised
         * Consider debouncing on high frequency cell value updates
         * Consider only invalidating/refreshing part of the tree.
         */

        this.cachedResult = new WeakMap(); // drops cached values & ASTs
        // if not CSRM, just refresh cells (no re-sort).
        this.beans.rowRenderer.refreshCells();
    }

    /**
     * Is a value a formula string (starts with '=')
     **/
    public isFormula(value: unknown): value is `=${string}` {
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

    /** If the cell has been evaluated and errored, return its last error (else null). */
    public getFormulaError(column: AgColumn, node: RowNode): FormulaError | null {
        const rowMap = this.cachedResult.get(node);
        const cell = rowMap?.get(column);
        return cell?.error ?? null;
    }

    /** Get a registered function by name (used by the evaluator). */
    public getFunction(name: string) {
        return this.supportedOperations.get(name.toUpperCase());
    }

    /** Ensure a CellFormula exists for (row,col) if it's a formula cell; returns null for non-formula. */
    private ensureCellFormula(row: RowNode, col: AgColumn): CellFormula | null {
        // Get or create the per-row cache map
        let rowMap = this.cachedResult.get(row);

        // See if it's already there
        let cf = rowMap?.get(col);
        if (cf) {
            return cf;
        }

        const str = this.fetchRawValue(col, row);
        if (typeof str !== 'string' || str[0] !== '=') {
            return null;
        }

        cf = new CellFormula(row, col, str, this.beans);
        if (!rowMap) {
            rowMap = new Map<AgColumn, CellFormula>();
            this.cachedResult.set(row, rowMap);
        }
        rowMap.set(col, cf);

        return cf;
    }

    /** Fetch a non-formula value from the grid without triggering nested formula calc. */
    private fetchRawValue(col: AgColumn, row: RowNode): unknown {
        return this.beans.valueSvc.getValue(col, row, false, 'ui');
    }

    /**
     * The context needs to be stored at the class level, as if a valueGetter trys to resolve another formula cell
     * using api.getCellValue, cyclic dependency issues may occur.
     */
    private activeCtx: {
        setVisiting: (r: RowNode, c: AgColumn) => void;
        setVisited: (r: RowNode, c: AgColumn) => void;
        errorAllVisitors: (error: FormulaError) => void;
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
                throw new FormulaError('Circular reference', '#CIRCREF!');
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

        const errorAllVisitors = (error: FormulaError) => {
            for (const [row, cells] of stateByCell) {
                for (const col of cells) {
                    const cache = this.ensureCellFormula(row, col);
                    cache?.setError(error);
                }
            }
        };

        return (this.activeCtx = { setVisited, setVisiting, errorAllVisitors });
    }

    private makeFormulaFrame(address: Addr): FormulaFrame {
        // unresolvedDeps only yields formula cells, so cache must exist.
        const cachedItem = this.ensureCellFormula(address.row, address.column)!;

        const ast = cachedItem.getAst();
        if (!ast) {
            throw new FormulaError('Expected parsable formula', '#PARSE!');
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
            evalStack.push(this.makeFormulaFrame({ row: node, column }));
            setVisiting(node, column);

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

                    // if the value is up to date, but an error, re-throw.
                    if (cachedCellFormula.error) {
                        throw cachedCellFormula.error;
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
                        const cachedRefFormula = this.ensureCellFormula(addr.row, addr.column);
                        if (cachedRefFormula) {
                            if (!cachedRefFormula.isValueReady()) {
                                throw new FormulaError('Internal scheduling error');
                            }

                            const error = cachedRefFormula.getError();
                            if (error) {
                                throw error;
                            }
                            return cachedRefFormula.getValue();
                        }
                        return this.fetchRawValue(addr.column, addr.row);
                    },
                    { row, column: col }
                );

                // an inner valueGetter might have errored this path, if so rethrow to avoid
                // overwriting the error with the error value string
                const existing = cachedCellFormula.getError();
                if (existing) {
                    setVisited(row, col);
                    throw existing;
                }

                // cache result and mark as completed
                cachedCellFormula.setComputedValue(computed);
                setVisited(row, col);
                evalStack.pop();
            }

            if (!rootCachedCellFormula.isValueReady()) {
                throw new FormulaError('Internal scheduling error');
            }

            return rootCachedCellFormula.getValue();
        } catch (e: any) {
            // wrap non-formula errors as they were sourced by a user function
            const normalized = e instanceof FormulaError ? e : new FormulaError(String(e?.message ?? e));
            errorAllVisitors(normalized);
            return normalized.type;
        } finally {
            // clear out the active ctx to ensure fresh visiting tree
            if (!hadCtx) {
                this.activeCtx = null;
            }
        }
    }
}
