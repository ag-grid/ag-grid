import type { Context } from '../context/context';
import type { GridApi } from './gridApi';

function createApi(context: Context): GridApi {
    const apiFunctionService = context.getBean('apiFunctionService');
    return new Proxy(apiFunctionService, {
        get(target, prop) {
            const func = target.functions[prop];
     
            if (func || target.isFrameworkMethod(prop)) {
                return (...args: any[]) => target.callFunction(prop as any, args);
            }
            
            target.beans?.validationService?.warnMissingApiFunction(prop);
            
            return undefined;
        },
    }) as any;
}

export function createApiProxy(context: Context): { beanName: 'gridApi'; bean: GridApi } {
    return {
        beanName: 'gridApi',
        bean: createApi(context),
    };
}
