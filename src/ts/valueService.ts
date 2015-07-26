/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="columnController.ts" />

module awk.grid {

    export class ValueService {

        private gridOptionsWrapper: GridOptionsWrapper;
        private expressionService: ExpressionService;
        private columnModel: ColumnModel;

        public init(gridOptionsWrapper:GridOptionsWrapper, expressionService:ExpressionService, columnModel:ColumnModel):void {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.expressionService = expressionService;
            this.columnModel = columnModel;
        }

        public getValue(column: Column, data: any, node: any):any {

            var cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
            var field = column.colDef.field;

            var result: any;

            // if there is a value getter, this gets precedence over a field
            if (column.colDef.valueGetter) {
                result = this.executeValueGetter(column.colDef.valueGetter, data, column.colDef, node);
            } else if (field && data) {
                result = data[field];
            } else {
                result = undefined;
            }

            // the result could be an expression itself, if we are allowing cell values to be expressions
            if (cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
                var cellValueGetter = result.substring(1);
                result = this.executeValueGetter(cellValueGetter, data, column.colDef, node);
            }

            return result;
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
            var otherColumn = this.columnModel.getColumn(field);
            if (otherColumn) {
                return this.getValue(otherColumn, data, node);
            } else {
                return null;
            }
        }
    }

}