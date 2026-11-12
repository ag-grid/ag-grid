import type { _ModuleWithoutApi } from 'ag-grid-community';
import { _EditCoreModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { RichSelectCellEditor } from './richSelectCellEditor';

/**
 * @feature Editing -> Rich Select Editor
 */
export const RichSelectModule: _ModuleWithoutApi = {
    moduleName: 'RichSelect',
    version: VERSION,
    beans: [],
    userComponents: { agRichSelect: RichSelectCellEditor, agRichSelectCellEditor: RichSelectCellEditor },
    dependsOn: [EnterpriseCoreModule, _EditCoreModule],
};
