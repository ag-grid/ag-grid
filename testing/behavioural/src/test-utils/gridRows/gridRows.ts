import { setTimeout as asyncSetTimeout } from 'timers/promises';
import util from 'util';
import { expect } from 'vitest';

import type { Column, EditingCellPosition, GridApi, IRowNode, RowNode } from 'ag-grid-community';

import { log, unindentText } from '../utils';
import { addDiagramToError, collectGridRows } from './grid-rows-helpers';
import type { GridRowsOptions } from './gridRowsOptions';
import { GridRowsDiagramTree } from './rows-diagram/gridRowsDiagramTree';
import { GridRowsDomValidator } from './rows-validation-dom/gridRowsDomValidator';
import type { GridRowsBugs } from './rows-validation/bugs';
import { gridRowsBugs } from './rows-validation/bugs';
import { GridRowsErrors } from './rows-validation/gridRowsErrors';
import { GridRowsValidator } from './rows-validation/gridRowsValidator';
import { getSnapshotUpdateMode, recordSnapshotMismatch } from './snapshot-updater';

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
        return row ? (this.#indexMap ??= this.#makeIndexMap()).get(row) ?? -1 : -1;
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
            new GridRowsValidator(this.errors).validate(this);

            if (this.options.checkDom ?? true) {
                new GridRowsDomValidator(this.errors).validate(this);
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
     *  - 'empty': Assert that there are no displayed rows (empty diagram).
     *  - true: Print the diagram to the console without performing any snapshot comparison or validation.
     *  - false: Skip diagram generation and snapshot comparison, running only GridRowsValidator and GridRowsDomValidator.
     *  - undefined: Logs an error to console reminding you to run `./behave.sh --update-grid-rows` to generate the snapshot.
     */
    public async check(diagramSnapshot: string | 'empty' | boolean | undefined): Promise<this> {
        if (diagramSnapshot === undefined) {
            console.error(
                `'n❌ GridRows.check() called without a snapshot for "${this.label}". Run \`./behave.sh --update-grid-rows\` to generate one.\n`
            );
            diagramSnapshot = false;
        }

        this.loadErrors();

        // Throw validation errors always — don't bake broken snapshots, and don't hide grid bugs.
        if (this.errors.totalErrorsCount > 0) {
            throw this.#makeError(this.check);
        }

        if (diagramSnapshot === true) {
            this.printDiagram();
            return this;
        }

        if (diagramSnapshot === false) {
            return this;
        }

        if (getSnapshotUpdateMode()) {
            // In snapshot update mode: enforce 'empty' assertions but record string mismatches
            // instead of throwing, allowing batch snapshot updates across the whole suite.
            if (diagramSnapshot === 'empty') {
                expect(this.displayedRows.length).toBe(0);
                return this;
            }
            const diagram = this.makeDiagram(false);
            if (unindentText(diagram) !== unindentText(diagramSnapshot)) {
                recordSnapshotMismatch(this.check, diagram, this.label, 'check');
            }
            return this;
        }

        // Retry loop: on failure, rebuild GridRows from scratch (re-reads all grid state) and retry
        // with a short delay. This handles timing issues where the grid hasn't fully settled yet.
        // If it keeps failing after all retries, warn loudly that the test needs an explicit delay.
        const retryDelays = [10, 50, 100];
        let attempt: GridRows<TData> = this;
        let lastError: any;

        for (let i = 0; i <= retryDelays.length; i++) {
            attempt.loadErrors();
            lastError = attempt.#tryCheck(diagramSnapshot);
            if (!lastError) {
                if (i > 0) {
                    console.error(
                        `GridRows flaky check detected for "${this.label}" — passed only after retrying with delays. ` +
                            `Add \`await asyncSetTimeout(N)\` before this check to avoid intermittent failures.`
                    );
                }
                return this;
            }
            if (i < retryDelays.length) {
                await asyncSetTimeout(retryDelays[i]);
                attempt = new GridRows<TData>(this.api, this.label, this.options);
            }
        }

        addDiagramToError(lastError, attempt.makeDiagram(false), this.label);
        Error.captureStackTrace(lastError, this.check);
        throw lastError;
    }

    /** Attempts snapshot check without throwing. Returns the error if failed, null if passed. */
    #tryCheck(diagramSnapshot: string | 'empty'): any {
        if (this.errors.totalErrorsCount > 0) {
            return this.#makeError(this.check);
        }
        const diagram = this.makeDiagram(false);
        try {
            if (diagramSnapshot === 'empty') {
                expect(this.displayedRows.length).toBe(0);
            } else {
                expect(unindentText(diagram)).toEqual(unindentText(diagramSnapshot));
            }
        } catch (e: any) {
            return e;
        }
        return null;
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
