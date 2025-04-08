import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { EditingService } from './editingService';
import { RowEditingService } from './rowEditingService';

/**
 * @internal
 */
export const EditingCoreModule: _ModuleWithoutApi = {
    moduleName: 'EditingCore',
    version: VERSION,
    beans: [EditingService, RowEditingService],
    dependsOn: [],
    css: [],
};
