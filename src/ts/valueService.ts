import GridOptionsWrapper from "./gridOptionsWrapper";
import ExpressionService from "./expressionService";
import {ColumnController} from "./columnController/columnController";
import {ColDef} from "./entities/colDef";

export default class ValueService {

    private gridOptionsWrapper: GridOptionsWrapper;
    private expressionService: ExpressionService;
    private columnController: ColumnController;

    public init(gridOptionsWrapper:GridOptionsWrapper, expressionService:ExpressionService, columnController:ColumnController):void {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.expressionService = expressionService;
        this.columnController = columnController;
    }

    public getValue(colDef: ColDef, data: any, node: any):any {

        var cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        var field = colDef.field;

        var result: any;

        // if there is a value getter, this gets precedence over a field
        if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, colDef, node);
        } else if (field && data) {
            result = this.getValueUsingField(data, field);
        } else {
            result = undefined;
        }

        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            var cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, colDef, node);
        }

        return result;
    }

    private getValueUsingField(data: any, field: string): void {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (field.indexOf('.')<0) {
            return data[field];
        } else {
            // otherwise it is a deep value, so need to dig for it
            var fields = field.split('.');
            var currentObject = data;
            for (var i = 0; i<fields.length; i++) {
                currentObject = currentObject[fields[i]];
                if (!currentObject) {
                    return null;
                }
            }
            return currentObject;
        }
    }

    public setValueUsingField(data: any, field: string, newValue: any): void {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (field.indexOf('.')<0) {
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

    private executeValueGetter(valueGetter: any, data: any, colDef: any, node: any): any {

        var context = this.gridOptionsWrapper.getContext();
        var api = this.gridOptionsWrapper.getApi();

        var params = {
            data: data,
            node: node,
            colDef: colDef,
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

    private getValueCallback(data: any, node: any, field: string): any {
        var otherColumn = this.columnController.getColumn(field);
        if (otherColumn) {
            return this.getValue(otherColumn.getColDef(), data, node);
        } else {
            return null;
        }
    }
}
