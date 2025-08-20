import { _RowModelSharedApiModule, onRowHeightChanged, resetRowHeights } from 'ag-grid-community';
import type { _ModuleWithApi, _ModuleWithoutApi, _ViewportRowModelGridApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { ViewportRowModel } from './viewportRowModel';

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
        onRowHeightChanged,
    },
    dependsOn: [EnterpriseCoreModule, _RowModelSharedApiModule],
};
