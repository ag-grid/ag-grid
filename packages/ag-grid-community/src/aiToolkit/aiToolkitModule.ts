import type { _AiToolkitGridApi } from '../api/gridApi';
import { ColumnApiModule } from '../columns/columnModule';
import type { _ModuleWithApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { getStructuredSchema } from './structuredSchema';

export type StructuredSchema = any;

export const AiToolkitModule: _ModuleWithApi<_AiToolkitGridApi> = {
    moduleName: 'AiToolkit',
    version: VERSION,
    beans: [],
    dependsOn: [ColumnApiModule],
    apiFunctions: {
        getStructuredSchema,
    },
};
