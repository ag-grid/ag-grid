import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { EditingModelService } from './editingModelService';

/**
 * @internal
 */
export const EditingModelModule: _ModuleWithoutApi = {
    moduleName: 'EditingModel',
    version: VERSION,
    beans: [EditingModelService],
    dependsOn: [],
    css: [],
};
