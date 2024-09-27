import { EditCoreModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { RichSelectCellEditor } from './richSelectCellEditor';

export const RichSelectModule = defineEnterpriseModule(ModuleNames.RichSelectModule, {
    beans: [],
    userComponents: [
        { name: 'agRichSelect', classImp: RichSelectCellEditor },
        { name: 'agRichSelectCellEditor', classImp: RichSelectCellEditor },
    ],
    dependsOn: [EnterpriseCoreModule, EditCoreModule],
});
