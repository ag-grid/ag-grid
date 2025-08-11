import type { _ModuleWithoutApi } from 'ag-grid-community';

import { VERSION } from '../version';
import { GroupHierarchyColService } from './groupHierarchyColService';

/**
 * @feature Group Hierarchy
 * @gridOption groupHierarchyConfig
 */
export const GroupHierarchyModule: _ModuleWithoutApi = {
    moduleName: 'GroupHierarchy',
    version: VERSION,
    beans: [GroupHierarchyColService],
};
