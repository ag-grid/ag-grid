import { EditingModelModule } from '../editing-model/editingModelModule';
import type { _ModuleWithoutApi } from '../interfaces/iModule';
import { VERSION } from '../version';
import { EditingFacade } from './editingFacade';
import { BatchEditMode } from './mode/batchEditMode';
import { FullRowEditMode } from './mode/fullRowEditMode';
import { SingleCellEditMode } from './mode/singleCellEditMode';

/**
 * @internal
 */
export const EditingCoreModule: _ModuleWithoutApi = {
    moduleName: 'EditingCore',
    version: VERSION,
    beans: [EditingFacade],
    dynamicBeans: {
        cellEditMode: SingleCellEditMode,
        rowEditMode: FullRowEditMode,
        batchEditMode: BatchEditMode,
    },
    dependsOn: [EditingModelModule],
    css: [],
};
