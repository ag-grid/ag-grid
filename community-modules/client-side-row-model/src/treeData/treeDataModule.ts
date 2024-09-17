import { ModuleNames, _defineModule } from '@ag-grid-community/core';

import { ClientSideRowModelModule } from '../clientSideRowModelModule';
import { VERSION } from '../version';
import { ClientSideTreeNodeManager } from './clientSideTreeNodeManager';

export const TreeDataModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    beans: [ClientSideTreeNodeManager],
    dependantModules: [ClientSideRowModelModule],
});
