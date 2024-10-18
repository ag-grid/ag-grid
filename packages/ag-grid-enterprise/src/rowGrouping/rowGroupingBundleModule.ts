import type { _ModuleWithoutApi } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { PivotModule } from '../pivot/pivotModule';
import { TreeDataModule } from '../treeData/treeDataModule';
import { RowGroupingNoPivotModule } from './rowGroupingModule';

// this is the original module that also includes pivoting and tree data
export const RowGroupingModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('RowGroupingModule'),
    dependsOn: [PivotModule, RowGroupingNoPivotModule, TreeDataModule],
};
