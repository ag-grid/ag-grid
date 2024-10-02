import { ClientSideRowModelModule, ModuleNames } from 'ag-grid-community';

import { defineEnterpriseModule } from '../moduleUtils';
import { ClientSideChildrenTreeNodeManager } from './clientSideChildrenTreeNodeManager';
import { ClientSidePathTreeNodeManager } from './clientSidePathTreeNodeManager';

export const TreeDataCoreModule = defineEnterpriseModule('TreeDataModule', {
    beans: [ClientSidePathTreeNodeManager, ClientSideChildrenTreeNodeManager],
    dependsOn: [ClientSideRowModelModule],
});

export const TreeDataModule = defineEnterpriseModule(ModuleNames.TreeDataModule, {
    dependsOn: [TreeDataCoreModule],
});
