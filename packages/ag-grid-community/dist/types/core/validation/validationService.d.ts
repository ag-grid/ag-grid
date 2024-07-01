import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { ColDef, ColGroupDef } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
export declare class ValidationService extends BeanStub implements NamedBean {
    beanName: "validationService";
    private beans;
    private gridOptions;
    wireBeans(beans: BeanCollection): void;
    postConstruct(): void;
    processGridOptions(options: GridOptions): void;
    processColumnDefs(options: ColDef | ColGroupDef): void;
    warnMissingApiFunction(functionName: ApiFunctionName): void;
    validateApiFunction<TFunctionName extends ApiFunctionName>(functionName: TFunctionName, apiFunction: ApiFunction<TFunctionName>): ApiFunction<TFunctionName>;
    private processOptions;
    private checkForWarning;
    private checkProperties;
}
