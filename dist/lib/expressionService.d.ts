// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { LoggerFactory } from "./logger";
export default class ExpressionService {
    private expressionToFunctionCache;
    private logger;
    init(loggerFactory: LoggerFactory): void;
    evaluate(expression: string, params: any): any;
    private createExpressionFunction(expression);
    private createFunctionBody(expression);
}
