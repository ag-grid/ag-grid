import type { _AiToolkitGridApi, _ModuleWithApi } from 'ag-grid-community';
import { ColumnApiModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { getStructuredSchema } from './structuredSchema';

/**
 * @feature AI Toolkit
 */
export const AiToolkitModule: _ModuleWithApi<_AiToolkitGridApi> = {
    moduleName: 'AiToolkit',
    version: VERSION,
    beans: [],
    dependsOn: [EnterpriseCoreModule, ColumnApiModule],
    apiFunctions: {
        getStructuredSchema,
    },
};
