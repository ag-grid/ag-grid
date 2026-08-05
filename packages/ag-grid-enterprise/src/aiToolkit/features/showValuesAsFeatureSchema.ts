import type { BeanCollection, ShowValuesAsBuiltInType } from 'ag-grid-community';

import { s } from '../schemaBuilder';

// Keyed by ShowValuesAsBuiltInType so the compiler enforces the set stays complete and correctly
// spelled: adding, removing, renaming, or mistyping a built-in mode breaks the build here rather
// than silently advertising a wrong set to the LLM. `Object.keys` preserves the literal order.
const SHOW_VALUES_AS_BUILT_IN_TYPES = Object.keys({
    percentOfGrandTotal: true,
    percentOfColumnTotal: true,
    percentOfRowTotal: true,
    percentOfParentRowTotal: true,
    percentOfParentColumnTotal: true,
} satisfies Record<ShowValuesAsBuiltInType, true>) as ShowValuesAsBuiltInType[];

export const buildShowValuesAsFeatureSchema = (beans: BeanCollection) => {
    const { showValuesAsSvc, aggFuncSvc } = beans;
    if (!showValuesAsSvc || !aggFuncSvc) {
        return;
    }

    const columns = beans.colModel.getCols();
    const valueColumns = columns.filter((col) => col.isAllowValue() && aggFuncSvc.getFuncNames(col).length > 0);

    if (valueColumns.length === 0) {
        return;
    }

    return s
        .object(
            {
                showValuesAsModel: s.array(
                    s.union(
                        valueColumns.map((col) =>
                            s.object({
                                colId: s.literal(col.colId, 'Column identifier'),
                                showValuesAs: s.enum(
                                    SHOW_VALUES_AS_BUILT_IN_TYPES,
                                    'Show this value relative to a total'
                                ),
                            })
                        )
                    ),
                    'Array of per-column Show Values As modes. Omit a column to clear its mode.'
                ),
            },
            'Show Values As configuration for value columns'
        )
        .nullable();
};
