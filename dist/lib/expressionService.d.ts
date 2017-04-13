// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export declare class ExpressionService {
    private expressionToFunctionCache;
    private logger;
    private setBeans(loggerFactory);
    evaluate(expression: string, params: any): any;
    private createExpressionFunction(expression);
    private createFunctionBody(expression);
}
