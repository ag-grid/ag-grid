import type { BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';

const SHOW_VALUES_AS_BUILT_IN_TYPES = [
    'percentOfGrandTotal',
    'percentOfColumnTotal',
    'percentOfRowTotal',
    'percentOfParentRowTotal',
    'percentOfParentColumnTotal',
];

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
                        aggregatableColumns.map((col) => {
                            const properties = {
                                colId: s.literal(col.colId, 'Column identifier'),
                                aggFunc: s.enum(beans.aggFuncSvc?.getFuncNames(col) || [], 'Aggregation function'),
                            };

                            return s.object(
                                beans.showValuesAsSvc
                                    ? {
                                          ...properties,
                                          showValuesAs: s.union(
                                              [
                                                  s.enum(SHOW_VALUES_AS_BUILT_IN_TYPES, 'Built-in Show Values As mode'),
                                                  s.null('Clear Show Values As for this column'),
                                              ],
                                              'Show this value relative to a total, or null to clear it'
                                          ),
                                      }
                                    : properties
                            );
                        })
                    ),
                    'Array of column aggregations'
                ),
            },
            'Aggregation configuration for the grid'
        )
        .nullable();
};
