import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { AggregationModule, SharedAggregationModule } from '../aggregation/aggregationModule';
import {
    ChangedPathModule,
    ClientSideRowModelHierarchyModule,
    GroupColumnModule,
    GroupEditModule,
    StickyRowModule,
} from '../rowHierarchy/rowHierarchyModule';
import { VERSION } from '../version';
import { TreeDataFilterStage } from './treeDataFilterStage';
import { TreeGroupStrategy } from './treeGroupStrategy';

/**
 * @internal
 */
export const SharedTreeDataModule: _ModuleWithoutApi = {
    moduleName: 'SharedTreeData',
    version: VERSION,
    dependsOn: [EnterpriseCoreModule, SharedAggregationModule, GroupColumnModule, StickyRowModule, ChangedPathModule],
};

/**
 * @feature Tree Data
 * @gridOption treeData
 */
export const TreeDataModule: _ModuleWithoutApi = {
    moduleName: 'TreeData',
    version: VERSION,
    beans: [TreeDataFilterStage],
    dynamicBeans: { treeGroupStrategy: TreeGroupStrategy },
    rowModels: ['clientSide'],
    dependsOn: [SharedTreeDataModule, AggregationModule, ClientSideRowModelHierarchyModule, GroupEditModule],
};
