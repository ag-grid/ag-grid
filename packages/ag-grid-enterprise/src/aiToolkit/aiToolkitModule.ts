import type { _AiToolkitGridApi, _ModuleWithApi } from 'ag-grid-community';
import { ColumnApiModule } from 'ag-grid-community';

import { VERSION } from '../version';
import { getStructuredSchema } from './structuredSchema';

export const AiToolkitModule: _ModuleWithApi<_AiToolkitGridApi> = {
    moduleName: 'AiToolkit',
    version: VERSION,
    beans: [],
    dependsOn: [ColumnApiModule],
    apiFunctions: {
        getStructuredSchema,
    },
};
