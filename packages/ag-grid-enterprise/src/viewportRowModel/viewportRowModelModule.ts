import { ModuleNames, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { ViewportRowModel } from './viewportRowModel';

export const ViewportRowModelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModel: 'viewport',
    beans: [ViewportRowModel],
    dependantModules: [EnterpriseCoreModule],
});
