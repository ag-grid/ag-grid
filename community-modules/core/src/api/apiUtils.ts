import type { Context } from '../context/context';
import { _warnOnce } from '../utils/function';
import type { GridApi } from './gridApi';

function createApi(context: Context): GridApi {
    const apiFunctionService = context.getBean('apiFunctionService');
    if (!apiFunctionService) {
        return new Proxy(
            {},
            {
                get() {
                    _warnOnce('API module is not registered');
                    return () => {};
                },
            }
        ) as any;
    }
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
