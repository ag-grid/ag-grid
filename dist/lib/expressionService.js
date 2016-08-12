/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var logger_1 = require("./logger");
var context_1 = require("./context/context");
var context_2 = require("./context/context");
var ExpressionService = (function () {
    function ExpressionService() {
        this.expressionToFunctionCache = {};
    }
    ExpressionService.prototype.setBeans = function (loggerFactory) {
        this.logger = loggerFactory.create('ExpressionService');
    };
    ExpressionService.prototype.evaluate = function (expression, params) {
        try {
            var javaScriptFunction = this.createExpressionFunction(expression);
            var result = javaScriptFunction(params.value, params.context, params.node, params.data, params.colDef, params.rowIndex, params.api, params.getValue);
            return result;
        }
        catch (e) {
            // the expression failed, which can happen, as it's the client that
            // provides the expression. so print a nice message
            this.logger.log('Processing of the expression failed');
            this.logger.log('Expression = ' + expression);
            this.logger.log('Exception = ' + e);
            return null;
        }
    };
    ExpressionService.prototype.createExpressionFunction = function (expression) {
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
    };
    ExpressionService.prototype.createFunctionBody = function (expression) {
        // if the expression has the 'return' word in it, then use as is,
        // if not, then wrap it with return and ';' to make a function
        if (expression.indexOf('return') >= 0) {
            return expression;
        }
        else {
            return 'return ' + expression + ';';
        }
    };
    __decorate([
        __param(0, context_2.Qualifier('loggerFactory')), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
        __metadata('design:returntype', void 0)
    ], ExpressionService.prototype, "setBeans", null);
    ExpressionService = __decorate([
        context_1.Bean('expressionService'), 
        __metadata('design:paramtypes', [])
    ], ExpressionService);
    return ExpressionService;
})();
exports.ExpressionService = ExpressionService;
