import type { Context } from '../context/context';
import type { GridApi } from './gridApi';
export declare function createApiProxy(context: Context): {
    beanName: 'gridApi';
    bean: GridApi;
};
