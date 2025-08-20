import type { _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';
import type { _ViewportRowModelGridApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { ViewportRowModel } from './viewportRowModel';
import { resetRowHeights } from './viewportRowModelApi';

/**
 * @feature Viewport Row Model
 */
export const ViewportRowModelModule: _ModuleWithoutApi = {
    moduleName: 'ViewportRowModel',
    version: VERSION,
    rowModels: ['viewport'],
    beans: [ViewportRowModel],
    dependsOn: [EnterpriseCoreModule],
};

/**
 * @feature Viewport Row Model
 */
export const ViewportRowModelApiModule: _ModuleWithApi<_ViewportRowModelGridApi> = {
    moduleName: 'ViewportRowModelApi',
    version: VERSION,
    apiFunctions: {
        resetRowHeights,
    },
    dependsOn: [EnterpriseCoreModule],
};
