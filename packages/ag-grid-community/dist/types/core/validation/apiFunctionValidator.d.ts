import type { ApiFunction, ApiFunctionName } from '../api/iApiFunction';
import type { BeanCollection } from '../context/context';
export declare function warnMissingApiFunction(functionName: ApiFunctionName, gridId: string): void;
export declare function validateApiFunction<TFunctionName extends ApiFunctionName>(functionName: TFunctionName, apiFunction: ApiFunction<TFunctionName>, beans: BeanCollection): ApiFunction<TFunctionName>;
