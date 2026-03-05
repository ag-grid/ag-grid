import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { GridSerializer } from './gridSerializer';

// Shared CSV and Excel logic
/**
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const SharedExportModule: _ModuleWithoutApi = {
    moduleName: 'SharedExport',
    version: VERSION,
    beans: [GridSerializer],
};
