module awk.grid {

    export class ExpressionService {

        expressionToFunctionCache = <any>{};

        evaluate(expression: any, params: any) {

            try {
                var javaScriptFunction = this.createExpressionFunction(expression);
                var result = javaScriptFunction(params.value, params.context, params.node,
                    params.data, params.colDef, params.rowIndex, params.api, params.getValue);
                return result;
            } catch (e) {
                // the expression failed, which can happen, as it's the client that
                // provides the expression. so print a nice message
                console.log('Processing of the expression failed');
                console.log('Expression = ' + expression);
                console.log('Exception = ' + e);
                return null;
            }
        }

        createExpressionFunction(expression: any) {
            // check cache first
            if (this.expressionToFunctionCache[expression]) {
                return this.expressionToFunctionCache[expression];
            }
            // if not found in cache, return the function
            var functionBody = this.createFunctionBody(expression);
            var theFunction = new Function('x, ctx, node, data, colDef, rowIndex, api, getValue', functionBody);

            // store in cache
            this.expressionToFunctionCache[expression] = theFunction;

            return theFunction;
        }

        createFunctionBody(expression: any) {
            // if the expression has the 'return' word in it, then use as is,
            // if not, then wrap it with return and ';' to make a function
            if (expression.indexOf('return') >= 0) {
                return expression;
            } else {
                return 'return ' + expression + ';';
            }
        }
    }
}
