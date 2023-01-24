import { ExpressionService } from "./expressionService";
import { ColumnModel } from "../columns/columnModel";
import { ValueGetterParams, KeyCreatorParams, ValueSetterParams } from "../entities/colDef";
import { Autowired, Bean, PostConstruct } from "../context/context";
import { Column } from "../entities/column";
import { CellValueChangedEvent, Events } from "../events";
import { ValueCache } from "./valueCache";
import { BeanStub } from "../context/beanStub";
import { getValueUsingField } from "../utils/object";
import { missing, exists } from "../utils/generic";
import { doOnce } from "../utils/function";
import { IRowNode } from "../interfaces/iRowNode";
import { RowNode } from "../entities/rowNode";

@Bean('valueService')
export class ValueService extends BeanStub {

    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('valueCache') private valueCache: ValueCache;

    private cellExpressions: boolean;

    private initialised = false;

    @PostConstruct
    public init(): void {
        this.cellExpressions = this.gridOptionsService.is('enableCellExpressions');
        this.initialised = true;

        // We listen to our own event and use it to call the columnSpecific callback,
        // this way the handler calls are correctly interleaved with other global events
        this.eventService.addEventListener(
            Events.EVENT_CELL_VALUE_CHANGED,
            (event: CellValueChangedEvent) => this.callColumnCellValueChangedHandler(event),
            this.gridOptionsService.useAsyncEvents(),
        );
    }

    public getValue(column: Column,
        rowNode?: IRowNode | null,
        forFilter = false,
        ignoreAggData = false): any {

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
        const colId = column.getId();
        const data = rowNode.data;

        let result: any;

        // if there is a value getter, this gets precedence over a field
        const groupDataExists = rowNode.groupData && rowNode.groupData[colId] !== undefined;
        const aggDataExists = !ignoreAggData && rowNode.aggData && rowNode.aggData[colId] !== undefined;

        if (forFilter && colDef.filterValueGetter) {
            result = this.executeFilterValueGetter(colDef.filterValueGetter, data, column, rowNode);
        } else if (this.gridOptionsService.isTreeData() && aggDataExists) {
            result = rowNode.aggData[colId];
        } else if (this.gridOptionsService.isTreeData() && colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        } else if (this.gridOptionsService.isTreeData() && (field && data)) {
            result = getValueUsingField(data, field, column.isFieldContainsDots());
        } else if (groupDataExists) {
            result = rowNode.groupData![colId];
        } else if (aggDataExists) {
            result = rowNode.aggData[colId];
        } else if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        } else if (field && data) {
            result = getValueUsingField(data, field, column.isFieldContainsDots());
        }

        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
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

    private getOpenedGroup(rowNode: IRowNode, column: Column): any {

        if (!this.gridOptionsService.is('showOpenedGroup')) { return; }

        const colDef = column.getColDef();
        if (!colDef.showRowGroup) { return; }

        const showRowGroup = column.getColDef().showRowGroup;

        let pointer = rowNode.parent;

        while (pointer != null) {
            if (pointer.rowGroupColumn && (showRowGroup === true || showRowGroup === pointer.rowGroupColumn.getId())) {
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
    public setValue(rowNode: IRowNode, colKey: string | Column, newValue: any, eventSource?: string): boolean {
        const column = this.columnModel.getPrimaryColumn(colKey);

        if (!rowNode || !column) {
            return false;
        }
        // this will only happen if user is trying to paste into a group row, which doesn't make sense
        // the user should not be trying to paste into group rows
        if (missing(rowNode.data)) {
            rowNode.data = {};
        }

        const { field, valueSetter } = column.getColDef();

        if (missing(field) && missing(valueSetter)) {
            console.warn(`AG Grid: you need either field or valueSetter set on colDef for editing to work`);
            return false;
        }

        const params: ValueSetterParams = {
            node: rowNode,
            data: rowNode.data,
            oldValue: this.getValue(column, rowNode),
            newValue: newValue,
            colDef: column.getColDef(),
            column: column,
            api: this.gridOptionsService.get('api')!,
            columnApi: this.gridOptionsService.get('columnApi')!,
            context: this.gridOptionsService.get('context')
        };

        params.newValue = newValue;

        let valueWasDifferent: boolean;

        if (exists(valueSetter)) {
            valueWasDifferent = this.expressionService.evaluate(valueSetter, params);
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
            columnApi: params.columnApi!,
            colDef: params.colDef,
            context: params.context,
            data: rowNode.data,
            node: rowNode,
            oldValue: params.oldValue,
            newValue: params.newValue,
            value: params.newValue,
            source: eventSource
        };

        this.eventService.dispatchEvent(event);

        return true;
    }

    private callColumnCellValueChangedHandler(event: CellValueChangedEvent) {
        const onCellValueChanged = event.colDef.onCellValueChanged;
        if (typeof onCellValueChanged === 'function') {
            onCellValueChanged({
                node: event.node,
                data: event.data,
                oldValue: event.oldValue,
                newValue: event.newValue,
                colDef: event.colDef,
                column: event.column,
                api: event.api,
                columnApi: event.columnApi,
                context: event.context
            });
        }
    }

    private setValueUsingField(data: any, field: string | undefined, newValue: any, isFieldContainsDots: boolean): boolean {
        if (!field) {
            return false;
        }

        // if no '.', then it's not a deep value
        let valuesAreSame: boolean = false;
        if (!isFieldContainsDots) {
            // soft comparison to match strings and numbers
            valuesAreSame = data[field] == newValue;
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
                    // soft comparison to match strings and numbers
                    valuesAreSame = currentObject[fieldPiece] == newValue;
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

    private executeFilterValueGetter(valueGetter: string | Function, data: any, column: Column, rowNode: IRowNode): any {
        const params: ValueGetterParams = {
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            api: this.gridOptionsService.get('api')!,
            columnApi: this.gridOptionsService.get('columnApi')!,
            context: this.gridOptionsService.get('context'),
            getValue: this.getValueCallback.bind(this, rowNode)
        };

        return this.expressionService.evaluate(valueGetter, params);
    }

    private executeValueGetter(valueGetter: string | Function, data: any, column: Column, rowNode: IRowNode): any {

        const colId = column.getId();

        // if inside the same turn, just return back the value we got last time
        const valueFromCache = this.valueCache.getValue(rowNode as RowNode, colId);

        if (valueFromCache !== undefined) {
            return valueFromCache;
        }

        const params: ValueGetterParams = {
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            api: this.gridOptionsService.get('api')!,
            columnApi: this.gridOptionsService.get('columnApi')!,
            context: this.gridOptionsService.get('context'),
            getValue: this.getValueCallback.bind(this, rowNode)
        };

        const result = this.expressionService.evaluate(valueGetter, params);

        // if a turn is active, store the value in case the grid asks for it again
        this.valueCache.setValue(rowNode as RowNode, colId, result);

        return result;
    }

    private getValueCallback(node: IRowNode, field: string | Column): any {
        const otherColumn = this.columnModel.getPrimaryColumn(field);

        if (otherColumn) {
            return this.getValue(otherColumn, node);
        }

        return null;
    }

    // used by row grouping and pivot, to get key for a row. col can be a pivot col or a row grouping col
    public getKeyForNode(col: Column, rowNode: IRowNode): any {
        const value = this.getValue(col, rowNode);
        const keyCreator = col.getColDef().keyCreator;

        let result = value;
        if (keyCreator) {
            const keyParams: KeyCreatorParams = {
                value: value,
                colDef: col.getColDef(),
                column: col,
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptionsService.get('api')!,
                columnApi: this.gridOptionsService.get('columnApi')!,
                context: this.gridOptionsService.get('context')
            };
            result = keyCreator(keyParams);
        }

        // if already a string, or missing, just return it
        if (typeof result === 'string' || result == null) {
            return result;
        }

        result = String(result);

        if (result === '[object Object]') {
            doOnce(() => {
                console.warn('AG Grid: a column you are grouping or pivoting by has objects as values. If you want to group by complex objects then either a) use a colDef.keyCreator (se AG Grid docs) or b) to toString() on the object to return a key');
            }, 'getKeyForNode - warn about [object,object]');
        }

        return result;
    }
}
