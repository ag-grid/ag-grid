import { _isExpressionString } from 'ag-stack';

import type { GridApi } from '../api/gridApi';
import type { ColumnModel } from '../columns/columnModel';
import type { DataTypeService } from '../columns/dataTypeService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { EditService } from '../edit/editService';
import type { AgColumn } from '../entities/agColumn';
import { _resolvePivotColumnForRow } from '../entities/agColumn';
import type {
    ColDef,
    ColKey,
    KeyCreatorParams,
    ValueFormatterParams,
    ValueGetterParams,
    ValueParserParams,
    ValueSetterParams,
} from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNode } from '../entities/rowNode';
import type { CellValueChangedEvent } from '../events';
import { _isServerSideRowModel } from '../gridOptionsUtils';
import type { IFormulaDataService, IFormulaService } from '../interfaces/formulas';
import type { CellValueResolveFrom } from '../interfaces/iEditService';
import type { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import type { IRowGroupingEditValueSvc } from '../interfaces/iRowGroupingEditValueSvc';
import type { IRowNode } from '../interfaces/iRowNode';
import type { IShowRowGroupColsValueService } from '../interfaces/iShowRowGroupColsValueService';
import type { IShowValuesAsService } from '../interfaces/iShowValuesAsService';
import { _getValueUsingDotPath } from '../utils/value';
import type { ChangeDetectionService } from './changeDetectionService';
import type { ExpressionService } from './expressionService';
import type { ValueCache } from './valueCache';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ValueService extends BeanStub implements NamedBean {
    beanName = 'valueSvc' as const;

    // Hot-path fields first (read on every getValue call). All declared with primitive
    // defaults so V8 picks a stable hidden-class shape from the moment the instance is
    // constructed — `init()` and `postConstruct` overwrite values without reshaping.
    private isTreeData: boolean = false;
    private isSsrm: boolean = false;
    private cellExpressions: boolean = false;
    private groupSuppressBlankHeader: boolean = false;

    private editSvc: EditService | undefined = undefined;
    private valueCache: ValueCache | undefined = undefined;
    private colModel!: ColumnModel;
    private expressionSvc: ExpressionService | undefined = undefined;
    private dataTypeSvc: DataTypeService | undefined = undefined;
    private formula: IFormulaService | undefined = undefined;
    private showValuesAsSvc: IShowValuesAsService | undefined = undefined;
    private formulaDataSvc: IFormulaDataService | undefined = undefined;
    private changeDetectionSvc: ChangeDetectionService | undefined = undefined;
    private showRowGroupColValueSvc: IShowRowGroupColsValueService | undefined = undefined;
    private rowGroupingEditValueSvc: IRowGroupingEditValueSvc | undefined = undefined;
    private frameworkOverrides: IFrameworkOverrides = undefined!;
    private gridApi: GridApi = undefined!;
    private gridOptions: GridOptions = undefined!;

    public wireBeans(beans: BeanCollection): void {
        this.expressionSvc = beans.expressionSvc;
        this.colModel = beans.colModel;
        this.valueCache = beans.valueCache;
        this.dataTypeSvc = beans.dataTypeSvc;
        this.editSvc = beans.editSvc;
        this.formulaDataSvc = beans.formulaDataSvc;
        this.formula = beans.formula;
        this.showValuesAsSvc = beans.showValuesAsSvc;
        this.changeDetectionSvc = beans.changeDetectionSvc;
        this.showRowGroupColValueSvc = beans.showRowGroupColValueSvc;
        this.rowGroupingEditValueSvc = beans.rowGroupingEditValueSvc;
        this.frameworkOverrides = beans.frameworkOverrides;
        this.gridApi = beans.gridApi;
        this.gridOptions = beans.gridOptions;
        this.init();
    }

    /** Called by both wireBeans and postConstruct */
    private init(): void {
        const gos = this.gos;
        this.isSsrm = _isServerSideRowModel(gos);
        this.cellExpressions = gos.get('enableCellExpressions');
        this.isTreeData = gos.get('treeData');
        this.groupSuppressBlankHeader = gos.get('groupSuppressBlankHeader');
        if (!gos.get('valueCache')) {
            this.valueCache = undefined; // Drop the cache ref when disabled.
        }
    }

    public postConstruct(): void {
        this.init();

        // We listen to our own event and use it to call the columnSpecific callback,
        // this way the handler calls are correctly interleaved with other global events
        const listener = (event: CellValueChangedEvent) => this.callColumnCellValueChangedHandler(event);
        this.eventSvc.addListener('cellValueChanged', listener, true);
        this.addDestroyFunc(() => this.eventSvc.removeListener('cellValueChanged', listener, true));

        this.addManagedPropertyListener('treeData', (propChange) => (this.isTreeData = propChange.currentValue));
        this.addManagedPropertyListener(
            'groupSuppressBlankHeader',
            (propChange) => (this.groupSuppressBlankHeader = propChange.currentValue)
        );
    }

    /**
     * Use this function to get a displayable cell value.
     * The values from this function are not used for sorting, filtering, or aggregation purposes.
     * Handles: groupHideOpenParents, showOpenedGroup and groupSuppressBlankHeader behaviours
     */
    public getValueForDisplay(params: {
        column?: AgColumn;
        node: IRowNode;
        includeValueFormatted?: boolean;
        useRawFormula?: boolean;
        exporting?: boolean;
        from: CellValueResolveFrom;
        transformValues?: boolean;
    }): {
        value: any;
        valueFormatted: string | null;
    } {
        const column = params.column;
        const node = params.node;
        const isGroup = node.group;
        const showRowGroupColValueSvc = this.showRowGroupColValueSvc;
        const isFullWidthGroup = !column && isGroup;

        // handle group cell value. Tree-data auto col acts as a traditional column except for footers, so
        // the tree-data check is last — skipped for the common non-group-display column.
        if (
            showRowGroupColValueSvc &&
            (isFullWidthGroup || column?.showRowGroup) &&
            (!this.isTreeData || node.footer)
        ) {
            const groupValue = showRowGroupColValueSvc.getGroupValue(
                node,
                column,
                isGroup ? this.displayIgnoresAggData(node) : false
            );
            if (groupValue == null) {
                return { value: null, valueFormatted: null };
            }

            return {
                value: groupValue.value,
                valueFormatted: params.includeValueFormatted
                    ? showRowGroupColValueSvc.formatAndPrefixGroupColValue(groupValue, column, params.exporting)
                    : null,
            };
        }

        // full width row, not full width group - probably should be supported by getValue
        if (!column) {
            return { value: node.key, valueFormatted: null };
        }

        const ignoreAggData = isGroup ? this.displayIgnoresAggData(node) : false;
        let value = this.getValue(column, node, params.from, ignoreAggData);
        let valueToFormat = value;

        // Read this.formula only for formula-enabled columns — skipped for the common case.
        if (column.allowFormula) {
            const formula = this.formula;
            if (formula?.isFormula(value)) {
                if (params.useRawFormula) {
                    value = formula.normaliseFormula(value, true);
                    valueToFormat = formula.resolveValue(column, node as RowNode);
                } else {
                    value = formula.resolveValue(column, node as RowNode);
                    valueToFormat = value;
                }
            }
        }

        const format =
            params.includeValueFormatted && !(params.exporting && column.colDef.useValueFormatterForExport === false);

        // Show Values As: a dormant mode (selected but not applicable in this view) keeps the raw value, but its
        // formatter still runs with `notApplicable` so the built-in formatters can show `#N/A`.
        if (params.transformValues) {
            const showValuesAsSvc = this.showValuesAsSvc;
            if (showValuesAsSvc && !ignoreAggData && column.showValuesAs != null) {
                const applying = showValuesAsSvc.isApplying(column);
                // Both paths use `valueToFormat` (formula already resolved) — a dormant mode must show the resolved
                // raw value, never the unresolved formula string that `value` can hold under `useRawFormula`.
                const transformed = applying ? showValuesAsSvc.transform(column, node, valueToFormat) : valueToFormat;
                return {
                    value: transformed,
                    valueFormatted: format
                        ? showValuesAsSvc.formatValue(column, node, transformed, valueToFormat, !applying)
                        : null,
                };
            }
        }

        return {
            value,
            valueFormatted: format ? this.formatValue(column, node, valueToFormat) : null,
        };
    }

    /**
     * The cell's displayed value with the Show Values As transform applied, or the raw value when no mode is
     * active or applying. Reads pending edits like the display path, then resolves formulas / calculated columns.
     * Leaner than {@link getValueForDisplay} — no group-cell, full-width, or formatting work.
     */
    public getTransformedValue(column: AgColumn, node: IRowNode): any {
        const ignoreAggData = node.group ? this.displayIgnoresAggData(node) : false;
        const value = this.getValue(column, node, 'edit', ignoreAggData);
        return this.resolveTransformed(column, node, value, ignoreAggData);
    }

    /** Resolves a formula/calculated value then applies the Show Values As transform when a mode is applying;
     *  otherwise returns the (formula-resolved) value. Shared by the display + transformed read paths. */
    private resolveTransformed(column: AgColumn, node: IRowNode, value: any, ignoreAggData: boolean): any {
        if (column.allowFormula) {
            const formula = this.formula;
            if (formula?.isFormula(value)) {
                value = formula.resolveValue(column, node as RowNode);
            }
        }
        const showValuesAsSvc = this.transformingSvc(column, ignoreAggData);
        return showValuesAsSvc ? showValuesAsSvc.transform(column, node, value) : value;
    }

    /**
     * Display value only — same resolution as {@link getValueForDisplay} but returns the bare value,
     * skipping formatting and the result-object allocation. For callers that never read `valueFormatted`.
     */
    public getDisplayValue(
        column: AgColumn | undefined,
        node: IRowNode,
        from: CellValueResolveFrom,
        transformValues: boolean
    ): any {
        const isGroup = node.group;
        const showRowGroupColValueSvc = this.showRowGroupColValueSvc;
        const isFullWidthGroup = !column && isGroup;

        if (
            showRowGroupColValueSvc &&
            (isFullWidthGroup || column?.showRowGroup) &&
            (!this.isTreeData || node.footer)
        ) {
            const groupValue = showRowGroupColValueSvc.getGroupValue(
                node,
                column,
                isGroup ? this.displayIgnoresAggData(node) : false
            );
            return groupValue == null ? null : groupValue.value;
        }

        if (!column) {
            return node.key;
        }

        const ignoreAggData = isGroup ? this.displayIgnoresAggData(node) : false;
        // Show Values As: `transformValues` applies the transform on top of the `from` base.
        const value = this.getValue(column, node, from, ignoreAggData);
        if (transformValues) {
            return this.resolveTransformed(column, node, value, ignoreAggData);
        }
        if (column.allowFormula) {
            const formula = this.formula;
            if (formula?.isFormula(value)) {
                return formula.resolveValue(column, node as RowNode);
            }
        }
        return value;
    }

    // PERFORMANCE CRITICAL — the hot read path (grouping, sort, agg, filter, rendering all reach here).
    // Reads committed data for `column` exactly as given — NO pivot-result-column redirection and no
    // pending-edit lookup. Callers that may hold a pivot result column (pivot edit, API reads, pivot
    // aggregation) must pre-resolve via `_resolvePivotColumnForRow`. Run the getValue benchmark to verify.
    // This does NOT resolve pending edit values (edit or batch)
    public getValueFromData(column: AgColumn, rowNode: IRowNode, ignoreAggData: boolean = false): any {
        // An actively-aggregating calc col aggregates its per-leaf results, so group rows read aggData
        // instead of re-evaluating the formula (gated on the active state, not just a defined aggFunc).
        const evaluateFormula = column.isCalculatedCol && !(column.aggregationActive && rowNode.group);
        let result = evaluateFormula
            ? this.formula?.resolveValue(column, rowNode as RowNode)
            : this.resolveCoreValue(column, rowNode, ignoreAggData);

        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && _isExpressionString(result)) {
            const cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, rowNode.data, column, rowNode);
        }

        return result;
    }

    /**
     * Reads a cell value honouring pending edits for non-`'data'` sources. Does NOT redirect pivot result
     * columns — display/selection callers only ever pair them with group rows (no redirect needed). The
     * value APIs that accept an arbitrary node (`getCellValue`, `getDataValue`) pre-resolve via
     * `_resolvePivotColumnForRow` since they can be handed a leaf. Hot committed-data reads of a known column
     * should call {@link getValueFromData} directly to skip the edit-state lookup too.
     */
    public getValue(
        column: AgColumn,
        rowNode: IRowNode | null | undefined,
        from: CellValueResolveFrom,
        ignoreAggData: boolean = false
    ): any {
        if (!rowNode) {
            return;
        }
        if (from !== 'data') {
            // null is a valid pending value, so only `undefined` falls through to committed data.
            const pending = this.editSvc?.getPendingEditValue(rowNode, column, from);
            if (pending !== undefined) {
                return pending;
            }
        }
        return this.getValueFromData(column, rowNode, ignoreAggData);
    }

    /** Whether to ignore aggregation data for display. Callers must pass a group node (guard on `node.group`). */
    public displayIgnoresAggData(node: IRowNode): boolean {
        // If doing grouping and footers, we don't want to include the agg value
        // in the header when the group is open.
        // Result is: isOpenedGroup && !groupShowsAggData

        // Check isOpenedGroup conditions: !node.footer && !isPivotLeaf && node.expanded
        // The root node (level -1) is always expanded but should not suppress its agg data display.
        if (node.footer || node.level === -1) {
            return false;
        }
        // groupShowsAggData = this.groupSuppressBlankHeader || !node.sibling
        // We return true only if !groupShowsAggData, i.e., !groupSuppressBlankHeader && node.sibling
        if (!node.sibling || this.groupSuppressBlankHeader) {
            return false;
        }
        // When in pivot mode, leafGroups cannot be expanded
        if (node.leafGroup && this.colModel.pivotMode) {
            return false;
        }
        // node.expanded (getter with side effects) evaluated last
        return !!node.expanded;
    }

    /** The Show Values As service iff `column`'s active mode is currently transforming (not dormant) for display.
     *  `column.showValuesAs` is null for every ordinary column, so this is a no-op outside the feature. */
    private transformingSvc(column: AgColumn, ignoreAggData: boolean): IShowValuesAsService | undefined {
        const svc = this.showValuesAsSvc;
        return svc && !ignoreAggData && column.showValuesAs && svc.isApplying(column) ? svc : undefined;
    }

    // PERFORMANCE CRITICAL — the inner resolver for every non-calculated-column read on the hot path
    // (reached from getValueFromData). Keep allocation-free and branch-cheap; run the getValue benchmark.
    private resolveCoreValue(column: AgColumn, rowNode: IRowNode, ignoreAggData: boolean): any {
        const isGroup = rowNode.group;

        // Skipped for group rows — formulas + row grouping are not supported together.
        if (!isGroup && column.allowFormula) {
            const formula = this.formula?.getDataSourceFormula(rowNode as RowNode, column);
            if (formula !== undefined) {
                return formula;
            }
        }

        const data = rowNode.data;
        const isTreeData = this.isTreeData;

        // groupData/aggData only exist on group rows (and tree-data nodes) — skip the lookups (and the
        // colId read) entirely for the dominant non-tree leaf case.
        if (isGroup || isTreeData) {
            // Only group rows have aggData — skip for leaf rows
            const aggData = isGroup && !ignoreAggData ? rowNode.aggData : undefined;
            const colId = column.colId;
            const aggDataValue = aggData?.[colId];
            if (isTreeData) {
                if (aggDataValue !== undefined) {
                    return aggDataValue;
                }
                const valueGetter = column.valueGetter;
                let treeValue;
                if (valueGetter) {
                    treeValue = this.executeValueGetter(valueGetter, data, column, rowNode);
                } else if (data) {
                    // field read deferred to here — skipped entirely on the valueGetter branch above
                    const field = column.field;
                    if (field) {
                        const fieldPath = column.fieldPath;
                        treeValue = fieldPath ? _getValueUsingDotPath(data, fieldPath) : data[field];
                    }
                }
                if (treeValue !== undefined) {
                    return treeValue;
                }
            }

            const groupData = rowNode.groupData;
            if (groupData && colId in groupData) {
                return groupData[colId];
            }
            if (aggDataValue !== undefined) {
                return aggDataValue;
            }
        }

        const valueGetter = column.valueGetter;
        // ignoreAggData (a free param) is tested first so the isSsrm/aggFunc reads are skipped on the common path.
        const ignoreSsrmAggData = ignoreAggData && this.isSsrm && !!column.aggFunc;

        // Group-only machinery: display columns blank values shallower than their group level, and SSRM group
        // footers mirror the group field. Leaf rows are never display/footer columns, so they fall straight
        // through to the shared field/valueGetter read below (skipping the showRowGroup/footer checks).
        if (isGroup) {
            const rowGroupColId = column.showRowGroup;
            if (valueGetter && !ignoreSsrmAggData) {
                // string showRowGroup → group display col: blank instead of running the value getter
                if (typeof rowGroupColId === 'string') {
                    return groupDisplayColEmptyValue(this.colModel, rowGroupColId, rowNode.level);
                }
                return this.executeValueGetter(valueGetter, data, column, rowNode);
            }
            // SSRM footer read must precede the string-showRowGroup blank below.
            if (this.isSsrm && data) {
                const ssrmFooterValue = readSsrmFooterGroupValue(rowNode, data, rowGroupColId);
                if (ssrmFooterValue !== undefined) {
                    return ssrmFooterValue;
                }
            }
            if (typeof rowGroupColId === 'string') {
                return groupDisplayColEmptyValue(this.colModel, rowGroupColId, rowNode.level);
            }
        }

        // Shared by leaf rows and ordinary (non-display) group columns.
        if (valueGetter) {
            return ignoreSsrmAggData ? undefined : this.executeValueGetter(valueGetter, data, column, rowNode);
        }
        const field = column.field;
        if (!field || !data || ignoreSsrmAggData) {
            return undefined;
        }
        const fieldPath = column.fieldPath;
        return fieldPath ? _getValueUsingDotPath(data, fieldPath) : data[field];
    }

    public parseValue<TValueNew = any, TValueOld = any, TValue = any>(
        column: AgColumn,
        rowNode: IRowNode | null,
        newValue: TValueNew,
        oldValue: TValueOld
    ): TValue {
        const colDef = column.colDef;
        // we do not allow parsing of formulas
        if (column.allowFormula && this.formula?.isFormula(newValue)) {
            return newValue as TValue;
        }
        const valueParser = colDef.valueParser;
        if (valueParser != null && valueParser !== '') {
            const params: ValueParserParams = {
                api: this.gridApi,
                context: this.gridOptions.context,
                node: rowNode,
                data: rowNode?.data,
                oldValue,
                newValue: newValue as any,
                colDef,
                column,
            };
            if (typeof valueParser === 'function') {
                return valueParser(params);
            }
            return this.expressionSvc?.evaluate(valueParser, params);
        }
        return newValue as unknown as TValue;
    }

    public getDeleteValue(column: AgColumn, rowNode: IRowNode): any {
        const valueParser = column.colDef.valueParser;
        if (valueParser != null && valueParser !== '') {
            return this.parseValue(column, rowNode, '', this.getDisplayValue(column, rowNode, 'edit', false)) ?? null;
        }
        return null;
    }

    public formatValue(
        column: AgColumn,
        node: IRowNode | null,
        value: any,
        suppliedFormatter?: (value: any) => string,
        useFormatterFromColumn = true
    ): string | null {
        let result: string | null = null;
        // supplied formatter wins (e.g. set filter items have their own); otherwise use the column's
        const formatter = suppliedFormatter ?? (useFormatterFromColumn ? column.valueFormatter : undefined);
        if (formatter) {
            const params: ValueFormatterParams = {
                api: this.gridApi,
                context: this.gridOptions.context,
                value,
                node,
                data: node ? node.data : null,
                colDef: column.colDef,
                column,
            };
            if (typeof formatter === 'function') {
                result = formatter(params);
            } else {
                const expressionSvc = this.expressionSvc;
                result = expressionSvc ? expressionSvc.evaluate(formatter, params) : null;
            }
        } else {
            const refData = column.refData;
            if (refData) {
                return refData[value] || '';
            }
        }
        // if we don't do this, then arrays get displayed as 1,2,3, but we want 1, 2, 3 (i.e. with spaces)
        if (result == null && Array.isArray(value)) {
            result = value.join(', ');
        }
        return result;
    }

    /**
     * Formats a Show Values As value with the selected mode's formatter, mirroring {@link getValueForDisplay}: a
     * dormant mode (selected but not applicable) passes `notApplicable` so the built-in formatters show `#N/A`.
     * Returns `undefined` when the column has no selected mode — the caller then falls back to {@link formatValue}.
     * Kept off {@link formatValue} so the hot per-cell format path is not burdened with the feature check.
     */
    public formatTransformedValue(column: AgColumn, node: IRowNode | null, value: any): string | null | undefined {
        if (!node) {
            return undefined;
        }
        const showValuesAsSvc = this.showValuesAsSvc;
        const ignoreAggData = node.group ? this.displayIgnoresAggData(node) : false;
        if (!showValuesAsSvc || ignoreAggData || column.showValuesAs == null) {
            return undefined;
        }
        const rawValue = this.getValue(column, node, 'edit', ignoreAggData);
        return showValuesAsSvc.formatValue(column, node, value, rawValue, !showValuesAsSvc.isApplying(column));
    }

    /**
     * Sets the value of a GridCell
     * @param rowNode The `RowNode` to be updated
     * @param column The `Column` to be updated
     * @param newValue The new value to be set
     * @param eventSource The event source
     * @returns `true` if the value has been updated, otherwise `false`.
     */
    public setValue(rowNode: IRowNode, column: AgColumn, newValue: any, eventSource?: string): boolean {
        const colDef = column.colDef;

        if (!rowNode.data && canCreateRowNodeData(rowNode, colDef)) {
            rowNode.data = {}; // enableGroupEdit allows editing group rows without data.
        }

        if (!this.isSetValueSupported(column, rowNode, newValue, colDef)) {
            return false;
        }

        // Get old value from stored data, ignoring any pending edit state
        const oldValue = this.getValueFromData(column, rowNode);

        const data = rowNode.data;
        const params: ValueSetterParams = {
            api: this.gridApi,
            context: this.gridOptions.context,
            node: rowNode,
            data,
            oldValue,
            newValue: newValue,
            colDef,
            column: column,
        };

        let valueSetterChanged = false;

        if (data) {
            const externalFormulaResult = this.handleExternalFormulaChange({
                column,
                eventSource,
                newValue,
                setterParams: params,
                rowNode,
            });
            if (externalFormulaResult !== null) {
                return externalFormulaResult;
            }

            const result = this.computeValueChange({
                column,
                rowNode,
                newValue,
                params,
                rowData: data,
                valueSetter: colDef.valueSetter,
                field: colDef.field,
            });

            // default to true if user forgot to return a value (possible without TypeScript)
            valueSetterChanged = result ?? true;
        }

        // Wrap cascade + finishValueChange together in one deferred block.
        // - For group rows the cascade triggers child setDataValue → child setValue calls, each of
        //   which increments deferredDepth again, so their cellValueChanged events accumulate in this
        //   same batch and do not each trigger an individual doAggregate pass.
        // - For leaf rows the single cellValueChanged is accumulated and flushed once at endDeferred.
        // - Nested callers (clipboard, fill handle) just increment/decrement the same counter; the
        //   outermost endDeferred() performs the single aggregation + refresh pass.
        const changeDetectionSvc = this.changeDetectionSvc;
        changeDetectionSvc?.beginDeferred();
        try {
            // Delegate groupRowValueSetter handling to the enterprise service.
            // Returns undefined if no groupRowValueSetter is configured.
            if (rowNode.group) {
                const groupResult = this.rowGroupingEditValueSvc?.setGroupDataValue(
                    rowNode as RowNode,
                    column,
                    newValue,
                    oldValue,
                    eventSource,
                    valueSetterChanged || newValue !== oldValue
                );
                if (groupResult !== undefined) {
                    if (!valueSetterChanged && !groupResult) {
                        return false;
                    }
                    // Use newValue (the user's scalar input) as the event value rather than re-reading
                    // aggData. aggData is stale until the outermost endDeferred() flushes, and for avg/count
                    // columns it stores an IAggFuncResult wrapper rather than a plain scalar.
                    return this.finishValueChange(rowNode, column, params, eventSource, newValue);
                }
            }

            if (!valueSetterChanged) {
                // If no change to the value, then no need to do the updating, or notifying via events.
                // Otherwise the user could be tabbing around the grid, and cellValueChange would get called
                // all the time.
                return false;
            }

            return this.finishValueChange(rowNode, column, params, eventSource);
        } finally {
            changeDetectionSvc?.endDeferred();
        }
    }

    private finishValueChange(
        rowNode: IRowNode,
        column: AgColumn,
        params: ValueSetterParams,
        eventSource?: string,
        savedValueOverride?: any
    ): boolean {
        // reset quick filter on this row
        rowNode.resetQuickFilterAggregateText();

        this.valueCache?.onDataChanged();

        const savedValue =
            savedValueOverride === undefined ? this.getValueFromData(column, rowNode) : savedValueOverride;

        this.dispatchCellValueChangedEvent(rowNode, params, savedValue, eventSource);
        const pinnedSibling = (rowNode as RowNode).pinnedSibling;
        if (pinnedSibling) {
            this.dispatchCellValueChangedEvent(pinnedSibling, params, savedValue, eventSource);
        }

        return true;
    }

    private isSetValueSupported(column: AgColumn, rowNode: IRowNode, newValue: any, colDef: ColDef): boolean {
        const { field, valueSetter } = colDef;

        if (column.isCalculatedCol) {
            return false;
        }

        const formulaSvc = this.formula;
        const isFormulaValue = column.allowFormula && formulaSvc?.isFormula(newValue);
        const hasExternalFormulaData = !!this.formulaDataSvc?.hasDataSource();

        const fieldMissing = field == null || field === '';
        const valueSetterMissing = valueSetter == null || valueSetter === '';
        if (fieldMissing && valueSetterMissing && !(hasExternalFormulaData && isFormulaValue)) {
            // Group rows with groupRowValueSetter or groupRowEditable don't need field or valueSetter —
            // the groupRowValueSetter handles the edit entirely.
            if (rowNode.group && (colDef.groupRowValueSetter || colDef.groupRowEditable)) {
                return true;
            }
            this.warn(17);
            return false;
        }

        if (this.dataTypeSvc && !this.dataTypeSvc.checkType(column, newValue)) {
            this.warn(135);
            return false;
        }

        return true;
    }

    private handleExternalFormulaChange(args: {
        column: AgColumn;
        rowNode: IRowNode;
        newValue: any;
        setterParams: ValueSetterParams;
        eventSource?: string;
    }): boolean | null {
        const { column, rowNode, newValue, eventSource, setterParams } = args;
        const formulaSvc = this.formula;
        const formulaDataSvc = this.formulaDataSvc;
        if (!column.allowFormula || !formulaDataSvc?.hasDataSource()) {
            return null;
        }

        const isFormulaValue = formulaSvc?.isFormula(newValue);
        const existingFormula = formulaDataSvc.getFormula({ column, rowNode });

        if (isFormulaValue) {
            const valueWasDifferent = existingFormula !== newValue;
            if (!valueWasDifferent) {
                return false;
            }

            formulaDataSvc.setFormula({ column, rowNode, formula: newValue });

            // Store the computed value into rowData for consumers that do not understand formulas.
            const computedValue = formulaSvc?.resolveValue(column, rowNode as RowNode);
            const { valueSetter, field } = column.colDef;
            if ((valueSetter != null && valueSetter !== '') || (field != null && field !== '')) {
                this.computeValueChange({
                    column,
                    rowNode,
                    newValue: computedValue,
                    params: { ...setterParams, newValue: computedValue },
                    rowData: rowNode.data,
                    valueSetter,
                    field,
                });
            }

            return this.finishValueChange(rowNode, column, setterParams, eventSource);
        }

        if (existingFormula !== undefined) {
            formulaDataSvc.setFormula({ column, rowNode, formula: undefined });
        }

        return null;
    }

    private computeValueChange(params: {
        valueSetter: ValueSetterParams['colDef']['valueSetter'];
        params: ValueSetterParams;
        rowData: any;
        field: string | undefined;
        rowNode: IRowNode;
        column: AgColumn;
        newValue: any;
    }): boolean | undefined {
        const { valueSetter, params: setterParams, rowData, field, column, newValue } = params;

        if (valueSetter != null && valueSetter !== '') {
            if (typeof valueSetter === 'function') {
                return valueSetter(setterParams);
            }
            return this.expressionSvc?.evaluate(valueSetter, setterParams);
        }

        if (!rowData || !field) {
            return false;
        }
        const fieldPath = column.fieldPath;
        let valuesAreSame = false;
        if (fieldPath === null) {
            valuesAreSame = rowData[field] === newValue;
            if (!valuesAreSame) {
                rowData[field] = newValue;
            }
        } else {
            // deep value — walk the pre-split path (must not mutate the column's cached `fieldPath`)
            let currentObject = rowData;
            const lastIndex = fieldPath.length - 1;
            for (let i = 0; i < lastIndex && currentObject; ++i) {
                currentObject = currentObject[fieldPath[i]];
            }
            if (currentObject) {
                const lastPiece = fieldPath[lastIndex];
                valuesAreSame = currentObject[lastPiece] === newValue;
                if (!valuesAreSame) {
                    currentObject[lastPiece] = newValue;
                }
            }
        }
        return !valuesAreSame;
    }

    private dispatchCellValueChangedEvent(
        rowNode: IRowNode,
        params: ValueSetterParams,
        value: any,
        source?: string
    ): void {
        this.eventSvc.dispatchEvent({
            type: 'cellValueChanged',
            event: null,
            rowIndex: rowNode.rowIndex!,
            rowPinned: rowNode.rowPinned,
            column: params.column,
            colDef: params.colDef,
            data: rowNode.data,
            node: rowNode,
            oldValue: params.oldValue,
            newValue: value,
            newRawValue: params.newValue,
            value,
            source,
        });
    }

    private callColumnCellValueChangedHandler(event: CellValueChangedEvent) {
        const onCellValueChanged = event.colDef.onCellValueChanged;
        if (typeof onCellValueChanged === 'function') {
            this.frameworkOverrides.wrapOutgoing(() => onCellValueChanged(event));
        }
    }

    private executeValueGetter(
        valueGetter: string | ((...args: any[]) => any),
        data: any,
        column: AgColumn,
        rowNode: IRowNode
    ): any {
        // valueCache is undefined unless caching is enabled (set in init), so it is the cache gate.
        const valueCache = this.valueCache;
        if (valueCache) {
            const valueFromCache = valueCache.getValue(rowNode as RowNode, column.colId);
            if (valueFromCache !== undefined) {
                return valueFromCache;
            }
        }

        const params: ValueGetterParams = {
            api: this.gridApi,
            context: this.gridOptions.context,
            data: data,
            node: rowNode,
            column: column,
            colDef: column.colDef,
            getValue: (colKey) => this.getValueCallback(rowNode, colKey),
        };

        const result =
            typeof valueGetter === 'function' ? valueGetter(params) : this.expressionSvc?.evaluate(valueGetter, params);

        if (valueCache) {
            valueCache.setValue(rowNode as RowNode, column.colId, result);
        }
        return result;
    }

    private getValueCallback(node: IRowNode, colKey: ColKey): any {
        const otherColumn = this.colModel.getCol(colKey);
        return otherColumn ? this.getValueFromData(_resolvePivotColumnForRow(otherColumn, node), node) : null;
    }

    // used by row grouping and pivot, to get key for a row. col can be a pivot col or a row grouping col
    public getKeyForNode(col: AgColumn, rowNode: IRowNode): any {
        // Use 'data' - grouping keys should be based on committed data, not pending edits.
        // Row structure should remain stable during editing; rows only move groups when edits are committed.
        // col is always a pivot-BY or row-group column (never a pivot result column), so no pivot redirect.
        let result = this.getValueFromData(col, rowNode);
        const colDef = col.colDef;
        const keyCreator = colDef.keyCreator;
        if (keyCreator) {
            const keyParams: KeyCreatorParams = {
                api: this.gridApi,
                context: this.gridOptions.context,
                value: result,
                colDef,
                column: col,
                node: rowNode,
                data: rowNode.data,
            };
            result = keyCreator(keyParams);
        }
        // if already a string, or missing, just return it
        if (typeof result === 'string' || result == null) {
            return result;
        }
        result = String(result);
        if (result === '[object Object]') {
            this.warn(121);
        }
        return result;
    }
}

const canCreateRowNodeData = (rowNode: IRowNode, colDef: ColDef): boolean => {
    if (!rowNode.group) {
        return true; // not a group row
    }
    // groupRowValueSetter/groupRowEditable mean the user configured group editing — don't auto-create data.
    if (colDef.groupRowValueSetter != null || colDef.groupRowEditable != null) {
        return false;
    }
    // Pivot columns must not auto-create group row data (would mutate data on group-row value changes).
    if (colDef.pivotValueColumn) {
        return false;
    }
    return true;
};

/**
 * Empty value for a showRowGroup display col on a group row: `null` (retro-compat) when the row's group level
 * is shallower than the col's associated row group, `undefined` otherwise.
 */
const groupDisplayColEmptyValue = (colModel: ColumnModel, rowGroupColId: string, level: number): null | undefined => {
    const col = colModel.colsById[rowGroupColId];
    return col?.rowGroupActive && col.rowGroupActiveIndex > level ? null : undefined;
};

/** SSRM group footers mirror their group's field value. Caller guarantees SSRM and non-null `data`. */
const readSsrmFooterGroupValue = (rowNode: IRowNode, data: any, rowGroupColId: string | boolean | undefined): any => {
    if (!rowNode.footer) {
        return undefined;
    }
    const rowField = rowNode.field;
    if (!rowField || (rowGroupColId !== true && rowGroupColId !== rowField)) {
        return undefined;
    }
    // Read the group's own field (`rowField`); the column's cached `fieldPath` is for the column's `field`.
    return rowField.includes('.') ? _getValueUsingDotPath(data, rowField.split('.')) : data[rowField];
};
