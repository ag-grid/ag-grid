import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ApiFunction, ApiFunctionName } from './iApiFunction';
export declare class ApiFunctionService extends BeanStub implements NamedBean {
    beanName: "apiFunctionService";
    private beans;
    private functions;
    private isDestroyed;
    private preDestroyLink;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    callFunction(functionName: ApiFunctionName, args: any[]): any;
    addFunction<TFunctionName extends ApiFunctionName>(functionName: TFunctionName, func: ApiFunction<TFunctionName>): void;
    destroy(): void;
    private destroyedHandler;
    private isFrameworkMethod;
}
