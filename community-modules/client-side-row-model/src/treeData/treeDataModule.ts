import { ModuleNames, _defineModule } from '@ag-grid-community/core';

import { ClientSideRowModelModule } from '../clientSideRowModelModule';
import { VERSION } from '../version';
import { ClientSideChildrenTreeNodeManager } from './clientSideChildrenTreeNodeManager';
import { ClientSidePathTreeNodeManager } from './clientSidePathTreeNodeManager';

export const TreeDataModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    beans: [ClientSidePathTreeNodeManager, ClientSideChildrenTreeNodeManager],
    dependantModules: [ClientSideRowModelModule],
});
