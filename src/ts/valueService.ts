import GridOptionsWrapper from "./gridOptionsWrapper";
import ExpressionService from "./expressionService";
import {ColumnController} from "./columnController/columnController";
import {ColDef} from "./entities/colDef";
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {Autowired} from "./context/context";
import {PostConstruct} from "./context/context";
import {RowNode} from "./entities/rowNode";
import Column from "./entities/column";

@Bean('valueService')
export default class ValueService {

    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') private expressionService: ExpressionService;
    @Autowired('columnController') private columnController: ColumnController;

    private suppressDotNotation: boolean;

    @PostConstruct
    public init(): void {
        this.suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
    }

    public getValue(column: Column, node: RowNode): any {
        return this.getValueUsingSpecificData(column, node.data, node);
    }

    public getValueUsingSpecificData(column: Column, data: any, node: any): any {

        var cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
        var colDef = column.getColDef();
        var field = colDef.field;

        var result: any;

        // if there is a value getter, this gets precedence over a field
        if (colDef.valueGetter) {
            result = this.executeValueGetter(colDef.valueGetter, data, column, node);
        } else if (field && data) {
            result = this.getValueUsingField(data, field);
        } else {
            result = undefined;
        }

        // the result could be an expression itself, if we are allowing cell values to be expressions
        if (cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
            var cellValueGetter = result.substring(1);
            result = this.executeValueGetter(cellValueGetter, data, column, node);
        }

        return result;
    }

    private getValueUsingField(data: any, field: string): void {
        if (!field || !data) {
            return;
        }
        // if no '.', then it's not a deep value
        if (this.suppressDotNotation || field.indexOf('.')<0) {
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
        if (this.suppressDotNotation || field.indexOf('.')<0) {
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
        var otherColumn = this.columnController.getColumn(field);
        if (otherColumn) {
            return this.getValueUsingSpecificData(otherColumn, data, node);
        } else {
            return null;
        }
    }
}
