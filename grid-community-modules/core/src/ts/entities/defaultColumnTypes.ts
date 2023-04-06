import { ColDef } from "./colDef";

export const DefaultColumnTypes: { [key: string]: ColDef } = {
    numericColumn: {
        headerClass: 'ag-right-aligned-header',
        cellClass: 'ag-right-aligned-cell'
    },
    rightAligned: {
        headerClass: 'ag-right-aligned-header',
        cellClass: 'ag-right-aligned-cell'
    },
    agTextColumn: {},
    agNumberColumn: {
        headerClass: 'ag-right-aligned-header',
        cellClass: 'ag-right-aligned-cell',
    },
    agDateColumn: {
        cellEditorParams: {
            useFormatter: true,
        },
    },
    agDateStringColumn: {},
    agBooleanColumn: {},
};
