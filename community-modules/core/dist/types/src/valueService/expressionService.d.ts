import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
export declare class ExpressionService extends BeanStub implements NamedBean {
    beanName: "expressionService";
    private expressionToFunctionCache;
    evaluate(expression: string | undefined, params: any): any;
    private evaluateExpression;
    private createExpressionFunction;
    private createFunctionBody;
}
