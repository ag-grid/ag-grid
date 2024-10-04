import type { _ModuleWithoutApi } from 'ag-grid-community';
import { EditCoreModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { RichSelectCellEditor } from './richSelectCellEditor';

export const RichSelectModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RichSelectModule'),
    beans: [],
    userComponents: [
        { name: 'agRichSelect', classImp: RichSelectCellEditor },
        { name: 'agRichSelectCellEditor', classImp: RichSelectCellEditor },
    ],
    dependsOn: [EnterpriseCoreModule, EditCoreModule],
};
