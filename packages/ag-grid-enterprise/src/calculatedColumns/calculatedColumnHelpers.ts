import type { ColDef } from 'ag-grid-community';

// Properties that the data-type service may implicitly set when cellDataType is applied. When the
// user changes cellDataType (e.g. boolean → number), these need to be cleared so the new data
// type's defaults take effect — unless the user provided them explicitly on the original colDef.
const DATA_TYPE_DERIVED_PROPERTIES: (keyof ColDef)[] = [
    'cellRenderer',
    'cellEditorParams',
    'comparator',
    'getFindText',
    'keyCreator',
    'suppressKeyboardEvent',
    'valueFormatter',
    'valueParser',
];

export function clearStaleDataTypeProperties(colDef: ColDef, userColDef: ColDef | null, colDefUpdate: ColDef): ColDef {
    if (colDefUpdate.cellDataType === undefined || colDefUpdate.cellDataType === colDef.cellDataType) {
        return colDef;
    }

    const nextColDef = { ...colDef };
    for (const property of DATA_TYPE_DERIVED_PROPERTIES) {
        if (colDefUpdate[property] === undefined && userColDef?.[property] === undefined) {
            delete nextColDef[property];
        }
    }
    return nextColDef;
}
