import { ModuleNames, _defineModule } from 'ag-grid-community';

import { VERSION } from '../version';
import { ViewportRowModel } from './viewportRowModel';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';

export const ViewportRowModelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ViewportRowModelModule,
    rowModel: 'viewport',
    beans: [ViewportRowModel],
    dependantModules: [EnterpriseCoreModule],
});
