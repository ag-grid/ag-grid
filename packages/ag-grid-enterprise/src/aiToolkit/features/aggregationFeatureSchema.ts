import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

export const buildAggregationFeatureSchema = (beans: BeanCollection) => {
    const { aggFuncSvc } = beans;
    if (!aggFuncSvc) {
        return;
    }

    const columns = beans.colModel.getCols();
    const aggregatableColumns = columns.filter((col) => col.isAllowValue() && aggFuncSvc.getFuncNames(col).length > 0);

    if (aggregatableColumns.length === 0) {
        return;
    }

    return s
        .object(
            {
                aggregationModel: s.array(
                    s.union(
                        aggregatableColumns.map((col) =>
                            s.object({
                                colId: s.literal(col.getColId(), 'Column identifier'),
                                aggFunc: s.enum(beans.aggFuncSvc?.getFuncNames(col) || [], 'Aggregation function'),
                            })
                        )
                    ),
                    'Array of column aggregations'
                ),
            },
            'Aggregation configuration for the grid'
        )
        .nullable();
};
