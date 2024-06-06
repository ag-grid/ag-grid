import type { Context } from '../context/context';
import type { RowModelType } from '../interfaces/iRowModel';
import { _warnOnce } from '../utils/function';
import type { GridApi } from './gridApi';

function createApi(context: Context): GridApi {
    const apiFunctionService = context.getBean('apiFunctionService');
    return new Proxy(apiFunctionService, {
        get(target, prop) {
            return (...args: any[]) => target.callFunction(prop as any, args);
        },
    }) as any;
}

export function createApiProxy(context: Context): { beanName: 'gridApi'; bean: GridApi } {
    return {
        beanName: 'gridApi',
        bean: createApi(context),
    };
}

export function _logMissingRowModel(apiMethod: keyof GridApi, ...requiredRowModels: RowModelType[]) {
    console.error(
        `AG Grid: api.${apiMethod} can only be called when gridOptions.rowModelType is ${requiredRowModels.join(' or ')}`
    );
}

/** Utility type to support adding params to a grid api method. */
type StartsWithGridApi = `${keyof GridApi}${string}`;

export function _logDeprecation(
    version: string,
    apiMethod: StartsWithGridApi,
    replacement: StartsWithGridApi,
    message?: string
) {
    _warnOnce(`Since ${version} api.${apiMethod} is deprecated. Please use ${replacement} instead. ${message ?? ''}`);
}
