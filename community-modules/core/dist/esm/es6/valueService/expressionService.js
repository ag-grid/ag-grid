/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Bean } from "../context/context";
import { Qualifier } from "../context/context";
import { BeanStub } from "../context/beanStub";
let ExpressionService = class ExpressionService extends BeanStub {
    constructor() {
        super(...arguments);
        this.expressionToFunctionCache = {};
    }
    setBeans(loggerFactory) {
        this.logger = loggerFactory.create('ExpressionService');
    }
    evaluate(expressionOrFunc, params) {
        if (typeof expressionOrFunc === 'function') {
            // valueGetter is a function, so just call it
            const func = expressionOrFunc;
            return func(params);
        }
        else if (typeof expressionOrFunc === 'string') {
            // valueGetter is an expression, so execute the expression
            const expression = expressionOrFunc;
            return this.evaluateExpression(expression, params);
        }
        else {
            console.error('AG Grid: value should be either a string or a function', expressionOrFunc);
        }
    }
    evaluateExpression(expression, params) {
        try {
            const javaScriptFunction = this.createExpressionFunction(expression);
            // the params don't have all these values, rather we add every possible
            // value a params can have, which makes whatever is in the params available.
            const result = javaScriptFunction(params.value, params.context, params.oldValue, params.newValue, params.value, params.node, params.data, params.colDef, params.rowIndex, params.api, params.columnApi, params.getValue, params.column, params.columnGroup);
            return result;
        }
        catch (e) {
            // the expression failed, which can happen, as it's the client that
            // provides the expression. so print a nice message
            // tslint:disable-next-line
            console.log('Processing of the expression failed');
            // tslint:disable-next-line
            console.log('Expression = ' + expression);
            // tslint:disable-next-line
            console.log('Params =', params);
            // tslint:disable-next-line
            console.log('Exception = ' + e);
            return null;
        }
    }
    createExpressionFunction(expression) {
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
    createFunctionBody(expression) {
        // if the expression has the 'return' word in it, then use as is,
        // if not, then wrap it with return and ';' to make a function
        if (expression.indexOf('return') >= 0) {
            return expression;
        }
        else {
            return 'return ' + expression + ';';
        }
    }
};
__decorate([
    __param(0, Qualifier('loggerFactory'))
], ExpressionService.prototype, "setBeans", null);
ExpressionService = __decorate([
    Bean('expressionService')
], ExpressionService);
export { ExpressionService };
