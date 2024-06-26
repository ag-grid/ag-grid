import type { AgColumn, IAggFunc, IAggFuncService, NamedBean } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
declare const defaultAggFuncNames: {
    readonly sum: "Sum";
    readonly first: "First";
    readonly last: "Last";
    readonly min: "Min";
    readonly max: "Max";
    readonly count: "Count";
    readonly avg: "Average";
};
type DefaultAggFuncName = keyof typeof defaultAggFuncNames;
export declare class AggFuncService extends BeanStub implements NamedBean, IAggFuncService {
    beanName: "aggFuncService";
    private aggFuncsMap;
    private initialised;
    postConstruct(): void;
    private init;
    private initialiseWithDefaultAggregations;
    private isAggFuncPossible;
    getDefaultFuncLabel(fctName: DefaultAggFuncName): string;
    getDefaultAggFunc(column: AgColumn): string | null;
    addAggFuncs(aggFuncs?: {
        [key: string]: IAggFunc;
    }): void;
    getAggFunc(name: string): IAggFunc;
    getFuncNames(column: AgColumn): string[];
    clear(): void;
}
export {};
