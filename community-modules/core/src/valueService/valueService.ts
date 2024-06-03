import type { ColumnModel } from '../columns/columnModel';
import type { DataTypeService } from '../columns/dataTypeService';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type {
    KeyCreatorParams,
    ValueFormatterParams,
    ValueGetterParams,
    ValueParserParams,
    ValueSetterParams,
} from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { CellValueChangedEvent } from '../events';
import { Events } from '../events';
import type { IRowNode } from '../interfaces/iRowNode';
import { _warnOnce } from '../utils/function';
import { _exists, _missing } from '../utils/generic';
import { _getValueUsingField } from '../utils/object';
import type { ExpressionService } from './expressionService';
import type { ValueCache } from './valueCache';

export class ValueService extends BeanStub implements NamedBean {
    beanName = 'valueService' as const;

    private expressionService: ExpressionService;
    private columnModel: ColumnModel;
    private valueCache: ValueCache;
    private dataTypeService?: DataTypeService;

    public wireBeans(beans: BeanCollection): void {
        this.expressionService = beans.expressionService;
        this.columnModel = beans.columnModel;
        this.valueCache = beans.valueCache;
        this.dataTypeService = beans.dataTypeService;
    }

    private cellExpressions: boolean;
    // Store locally for performance reasons and keep updated via property listener
    private isTreeData: boolean;

    private initialised = false;

    private isSsrm = false;

    public postConstruct(): void {
        if (!this.initialised) {
            this.init();
        }
    }

    private init(): void {
        this.isSsrm = this.gos.isRowModelType('serverSide');
        this.cellExpressions = this.gos.get('enableCellExpressions');
        this.isTreeData = this.gos.get('treeData');
        this.initialised = true;

        // We listen to our own event and use it to call the columnSpecific callback,
        // this way the handler calls are correctly interleaved with other global events
        const listener = (event: CellValueChangedEvent) => this.callColumnCellValueChangedHandler(event);
        const async = this.gos.useAsyncEvents();
        this.eventService.addEventListener(Events.EVENT_CELL_VALUE_CHANGED, listener, async);
        this.addDestroyFunc(() =>
            this.eventService.removeEventListener(Events.EVENT_CELL_VALUE_CHANGED, listener, async)
        );

        this.addManagedPropertyListener('treeData', (propChange) => (this.isTreeData = propChange.currentValue));
    }

    public getValue(column: AgColumn, rowNode?: IRowNode | null, forFilter = false, ignoreAggData = false): any {
        // hack - the grid is getting refreshed before this bean gets initialised, race condition.
        // really should have a way so they get initialised in the right order???
        if (!this.initialised) {
            this.init();
        }

        if (!rowNode) {
            return;
        }

        // pull these out to make code below easier to read
        const colDef = column.getColDef();
        const field = colDef.field;
        const colId = column.getColId();
        const data = rowNode.data;

        let result: any;

        // if there is a value getter, this gets precedence over a field
        const groupDataExists = rowNode.groupData && rowNode.groupData[colId] !== undefined;
        const aggDataExists = !ignoreAggData && rowNode.aggData && rowNode.aggData[colId] !== undefined;

        // SSRM agg data comes from the data attribute, so ignore that instead
        const ignoreSsrmAggData = this.isSsrm && ignoreAggData && !!column.getColDef().aggFunc;
        const ssrmFooterGroupCol =
            this.isSsrm &&
            rowNode.footer &&
            rowNode.field &&
            (column.getColDef().showRowGroup === true || column.getColDef().showRowGroup === rowNode.field);

        if (forFilter && colDef.filterValueGetter) {
            result = this.executeFilterValueGetter(colDef.filterValueGetter, data, column, rowNode);
        } else if (this.isTreeData && aggDataExists) {
            result = rowNode.aggData[colId];
        } else if (this.isTreeData && colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        } else if (this.isTreeData && field && data) {
            result = _getValueUsingField(data, field, column.isFieldContainsDots());
        } else if (groupDataExists) {
            result = rowNode.groupData![colId];
        } else if (aggDataExists) {
            result = rowNode.aggData[colId];
        } else if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        } else if (ssrmFooterGroupCol) {
            // this is for group footers in SSRM, as the SSRM row won't have groupData, need to extract
            // the group value from the data using the row field
            result = _getValueUsingField(data, rowNode.field!, column.isFieldContainsDots());
        } else if (field && data && !ignoreSsrmAggData) {
            result = _getValueUsingField(data, field, column.isFieldContainsDots());
        }

        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && typeof result === 'string' && result.indexOf('=') === 0) {
            const cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, column, rowNode);
        }

        if (result == null) {
            const openedGroup = this.getOpenedGroup(rowNode, column);
            if (openedGroup != null) {
                return openedGroup;
            }
        }

        return result;
    }

    public parseValue(column: AgColumn, rowNode: IRowNode | null, newValue: any, oldValue: any): any {
        const colDef = column.getColDef();
        const params: ValueParserParams = this.gos.addGridCommonParams({
            node: rowNode,
            data: rowNode?.data,
            oldValue,
            newValue,
            colDef,
            column,
        });

        const valueParser = colDef.valueParser;

        if (_exists(valueParser)) {
            if (typeof valueParser === 'function') {
                return valueParser(params);
            }
            return this.expressionService.evaluate(valueParser, params);
        }
        return newValue;
    }

    public formatValue(
        column: AgColumn,
        node: IRowNode | null,
        value: any,
        suppliedFormatter?: (value: any) => string,
        useFormatterFromColumn = true
    ): string | null {
        let result: string | null = null;
        let formatter: ((value: any) => string) | string | undefined;

        const colDef = column.getColDef();

        if (suppliedFormatter) {
            // use supplied formatter if provided, e.g. set filter items can have their own value formatters
            formatter = suppliedFormatter;
        } else if (useFormatterFromColumn) {
            formatter = colDef.valueFormatter;
        }

        if (formatter) {
            const params: ValueFormatterParams = this.gos.addGridCommonParams({
                value,
                node,
                data: node ? node.data : null,
                colDef,
                column,
            });
            if (typeof formatter === 'function') {
                result = formatter(params);
            } else {
                result = this.expressionService.evaluate(formatter, params);
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

    private getOpenedGroup(rowNode: IRowNode, column: AgColumn): any {
        if (!this.gos.get('showOpenedGroup')) {
            return;
        }

        const colDef = column.getColDef();
        if (!colDef.showRowGroup) {
            return;
        }

        const showRowGroup = column.getColDef().showRowGroup;

        let pointer = rowNode.parent;

        while (pointer != null) {
            if (
                pointer.rowGroupColumn &&
                (showRowGroup === true || showRowGroup === pointer.rowGroupColumn.getColId())
            ) {
                return pointer.key;
            }
            pointer = pointer.parent;
        }

        return undefined;
    }

    /**
     * Sets the value of a GridCell
     * @param rowNode The `RowNode` to be updated
     * @param colKey The `Column` to be updated
     * @param newValue The new value to be set
     * @param eventSource The event source
     * @returns `True` if the value has been updated, otherwise`False`.
     */
    public setValue(rowNode: IRowNode, colKey: string | AgColumn, newValue: any, eventSource?: string): boolean {
        const column = this.columnModel.getColDefCol(colKey);

        if (!rowNode || !column) {
            return false;
        }
        // this will only happen if user is trying to paste into a group row, which doesn't make sense
        // the user should not be trying to paste into group rows
        if (_missing(rowNode.data)) {
            rowNode.data = {};
        }

        const { field, valueSetter } = column.getColDef();

        if (_missing(field) && _missing(valueSetter)) {
            console.warn(`AG Grid: you need either field or valueSetter set on colDef for editing to work`);
            return false;
        }

        if (this.dataTypeService && !this.dataTypeService.checkType(column, newValue)) {
            console.warn(`AG Grid: Data type of the new value does not match the cell data type of the column`);
            return false;
        }

        const params: ValueSetterParams = this.gos.addGridCommonParams({
            node: rowNode,
            data: rowNode.data,
            oldValue: this.getValue(column, rowNode),
            newValue: newValue,
            colDef: column.getColDef(),
            column: column,
        });

        params.newValue = newValue;

        let valueWasDifferent: boolean;

        if (_exists(valueSetter)) {
            if (typeof valueSetter === 'function') {
                valueWasDifferent = valueSetter(params);
            } else {
                valueWasDifferent = this.expressionService.evaluate(valueSetter, params);
            }
        } else {
            valueWasDifferent = this.setValueUsingField(rowNode.data, field, newValue, column.isFieldContainsDots());
        }

        // in case user forgot to return something (possible if they are not using TypeScript
        // and just forgot we default the return value to true, so we always refresh.
        if (valueWasDifferent === undefined) {
            valueWasDifferent = true;
        }

        // if no change to the value, then no need to do the updating, or notifying via events.
        // otherwise the user could be tabbing around the grid, and cellValueChange would get called
        // all the time.
        if (!valueWasDifferent) {
            return false;
        }

        // reset quick filter on this row
        rowNode.resetQuickFilterAggregateText();

        this.valueCache.onDataChanged();

        params.newValue = this.getValue(column, rowNode);

        const event: CellValueChangedEvent = {
            type: Events.EVENT_CELL_VALUE_CHANGED,
            event: null,
            rowIndex: rowNode.rowIndex!,
            rowPinned: rowNode.rowPinned,
            column: params.column,
            api: params.api!,
            colDef: params.colDef,
            context: params.context,
            data: rowNode.data,
            node: rowNode,
            oldValue: params.oldValue,
            newValue: params.newValue,
            value: params.newValue,
            source: eventSource,
        };

        this.eventService.dispatchEvent(event);

        return true;
    }

    private callColumnCellValueChangedHandler(event: CellValueChangedEvent) {
        const onCellValueChanged = event.colDef.onCellValueChanged;
        if (typeof onCellValueChanged === 'function') {
            this.getFrameworkOverrides().wrapOutgoing(() => {
                onCellValueChanged({
                    node: event.node,
                    data: event.data,
                    oldValue: event.oldValue,
                    newValue: event.newValue,
                    colDef: event.colDef,
                    column: event.column,
                    api: event.api,
                    context: event.context,
                });
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

    private executeFilterValueGetter(
        // eslint-disable-next-line @typescript-eslint/ban-types
        valueGetter: string | Function,
        data: any,
        column: AgColumn,
        rowNode: IRowNode
    ): any {
        const params: ValueGetterParams = this.gos.addGridCommonParams({
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            getValue: this.getValueCallback.bind(this, rowNode),
        });

        if (typeof valueGetter === 'function') {
            return valueGetter(params);
        }
        return this.expressionService.evaluate(valueGetter, params);
    }

    private executeValueGetter(
        // eslint-disable-next-line @typescript-eslint/ban-types
        valueGetter: string | Function,
        data: any,
        column: AgColumn,
        rowNode: IRowNode
    ): any {
        const colId = column.getColId();

        // if inside the same turn, just return back the value we got last time
        const valueFromCache = this.valueCache.getValue(rowNode as RowNode, colId);

        if (valueFromCache !== undefined) {
            return valueFromCache;
        }

        const params: ValueGetterParams = this.gos.addGridCommonParams({
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            getValue: this.getValueCallback.bind(this, rowNode),
        });

        let result;
        if (typeof valueGetter === 'function') {
            result = valueGetter(params);
        } else {
            result = this.expressionService.evaluate(valueGetter, params);
        }

        // if a turn is active, store the value in case the grid asks for it again
        this.valueCache.setValue(rowNode as RowNode, colId, result);

        return result;
    }

    private getValueCallback(node: IRowNode, field: string | AgColumn): any {
        const otherColumn = this.columnModel.getColDefCol(field);

        if (otherColumn) {
            return this.getValue(otherColumn, node);
        }

        return null;
    }

    // used by row grouping and pivot, to get key for a row. col can be a pivot col or a row grouping col
    public getKeyForNode(col: AgColumn, rowNode: IRowNode): any {
        const value = this.getValue(col, rowNode);
        const keyCreator = col.getColDef().keyCreator;

        let result = value;
        if (keyCreator) {
            const keyParams: KeyCreatorParams = this.gos.addGridCommonParams({
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
            _warnOnce(
                'a column you are grouping or pivoting by has objects as values. If you want to group by complex objects then either a) use a colDef.keyCreator (se AG Grid docs) or b) to toString() on the object to return a key'
            );
        }

        return result;
    }
}
