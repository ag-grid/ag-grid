import util from 'util';
import { expect } from 'vitest';

import type { Column, EditingCellPosition, GridApi, IRowNode, RowNode } from 'ag-grid-community';

import { log } from '../utils';
import { addDiagramToError, collectGridRows, makeSnapshotTarget, runSnapshotCheck } from './grid-rows-helpers';
import type { SnapshotCheckTarget } from './grid-rows-helpers';
import { getGridHTMLElement, parseSpannedCell } from './gridHtmlRows';
import type { GridRowsOptions } from './gridRowsOptions';
import { GridRowsDiagramTree } from './rows-diagram/gridRowsDiagramTree';
import { GridRowsDomValidator } from './rows-validation-dom/gridRowsDomValidator';
import type { GridRowsBugs } from './rows-validation/bugs';
import { gridRowsBugs } from './rows-validation/bugs';
import { GridRowsErrors } from './rows-validation/gridRowsErrors';
import { GridRowsValidator } from './rows-validation/gridRowsValidator';
import { getSnapshotUpdateMode } from './snapshot-updater';

export type { GridRowsDomCellValidatorParams, GridRowsDomRowValidatorParams, GridRowsOptions } from './gridRowsOptions';
export type { GridRowsBugs } from './rows-validation/bugs';
export type { GridRowsErrorFilter } from './rows-validation/gridRowErrors';
export type { GridRowErrors } from './rows-validation/gridRowErrors';

export class GridRows<TData = any> {
    public readonly api: GridApi<TData>;
    public readonly bugs: Readonly<GridRowsBugs>;
    public readonly treeData: boolean;
    public readonly rowNodes: RowNode<TData>[];
    public readonly displayedRows: RowNode<TData>[];
    public readonly pinnedTopRows: RowNode<TData>[];
    public readonly pinnedBottomRows: RowNode<TData>[];
    public readonly rootRowNode: RowNode<TData> | null;
    public readonly rootAllLeafChildren: RowNode<TData>[];
    public readonly errors: GridRowsErrors<TData>;

    /** Whether edit state checking is active. Auto-detected from edit module presence unless explicitly set. */
    public readonly checkEditState: boolean;

    /** Whether batch edit state checking is active. Auto-detected from batch edit module presence unless explicitly set. */
    public readonly checkBatchState: boolean;

    #byIdMap: Map<string, RowNode<TData>> | null = null;
    #indexMap: Map<IRowNode<TData>, number> | null = null;
    #displayedRowsSet: Set<RowNode<TData>> | null = null;
    #editingCells: EditingCellPosition[] | null = null;
    #editingRowIndices: Set<number> | null = null;
    #activelyEditingRowIndices: Set<number> | null = null;
    #batchPendingRowIndices: Set<number> | null = null;
    #editingCellKeys: Set<string> | null = null;
    #activeEditorCellKeys: Set<string> | null = null;
    readonly #detailGridRows: Map<IRowNode<TData> | GridApi, GridRows<any>>;
    #rowSpanMap: Map<string, string> | null = null;

    /**
     * @param api The grid API instance
     * @param label A label to identify the grid in error messages and diagrams
     * @param options Options to configure the GridRows instance - please try to not use this, the default options should be enough
     */
    public constructor(
        api: GridApi<TData>,
        public readonly label: string = '',
        public readonly options: GridRowsOptions = {},
        errors?: GridRowsErrors<TData>
    ) {
        this.api = api;
        this.bugs = options.bugs ? { ...gridRowsBugs, ...options.bugs } : gridRowsBugs;
        errors ??= new GridRowsErrors<TData>();
        if (options.onError) {
            errors.errorFilter = options.onError;
        }
        this.errors = errors;
        this.treeData = options.forcedTreeData ?? !!api.getGridOption('treeData');
        // Auto-detect edit module via module registry to avoid triggering error #200 when no editor module is loaded
        this.checkEditState =
            options.checkEditState ?? (api.isModuleRegistered as (name: string) => boolean)('EditCoreModule');
        // Auto-detect batch edit module via module registry
        this.checkBatchState = options.checkBatchState ?? api.isModuleRegistered('BatchEditModule');

        const collected = collectGridRows(api, label, options, errors, GridRows);
        this.rowNodes = collected.rowNodes;
        this.displayedRows = collected.displayedRows;
        this.rootRowNode = collected.rootRowNode;
        this.rootAllLeafChildren = this.rootRowNode?.allLeafChildren ?? [];
        this.pinnedTopRows = collected.pinnedTopRows;
        this.pinnedBottomRows = collected.pinnedBottomRows;
        this.#detailGridRows = collected.detailGridRows;
    }

    public getDetailGridRows(row: IRowNode<TData> | GridApi | null | undefined): GridRows<any> | undefined {
        return row ? this.#detailGridRows.get(row) : undefined;
    }

    /** Rendered row-span marker for a cell: `↧N` on the span anchor (covers N rows), `↥` on a row
     *  covered by the span above, or `''` when the cell does not participate in a row span. Read from
     *  the rendered `.ag-spanned-row` cells (the same source the DOM validator uses). */
    public rowSpanMarker(row: RowNode<TData>, colId: string): string {
        if (row.rowIndex == null) {
            return '';
        }
        const pinned = row.rowPinned ?? '';
        return (this.#rowSpanMap ??= this.#buildRowSpanMap()).get(`${pinned}#${row.rowIndex}#${colId}`) ?? '';
    }

    #buildRowSpanMap(): Map<string, string> {
        const map = new Map<string, string>();
        const root = getGridHTMLElement(this.api);
        if (!root) {
            return map;
        }
        const cells = Array.from(root.querySelectorAll('.ag-spanned-row [col-id]'));
        for (let i = 0, len = cells.length; i < len; ++i) {
            const info = parseSpannedCell(cells[i]);
            if (!info) {
                continue;
            }
            const { colId, pinned, anchorIndex, span } = info;
            map.set(`${pinned}#${anchorIndex}#${colId}`, `↧${span}`);
            for (let j = 1; j < span; ++j) {
                map.set(`${pinned}#${anchorIndex + j}#${colId}`, '↥');
            }
        }
        return map;
    }

    public getAllRowNodesData(): (TData | undefined)[] {
        return this.rowNodes.map((node) => node.data);
    }

    public getAllDisplayedRowsData(): (TData | undefined)[] {
        return this.displayedRows.map((node) => node.data);
    }

    public getById(id: string | null | undefined): RowNode<TData> | undefined {
        return (this.#byIdMap ??= this.#makeByIdMap()).get(String(id));
    }

    public getIndexInRowNodes(row: IRowNode<TData> | null | undefined): number {
        return row ? ((this.#indexMap ??= this.#makeIndexMap()).get(row) ?? -1) : -1;
    }

    public isDuplicateIdRow(row: IRowNode<TData> | null | undefined): boolean {
        if (!row || !('id' in row)) {
            return false;
        }
        const found = this.getById(String(row.id));
        return !found || found !== row;
    }

    public isInRowNodes(row: IRowNode<TData> | null | undefined): boolean {
        return (this.#indexMap ??= this.#makeIndexMap()).has(row as RowNode<TData>);
    }

    public isRowDisplayed(row: IRowNode<TData> | null | undefined): boolean {
        return (this.#displayedRowsSet ??= new Set(this.displayedRows)).has(row as RowNode<TData>);
    }

    /** Returns cached editing cells. Only meaningful when `checkEditState` is true. */
    public getEditingCells(): EditingCellPosition[] {
        return (this.#editingCells ??= this.api.getEditingCells?.() ?? []);
    }

    /** Checks if a row (by rowIndex) has any editing or changed cells. */
    public isRowEditing(row: RowNode): boolean {
        const indices = (this.#editingRowIndices ??= new Set(this.getEditingCells().map((c) => c.rowIndex)));
        return indices.has(row.rowIndex!);
    }

    /** Checks if a row has any cell with an active editor (state === 'editing'). */
    public isRowActivelyEditing(row: RowNode): boolean {
        const indices = (this.#activelyEditingRowIndices ??= new Set(
            this.getEditingCells()
                .filter((c) => c.state === 'editing')
                .map((c) => c.rowIndex)
        ));
        return indices.has(row.rowIndex!);
    }

    /** Checks if a row has any cell with a batch pending change (state !== 'editing'). */
    public isRowBatchPending(row: RowNode): boolean {
        const indices = (this.#batchPendingRowIndices ??= new Set(
            this.getEditingCells()
                .filter((c) => c.state !== 'editing')
                .map((c) => c.rowIndex)
        ));
        return indices.has(row.rowIndex!);
    }

    /** Checks if a specific cell is being edited or has pending changes. */
    public isCellEditing(row: RowNode, colId: string): boolean {
        const keys = (this.#editingCellKeys ??= new Set(
            this.getEditingCells().map((c) => `${c.rowIndex}:${c.rowPinned ?? ''}:${c.colId}`)
        ));
        return keys.has(`${row.rowIndex}:${row.rowPinned ?? ''}:${colId}`);
    }

    /** Checks if a specific cell has an active editor (state === 'editing', not just 'changed'). */
    public isCellActivelyEditing(row: RowNode, colId: string): boolean {
        const keys = (this.#activeEditorCellKeys ??= new Set(
            this.getEditingCells()
                .filter((c) => c.state === 'editing')
                .map((c) => `${c.rowIndex}:${c.rowPinned ?? ''}:${c.colId}`)
        ));
        return keys.has(`${row.rowIndex}:${row.rowPinned ?? ''}:${colId}`);
    }

    public loadErrors(): this {
        if (!this.errors.validated) {
            this.errors.validated = true;
            const validator: GridRowsValidator = new GridRowsValidator(this.errors);
            validator.validate(this);
            if (this.options.checkDom ?? true) {
                const domValidator: GridRowsDomValidator = new GridRowsDomValidator(this.errors);
                domValidator.validate(this);
            }
        }
        return this;
    }

    public makeDiagram(printErrors = false): string {
        const optionsColumns = this.options.forcedColumns ?? true;
        let columns: Column[] | null = optionsColumns ? this.api.getAllGridColumns() : null;
        if (columns && Array.isArray(optionsColumns)) {
            const set = new Set(optionsColumns);
            columns = columns.filter((column) => set.has(column) || set.has(column.getColId()));
        }
        if (printErrors) {
            this.loadErrors();
        }
        return new GridRowsDiagramTree(this).diagramToString(printErrors, columns);
    }

    /** Log this grid's diagram to the console — debugging aid. */
    public draw(): void {
        console.log(this.makeDiagram());
    }

    [util.inspect.custom](): string {
        return this.makeDiagram(true);
    }

    public printDiagram(): this {
        log(this.makeDiagram(true));
        return this;
    }

    /**
     * @param diagramSnapshot The grid rows diagram snapshot.
     *  - Pass a template literal snapshot string to compare against the current diagram output.
     *    If the snapshot does not match the generated diagram, an error will be thrown with the diagram included for debugging.
     *  - Run `./behave.sh --update-grid-rows` to generate or update snapshots automatically.
     *    In update mode, mismatches are recorded instead of throwing, allowing batch snapshot updates.
     *  - `'empty'`: assert that there are no displayed rows.
     *  - `true`: print the diagram to the console without performing snapshot comparison.
     *  - `'skip-snapshot'`: ⚠️ skip snapshot comparison entirely. **Use only temporarily** while
     *    iterating on a test; commit-blocking convention is that no production test ships with
     *    this value. Type accepts no `false` — every `check` call must opt into either a real
     *    snapshot string, `'empty'`, `true`, or the explicit `'skip-snapshot'` escape.
     *  - `undefined`: logs an error reminding you to run `./behave.sh --update-grid-rows`.
     */
    public async check(diagramSnapshot: string | 'empty' | 'skip-snapshot' | true | undefined): Promise<this> {
        await runSnapshotCheck(this.#snapshotTarget(), diagramSnapshot, getSnapshotUpdateMode());
        return this;
    }

    #snapshotTarget(): SnapshotCheckTarget {
        return makeSnapshotTarget(this, {
            methodName: 'check',
            methodRef: this.check,
            rebuild: () => new GridRows<TData>(this.api, this.label, this.options).#snapshotTarget(),
            makeError: () => this.#makeError(this.check),
            assertEmpty: () => expect(this.displayedRows.length).toBe(0),
        });
    }

    #makeByIdMap(): Map<string, RowNode<TData>> {
        const map = new Map<string, RowNode<TData>>();
        const addRow = (row: RowNode<TData> | null | undefined) => {
            if (!row || !('id' in row)) {
                return;
            }
            const id = String(row.id);
            if (!map.has(id)) {
                map.set(id, row);
            }
            if (row.detailNode) {
                addRow(row.detailNode);
            }
        };
        this.rowNodes.forEach(addRow);
        this.displayedRows.forEach(addRow);
        return map;
    }

    #makeIndexMap(): Map<IRowNode<TData>, number> {
        return new Map(this.rowNodes.map((row, index) => [row, index]));
    }

    #makeError(callerFn: (...args: any[]) => any, message = 'Grid errors:'): Error {
        let diagram: string | undefined;
        try {
            diagram = this.makeDiagram(true);
        } catch (error) {
            this.errors.default.add('Error making diagram: ' + error.message);
            this.errors.throwIfAny(callerFn);
            return error;
        }
        const error = new Error(message);
        addDiagramToError(error, diagram, this.label);
        Error.captureStackTrace(error, callerFn);
        return error;
    }
}
