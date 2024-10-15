import type { _ModuleWithoutApi } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { ClientSideRowModelExpansionModule } from '../expansion/expansionModule';
import { baseEnterpriseModule } from '../moduleUtils';
// TODO: we should not include here the whole RowGroupingModule
import { RowGroupingModule } from '../rowGrouping/rowGroupingModule';
import { ClientSideChildrenTreeNodeManager } from './clientSideChildrenTreeNodeManager';
import { ClientSidePathTreeNodeManager } from './clientSidePathTreeNodeManager';

export const TreeDataCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('TreeDataModule'),
    beans: [ClientSidePathTreeNodeManager, ClientSideChildrenTreeNodeManager],
    dependsOn: [
        EnterpriseCoreModule,
        ClientSideRowModelModule,
        ClientSideRowModelExpansionModule,
        // TODO: we should not include here the whole RowGroupingModule
        // we should move what's needed by both in a specific module
        RowGroupingModule,
    ],
};

export const TreeDataModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('TreeDataModule'),
    rowModels: ['clientSide'],
    dependsOn: [TreeDataCoreModule],
};
