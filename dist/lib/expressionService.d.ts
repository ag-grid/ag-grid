// Type definitions for ag-grid v5.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
export declare class ExpressionService {
    private expressionToFunctionCache;
    private logger;
    private setBeans(loggerFactory);
    evaluate(expression: string, params: any): any;
    private createExpressionFunction(expression);
    private createFunctionBody(expression);
}
