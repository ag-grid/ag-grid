import type { _ModuleWithoutApi } from 'ag-grid-community';

import { baseEnterpriseModule } from '../moduleUtils';
import { AutoColService } from './autoColService';
import { GroupCellRenderer } from './rendering/groupCellRenderer';
import { GroupCellRendererCtrl } from './rendering/groupCellRendererCtrl';
import { ShowRowGroupColsService } from './showRowGroupColsService';

export const GroupCellRendererModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('GroupCellRendererModule'),
    userComponents: [
        {
            name: 'agGroupRowRenderer',
            classImp: GroupCellRenderer,
        },
        {
            name: 'agGroupCellRenderer',
            classImp: GroupCellRenderer,
        },
    ],
    dynamicBeans: [{ name: 'groupCellRendererCtrl', classImp: GroupCellRendererCtrl }],
};

/** Shared between row grouping and tree data */
export const GroupColumnModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('GroupColumnModule'),
    beans: [AutoColService, ShowRowGroupColsService],
    dependsOn: [GroupCellRendererModule],
};
