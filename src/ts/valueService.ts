import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ExpressionService} from "./expressionService";
import {ColumnController} from "./columnController/columnController";
import {ColDef, NewValueParams, ValueGetterParams} from "./entities/colDef";
import {Autowired, Bean, PostConstruct} from "./context/context";
import {RowNode} from "./entities/rowNode";
import {Column} from "./entities/column";
import {Utils as _} from "./utils";
import {Events} from "./events";
import {EventService} from "./eventService";
import {GroupValueService} from "./groupValueService";

@Bean('valueService')
export class ValueService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('groupValueService') private groupValueService: GroupValueService;

    private cellExpressions: boolean;

    private initialised = false;

    @PostConstruct
    public init(): void {
        this.cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        this.initialised = true;
    }

    public getValue(column: Column, rowNode: RowNode, ignoreAggData = false): any {

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
        if (groupDataExists) {
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

    public setValue(rowNode: RowNode, colKey: string|ColDef|Column, newValue: any): void {
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

        let {field, newValueHandler, valueSetter, valueParser} = column.getColDef();

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

        let parsedValue = _.exists(valueParser) ? this.expressionService.evaluate(valueParser, params) : newValue;
        params.newValue = parsedValue;

        let valueWasDifferent: boolean;
        if (_.exists(newValueHandler)) {
            valueWasDifferent = newValueHandler(params);
        } else if (_.exists(valueSetter)) {
            valueWasDifferent = this.expressionService.evaluate(valueSetter, params);
        } else {
            valueWasDifferent = this.setValueUsingField(data, field, parsedValue, column.isFieldContainsDots());
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

        params.newValue = this.getValue(column, rowNode);

        if (typeof column.getColDef().onCellValueChanged === 'function') {
            column.getColDef().onCellValueChanged(params);
        }
        this.eventService.dispatchEvent(Events.EVENT_CELL_VALUE_CHANGED, params);
    }

    private setValueUsingField(data: any, field: string, newValue: any, isFieldContainsDots: boolean): boolean {
        // if no '.', then it's not a deep value
        let valuesAreSame: boolean;
        if (!isFieldContainsDots) {
            valuesAreSame = _.valuesSimpleAndSame(data[field], newValue);
            if (!valuesAreSame) {
                data[field] = newValue;
            }
        } else {
            // otherwise it is a deep value, so need to dig for it
            let fieldPieces = field.split('.');
            let currentObject = data;
            while (fieldPieces.length > 0 && currentObject) {
                let fieldPiece = fieldPieces.shift();
                if (fieldPieces.length === 0) {
                    valuesAreSame = _.valuesSimpleAndSame(currentObject[fieldPiece], newValue);
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

    private executeValueGetter(valueGetter: string | Function, data: any, column: Column, node: RowNode): any {

        let params: ValueGetterParams = {
            data: data,
            node: node,
            column: column,
            colDef: column.getColDef(),
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext(),
            getValue: this.getValueCallback.bind(this, node)
        };

        return this.expressionService.evaluate(valueGetter, params);
    }

    private getValueCallback(node: RowNode, field: string): any {
        let otherColumn = this.columnController.getPrimaryColumn(field);
        if (otherColumn) {
            return this.getValue(otherColumn, node);
        } else {
            return null;
        }
    }
}
