import { Logger, LoggerFactory } from "../logger";
import { Bean } from "../context/context";
import { Qualifier } from "../context/context";

@Bean('expressionService')
export class ExpressionService {

    private expressionToFunctionCache = {} as any;
    private logger: Logger;

    private setBeans(@Qualifier('loggerFactory') loggerFactory: LoggerFactory) {
        this.logger = loggerFactory.create('ExpressionService');
    }

    public evaluate(expressionOrFunc: Function | string | undefined, params: any): any {
        if (typeof expressionOrFunc === 'function') {
            // valueGetter is a function, so just call it
            const func = expressionOrFunc as Function;
            return func(params);
        } else if (typeof expressionOrFunc === 'string') {
            // valueGetter is an expression, so execute the expression
            const expression = expressionOrFunc as string;
            return this.evaluateExpression(expression, params);
        } else {
            console.error('ag-Grid: value should be either a string or a function', expressionOrFunc);
        }
    }

    private evaluateExpression(expression: string, params: any): any {
        try {
            const javaScriptFunction = this.createExpressionFunction(expression);
            // the params don't have all these values, rather we add every possible
            // value a params can have, which makes whatever is in the params available.
            const result = javaScriptFunction(params.value, params.context,
                params.oldValue, params.newValue, params.value, params.node,
                params.data, params.colDef, params.rowIndex, params.api, params.columnApi,
                params.getValue, params.column, params.columnGroup);
            return result;
        } catch (e) {
            // the expression failed, which can happen, as it's the client that
            // provides the expression. so print a nice message
            // tslint:disable-next-line
            console.log('Processing of the expression failed');
            // tslint:disable-next-line
            console.log('Expression = ' + expression);
            // tslint:disable-next-line
            console.log('Exception = ' + e);
            return null;
        }
    }

    private createExpressionFunction(expression: any) {
        // check cache first
        if (this.expressionToFunctionCache[expression]) {
            return this.expressionToFunctionCache[expression];
        }
        // if not found in cache, return the function
        const functionBody = this.createFunctionBody(expression);
        const theFunction = new Function('x, ctx, oldValue, newValue, value, node, data, colDef, rowIndex, api, columnApi, getValue, column, columnGroup', functionBody);

        // store in cache
        this.expressionToFunctionCache[expression] = theFunction;

        return theFunction;
    }

    private createFunctionBody(expression: any) {
        // if the expression has the 'return' word in it, then use as is,
        // if not, then wrap it with return and ';' to make a function
        if (expression.indexOf('return') >= 0) {
            return expression;
        } else {
            return 'return ' + expression + ';';
        }
    }
}
