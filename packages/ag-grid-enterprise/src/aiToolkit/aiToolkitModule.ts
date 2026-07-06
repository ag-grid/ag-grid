import type { _AiToolkitGridApi, _ModuleWithApi } from 'ag-grid-community';
import { ColumnApiModule, GridStateModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { getStructuredSchema } from './structuredSchema';
import { applyToolCall, getTools } from './toolRegistry';

/**
 * @feature AI Toolkit
 */
export const AiToolkitModule: _ModuleWithApi<_AiToolkitGridApi> = {
    moduleName: 'AiToolkit',
    version: VERSION,
    beans: [],
    dependsOn: [EnterpriseCoreModule, ColumnApiModule, GridStateModule],
    apiFunctions: {
        getStructuredSchema,
        getTools,
        applyToolCall,
    },
};
