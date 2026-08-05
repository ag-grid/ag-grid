import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildColumnGroupFeatureSchema = (beans: BeanCollection) => {
    const allGroups = beans.colModel.colsAllGroups;
    const groupIds: string[] = [];
    let descriptions = '';

    for (let i = 0, len = allGroups.length; i < len; ++i) {
        const group = allGroups[i];
        // Padding groups are synthetic filler for unbalanced header depth and cannot be opened.
        if (group.isPadding()) {
            continue;
        }
        const { groupId } = group;
        if (groupIds.length > 0) {
            descriptions += '\n';
        }
        const headerName = group.colGroupDef?.headerName;
        descriptions += headerName ? `${groupId}: ${headerName}` : groupId;
        groupIds.push(groupId);
    }

    if (groupIds.length === 0) {
        return;
    }

    return s.object(
        {
            openColumnGroupIds: s.array(
                s.enum(groupIds, descriptions),
                'Array of column group IDs to show expanded. Omit a group to collapse it.'
            ),
        },
        'Column group expansion configuration for the grid'
    );
};
