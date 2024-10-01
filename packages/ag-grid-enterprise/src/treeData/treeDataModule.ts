import { ClientSideRowModelModule } from 'ag-grid-community';

import { defineEnterpriseModule } from '../moduleUtils';
import { ClientSideChildrenTreeNodeManager } from './clientSideChildrenTreeNodeManager';
import { ClientSidePathTreeNodeManager } from './clientSidePathTreeNodeManager';

export const TreeDataModule = defineEnterpriseModule('TreeDataModule', {
    beans: [ClientSidePathTreeNodeManager, ClientSideChildrenTreeNodeManager],
    dependsOn: [ClientSideRowModelModule],
});
