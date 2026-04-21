import type {
    AgColumn,
    BeanCollection,
    FormulaFunctionParams,
    IFormulaService,
    IRowNode,
    NamedBean,
    RowNode,
    ValueGetterParams,
    _ColumnCollections,
} from 'ag-grid-community';
import {
    BeanStub,
    _addGridCommonParams,
    _convertColumnEventSourceType,
    _getClientSideRowModel,
    _getValueUsingField,
    _isExpressionString,
    _warn,
} from 'ag-grid-community';

import { parseFormula } from './ast/parsers';
import { serializeFormula } from './ast/serializer';
import type { FormulaNode } from './ast/utils';
import { FormulaError } from './ast/utils';
import type { Addr } from './functions/resolver';
import { collectReferencedAddrs, evalAst, unresolvedDeps } from './functions/resolver';
import SUPPORTED_FUNCTIONS from './functions/supportedFuncs';
import { shiftNode } from './functions/utils';
import { isFormulaIdentChar, isFormulaIdentStart } from './refUtils';

/**
 * Cell Formula Cache
 * Caches the parsed AST until the formula changes, and the last computed value/error.
 */
export class CellFormula {
    public error: FormulaError | null = null;
    public ast: FormulaNode | null = null;
    public astStale = true;
    public dependencyKeys: string[] = [];

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
        this.error = null;
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

    public invalidateValue(): void {
        this._valueStale = true;
        this.error = null;
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

type CellKey = string;

export class FormulaService extends BeanStub implements IFormulaService, NamedBean {
    public readonly beanName = 'formula' as const;

    /** Cache: row -> (column -> CellFormula) */
    private cachedResult: WeakMap<RowNode, WeakMap<AgColumn, CellFormula>> = new WeakMap();

    /** Fast lookup for known formula cells and their reverse dependency graph. */
    private readonly formulaByKey: Map<CellKey, CellFormula> = new Map();
    private readonly dependentsByKey: Map<CellKey, Set<CellKey>> = new Map();

    /** Map "A", "B", ..., "AA" -> actual AgColumn */
    private colRefMap: Map<string, AgColumn> = new Map();

    /** Built-in operations (extendable via gridOptions.formulaFuncs). */
    private supportedOperations: Map<string, (params: FormulaFunctionParams) => unknown>;
    private functionNames: string[] | null = null;
    private changeBatchDepth = 0;
    private readonly capturedRoots: Map<CellKey, Addr> = new Map();
    private readonly committedRoots: Map<CellKey, Addr> = new Map();
    private readonly snapshotValues: Map<CellKey, unknown> = new Map();
    private readonly managedFlashCells: Set<CellKey> = new Set();
    private discardCurrentBatch = false;
    private flashNextModelUpdatedRefresh = false;
    private skipNextModelUpdatedRefresh = false;

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

        const resetColMap = () => {
            if (this.active) {
                this.setupColRefMap();
            }
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

        this.addManagedListeners(this.beans.eventSvc, {
            modelUpdated: (event) => {
                if (!this.active) {
                    this.flashNextModelUpdatedRefresh = false;
                    this.skipNextModelUpdatedRefresh = false;
                    return;
                }
                if (event.newData || !this.skipNextModelUpdatedRefresh) {
                    if (this.flashNextModelUpdatedRefresh) {
                        this.refreshFormulasAndFlashChanges();
                    } else {
                        this.refreshFormulas(true);
                    }
                }
                this.flashNextModelUpdatedRefresh = false;
                this.skipNextModelUpdatedRefresh = false;
            },
            newColumnsLoaded: resetColMap,
            columnMoved: resetColMap,
        });
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

    private setupColRefMap() {
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
            if (col.formulaRef !== label.toUpperCase()) {
                col.formulaRef = label.toUpperCase();
                col.dispatchColEvent('formulaRefChanged', 'api');
            }
            map.set(label.toUpperCase(), col);
        });

        this.colRefMap = map;

        this.refreshFormulas(true);
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

    public beginChangeBatch(): void {
        if (!this.active) {
            return;
        }
        this.changeBatchDepth++;
    }

    public endChangeBatch(): void {
        if (!this.active || this.changeBatchDepth === 0) {
            return;
        }
        if (--this.changeBatchDepth > 0) {
            return;
        }
        if (this.discardCurrentBatch) {
            this.discardCurrentBatch = false;
            this.clearTrackedState();
            return;
        }
        this.flushCapturedChanges();
    }

    public captureCellValueChange(row: RowNode, column: AgColumn): void {
        if (!this.active) {
            return;
        }
        const primaryRow = row.primaryRow;
        this.captureRootChange({ row: primaryRow, column });
    }

    public commitCellValueChange(row: RowNode, column: AgColumn): void {
        if (!this.active) {
            return;
        }
        const primaryRow = row.primaryRow;
        const key = this.getCellKey(primaryRow, column);
        this.committedRoots.set(key, { row: primaryRow, column });
    }

    public captureRowDataUpdate(row: RowNode, oldData: any, newData: any): void {
        if (!this.active) {
            return;
        }

        const primaryRow = row.primaryRow;
        const primaryColumns = this.beans.colModel.getCols()?.filter((col) => col.isPrimary()) as
            | AgColumn[]
            | undefined;
        if (!primaryColumns?.length) {
            return;
        }

        for (const column of primaryColumns) {
            const oldValue = this.getValueForData(column, primaryRow, oldData);
            const newValue = this.getValueForData(column, primaryRow, newData);
            if (Object.is(oldValue, newValue)) {
                continue;
            }

            this.captureRootChange({ row: primaryRow, column });
            this.commitCellValueChange(primaryRow, column);
        }
    }

    /**
     * Resolve a committed cell value against an arbitrary row data snapshot.
     * Used by captureRowDataUpdate to diff pre- and post-update source values without
     * consulting live row state or the value cache. Temporarily swaps rowNode.data so
     * valueGetter-backed columns (and any nested getValue calls) see consistent data.
     */
    private getValueForData(column: AgColumn, rowNode: IRowNode, data: any): any {
        const colDef = column.colDef;
        const formulaDataSvc = this.beans.formulaDataSvc;
        if (formulaDataSvc?.hasDataSource() && colDef.allowFormula === true) {
            const formula = formulaDataSvc.getFormula({ column, rowNode });
            if (_isExpressionString(formula)) {
                return formula;
            }
        }

        const valueGetter = colDef.valueGetter;
        const field = colDef.field;
        if (!valueGetter && !field) {
            return undefined;
        }

        const originalData = (rowNode as RowNode).data;
        (rowNode as RowNode).data = data;
        try {
            if (valueGetter) {
                return this.executeValueGetterForData(valueGetter, data, column, rowNode);
            }
            if (field && data) {
                return _getValueUsingField(data, field, column.isFieldContainsDots());
            }
            return undefined;
        } finally {
            (rowNode as RowNode).data = originalData;
        }
    }

    private executeValueGetterForData(
        // eslint-disable-next-line @typescript-eslint/ban-types
        valueGetter: string | Function,
        data: any,
        column: AgColumn,
        rowNode: IRowNode
    ): any {
        const params: ValueGetterParams = _addGridCommonParams(this.gos, {
            data,
            node: rowNode,
            column,
            colDef: column.getColDef(),
            getValue: (field) => {
                const otherColumn = this.beans.colModel.getColDefCol(field);
                return otherColumn ? this.getValueForData(otherColumn, rowNode, data) : null;
            },
        });

        if (typeof valueGetter === 'function') {
            return valueGetter(params);
        }

        return this.beans.expressionSvc?.evaluate(valueGetter, params);
    }

    /**
     * CSRM hook called after a transaction applies but before commitTransactions runs the sort/filter stages.
     * Decides how the upcoming modelUpdated refresh should handle formula recomputation:
     *  - sort active: drop the targeted batch (row addresses may shift) and ask the blanket refresh to flash changed dependents.
     *  - sort inactive: keep the targeted batch and suppress the blanket refresh (the capture/commit path already handled it).
     * Non-updateOnly or empty transactions fall through to the default modelUpdated rebuild.
     */
    public onUpdateOnlyTransactionApplied(): void {
        if (!this.active) {
            return;
        }
        if (this.beans.sortSvc?.isSortActive()) {
            this.discardCurrentBatch = true;
            this.flashNextModelUpdatedRefresh = true;
        } else {
            this.skipNextModelUpdatedRefresh = true;
        }
    }

    public shouldSuppressCellFlash(row: RowNode, column: AgColumn): boolean {
        return this.managedFlashCells.delete(this.getCellKey(row.primaryRow, column));
    }

    /**
     * Blanket rebuild wrapped with flash detection. Snapshots resolved formula values,
     * delegates to refreshFormulas (which clears caches, rebuilds the dep graph, and
     * refreshes with suppressFlash: true), then explicitly flashes cells whose value
     * changed. This covers paths that can't use the targeted capture/commit mechanism,
     * e.g. update-only transactions under active sort where formula row refs shift with
     * the new order and the dep graph must be rebuilt from scratch.
     */
    private refreshFormulasAndFlashChanges(): void {
        if (!this.gos.get('enableFormulaCellFlash')) {
            this.refreshFormulas(true);
            return;
        }

        const snapshot = new Map<CellKey, { row: RowNode; column: AgColumn; value: unknown }>();
        for (const [key, formula] of this.formulaByKey) {
            const value = formula.isValueReady()
                ? formula.getValue()
                : this.resolveValue(formula.column, formula.rowNode);
            snapshot.set(key, { row: formula.rowNode, column: formula.column, value });
        }

        this.refreshFormulas(true);

        if (!snapshot.size) {
            return;
        }

        const cellFlashSvc = this.beans.cellFlashSvc;
        if (!cellFlashSvc) {
            return;
        }

        const changedCellsByRow = new Map<RowNode, AgColumn[]>();
        for (const [key, prev] of snapshot) {
            const formula = this.formulaByKey.get(key);
            if (!formula) {
                continue;
            }
            const nextValue = this.resolveValue(formula.column, formula.rowNode);
            if (Object.is(prev.value, nextValue)) {
                continue;
            }
            const columns = changedCellsByRow.get(formula.rowNode) ?? [];
            columns.push(formula.column);
            changedCellsByRow.set(formula.rowNode, columns);
        }

        if (!changedCellsByRow.size) {
            return;
        }

        // No managedFlashCells coordination here: the preceding refreshFormulas(true) already
        // ran with suppressFlash: true, and flashCell() below bypasses cellCtrl.refreshCell, so
        // no default flash path can fire for these cells. Adding keys now would leave them
        // undrained and silently suppress a future unrelated enableCellChangeFlash update.
        for (const [rowNode, columns] of changedCellsByRow) {
            for (const cellCtrl of this.beans.rowRenderer.getCellCtrls([rowNode], columns)) {
                cellFlashSvc.flashCell(cellCtrl);
            }
        }
    }

    /** Clear all cached results and re-render cells. */
    public refreshFormulas(refreshCells: boolean) {
        this.clearTrackedState();
        this.managedFlashCells.clear();
        this.flashNextModelUpdatedRefresh = false;
        this.skipNextModelUpdatedRefresh = false;
        this.cachedResult = new WeakMap();
        this.formulaByKey.clear();
        this.dependentsByKey.clear();

        if (this.active) {
            this.rebuildDependencyGraph();
        }

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
        let rowMap = this.cachedResult.get(row);

        const str = this.getFormulaFromDataSource(row, col) ?? this.fetchRawValue(col, row);
        if (typeof str !== 'string' || str[0] !== '=') {
            rowMap?.delete(col);
            return null;
        }

        let cf = rowMap?.get(col);
        if (cf) {
            cf.setFormulaString(str);
            return cf;
        }

        cf = new CellFormula(row, col, str, this.beans);
        if (!rowMap) {
            rowMap = new WeakMap<AgColumn, CellFormula>();
            this.cachedResult.set(row, rowMap);
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

    private getCellKey(row: RowNode, column: AgColumn): CellKey {
        return `${row.id ?? row.sourceRowIndex}:${column.getColId()}`;
    }

    private clearTrackedState(): void {
        this.changeBatchDepth = 0;
        this.discardCurrentBatch = false;
        this.capturedRoots.clear();
        this.committedRoots.clear();
        this.snapshotValues.clear();
    }

    private captureRootChange(address: Addr): void {
        const key = this.getCellKey(address.row, address.column);
        if (this.capturedRoots.has(key)) {
            return;
        }

        this.capturedRoots.set(key, address);
        for (const dependentKey of this.collectDependentFormulaKeys(key)) {
            if (this.snapshotValues.has(dependentKey)) {
                continue;
            }

            const formula = this.formulaByKey.get(dependentKey);
            if (!formula) {
                continue;
            }

            const previousValue = formula.isValueReady()
                ? formula.getValue()
                : this.resolveValue(formula.column, formula.rowNode);

            this.snapshotValues.set(dependentKey, previousValue);
        }
    }

    private collectDependentFormulaKeys(rootKey: CellKey): Set<CellKey> {
        const dependents = new Set<CellKey>();
        const pending = [...(this.dependentsByKey.get(rootKey) ?? [])];

        while (pending.length) {
            const dependentKey = pending.pop()!;
            if (dependentKey === rootKey || dependents.has(dependentKey)) {
                continue;
            }

            dependents.add(dependentKey);
            const transitive = this.dependentsByKey.get(dependentKey);
            if (transitive) {
                pending.push(...transitive);
            }
        }

        return dependents;
    }

    private flushCapturedChanges(): void {
        if (!this.committedRoots.size) {
            this.clearTrackedState();
            return;
        }

        // Formula definition changes must update the reverse dependency graph before we
        // recompute dependents, otherwise later edits in the same session would keep using
        // the old source -> dependent links.
        for (const { row, column } of this.committedRoots.values()) {
            const key = this.getCellKey(row, column);
            if (column.isAllowFormula() || this.formulaByKey.has(key)) {
                this.syncFormulaCellDefinition(row, column);
            }
        }

        for (const formulaKey of this.snapshotValues.keys()) {
            this.formulaByKey.get(formulaKey)?.invalidateValue();
        }

        const changedCellsByRow = new Map<RowNode, AgColumn[]>();
        for (const [formulaKey, previousValue] of this.snapshotValues) {
            const formula = this.formulaByKey.get(formulaKey);
            if (!formula) {
                continue;
            }

            const nextValue = this.resolveValue(formula.column, formula.rowNode);
            if (Object.is(previousValue, nextValue)) {
                continue;
            }

            const rowColumns = changedCellsByRow.get(formula.rowNode) ?? [];
            rowColumns.push(formula.column);
            changedCellsByRow.set(formula.rowNode, rowColumns);
        }

        const rootRows = new Set([...this.committedRoots.values()].map(({ row }) => row));
        this.clearTrackedState();

        if (!changedCellsByRow.size) {
            return;
        }

        for (const [rowNode, columns] of changedCellsByRow) {
            if (!rootRows.has(rowNode)) {
                continue;
            }
            for (const column of columns) {
                this.managedFlashCells.add(this.getCellKey(rowNode, column));
            }
        }

        for (const [rowNode, columns] of changedCellsByRow) {
            this.beans.rowRenderer.refreshCells({
                rowNodes: [rowNode],
                columns,
                force: true,
                suppressFlash: true,
            });
        }

        if (!this.gos.get('enableFormulaCellFlash')) {
            return;
        }

        const cellFlashSvc = this.beans.cellFlashSvc;
        if (!cellFlashSvc) {
            return;
        }

        for (const [rowNode, columns] of changedCellsByRow) {
            for (const cellCtrl of this.beans.rowRenderer.getCellCtrls([rowNode], columns)) {
                cellFlashSvc.flashCell(cellCtrl);
            }
        }
    }

    private rebuildDependencyGraph(): void {
        if (!this.active) {
            return;
        }

        const rowModel = _getClientSideRowModel(this.beans);
        const rows = rowModel?.rootNode?._leafs ?? [];
        const formulaColumns = this.beans.colModel.getCols()?.filter((col) => col.isAllowFormula()) as
            | AgColumn[]
            | undefined;

        if (!rows.length || !formulaColumns?.length) {
            return;
        }

        for (const row of rows) {
            for (const column of formulaColumns) {
                this.syncFormulaCellDefinition(row, column);
            }
        }
    }

    private syncFormulaCellDefinition(row: RowNode, column: AgColumn): void {
        const key = this.getCellKey(row, column);
        const previousFormula = this.formulaByKey.get(key);
        const formula = this.ensureCellFormula(row, column);

        if (!formula) {
            if (previousFormula) {
                this.removeDependencyMappings(key, previousFormula);
                this.formulaByKey.delete(key);
            }
            return;
        }

        this.formulaByKey.set(key, formula);
        this.updateDependencyMappings(key, formula);
    }

    private updateDependencyMappings(formulaKey: CellKey, formula: CellFormula): void {
        this.removeDependencyMappings(formulaKey, formula);

        const ast = this.tryGetAst(formula);
        if (!ast) {
            formula.dependencyKeys = [];
            return;
        }

        // Unresolved refs throw FormulaError; isolate the failure so one broken
        // formula can't abort the whole graph rebuild.
        let addrs: Addr[];
        try {
            addrs = collectReferencedAddrs(this.beans, ast);
        } catch {
            formula.dependencyKeys = [];
            return;
        }

        const dependencyKeys = new Set<CellKey>();
        for (const address of addrs) {
            dependencyKeys.add(this.getCellKey(address.row, address.column));
        }

        formula.dependencyKeys = [...dependencyKeys];
        for (const dependencyKey of formula.dependencyKeys) {
            const dependents = this.dependentsByKey.get(dependencyKey) ?? new Set<CellKey>();
            dependents.add(formulaKey);
            this.dependentsByKey.set(dependencyKey, dependents);
        }
    }

    private removeDependencyMappings(formulaKey: CellKey, formula: CellFormula): void {
        for (const dependencyKey of formula.dependencyKeys) {
            const dependents = this.dependentsByKey.get(dependencyKey);
            if (!dependents) {
                continue;
            }
            dependents.delete(formulaKey);
            if (dependents.size === 0) {
                this.dependentsByKey.delete(dependencyKey);
            }
        }
        formula.dependencyKeys = [];
    }

    private tryGetAst(formula: CellFormula): FormulaNode | null {
        try {
            return formula.getAst();
        } catch {
            return null;
        }
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
                                throw new FormulaError(53);
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
                const coerced = this.coerceFormulaValue(col, computed);

                // an inner valueGetter might have errored this path, if so rethrow to avoid
                // overwriting the error with the error value string
                const existing = cachedCellFormula.getError();
                if (existing) {
                    setVisited(row, col);
                    throw existing;
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
