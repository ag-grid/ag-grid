import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {ExpressionService} from "./expressionService";
import {ColumnController} from "./columnController/columnController";
import {ColDef} from "./entities/colDef";
import {Bean, Autowired, PostConstruct} from "./context/context";
import {RowNode} from "./entities/rowNode";
import {Column} from "./entities/column";
import {Utils as _} from "./utils";
import {Events} from "./events";
import {EventService} from "./eventService";

@Bean('valueService')
export class ValueService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;

    private suppressDotNotation: boolean;
    private cellExpressions: boolean;
    private userProvidedTheGroups: boolean;
    private suppressUseColIdForGroups: boolean;

    private initialised = false;

    @PostConstruct
    public init(): void {
        this.suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
        this.cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        this.userProvidedTheGroups = _.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
        this.suppressUseColIdForGroups = this.gridOptionsWrapper.isSuppressUseColIdForGroups();
        this.initialised = true;
    }

    public getValue(column: Column, node: RowNode): any {
        return this.getValueUsingSpecificData(column, node.data, node);
    }

    public getValueUsingSpecificData(column: Column, data: any, node: RowNode): any {

        // hack - the grid is getting refreshed before this bean gets initialised, race condition.
        // really should have a way so they get initialised in the right order???
        if (!this.initialised) { this.init(); }

        var colDef = column.getColDef();
        var field = colDef.field;

        var result: any;

        // if there is a value getter, this gets precedence over a field
        // - need to revisit this, we check 'data' as this is the way for the grid to
        //   not render when on the footer row
        if (data && node.group && !this.userProvidedTheGroups && !this.suppressUseColIdForGroups) {
            result = node.data ? node.data[column.getId()] : undefined;
        } else if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, node);
        } else if (field && data) {
            result = this.getValueUsingField(data, field, column.isFieldContainsDots());
        } else {
            result = undefined;
        }

        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (this.cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            var cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, column, node);
        }

        return result;
    }

    private getValueUsingField(data: any, field: string, fieldContainsDots: boolean): any {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (!fieldContainsDots) {
            return data[field];
        } else {
            // otherwise it is a deep value, so need to dig for it
            var fields = field.split('.');
            var currentObject = data;
            for (var i = 0; i<fields.length; i++) {
                currentObject = currentObject[fields[i]];
                if (_.missing(currentObject)) {
                    return null;
                }
            }
            return currentObject;
        }
    }

    public setValue(rowNode: RowNode, colKey: string|ColDef|Column, newValue: any): void {
        var column = this.columnController.getPrimaryColumn(colKey);
        
        if (!rowNode || !column) {
            return;
        }
        // this will only happen if user is trying to paste into a group row, which doesn't make sense
        // the user should not be trying to paste into group rows
        var data = rowNode.data;
        if (_.missing(data)) {
            return;
        }

        var field = column.getColDef().field;
        var newValueHandler = column.getColDef().newValueHandler;

        // need either a field or a newValueHandler for this to work
        if (_.missing(field) && _.missing(newValueHandler)) {
            console.warn(`ag-Grid: you need either field or newValueHandler set on colDef for editing to work`);
            return;
        }

        var paramsForCallbacks = {
            node: rowNode,
            data: rowNode.data,
            oldValue: this.getValue(column, rowNode),
            newValue: newValue,
            colDef: column.getColDef(),
            api: this.gridOptionsWrapper.getApi(),
            context: this.gridOptionsWrapper.getContext()
        };

        if (newValueHandler) {
            newValueHandler(paramsForCallbacks);
        } else {
            this.setValueUsingField(data, field, newValue, column.isFieldContainsDots());
        }

        // reset quick filter on this row
        rowNode.resetQuickFilterAggregateText();

        paramsForCallbacks.newValue = this.getValue(column, rowNode);

        if (typeof column.getColDef().onCellValueChanged === 'function') {
            column.getColDef().onCellValueChanged(paramsForCallbacks);
        }
        this.eventService.dispatchEvent(Events.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);
    }

    private setValueUsingField(data: any, field: string, newValue: any, isFieldContainsDots: boolean): void {
        // if no '.', then it's not a deep value
        if (!isFieldContainsDots) {
            data[field] = newValue;
        } else {
            // otherwise it is a deep value, so need to dig for it
            var fieldPieces = field.split('.');
            var currentObject = data;
            while (fieldPieces.length > 0 && currentObject) {
                let fieldPiece = fieldPieces.shift();
                if (fieldPieces.length === 0) {
                    currentObject[fieldPiece] = newValue;
                } else {
                    currentObject = currentObject[fieldPiece];
                }
            }
        }
    }

    private executeValueGetter(valueGetter: any, data: any, column: Column, node: RowNode): any {

        var context = this.gridOptionsWrapper.getContext();
        var api = this.gridOptionsWrapper.getApi();

        var params = {
            data: data,
            node: node,
            colDef: column.getColDef(),
            api: api,
            context: context,
            getValue: this.getValueCallback.bind(this, data, node)
        };

        if (typeof valueGetter === 'function') {
            // valueGetter is a function, so just call it
            return valueGetter(params);
        } else if (typeof valueGetter === 'string') {
            // valueGetter is an expression, so execute the expression
            return this.expressionService.evaluate(valueGetter, params);
        }
    }

    private getValueCallback(data: any, node: RowNode, field: string): any {
        var otherColumn = this.columnController.getPrimaryColumn(field);
        if (otherColumn) {
            return this.getValueUsingSpecificData(otherColumn, data, node);
        } else {
            return null;
        }
    }
}
