import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ExpressionService} from "./expressionService";
import {ColumnController} from "../columnController/columnController";
import {NewValueParams, ValueGetterParams} from "../entities/colDef";
import {Autowired, Bean, PostConstruct} from "../context/context";
import {RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {_} from "../utils";
import {CellValueChangedEvent, Events} from "../events";
import {EventService} from "../eventService";
import {ValueCache} from "./valueCache";

@Bean('valueService')
export class ValueService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('valueCache') private valueCache: ValueCache;

    private cellExpressions: boolean;

    private initialised = false;

    @PostConstruct
    public init(): void {
        this.cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        this.initialised = true;
    }

    public getValue(column: Column,
                    rowNode: RowNode,
                    forFilter = false,
                    ignoreAggData = false): any {

        // console.log(`turnActive = ${this.turnActive}`);

        // hack - the grid is getting refreshed before this bean gets initialised, race condition.
        // really should have a way so they get initialised in the right order???
        if (!this.initialised) { this.init(); }

        // pull these out to make code below easier to read
        let colDef = column.getColDef();
        let field = colDef.field;
        let colId = column.getId();
        let data = rowNode.data;

        let result: any;

        // if there is a value getter, this gets precedence over a field
        let groupDataExists = rowNode.groupData && rowNode.groupData[colId] !== undefined;
        let aggDataExists = !ignoreAggData && rowNode.aggData && rowNode.aggData[colId] !== undefined;
        if (forFilter && colDef.filterValueGetter) {
            result = this.executeValueGetter(colDef.filterValueGetter, data, column, rowNode);
        } else if (groupDataExists) {
            result = rowNode.groupData[colId];
        } else if (aggDataExists) {
            result = rowNode.aggData[colId];
        } else if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, rowNode);
        } else if (field && data) {
            result = _.getValueUsingField(data, field, column.isFieldContainsDots());
        } else {
            result = undefined;
        }

        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            let cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, column, rowNode);
        }

        return result;
    }

    public setValue(rowNode: RowNode, colKey: string|Column, newValue: any): void {
        let column = this.columnController.getPrimaryColumn(colKey);

        if (!rowNode || !column) {
            return;
        }
        // this will only happen if user is trying to paste into a group row, which doesn't make sense
        // the user should not be trying to paste into group rows
        let data = rowNode.data;
        if (_.missing(data)) {
            rowNode.data = {};
        }

        // for backwards compatibility we are also retrieving the newValueHandler as well as the valueSetter
        let {field, newValueHandler, valueSetter} = column.getColDef();

        // need either a field or a newValueHandler for this to work
        if (_.missing(field) && _.missing(newValueHandler) && _.missing(valueSetter)) {
            // we don't tell user about newValueHandler, as that is deprecated
            console.warn(`ag-Grid: you need either field or valueSetter set on colDef for editing to work`);
            return;
        }

        let params: NewValueParams = {
            node: rowNode,
            data: rowNode.data,
            oldValue: this.getValue(column, rowNode),
            newValue: newValue,
            colDef: column.getColDef(),
            column: column,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        };

        params.newValue = newValue;

        let valueWasDifferent: boolean;
        if (_.exists(newValueHandler)) {
            valueWasDifferent = newValueHandler(params);
        } else if (_.exists(valueSetter)) {
            valueWasDifferent = this.expressionService.evaluate(valueSetter, params);
        } else {
            valueWasDifferent = this.setValueUsingField(data, field, newValue, column.isFieldContainsDots());
        }

        // in case user forgot to return something (possible if they are not using TypeScript
        // and just forgot, or using an old newValueHandler we didn't always expect a return
        // value here), we default the return value to true, so we always refresh.
        if (valueWasDifferent === undefined) {
            valueWasDifferent = true;
        }

        // if no change to the value, then no need to do the updating, or notifying via events.
        // otherwise the user could be tabbing around the grid, and cellValueChange would get called
        // all the time.
        if (!valueWasDifferent) { return; }

        // reset quick filter on this row
        rowNode.resetQuickFilterAggregateText();

        this.valueCache.onDataChanged();

        params.newValue = this.getValue(column, rowNode);

        if (typeof column.getColDef().onCellValueChanged === 'function') {
            // to make callback async, do in a timeout
            setTimeout( ()=> column.getColDef().onCellValueChanged(params), 0);
        }

        let event: CellValueChangedEvent = {
            type: Events.EVENT_CELL_VALUE_CHANGED,
            event: null,
            rowIndex: rowNode.rowIndex,
            rowPinned: rowNode.rowPinned,
            column: params.column,
            api: params.api,
            colDef: params.colDef,
            columnApi: params.columnApi,
            context: params.context,
            data: rowNode.data,
            node: rowNode,
            oldValue: params.oldValue,
            newValue: params.newValue,
            value: params.newValue
        };

        this.eventService.dispatchEvent(event);
    }

    private setValueUsingField(data: any, field: string, newValue: any, isFieldContainsDots: boolean): boolean {
        // if no '.', then it's not a deep value
        let valuesAreSame: boolean;
        if (!isFieldContainsDots) {
            data[field] = newValue;
        } else {
            // otherwise it is a deep value, so need to dig for it
            let fieldPieces = field.split('.');
            let currentObject = data;
            while (fieldPieces.length > 0 && currentObject) {
                let fieldPiece = fieldPieces.shift();
                if (fieldPieces.length === 0) {
                    currentObject[fieldPiece] = newValue;
                } else {
                    currentObject = currentObject[fieldPiece];
                }
            }
        }
        return !valuesAreSame;
    }

    private executeValueGetter(filterValueGetter: string | Function, data: any, column: Column, rowNode: RowNode): any {

        let colId = column.getId();

        // if inside the same turn, just return back the value we got last time
        let valueFromCache = this.valueCache.getValue(rowNode, colId);

        if (valueFromCache!==undefined) {
            return valueFromCache;
        }

        let params: ValueGetterParams = {
            data: data,
            node: rowNode,
            column: column,
            colDef: column.getColDef(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            getValue: this.getValueCallback.bind(this, rowNode)
        };

        let result = this.expressionService.evaluate(filterValueGetter, params);

        // if a turn is active, store the value in case the grid asks for it again
        this.valueCache.setValue(rowNode, colId, result);

        return result;
    }

    private getValueCallback(node: RowNode, field: string): any {
        let otherColumn = this.columnController.getPrimaryColumn(field);
        if (otherColumn) {
            return this.getValue(otherColumn, node);
        } else {
            return null;
        }
    }

    // used by row grouping and pivot, to get key for a row. col can be a pivot col or a row grouping col
    public getKeyForNode(col: Column, rowNode: RowNode): any {
        let value = this.getValue(col, rowNode);
        let result: any;
        let keyCreator = col.getColDef().keyCreator;

        if (keyCreator) {
            result = keyCreator({value: value});
        } else {
            result = value;
        }

        // if already a string, or missing, just return it
        if (typeof result === 'string' || result===null || result===undefined) { return result; }

        result = String(result);

        if (result==='[object Object]') {
            _.doOnce( ()=> {
                console.warn('ag-Grid: a column you are grouping or pivoting by has objects as values. If you want to group by complex objects then either a) use a colDef.keyCreator (se ag-Grid docs) or b) to toString() on the object to return a key');
            }, 'getKeyForNode - warn about [object,object]');
        }

        return result;
    }

}
