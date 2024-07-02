import type { Context } from '../context/context';
import type { GridApi } from './gridApi';

function createApi(context: Context): GridApi {
    const apiFunctionService = context.getBean('apiFunctionService');
    return new Proxy(apiFunctionService, {
        get(target, prop) {
            // allow api to work with async/await
            if (prop === 'then') {
                return;
            }
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
