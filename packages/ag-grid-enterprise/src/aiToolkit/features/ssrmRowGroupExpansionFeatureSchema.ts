import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildSsrmRowGroupExpansionFeatureSchema = (beans: BeanCollection) => {
    const { expansionSvc, gos } = beans;
    if (!expansionSvc || !gos.get('ssrmExpandAllAffectsAllRows')) {
        return;
    }

    return s.object(
        {
            expandAll: s.boolean('Whether every group is expanded, before applying invertedRowGroupIds').nullable(),
            invertedRowGroupIds: s.array(
                s.string('Row ID of a group row'),
                'Row IDs of the groups whose state is the opposite of expandAll'
            ),
        },
        'Expanded row groups for the grid, expressed as an expand-all flag plus exceptions'
    );
};
