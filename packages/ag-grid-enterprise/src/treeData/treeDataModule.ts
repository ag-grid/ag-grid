import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { AggregationModule, SharedAggregationModule } from '../aggregation/aggregationModule';
import {
    ClientSideRowModelHierarchyModule,
    GroupColumnModule,
    GroupEditModule,
    StickyRowModule,
} from '../rowHierarchy/rowHierarchyModule';
import { VERSION } from '../version';
import { TreeGroupStrategy } from './treeGroupStrategy';

/**
 * @internal
 */
export const SharedTreeDataModule: _ModuleWithoutApi = {
    moduleName: 'SharedTreeData',
    version: VERSION,
    dependsOn: [EnterpriseCoreModule, SharedAggregationModule, GroupColumnModule, StickyRowModule],
};

/**
 * @feature Tree Data
 * @gridOption treeData
 */
export const TreeDataModule: _ModuleWithoutApi = {
    moduleName: 'TreeData',
    version: VERSION,
    dynamicBeans: { treeGroupStrategy: TreeGroupStrategy },
    rowModels: ['clientSide'],
    dependsOn: [SharedTreeDataModule, AggregationModule, ClientSideRowModelHierarchyModule, GroupEditModule],
};
