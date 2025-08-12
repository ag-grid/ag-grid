import type { _ModuleWithoutApi } from 'ag-grid-community';

import { VERSION } from '../version';
import { GroupHierarchyColService } from './groupHierarchyColService';

/**
 * @internal Group Hierarchy
 */
export const GroupHierarchyModule: _ModuleWithoutApi = {
    moduleName: 'GroupHierarchy',
    version: VERSION,
    beans: [GroupHierarchyColService],
};
