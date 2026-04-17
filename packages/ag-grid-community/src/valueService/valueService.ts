import { _exists, _missing } from '../agStack/utils/generic';
import { _isExpressionString } from '../agStack/utils/string';
import { _getValueUsingDotNotation } from '../agStack/utils/value';
import type { ColumnModel } from '../columns/columnModel';
import type { DataTypeService } from '../columns/dataTypeService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { EditService } from '../edit/editService';
import type { AgColumn } from '../entities/agColumn';
import type {
    ColDef,
    KeyCreatorParams,
    ValueFormatterParams,
    ValueGetterParams,
    ValueParserParams,
    ValueSetterParams,
} from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { CellValueChangedEvent } from '../events';
import { _addGridCommonParams, _isServerSideRowModel } from '../gridOptionsUtils';
import type { IFormulaDataService } from '../interfaces/formulas';
import type { IColsService } from '../interfaces/iColsService';
import type { CellValueResolveFrom } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import { _warn } from '../validation/logging';
import type { ExpressionService } from './expressionService';
import type { ValueCache } from './valueCache';

type ResolveLeafFn = (column: AgColumn, colDef: ColDef, rowNode: IRowNode) => any;
type ResolveGroupFn = (column: AgColumn, colDef: ColDef, rowNode: IRowNode, ignoreAggData: boolean) => any;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ValueService extends BeanStub implements NamedBean {
    beanName = 'valueSvc' as const;

    private expressionSvc?: ExpressionService;
    private colModel: ColumnModel;
    private valueCache?: ValueCache;
    private dataTypeSvc?: DataTypeService;
    private editSvc?: EditService;
    private formulaDataSvc?: IFormulaDataService;
    private rowGroupColsSvc?: IColsService;

    public wireBeans(beans: BeanCollection): void {
        this.expressionSvc = beans.expressionSvc;
        this.colModel = beans.colModel;
        this.valueCache = beans.valueCache;
        this.dataTypeSvc = beans.dataTypeSvc;
        this.editSvc = beans.editSvc;
        this.formulaDataSvc = beans.formulaDataSvc;
        this.rowGroupColsSvc = beans.rowGroupColsSvc;
    }

    private cellExpressions: boolean;

    // Store locally for performance reasons and keep updated via property listener
    private isTreeData: boolean;

    private initialised = false;

    private isSsrm = false;

    /** The group value resolver, depends on treeData, csrm, ssrm */
    private resolveGroup: ResolveGroupFn;

    /** The non-group value resolver, depends on treeData, csrm, ssrm */
    private resolveLeaf: ResolveLeafFn;

    private executeValueGetter: (
        // eslint-disable-next-line @typescript-eslint/ban-types
        valueGetter: string | Function,
        data: any,
        column: AgColumn,
        rowNode: IRowNode
    ) => any;

    public postConstruct(): void {
        if (!this.initialised) {
            this.init();
        }
    }

    private init(): void {
        const { gos, valueCache } = this;
        this.executeValueGetter = valueCache
            ? this.executeValueGetterWithValueCache.bind(this)
            : this.executeValueGetterWithoutValueCache.bind(this);
        this.isSsrm = _isServerSideRowModel(gos);
        this.cellExpressions = gos.get('enableCellExpressions');
        const isTreeData = gos.get('treeData');
        this.isTreeData = isTreeData;
        this.bindResolvers(isTreeData);
        this.initialised = true;

        // We listen to our own event and use it to call the columnSpecific callback,
        // this way the handler calls are correctly interleaved with other global events
        const listener = (event: CellValueChangedEvent) => this.callColumnCellValueChangedHandler(event);
        this.eventSvc.addListener('cellValueChanged', listener, true);
        this.addDestroyFunc(() => this.eventSvc.removeListener('cellValueChanged', listener, true));

        this.addManagedPropertyListener('treeData', (propChange) => {
            const value = propChange.currentValue;
            this.isTreeData = value;
            this.bindResolvers(value);
        });
    }

    private bindResolvers(isTreeData: boolean): void {
        if (isTreeData) {
            this.resolveLeaf = this.resolveTreeLeafValue;
            this.resolveGroup = this.resolveTreeGroupValue;
        } else {
            this.resolveLeaf = this.resolveValue;
            this.resolveGroup = this.isSsrm ? this.resolveSsrmGroupValue : this.resolveCsrmGroupValue;
        }
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
    }): {
        value: any;
        valueFormatted: string | null;
    } {
        const beans = this.beans;
        const column = params.column;
        const node = params.node;
        const showRowGroupColValueSvc = beans.showRowGroupColValueSvc;
        const isFullWidthGroup = !column && node.group;
        const isGroupCol = column?.colDef.showRowGroup;

        // Tree data auto col acts as a traditional column, with the exception of footers, so only process footers with
        // showRowGroupColValueSvc
        const processTreeDataAsGroup = !this.isTreeData || node.footer;

        // handle group cell value
        if (showRowGroupColValueSvc && processTreeDataAsGroup && (isFullWidthGroup || isGroupCol)) {
            const groupValue = showRowGroupColValueSvc.getGroupValue(node, column, this.displayIgnoresAggData(node));
            if (groupValue == null) {
                return {
                    value: null,
                    valueFormatted: null,
                };
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
            return {
                value: node.key,
                valueFormatted: null,
            };
        }

        let value = this.getValue(column, node, params.from, this.displayIgnoresAggData(node));
        let valueToFormat = value;

        const formula = beans.formula;
        if (column.isAllowFormula() && formula?.isFormula(value)) {
            if (params.useRawFormula) {
                value = formula.normaliseFormula(value, true);
                valueToFormat = formula.resolveValue(column, node as RowNode);
            } else {
                value = formula.resolveValue(column, node as RowNode);
                valueToFormat = value;
            }
        }

        const format =
            params.includeValueFormatted && !(params.exporting && column.colDef.useValueFormatterForExport === false);
        return {
            value,
            valueFormatted: format ? this.formatValue(column, node, valueToFormat) : null,
        };
    }

    /**
     * PERFORMANCE CRITICAL — called for every cell during filtering, rendering, and export.
     * Any change here can have a large impact. Run the getValue benchmark to verify.
     */
    public getValue(
        column: AgColumn,
        rowNode: IRowNode | null | undefined,
        from: CellValueResolveFrom,
        ignoreAggData: boolean = false
    ): any {
        // hack - the grid is getting refreshed before this bean gets initialised, race condition.
        // really should have a way so they get initialised in the right order???
        if (!this.initialised) {
            this.init();
        }

        if (!rowNode) {
            return;
        }

        const isGroup = !!rowNode.group;
        let colDef = column.colDef;

        // Resolve pivot result columns to their underlying value column for non-group, non-pinned rows.
        if (!isGroup) {
            const pivotValueColumn = colDef.pivotValueColumn;
            if (pivotValueColumn && !rowNode.rowPinned) {
                column = pivotValueColumn as AgColumn;
                colDef = column.colDef;
            }
        }

        // Check for edit/pending values if not requesting committed data.
        // editSvc is only present when the editing module is registered.
        const editSvc = this.editSvc;
        if (editSvc) {
            const pending = editSvc.getPendingEditValue(rowNode, column, from);
            if (pending !== undefined) {
                return pending;
            }
        }

        const result = isGroup
            ? this.resolveGroup(column, colDef, rowNode, ignoreAggData)
            : this.resolveLeaf(column, colDef, rowNode);

        // the result could be an expression itself, if we are allowing cell values to be expressions
        return this.cellExpressions ? this.resolveCellExpression(result, column, rowNode) : result;
    }

    /** Evaluates the result as a cell expression if it is one, otherwise returns the result unchanged. */
    private resolveCellExpression(result: any, column: AgColumn, rowNode: IRowNode): any {
        if (_isExpressionString(result)) {
            return this.executeValueGetter(result.substring(1), rowNode.data, column, rowNode);
        }
        return result;
    }

    /** Computes whether to ignore aggregation data for display purposes. */
    private displayIgnoresAggData(node: IRowNode): boolean {
        // If doing grouping and footers, we don't want to include the agg value
        // in the header when the group is open.
        // Result is: isOpenedGroup && !groupShowsAggData

        // Check isOpenedGroup conditions: node.group && !node.footer && !isPivotLeaf && node.expanded
        // The root node (level -1) is always expanded but should not suppress its agg data display.
        if (!node.group || node.footer || node.level === -1) {
            return false;
        }
        // groupShowsAggData = this.gos.get('groupSuppressBlankHeader') || !node.sibling
        // We return true only if !groupShowsAggData, i.e., !groupSuppressBlankHeader && node.sibling
        if (!node.sibling || this.gos.get('groupSuppressBlankHeader')) {
            return false;
        }
        // When in pivot mode, leafGroups cannot be expanded
        if (node.leafGroup && this.colModel.pivotMode) {
            return false;
        }
        // node.expanded (getter with side effects) evaluated last
        return !!node.expanded;
    }

    /**
     * PERFORMANCE CRITICAL — leaf rows in tree-data grids.
     * Formulas are incompatible with tree data — skip the formula datasource check entirely.
     */
    private resolveTreeLeafValue(column: AgColumn, colDef: ColDef, rowNode: IRowNode): any {
        const data = rowNode.data;
        const valueGetter = colDef.valueGetter;
        if (valueGetter) {
            return this.executeValueGetter(valueGetter, data, column, rowNode);
        }
        const field = colDef.field;
        if (field && data) {
            return column.fieldContainsDots ? _getValueUsingDotNotation(data, field) : data[field];
        }
        const groupData = rowNode.groupData;
        if (groupData) {
            const colId = column.colId;
            if (colId in groupData) {
                return groupData[colId];
            }
        }
        return undefined;
    }

    /** PERFORMANCE CRITICAL — group rows in tree-data grids. */
    private resolveTreeGroupValue(column: AgColumn, colDef: ColDef, rowNode: IRowNode, ignoreAggData: boolean): any {
        const colId = column.colId;
        if (!ignoreAggData) {
            const aggData = rowNode.aggData;
            if (aggData) {
                const aggValue = aggData[colId];
                if (aggValue !== undefined) {
                    return aggValue;
                }
            }
        }

        const data = rowNode.data;
        const valueGetter = colDef.valueGetter;
        if (valueGetter) {
            return this.executeValueGetter(valueGetter, data, column, rowNode);
        }
        const field = colDef.field;
        if (field && data) {
            return column.fieldContainsDots ? _getValueUsingDotNotation(data, field) : data[field];
        }
        const groupData = rowNode.groupData;
        if (groupData && colId in groupData) {
            return groupData[colId];
        }

        // For showRowGroup columns on group rows with no resolved value, if the row's group level
        // is shallower than the column's associated row group, return null for retro-compatibility.
        const rowGroupColId = colDef.showRowGroup;
        if (typeof rowGroupColId === 'string') {
            const colRowGroupIndex = this.rowGroupColsSvc?.getColumnIndex(rowGroupColId);
            if (colRowGroupIndex != null && colRowGroupIndex > rowNode.level) {
                return null;
            }
        }
        return undefined;
    }

    /**
     * PERFORMANCE CRITICAL — hot path for leaf rows in non-tree grids.
     * No aggData, no groupData, no showRowGroup, no SSRM footer — those only apply to group rows.
     */
    private resolveValue(column: AgColumn, colDef: ColDef, rowNode: IRowNode): any {
        // Formula datasource is skipped for group rows — formulas and row grouping are not supported together.
        const formulaDataSvc = this.formulaDataSvc;
        if (formulaDataSvc && colDef.allowFormula === true && formulaDataSvc.hasDataSource()) {
            const formula = formulaDataSvc.getFormula({ column, rowNode });
            if (_isExpressionString(formula)) {
                return formula;
            }
        }

        const data = rowNode.data;

        const valueGetter = colDef.valueGetter;
        if (valueGetter) {
            return this.executeValueGetter(valueGetter, data, column, rowNode);
        }

        if (data) {
            const field = colDef.field;
            if (field) {
                return column.fieldContainsDots ? _getValueUsingDotNotation(data, field) : data[field];
            }
        }

        return undefined;
    }

    /**
     * PERFORMANCE CRITICAL — group rows in non-tree CSRM grids.
     * SSRM-specific branches (ignoreAggData+aggFunc guard, group-footer data[field])
     * are dead for CSRM and omitted.
     */
    private resolveCsrmGroupValue(column: AgColumn, colDef: ColDef, rowNode: IRowNode, ignoreAggData: boolean): any {
        const colId = column.colId;
        const groupData = rowNode.groupData;
        if (groupData && colId in groupData) {
            return groupData[colId];
        }
        if (!ignoreAggData) {
            const aggData = rowNode.aggData;
            if (aggData) {
                const aggValue = aggData[colId];
                if (aggValue !== undefined) {
                    return aggValue;
                }
            }
        }

        // For multiple auto cols (showRowGroup: string), don't fall through to valueGetter/field.
        // If the row's group level is shallower than the column's associated row group, return null
        // for retro-compatibility; otherwise return undefined.
        const rowGroupColId = colDef.showRowGroup;
        if (typeof rowGroupColId === 'string') {
            const colRowGroupIndex = this.rowGroupColsSvc?.getColumnIndex(rowGroupColId);
            return colRowGroupIndex != null && colRowGroupIndex > rowNode.level ? null : undefined;
        }

        const valueGetter = colDef.valueGetter;
        if (valueGetter) {
            return this.executeValueGetter(valueGetter, rowNode.data, column, rowNode);
        }

        const field = colDef.field;
        if (field) {
            const data = rowNode.data;
            if (data) {
                return column.fieldContainsDots ? _getValueUsingDotNotation(data, field) : data[field];
            }
        }

        return undefined;
    }

    /**
     * PERFORMANCE CRITICAL — group rows in non-tree SSRM grids.
     * SSRM is known statically — inlines the isSsrm=true branches without reading the field.
     */
    private resolveSsrmGroupValue(column: AgColumn, colDef: ColDef, rowNode: IRowNode, ignoreAggData: boolean): any {
        const colId = column.colId;
        const groupData = rowNode.groupData;
        if (groupData && colId in groupData) {
            return groupData[colId];
        }

        if (!ignoreAggData) {
            const aggData = rowNode.aggData;
            if (aggData) {
                const aggValue = aggData[colId];
                if (aggValue !== undefined) {
                    return aggValue;
                }
            }
        }

        const showRowGroup = colDef.showRowGroup;
        const data = rowNode.data;

        // For multiple auto cols (showRowGroup: string): don't fall through to valueGetter/field,
        // but still extract the footer group value when the row's field matches this column.
        if (typeof showRowGroup === 'string') {
            if (data && rowNode.footer && rowNode.field === showRowGroup) {
                return column.fieldContainsDots ? _getValueUsingDotNotation(data, showRowGroup) : data[showRowGroup];
            }
            // If the row's group level is shallower than the column's associated row group, return null
            // for retro-compatibility; otherwise return undefined.
            const colRowGroupIndex = this.rowGroupColsSvc?.getColumnIndex(showRowGroup);
            return colRowGroupIndex != null && colRowGroupIndex > rowNode.level ? null : undefined;
        }

        const valueGetter = colDef.valueGetter;
        if (valueGetter) {
            if (!ignoreAggData || !colDef.aggFunc) {
                return this.executeValueGetter(valueGetter, data, column, rowNode);
            }
        }

        if (data) {
            // SSRM group footer: SSRM rows have no groupData, so extract from data[field].
            if (showRowGroup === true && rowNode.footer) {
                const rowField = rowNode.field;
                if (rowField) {
                    return column.fieldContainsDots ? _getValueUsingDotNotation(data, rowField) : data[rowField];
                }
            }

            const field = colDef.field;
            if (field) {
                if (!ignoreAggData || !colDef.aggFunc) {
                    return column.fieldContainsDots ? _getValueUsingDotNotation(data, field) : data[field];
                }
            }
        }

        return undefined;
    }

    public parseValue<TValueNew = any, TValueOld = any, TValue = any>(
        column: AgColumn,
        rowNode: IRowNode | null,
        newValue: TValueNew,
        oldValue: TValueOld
    ): TValue {
        const colDef = column.colDef;

        // we do not allow parsing of formulas
        if (colDef.allowFormula && this.beans.formula?.isFormula(newValue)) {
            return newValue as TValue;
        }

        const valueParser = colDef.valueParser;

        if (_exists(valueParser)) {
            const params: ValueParserParams = _addGridCommonParams(this.gos, {
                node: rowNode,
                data: rowNode?.data,
                oldValue,
                newValue: newValue as any,
                colDef,
                column,
            });
            if (typeof valueParser === 'function') {
                return valueParser(params);
            }
            return this.expressionSvc?.evaluate(valueParser, params);
        }
        return newValue as unknown as TValue;
    }

    public getDeleteValue(column: AgColumn, rowNode: IRowNode): any {
        if (_exists(column.colDef.valueParser)) {
            return (
                this.parseValue(
                    column,
                    rowNode,
                    '',
                    this.getValueForDisplay({ column, node: rowNode, from: 'edit' }).value
                ) ?? null
            );
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
        const { expressionSvc } = this.beans;
        let result: string | null = null;
        let formatter: ((value: any) => string) | string | undefined;

        const colDef = column.colDef;

        if (suppliedFormatter) {
            // use supplied formatter if provided, e.g. set filter items can have their own value formatters
            formatter = suppliedFormatter;
        } else if (useFormatterFromColumn) {
            formatter = colDef.valueFormatter;
        }

        if (formatter) {
            const data = node ? node.data : null;

            const params: ValueFormatterParams = _addGridCommonParams(this.gos, {
                value,
                node,
                data,
                colDef,
                column,
            });
            if (typeof formatter === 'function') {
                result = formatter(params);
            } else {
                result = expressionSvc ? expressionSvc.evaluate(formatter, params) : null;
            }
        } else if (colDef.refData) {
            return colDef.refData[value] || '';
        }

        // if we don't do this, then arrays get displayed as 1,2,3, but we want 1, 2, 3 (i.e. with spaces)
        if (result == null && Array.isArray(value)) {
            result = value.join(', ');
        }

        return result;
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

        if (!rowNode.data && this.canCreateRowNodeData(rowNode, colDef)) {
            rowNode.data = {}; // enableGroupEdit allows editing group rows without data.
        }

        if (!this.isSetValueSupported(column, rowNode, newValue, colDef)) {
            return false;
        }

        // Get old value from stored data, ignoring any pending edit state
        const oldValue = this.getValue(column, rowNode, 'data');

        const params: ValueSetterParams = _addGridCommonParams(this.gos, {
            node: rowNode,
            data: rowNode.data,
            oldValue,
            newValue: newValue,
            colDef,
            column: column,
        });

        let valueSetterChanged = false;

        if (rowNode.data) {
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
                rowData: rowNode.data,
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
        const changeDetectionSvc = this.beans.changeDetectionSvc;
        changeDetectionSvc?.beginDeferred();
        try {
            // Delegate groupRowValueSetter handling to the enterprise service.
            // Returns undefined if no groupRowValueSetter is configured.
            if (rowNode.group) {
                const groupResult = this.beans.rowGroupingEditValueSvc?.setGroupDataValue(
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

    private canCreateRowNodeData(rowNode: IRowNode, colDef: ColDef): boolean {
        if (!rowNode.group) {
            return true; // not a group row
        }

        // If groupRowValueSetter or groupRowEditable is defined, do not create row data automatically.
        // The user has explicitly configured group editing behavior.
        if (colDef.groupRowValueSetter != null || colDef.groupRowEditable != null) {
            return false;
        }

        // For pivot columns (identified by pivotValueColumn), preserve legacy behavior:
        // do not auto-create row data. In previous versions, pivot columns silently
        // skipped value changes on group rows because we were not looking for them when calling setDataValue.
        // Now we do, so we need to block auto-creation to avoid unexpected data mutations to not change behavior.
        if (colDef.pivotValueColumn) {
            return false; // Legacy behaviour - pivot groups do not auto-create data with pivot columns
        }

        return true;
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
            savedValueOverride === undefined ? this.getValue(column, rowNode, 'data') : savedValueOverride;

        this.dispatchCellValueChangedEvent(rowNode, params, savedValue, eventSource);
        if ((rowNode as RowNode).pinnedSibling) {
            this.dispatchCellValueChangedEvent((rowNode as RowNode).pinnedSibling!, params, savedValue, eventSource);
        }

        return true;
    }

    private isSetValueSupported(
        column: AgColumn,
        rowNode: IRowNode,
        newValue: any,
        colDef: ReturnType<AgColumn['getColDef']>
    ): boolean {
        const { field, valueSetter } = colDef;

        const formulaSvc = this.beans.formula;
        const isFormulaValue = column.isAllowFormula() && formulaSvc?.isFormula(newValue);
        const hasExternalFormulaData = !!this.formulaDataSvc?.hasDataSource();

        if (_missing(field) && _missing(valueSetter) && !(hasExternalFormulaData && isFormulaValue)) {
            // Group rows with groupRowValueSetter or groupRowEditable don't need field or valueSetter —
            // the groupRowValueSetter handles the edit entirely.
            if (rowNode.group && (colDef.groupRowValueSetter || colDef.groupRowEditable)) {
                return true;
            }
            _warn(17);
            return false;
        }

        if (this.dataTypeSvc && !this.dataTypeSvc.checkType(column, newValue)) {
            _warn(135);
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
        const formulaSvc = this.beans.formula;
        const formulaDataSvc = this.formulaDataSvc;
        if (!formulaDataSvc?.hasDataSource() || !column.isAllowFormula()) {
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
            const colDef = column.colDef;
            if (_exists(colDef.valueSetter) || !_missing(colDef.field)) {
                const computedParams: ValueSetterParams = { ...setterParams, newValue: computedValue };
                this.computeValueChange({
                    column,
                    rowNode,
                    newValue: computedValue,
                    params: computedParams,
                    rowData: rowNode.data,
                    valueSetter: colDef.valueSetter,
                    field: colDef.field,
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

        if (_exists(valueSetter)) {
            if (typeof valueSetter === 'function') {
                return valueSetter(setterParams);
            }
            return this.expressionSvc?.evaluate(valueSetter, setterParams);
        }

        return !!rowData && this.setValueUsingField(rowData, field, newValue, column.fieldContainsDots);
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
            this.beans.frameworkOverrides.wrapOutgoing(() => {
                onCellValueChanged(event);
            });
        }
    }

    private setValueUsingField(
        data: any,
        field: string | undefined,
        newValue: any,
        isFieldContainsDots: boolean
    ): boolean {
        if (!field) {
            return false;
        }

        // if no '.', then it's not a deep value
        let valuesAreSame: boolean = false;
        if (!isFieldContainsDots) {
            valuesAreSame = data[field] === newValue;
            if (!valuesAreSame) {
                data[field] = newValue;
            }
        } else {
            // otherwise it is a deep value, so need to dig for it
            const fieldPieces = field.split('.');
            let currentObject = data;
            while (fieldPieces.length > 0 && currentObject) {
                const fieldPiece: any = fieldPieces.shift();
                if (fieldPieces.length === 0) {
                    valuesAreSame = currentObject[fieldPiece] === newValue;
                    if (!valuesAreSame) {
                        currentObject[fieldPiece] = newValue;
                    }
                } else {
                    currentObject = currentObject[fieldPiece];
                }
            }
        }
        return !valuesAreSame;
    }

    private executeValueGetterWithValueCache(
        // eslint-disable-next-line @typescript-eslint/ban-types
        valueGetter: string | Function,
        data: any,
        column: AgColumn,
        rowNode: IRowNode
    ): any {
        const colId = column.colId;

        const valueFromCache = this.valueCache!.getValue(rowNode as RowNode, colId);
        if (valueFromCache !== undefined) {
            return valueFromCache;
        }

        const result = this.executeValueGetterWithoutValueCache(valueGetter, data, column, rowNode);

        this.valueCache!.setValue(rowNode as RowNode, colId, result);

        return result;
    }

    private executeValueGetterWithoutValueCache(
        // eslint-disable-next-line @typescript-eslint/ban-types
        valueGetter: string | Function,
        data: any,
        column: AgColumn,
        rowNode: IRowNode
    ): any {
        const params: ValueGetterParams = _addGridCommonParams(this.gos, {
            data: data,
            node: rowNode,
            column: column,
            colDef: column.colDef,
            getValue: (field) => this.getValueCallback(rowNode, field),
        });

        let result;
        if (typeof valueGetter === 'function') {
            result = valueGetter(params);
        } else {
            result = this.expressionSvc?.evaluate(valueGetter, params);
        }

        return result;
    }

    private getValueCallback(node: IRowNode, field: string): any {
        const otherColumn = this.colModel.getColDefOrCol(field);
        return otherColumn ? this.getValue(otherColumn, node, 'data') : null;
    }

    /** Used by row grouping and pivot, to get key for a row. col can be a pivot col or a row grouping col. */
    public getKeyForNode(col: AgColumn, rowNode: IRowNode): any {
        // Use 'data' - grouping keys should be based on committed data, not pending edits.
        // Row structure should remain stable during editing; rows only move groups when edits are committed.
        const value = this.getValue(col, rowNode, 'data');
        const keyCreator = col.getColDef().keyCreator;

        let result = value;
        if (keyCreator) {
            const keyParams: KeyCreatorParams = _addGridCommonParams(this.gos, {
                value: value,
                colDef: col.getColDef(),
                column: col,
                node: rowNode,
                data: rowNode.data,
            });
            result = keyCreator(keyParams);
        }

        // if already a string, or missing, just return it
        if (typeof result === 'string' || result == null) {
            return result;
        }

        result = String(result);

        if (result === '[object Object]') {
            _warn(121);
        }

        return result;
    }
}
