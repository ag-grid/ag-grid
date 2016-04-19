// Type definitions for ag-grid v4.0.5
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { LoggerFactory } from "./logger";
export declare class ExpressionService {
    private expressionToFunctionCache;
    private logger;
    agWire(loggerFactory: LoggerFactory): void;
    evaluate(expression: string, params: any): any;
    private createExpressionFunction(expression);
    private createFunctionBody(expression);
}
