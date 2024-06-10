import type { Module } from '@ag-grid-community/core';
import { ModuleNames, _EditCoreModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { RichSelectCellEditor } from './richSelect/richSelectCellEditor';
import { VERSION } from './version';

export const RichSelectModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.RichSelectModule,
    beans: [],
    userComponents: [
        { name: 'agRichSelect', classImp: RichSelectCellEditor },
        { name: 'agRichSelectCellEditor', classImp: RichSelectCellEditor },
    ],
    dependantModules: [EnterpriseCoreModule, _EditCoreModule],
};
