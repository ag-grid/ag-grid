import { ModuleNames, _EditCoreModule, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { RichSelectCellEditor } from './richSelectCellEditor';

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
