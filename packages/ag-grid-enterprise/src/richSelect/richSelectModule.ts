import { ModuleNames, _EditCoreModule, _defineModule } from 'ag-grid-community';

import { RichSelectCellEditor } from './richSelectCellEditor';
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';

export const RichSelectModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.RichSelectModule,
    beans: [],
    userComponents: [
        { name: 'agRichSelect', classImp: RichSelectCellEditor },
        { name: 'agRichSelectCellEditor', classImp: RichSelectCellEditor },
    ],
    dependantModules: [EnterpriseCoreModule, _EditCoreModule],
});
