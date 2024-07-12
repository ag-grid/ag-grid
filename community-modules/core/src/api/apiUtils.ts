import type { Context } from '../context/context';
import type { GridApi } from './gridApi';

export function createApiProxy(context: Context): { beanName: 'gridApi'; bean: GridApi } {
    return {
        beanName: 'gridApi',
        bean: context.getBean('apiFunctionService').gridApi,
    };
}
