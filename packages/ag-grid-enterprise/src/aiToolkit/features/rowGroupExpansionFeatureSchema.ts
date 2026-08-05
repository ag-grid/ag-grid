import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildRowGroupExpansionFeatureSchema = (beans: BeanCollection) => {
    const { expansionSvc, gos } = beans;
    // Expansion is reported under `ssrmRowGroupExpansion` instead when expand-all spans every row.
    if (!expansionSvc || gos.get('ssrmExpandAllAffectsAllRows')) {
        return;
    }

    return s.object(
        {
            expandedRowGroupIds: s.array(s.string('Row ID of a group row'), 'Row IDs of the groups to expand'),
        },
        'Expanded row groups for the grid. Omit a group to collapse it.'
    );
};
