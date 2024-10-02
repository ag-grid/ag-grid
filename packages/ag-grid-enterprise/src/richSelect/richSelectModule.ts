import type { Module } from 'ag-grid-community';
import { EditCoreModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { RichSelectCellEditor } from './richSelectCellEditor';

export const RichSelectModule: Module = {
    ...baseEnterpriseModule(ModuleNames.RichSelectModule),
    beans: [],
    userComponents: [
        { name: 'agRichSelect', classImp: RichSelectCellEditor },
        { name: 'agRichSelectCellEditor', classImp: RichSelectCellEditor },
    ],
    dependsOn: [EnterpriseCoreModule, EditCoreModule],
};
