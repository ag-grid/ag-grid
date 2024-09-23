import { ModuleNames, _defineModule } from '@ag-grid-community/core';

import { ClientSideRowModelModule } from '../clientSideRowModelModule';
import { ClientSideTreeNodeManager } from '../treeData/clientSideTreeNodeManager';
import { VERSION } from '../version';

export const TreeDataModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    beans: [ClientSideTreeNodeManager],
    dependantModules: [ClientSideRowModelModule],
});
