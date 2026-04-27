import type { _ModuleWithoutApi } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { ValueColsSvc } from '../aggregation/valueColsSvc';
import { PivotColsSvc } from '../pivot/pivotColsSvc';
import { RowGroupColsSvc } from '../rowGrouping/rowGroupColsSvc';
import { VERSION } from '../version';
import { AutoColService } from './autoColService';
import { ChangedPathFactory } from './changedPathImpl/changedPathFactory';
import { CsrmExpansionService } from './csrmExpansionService';
import { FlattenStage } from './flattenStage';
import { GroupEditService } from './groupEditService';
import { GroupFilterStage } from './groupFilterStage';
import { GroupSortStage } from './groupSortStage';
import { GroupStage } from './groupStage';
import { GroupCellRenderer } from './rendering/groupCellRenderer';
import { GroupCellRendererCtrl } from './rendering/groupCellRendererCtrl';
import groupCellStylesCSS from './rendering/groupCellStyles.css';
import { ShowRowGroupColValueService } from './showRowGroupColValueService';
import { ShowRowGroupColsService } from './showRowGroupColsService';
import { StickyRowService } from './stickyRowService';

/**
 * @internal
 */
export const GroupCellRendererModule: _ModuleWithoutApi = {
    moduleName: 'GroupCellRenderer',
    version: VERSION,
    userComponents: {
        agGroupRowRenderer: GroupCellRenderer,
        agGroupCellRenderer: GroupCellRenderer,
    },
    dynamicBeans: { groupCellRendererCtrl: GroupCellRendererCtrl },
    icons: {
        // shown on row group when contracted (click to expand)
        groupContracted: 'tree-closed',
        // shown on row group when expanded (click to contract)
        groupExpanded: 'tree-open',
    },
    css: [groupCellStylesCSS],
    dependsOn: [EnterpriseCoreModule],
};

/**
 * Shared between row grouping and tree data
 * @internal
 */
export const GroupColumnModule: _ModuleWithoutApi = {
    moduleName: 'GroupColumn',
    version: VERSION,
    beans: [
        AutoColService,
        ShowRowGroupColsService,
        ShowRowGroupColValueService,
        RowGroupColsSvc,
        PivotColsSvc,
        ValueColsSvc,
    ],
    dependsOn: [EnterpriseCoreModule, GroupCellRendererModule],
};

/**
 * Shared ChangedPath factory — not row-model restricted
 * @internal
 */
export const ChangedPathModule: _ModuleWithoutApi = {
    moduleName: 'ChangedPath',
    version: VERSION,
    beans: [ChangedPathFactory],
    dependsOn: [EnterpriseCoreModule],
};

/**
 * @internal
 */
export const CsrmHierarchyModule: _ModuleWithoutApi = {
    moduleName: 'CsrmHierarchy',
    version: VERSION,
    rowModels: ['clientSide'],
    beans: [FlattenStage, CsrmExpansionService],
    dependsOn: [ChangedPathModule],
};

/**
 * Hierarchical CSRM stages: grouping, deep filter/sort.
 * Needed by RowGrouping, TreeData, and Pivot — not by MasterDetail.
 * @internal
 */
export const CsrmGroupStagesModule: _ModuleWithoutApi = {
    moduleName: 'CsrmGroupStages',
    version: VERSION,
    rowModels: ['clientSide'],
    beans: [GroupStage, GroupFilterStage, GroupSortStage],
    dependsOn: [CsrmHierarchyModule],
};

/**
 * @internal
 */
export const StickyRowModule: _ModuleWithoutApi = {
    moduleName: 'StickyRow',
    version: VERSION,
    beans: [StickyRowService],
};

/**
 * @internal
 */
export const GroupEditModule: _ModuleWithoutApi = {
    moduleName: 'GroupEdit',
    version: VERSION,
    beans: [GroupEditService],
    dependsOn: [CsrmHierarchyModule],
};
