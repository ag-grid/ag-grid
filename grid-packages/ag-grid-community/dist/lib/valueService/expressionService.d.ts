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
