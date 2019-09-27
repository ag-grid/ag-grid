// Type definitions for ag-grid-community v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export declare class ExpressionService {
    private expressionToFunctionCache;
    private logger;
    private setBeans;
    evaluate(expressionOrFunc: Function | string | undefined, params: any): any;
    private evaluateExpression;
    private createExpressionFunction;
    private createFunctionBody;
}
