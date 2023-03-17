// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../context/beanStub";
export declare class ExpressionService extends BeanStub {
    private expressionToFunctionCache;
    private logger;
    private setBeans;
    evaluate(expression: string | undefined, params: any): any;
    private evaluateExpression;
    private createExpressionFunction;
    private createFunctionBody;
}
